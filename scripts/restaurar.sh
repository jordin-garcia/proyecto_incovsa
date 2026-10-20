#!/usr/bin/env bash
# Restauración de un respaldo de PostgreSQL 18 (CE-07, RNF-09).
#
# Por defecto crea de nuevo POSTGRES_DB_DEST y restaura ahí.
# Si POSTGRES_DB_DEST es la misma base que POSTGRES_DB, hace falta la frase exacta
# CONFIRMAR_SOBRESCRITURA=SOBRESCRIBIR PRODUCCION. Sin esa frase el script termina
# antes de descargar el archivo y antes de ejecutar SQL.
#
# Variables (la contraseña no se escribe en la salida ni en el registro):
#   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_DB_DEST
#   RCLONE_DEST     raíz del remoto. Ejemplo: r2:incovsa-respaldos
#   RCLONE_ORIGEN   diarios/YYYYMMDD.dump o semanales/YYYYMMDD.dump
#                   También puede ser el primer argumento.
#   CONFIRMAR_SOBRESCRITURA
#   COMPOSE_ARCHIVO, COMPOSE_SERVICIO_POSTGRES
#   USAR_DOCKER_RUN=1 y DOCKER_RED y POSTGRES_HOST
#   EJECUTAR_PG_EN_HOST=1 y POSTGRES_HOST
#   POSTGRES_PORT (5432), POSTGRES_IMAGEN (postgres:18)
#
# Las llaves de R2 viven en la configuración de rclone del servidor, no en este archivo.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
LIB="$(pwd)/scripts/lib-respaldo.mjs"

registrar() {
  printf '%s\n' "$*"
  logger -t incovsa-restaurar -- "$*" || true
}

trap 'registrar "la restauración falló con código $?"' ERR

exigir() {
  if [ -z "${!1:-}" ]; then
    registrar "falta la variable $1"
    exit 2
  fi
}

nombre_base_valido() {
  [[ "$1" =~ ^[A-Za-z_][A-Za-z0-9_]{0,62}$ ]]
}

exigir POSTGRES_USER
exigir POSTGRES_PASSWORD
exigir POSTGRES_DB
exigir POSTGRES_DB_DEST
exigir RCLONE_DEST

origen="${1:-${RCLONE_ORIGEN:-}}"
if [[ ! "$origen" =~ ^(diarios|semanales)/[0-9]{8}\.dump$ ]]; then
  registrar "el origen debe ser diarios/YYYYMMDD.dump o semanales/YYYYMMDD.dump"
  exit 2
fi
if ! nombre_base_valido "$POSTGRES_DB" || ! nombre_base_valido "$POSTGRES_DB_DEST"; then
  registrar "el nombre de la base solo admite letras, números y guion bajo"
  exit 2
fi

codigo=0
node "$LIB" confirmar "$POSTGRES_DB" "$POSTGRES_DB_DEST" "${CONFIRMAR_SOBRESCRITURA:-}" || codigo=$?
if [ "$codigo" -eq 3 ]; then
  registrar "Para sobrescribir la base de producción, CONFIRMAR_SOBRESCRITURA debe ser exactamente: SOBRESCRIBIR PRODUCCION"
  exit 1
fi
if [ "$codigo" -ne 0 ]; then
  registrar "no se pudo comprobar la confirmación de restauración"
  exit "$codigo"
fi

trabajo="$(mktemp -d)"
trap 'rm -rf "$trabajo"' EXIT
volcado="$trabajo/respaldo.dump"
rclone copyto "${RCLONE_DEST}/${origen}" "$volcado"
magic="$(head -c 5 "$volcado" || true)"
if [ "$magic" != "PGDMP" ]; then
  registrar "el archivo descargado no es un volcado de formato personalizado"
  exit 1
fi

modo="compose"
args_red=()
if [ "${EJECUTAR_PG_EN_HOST:-0}" = "1" ] && [ "${USAR_DOCKER_RUN:-0}" = "1" ]; then
  registrar "defina solo EJECUTAR_PG_EN_HOST o solo USAR_DOCKER_RUN"
  exit 2
fi
if [ "${EJECUTAR_PG_EN_HOST:-0}" = "1" ]; then
  modo="host"
elif [ "${USAR_DOCKER_RUN:-0}" = "1" ]; then
  modo="docker"
fi
if [ "$modo" != "compose" ]; then
  exigir POSTGRES_HOST
  if [ "$modo" = "docker" ]; then
    exigir DOCKER_RED
  fi
  args_red=(-h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}")
fi

export PGPASSWORD="$POSTGRES_PASSWORD"
cat >"$trabajo/preparar.sql" <<EOF
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${POSTGRES_DB_DEST}' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS "${POSTGRES_DB_DEST}";
CREATE DATABASE "${POSTGRES_DB_DEST}";
EOF

if [ "$modo" = "host" ]; then
  psql -v ON_ERROR_STOP=1 --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d postgres -f "$trabajo/preparar.sql"
  pg_restore --exit-on-error --no-owner --no-acl --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d "$POSTGRES_DB_DEST" "$volcado"
elif [ "$modo" = "docker" ]; then
  docker run --rm --network "$DOCKER_RED" -e PGPASSWORD -i \
    -v "$trabajo/preparar.sql:/tmp/preparar.sql:ro" \
    "${POSTGRES_IMAGEN:-postgres:18}" \
    psql -v ON_ERROR_STOP=1 --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d postgres -f /tmp/preparar.sql
  docker run --rm --network "$DOCKER_RED" -e PGPASSWORD -i \
    -v "$volcado:/tmp/respaldo.dump:ro" \
    "${POSTGRES_IMAGEN:-postgres:18}" \
    pg_restore --exit-on-error --no-owner --no-acl --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d "$POSTGRES_DB_DEST" /tmp/respaldo.dump
else
  servicio="${COMPOSE_SERVICIO_POSTGRES:-postgres}"
  archivo="${COMPOSE_ARCHIVO:-docker-compose.yml}"
  docker compose -f "$archivo" exec -T -e PGPASSWORD "$servicio" \
    psql -v ON_ERROR_STOP=1 --no-password -U "$POSTGRES_USER" -d postgres -f - <"$trabajo/preparar.sql"
  docker compose -f "$archivo" cp "$volcado" "${servicio}:/tmp/incovsa-respaldo.dump"
  docker compose -f "$archivo" exec -T -e PGPASSWORD "$servicio" \
    pg_restore --exit-on-error --no-owner --no-acl --no-password -U "$POSTGRES_USER" -d "$POSTGRES_DB_DEST" /tmp/incovsa-respaldo.dump
  docker compose -f "$archivo" exec -T "$servicio" rm -f /tmp/incovsa-respaldo.dump
fi

registrar "restauración de ${origen} en ${POSTGRES_DB_DEST} lista"
