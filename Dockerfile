# Producción (CE-05, specs/16 decisiones 27 a 29). La imagen final corre un solo proceso.
# Las etapas anteriores se quedan fuera. Los secretos no se copian: .dockerignore excluye .env*.

FROM node:24-bookworm-slim AS dependencias
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc prisma.config.ts ./
COPY vendor ./vendor
COPY prisma ./prisma
# No hay repositorio git en la imagen: husky no debe correr en `prepare`.
# `prisma generate` es el postinstall y necesita el esquema antes de `npm ci`.
ENV HUSKY=0
RUN npm ci

# V15.2.3 (JG-26): la imagen final solo lleva las dependencias de producción. prisma (migrate deploy) y tsx (crear-admin
# y la semilla base) están en `dependencies` porque se ejecutan en producción. `npm prune` no ejecuta scripts.
FROM dependencias AS dependencias-produccion
RUN npm prune --omit=dev

FROM dependencias AS compilacion
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV SESION_DIAS=7
ENV BETTER_AUTH_SECRET_SITIO=compilacion-sitio-no-es-un-secreto-de-runtime
ENV BETTER_AUTH_SECRET_PICKING=compilacion-picking-no-es-un-secreto-de-runtime
RUN npm run build

FROM node:24-bookworm-slim AS ejecucion
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home --home-dir /home/nextjs nextjs
# El código es de root y el proceso no puede reescribirlo (auditoría del 22/10, H-51). Solo la caché de Next.js
# (optimización de imágenes) es de nextjs. npm y tsx escriben en /home/nextjs y en /tmp.
COPY --from=compilacion /app/public ./public
COPY --from=compilacion /app/.next/standalone ./
COPY --from=compilacion /app/.next/static ./.next/static
# Sin Vitest, Playwright ni las demás herramientas de desarrollo (V15.2.3).
COPY --from=dependencias-produccion /app/node_modules ./node_modules
COPY --from=compilacion /app/package.json ./package.json
COPY --from=compilacion /app/tsconfig.json ./tsconfig.json
COPY --from=compilacion /app/prisma.config.ts ./prisma.config.ts
# Solo lo que se ejecuta en producción: el esquema y las migraciones (migrate deploy), la semilla base con sus datos y
# crear-admin. No van la semilla de demostración ni los scripts de desarrollo, de la CI o de respaldo.
COPY --from=compilacion /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=compilacion /app/prisma/migrations ./prisma/migrations
COPY --from=compilacion /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=compilacion /app/prisma/semillas/base.ts ./prisma/semillas/base.ts
COPY --from=compilacion /app/prisma/datos ./prisma/datos
COPY --from=compilacion /app/scripts/crear-admin.ts /app/scripts/administrador.ts ./scripts/
COPY --from=compilacion /app/src ./src
RUN printf '%s\n' '#!/bin/sh' 'set -eu' 'cd /app' './node_modules/.bin/prisma migrate deploy' 'exec node server.js' > /app/entrada.sh \
  && chmod 755 /app/entrada.sh \
  && chmod -R go-w /app \
  && mkdir -p /app/.next/cache \
  && chown nextjs:nodejs /app/.next/cache
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/entrada.sh"]
