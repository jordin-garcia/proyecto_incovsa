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

La imagen que corre en el VPS se construye con el `Dockerfile`. Son tres etapas. `node:24-bookworm-slim`, `npm ci` con `HUSKY=0`, `npm run build`, y una etapa final que copia la salida `standalone`, los estáticos, `prisma/`, `scripts/`, `src/` y `node_modules`. El usuario del proceso es `nextjs`, uid 1001. El `ENTRYPOINT` es `/app/entrada.sh`.

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
