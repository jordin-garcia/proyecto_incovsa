# CE-07. Respaldo y restauración

Nota para el Documento 5, apartados 14 y 15. El flujo de GitHub Actions prueba el respaldo y la restauración con un remoto local de rclone. La cuenta de Cloudflare R2 sigue pendiente (P-94). Cuando exista, `RCLONE_DEST` del VPS apunta al bucket privado de respaldos, distinto del de las imágenes.

## Instalar el cron

El repositorio en el VPS está en `/opt/incovsa`. El usuario que ejecuta Docker Compose necesita Node 24, `rclone` y `docker` en el `PATH`. La configuración de rclone queda en la cuenta de ese usuario, con una credencial limitada al bucket privado. `.env` define `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `RCLONE_DEST`. Un destino de producción es `r2:incovsa-respaldos`.

Con ese usuario, abra el crontab.

```
crontab -e
```

Agregue esta línea. Corre cada noche a las 02:15, hora del servidor.

```
15 2 * * * cd /opt/incovsa && set -a && . ./.env && set +a && ./scripts/respaldo.sh
```

Cada ejecución escribe `diarios/YYYYMMDD.dump` con `pg_dump -Fc` dentro del contenedor `postgres`. Si la fecha UTC es domingo, también copia `semanales/YYYYMMDD.dump`. `FORZAR_SEMANAL=1` sube el semanal en cualquier fecha. Después quedan los 7 diarios más recientes y los 4 semanales más recientes. El resultado entra en el registro del sistema con la etiqueta `incovsa-respaldo` y también en la salida estándar. La contraseña no sale en esos textos.

## Restaurar en una base nueva

Elija el objeto y una base distinta de la de producción.

```
cd /opt/incovsa
set -a && . ./.env && set +a
export RCLONE_ORIGEN=diarios/20261020.dump
export POSTGRES_DB_DEST=incovsa_restaurada
./scripts/restaurar.sh
```

El primer argumento también vale como origen (`./scripts/restaurar.sh diarios/20261020.dump`). El script descarga el archivo, borra `POSTGRES_DB_DEST` si ya existe y la vuelve a crear. El SQL nombra solo esa base.

## Reemplazar la base de producción

`POSTGRES_DB_DEST` tiene que ser el mismo nombre que `POSTGRES_DB`. La confirmación tiene que ser exactamente `SOBRESCRIBIR PRODUCCION`.

```
export RCLONE_ORIGEN=diarios/20261020.dump
export POSTGRES_DB_DEST="$POSTGRES_DB"
export CONFIRMAR_SOBRESCRITURA='SOBRESCRIBIR PRODUCCION'
./scripts/restaurar.sh
```

Con cualquier otra frase el script termina con código 1. No descarga el archivo y no ejecuta SQL.

## Prueba automática

El flujo "Respaldo y restauración" (`.github/workflows/produccion-respaldo.yml`) corre en los pull requests que tocan estos scripts, cada lunes a las 06:00 UTC y a mano. Levanta PostgreSQL 18, aplica las migraciones, carga la semilla base y la de demostración, respalda, restaura en `incovsa_restaurada` y compara la cantidad de filas de cada tabla.
