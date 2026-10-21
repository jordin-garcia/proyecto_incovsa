# Respaldo

Respalde cuatro cosas distintas. Solo la base de datos tiene un script en el repositorio. No mezcle los destinos.

## Base de datos

En el VPS, el modo por defecto de `scripts/respaldo.sh` ejecuta `pg_dump -Fc` dentro del servicio `postgres` de Docker Compose. Sube `diarios/YYYYMMDD.dump` con `rclone copyto`. La fecha es UTC. Si ese día es domingo, también sube `semanales/YYYYMMDD.dump`. Para forzar el semanal en otro día, exporte `FORZAR_SEMANAL=1` antes del script.

Después conserva 7 diarios y 4 semanales. La regla está en `scripts/lib-respaldo.mjs`. El script exige `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `RCLONE_DEST`. La contraseña viaja en `PGPASSWORD` y no se imprime. El registro usa la etiqueta `incovsa-respaldo`.

La línea de cron, también escrita en `evidencia/CE-07/README.md`, corre a las 02:15 hora del servidor. El usuario de despliegue necesita Node.js 24, `rclone` y `docker` en el `PATH`.

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

Si falta una variable, el script imprime `falta la variable` más el nombre y termina con código 2. Si `pg_dump` no produce un archivo cuyo inicio es `PGDMP`, imprime `pg_dump no produjo un archivo de formato personalizado` y termina con código 1.

Otras variables que el script acepta, y que el cron no necesita, son `FECHA` en formato `YYYYMMDD`, `COMPOSE_ARCHIVO`, `COMPOSE_SERVICIO_POSTGRES`, `SOLO_RETENCION=1`, `USAR_DOCKER_RUN=1` y `EJECUTAR_PG_EN_HOST=1`. No defina a la vez `USAR_DOCKER_RUN` y `EJECUTAR_PG_EN_HOST`. El valor por defecto en el VPS es Compose.

TODO(CE-11): El cron no está instalado. No hay VPS (P-10) ni bucket privado de R2 (P-94). `RCLONE_DEST=r2:incovsa-respaldos` es el ejemplo, no un remoto configurado.

## Imágenes en R2

Los bytes de las imágenes ya viven en el bucket de imágenes. `scripts/respaldo.sh` no los copia. El volcado de PostgreSQL guarda la dirección, no el archivo. No hay un segundo script de imágenes en el repositorio.

TODO(CE-11): Hasta P-94 no existe el bucket de imágenes ni una copia externa de ese bucket.

## Documentos en el Drive de INCOVSA

El servidor no guarda PDF. La base solo tiene enlaces `https` de Google Drive. Esos enlaces entran en el volcado de PostgreSQL. Los archivos los respalda la cuenta de Drive de INCOVSA. No ejecute un comando de este repositorio para copiarlos.

## Configuración

El volcado no incluye `docker-compose.yml`, `Caddyfile`, `.env` ni la configuración de rclone. Guarde una copia de esos archivos fuera del VPS, en el gestor de contraseñas del equipo. No los suba al repositorio. No los pegue en este manual.
