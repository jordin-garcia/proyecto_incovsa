#!/usr/bin/env bash
# CE-08. Comprueba el endurecimiento del VPS (criterio 1 y carpeta CE-06).
# Ejecutar en el VPS como root (sshd -T y ufw status lo requieren).
# Uso: bash verificar-vps.sh
#      USUARIO_DESPLIEGUE=despliegue DIR_APP=/home/despliegue/incovsa bash verificar-vps.sh

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script como root (hace falta para sshd -T y ufw status)." >&2
  exit 1
fi

USUARIO_DESPLIEGUE="${USUARIO_DESPLIEGUE:-despliegue}"
DIR_APP="${DIR_APP:-/home/${USUARIO_DESPLIEGUE}/incovsa}"

fallos=0
ok() { printf 'OK  %s\n' "$1"; }
ko() { printf 'FALLO  %s\n' "$1" >&2; fallos=$((fallos + 1)); }

echo "==> Sistema"
if grep -q 'Ubuntu 24.04' /etc/os-release 2>/dev/null; then
  ok "Ubuntu 24.04"
else
  ko "Se esperaba Ubuntu 24.04 LTS (specs/16 decisión 28)"
fi

echo "==> SSH"
sshd_cfg="$(sshd -T 2>/dev/null || true)"
if [ -z "$sshd_cfg" ]; then
  ko "sshd -T no devolvió configuración"
else
  if printf '%s\n' "$sshd_cfg" | grep -qiE '^passwordauthentication no$'; then
    ok "PasswordAuthentication no"
  else
    ko "PasswordAuthentication debe ser no"
  fi
  if printf '%s\n' "$sshd_cfg" | grep -qiE '^permitrootlogin no$'; then
    ok "PermitRootLogin no"
  else
    ko "PermitRootLogin debe ser no"
  fi
fi

echo "==> UFW (solo 22, 80, 443)"
if ufw status 2>/dev/null | grep -q 'Status: active'; then
  ok "UFW activo"
else
  ko "UFW no está activo"
fi
# Líneas de reglas: "22/tcp", "80/tcp", "443/tcp" (preparar-vps usa números, no OpenSSH).
estado_ufw="$(ufw status 2>/dev/null || true)"
for puerto in 22 80 443; do
  if printf '%s\n' "$estado_ufw" | grep -qE "^${puerto}(/tcp)?[[:space:]]+ALLOW"; then
    ok "Puerto ${puerto} permitido"
  elif printf '%s\n' "$estado_ufw" | grep -qE "^OpenSSH[[:space:]]+ALLOW" && [ "$puerto" = "22" ]; then
    ok "Puerto 22 vía perfil OpenSSH"
  else
    ko "Falta permitir el puerto ${puerto}"
  fi
done
# Criterio 1: solo esos puertos. Ignora cabeceras y "Default:".
extras="$(
  printf '%s\n' "$estado_ufw" | awk '
    /^Status:/ || /^--/ || /^To[[:space:]]/ || /^$/ || /^Default:/ { next }
    /ALLOW/ {
      to=$1
      if (to == "OpenSSH" || to ~ /^(22|80|443)(\/tcp)?$/) next
      print to
    }
  '
)"
if [ -z "$extras" ]; then
  ok "Sin reglas ALLOW fuera de 22/80/443"
else
  ko "Reglas ALLOW de más: $(printf '%s' "$extras" | tr '\n' ' ')"
fi

echo "==> Docker"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  ok "Docker y Compose plugin"
else
  ko "Falta docker o el plugin compose"
fi

echo "==> Usuario y carpeta"
if id -u "${USUARIO_DESPLIEGUE}" >/dev/null 2>&1; then
  ok "Usuario ${USUARIO_DESPLIEGUE} existe"
else
  ko "No existe el usuario ${USUARIO_DESPLIEGUE}"
fi
if [ -d "${DIR_APP}" ]; then
  ok "Carpeta ${DIR_APP}"
else
  ko "Falta ${DIR_APP}"
fi
for f in docker-compose.yml Caddyfile; do
  if [ -f "${DIR_APP}/${f}" ]; then
    ok "${f} en ${DIR_APP}"
  else
    ko "Falta ${DIR_APP}/${f} (cópialo desde el repo)"
  fi
done
if [ -f "${DIR_APP}/.env" ]; then
  ok ".env presente (no se lee el contenido)"
  modo="$(stat -c '%a' "${DIR_APP}/.env" 2>/dev/null || echo '?')"
  if [ "$modo" = "600" ]; then
    ok ".env modo 600"
  else
    ko ".env debería ser modo 600 (ahora ${modo})"
  fi
else
  ko "Falta ${DIR_APP}/.env (cópialo desde .env.produccion.example y rellénalo a mano)"
fi

echo
if [ "$fallos" -eq 0 ]; then
  echo "Verificación local del VPS: OK (0 fallos)."
  exit 0
fi
echo "Verificación local del VPS: ${fallos} fallo(s)." >&2
exit 1
