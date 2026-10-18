# Bitácora de Jordin García

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JG-01 · Herramientas obligatorias del agente (Claude Code y Codex)
- Hecho: entorno verificado en ✅ (Node 24.13.0, npm 11.6.2, Git 2.52.0, gh 2.98.0, PostgreSQL 18.6). GitHub CLI, Context7 y Playwright probados en Claude Code 2.1.267 y en Codex 0.157.1 (extensión de VS Code); next-devtools y shadcn registrados en los dos, con su prueba real en JG-02 y JG-05. Context7 con clave personal en Codex y como plugin en Claude Code.
- Decisiones: los servidores de `.mcp.json` se aprobaron en `.claude/settings.local.json` (personal). Se aplicó la configuración global de Git de `plan/instalacion.md` §3.
- Pendiente o aviso para otros:
**Todos:** en Claude Code, los servidores de `.mcp.json` quedan "Pending approval" hasta aprobarlos con `/mcp`. En Codex, revisen con `codex mcp list` que el proyecto esté marcado como confiable, porque sin eso no aparecen los servidores del proyecto. Las herramientas de Playwright no aparecen en `codex exec` (modo sin interfaz): pruébenlo en la sesión interactiva o en la extensión de VS Code.

## 2026-10-17 · JG-08 · Integración continua, bot de revisión, tablero del plan y protección de ramas
- Hecho: flujos `ci`, `titulo-pr`, `archivos-protegidos`, `revision-claude`, `claude-interactivo` y `tablero-plan`, más Dependabot, con las acciones fijadas por SHA. Scripts `archivos-protegidos`, `veredicto-revision` y `tablero`, con 78 pruebas. Repositorio con integración automática, solo *squash* y Actions autorizado para aprobar. Rulesets de `develop` y `main` con las ocho verificaciones obligatorias. Secreto del bot guardado.
- Decisiones: la revisión formal la deja el flujo a partir del veredicto, no el bot. `archivos-protegidos` ejecuta el script de la rama base. El coordinador puede saltarse las reglas solo al integrar un PR. Los PR de Dependabot los integra el coordinador.
- Pendiente o aviso para otros:
**Todos:** desde ahora cada PR se integra solo con `gh pr merge --auto --squash --delete-branch` cuando pasan las ocho verificaciones, incluida la del bot. El título debe ser `[<ID>] <título>`.
**Todos:** activen los avisos por correo de GitHub (`plan/instalacion.md` §3) y confírmenle a Jordin cuando les llegue el primer aviso del "Tablero del plan".
**JG-02:** anotar en la bitácora el resultado de los criterios 5, 6 y 7 de JG-08: protección de ramas, tablero fijado, aviso de tarea integrada y recordatorio manual.

## 2026-10-17 · JG-02 · Proyecto base de Next.js, dependencias y calidad local
- Hecho: aplicación Next.js 16.4.2 en la raíz con todas las dependencias del proyecto (versiones exactas en el `## Resultado` de la tarea), SheetJS 0.20.3 desde `vendor/`, Prettier, ESLint, TypeScript estricto, Vitest, Playwright con los proyectos `telefono`, `tableta`, `escritorio` y `tv`, gancho `pre-commit` de husky, `.env.example`, la estructura de carpetas con los 15 README de módulos, y `src/lib/fechas.ts`, `errores.ts` y `roles.ts` con 34 pruebas. `npm run verificar`, `npm run build`, `npm run e2e` y `npm audit --audit-level=high` pasan.
- Decisiones: `overrides` de `fast-glob` → `tinyglobby` en `@next/eslint-plugin-next` por el aviso alto de `braces` sin versión corregida; ESLint 9 y TypeScript 6.0; Tailwind con PostCSS; `agentRules: false` para que `next dev` no escriba en `AGENTS.md`; Vitest con `*.test.ts` (las pruebas `.mjs` de los scripts siguen con `node:test`); Prettier ignora `*.md` y se formatearon los scripts; mensaje general de error "No se pudo completar la operación. Inténtelo de nuevo." (registrado en `specs/16` y `specs/18`).
- Criterios 5, 6 y 7 de JG-08: los rulesets `develop`, `main` y `main: solo integra el coordinador` están activos (con `pull_request`, `required_status_checks`, `non_fast_forward`, `deletion` y `update`); el issue #59 "Tablero del plan" está fijado; el recordatorio diario del 17/10 se publicó solo con el cron (programado a las 13:00 UTC, salió a las 16:00 UTC) y menciona a cada persona con sus tareas. El aviso de tarea integrada se comprueba al integrar este PR, el primero de una tarea desde JG-08. No se ejecutó el recordatorio manual, para no enviar otro correo al equipo el mismo día.
- Pendiente o aviso para otros:
**Todos:** actualicen `develop` y ejecuten `npm install` y `npx playwright install chromium` (o la lista de `plan/instalacion.md` §5). Desde ahora, cada *commit* pasa por `npm run formato`, `npm run lint` y `npm run tipos`; si el formato falla, `npm run formato:arreglar`. No usen `--no-verify`.
**Todos:** las fechas y horas se calculan y se muestran solo con `@/lib/fechas`, y los errores de las acciones con `ErrorNegocio` y `aResultadoDeError` de `@/lib/errores` (ejemplos en el `## Resultado` de JG-02). Los textos de fecha sin zona lanzan `RangeError`.
**DM-02:** reemplaza `src/app/page.tsx`. `pruebas-e2e/comunes/aplicacion.spec.ts` comprueba en `/` que el título contenga "INCOVSA", que `lang` sea `es` y que axe no encuentre violaciones serias; tu página de inicio debe cumplirlo.
**CE-05:** `next.config.ts` ya tiene `output: "standalone"`. El script `prepare` ejecuta `husky`: en la imagen de Docker instala con `npm ci --omit=dev --ignore-scripts` (o `HUSKY=0`).
**JG-04:** la aplicación no tiene ícono (`/favicon.ico` da 404) y el prototipo tampoco; si INCOVSA entrega uno, se agrega con los recursos gráficos.
**JG-16:** los proyectos de Playwright usan solo Chromium; agrega Firefox y WebKit (decisión 46).
