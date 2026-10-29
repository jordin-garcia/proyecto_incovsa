# CE-07. Respaldo y restauración

Nota para el Documento 5, apartados 14 y 15. El flujo de GitHub Actions prueba el respaldo y la restauración con un remoto local de rclone. La cuenta de Cloudflare R2 sigue pendiente (P-94). Cuando exista, `RCLONE_DEST` del VPS apunta al bucket privado de respaldos, distinto del de las imágenes.

## Instalar el cron

El repositorio en el VPS está en `~/incovsa` (usuario de despliegue, CE-06). Ese usuario necesita Node 24, `rclone` y `docker` en el `PATH`. La configuración de rclone queda en su cuenta, con una credencial limitada al bucket privado. `.env` define `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `RCLONE_DEST`. Un destino de producción es `r2:incovsa-respaldos`.

Con ese usuario, abra el crontab.

```
crontab -e
```

Agregue esta línea. Corre cada noche a las 02:15, hora del servidor.

```
15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh
```

Cada ejecución escribe `diarios/YYYYMMDD.dump` con `pg_dump -Fc` dentro del contenedor `postgres`. Si la fecha UTC es domingo, también copia `semanales/YYYYMMDD.dump`. `FORZAR_SEMANAL=1` sube el semanal en cualquier fecha. Después quedan los 7 diarios más recientes y los 4 semanales más recientes. El resultado entra en el registro del sistema con la etiqueta `incovsa-respaldo` y también en la salida estándar. La contraseña no sale en esos textos.

## Restaurar en una base nueva

Elija el objeto y una base distinta de la de producción.

```
cd "$HOME/incovsa"
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

### Corrida en el tip del PR #94 (`5c505b7`)

- Resultado: **success** (1m18s).
- Run: https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39480510922
- Job: https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39480510922/job/118827517023
- **Comparar las filas de cada tabla (RNF-09):** success. Contó filas en `incovsa` y `incovsa_restaurada`; `diff -u` sin diferencias. Antes: `restauración de diarios/20261020.dump en incovsa_restaurada lista`.
- **Comprobar la retención de 7 diarios y 4 semanales:** success. Con `SOLO_RETENCION=1` borró el excedente (`diarios/20200101.dump`, `diarios/20200102.dump`, `semanales/20200105.dump`, `semanales/20200112.dump`) y dejó 7 diarios y 4 semanales, con `20261020.dump` conservado.

### Modo `docker compose exec` (auditoría del 22/10, H-55)

Desde JG-25, el mismo flujo prueba también el modo del VPS: levanta el servicio `postgres` de `docker-compose.yml` y, sin `USAR_DOCKER_RUN`, restaura en él el respaldo de demostración, lo respalda con `docker compose exec`, lo restaura en `incovsa_copia` y compara la cantidad de filas de cada tabla con la base original.

## Rehacer el `.env` y `rclone` del VPS

Nota para el Documento 5 (CE-11), según `specs/16` («Respaldos», D-05). La configuración sin secretos (`docker-compose.yml`, `Caddyfile` y `.env.produccion.example`) está en el repositorio. Los secretos del VPS no: su copia de respaldo vive solo en el medio seguro que el coordinador acuerde con INCOVSA para entregar las credenciales (Anexo J, CE-12), nunca en las computadoras del equipo (decisión 70). Si se pierde el VPS o hay que instalar uno nuevo:

1. **`.env`:** con el usuario de despliegue, en `~/incovsa`, copie la plantilla y cámbiele los permisos para que solo ese usuario la lea.

   ```
   cp .env.produccion.example .env
   chmod 600 .env
   ```

   Escriba en `.env` los valores guardados en el medio seguro: la contraseña de PostgreSQL (en `POSTGRES_PASSWORD` y dentro de `DATABASE_URL`), las dos claves de autenticación (`BETTER_AUTH_SECRET_SITIO` y `BETTER_AUTH_SECRET_PICKING`, distintas entre sí, de al menos 32 caracteres) y las llaves de R2 de las imágenes. Ninguna línea puede quedar con el valor de la plantilla: la aplicación no arranca en producción con las claves «cambie-esto…». Si se crean claves nuevas en lugar de recuperar las guardadas, se cierran todas las sesiones abiertas, y hay que guardar las nuevas en el medio seguro.
2. **`rclone`:** con el mismo usuario, cree el remoto `r2` con la llave limitada al bucket privado de respaldos, también guardada en el medio seguro.

   ```
   rclone config create r2 s3 provider Cloudflare env_auth false \
     access_key_id <llave> secret_access_key <secreto> \
     endpoint https://<cuenta>.r2.cloudflarestorage.com
   rclone lsf r2:incovsa-respaldos/diarios
   ```

   La configuración queda en `~/.config/rclone/rclone.conf`. `RCLONE_DEST` del `.env` apunta a `r2:incovsa-respaldos`. Si `rclone lsf` lista los respaldos, el remoto funciona.
3. **Comprobar:** ejecute una vez `./scripts/respaldo.sh` a mano, con las variables del `.env` cargadas como en la línea del cron, y restaure ese respaldo en una base nueva («Restaurar en una base nueva»).
