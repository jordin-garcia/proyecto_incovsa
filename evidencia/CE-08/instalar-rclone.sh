#!/usr/bin/env bash
# CE-08. Instala la versión oficial actual de rclone para el usuario de despliegue, en ~/.local/bin.
# La de Ubuntu 24.04 (1.60) falla con error 501 en el primer intento de cada subida a R2.
# Ejecutar como el usuario de despliegue (no hace falta root). Comprueba la suma SHA256 publicada.
# Uso: bash instalar-rclone.sh
# El cron de los respaldos pone ~/.local/bin primero en su PATH (evidencia/CE-08/README.md).

set -euo pipefail

d="$(mktemp -d)"
trap 'rm -rf "$d"' EXIT
cd "$d"
v="$(curl -fsSL https://downloads.rclone.org/version.txt | awk '{print $2}')"
echo "rclone ${v}"
curl -fsSLO "https://downloads.rclone.org/${v}/rclone-${v}-linux-amd64.zip"
curl -fsSL "https://downloads.rclone.org/${v}/SHA256SUMS" -o SHA256SUMS
grep " rclone-${v}-linux-amd64.zip$" SHA256SUMS | sha256sum -c -
# Ubuntu no trae unzip; python3 sí.
python3 -m zipfile -e "rclone-${v}-linux-amd64.zip" .
install -D -m 755 "rclone-${v}-linux-amd64/rclone" "$HOME/.local/bin/rclone"
"$HOME/.local/bin/rclone" version | head -1
