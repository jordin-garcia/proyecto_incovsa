---
id: JG-08
titulo: Integración continua, bot de revisión, tablero del plan y protección de ramas
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JG-01]
programada: 2026-10-17
requisitos: [RNF-16]
pantallas: []
---

# JG-08 · Integración continua, bot de revisión, tablero del plan y protección de ramas

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10, **la primera después de JG-01** · **Depende de:** JG-01

## Objetivo
Dejar funcionando en GitHub, **antes del primer PR de cualquier tarea**, todo lo que permite que los PR se integren solos y con garantías: la integración continua, la verificación de archivos protegidos, el **bot de Claude** que revisa, aprueba o rechaza cada PR, la integración automática en `develop`, el tablero del plan con sus **avisos por correo** y la protección de `develop` y `main` (specs/16, decisiones 47, 60, 71, 75, 80, 83 y 87).

Se hace antes de JG-02: los trabajos de la CI que necesitan la aplicación comprueban, **dentro de sus pasos**, si ya existe (`package.json`, `prisma/schema.prisma`) y, mientras no exista, terminan bien sin ejecutar nada. Desde JG-02 corren completos sin tocar los flujos.

## Contexto que debes leer
- `specs/16`: "Forma de trabajo" y decisiones 47, 60, 61, 66, 71, 75, 76, 80 y 83
- `plan/protocolo.md` §B10 y `plan/prompts/revision.md`
- Los flujos y scripts del repositorio `jordin-garcia/shapi`, que funcionan y se toman como base (léelos con `gh api repos/jordin-garcia/shapi/contents/<ruta> --jq .content | base64 -d`): `.github/workflows/ci.yml`, `revision-claude.yml`, `claude-interactivo.yml`, `titulo-pr.yml`, `tablero-plan.yml`, `scripts/veredicto-revision.mjs`, `scripts/tablero.mjs` y sus pruebas
- `scripts/tareas.mjs` (ya adaptado a este proyecto)
- Context7: GitHub Actions (servicios de contenedor, `permissions`, `concurrency`), Claude Code GitHub Action (`claude_code_oauth_token`, `claude_args`, `--allowedTools`)

## Qué hacer
1. **`.github/workflows/ci.yml`**, en cada PR a `develop` y `main` y en cada *push* a `develop`, con trabajos de nombre fijo (los exige la protección de ramas; **sin `if` a nivel de trabajo**, porque un trabajo omitido cuenta como aprobado):
   - `plan`: `node scripts/tareas.mjs --validar` y las pruebas de los scripts;
   - `calidad`: `npm ci`, `npm run formato`, `npm run lint`, `npm run tipos`;
   - `pruebas`: PostgreSQL 18 como servicio, `npm run db:aplicar` sobre una base vacía (las migraciones corren desde cero) y `npm test`;
   - `compilacion`: `npm run build`;
   - `dependencias`: `npm audit --audit-level=high`.
2. **`titulo-pr.yml`** (trabajo `titulo`): `node scripts/tareas.mjs --validar-titulo` y `--validar-cierre`, con el título en una variable de entorno, nunca interpolado en el comando.
3. **`archivos-protegidos.yml`** (trabajo `archivos-protegidos`, decisión 80): falla si un PR cuyo autor no es `jordin-garcia` modifica un archivo protegido de `plan/convenciones.md` §3, con la excepción que ahí se indica (`.github/workflows/despliegue.yml` y `.github/workflows/produccion-*.yml` también para `carloshugoeg`). Script `scripts/archivos-protegidos.mjs` con sus pruebas.
4. **`revision-claude.yml`** (trabajo `revision-claude`), adaptado de `shapi`:
   - Claude Code GitHub Action **fijada por SHA**, con el secreto `CLAUDE_CODE_OAUTH_TOKEN` de la suscripción del coordinador y las herramientas mínimas (`Read`, `Grep`, `Glob`, `git diff`, `gh pr view`, `gh pr diff`, `gh pr comment`, `gh pr review`);
   - revisa el PR con `plan/prompts/revision.md` contra la tarea del título, publica un comentario que empieza con "🤖 Revisión automática con Claude", la línea "Commit revisado: <sha>" y termina en `VEREDICTO: LISTO` o `VEREDICTO: CORREGIR`;
   - deja una revisión formal: **aprobar** si el veredicto es LISTO, **solicitar cambios** si es CORREGIR;
   - el trabajo falla con CORREGIR o si la revisión no se completó (cuota, caída o tiempo agotado), y se vuelve a ejecutar con `gh run rerun <id> --failed`;
   - con CORREGIR, el comentario **menciona al autor del PR** (`@<usuario>`) y lista los hallazgos con sus razones, para que GitHub le envíe el aviso por correo (decisión 87);
   - no revisa dos veces el mismo *commit* (`scripts/veredicto-revision.mjs`, adaptado de `shapi`).
5. **`claude-interactivo.yml`**: responde a `@claude` en issues y PR, solo para usuarios con permiso de escritura.
6. **`tablero-plan.yml`** y `scripts/tablero.mjs` (adaptado de `shapi`, con `node scripts/tareas.mjs --json`), en cada *push* a `develop` y cada día a las 07:00 de Guatemala. Mantiene el issue fijo **"Tablero del plan"** con el estado de todas las tareas, y publica en él comentarios que **mencionan** a las personas, para que GitHub les envíe el aviso **por correo** (decisión 87):
   - **cada día a las 07:00:** un comentario que menciona a cada integrante con sus tareas programadas para ese día y las atrasadas;
   - **cada vez que se integra una tarea:** un comentario que menciona a **todo el equipo** con la tarea terminada, quién la hizo y las tareas que quedaron **disponibles** por ella, con su dueño;
   - **si una tarea se bloquea:** un comentario que menciona al coordinador con el motivo.
7. **`.github/dependabot.yml`**: actualizaciones de npm y de GitHub Actions, semanales, con destino `develop`.
8. **Configuración del repositorio** con `gh api` (requiere la cuenta del coordinador):
   - activar la integración automática (*auto-merge*), solo integración *squash* y borrar la rama al integrar;
   - permitir que GitHub Actions apruebe PR;
   - **`develop`**: solo por PR; verificaciones obligatorias `plan`, `calidad`, `pruebas`, `compilacion`, `dependencias`, `titulo`, `archivos-protegidos` y `revision-claude`; rama al día antes de integrar; sin aprobación humana obligatoria; sin *push* forzado ni borrado;
   - **`main`**: solo por PR, con las mismas verificaciones; solo el coordinador integra.
9. **Secreto del bot:** comprueba con `gh secret list` que existe `CLAUDE_CODE_OAUTH_TOKEN`. Si no existe, pídele al coordinador que ejecute `claude setup-token` y que lo guarde con `gh secret set CLAUDE_CODE_OAUTH_TOKEN` (`plan/instalacion.md` §7). Nunca lo escribas tú en un archivo.
10. Acciones de GitHub siempre **fijadas por SHA**, con permisos mínimos por trabajo, y sin `pull_request_target`.

## Archivos que creas o modificas
- `.github/workflows/ci.yml`, `titulo-pr.yml`, `archivos-protegidos.yml`, `revision-claude.yml`, `claude-interactivo.yml`, `tablero-plan.yml` (crear)
- `.github/dependabot.yml` (crear)
- `scripts/archivos-protegidos.mjs`, `scripts/veredicto-revision.mjs`, `scripts/tablero.mjs` y sus pruebas `*.test.mjs` (crear)

## Criterios de aceptación
1. En un PR de prueba, aparecen las ocho verificaciones obligatorias del paso 8 y ninguna se puede omitir.
2. Un PR de otra cuenta que cambia `prisma/schema.prisma` o `AGENTS.md` falla en `archivos-protegidos`; uno del coordinador no.
3. Un PR con el título sin `[<ID>]` falla en `titulo`; uno que no cierra su tarea (sin `estado: hecha`, sin `## Resultado` o sin bitácora) también.
4. El bot comenta con el formato del paso 4 y deja la revisión formal; con `VEREDICTO: CORREGIR` el trabajo falla y el PR no se integra; con `LISTO` y todo en verde, el PR se integra solo en `develop` con *squash*.
5. `develop` y `main` no aceptan *push* directo; `develop` integra sin aprobación humana cuando todo pasa.
6. El issue "Tablero del plan" existe, está fijado y refleja `node scripts/tareas.mjs --json`.
7. **Decisión 87:** al integrar una tarea de prueba, el tablero comenta mencionando a los cinco integrantes con la tarea terminada y las que se desbloquearon; la ejecución manual del recordatorio diario menciona a cada persona con sus tareas del día; un PR con CORREGIR menciona a su autor con los hallazgos. Cada integrante confirma que le llegó el correo (`plan/instalacion.md` §3).
8. Antes de JG-02, un PR que solo cambia archivos del plan pasa todas las verificaciones obligatorias.
9. Ningún flujo interpola el título o el cuerpo de un PR en un comando, y todas las acciones están fijadas por SHA.

## Pruebas obligatorias
- `scripts/archivos-protegidos.test.mjs`, `scripts/veredicto-revision.test.mjs` y `scripts/tablero.test.mjs`
- Un PR de prueba (por ejemplo, el de esta misma tarea) que demuestre los criterios 1, 3 y 4

## Verificación
```
node scripts/tareas.mjs --validar
node --test "scripts/*.test.mjs"
gh pr checks --watch
gh api repos/jordin-garcia/proyecto_incovsa/rulesets
```

## Fuera de alcance
- Semgrep, gitleaks, StrykerJS, lockfile-lint, OSV-Scanner, actionlint y las cabeceras de seguridad (JG-11).
- El recorrido diario del flujo completo (JG-14) y el despliegue automático (CE-06).

## Notas
- Mientras esta tarea no esté integrada, los demás integran sus PR a mano después de verificar en local (protocolo B10).
- Si la cuota del plan de Claude no alcanza para revisar los PR del equipo, el coordinador pasa a Claude Max (decisión 83). Anótalo en la bitácora si ocurre.
