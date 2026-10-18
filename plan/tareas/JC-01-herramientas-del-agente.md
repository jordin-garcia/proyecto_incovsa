---
id: JC-01
titulo: Herramientas obligatorias del agente (Codex)
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E2
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-10-17
requisitos: []
pantallas: []
---

# JC-01 · Herramientas obligatorias del agente (Codex)

**Responsable:** José Daniel Cifuentes · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** —

## Objetivo
Dejar el equipo de José Daniel Cifuentes (macOS) y su agente (Codex) listos para trabajar en el proyecto, con las herramientas **obligatorias** integradas y verificadas: **GitHub CLI**, **Context7** y **Playwright**, más **next-devtools** y **shadcn** (specs/16, decisión 86). **Ninguna otra tarea de José Daniel Cifuentes se puede empezar hasta que esta esté hecha.**

Configura Codex en macOS, con el proyecto marcado como confiable. Usa la columna macOS de `plan/instalacion.md` §2.

## Contexto que debes leer
- `AGENTS.md` y `plan/protocolo.md` (completo)
- `plan/instalacion.md` §1 a §4 y §6.2 (Codex)
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
- `plan/tareas/JC-01-herramientas-del-agente.md` (estado y `## Resultado`)
- `plan/bitacora/jose-daniel.md` (entrada nueva)
- Ningún otro archivo del repositorio. La configuración del harness y de Context7 es personal y no se sube.

## Criterios de aceptación
1. `node scripts/verificar-entorno.mjs` termina con "El equipo tiene todo lo necesario." (todo en ✅).
2. `gh api user --jq .login` devuelve la cuenta de GitHub de José Daniel Cifuentes de la tabla de `AGENTS.md`, y `gh repo view jordin-garcia/proyecto_incovsa` funciona.
3. **Context7** responde: el agente resuelve la librería de Next.js y obtiene un fragmento de su documentación sobre Server Actions en la versión 16. Se anota en el `## Resultado` qué devolvió.
4. **Playwright** funciona: con `node scripts/servir-prototipo.mjs` corriendo, el agente abre http://127.0.0.1:4173/ con Playwright, toma una captura de la página de Inicio del prototipo y lee el título de la página.
5. Los servidores del harness aparecen registrados:
- En Codex, `/mcp` muestra `playwright`, `next-devtools`, `shadcn` y `context7`.
6. El agente responde correctamente "¿Qué me toca?" para José Daniel Cifuentes: ejecuta `node scripts/tareas.mjs --persona jose-daniel` y resume sus tareas.
7. El modo de trabajo configurado no es un modo sin permisos, y el agente no puede leer el archivo `.env` (en Claude Code lo impide `.claude/settings.json`; en los demás, se comprueba que el aislamiento está activo).

## Pruebas obligatorias
- No hay pruebas automatizadas: la evidencia es la salida de las comprobaciones de los criterios 1 a 7, resumida en el `## Resultado`.

## Verificación
```
node scripts/verificar-entorno.mjs
node scripts/tareas.mjs --validar
node scripts/tareas.mjs --persona jose-daniel
```

## Fuera de alcance
- Instalar dependencias del proyecto (`npm install`): llegan con JG-02.
- Crear las bases de datos locales: se hace en la primera tarea con base de datos, según `plan/instalacion.md` §5.
- Cambiar archivos de configuración del repositorio.

## Notas
- next-devtools solo responde con `npm run dev` corriendo (desde JG-02), y shadcn necesita `components.json` (desde JG-05). En esta tarea basta con que aparezcan registrados; su prueba real ocurre en la primera tarea con pantallas.
- En el `## Resultado`, anota las versiones instaladas (Node, npm, Git, gh, PostgreSQL y el harness) y cualquier ajuste personal que haya hecho falta, para que el resto del equipo lo aproveche.

## Resultado
- Hecho: equipo verificado: Node.js 24.22.0, npm 11.19.1, Git 2.54.0 (Apple Git-157), GitHub CLI 2.96.0, PostgreSQL 18.6 y Codex CLI 0.163.0-alpha.10.2. `node scripts/verificar-entorno.mjs` terminó con “El equipo tiene todo lo necesario.”
- Hecho: `gh api user --jq .login` devolvió `JDaniC` y `gh repo view jordin-garcia/proyecto_incovsa` confirmó acceso al repositorio.
- Hecho: `/mcp` en Codex mostró `playwright` conectado (25 herramientas), `next-devtools` conectado (4), `shadcn` conectado (7) y `context7` conectado (2). Al inicio, los tres servidores del proyecto fallaban porque `npx` no confiaba en la CA TLS de la red; los configuré en `~/.codex/config.toml` con `NODE_EXTRA_CA_CERTS` apuntando al bundle de certificados raíz de macOS guardado fuera del repositorio en `~/.codex/certs/macOS-roots.pem`. El proyecto está marcado como confiable. Context7 ya estaba configurado en la configuración personal y autenticó mediante OAuth; no hizo falta una clave personal. Context7 resolvió Next.js como `/vercel/next.js` y devolvió documentación v16.0.3 de Server Actions: un formulario usa `action={createPost}` y pasa `FormData` a la función del servidor.
- Hecho: con Playwright 1.63.0 abrí `http://127.0.0.1:4173/`, leí el título `Inicio · INCOVSA` y guardé `/tmp/JC-01-inicio-playwright.png`. Usé Google Chrome instalado en macOS porque la descarga del navegador de Playwright falló por el certificado de la red; no desactivé la validación TLS.
- Hecho: la configuración personal de Codex usa `sandbox_mode = workspace-write` y `approval_policy = on-request`; el proyecto tiene `trust_level = trusted`. No se usó un modo sin confirmaciones. `.env` no estaba presente en esta copia y no se leyó.
- Hecho: `node scripts/tareas.mjs --persona jose-daniel` identificó JC-01 como disponible y JC-02 esperando a JC-01; `node scripts/tareas.mjs --validar` informó “Plan válido: 62 tareas.”
- Verificación: `npm ci --prefer-offline` instaló 689 paquetes, generó Prisma Client y reportó 0 vulnerabilidades. `npm run verificar` pasó con PostgreSQL 18 temporal y aislado: formato, lint, tipos y 14 archivos/129 pruebas. `npm run build` compiló correctamente. La base temporal quedó fuera del repositorio y se eliminó al terminar.
- Decisiones: se reutilizó la autenticación OAuth existente de Context7 sin guardar claves en el repositorio. Para npm, la descarga TLS se completó usando temporalmente los certificados raíz del sistema; no se cambió la configuración permanente ni se desactivó TLS.
- Archivos principales: `plan/tareas/JC-01-herramientas-del-agente.md` y `plan/bitacora/jose-daniel.md`. En este proyecto confiable, Codex carga los tres MCP del proyecto; Context7 queda disponible desde la configuración personal. Para que `npx` inicie los tres MCP detrás de la CA TLS de esta red en macOS, su entorno personal tiene `NODE_EXTRA_CA_CERTS` con las raíces del sistema. next-devtools requiere levantar la aplicación y shadcn requiere `components.json` para su uso en tareas posteriores, según la guía.
