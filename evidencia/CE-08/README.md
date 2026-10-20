# CE-08. Preparación del VPS, DNS y R2

Estado al 2026-10-20: **bloqueada**. Faltan los accesos de INCOVSA (P-10, P-93, P-94). Este directorio deja listo lo que se puede hacer en el repositorio y la guía que Carlos sigue cuando existan.

## Qué falta (humano)

| Pendiente | Quién | Qué entrega |
|---|---|---|
| P-10 VPS | Ing. William Ambrossio / INCOVSA | Ubuntu 24.04 LTS, 2 vCPU, 4 GB RAM, 80 GB SSD, IP fija, SSH con llave |
| P-93 DNS | INCOVSA | Transferir `incovsa.com` a Cloudflare (plan gratuito) o avisar si no se puede |
| P-94 Cuentas | INCOVSA | Correo de empresa para Cloudflare y VPS; invitar al equipo |
| GitHub `environment: produccion` | Carlos (`carloshugoeg`) | Crear el environment y cargar `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH`, `VPS_KNOWN_HOSTS` |

El token de Cursor Cloud Agent no puede crear el environment (`403` al `PUT …/environments/produccion`). Eso lo hace Carlos en la Mac con `gh` como `carloshugoeg`.

## Orden de trabajo cuando haya acceso

1. **VPS.** Con la llave de root o del panel del proveedor, copia `preparar-vps.sh` al servidor y ejecútalo como root (`PUBKEY_DESPLIEGUE` si root no tiene `authorized_keys`). Si las llaves del usuario de despliegue quedan vacías, el script aborta **antes** de tocar SSH. Luego `verificar-vps.sh` también como root. Guarda la huella SSH.
2. **Carpeta de la app.** En la cuenta de despliegue: clona o copia el repo en `~/incovsa`, deja `docker-compose.yml`, `Caddyfile` y `.env` (desde `.env.produccion.example`; secretos solo en el gestor de contraseñas, decisión 70). Fija `IMAGEN_APP` a una etiqueta de GHCR (CE-06 no publica `:latest` en producción).
3. **Cloudflare R2.** Bucket público de imágenes (`incovsa-imagenes`) y bucket privado de respaldos (`incovsa-respaldos`). Credencial de API limitada a cada uno. Conecta `imagenes.incovsa.com` al bucket de imágenes (Custom Domain de R2).
4. **DNS.** `incovsa.com` y `www` (si aplica) → A/AAAA al VPS (proxied o DNS only según Caddy; Caddy necesita el 80/443 reales para el certificado). Si INCOVSA no puede pasar el DNS a Cloudflare, avisa a Jordin y a Daniela: la app servirá imágenes por ruta propia (decisión 32).
5. **GitHub.** Crea el environment `produccion` y los cuatro secretos. Comando de ejemplo en `pasos-hugo.md`.
6. **Cron CE-07.** Node 24 + rclone en el PATH del usuario de despliegue; remoto rclone al bucket privado; línea `15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh`.
7. **Prueba.** Un respaldo + restauración en base nueva contra R2; despliegue de prueba con imagen de `develop`/`-prueba` o sitio cerrado; dejar listo para JG-19 (02/11). No es el despliegue oficial.

## Criterios de aceptación (aún sin evidencia real)

| # | Criterio | Evidencia esperada |
|---|---|---|
| 1 | SSH solo con llave; UFW 22/80/443 | Salida de `verificar-vps.sh` en el VPS |
| 2 | Caddy con cert de `incovsa.com`; HTTPS | `curl -fsSI https://incovsa.com/` |
| 3 | Imagen del panel en `imagenes.incovsa.com` | URL pública de un objeto subido |
| 4 | Respaldo nocturno + restauración R2 | Log `incovsa-respaldo` + notas Documento 5 |
| 5 | Despliegue CE-06 por SSH | Run de Actions con paso SSH en verde |

## Archivos

| Archivo | Uso |
|---|---|
| `bloqueo.md` | Motivo del bloqueo y comprobaciones hechas desde el agente |
| `pasos-hugo.md` | Checklist paso a paso (contraseñas las escribe Carlos, no el agente) |
| `preparar-vps.sh` | Endurecimiento idempotente del VPS (root, una vez) |
| `verificar-vps.sh` | Comprueba SSH/UFW/Docker/carpeta cuando ya hay acceso |
