#!/usr/bin/env bash
# CE-08. Endurece un Ubuntu Server 24.04 LTS para INCOVSA.
# Ejecutar una vez como root. Idempotente. No imprime secretos.
# Uso: USUARIO_DESPLIEGUE=despliegue bash preparar-vps.sh
#      PUBKEY_DESPLIEGUE='ssh-ed25519 AAAA… comentario'  (obligatorio si no hay llaves en root)

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script como root." >&2
  exit 1
fi

USUARIO_DESPLIEGUE="${USUARIO_DESPLIEGUE:-despliegue}"
DIR_APP="${DIR_APP:-/home/${USUARIO_DESPLIEGUE}/incovsa}"

export DEBIAN_FRONTEND=noninteractive

echo "==> Actualizaciones de seguridad automáticas"
apt-get update -y
apt-get install -y unattended-upgrades apt-listchanges
dpkg-reconfigure -f noninteractive unattended-upgrades
cat >/etc/apt/apt.conf.d/52incovsa-unattended <<'EOF'
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

echo "==> Paquetes base"
apt-get install -y ca-certificates curl gnupg ufw fail2ban

echo "==> Usuario de despliegue: ${USUARIO_DESPLIEGUE}"
if ! id -u "${USUARIO_DESPLIEGUE}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "INCOVSA despliegue" "${USUARIO_DESPLIEGUE}"
fi
# Sin grupo sudo: --disabled-password no da contraseña para sudo.
# El grupo docker basta para compose (privilegio equivalente a root vía el socket).

install -d -m 700 -o "${USUARIO_DESPLIEGUE}" -g "${USUARIO_DESPLIEGUE}" \
  "/home/${USUARIO_DESPLIEGUE}/.ssh"
AUTH_KEYS="/home/${USUARIO_DESPLIEGUE}/.ssh/authorized_keys"
touch "${AUTH_KEYS}"
chown "${USUARIO_DESPLIEGUE}:${USUARIO_DESPLIEGUE}" "${AUTH_KEYS}"
chmod 600 "${AUTH_KEYS}"

if [ -n "${PUBKEY_DESPLIEGUE:-}" ]; then
  if ! grep -qxF "${PUBKEY_DESPLIEGUE}" "${AUTH_KEYS}"; then
    printf '%s\n' "${PUBKEY_DESPLIEGUE}" >>"${AUTH_KEYS}"
  fi
elif [ ! -s "${AUTH_KEYS}" ] && [ -f /root/.ssh/authorized_keys ] && [ -s /root/.ssh/authorized_keys ]; then
  cat /root/.ssh/authorized_keys >>"${AUTH_KEYS}"
  chown "${USUARIO_DESPLIEGUE}:${USUARIO_DESPLIEGUE}" "${AUTH_KEYS}"
  chmod 600 "${AUTH_KEYS}"
  echo "Se copiaron las llaves de root a ${AUTH_KEYS}. Revisa que sean las correctas."
fi

if [ ! -s "${AUTH_KEYS}" ]; then
  echo "Aborto: ${AUTH_KEYS} está vacío. Pasa PUBKEY_DESPLIEGUE=… o entra como root con llave antes de endurecer SSH." >&2
  exit 1
fi

echo "==> SSH: solo llave, sin root"
# Prefijo 00- para que gane a 50-cloud-init.conf (sshd usa el primer valor).
# Neutraliza PasswordAuthentication de cloud-init si existe.
if [ -f /etc/ssh/sshd_config.d/50-cloud-init.conf ]; then
  sed -i -E 's/^[#[:space:]]*PasswordAuthentication[[:space:]].*/PasswordAuthentication no/' \
    /etc/ssh/sshd_config.d/50-cloud-init.conf || true
fi
# Quita drop-in antiguo con nombre que perdía ante cloud-init.
rm -f /etc/ssh/sshd_config.d/60-incovsa.conf
SSHD_DROPIN=/etc/ssh/sshd_config.d/00-incovsa.conf
cat >"${SSHD_DROPIN}" <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
EOF
if systemctl is-active --quiet ssh; then
  systemctl reload ssh
elif systemctl is-active --quiet sshd; then
  systemctl reload sshd
else
  echo "AVISO: no se pudo recargar ssh/sshd; reinicia el servicio a mano." >&2
fi

echo "==> Cortafuegos UFW (solo 22, 80, 443)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

echo "==> Docker Engine y Compose (repositorio oficial)"
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.asc ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi
ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME}")"
echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
  >/etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker "${USUARIO_DESPLIEGUE}"
systemctl enable --now docker

echo "==> Carpeta de la aplicación: ${DIR_APP}"
install -d -m 755 -o "${USUARIO_DESPLIEGUE}" -g "${USUARIO_DESPLIEGUE}" "${DIR_APP}"

echo
echo "Listo."
echo "  Usuario: ${USUARIO_DESPLIEGUE}"
echo "  Carpeta: ${DIR_APP}"
echo "  Abre una sesión nueva con ese usuario (grupo docker) antes de docker compose."
echo "  Copia docker-compose.yml, Caddyfile y .env a ${DIR_APP}."
echo "  Guarda la huella con: ssh-keyscan -t ed25519,rsa <IP>"
