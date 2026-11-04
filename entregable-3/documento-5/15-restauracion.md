# Restauración

Restaure siempre hacia una base distinta de la de producción, salvo que vaya a reemplazar producción a propósito. `scripts/restaurar.sh` descarga el objeto, comprueba que sea un volcado de formato personalizado, borra `POSTGRES_DB_DEST` si ya existe (con `DROP DATABASE … WITH (FORCE)`, que corta las conexiones abiertas a esa base) y la vuelve a crear. Luego corre `pg_restore --exit-on-error --no-owner --no-acl`. Registra cada paso con la etiqueta `incovsa-restaurar`.

## Base nueva

Elija un objeto `diarios/YYYYMMDD.dump` o `semanales/YYYYMMDD.dump`. El nombre de la base destino empieza con una letra o un guion bajo, tiene hasta 63 caracteres y solo admite letras, números y guion bajo.

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

Si el origen no cumple el formato, el script imprime `el origen debe ser diarios/YYYYMMDD.dump o semanales/YYYYMMDD.dump` y termina con código 2. Un nombre de base inválido da `el nombre de la base solo admite letras, números y guion bajo`, también con código 2. Si el archivo descargado no es un volcado válido, imprime `el archivo descargado no es un volcado de formato personalizado`. En esos casos no toca la base.

## Reemplazar producción

Haga antes un respaldo nuevo y avise a los usuarios: la restauración corta las conexiones de `app` a la base mientras dura. `POSTGRES_DB_DEST` tiene que ser el mismo nombre que `POSTGRES_DB`. La confirmación tiene que ser exactamente `SOBRESCRIBIR PRODUCCION`, con ese espacio y esas mayúsculas.

```
export RCLONE_ORIGEN=diarios/YYYYMMDD.dump
export POSTGRES_DB_DEST="$POSTGRES_DB"
export CONFIRMAR_SOBRESCRITURA='SOBRESCRIBIR PRODUCCION'
./scripts/restaurar.sh
```

Con cualquier otra frase, el script imprime `Para sobrescribir la base de producción, CONFIRMAR_SOBRESCRITURA debe ser exactamente: SOBRESCRIBIR PRODUCCION` y termina con código 1. No descarga el archivo y no ejecuta SQL.

## Prueba que ya se ejecutó

La prueba de CI es real y es local. No usa R2. El flujo se llama Respaldo y restauración, archivo `.github/workflows/produccion-respaldo.yml`. Corre en los *pull requests* que tocan los scripts de respaldo o `docker-compose.yml`, cada lunes a las 06:00 UTC, y a mano.

```
gh workflow run produccion-respaldo.yml
gh run watch
```

Levanta PostgreSQL 18, aplica las migraciones, carga la semilla base y la de demostración, respalda con `USAR_DOCKER_RUN=1` hacia un remoto local de rclone, restaura en `incovsa_restaurada` y compara la cantidad de filas de cada tabla. También comprueba que la retención deje 7 diarios y 4 semanales. Además prueba el modo del VPS: levanta el servicio `postgres` de `docker-compose.yml`, respalda con `docker compose exec`, restaura en `incovsa_copia` y compara de nuevo las filas.

Tabla: Pruebas de restauración realizadas {#tab:restauraciones}

| Fecha | Origen | Corrida | Resultado |
|---|---|---|---|
| 20/10/2026 | Pull request de CE-07 | https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39480510922 | Restauró `diarios/20261020.dump` en `incovsa_restaurada`; las cantidades de filas coinciden |
| 02/11/2026 | Corrida programada del lunes, sobre `develop` | https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/41462240142 | Imprimió `restauración de diarios/20261102.dump en incovsa_restaurada lista`; las cantidades de filas coinciden y la retención borró los respaldos sobrantes |

La primera corrida está documentada en `evidencia/CE-07/README.md`. Para repetir la prueba, ejecute el flujo a mano con los dos comandos de arriba y revise que el paso de comparación termine sin la línea `RNF-09: la cantidad de filas no coincide`.

> **Pendiente de producción (versión 1.1).** Falta la prueba de restauración contra el bucket privado de R2 y en el VPS (tarea CE-10). Se hace con el procedimiento de «Base nueva» de este apartado, apenas exista el primer respaldo de producción.
