#!/usr/bin/env bash
# CE-08. Comprueba el endurecimiento del VPS (criterio 1 y carpeta CE-06).
# Ejecutar en el VPS como el usuario de despliegue o como root.
# Uso: bash verificar-vps.sh
#      USUARIO_DESPLIEGUE=despliegue DIR_APP=$HOME/incovsa bash verificar-vps.sh

set -euo pipefail

USUARIO_DESPLIEGUE="${USUARIO_DESPLIEGUE:-despliegue}"
if [ "$(id -u)" -eq 0 ]; then
  DIR_APP="${DIR_APP:-/home/${USUARIO_DESPLIEGUE}/incovsa}"
else
  DIR_APP="${DIR_APP:-$HOME/incovsa}"
fi

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
if printf '%s\n' "$sshd_cfg" | grep -qiE '^passwordauthentication no$'; then
  ok "PasswordAuthentication no"
else
  ko "PasswordAuthentication debe ser no"
fi
if printf '%s\n' "$sshd_cfg" | grep -qiE '^permitrootlogin no$'; then
  ok "PermitRootLogin no"
else
  ko "PermitRootLogin debe ser no (como preparar-vps.sh)"
fi

echo "==> UFW"
if ufw status 2>/dev/null | grep -q 'Status: active'; then
  ok "UFW activo"
else
  ko "UFW no está activo"
fi
estado_ufw="$(ufw status numbered 2>/dev/null || true)"
for puerto in 22 80 443; do
  if printf '%s\n' "$estado_ufw" | grep -qE "\\b${puerto}\\b"; then
    ok "Puerto ${puerto} permitido"
  else
    ko "Falta permitir el puerto ${puerto}"
  fi
done

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
  if [ "$(stat -c '%a' "${DIR_APP}/.env" 2>/dev/null || echo '?')" = "600" ] \
    || [ "$(stat -f '%Lp' "${DIR_APP}/.env" 2>/dev/null || echo '?')" = "600" ]; then
    ok ".env modo 600"
  else
    ko ".env debería ser modo 600"
  fi
else
  ko "Falta ${DIR_APP}/.env (cópialo desde .env.produccion.example y rellénalo a mano)"
fi

echo
if [ "$fallos" -eq 0 ]; then
  echo "Verificación local del VPS: OK (${fallos} fallos)."
  exit 0
fi
echo "Verificación local del VPS: ${fallos} fallo(s)." >&2
exit 1
