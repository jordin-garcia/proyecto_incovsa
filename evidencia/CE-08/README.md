# CE-08. VPS de Hostinger, incovsa.tech y Cloudflare R2

Evidencia del 06/11/2026 (hora de Guatemala; el VPS marca 07/11 en UTC). El repositorio es público: aquí no hay IP del VPS, correos, llaves ni contraseñas. Las credenciales viven solo en el VPS, en los secretos de GitHub y en el gestor de contraseñas del coordinador (decisión 70).

## Qué quedó listo

| Pieza | Estado |
|---|---|
| VPS | Hostinger KVM 2 (2 vCPU, 8 GB, 100 GB), Ubuntu 24.04.5 LTS, nombre `srv2136614.hstgr.cloud` |
| Dirección | `https://incovsa.tech` (decisión 91, precisada en CE-08). Nameservers en Cloudflare; `incovsa.tech` es un CNAME al nombre del VPS, en «DNS only» |
| Imágenes | Bucket `incovsa-imagenes`, servido solo por `https://imagenes.incovsa.tech` (dominio propio de R2). `r2.dev` desactivado |
| Respaldos | Bucket `incovsa-respaldos`, privado, sin dirección pública |
| Credenciales de R2 | Un token por bucket («Object Read & Write», solo ese bucket). El de imágenes va en el `.env`; el de respaldos, en la configuración de rclone |
| Aplicación | `~/incovsa` del usuario `despliegue`: `docker-compose.yml`, `Caddyfile`, `.env` (modo 600) y `scripts/` de respaldo |
| GitHub | `environment: produccion` con `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` (llave solo para Actions) y `VPS_KNOWN_HOSTS`, y la variable `DOMINIO=incovsa.tech` |

## Cómo se hizo

1. `preparar-vps.sh` como root, con la llave del coordinador: actualizaciones automáticas, usuario `despliegue` (grupo `docker`, sin `sudo`), SSH solo con llave y sin root, UFW con 22, 80 y 443, Docker y Compose oficiales, Node.js 24. El panel de Hostinger no tiene cortafuegos propio activo.
2. `instalar-rclone.sh` como `despliegue`: rclone 1.76.0 oficial en `~/.local/bin`, con su SHA256 comprobada.
3. En Cloudflare (lo hizo el coordinador): la zona `incovsa.tech`, el CNAME, los dos buckets, el dominio de las imágenes y los dos tokens. En Hostinger, los nameservers de `incovsa.tech` (por la API, después de que el coordinador verificó el contacto del dominio).
4. El `.env` y la configuración de rclone los escribió el coordinador en el VPS (`.env.produccion.example` y `rclone config create r2 s3 provider=Cloudflare … acl=private no_check_bucket=true`).
5. El despliegue de prueba: el mismo script del paso SSH de `despliegue.yml` (ya corregido), con la imagen de `develop` 437cddb del paquete `proyecto_incovsa-prueba`. El flujo en modo de prueba sube cinco variantes `evidencia-poda-N` encima de la imagen y la poda borra la etiqueta con el SHA, así que se usó `evidencia-poda-5`: la misma imagen con un archivo de texto en `/tmp`. Después: semilla base (`docker compose exec -T app npm run db:semilla`), y el coordinador creó un administrador con `crear-admin` para subir la imagen de prueba.
6. El `cron` de los respaldos y una prueba de respaldo y restauración. Al final, `docker logout ghcr.io`: el VPS no guarda credenciales de GHCR (cada despliegue entra con el token temporal de Actions).

## Criterios de aceptación

### 1. SSH solo con llave; cortafuegos 22, 80 y 443

`verificar-vps.sh` como root, al terminar de preparar (antes de copiar los archivos de la aplicación):

```
OK  Ubuntu 24.04
OK  PasswordAuthentication no
OK  PermitRootLogin no
OK  UFW activo
OK  Puerto 22 permitido
OK  Puerto 80 permitido
OK  Puerto 443 permitido
OK  Sin reglas ALLOW fuera de 22/80/443
OK  Docker y Compose plugin
OK  Usuario despliegue existe
OK  Carpeta /home/despliegue/incovsa
```

Los tres fallos de ese momento eran los archivos de la aplicación, que se copiaron después (`ls -l`: `docker-compose.yml`, `Caddyfile` y `.env` con `-rw-------`). Desde ese momento root no entra por SSH: para volver a correr el script como root se entra por la consola de Hostinger (el usuario `despliegue` no tiene `sudo`). Comprobación desde fuera:

```
root@srv2136614.hstgr.cloud: Permission denied (publickey).        # con llave
root@srv2136614.hstgr.cloud: Permission denied (publickey).        # con contraseña
despliegue@srv2136614.hstgr.cloud: Permission denied (publickey).  # con contraseña
puerto 5432 cerrado · puerto 3000 cerrado · puerto 2019 cerrado · puerto 8080 cerrado
```

### 2. Certificado e HTTPS

```
$ curl -sI https://incovsa.tech/
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; … img-src 'self' data: blob: https://imagenes.incovsa.tech; …
Strict-Transport-Security: max-age=31536000; includeSubDomains
Via: 1.1 Caddy
X-Content-Type-Options: nosniff

$ openssl s_client -connect incovsa.tech:443 -servername incovsa.tech | openssl x509 -noout -issuer -subject -dates
issuer=C=US, O=Let's Encrypt, CN=YE2
subject=CN=incovsa.tech
notBefore=Nov  7 03:00:42 2026 GMT
notAfter=Feb  5 03:00:41 2027 GMT

$ curl -sI http://incovsa.tech/
HTTP/1.1 308 Permanent Redirect
Location: https://incovsa.tech/
```

El emisor es Let's Encrypt, para `incovsa.tech`; Caddy lo renueva solo.

### 3. Imagen del panel en R2

El coordinador subió una imagen desde el panel (Contenido) y la publicó. El sitio la sirve desde R2:

```
$ curl -sI https://imagenes.incovsa.tech/f7be2ab6-ee11-45f5-bf2a-76ef6eb40c99.webp
HTTP/1.1 200 OK
Content-Type: image/webp
Content-Length: 22710
Server: cloudflare
```

En `https://incovsa.tech/nosotros`, en el navegador, la imagen está completa (`naturalWidth` 464) y la consola no tiene errores: la política de seguridad de contenido la permite. DM-12 la reemplaza con el contenido oficial.

### 4. Respaldo nocturno y restauración contra R2

`crontab -l` del usuario `despliegue`:

```
PATH=/home/despliegue/.local/bin:/usr/local/bin:/usr/bin:/bin
15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh
```

El VPS está en UTC: corre a las 02:15 UTC, 20:15 en Guatemala. Prueba a mano con la misma configuración:

```
rclone: rclone v1.76.0
respaldo diario 20261107.dump listo
respaldo semanal 20261107.dump listo
retención aplicada
== en R2
diarios/20261107.dump
semanales/20261107.dump
restauración de diarios/20261107.dump en incovsa_restaurada lista
33 tablas restauradas
33 tablas en producción
base de prueba borrada
```

Con el rclone de Ubuntu (1.60) cada subida fallaba con `NotImplemented` (501) en el primer intento y pasaba en el segundo; con el oficial no hay errores. La primera corrida del `cron` se ve con `journalctl -t incovsa-respaldo`.

### 5. Despliegue por SSH con la dirección del environment

Al correr a mano el script del paso SSH de `despliegue.yml` aparecieron dos errores de CE-06, ya corregidos en este PR:

- El script llega por la entrada estándar (`bash -s`) y `docker compose run` la leía: el flujo aplicaba las migraciones y terminaba sin reiniciar la aplicación. Ahora la migración corre con `-T` y `</dev/null`.
- `up -d app` no arranca Caddy en un VPS nuevo. Ahora arranca `app` y `caddy`.

La comprobación final ya no consulta `https://incovsa.com`: toma `DOMINIO` del `environment: produccion` (`incovsa.tech`). Pruebas: `scripts/flujos.test.mjs`, «CE-08, criterio 5» y «CE-08: el despliegue por SSH…». Resultado del script corregido en el VPS:

```
All migrations have been successfully applied.
 Container incovsa-app-1 Healthy
 Container incovsa-caddy-1 Started
SERVICE    STATE     STATUS
app        running   Up 6 seconds (healthy)
caddy      running   Up Less than a second
postgres   running   Up About a minute (healthy)
```

Solo `main` despliega por Actions (decisiones 31 y 75), y `main` todavía no tiene `despliegue.yml`: la primera ejecución por Actions, con el SSH y la comprobación final en verde, es la evidencia de JG-19. Imagen compilada para la prueba: corrida 42335673884 de `despliegue.yml` en `develop`, modo de prueba, en verde.

## Archivos

| Archivo | Uso |
|---|---|
| `preparar-vps.sh` | Endurece Ubuntu 24.04 e instala Docker y Node.js 24 (root, una vez) |
| `instalar-rclone.sh` | rclone oficial en `~/.local/bin` (usuario de despliegue) |
| `verificar-vps.sh` | Comprueba el criterio 1 y la carpeta de la aplicación (root) |

La guía de Carlos del 20/10 (`pasos-hugo.md`) y la evidencia del bloqueo (`bloqueo.md`, `validar-local.txt`) quedan en el historial de git: eran para incovsa.com y ya no aplican.
