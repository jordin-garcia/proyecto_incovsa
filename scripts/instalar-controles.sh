#!/usr/bin/env bash
# Binarios oficiales fijados por versión y SHA-256. Solo Linux amd64 (runners de CI).
set -euo pipefail
destino="${RUNNER_TEMP:?}/incovsa-controles"
mkdir -p "$destino"
cd "$destino"
case "${1:?Indique gitleaks, actionlint u osv-scanner}" in
  gitleaks)
    archivo=gitleaks_8.30.1_linux_x64.tar.gz
    curl --fail --silent --show-error --location "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/$archivo" -o "$archivo"
    echo "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb  $archivo" | sha256sum --check
    tar -xzf "$archivo" gitleaks
    ;;
  actionlint)
    archivo=actionlint_1.7.12_linux_amd64.tar.gz
    curl --fail --silent --show-error --location "https://github.com/rhysd/actionlint/releases/download/v1.7.12/$archivo" -o "$archivo"
    echo "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8  $archivo" | sha256sum --check
    tar -xzf "$archivo" actionlint
    ;;
  osv-scanner)
    archivo=osv-scanner
    curl --fail --silent --show-error --location "https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_linux_amd64" -o "$archivo"
    echo "160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b  $archivo" | sha256sum --check
    chmod +x "$archivo"
    ;;
  *) echo "Herramienta desconocida" >&2; exit 1 ;;
esac
echo "$destino" >> "${GITHUB_PATH:?}"
