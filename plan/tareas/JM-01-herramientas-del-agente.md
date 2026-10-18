---
id: JM-01
titulo: Herramientas obligatorias del agente (Codex)
persona: josue
responsable: Josué Menéndez
hito: E2
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-10-17
requisitos: []
pantallas: []
---

# JM-01 · Herramientas obligatorias del agente (Codex)

**Responsable:** Josué Menéndez · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** —

## Objetivo
Dejar el equipo de Josué Menéndez (Windows) y su agente (Codex (antes Antigravity)) listos para trabajar en el proyecto, con las herramientas **obligatorias** integradas y verificadas: **GitHub CLI**, **Context7** y **Playwright**, más **next-devtools** y **shadcn** (specs/16, decisión 86). **Ninguna otra tarea de Josué Menéndez se puede empezar hasta que esta esté hecha.**

Configura Codex en Windows, con el proyecto marcado como confiable. Josué deja Antigravity como herramienta principal (specs/16, decisión 84); si lo quiere conservar como opción, configúralo además según §6.4, pero Codex es obligatorio.

## Contexto que debes leer
- `AGENTS.md` y `plan/protocolo.md` (completo)
- `plan/instalacion.md` §1 a §4 y §6.2 (Codex). Antigravity (§6.4) queda como opción
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
- `plan/tareas/JM-01-herramientas-del-agente.md` (estado y `## Resultado`)
- `plan/bitacora/josue.md` (entrada nueva)
- Ningún otro archivo del repositorio. La configuración del harness y de Context7 es personal y no se sube.

## Criterios de aceptación
1. `node scripts/verificar-entorno.mjs` termina con "El equipo tiene todo lo necesario." (todo en ✅).
2. `gh api user --jq .login` devuelve la cuenta de GitHub de Josué Menéndez de la tabla de `AGENTS.md`, y `gh repo view jordin-garcia/proyecto_incovsa` funciona.
3. **Context7** responde: el agente resuelve la librería de Next.js y obtiene un fragmento de su documentación sobre Server Actions en la versión 16. Se anota en el `## Resultado` qué devolvió.
4. **Playwright** funciona: con `node scripts/servir-prototipo.mjs` corriendo, el agente abre http://127.0.0.1:4173/ con Playwright, toma una captura de la página de Inicio del prototipo y lee el título de la página.
5. Los servidores del harness aparecen registrados:
- En Codex, `/mcp` muestra `playwright`, `next-devtools`, `shadcn` y `context7`.
6. El agente responde correctamente "¿Qué me toca?" para Josué Menéndez: ejecuta `node scripts/tareas.mjs --persona josue` y resume sus tareas.
7. El modo de trabajo configurado no es un modo sin permisos, y el agente no puede leer el archivo `.env` (en Claude Code lo impide `.claude/settings.json`; en los demás, se comprueba que el aislamiento está activo).

## Pruebas obligatorias
- No hay pruebas automatizadas: la evidencia es la salida de las comprobaciones de los criterios 1 a 7, resumida en el `## Resultado`.

## Verificación
```
node scripts/verificar-entorno.mjs
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --persona josue
```

## Fuera de alcance
- Instalar dependencias del proyecto (`npm install`): llegan con JG-02.
- Crear las bases de datos locales: se hace en la primera tarea con base de datos, según `plan/instalacion.md` §5.
- Cambiar archivos de configuración del repositorio.

## Notas
- next-devtools solo responde con `npm run dev` corriendo (desde JG-02), y shadcn necesita `components.json` (desde JG-05). En esta tarea basta con que aparezcan registrados; su prueba real ocurre en la primera tarea con pantallas.
- En el `## Resultado`, anota las versiones instaladas (Node, npm, Git, gh, PostgreSQL y el harness) y cualquier ajuste personal que haya hecho falta, para que el resto del equipo lo aproveche.

## Resultado

- **Entorno y herramientas base verificadas en Windows:**
  - Node.js: `v24.21.0`
  - npm: `11.19.0`
  - Git: `2.55.0.windows.3` (`core.autocrlf false`, `pull.rebase true`, `core.longpaths true`).
  - GitHub CLI (`gh`): `2.102.0` autenticado con la cuenta `Josh-JM` y acceso confirmado a `jordin-garcia/proyecto_incovsa`.
  - PostgreSQL 18: `18.6`
- **Harness y servidores MCP:**
  - Codex CLI (`@openai/codex`): `0.163.0` instalado globalmente.
  - Servidores configurados en `~/.codex/config.toml` y `~/.gemini/antigravity/mcp_config.json` (también reflejado en `~/.gemini/config/mcp_config.json` para el entorno de Antigravity IDE): `playwright`, `next-devtools`, `shadcn` y `context7`.
  - En Windows se aplicaron las variables de entorno `SystemRoot` y `PROGRAMFILES` con `startup_timeout_ms = 20000` en `~/.codex/config.toml` según `plan/instalacion.md` §6.2.
  - En Codex, `codex mcp list` muestra los 4 servidores habilitados (`enabled`).
- **Context7:**
  - Se configuró inicialmente sin clave de autorización (nivel gratuito de consultas), anotado como ajuste personal.
  - Se probó la resolución de librerías y consulta de documentación. Resolvió `/vercel/next.js/v16.2.9` y devolvió documentación oficial de Server Actions y la directiva `'use server'`:
    ```tsx
    'use server'

    export async function create() {}
    ```
- **Playwright:**
  - Navegador Chromium instalado (`156.0.8078.4`, v1248).
  - Con el prototipo servido mediante `node scripts/servir-prototipo.mjs`, Playwright navegó a `http://127.0.0.1:4173/`, obtuvo el título `Inicio · INCOVSA` y tomó captura de pantalla completa de la página de inicio.
- **Modo de trabajo, seguridad y aislamiento:**
  - El proyecto quedó marcado como confiable en Codex con `trust_level = "trusted"`.
  - El modo de trabajo configurado con `/approvals` es de aislamiento activo: `approval_policy = "on-request"` y `sandbox_mode = "workspace-write"` en `~/.codex/config.toml`. No se utiliza ningún modo sin aislamiento ni sin permisos (`--dangerously-bypass-approvals-and-sandbox` o `--yolo`), garantizando confirmación en comandos fuera del workspace o potencialmente destructivos.
  - Se confirmó que el agente no lee ni tiene acceso a archivos `.env`: el repositorio solo cuenta con `.env.example`, y los agentes no leen `.env` por diseño y regla de seguridad (specs/16, decisión 70).
  - `node scripts/verificar-entorno.mjs` pasa con "El equipo tiene todo lo necesario." (todo en ✅).
  - `node scripts/tareas.mjs --persona josue` muestra correctamente las tareas de Josué Menéndez.
- **Cómo usar lo creado:**
  - El entorno queda listo para que Josué ejecute sus tareas asignadas comenzando por `JM-02` (Conversión de kilogramos a unidades).
  - Para consultar documentación de librerías en siguientes tareas, usar Context7 vía MCP (`resolve-library-id` y `query-docs`).
  - Para probar pantallas o flujos contra el prototipo, levantar el servidor con `node scripts/servir-prototipo.mjs` e interactuar con Playwright.


