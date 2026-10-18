---
id: CE-01
titulo: Herramientas obligatorias del agente (Cursor)
persona: carlos
responsable: Carlos Hugo Escobar
hito: E2
prioridad: P1
estado: bloqueada
bloqueo: En Cursor Cloud Agent, `gh` usa el token de la App `cursor[bot]` (GraphQL viewer = `cursor[bot]`); `gh api user` responde 403 y no puede devolver `carloshugoeg`. Carlos debe ejecutar `gh auth login` como `carloshugoeg` en su Mac (Cursor local) o aportar un PAT de usuario (`GH_TOKEN`) para que `verificar-entorno` y el criterio 2 pasen. El resto de herramientas ya están listas en este entorno.
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

**Estado:** bloqueada (falta sesión de GitHub CLI como `carloshugoeg`). Trabajo hecho en el entorno de **Cursor Cloud Agent** (Linux), no en la Mac local de Carlos; la guía de macOS de `plan/instalacion.md` §2 sigue siendo la referencia para su máquina personal.

### Versiones en el Cloud Agent
- Node.js **24.22.0** (nvm + enlaces en `/usr/local/bin` y `~/.local/bin`; el `node` del PATH del agente antes era 22.14.0)
- npm **11.19.1**
- Git **2.43.0** · `user.name=Hugo Escobar` · `user.email=chescobarg@correo.url.edu.gt` · `core.autocrlf=false` · `pull.rebase=true`
- GitHub CLI **2.102.0** · autenticado como App `cursor[bot]` (GraphQL `viewer.login` = `cursor[bot]`); `gh api user` → 403
- PostgreSQL **18.6** (`psql` y servidor local en el puerto 5432)
- Harness: **Cursor Cloud Agent** (modo agente; sin modo sin permisos)

### Evidencia por criterio
1. `node scripts/verificar-entorno.mjs`: Node, npm, Git, gh (instalado), acceso al repo, PostgreSQL 18 y `core.autocrlf` en ✅. **Único ❌:** «GitHub CLI con sesión iniciada» porque `gh api user` falla con el token de la App.
2. `gh api user --jq .login` **no** puede devolver `carloshugoeg` con el token Cloud (`cursor[bot]`). `gh repo view jordin-garcia/proyecto_incovsa` sí funciona.
3. **Context7** (sin clave API, configuración personal `~/.cursor/mcp.json` solo con `url`): resolvió Next.js → `/vercel/next.js` (versiones hasta `v16.2.9`). `query-docs` sobre Server Actions en `/vercel/next.js/v16.2.9` devolvió fragmentos de `docs/01-app/01-getting-started/07-mutating-data.mdx` y `02-guides/forms.mdx`: `<form action={createPost}>`, acción async con `'use server'`, comprobación de sesión y `useActionState`.
4. **Playwright:** con `node scripts/servir-prototipo.mjs` en http://127.0.0.1:4173/, captura de Inicio → título `Inicio · INCOVSA`, h1 «Química que sostiene a la industria guatemalteca». Evidencia en el store del proyecto: `media/ce-01/prototipo-inicio.png`.
5. MCP del proyecto (`.cursor/mcp.json`): `playwright`, `next-devtools`, `shadcn` presentes. `context7` en configuración personal. En Cloud Agent no hay UI de «punto verde»; en la Mac, Carlos debe activarlos en Cursor Settings → MCP.
6. `node scripts/tareas.mjs --persona carlos` y `--hoy carlos` responden: CE-01 atrasada; siguientes CE-02/CE-03 (hoy, esperan CE-01 y JG-07) y CE-05 disponible el 21/10.
7. Modo agente con aislamiento (no modo sin permisos). `.env` no existe; `.cursorignore` y `.gitignore` bloquean `.env*`.

### Cómo desbloquear (Carlos, en Mac o con PAT)
1. En Terminal (Mac): `gh auth login` → GitHub.com → HTTPS → navegador, con la cuenta **`carloshugoeg`**. Luego `gh auth setup-git`.
2. O en el Cloud Agent: exportar `GH_TOKEN` con un PAT clásico/fine-grained de `carloshugoeg` que permita `gh api user`.
3. Comprobar: `gh api user --jq .login` → `carloshugoeg` y `node scripts/verificar-entorno.mjs` → «El equipo tiene todo lo necesario.»
4. En Cursor (Mac): Settings → MCP → punto verde en `playwright`, `next-devtools`, `shadcn` (proyecto) y `context7` (personal; clave opcional en https://context7.com/dashboard).
5. Reabrir la tarea en una conversación nueva: quitar `bloqueo`, poner `estado: hecha` y actualizar este Resultado.

### Cómo usarlo
Hasta desbloquear, **ninguna otra tarea de Carlos** (CE-02…) debe empezarse (B0). Node 24, npm 11.19+, PostgreSQL 18, Context7, Playwright y el prototipo ya están operativos en este Cloud Agent.
