# Compilación

Compile en su computadora para comprobar que el proyecto construye. Este paso no despliega.

```
npm run build
```

El script es `next build`. Si termina con código 0, arranque el servidor de producción local. Sigue usando su `.env` y su PostgreSQL. No es el VPS.

```
npm run start
```

El script es `next start`. Abra http://localhost:3000.

`npm run start` corre con `NODE_ENV=production`, así que aplica las reglas de producción del apartado Variables de entorno: con las claves de ejemplo «cambie-esto…» nadie puede iniciar sesión, y `ALMACENAMIENTO=disco` rechaza las imágenes. Para probar el inicio de sesión con el servidor compilado, ponga en su `.env` dos claves aleatorias distintas, de al menos 32 caracteres.

La imagen que corre en el VPS se construye con el `Dockerfile`, sobre `node:24-bookworm-slim`, en cuatro etapas:

1. `dependencias`: instala todo con `npm ci` y `HUSKY=0`.
2. `dependencias-produccion`: deja solo las dependencias de producción (`npm prune --omit=dev`) y quita Vitest, Playwright y TypeScript.
3. `compilacion`: ejecuta `npm run build`.
4. `ejecucion`: la imagen final. Copia la salida `standalone`, los estáticos, las dependencias de producción, `src/`, el esquema y las migraciones de Prisma, la semilla base con sus datos, y de `scripts/` solo `crear-admin.ts` y `administrador.ts`.

La imagen final no lleva la semilla de demostración, las herramientas de desarrollo ni los scripts de respaldo. El código es de root y de solo lectura; el proceso corre como `nextjs` (uid 1001) y dentro de `/app` solo puede escribir en `.next/cache` (fuera de `/app`, también en `/home/nextjs` y en `/tmp`). El `ENTRYPOINT` es `/app/entrada.sh`, que aplica las migraciones y arranca `node server.js`. El flujo `produccion-imagen` comprueba todo esto en cada *pull request* que cambia la imagen.

Para construir esa imagen en un equipo que tenga Docker:

```
docker build -t incovsa-app:ci .
```

Compruebe que la imagen no llevó archivos de entorno. El flujo `produccion-imagen` usa esta prueba.

```
docker run --rm --entrypoint sh incovsa-app:ci -c 'test ! -e .env && test ! -e .env.produccion.example'
```

Si el comando termina con código 0, esos archivos no están en la imagen. Las claves de la etapa de compilación tampoco pasan a la etapa final. El `Dockerfile` las define solo para que `npm run build` pueda correr, con los textos `compilacion-sitio-no-es-un-secreto-de-runtime` y `compilacion-picking-no-es-un-secreto-de-runtime`. No las use como claves reales.

El VPS no ejecuta `docker build`. GitHub Actions publica la imagen en GHCR. El apartado Despliegue dice cómo se descarga.
