# Requisitos

Instale el software de desarrollo en la computadora del equipo. No use Docker para desarrollar. Docker se usa solo en el VPS.

## Software de desarrollo

Hacen falta estas versiones. `package.json` exige Node.js 24, menor que 25, y npm 11.19.0 o posterior. `.npmrc` tiene `engine-strict=true`, así que `npm ci` se detiene si la versión no coincide.

- Node.js 24 LTS, con npm 11.19.0 o posterior. Si npm es más viejo, ejecute `npm i -g npm@11.19.0`.
- PostgreSQL 18, con `psql` en el `PATH`.
- Git, con `core.autocrlf` en `false`.
- GitHub CLI, con sesión iniciada.
- gitleaks, que busca secretos antes de cada *commit*. El gancho de husky lo usa si está instalado, junto con el formato, el lint y la revisión de tipos.

En Windows, con PowerShell:

```
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id Gitleaks.Gitleaks -e
```

Descargue Node.js 24 desde https://nodejs.org/en/download. Instale PostgreSQL 18 desde https://www.postgresql.org/download/windows/ y agregue `C:\Program Files\PostgreSQL\18\bin` al `PATH`. Anote la contraseña que elija para el usuario `postgres`. No la escriba en el repositorio.

En macOS:

```
brew install git
brew install gh
brew install gitleaks
brew install node@24
brew install postgresql@18
brew services start postgresql@18
```

Siga el aviso de Homebrew para poner `node@24` y la carpeta `bin` de PostgreSQL en el `PATH`.

Cierre la terminal y ábrala de nuevo después de instalar.

Configure Git con su nombre y el correo de su cuenta de GitHub. Si el repositorio es privado, pida acceso al coordinador y acepte la invitación antes de clonar.

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

En ese servidor, `evidencia/CE-08/preparar-vps.sh` instala Docker Engine y el complemento Compose desde el repositorio oficial de Docker, UFW y fail2ban. Las imágenes del archivo `docker-compose.yml` son `caddy:2`, `postgres:18` y la de la aplicación en GHCR. El usuario de despliegue necesita además Git, Node.js 24 y `rclone` en el `PATH`: Git para clonar el repositorio en `~/incovsa`, y Node.js y rclone porque `scripts/respaldo.sh` los llama en el host. El script de preparación no los instala. Instálelos como root: Node.js 24 desde https://nodejs.org/en/download y rclone desde https://rclone.org/install/.

> **Pendiente de producción (versión 1.1).** INCOVSA todavía no entrega el VPS (P-10). La dirección IP y el nombre del servidor se agregan cuando exista.

## Cuentas y servicios

Hacen falta estas cuentas. Ninguna contraseña va en el repositorio.

- GitHub, con acceso al repositorio `jordin-garcia/proyecto_incovsa`, a GitHub Actions y al registro GHCR. El repositorio se transfiere a la cuenta u organización de GitHub de INCOVSA el día de la entrega (decisión 33 de la especificación).
- Cloudflare, a nombre de INCOVSA y con un correo de la empresa, para el DNS de `incovsa.com` y para R2.
- El VPS, contratado por INCOVSA a su nombre.
- El Google Drive de INCOVSA, donde ya viven las fichas técnicas, las hojas de seguridad y los certificados de análisis. La aplicación solo guarda enlaces.
- Odoo, solo como origen del archivo `.xlsx` que exporta el facturador. No hay conexión directa ni cuenta SMTP.

> **Pendiente de producción (versión 1.1).** Las cuentas del VPS, del DNS y de Cloudflare R2, y la cuenta de GitHub de INCOVSA, dependen de P-10, P-93 y P-94. El inventario de cuentas, sin credenciales, está en el Anexo J. Las credenciales se entregan por un medio seguro y separado de este manual.
