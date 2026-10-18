# Instalación: lo que cada integrante hace una sola vez

Tu agente sigue esta guía en tu primera tarea (`JG-01`, `CE-01`, `DM-01`, `JM-01` o `JC-01`). Lo que el agente no pueda hacer solo (instaladores con ventana, iniciar sesión en el navegador, aceptar permisos), te lo pedirá paso a paso. Usa la columna de tu sistema: **Windows** (Jordin, Daniela y Josué) o **macOS** (Carlos Hugo y José Daniel).

---

## 1. Cuentas

- [ ] **GitHub:** tu cuenta ya es colaboradora de `jordin-garcia/proyecto_incovsa`. Si ves una invitación pendiente en https://github.com/notifications, acéptala.
- [ ] **Tu agente de IA:** Claude (Jordin), ChatGPT para Codex (Jordin, Daniela, Josué y José Daniel), Cursor (Carlos Hugo). Antigravity (cuenta de Google) queda configurado como opción para cualquiera.
- [ ] **Context7:** crea una cuenta gratuita en https://context7.com/dashboard y genera tu clave de API (*API key*). Es personal: no la compartas ni la subas al repositorio. Sin clave también funciona, con menos consultas por día.

## 2. Herramientas base

| Herramienta | Windows (PowerShell) | macOS (Terminal) |
|---|---|---|
| **Homebrew** (solo macOS) | — | Sigue https://brew.sh |
| **Git** | `winget install --id Git.Git -e` | `brew install git` |
| **GitHub CLI** | `winget install --id GitHub.cli -e` | `brew install gh` |
| **Node.js 24 LTS** (exactamente la 24, con **npm 11.19 o posterior**: la 24.21 o una más nueva ya lo trae; si no, `npm i -g npm@11.19.0`) | Descarga el instalador de la versión 24 en https://nodejs.org/en/download | `brew install node@24` y sigue el aviso de Homebrew para agregarlo al `PATH` |
| **PostgreSQL 18** | Instalador oficial en https://www.postgresql.org/download/windows/ (versión 18). Anota la contraseña del usuario `postgres` y agrega `C:\Program Files\PostgreSQL\18\bin` al `PATH` | `brew install postgresql@18`, luego `brew services start postgresql@18` y agrega su carpeta `bin` al `PATH` como indica Homebrew |
| **Editor (opcional)** | VS Code: `winget install --id Microsoft.VisualStudioCode -e` | `brew install --cask visual-studio-code` |

**Después de instalar, cierra y vuelve a abrir la terminal** para que se actualice el `PATH`.

## 3. Configurar Git y GitHub

```bash
git config --global user.name "Tu Nombre Completo"
git config --global user.email "el-correo-de-tu-cuenta-de-github"
git config --global core.autocrlf false
git config --global pull.rebase true
gh auth login          # GitHub.com → HTTPS → Login with a web browser
gh auth setup-git
```
Solo en Windows: `git config --global core.longpaths true`.

**Avisos por correo (specs/16, decisión 87).** Los avisos del plan (tus tareas de cada día, las tareas que se desbloquean y los rechazos del bot) llegan como notificaciones de GitHub. Para recibirlos por correo:
1. En https://github.com/settings/notifications, en "Participating, @mentions and custom", marca **Email**.
2. En el repositorio, botón **Watch** → **Participating and @mentions** (o **All Activity** si quieres todo).
3. Comprueba que el correo de tu cuenta de GitHub sea uno que revisas (https://github.com/settings/emails).

## 4. Clonar el repositorio y verificar el equipo

```bash
cd <la carpeta donde guardas tus proyectos>
gh repo clone jordin-garcia/proyecto_incovsa
cd proyecto_incovsa
node scripts/verificar-entorno.mjs
```
Todo debe aparecer con ✅. Si algo falla, el mismo script dice qué instalar.

## 5. Base de datos local y la aplicación

> Funciona **a medida que se terminan** JG-02 (proyecto base) y JG-03 (esquema y semillas). Antes no hay nada que levantar.

1. Crea las dos bases de datos locales (pide la contraseña de `postgres` que elegiste al instalar):
   ```bash
   psql -U postgres -c "CREATE DATABASE incovsa;"
   psql -U postgres -c "CREATE DATABASE incovsa_pruebas;"
   ```
   En macOS con Homebrew, el usuario es el tuyo: `psql postgres -c "CREATE DATABASE incovsa;"`.
2. Copia `.env.example` a `.env` (PowerShell: `Copy-Item .env.example .env`; macOS: `cp .env.example .env`) y **tú** escribe en `.env` el usuario y la contraseña de tu PostgreSQL. Los agentes no leen `.env` (specs/16, decisión 70).
3. Instala y prepara:
   ```bash
   npm ci
   npx playwright install --with-deps chromium firefox webkit
   npm run db:aplicar
   npm run db:semilla
   npm run semilla:demo
   npm run dev
   ```
4. Abre http://localhost:3000. Las cuentas de ejemplo (`ejemplo.01` a `ejemplo.11`, las del prototipo) usan la contraseña que tú pones en `CLAVE_DEMO` dentro de `.env`.

## 6. Agente de IA y herramientas obligatorias

Todos los agentes leen `AGENTS.md` solos. Las herramientas **obligatorias** son: **GitHub CLI**, **Context7** y **Playwright**. Además se instalan **next-devtools** (errores de Next.js) y **shadcn** (componentes). Los servidores de Playwright, next-devtools y shadcn ya vienen en la configuración del proyecto para Claude Code (`.mcp.json`), Cursor (`.cursor/mcp.json`) y Codex (`.codex/config.toml`). **Context7 va en tu configuración personal**, porque lleva tu clave.

> **Nunca** uses los modos sin permisos (`--dangerously-skip-permissions`, `--yolo` u otros que desactiven las confirmaciones y el aislamiento). En Windows, el aislamiento de comandos de Claude Code no funciona: por eso el proyecto bloquea la lectura de `.env` (specs/16, decisión 70).

### 6.1 Claude Code (Jordin)
1. Instalar: Windows `irm https://claude.ai/install.ps1 | iex` · macOS `curl -fsSL https://claude.ai/install.sh | bash`.
2. Dentro de `proyecto_incovsa`, ejecuta `claude` e inicia sesión. Acepta los servidores MCP del proyecto cuando lo pregunte.
3. Context7 (si no lo tienes ya como plugin):
   ```bash
   claude mcp add --scope user --header "Authorization: Bearer <TU_CLAVE>" --transport http context7 https://mcp.context7.com/mcp
   ```
4. Comprueba con `/mcp` que `playwright`, `next-devtools`, `shadcn` y `context7` aparecen conectados.
5. Modo de trabajo: **modo auto** (`Shift+Tab` hasta que diga *auto mode*). El proyecto ya trae `CLAUDE.md`, los permisos de `.claude/settings.json` y el subagente `revisor`.

### 6.2 Codex (Jordin, Daniela, Josué y José Daniel)
1. Instalar: `npm install -g @openai/codex` (o el instalador oficial de https://github.com/openai/codex).
2. Dentro de `proyecto_incovsa`, ejecuta `codex`, inicia sesión con tu cuenta de ChatGPT y **marca el proyecto como confiable**: solo así lee `.codex/config.toml` con los servidores del proyecto.
3. Context7 en tu configuración personal, `~/.codex/config.toml` (Windows: `C:\Users\<tú>\.codex\config.toml`):
   ```toml
   [mcp_servers.context7]
   url = "https://mcp.context7.com/mcp"
   http_headers = { "Authorization" = "Bearer <TU_CLAVE>" }
   ```
4. **Solo Windows:** si `next-devtools` o `playwright` no inician, agrega a cada uno, en `~/.codex/config.toml`, las variables que pide la documentación de next-devtools-mcp:
   ```toml
   [mcp_servers.next-devtools]
   command = "npx"
   args = ["-y", "next-devtools-mcp@latest"]
   env = { SystemRoot = "C:\\Windows", PROGRAMFILES = "C:\\Program Files" }
   startup_timeout_ms = 20000
   ```
5. Comprueba con `/mcp` que los cuatro servidores aparecen.
6. Modo de trabajo: con `/approvals`, el modo que permite **editar archivos y ejecutar comandos en la carpeta del proyecto con el aislamiento activo y acceso a la red** (lo necesitan `gh` y `npm`). Nunca el modo sin aislamiento.

### 6.3 Cursor (Carlos Hugo)
1. Instala Cursor desde https://cursor.com y abre la carpeta `proyecto_incovsa`.
2. En **Cursor Settings → MCP**, activa los servidores del proyecto (`playwright`, `next-devtools`, `shadcn`, de `.cursor/mcp.json`).
3. Context7 en tu configuración personal, `~/.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "context7": {
         "url": "https://mcp.context7.com/mcp",
         "headers": { "Authorization": "Bearer <TU_CLAVE>" }
       }
     }
   }
   ```
4. Comprueba que los cuatro servidores tienen el punto verde.
5. Modo de trabajo: **modo agente**, con ejecución automática de comandos en este proyecto y el aislamiento de macOS activado. Nunca la opción que ejecuta todo sin aislamiento.

### 6.4 Google Antigravity (opcional para cualquiera)
1. Instala Antigravity desde https://antigravity.google, inicia sesión con tu cuenta de Google y abre la carpeta `proyecto_incovsa`. Lee `AGENTS.md` solo.
2. Agrega los servidores en la configuración MCP de Antigravity (archivo `.gemini/antigravity/mcp_config.json` de tu carpeta personal; guía: https://antigravity.google/docs/mcp). Antigravity usa `serverUrl` para los servidores remotos:
   ```json
   {
     "mcpServers": {
       "context7": { "serverUrl": "https://mcp.context7.com/mcp", "headers": { "Authorization": "Bearer <TU_CLAVE>" } },
       "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
       "next-devtools": { "command": "npx", "args": ["-y", "next-devtools-mcp@latest"] },
       "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }
     }
   }
   ```
3. Modo de trabajo: permite que ejecute comandos de terminal en este proyecto, sin desactivar las confirmaciones de los comandos peligrosos.

### 6.5 Comprobación final
Dentro de `proyecto_incovsa`, escríbele a tu agente:
> Soy <tu nombre>. Revisa el plan y dime qué tareas me tocan.

Debe ejecutar `node scripts/tareas.mjs --persona <tu-clave>` y mostrarte tus tareas.

> **next-devtools** solo responde con la aplicación levantada (`npm run dev`, desde JG-02), y **shadcn** necesita `components.json` (desde JG-05). Hasta entonces, basta con que aparezcan registrados.

---

## 7. Lo que solo hace el coordinador

- [ ] `gh` autenticado con la cuenta administradora del repositorio (JG-08 activa la integración automática, la protección de `develop` y `main` y el permiso de GitHub Actions para aprobar PR).
- [ ] Para el bot de revisión (JG-08): ejecutar `claude setup-token` y guardar el token con `gh secret set CLAUDE_CODE_OAUTH_TOKEN`. Sirve para todos los PR del equipo y se descuenta de tu plan de Claude.
