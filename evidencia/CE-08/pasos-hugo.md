# Pasos para Carlos (Hugo) — CE-08

Escribe las contraseñas y llaves solo en el gestor de contraseñas y en el VPS / Cloudflare / GitHub. Nunca en el repositorio ni en el chat del agente (decisión 70).

## 0. Recibir de INCOVSA

- [ ] IP fija del VPS y usuario inicial (o consola del proveedor)
- [ ] Confirmación Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB, 80 GB
- [ ] Acceso a la zona DNS de `incovsa.com` o transferencia a Cloudflare
- [ ] Correo de INCOVSA para la cuenta Cloudflare (R2 + DNS)

## 1. Endurecer el VPS

Desde tu Mac, con la llave que te dieron:

```bash
scp evidencia/CE-08/preparar-vps.sh root@IP_DEL_VPS:/tmp/
ssh root@IP_DEL_VPS 'bash /tmp/preparar-vps.sh'
```

El script crea el usuario `despliegue` (o el nombre que pases), desactiva login root por contraseña, deja SSH solo con llave, UFW 22/80/443, Docker Engine + Compose plugin, y `~/incovsa` vacío. Anota la huella:

```bash
ssh-keyscan -t ed25519,rsa IP_DEL_VPS
```

## 2. Carpeta de la aplicación

Con el usuario de despliegue:

```bash
cd ~/incovsa
# Opción A: clonar (si el usuario tiene acceso de lectura al repo)
# Opción B: copiar docker-compose.yml, Caddyfile y .env.produccion.example desde tu Mac
cp .env.produccion.example .env
chmod 600 .env
```

Edita `.env` a mano. Valores reales fuera del repo. Incluye:

- `IMAGEN_APP=ghcr.io/jordin-garcia/proyecto_incovsa:<sha-o-produccion>` (CE-06 no publica `:latest` en prod)
- Claves Better Auth, Postgres, R2 (imágenes)
- `RCLONE_DEST=r2:incovsa-respaldos`
- `DOMINIO=incovsa.com` (o un host temporal si pruebas con el sitio cerrado)

Login a GHCR en el VPS (PAT o `GITHUB_TOKEN` de un workflow; el despliegue automático lo hace Actions):

```bash
echo TOKEN | docker login ghcr.io -u carloshugoeg --password-stdin
```

## 3. Cloudflare R2

1. Cuenta Cloudflare a nombre de INCOVSA.
2. Bucket `incovsa-imagenes` (público solo vía dominio personalizado).
3. Bucket `incovsa-respaldos` (privado).
4. API token / Access Key por bucket (principio de mínimo privilegio).
5. Dominio personalizado `imagenes.incovsa.com` → bucket de imágenes.
6. En el VPS, `rclone config` remoto `r2` solo hacia respaldos. Las llaves quedan en `~/.config/rclone/`, no en `.env`.

## 4. DNS

En Cloudflare:

| Nombre | Tipo | Destino |
|---|---|---|
| `@` (`incovsa.com`) | A | IP del VPS |
| `imagenes` | CNAME / Custom Domain R2 | (lo genera el panel de R2) |

Caddy obtiene el certificado por HTTP-01 o TLS-ALPN en 80/443. Si el proxy naranja de Cloudflare rompe la emisión, usa DNS only en el apex mientras Caddy emite, o DNS challenge. Documenta lo que elijas en el Resultado al desbloquear.

Si **no** se puede pasar el DNS: avisa a **Jordin** y **Daniela** (decisión 32).

## 5. Secretos de GitHub

En la Mac, como `carloshugoeg`:

```bash
gh api --method PUT repos/jordin-garcia/proyecto_incovsa/environments/produccion -f wait_timer=0
gh secret set VPS_HOST --env produccion --body "IP_O_HOSTNAME"
gh secret set VPS_USUARIO --env produccion --body "despliegue"
gh secret set VPS_LLAVE_SSH --env produccion < ~/.ssh/incovsa_despliegue
gh secret set VPS_KNOWN_HOSTS --env produccion --body "$(ssh-keyscan -t ed25519,rsa IP_DEL_VPS)"
```

## 6. Cron de respaldos (CE-07)

Node 24 y rclone en el PATH del usuario de despliegue. Luego:

```
15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh
```

Prueba una vez:

```bash
cd ~/incovsa && set -a && . ./.env && set +a && ./scripts/respaldo.sh
RCLONE_ORIGEN=diarios/$(date -u +%Y%m%d).dump POSTGRES_DB_DEST=incovsa_restaurada ./scripts/restaurar.sh
```

Guarda la salida en `evidencia/CE-08/` (sin contraseñas) al reabrir la tarea.

## 7. Probar el despliegue (no es JG-19)

- Con secretos cargados, un `workflow_dispatch` de `despliegue.yml` en modo controlado, o un push de prueba acordado con Jordin.
- Comprobar que el job SSH entra a `~/incovsa` y que `https://incovsa.com` (o el host temporal) responde.
- El primer despliegue oficial sigue siendo JG-19 el 02/11.

## 8. Cerrar CE-08

Cuando los cinco criterios tengan evidencia real: conversación nueva, `estado: hecha`, `## Resultado`, bitácora, PR `[CE-08] …` (sin la palabra Bloqueada).
