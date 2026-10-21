# Diagnóstico

Mire primero el texto exacto. Los mensajes de abajo salen del código o de los scripts. El detalle de un error inesperado no se muestra en la pantalla. Queda en el registro del servidor. La frase que ve la persona usuaria es `No se pudo completar la operación. Inténtelo de nuevo.`

## El equipo de desarrollo

Ejecute `node scripts/verificar-entorno.mjs`. Si termina con código 1, la línea con la cruz dice la herramienta y el comando que falta.

Si `npm ci` se niega, compruebe Node.js 24 y npm 11.19.0 o posterior. `.npmrc` tiene `engine-strict=true`.

Si `npm test` imprime `Falta la variable DATABASE_URL_PRUEBAS`, escríbala en `.env`. Si imprime `DATABASE_URL_PRUEBAS no puede ser la base de desarrollo`, apunte esa variable a `incovsa_pruebas`. Las pruebas vacían esa base. Fuera de la CI no puede ser la misma que `DATABASE_URL`.

Si `npm run semilla:demo` imprime `La semilla de demostración no se ejecuta en producción`, no lo corra con `NODE_ENV=production`. Si pide `CLAVE_DEMO`, escríbala con 8 caracteres o más. Si imprime `Falta la semilla base`, ejecute antes `npm run db:semilla`.

## Acceso y administrador

`npm run crear-admin` sin TTY imprime `Ejecute crear-admin en una terminal interactiva.` Vuelva a lanzarlo en una terminal real. En Compose, no use `exec -T`.

Cualquier otro fallo de ese comando imprime `No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.` Revise el rol, el largo de la contraseña y que `npm run db:aplicar` haya terminado bien.

La pantalla `Usuario o contraseña incorrectos` también aparece cuando el usuario lleva 5 fallos seguidos. El bloqueo dura 15 minutos, y una contraseña correcta tampoco entra mientras dura. La pantalla `No tiene permisos para acceder a los sistemas de INCOVSA. Si cree que es un error, comuníquese con Gerencia o con Soporte.` aparece si la dirección IP acumuló 20 fallos en 15 minutos. Espere esos 15 minutos. No borre filas de la bitácora para saltarse el límite.

## Imágenes y cuerpos grandes

`La imagen debe pesar hasta 5 MB.` y `Seleccione una imagen JPG, PNG o WebP válida.` salen al guardar una imagen. `El almacenamiento local no está disponible en producción.` sale si `ALMACENAMIENTO=disco` con `NODE_ENV=production`.

Un `413` de Caddy significa que el cuerpo pasó de 27 MB. Un rechazo de una acción del servidor, con un archivo menor que eso, puede deberse al límite de 3 MB de `bodySizeLimit`. El `.xlsx` de Odoo admite hasta 2 MB.

## Respaldo, restauración y despliegue

`falta la variable` y código 2 en el respaldo significan que `.env` no exportó `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` o `RCLONE_DEST`. El cron usa `set -a` y `. ./.env` para exportarlas.

`pg_dump no produjo un archivo de formato personalizado` significa que el volcado no empieza por `PGDMP`. Mire `docker compose logs postgres` y repita el respaldo. No copie ese archivo al remoto.

La frase `CONFIRMAR_SOBRESCRITURA debe ser exactamente: SOBRESCRIBIR PRODUCCION` y el código 1 significan que el destino era la base de producción y la frase no coincidió. La base no se tocó.

Si `app` reinicia sin parar, lea `docker compose logs app`. `/app/entrada.sh` corre `prisma migrate deploy` antes de `node server.js` y aborta si la migración falla. Caddy espera a que el chequeo de `app` pase.

Si el flujo Despliegue no entra al VPS e imprime `Faltan secretos del VPS (CE-08). Se omite el SSH; GHCR ya publicó la imagen.`, la imagen sí se publicó y el servidor no se tocó. Faltan los cuatro secretos del entorno `produccion`.

Si `curl -fsS https://incovsa.com/` falla, el DNS o el primer despliegue todavía no existen. No cambie el `Caddyfile` para compensar esa falta.

TODO(CE-11): No hay registros reales del VPS, de Caddy ni de R2. CE-10 no ha dejado un diagnóstico de producción.
