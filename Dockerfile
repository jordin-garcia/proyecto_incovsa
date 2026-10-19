# Producción (CE-05, specs/16 decisiones 27 a 29). La imagen final corre un solo proceso.
# Las etapas anteriores se quedan fuera. Los secretos no se copian: .dockerignore excluye .env*.

FROM node:24-bookworm-slim AS dependencias
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
COPY vendor ./vendor
# No hay repositorio git en la imagen: husky no debe correr en `prepare`.
ENV HUSKY=0
RUN npm ci

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
  && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs
COPY --from=compilacion --chown=nextjs:nodejs /app/public ./public
COPY --from=compilacion --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=compilacion --chown=nextjs:nodejs /app/.next/static ./.next/static
# prisma y tsx son devDependencies: hacen falta para migrate deploy y crear-admin.
COPY --from=dependencias --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=compilacion --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=compilacion --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=compilacion --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=compilacion --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=compilacion --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=compilacion --chown=nextjs:nodejs /app/src ./src
RUN printf '%s\n' '#!/bin/sh' 'set -eu' 'cd /app' './node_modules/.bin/prisma migrate deploy' 'exec node server.js' > /app/entrada.sh \
  && chmod 755 /app/entrada.sh \
  && chown nextjs:nodejs /app/entrada.sh
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/entrada.sh"]
