# Despliegue

El sitio de producción corre en un VPS con Docker Compose. Hay tres servicios. `caddy` publica los puertos 80 y 443. `app` escucha el puerto 3000 solo en la red interna. `postgres` no publica puerto. Los tres reinician con `unless-stopped`. Los registros de Docker rotan a 10 MB, con 5 archivos, en formato `json-file`.

TODO(CE-11): CE-08 está bloqueada. No hay VPS (P-10), así que no ejecute este apartado en un servidor real. El primer despliegue oficial es JG-19, el 2 de noviembre de 2026, cuando el coordinador integre `develop` en `main`.

## Preparar el servidor

Cuando INCOVSA entregue el acceso, entre como root y ejecute el script del repositorio. La bandera que acepta es la variable `USUARIO_DESPLIEGUE`. Si root no tiene llaves autorizadas, defina también `PUBKEY_DESPLIEGUE` con la llave pública del usuario de despliegue. El valor por defecto del usuario es `despliegue`. La carpeta por defecto es `/home/` seguido de ese usuario y de `/incovsa`.

```
USUARIO_DESPLIEGUE=despliegue bash preparar-vps.sh
```

El script activa `unattended-upgrades` con el reinicio automático en falso, deja SSH solo con llave, niega el ingreso de root, abre en UFW únicamente los puertos 22, 80 y 443, e instala Docker. Abra después una sesión nueva con el usuario de despliegue. Tiene que estar en el grupo `docker`.

Copie a `~/incovsa` el archivo `docker-compose.yml`, el `Caddyfile` y un `.env` creado desde `.env.produccion.example`.

Descomente `IMAGEN_APP` en ese `.env`. El ejemplo del archivo es `ghcr.io/jordin-garcia/proyecto_incovsa:produccion`. CE-06 no publica la etiqueta `:latest` en el paquete de producción. El valor por defecto de `docker-compose.yml` sí dice `:latest`. Déjelo sustituido para que un arranque posterior no pida esa etiqueta.

Instale Node.js 24 y rclone en el `PATH` de ese usuario antes de activar el cron del apartado Respaldo. `preparar-vps.sh` no los instala.

## Lo que hace el flujo automático

El archivo `.github/workflows/despliegue.yml` se llama Despliegue. Un push a `main` hace lo siguiente.

1. Compila la imagen y la sube a `ghcr.io/jordin-garcia/proyecto_incovsa` con la etiqueta del commit y con la etiqueta `produccion`.
2. Borra imágenes etiquetadas de más en ese paquete y deja como máximo 5.
3. Si existen los secretos del entorno `produccion`, entra por SSH al VPS.

Los secretos son `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` y `VPS_KNOWN_HOSTS`. No están creados. Sin ellos, el flujo imprime `Faltan secretos del VPS (CE-08). Se omite el SSH; GHCR ya publicó la imagen.` y termina bien después de publicar.

Con los secretos, el flujo entra a `~/incovsa`. Entra a GHCR con `docker login ghcr.io -u` y el actor de la corrida. El token va por `--password-stdin`. No queda en el repositorio. Después ejecuta estas acciones.

```
export IMAGEN_APP="ghcr.io/jordin-garcia/proyecto_incovsa:ETIQUETA"
docker compose up -d postgres --wait
docker compose pull app
docker compose run --rm --no-deps --entrypoint ./node_modules/.bin/prisma app migrate deploy
docker compose up -d app
docker logout ghcr.io
```

Sustituya `ETIQUETA` por el SHA del commit que el flujo acaba de publicar, o por `produccion` si quiere la última imagen marcada así. El flujo usa el SHA, no la palabra `latest`.

Luego comprueba el sitio, hasta 24 veces, con una espera de 5 segundos.

```
curl -fsS --max-time 15 https://incovsa.com/ -o /dev/null
```

Cualquier ref distinta de `main` publica solo en el paquete `proyecto_incovsa-prueba`. Un `workflow_dispatch` en `main` con `modo_prueba` en verdadero hace lo mismo. Ese paquete no usa la etiqueta `produccion` y el flujo no entra por SSH.

## Volver a una imagen anterior

En `main`, ejecute el flujo con una etiqueta que todavía exista en GHCR. No aplica migraciones. El flujo cambia el `ENTRYPOINT` de `app` a `node server.js` para ese arranque.

```
gh workflow run despliegue.yml --ref main -f etiqueta=ETIQUETA
gh run watch
```

`etiqueta` admite de 1 a 128 caracteres. El primero es letra, número o guion bajo. El resto puede ser letra, número, guion bajo, punto o guion. `gh workflow run --help` documenta `-f` y `--ref`.

Para publicar sin entrar al VPS, deje `etiqueta` en su valor por defecto, que es vacío, y pase la otra entrada.

```
gh workflow run despliegue.yml --ref main -f modo_prueba=true
```

La entrada `modo_prueba` del flujo es booleana y por defecto es falsa. El script de etiquetas compara el texto `true`.

## Probar Compose sin VPS

En un equipo con Docker puede levantar el mismo `docker-compose.yml` contra la imagen local. Use un `.env` de prueba, no el de INCOVSA. Ponga `DOMINIO=localhost` y `ALMACENAMIENTO=disco` solo en esa prueba. El contenedor de la aplicación define `NODE_ENV=production`, y el código rechaza `disco` en producción al guardar una imagen. La prueba de CE-05 comprueba HTTPS y el arranque, no la subida de imágenes.

```
IMAGEN_APP=incovsa-app:ci docker compose up -d
```

El flujo `produccion-imagen` espera el HTTPS local así.

```
curl -kfsS --resolve localhost:443:127.0.0.1 https://localhost/ -o /dev/null
```

`-k` hace falta porque el certificado de `localhost` no es el de `incovsa.com`. No use `-k` contra `https://incovsa.com`.
