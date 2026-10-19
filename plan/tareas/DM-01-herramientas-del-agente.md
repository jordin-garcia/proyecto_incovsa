---
id: DM-01
titulo: Herramientas obligatorias del agente (Codex)
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-10-17
requisitos: []
pantallas: []
---

# DM-01 · Herramientas obligatorias del agente (Codex)

**Responsable:** Daniela Marín · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** —

## Objetivo
Dejar el equipo de Daniela Marín (Windows) y su agente (Codex) listos para trabajar en el proyecto, con las herramientas **obligatorias** integradas y verificadas: **GitHub CLI**, **Context7** y **Playwright**, más **next-devtools** y **shadcn** (specs/16, decisión 86). **Ninguna otra tarea de Daniela Marín se puede empezar hasta que esta esté hecha.**

Configura Codex en Windows, con el proyecto marcado como confiable.

## Contexto que debes leer
- `AGENTS.md` y `plan/protocolo.md` (completo)
- `plan/instalacion.md` §1 a §4 y §6.2 (Codex)
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
- `plan/tareas/DM-01-herramientas-del-agente.md` (estado y `## Resultado`)
- `plan/bitacora/daniela.md` (entrada nueva)
- Ningún otro archivo del repositorio. La configuración del harness y de Context7 es personal y no se sube.

## Criterios de aceptación
1. `node scripts/verificar-entorno.mjs` termina con "El equipo tiene todo lo necesario." (todo en ✅).
2. `gh api user --jq .login` devuelve la cuenta de GitHub de Daniela Marín de la tabla de `AGENTS.md`, y `gh repo view jordin-garcia/proyecto_incovsa` funciona.
3. **Context7** responde: el agente resuelve la librería de Next.js y obtiene un fragmento de su documentación sobre Server Actions en la versión 16. Se anota en el `## Resultado` qué devolvió.
4. **Playwright** funciona: con `node scripts/servir-prototipo.mjs` corriendo, el agente abre http://127.0.0.1:4173/ con Playwright, toma una captura de la página de Inicio del prototipo y lee el título de la página.
5. Los servidores del harness aparecen registrados:
- En Codex, `/mcp` muestra `playwright`, `next-devtools`, `shadcn` y `context7`.
6. El agente responde correctamente "¿Qué me toca?" para Daniela Marín: ejecuta `node scripts/tareas.mjs --persona daniela` y resume sus tareas.
7. El modo de trabajo configurado no es un modo sin permisos, y el agente no puede leer el archivo `.env` (en Claude Code lo impide `.claude/settings.json`; en los demás, se comprueba que el aislamiento está activo).

## Pruebas obligatorias
- No hay pruebas automatizadas: la evidencia es la salida de las comprobaciones de los criterios 1 a 7, resumida en el `## Resultado`.

## Verificación
```
node scripts/verificar-entorno.mjs
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --persona daniela
```

## Fuera de alcance
- Instalar dependencias del proyecto (`npm install`): llegan con JG-02.
- Crear las bases de datos locales: se hace en la primera tarea con base de datos, según `plan/instalacion.md` §5.
- Cambiar archivos de configuración del repositorio.

## Notas
- next-devtools solo responde con `npm run dev` corriendo (desde JG-02), y shadcn necesita `components.json` (desde JG-05). En esta tarea basta con que aparezcan registrados; su prueba real ocurre en la primera tarea con pantallas.
- En el `## Resultado`, anota las versiones instaladas (Node, npm, Git, gh, PostgreSQL y el harness) y cualquier ajuste personal que haya hecho falta, para que el resto del equipo lo aproveche.

## Resultado

Comprobaciones realizadas el 18/10/2026 para Daniela Marín (`InAlexa`):

- Entorno: Node.js 24.22.0, npm 11.19.1, Git 2.49.0.windows.1, GitHub CLI 2.102.0 y PostgreSQL 18.1. `node scripts/verificar-entorno.mjs` terminó con «El equipo tiene todo lo necesario.». Harness: Codex CLI 0.163.0-alpha.10.2, invocado desde Codex de escritorio.
- GitHub: `gh api user --jq .login` devolvió `InAlexa` y `gh repo view jordin-garcia/proyecto_incovsa` confirmó el acceso. El remoto local usa HTTPS y `gh auth setup-git`, porque SSH rechazaba la autenticación. Git quedó configurado localmente con `core.autocrlf=false` y `core.longpaths=true`.
- Context7: resolvió Next.js como `/vercel/next.js`; la consulta de `/vercel/next.js/v16.2.9` devolvió documentación de Server Actions: función asíncrona con `'use server'`, comprobación de sesión y conexión del formulario mediante `action`. No se cambió ninguna dependencia del proyecto.
- Playwright MCP: abrió el prototipo servido con `node scripts/servir-prototipo.mjs` en `http://127.0.0.1:4173/`, leyó el título «Inicio · INCOVSA» y el encabezado «Química que sostiene a la industria guatemalteca», y guardó una captura de Inicio en 1440 × 900. Evidencia local: `C:/Users/danie/.codex/visualizations/2026/10/19/01a1528e-1e4f-75d1-8230-0315cb4dcb9f/DM-01-inicio.png`. Se verificó visualmente. La consola solo notificó un 404 de `favicon.ico`.
- Registro: `codex mcp list` mostró habilitados `context7`, `playwright`, `next-devtools` y `shadcn`. Conforme a las notas de esta tarea, se comprobó el registro de los dos últimos; su uso con la aplicación corresponde a la primera tarea con pantallas.
- Plan: `node scripts/tareas.mjs --validar` confirmó «Plan válido: 62 tareas.». Se ejecutaron `--persona daniela` y `--hoy daniela`: DM-01 era la única disponible; al integrarla se desbloquean DM-02 y DM-04. DM-03 depende de DM-02 y DM-05 de DM-03 y DM-04; el resto continúa según las dependencias del plan.
- Seguridad del harness: esta sesión usa aislamiento `workspace-write`, red restringida y elevaciones revisadas; no se utilizó ningún modo sin confirmación ni se leyó ningún archivo `.env` ni credenciales. La autenticación la gestiona GitHub CLI. No se inspeccionó ni trasladó la clave personal de Context7.

Ajustes y uso posterior: Chrome 155.0.8059.85 se instaló con ayuda de Daniela desde PowerShell como administrador, tras fallar la instalación por permisos. Para comprobar el navegador, levantar el prototipo y abrirlo desde Playwright MCP. La captura necesitó ampliar el tiempo de espera. El cambio local preexistente de `.codex/config.toml` se conserva intacto y se excluye de este PR por indicación expresa de Daniela. Solo se cierran esta tarea y su bitácora; no se implementa DM-02 ni DM-04 en esta conversación.

### Verificación general

- `npm ci`: completado; 687 paquetes instalados, cero vulnerabilidades. Sin cambios de dependencias ni del archivo de bloqueo.
- `npm run verificar`: aprobado; formato, lint, tipos y 169 pruebas en 15 archivos. Daniela preparó su configuración local según `plan/instalacion.md` §5, sin compartir credenciales. No se omitieron ni modificaron pruebas.
- `npm run build`: aprobado con Turbopack, incluidos TypeScript y generación de páginas. Los intentos anteriores fallaron al iniciar un proceso de CSS; limpiar únicamente la caché generada `.next` resolvió el fallo. La compilación de diagnóstico con webpack también pasó. No se cambió la configuración del proyecto. Las verificaciones finales se ejecutaron en secuencia para evitar interferencias entre tipos y archivos generados de compilación.
- Revisión independiente con `plan/prompts/revision.md`: sin hallazgos de corrección ni opcionales en los dos Markdown.
