---
id: JG-01
titulo: Herramientas obligatorias del agente (Claude Code y Codex)
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-10-17
requisitos: []
pantallas: []
---

# JG-01 · Herramientas obligatorias del agente (Claude Code y Codex)

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** —

## Objetivo
Dejar el equipo de Jordin García (Windows) y su agente (Claude Code y Codex) listos para trabajar en el proyecto, con las herramientas **obligatorias** integradas y verificadas: **GitHub CLI**, **Context7** y **Playwright**, más **next-devtools** y **shadcn** (specs/16, decisión 86). **Ninguna otra tarea de Jordin García se puede empezar hasta que esta esté hecha.**

Configura **los dos** harnesses que usa Jordin: Claude Code y Codex. Cada criterio de herramientas se cumple en los dos.

## Contexto que debes leer
- `AGENTS.md` y `plan/protocolo.md` (completo)
- `plan/instalacion.md` §1 a §4 y §6.1 (Claude Code) y §6.2 (Codex)
- `plan/convenciones.md` §8 (Git y pull requests)
- `specs/16-arquitectura-y-tecnologia.md`, decisiones 70 (dónde trabajan los agentes) y 86 (herramientas obligatorias)

## Qué hacer
1. Ejecuta `node scripts/verificar-entorno.mjs`. Por cada ❌, instala lo que falta según `plan/instalacion.md` §2 y §3. Lo que requiera a la persona (un instalador con ventana, una contraseña, iniciar sesión en el navegador), **pídeselo paso a paso**, con los comandos exactos de la guía para Windows, y espera a que te confirme. No sigas hasta que todo esté en ✅.
2. **GitHub CLI:** comprueba `gh auth status` y `gh repo view jordin-garcia/proyecto_incovsa`. Si no hay sesión, pídele a la persona que ejecute `gh auth login` y `gh auth setup-git`.
3. **Context7:** pídele a la persona su clave de Context7 (`plan/instalacion.md` §1) y configúrala **en la configuración personal** del harness, nunca en un archivo del repositorio. Si la persona no tiene clave, configúralo sin el encabezado de autorización y anótalo en la bitácora.
4. **Playwright, next-devtools y shadcn:** ya vienen en la configuración del proyecto (`.mcp.json`, `.cursor/mcp.json` o `.codex/config.toml`). Actívalos o acéptalos en el harness. No modifiques esos archivos: son protegidos. Si un servidor no inicia, sigue la nota de Windows de §6.2 en la configuración personal.
5. **Modo de trabajo:** configura el modo que permite al agente editar archivos y ejecutar comandos del proyecto sin pedir permiso en cada paso, **con el aislamiento y las confirmaciones de comandos peligrosos activos**. Nunca un modo sin permisos (specs/16, decisión 70).
6. Si alguna configuración no se puede hacer desde la terminal, consulta la documentación oficial del harness con Context7 o en su sitio, y dale a la persona las instrucciones exactas, paso a paso, hasta que quede hecha.
7. Haz las comprobaciones de los criterios de aceptación y guarda su salida como evidencia.
8. Cierra la tarea según el protocolo (B9 y B10). Antes de JG-08 no hay integración automática: después de verificar, integra con `gh pr merge --squash --delete-branch`.

## Archivos que creas o modificas
- `plan/tareas/JG-01-herramientas-del-agente.md` (estado y `## Resultado`)
- `plan/bitacora/jordin.md` (entrada nueva)
- Ningún otro archivo del repositorio. La configuración del harness y de Context7 es personal y no se sube.

## Criterios de aceptación
1. `node scripts/verificar-entorno.mjs` termina con "El equipo tiene todo lo necesario." (todo en ✅).
2. `gh api user --jq .login` devuelve la cuenta de GitHub de Jordin García de la tabla de `AGENTS.md`, y `gh repo view jordin-garcia/proyecto_incovsa` funciona.
3. **Context7** responde: el agente resuelve la librería de Next.js y obtiene un fragmento de su documentación sobre Server Actions en la versión 16. Se anota en el `## Resultado` qué devolvió.
4. **Playwright** funciona: con `node scripts/servir-prototipo.mjs` corriendo, el agente abre http://127.0.0.1:4173/ con Playwright, toma una captura de la página de Inicio del prototipo y lee el título de la página.
5. Los servidores del harness aparecen registrados:
- En Claude Code: `/mcp` muestra `playwright`, `next-devtools`, `shadcn` y `context7` (este último puede ser el plugin de Context7 que Jordin ya tiene instalado).
- En Codex: `/mcp` muestra los mismos cuatro, con el proyecto marcado como confiable.
6. El agente responde correctamente "¿Qué me toca?" para Jordin García: ejecuta `node scripts/tareas.mjs --persona jordin` y resume sus tareas.
7. El modo de trabajo configurado no es un modo sin permisos, y el agente no puede leer el archivo `.env` (en Claude Code lo impide `.claude/settings.json`; en los demás, se comprueba que el aislamiento está activo).

## Pruebas obligatorias
- No hay pruebas automatizadas: la evidencia es la salida de las comprobaciones de los criterios 1 a 7, resumida en el `## Resultado`.

## Verificación
```
node scripts/verificar-entorno.mjs
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --persona jordin
```

## Fuera de alcance
- Instalar dependencias del proyecto (`npm install`): llegan con JG-02.
- Crear las bases de datos locales: se hace en la primera tarea con base de datos, según `plan/instalacion.md` §5.
- Cambiar archivos de configuración del repositorio.

## Notas
- next-devtools solo responde con `npm run dev` corriendo (desde JG-02), y shadcn necesita `components.json` (desde JG-05). En esta tarea basta con que aparezcan registrados; su prueba real ocurre en la primera tarea con pantallas.
- En el `## Resultado`, anota las versiones instaladas (Node, npm, Git, gh, PostgreSQL y el harness) y cualquier ajuste personal que haya hecho falta, para que el resto del equipo lo aproveche.

## Resultado

Equipo de Jordin García (Windows 10) listo para trabajar con **Claude Code** y **Codex**, con las cinco herramientas obligatorias registradas y verificadas. No cambió ningún archivo de configuración del repositorio: todos los ajustes son personales.

**Versiones:** Node.js 24.13.0 · npm 11.6.2 · Git 2.52.0.windows.1 · GitHub CLI 2.98.0 · PostgreSQL 18.6 · Claude Code 2.1.267 · Codex CLI 0.157.1.

**Evidencia por criterio:**
1. `node scripts/verificar-entorno.mjs`: todo en ✅ y "El equipo tiene todo lo necesario." El único aviso (`core.autocrlf`) se corrigió con la configuración de Git de `plan/instalacion.md` §3.
2. `gh api user --jq .login` → `jordin-garcia`. `gh repo view jordin-garcia/proyecto_incovsa` → repositorio privado, rama por defecto `develop`. `gh auth status`: sesión con permisos `repo`, `read:org`, `project` y `gist`.
3. **Context7.**
   - *Claude Code* (plugin): resolvió `Next.js` → `/vercel/next.js` (versiones disponibles hasta `v16.2.9`). La consulta a `/vercel/next.js/v16.2.9` sobre Server Actions devolvió fragmentos de `docs/01-app/01-getting-started/07-mutating-data.mdx` y `02-guides/forms.mdx`: función asíncrona con `'use server'`, uso como `<form action={…}>` (recibe `FormData`), comprobación de sesión dentro de la acción y `useActionState` de React 19 para el estado del formulario.
   - *Codex* (clave personal en `~/.codex/config.toml`): resolvió `/vercel/next.js/v16.2.9` y devolvió el fragmento «Declare an asynchronous function with `'use server'` at the top to define a Server Action» (`docs/01-app/02-guides/single-page-applications.mdx`).
4. **Playwright** (con `node scripts/servir-prototipo.mjs` corriendo).
   - *Claude Code*: abrió http://127.0.0.1:4173/, tomó la captura de Inicio y leyó el título `Inicio · INCOVSA` (h1: "Química que sostiene a la industria guatemalteca"). El único error de consola es el 404 de `/favicon.ico` del servidor del prototipo.
   - *Codex, en la extensión de VS Code* (el harness que usa Jordin): abrió el prototipo, tomó la captura y leyó el título. Lo comprobó Jordin. En la CLI (`codex exec`), el servidor `playwright` inicia, pero sus herramientas no le aparecen al modelo, ni siquiera con `-c 'mcp_servers.playwright.default_tools_approval_mode="approve"'`. Como Jordin no usa la CLI, no se investigó más.
5. **Claude Code** (`claude mcp list`): `playwright`, `next-devtools`, `shadcn` y `plugin:context7` → ✔ Connected. **Codex** (`codex mcp list`): `playwright`, `next-devtools`, `shadcn` y `context7` → enabled, con el proyecto `trust_level = "trusted"`.
6. "¿Qué me toca?" respondido con `node scripts/tareas.mjs --hoy` y `--persona jordin` (0/22 hechas, JG-01 como siguiente). Al cerrar esta tarea, la siguiente disponible es JG-08, porque JG-02 espera a JG-01 y a JG-08.
7. Claude Code trabaja en **modo auto** (no en un modo sin permisos). La lectura de `.env` la bloquea `.claude/settings.json` ("File is in a directory that is denied by your permission settings"). Codex tiene el aislamiento de Windows activo (`[windows] sandbox = "elevated"`) y no tiene configurado ningún modo sin aislamiento.

**Ajustes personales que hicieron falta (útiles para el resto):**
- Git global: `core.autocrlf false`, `pull.rebase true` y `core.longpaths true` (§3).
- **Claude Code no habilita solo los servidores de `.mcp.json`**: aparecen como "Pending approval" hasta que se aceptan. Se aprueban con `/mcp` o agregando `"enabledMcpjsonServers": ["playwright", "next-devtools", "shadcn"]` en `.claude/settings.local.json` (personal, ignorado por Git).
- En Codex no hizo falta la nota de Windows de §6.2: los tres servidores del proyecto quedaron habilitados sin variables extra.
- Codex CLI 0.157.1 rechaza el modelo `gpt-6.1-sol` con una cuenta de ChatGPT ("not supported when using Codex with a ChatGPT account"). Las comprobaciones por CLI se hicieron con `-m gpt-6-sol`. La extensión de VS Code no tuvo ese problema.
- `codex exec` corre con `approval: never` y rechaza las herramientas MCP que piden aprobación. Las comprobaciones con herramientas que no son de solo lectura (como Playwright) deben hacerse en la sesión interactiva o en la extensión.

**Cómo usarlo:** las tareas siguientes de Jordin ya pueden empezar (B0 del protocolo se cumple). next-devtools se prueba de verdad con `npm run dev` desde JG-02, y shadcn con `components.json` desde JG-05.
