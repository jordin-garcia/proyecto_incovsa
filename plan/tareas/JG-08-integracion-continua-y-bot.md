---
id: JG-08
titulo: Integración continua, bot de revisión, tablero del plan y protección de ramas
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
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
- `scripts/flujos.test.mjs` (crear): pruebas de los flujos y de Dependabot (agregado al implementar la tarea)

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

## Resultado

Quedaron funcionando en GitHub la integración continua, las verificaciones de título, cierre y archivos protegidos, el bot de revisión con Claude, Claude interactivo, el tablero del plan con sus avisos por correo y Dependabot. El repositorio integra solo con *squash*, borra la rama al integrar, tiene activada la integración automática y permite que GitHub Actions apruebe PR. `develop` y `main` quedan protegidas con rulesets.

**Archivos principales**
- `.github/workflows/ci.yml`: trabajos `plan`, `calidad`, `pruebas` (PostgreSQL 18 como servicio y migraciones desde cero), `compilacion` y `dependencias`.
- `.github/workflows/titulo-pr.yml` (`titulo`), `archivos-protegidos.yml` (`archivos-protegidos`), `revision-claude.yml` (`revision-claude`), `claude-interactivo.yml` y `tablero-plan.yml`.
- `.github/dependabot.yml`.
- `scripts/archivos-protegidos.mjs`, `scripts/veredicto-revision.mjs` (de shapi), `scripts/tablero.mjs` (de shapi, adaptado a la decisión 87) y sus pruebas, más `scripts/flujos.test.mjs` (78 pruebas en total).

**Acciones fijadas por SHA**, todas con más de dos semanas: `actions/checkout` v7.0.1 (`3d3c42e5…`), `actions/setup-node` v7.0.0 (`82076278…`) y `anthropics/claude-code-action` v1.0.240 (`ed670b4c…`).

**Configuración del repositorio** (con `gh api`):
- Integración automática activada, solo *squash*, borrar la rama al integrar, y GitHub Actions puede aprobar PR (`can_approve_pull_request_reviews`).
- Ruleset **`develop`**: solo por PR, sin aprobación humana, solo *squash*, sin *push* forzado ni borrado, rama al día (`strict`) y las ocho verificaciones obligatorias, exigidas a la app de GitHub Actions (`integration_id` 15368) para que nadie las imite con la API.
- Ruleset **`main`**: las mismas reglas. Ruleset **`main: solo integra el coordinador`**: regla `update` (restringir actualizaciones).
- En `develop` y en `main: solo integra el coordinador`, el rol administrador (el coordinador) puede saltarse las reglas **solo al integrar un PR** (`bypass_mode: pull_request`), nunca con *push* directo. Así puede integrar un falso positivo del bot con `gh pr merge <n> --admin --squash` (protocolo B10).
- Secreto `CLAUDE_CODE_OAUTH_TOKEN`, guardado por el coordinador con `claude setup-token`.

**Decisiones tomadas**
- **La revisión formal la deja el flujo, no el bot.** Después de leer el veredicto con `scripts/veredicto-revision.mjs`, el paso "Revisión formal" aprueba con LISTO o solicita cambios con CORREGIR, mencionando al autor, y no repite la misma revisión sobre el mismo commit. Por eso el bot no recibe la herramienta `gh pr review` que enumera el paso 4: así el check y la revisión formal no pueden contradecirse, y un PR con instrucciones escondidas no puede hacer que el bot apruebe.
- **Mención al autor con CORREGIR:** la pide el prompt en la tercera línea del comentario del bot, y la repite la revisión formal de "solicitar cambios". Las dos generan el correo de GitHub (decisión 87).
- **`archivos-protegidos` ejecuta la versión del script de la rama base** (`git show HEAD^1:…`), para que un PR no pueda cambiar el script y aprobarse solo. Límite conocido: con `pull_request`, GitHub ejecuta el YAML del propio PR, así que un PR que modifique `archivos-protegidos.yml` podría anular la verificación. Sin `pull_request_target` no se puede evitar. Lo cubren el bot (revision.md, punto 3) y la auditoría.
- **"Los scripts de la CI"** de convenciones §3 son `scripts/tareas.mjs`, `archivos-protegidos.mjs`, `veredicto-revision.mjs`, `tablero.mjs`, sus pruebas y `flujos.test.mjs`.
- **Aviso por tarea integrada:** un solo comentario que menciona a los cinco, con una línea por tarea integrada ("✅ **ID** (título), de <persona>, quedó integrada. Queda disponible: …"). Lo que no viene de una integración (una tarea que sale de bloqueada o que llega a su fecha) se avisa solo a su dueño.
- **`tablero-plan.yml` se puede ejecutar a mano con `forzar_recordatorio`**, para publicar el recordatorio del día aunque ya haya salido (criterio 7).
- Los PR de Dependabot fallan siempre en `titulo`, `archivos-protegidos` y `revision-claude`: los integra el coordinador con `--admin`.

**Evidencia**
- Criterio 1: en el PR #58 aparecen las ocho verificaciones, y los rulesets las exigen (`gh api repos/jordin-garcia/proyecto_incovsa/rulesets`). Ninguna tiene `if` a nivel de trabajo (`scripts/flujos.test.mjs`).
- Criterio 2: lo prueba `scripts/archivos-protegidos.test.mjs`. En local, con el diff de esta rama, `node scripts/archivos-protegidos.mjs Josh-JM` falla con la lista de archivos y `jordin-garcia` pasa. No hubo un PR real desde otra cuenta.
- Criterio 3: con el PR #58 en borrador, `titulo` falló por el cierre ("debe cerrar la tarea con estado: hecha", "falta la sección ## Resultado"). Con el título cambiado a "Integración continua sin ID de tarea", falló con "no sigue el formato [<ID>] <título>".
- Criterio 4: el comentario del bot, la revisión formal y la integración automática quedan en el PR #58. El caso CORREGIR lo cubren `scripts/veredicto-revision.test.mjs` y `scripts/flujos.test.mjs`.
- Criterio 8: en el PR #58, `plan`, `calidad`, `pruebas`, `compilacion`, `dependencias` y `archivos-protegidos` pasaron sin `package.json`.
- Criterio 9: `scripts/flujos.test.mjs` revisa las interpolaciones y los SHA de todos los flujos. Se comprobó que detecta los fallos introduciéndolos a propósito.
- Criterios 5, 6 y 7: se comprueban al integrar este PR. La primera ejecución del tablero solo crea y fija el issue, sin mencionar a nadie. El aviso de "tarea integrada" sale desde la siguiente integración (JG-02), y el recordatorio, con la ejecución manual o con el cron de las 07:00. El coordinador anota el resultado en su bitácora con JG-02. La confirmación de que llegó el correo depende de cada integrante.

**Cómo usarlo**
- Cada PR: `gh pr create` con el título `[<ID>] <título>`, luego `gh pr merge --auto --squash --delete-branch` y `gh pr checks --watch`. Se integra solo cuando pasan las ocho verificaciones.
- `revision-claude` en rojo: con hallazgos, corregir y hacer *push*. Si la revisión no se completó, `gh run rerun <id> --failed`.
- Pedirle algo a Claude en un issue o PR: comentar con `@claude` (solo usuarios con permiso de escritura).
- Recordatorio manual: `gh workflow run tablero-plan.yml -f forzar_recordatorio=true`.
- Desde JG-02, `calidad`, `pruebas`, `compilacion` y `dependencias` corren completos sin tocar los flujos. En el trabajo `pruebas`, `DATABASE_URL` y `DATABASE_URL_PRUEBAS` apuntan a la base temporal `incovsa_pruebas`. Si JG-02 o JG-03 necesitan más variables en la CI, las agrega el coordinador en `ci.yml`.

### Correcciones de la auditoría (2026-10-19)

- `revision-claude` no revisaba los PR cuyos cambios sube el agente en la nube de Cursor (actor `cursor[bot]`): la acción rechaza los eventos de bots, y `gh run rerun` no lo resolvía porque conserva el actor. Ocurrió en #83, #85 y #86. Por decisión del coordinador, el paso «Revisar con Claude» agrega `allowed_bots: "cursor"`, solo ese bot (decisión 62 y `specs/18`).
- Mientras tanto, para revisar como humano un PR que disparó un bot no admitido: pasarlo a borrador y volver a marcarlo listo (`gh pr ready <n> --undo` y `gh pr ready <n>`). Eso desactiva la integración automática, que hay que volver a activar.

### Correcciones de la auditoría (2026-10-24)

- La ronda semanal de Dependabot del 24/10 abrió 9 PR a la vez, uno por paquete (#117 a #125): `dependabot.yml` no agrupaba nada y permitía 5 PR por ecosistema. Además propuso TypeScript 7, que rompe `calidad`, `plan` e `integridad-pruebas` porque quitó la API de JavaScript que usa `scripts/integridad-pruebas.mjs`, y `@types/node` 26, que no corresponde al Node.js 24 de `specs/16`. Por decisión del coordinador:
  - En los dos ecosistemas, las versiones menores y los parches llegan juntos en un solo PR (grupo `menores-y-parches`); cada versión mayor, en su propio PR.
  - En npm se ignoran las versiones mayores de `typescript` y de `@types/node`.
  - Lo prueba `scripts/flujos.test.mjs` («Dependabot junta menores y parches…»).
- De esa ronda, #118 y #123 son actualizaciones menores o de parche para integrar. Se cerraron #124 y #125, y siguen abiertas para revisión las versiones mayores #117, #119, #120 (acciones de Docker), #121 (ESLint 10) y #122 (`@hookform/resolvers` 6).
