#!/usr/bin/env bash
# Respaldo de PostgreSQL 18 (CE-07, RNF-09, specs/16 decisión 34).
#
# Variables (la contraseña no se escribe en la salida ni en el registro):
#   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
#   COMPOSE_ARCHIVO              por defecto docker-compose.yml
#   COMPOSE_SERVICIO_POSTGRES    por defecto postgres
#   RCLONE_DEST                  obligatorio. Ejemplo: r2:incovsa-respaldos o local:/var/respaldos
#   FECHA                        YYYYMMDD opcional. Por defecto, hoy en UTC.
#   FORZAR_SEMANAL=1             sube también el semanal aunque la fecha UTC no sea domingo.
#   USAR_DOCKER_RUN=1            pg_dump con docker run --network "$DOCKER_RED" "$POSTGRES_IMAGEN".
#                                Exige POSTGRES_HOST (alias de esa red, no 127.0.0.1).
#   EJECUTAR_PG_EN_HOST=1        pg_dump del host contra POSTGRES_HOST y POSTGRES_PORT (5432).
#   DOCKER_RED                   red de Docker cuando USAR_DOCKER_RUN=1.
#   POSTGRES_IMAGEN              por defecto postgres:18.
#   SOLO_RETENCION=1             solo aplica la retención. Lo usa la prueba de GitHub Actions.
#
# El cron del VPS (Documento 5) corre cada noche. Hace falta Node en el PATH, rclone y Docker.
# 15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh
#
# Las llaves de R2 viven en la configuración de rclone del servidor, no en este archivo.
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
LIB="$(pwd)/scripts/lib-respaldo.mjs"

registrar() {
  printf '%s\n' "$*"
  logger -t incovsa-respaldo -- "$*" || true
}

trap 'registrar "el respaldo falló con código $?"' ERR

exigir() {
  if [ -z "${!1:-}" ]; then
    registrar "falta la variable $1"
    exit 2
  fi
}

aplicar_retencion() {
  local tipo="$1"
  local carpeta lista borrar nombre codigo err_lsf
  carpeta="$(node "$LIB" carpeta "$tipo")"
  codigo=0
  err_lsf="$(mktemp)"
  lista="$(rclone lsf "${RCLONE_DEST}/${carpeta}" --files-only 2>"$err_lsf")" || codigo=$?
  if [ "$codigo" -eq 3 ]; then
    lista=""
  elif [ "$codigo" -ne 0 ]; then
    cat "$err_lsf" >&2
    rm -f "$err_lsf"
    registrar "no se pudo listar ${carpeta}"
    exit "$codigo"
  fi
  rm -f "$err_lsf"
  borrar="$(printf '%s\n' "$lista" | node "$LIB" retener "$tipo")"
  if [ -z "$borrar" ]; then
    return 0
  fi
  while IFS= read -r nombre; do
    if [[ ! "$nombre" =~ ^[0-9]{8}\.dump$ ]]; then
      registrar "la retención devolvió un nombre no admitido"
      exit 1
    fi
    rclone deletefile "${RCLONE_DEST}/${carpeta}/${nombre}"
    registrar "retención borró ${carpeta}/${nombre}"
  done <<< "$borrar"
}

exigir POSTGRES_USER
exigir POSTGRES_PASSWORD
exigir POSTGRES_DB
exigir RCLONE_DEST

if [ "${SOLO_RETENCION:-0}" = "1" ]; then
  aplicar_retencion diario
  aplicar_retencion semanal
  registrar "retención aplicada"
  exit 0
fi

FECHA="${FECHA:-$(date -u +%Y%m%d)}"
if ! semanal="$(node "$LIB" plan-semanal "$FECHA" "${FORZAR_SEMANAL:-0}")"; then
  registrar "FECHA debe ser YYYYMMDD"
  exit 2
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

trabajo="$(mktemp -d)"
trap 'rm -rf "$trabajo"' EXIT
export PGPASSWORD="$POSTGRES_PASSWORD"
volcado="$trabajo/${FECHA}.dump"

if [ "$modo" = "host" ]; then
  pg_dump -Fc --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d "$POSTGRES_DB" >"$volcado"
elif [ "$modo" = "docker" ]; then
  docker run --rm --network "$DOCKER_RED" -e PGPASSWORD -i \
    "${POSTGRES_IMAGEN:-postgres:18}" \
    pg_dump -Fc --no-password -U "$POSTGRES_USER" "${args_red[@]}" -d "$POSTGRES_DB" >"$volcado"
else
  docker compose -f "${COMPOSE_ARCHIVO:-docker-compose.yml}" exec -T \
    -e PGPASSWORD \
    "${COMPOSE_SERVICIO_POSTGRES:-postgres}" \
    pg_dump -Fc --no-password -U "$POSTGRES_USER" -d "$POSTGRES_DB" >"$volcado"
fi

magic="$(head -c 5 "$volcado" || true)"
if [ "$magic" != "PGDMP" ]; then
  registrar "pg_dump no produjo un archivo de formato personalizado"
  exit 1
fi

rclone copyto "$volcado" "${RCLONE_DEST}/diarios/${FECHA}.dump"
registrar "respaldo diario ${FECHA}.dump listo"
if [ "$semanal" = "1" ]; then
  rclone copyto "$volcado" "${RCLONE_DEST}/semanales/${FECHA}.dump"
  registrar "respaldo semanal ${FECHA}.dump listo"
fi

aplicar_retencion diario
aplicar_retencion semanal
registrar "retención aplicada"
