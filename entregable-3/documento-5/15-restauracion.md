# Restauración

Restaure siempre hacia una base distinta de la de producción, salvo que vaya a reemplazar producción a propósito. `scripts/restaurar.sh` descarga el objeto, borra `POSTGRES_DB_DEST` si ya existe y la vuelve a crear. Luego corre `pg_restore --exit-on-error --no-owner --no-acl`.

## Base nueva

Elija un objeto `diarios/YYYYMMDD.dump` o `semanales/YYYYMMDD.dump`. El nombre de la base destino solo admite letras, números y guion bajo.

```
cd "$HOME/incovsa"
set -a && . ./.env && set +a
export RCLONE_ORIGEN=diarios/YYYYMMDD.dump
export POSTGRES_DB_DEST=incovsa_restaurada
./scripts/restaurar.sh
```

El primer argumento también vale como origen.

```
./scripts/restaurar.sh diarios/YYYYMMDD.dump
```

Sustituya `YYYYMMDD` por la fecha UTC del archivo que exista en el remoto. La línea de éxito es `restauración de diarios/YYYYMMDD.dump en incovsa_restaurada lista`, con la fecha real en lugar de `YYYYMMDD`.

Si el origen no cumple el formato, el script imprime `el origen debe ser diarios/YYYYMMDD.dump o semanales/YYYYMMDD.dump` y termina con código 2. No toca la base.

## Reemplazar producción

Haga antes un respaldo nuevo. `POSTGRES_DB_DEST` tiene que ser el mismo nombre que `POSTGRES_DB`. La confirmación tiene que ser exactamente `SOBRESCRIBIR PRODUCCION`, con ese espacio y esas mayúsculas.

```
export RCLONE_ORIGEN=diarios/YYYYMMDD.dump
export POSTGRES_DB_DEST="$POSTGRES_DB"
export CONFIRMAR_SOBRESCRITURA='SOBRESCRIBIR PRODUCCION'
./scripts/restaurar.sh
```

Con cualquier otra frase, el script imprime `Para sobrescribir la base de producción, CONFIRMAR_SOBRESCRITURA debe ser exactamente: SOBRESCRIBIR PRODUCCION` y termina con código 1. No descarga el archivo y no ejecuta SQL.

## Prueba que ya se ejecutó

La prueba de CI es real y es local. No usa R2. El flujo se llama Respaldo y restauración, archivo `.github/workflows/produccion-respaldo.yml`. Corre en los pull requests que tocan los scripts de respaldo, cada lunes a las 06:00 UTC, y a mano.

```
gh workflow run produccion-respaldo.yml
gh run watch
```

Levanta PostgreSQL 18, aplica las migraciones, carga la semilla base y la de demostración, respalda con `USAR_DOCKER_RUN=1` hacia un remoto local de rclone, restaura en `incovsa_restaurada` y compara la cantidad de filas de cada tabla. También comprueba que la retención deje 7 diarios y 4 semanales.

La corrida documentada en `evidencia/CE-07/README.md` terminó bien el 20/10/2026. Restauró `diarios/20261020.dump` en `incovsa_restaurada`. El `diff` de las cantidades de filas no tuvo diferencias. El registro de esa corrida es https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39480510922.

TODO(CE-11): La restauración de producción de CE-10 no está hecha. No hay evidencia de un `pg_restore` contra el bucket privado de R2 ni contra el VPS.
