# Requisitos

Instale el software de desarrollo en la computadora del equipo. No use Docker para desarrollar. Docker se usa solo en el VPS.

## Software de desarrollo

Hacen falta estas versiones. `package.json` exige Node.js 24, menor que 25, y npm 11.19.0 o posterior. `.npmrc` tiene `engine-strict=true`, así que `npm ci` se detiene si la versión no coincide.

- Node.js 24 LTS, con npm 11.19.0 o posterior. Si npm es más viejo, ejecute `npm i -g npm@11.19.0`.
- PostgreSQL 18, con `psql` en el `PATH`.
- Git, con `core.autocrlf` en `false`.
- GitHub CLI, con sesión iniciada.

En Windows, con PowerShell:

```
winget install --id Git.Git -e
winget install --id GitHub.cli -e
```

Descargue Node.js 24 desde https://nodejs.org/en/download. Instale PostgreSQL 18 desde https://www.postgresql.org/download/windows/ y agregue `C:\Program Files\PostgreSQL\18\bin` al `PATH`. Anote la contraseña que elija para el usuario `postgres`. No la escriba en el repositorio.

En macOS:

```
brew install git
brew install gh
brew install node@24
brew install postgresql@18
brew services start postgresql@18
```

Siga el aviso de Homebrew para poner `node@24` y la carpeta `bin` de PostgreSQL en el `PATH`.

Cierre la terminal y ábrala de nuevo después de instalar.

Configure Git con su nombre y el correo de su cuenta de GitHub. El repositorio es privado. Acepte la invitación antes de clonar.

```
git config --global user.name "Tu Nombre Completo"
git config --global user.email "el-correo-de-tu-cuenta-de-github"
git config --global core.autocrlf false
git config --global pull.rebase true
gh auth login
gh auth setup-git
```

En `gh auth login` elija GitHub.com, HTTPS y el navegador. Solo en Windows, ejecute también `git config --global core.longpaths true`.

## Software de producción

El VPS que se le pide a INCOVSA es Ubuntu Server 24.04 LTS, con 2 vCPU, 4 GB de RAM, 80 GB SSD, dirección IP fija y SSH solo con llave.

Tabla: Recursos mínimos del VPS {#tab:vps}

| Recurso | Mínimo |
|---|---|
| Sistema operativo | Ubuntu Server 24.04 LTS |
| Procesador | 2 vCPU |
| Memoria | 4 GB de RAM |
| Disco | 80 GB SSD |
| Red | Dirección IP fija |
| Acceso | SSH solo con llave |

En ese servidor, `evidencia/CE-08/preparar-vps.sh` instala Docker Engine y el complemento Compose desde el repositorio oficial de Docker. Las imágenes del archivo `docker-compose.yml` son `caddy:2`, `postgres:18` y la de la aplicación en GHCR. El usuario de despliegue necesita además Node.js 24 y `rclone` en el `PATH`, porque `scripts/respaldo.sh` los llama en el host. Ese script de preparación no instala Node.js ni rclone.

TODO(CE-11): El VPS no existe (P-10). No hay IP ni nombre de host del servidor. No ejecute `preparar-vps.sh` hasta que INCOVSA entregue el acceso.

## Cuentas y servicios

Hacen falta estas cuentas. Ninguna contraseña va en el repositorio.

- GitHub, con acceso al repositorio `jordin-garcia/proyecto_incovsa`, a GitHub Actions y al registro GHCR.
- Cloudflare, a nombre de INCOVSA, para el DNS de `incovsa.com` y para R2. Todavía no está creada.
- El VPS, contratado por INCOVSA. Todavía no está contratado.
- El Google Drive de INCOVSA, donde ya viven las fichas técnicas, las hojas de seguridad y los certificados de análisis. La aplicación solo guarda enlaces.
- Odoo, solo como origen del archivo `.xlsx` que exporta el facturador. No hay conexión directa ni cuenta SMTP.

TODO(CE-11): Las cuentas de VPS, DNS y R2 dependen de P-10, P-93 y P-94. Este apartado no trae direcciones, llaves ni nombres de bucket reales.
