# Diagnóstico de errores comunes

Mire primero el texto exacto. Los mensajes de abajo salen del código o de los scripts. El detalle de un error inesperado no se muestra en la pantalla: queda en el registro del servidor, una línea JSON por cada rechazo y por cada error inesperado, con su tipo y su ubicación pero sin el texto del error, que se lee con `docker compose logs app`. La frase que ve la persona usuaria es `No se pudo completar la operación. Inténtelo de nuevo.`

## El equipo de desarrollo

Ejecute `node scripts/verificar-entorno.mjs`. Si termina con código 1, la línea con la cruz dice la herramienta y el comando que falta.

Si `npm ci` se niega, compruebe Node.js 24 y npm 11.19.0 o posterior. `.npmrc` tiene `engine-strict=true`.

Si `npm test` imprime `Falta la variable DATABASE_URL_PRUEBAS`, escríbala en `.env`. Si imprime `DATABASE_URL_PRUEBAS no puede ser la base de desarrollo`, apunte esa variable a `incovsa_pruebas`. Las pruebas vacían esa base. Fuera de la CI no puede ser la misma que `DATABASE_URL`.

Si `npm run semilla:demo` imprime `La semilla de demostración no se ejecuta en producción`, no lo corra con `NODE_ENV=production`. Si pide `CLAVE_DEMO`, escríbala con 8 caracteres o más. Si imprime `Falta la semilla base`, ejecute antes `npm run db:semilla`.

## Acceso y administrador

`npm run crear-admin` imprime el motivo de cada dato rechazado (tabla del apartado Creación del primer administrador). Si imprime `No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.`, revise que se ejecutó en una terminal interactiva (en Compose, sin `exec -T`), que `DATABASE_URL` apunte a la base correcta y que `npm run db:aplicar` haya terminado bien.

Si nadie puede iniciar sesión pero el sitio público responde, revise las claves de autenticación del `.env` de producción: la aplicación rechaza las de ejemplo, las de menos de 32 caracteres y dos claves iguales (apartado Variables de entorno). El registro de `app` muestra entonces un error inesperado con su tipo y su ubicación, pero sin el texto, para no escribir datos sensibles. Las comprobaciones están en `src/lib/auth-configuracion.ts` (claves y `SESION_DIAS`) y en `src/lib/cabeceras.ts` (`URL_IMAGENES`).

El acceso se bloquea 15 minutos por seguridad:

- Con 5 contraseñas incorrectas seguidas, el usuario queda bloqueado. En el paso de la contraseña sale `Usuario o contraseña incorrectos.`, y una contraseña correcta tampoco entra mientras dura el bloqueo.
- Con 20 fallos desde la misma dirección IP en 15 minutos, la dirección queda bloqueada. En el paso del usuario sale `No tiene permisos para acceder a los sistemas de INCOVSA. Si cree que es un error, comuníquese con Gerencia o con Soporte.` (el mismo mensaje que cuando el usuario no existe), y en el paso de la contraseña, `Usuario o contraseña incorrectos.`

Espere esos 15 minutos. No borre filas de la bitácora para saltarse el límite.

## Imágenes y cuerpos grandes

`La imagen debe pesar hasta 5 MB.` y `Seleccione una imagen JPG, PNG o WebP válida.` salen al guardar una imagen. `El almacenamiento local no está disponible en producción.` sale si `ALMACENAMIENTO=disco` con `NODE_ENV=production`.

Un `413` de Caddy significa que el cuerpo pasó de 27 MB. Un rechazo de una acción del servidor, con un archivo menor que eso, puede deberse al límite de 3 MB de `bodySizeLimit`. El `.xlsx` de Odoo admite hasta 2 MB; sus mensajes están en el apartado Configuración de servicios externos.

## Respaldo, restauración y despliegue

`falta la variable` y código 2 en el respaldo o la restauración significan que `.env` no exportó `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` o `RCLONE_DEST`. El cron usa `set -a` y `. ./.env` para exportarlas.

`pg_dump no produjo un archivo de formato personalizado` significa que el volcado no empieza por `PGDMP`. Mire `docker compose logs postgres` y repita el respaldo. No copie ese archivo al remoto.

Si no hay línea `respaldo diario … listo` del día, revise con `crontab -l` que la línea del cron exista y con `journalctl -t incovsa-respaldo` el último mensaje. `el respaldo falló con código N` indica el código del comando que falló; repita el respaldo a mano para ver el error.

`el archivo descargado no es un volcado de formato personalizado` en la restauración significa que el objeto elegido está dañado o no es un respaldo del script. Elija otro y no toque la base.

La frase `CONFIRMAR_SOBRESCRITURA debe ser exactamente: SOBRESCRIBIR PRODUCCION` y el código 1 significan que el destino era la base de producción y la frase no coincidió. La base no se tocó.

Si `app` reinicia sin parar, lea `docker compose logs app`. `/app/entrada.sh` corre `prisma migrate deploy` antes de `node server.js` y aborta si la migración falla. Caddy espera a que el chequeo de `app` pase.

Si el flujo Despliegue no entra al VPS e imprime `Faltan secretos del VPS (CE-08). Se omite el SSH; GHCR ya publicó la imagen.`, la imagen sí se publicó y el servidor no se tocó. Faltan los cuatro secretos del entorno `produccion`.

Si la comprobación final del flujo falla en el primer despliegue, falta arrancar `caddy` (apartado Despliegue, «El primer despliegue»). Si `curl -fsS https://incovsa.com/` falla después, revise que el DNS apunte al VPS y lea `docker compose logs caddy`: ahí aparecen los errores de emisión del certificado. No cambie el `Caddyfile` para compensar una falla del DNS.

> **Pendiente de producción (versión 1.1).** Se agregan los errores que aparezcan en el primer despliegue y en la verificación de producción (tarea CE-10).
