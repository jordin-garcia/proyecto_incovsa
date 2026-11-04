# Respaldo

Respalde cuatro cosas distintas. Solo la base de datos tiene un script en el repositorio. No mezcle los destinos.

## Base de datos

En el VPS, el modo por defecto de `scripts/respaldo.sh` ejecuta `pg_dump -Fc` dentro del servicio `postgres` de Docker Compose. Sube `diarios/YYYYMMDD.dump` con `rclone copyto`. La fecha es UTC. Si ese día es domingo, también sube `semanales/YYYYMMDD.dump`. Para forzar el semanal en otro día, exporte `FORZAR_SEMANAL=1` antes del script.

Después conserva 7 diarios y 4 semanales. La regla está en `scripts/lib-respaldo.mjs`. El script exige `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `RCLONE_DEST`. La contraseña viaja en `PGPASSWORD` y no se imprime. El registro usa la etiqueta `incovsa-respaldo`.

La línea de cron, también escrita en `evidencia/CE-07/README.md`, corre a las 02:15 hora del servidor. El usuario de despliegue necesita Node.js 24, `rclone` y `docker` en el `PATH`, y el repositorio clonado en `~/incovsa`, porque el script usa `scripts/lib-respaldo.mjs`. La imagen de la aplicación no trae los scripts de respaldo.

```
crontab -e
```

Agregue esta única línea.

```
15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh
```

Para un respaldo manual, con el mismo usuario y el mismo `.env`:

```
cd "$HOME/incovsa"
set -a && . ./.env && set +a
./scripts/respaldo.sh
```

Cuando termina bien, el script registra `respaldo diario AAAAMMDD.dump listo` (y `respaldo semanal AAAAMMDD.dump listo` los domingos), una línea `retención borró …` por cada respaldo viejo que borra y `retención aplicada`.

Si falta una variable, el script imprime `falta la variable` más el nombre y termina con código 2. Si `pg_dump` no produce un archivo cuyo inicio es `PGDMP`, imprime `pg_dump no produjo un archivo de formato personalizado` y termina con código 1. Cualquier otro fallo deja la línea `el respaldo falló con código N`.

Otras variables que el script acepta, y que el cron no necesita, son `FECHA` en formato `YYYYMMDD`, `COMPOSE_ARCHIVO`, `COMPOSE_SERVICIO_POSTGRES`, `SOLO_RETENCION=1`, `USAR_DOCKER_RUN=1` y `EJECUTAR_PG_EN_HOST=1`. Con `USAR_DOCKER_RUN` o `EJECUTAR_PG_EN_HOST` el script exige también `POSTGRES_HOST`, y con `USAR_DOCKER_RUN`, `DOCKER_RED`. No defina las dos a la vez: el script imprime `defina solo EJECUTAR_PG_EN_HOST o solo USAR_DOCKER_RUN` y termina con código 2. Una `FECHA` mal escrita da `FECHA debe ser YYYYMMDD`, también con código 2. El modo por defecto en el VPS es Compose.

> **Pendiente de producción (versión 1.1).** El cron se instala cuando existan el VPS (P-10) y el bucket privado de R2 (P-94). `RCLONE_DEST=r2:incovsa-respaldos` es el valor de ejemplo, no un remoto configurado.

## Imágenes en R2

Los bytes de las imágenes ya viven en el bucket de imágenes. `scripts/respaldo.sh` no los copia. El volcado de PostgreSQL guarda la dirección, no el archivo. No hay un segundo script de imágenes en el repositorio.

> **Pendiente de producción (versión 1.1).** El bucket de imágenes existe cuando INCOVSA cree la cuenta de Cloudflare (P-94).

## Documentos en el Drive de INCOVSA

El servidor no guarda PDF. La base solo tiene enlaces `https` de Google Drive. Esos enlaces entran en el volcado de PostgreSQL. Los archivos los respalda la cuenta de Drive de INCOVSA. No ejecute un comando de este repositorio para copiarlos.

## Configuración

El volcado no incluye `docker-compose.yml`, `Caddyfile`, `.env` ni la configuración de rclone.

- La configuración sin secretos (`docker-compose.yml`, `Caddyfile` y `.env.produccion.example`) ya está respaldada en el repositorio.
- La copia de los secretos del `.env` y de las llaves de rclone se guarda solo en el medio seguro que el coordinador acuerde con INCOVSA para entregar las credenciales (Anexo J). Nunca en las computadoras del equipo, en el repositorio ni en este manual.

## Rehacer el `.env` y rclone

Si se pierde el VPS o hay que instalar uno nuevo, después de preparar el servidor (apartado Despliegue):

**Paso 1.** Con el usuario de despliegue, en `~/incovsa`, cree el `.env` desde la plantilla y deje que solo ese usuario lo lea:

```
cp .env.produccion.example .env
chmod 600 .env
```

Escriba los valores guardados en el medio seguro: la contraseña de PostgreSQL (en `POSTGRES_PASSWORD` y dentro de `DATABASE_URL`), las dos claves de autenticación y las llaves de R2 de las imágenes. Ninguna línea puede quedar con el valor de la plantilla. Si en lugar de recuperar las claves de autenticación crea otras, se cierran todas las sesiones abiertas; guarde las nuevas en el medio seguro.

**Paso 2.** Cree el remoto `r2` de rclone con la llave limitada al bucket privado de respaldos:

```
rclone config create r2 s3 provider Cloudflare env_auth false access_key_id LLAVE secret_access_key SECRETO endpoint https://CUENTA.r2.cloudflarestorage.com
rclone lsf r2:incovsa-respaldos/diarios
```

La configuración queda en `~/.config/rclone/rclone.conf`. Si `rclone lsf` lista los respaldos, el remoto funciona.

**Paso 3.** Ejecute una vez el respaldo manual de arriba y restaure ese respaldo en una base nueva (apartado Restauración).
