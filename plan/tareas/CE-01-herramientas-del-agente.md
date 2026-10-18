---
id: CE-01
titulo: Herramientas obligatorias del agente (Cursor)
persona: carlos
responsable: Carlos Hugo Escobar
hito: E2
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-10-17
requisitos: []
pantallas: []
---

# CE-01 · Herramientas obligatorias del agente (Cursor)

**Responsable:** Carlos Hugo Escobar · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** —

## Objetivo
Dejar el equipo de Carlos Hugo Escobar (macOS) y su agente (Cursor) listos para trabajar en el proyecto, con las herramientas **obligatorias** integradas y verificadas: **GitHub CLI**, **Context7** y **Playwright**, más **next-devtools** y **shadcn** (specs/16, decisión 86). **Ninguna otra tarea de Carlos Hugo Escobar se puede empezar hasta que esta esté hecha.**

Configura Cursor en macOS. Usa la columna macOS de `plan/instalacion.md` §2.

## Contexto que debes leer
- `AGENTS.md` y `plan/protocolo.md` (completo)
- `plan/instalacion.md` §1 a §4 y §6.3 (Cursor)
- `plan/convenciones.md` §8 (Git y pull requests)
- `specs/16-arquitectura-y-tecnologia.md`, decisiones 70 (dónde trabajan los agentes) y 86 (herramientas obligatorias)

## Qué hacer
1. Ejecuta `node scripts/verificar-entorno.mjs`. Por cada ❌, instala lo que falta según `plan/instalacion.md` §2 y §3. Lo que requiera a la persona (un instalador con ventana, una contraseña, iniciar sesión en el navegador), **pídeselo paso a paso**, con los comandos exactos de la guía para macOS, y espera a que te confirme. No sigas hasta que todo esté en ✅.
2. **GitHub CLI:** comprueba `gh auth status` y `gh repo view jordin-garcia/proyecto_incovsa`. Si no hay sesión, pídele a la persona que ejecute `gh auth login` y `gh auth setup-git`.
3. **Context7:** pídele a la persona su clave de Context7 (`plan/instalacion.md` §1) y configúrala **en la configuración personal** del harness, nunca en un archivo del repositorio. Si la persona no tiene clave, configúralo sin el encabezado de autorización y anótalo en la bitácora.
4. **Playwright, next-devtools y shadcn:** ya vienen en la configuración del proyecto (`.mcp.json`, `.cursor/mcp.json` o `.codex/config.toml`). Actívalos o acéptalos en el harness. No modifiques esos archivos: son protegidos. Si un servidor no inicia, sigue la nota de Windows de §6.2 en la configuración personal.
5. **Modo de trabajo:** configura el modo que permite al agente editar archivos y ejecutar comandos del proyecto sin pedir permiso en cada paso, **con el aislamiento y las confirmaciones de comandos peligrosos activos**. Nunca un modo sin permisos (specs/16, decisión 70).
6. Si alguna configuración no se puede hacer desde la terminal, consulta la documentación oficial del harness con Context7 o en su sitio, y dale a la persona las instrucciones exactas, paso a paso, hasta que quede hecha.
7. Haz las comprobaciones de los criterios de aceptación y guarda su salida como evidencia.
8. Cierra la tarea según el protocolo (B9 y B10). Antes de JG-08 no hay integración automática: después de verificar, integra con `gh pr merge --squash --delete-branch`.

## Archivos que creas o modificas
- `plan/tareas/CE-01-herramientas-del-agente.md` (estado y `## Resultado`)
- `plan/bitacora/carlos.md` (entrada nueva)
- Ningún otro archivo del repositorio. La configuración del harness y de Context7 es personal y no se sube.

## Criterios de aceptación
1. `node scripts/verificar-entorno.mjs` termina con "El equipo tiene todo lo necesario." (todo en ✅).
2. `gh api user --jq .login` devuelve la cuenta de GitHub de Carlos Hugo Escobar de la tabla de `AGENTS.md`, y `gh repo view jordin-garcia/proyecto_incovsa` funciona.
3. **Context7** responde: el agente resuelve la librería de Next.js y obtiene un fragmento de su documentación sobre Server Actions en la versión 16. Se anota en el `## Resultado` qué devolvió.
4. **Playwright** funciona: con `node scripts/servir-prototipo.mjs` corriendo, el agente abre http://127.0.0.1:4173/ con Playwright, toma una captura de la página de Inicio del prototipo y lee el título de la página.
5. Los servidores del harness aparecen registrados:
- En Cursor Settings → MCP aparecen `playwright`, `next-devtools` y `shadcn` del proyecto y `context7` de la configuración personal, con el punto verde (next-devtools y shadcn pueden quedar registrados sin conexión hasta JG-02 y JG-05).
6. El agente responde correctamente "¿Qué me toca?" para Carlos Hugo Escobar: ejecuta `node scripts/tareas.mjs --persona carlos` y resume sus tareas.
7. El modo de trabajo configurado no es un modo sin permisos, y el agente no puede leer el archivo `.env` (en Claude Code lo impide `.claude/settings.json`; en los demás, se comprueba que el aislamiento está activo).

## Pruebas obligatorias
- No hay pruebas automatizadas: la evidencia es la salida de las comprobaciones de los criterios 1 a 7, resumida en el `## Resultado`.

## Verificación
```
node scripts/verificar-entorno.mjs
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --persona carlos
```

## Fuera de alcance
- Instalar dependencias del proyecto (`npm install`): llegan con JG-02.
- Crear las bases de datos locales: se hace en la primera tarea con base de datos, según `plan/instalacion.md` §5.
- Cambiar archivos de configuración del repositorio.

## Notas
- next-devtools solo responde con `npm run dev` corriendo (desde JG-02), y shadcn necesita `components.json` (desde JG-05). En esta tarea basta con que aparezcan registrados; su prueba real ocurre en la primera tarea con pantallas.
- En el `## Resultado`, anota las versiones instaladas (Node, npm, Git, gh, PostgreSQL y el harness) y cualquier ajuste personal que haya hecho falta, para que el resto del equipo lo aproveche.

## Resultado

**Estado:** hecha. Cerrada en **Cursor local en la Mac de Carlos** (macOS 26.6.2, arm64), con identidad GitHub `carloshugoeg`, según la decisión del coordinador (18/10) y la decisión 70 de `specs/16`. El trabajo previo en Cursor Cloud Agent quedó solo como contexto; el entorno válido es esta Mac.

### Versiones en la Mac (Hugo's MacBook Pro)
- Node.js **24.22.0** (`brew install node@24`; PATH: `/opt/homebrew/opt/node@24/bin` en `~/.zshrc`; el `node` global de Homebrew seguía en 26.9.0)
- npm **11.19.1**
- Git **2.50.1 (Apple Git-155)** · `user.name=Hugo Escobar` · `user.email=chescobarg@correo.url.edu.gt` · `core.autocrlf=false` · `pull.rebase=true`
- GitHub CLI **2.97.0** · `gh api user --jq .login` → **`carloshugoeg`** (keyring; scopes `repo`, `read:org`, `gist`, `admin:public_key`) · `gh auth setup-git` OK
- PostgreSQL **18.6** (`psql`; `brew services start postgresql@18`)
- Harness: **Cursor** (local, macOS) · modo agente con aislamiento; sin modo sin permisos
- Repo local: `/Users/carloshugoeg/Projects/proyecto_incovsa` (clon fresco de `develop`)

### Evidencia por criterio
1. `node scripts/verificar-entorno.mjs` → «El equipo tiene todo lo necesario.» (todo ✅: Node 24.22.0, npm 11.19.1, Git, gh, sesión `carloshugoeg`, acceso al repo, PostgreSQL 18, `core.autocrlf=false`).
2. `gh api user --jq .login` → `carloshugoeg`. `gh repo view jordin-garcia/proyecto_incovsa` → OK.
3. **Context7** (configuración personal `~/.cursor/mcp.json`, URL `https://mcp.context7.com/mcp`, sin clave API): `resolve-library-id` → `/vercel/next.js` (versiones hasta `v16.2.9`). `query-docs` en `/vercel/next.js/v16.2.9` sobre Server Actions devolvió fragmentos de `docs/01-app/02-guides/forms.mdx` y `03-api-reference/02-components/form.mdx`: `<form action={createInvoice}>` / `<Form action={createPost}>`, acción async con `'use server'`, comprobación de sesión (`auth()`), y `FormData`.
4. **Playwright:** con `node scripts/servir-prototipo.mjs` en http://127.0.0.1:4173/, captura de Inicio → título `Inicio · INCOVSA`, h1 «Química que sostiene a la industria guatemalteca». Evidencia: store del proyecto `media/ce-01/prototipo-inicio-mac.png` (y la captura previa del Cloud Agent en `media/ce-01/prototipo-inicio.png`).
5. MCP del proyecto (`.cursor/mcp.json`): `playwright`, `next-devtools`, `shadcn`. `context7` en configuración personal. Registrados en Cursor; next-devtools/shadcn pueden quedar sin conexión hasta JG-02/JG-05 (nota de la tarea).
6. `node scripts/tareas.mjs --persona carlos` y `--hoy carlos`: CE-01 era la única bloqueada; tras el cierre, CE-02/CE-03 siguen esperando JG-07; CE-05 disponible el 21/10.
7. Modo agente con aislamiento (no modo sin permisos). `.env` no existe en el clon; `.cursorignore` y `.gitignore` bloquean `.env*`.

### Cómo usarlo
B0 queda satisfecho para Carlos: las siguientes tareas CE pueden empezar cuando sus dependencias lo permitan. Trabajar siempre en **Cursor local en esta Mac** con `gh` como `carloshugoeg` (no Cloud Agent para tareas CE). Abrir el repo en `/Users/carloshugoeg/Projects/proyecto_incovsa`.
