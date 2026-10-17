# Protocolo de trabajo para agentes de IA

Este es el procedimiento **obligatorio** para cualquier agente (Claude Code, Codex, Cursor, Antigravity u otro) que trabaje en el proyecto INCOVSA. Su objetivo es que el agente complete una tarea de principio a fin **sin intervención humana**, salvo cuando necesite algo a lo que no puede acceder.

> Para las personas: no necesitan memorizar esto. Basta con pedirle a su agente "¿qué me toca?" y luego "implementa <ID>". La guía rápida está en `plan/README.md`.

---

## A. Buscar tareas ("¿qué me toca?")

1. **Identifica a la persona** con la tabla de `AGENTS.md`. Si no puedes deducirla con seguridad, pregúntale: "¿Eres Jordin, Carlos, Daniela, Josué o José Daniel?".
2. **Actualiza tu copia**:
   ```
   git switch develop
   git pull --ff-only
   ```
   Si hay cambios locales sin guardar, **no los descartes**: díselo a la persona y pregúntale qué hacer.
3. **Lista sus tareas**: `node scripts/tareas.mjs --hoy <clave>` (lo de hoy, lo atrasado y quién lo espera) y `node scripts/tareas.mjs --persona <clave>` (todas, ordenadas por fecha programada).
4. **Lee el archivo** de cada tarea **disponible** y las últimas 3 entradas de `plan/bitacora/<clave>.md`.
5. **Busca los avisos que le dejaron los demás.** En las bitácoras de las otras personas (`plan/bitacora/*.md`), las líneas de "Pendiente o aviso para otros" dirigidas a esta persona empiezan en negrita con un ID de sus tareas (`**JM-03:**`), su nombre (`**Josué:**`) o `**Todos:**`. Quédate con los avisos de tareas que todavía no están hechas.
6. **Responde** con:
   - primero lo atrasado (⏰) y lo programado para hoy, con quién lo espera;
   - las tareas disponibles, en el orden que da el script: ID, título, fecha y un resumen de 1 o 2 líneas de lo que hará;
   - las tareas en espera y de quién dependen;
   - los avisos que le dejaron los demás;
   - la siguiente tarea recomendada.
7. **No implementes nada** hasta que te lo pidan.

---

## B. Implementar una tarea ("implementa <ID>" o "continúa")

Si la persona dice "continúa" o "la siguiente", toma la primera disponible con `node scripts/tareas.mjs --siguiente <clave>`.

**Una sola tarea por conversación** (`specs/16`, decisión 88), para que no se exceda la ventana de contexto del agente. Si en esta conversación ya implementaste o empezaste otra tarea, detente y pídele a la persona que abra una conversación nueva para esta. Si una tarea se interrumpe antes de integrarse, se retoma en una conversación nueva desde su rama.

Desde aquí trabaja **sin pedir confirmación** en cada paso. Solo te detienes en los casos de §C.

### B0. Herramientas obligatorias

Antes de cualquier tarea que no sea la `XX-01` de la persona, comprueba que tienes disponibles las herramientas obligatorias de `AGENTS.md`: GitHub CLI con sesión iniciada, Context7 y Playwright (y next-devtools y shadcn desde que existe el proyecto base). Si falta alguna, **detente**: la persona debe terminar primero su tarea `XX-01`.

### B1. Comprobar que se puede empezar
- Ejecuta `node scripts/tareas.mjs --ver <ID>`. Si no está disponible, explica por qué y detente.
- Comprueba que la tarea es de esta persona. Si no lo es, detente (excepción: el coordinador, §E).

### B2. Preparar la rama
```
git switch develop && git pull --ff-only
git switch -c <clave>/<ID>-<descripcion-corta>      # ejemplo: josue/JM-03-bodega-preparacion
npm install                                          # desde JG-02, por si cambió package-lock.json
npm run db:aplicar                                   # desde JG-03, por si hay migraciones nuevas
```

### B3. Entender la tarea
- Lee el archivo de la tarea **completo**.
- Lee **todas** las secciones de `specs/` que enumera en "Contexto que debes leer". No leas todas las especificaciones enteras: lee lo que se indica.
- Lee `plan/convenciones.md` si todavía no lo has hecho en esta sesión.
- Si la tarea tiene pantallas, levanta el prototipo (`node scripts/servir-prototipo.mjs`), ábrelo con Playwright y recorre las pantallas que nombra la tarea. Lee también la función del prototipo que las dibuja y sus estilos (`plan/convenciones.md` §7).
- **Consulta Context7** por la documentación de cada librería que vayas a usar en esta tarea, en la versión del proyecto.
- Lee la sección `## Resultado` de las tareas de las que depende: ahí está lo que hicieron y cómo usarlo.
- Busca en las bitácoras de los demás los avisos dirigidos a **esta tarea** o a tu persona.
- Si algo es ambiguo o contradictorio, aplica §C antes de escribir código.

### B4. Pruebas primero
- Convierte **cada criterio de aceptación** en al menos una prueba automatizada, con el código del requisito o la regla al inicio del nombre (`RN-01: …`).
- Ejecuta las pruebas y confirma que **fallan por la razón esperada** (fase roja).

### B5. Implementar
- Escribe el código que haga pasar las pruebas, respetando `specs/16` y `plan/convenciones.md` §4.
- **Solo toca los archivos que la tarea indica** en "Archivos que creas o modificas", más sus pruebas, la precisión de `specs/` si hace falta y tu bitácora. Si necesitas tocar otro archivo, aplica §C (salvo el coordinador, §E1).
- Haz *commits* pequeños y frecuentes, en español: `feat(bodega): marcado de filas (JM-03)`.

### B6. Verificar
- Ejecuta **todos** los comandos de la sección **Verificación** de la tarea, además de:
  - `node scripts/tareas.mjs --validar`
  - `npm run verificar` (formato, lint, tipos y pruebas) y `npm run build`, desde que existe el proyecto base (JG-02).
- Si algo falla, **corrige la causa**. Nunca debilites las pruebas.
- Guarda la salida resumida de cada comando: es la evidencia del PR.

### B7. Verificar pantallas (si la tarea tiene pantallas)
- Levanta la aplicación (`npm run dev`) y el prototipo (`node scripts/servir-prototipo.mjs`).
- Usa **next-devtools** para confirmar que no hay errores de compilación ni de ejecución.
- Con **Playwright**, toma una captura de cada estado de la pantalla en la aplicación y en el prototipo, en 390 px, 768 px y 1440 px, y compáralas según `plan/convenciones.md` §7.
- Corrige cualquier diferencia de textos, datos, orden, estados o colores. Ejecuta las pruebas de `pruebas-e2e/` de la tarea, con axe.

### B8. Revisión en contexto limpio
- Pide una revisión **a un agente que no escribió el código**, con las instrucciones de `plan/prompts/revision.md`:
  - **Claude Code:** el subagente `revisor`.
  - **Codex, Cursor o Antigravity:** una sesión o conversación nueva con ese archivo como instrucción y el ID de la tarea.
- Corrige **todos los hallazgos de corrección**. Los opcionales se anotan en el PR.
- Si corregiste algo, vuelve a B6.

### B9. Cerrar la tarea en el mismo PR
- **Especificaciones:** si precisaste un comportamiento que `specs/` no decía, agrégalo en el archivo del módulo y una línea en `specs/18-historial-de-decisiones.md`.
- **Archivo de la tarea:** cambia `estado: pendiente` por `estado: hecha` y agrega al final una sección `## Resultado` con lo que se hizo, las decisiones tomadas, los archivos principales y **cómo usar lo que se creó** (las tareas que dependen de esta la leerán).
- **Bitácora:** agrega una entrada al **final** de `plan/bitacora/<clave>.md`:
  ```
  ## AAAA-MM-DD · <ID> · <título>
  - Hecho: ...
  - Decisiones: ...
  - Pendiente o aviso para otros: ...
  ```
  Cada aviso para otra persona va en su propia línea y empieza en negrita con a quién va dirigido: `**JC-04:**`, `**José Daniel:**` o `**Todos:**`.

### B10. Abrir el PR e integrarlo
```
node scripts/tareas.mjs --validar-cierre "[<ID>] <título>"
git push -u origin <rama>
gh pr create --base develop --title "[<ID>] <título>" --body-file <archivo con la plantilla completada>
gh pr merge --auto --squash --delete-branch
gh pr checks --watch
```
- **El título es obligatorio en el formato `[<ID>] <título>`.** La verificación `titulo` rechaza cualquier otro.
- El cuerpo sigue `.github/pull_request_template.md`, con la evidencia de B6 y B7 y el resultado de B8.
- **El PR se integra solo** cuando pasan todas las verificaciones obligatorias, incluida la del bot de Claude (`revision-claude`). No hace falta que ningún humano lo apruebe.
- **Si falla una verificación:** lee el registro (`gh run view --log-failed`), corrige, haz *commit* y *push*, y vuelve a esperar. Máximo 5 intentos; después, §C.
- **`revision-claude` en rojo:** si tiene hallazgos de corrección, corrígelos y haz *push*. Si la revisión no se completó (cuota agotada, caída del servicio o tiempo agotado), vuelve a ejecutarla con `gh run rerun <id del run> --failed`. Si crees que un hallazgo es un falso positivo, explícalo en el PR y avísale al coordinador: solo él puede integrar en ese caso.
- **Si la rama está desactualizada:** `gh pr update-branch`, o `git pull --rebase origin develop`, resuelve los conflictos y `git push --force-with-lease` **sobre tu rama**.
- **Antes de que termine JG-08** todavía no hay CI ni integración automática: después de tu verificación local, integra con `gh pr merge --squash --delete-branch`.

### B11. Terminar
- Ejecuta `git switch develop && git pull --ff-only`, borra tu rama local (`git branch -D <rama>`) y limpia las referencias de las ramas remotas ya borradas (`git fetch --prune`). GitHub borra la rama remota sola al integrar el PR.
- Dale a la persona un resumen breve: qué se hizo, el enlace al PR, la evidencia y las decisiones tomadas.
- Muéstrale lo que le toca después con `node scripts/tareas.mjs --hoy <clave>`.
- **No sigas con otra tarea en esta conversación**, aunque te haya pedido varias: dile que abra una conversación nueva para la siguiente (decisión 88).

---

## C. Cuándo detenerse y qué hacer

| Situación | Qué hacer |
|---|---|
| `specs/` y el prototipo no dicen algo, la decisión es **local y reversible** (un nombre interno, un texto de error) y es coherente con el resto | Decide lo más simple, sigue y anótalo en "Decisiones tomadas" del PR. Si afecta lo que ve el usuario, **detente y pregúntale a la persona**: nada visible se inventa |
| `specs/` **se contradice** o contradice al prototipo | Manda `specs/`, en este orden: `specs/16` (decisiones) > `specs/18` (lo más reciente) > el archivo del módulo > `specs/20` > el prototipo. Documenta la contradicción en el PR |
| La decisión es **de alto impacto**: dependencia nueva, cambio del esquema, un archivo protegido (`plan/convenciones.md` §3), seguridad, o modificar archivos de otra persona | **Detente y pregúntale a la persona**, con las opciones y tu recomendación. El esquema y los archivos protegidos los cambia el coordinador en un PR propio |
| Necesitas **información o acceso externo**: credenciales, cuentas, datos de INCOVSA, una decisión del equipo | Detente y explica exactamente qué necesitas y por qué. Si la persona no puede darlo ahora, marca la tarea como bloqueada |
| Una **dependencia** no funciona como dice su tarea | No lo arregles en código ajeno. Crea una tarea nueva para su dueño (ver abajo), avísale a tu persona y sigue con lo que puedas. El coordinador sí puede corregirlo directamente (§E) |
| Un pendiente de `specs/19-pendientes.md` (P-xx) afecta la tarea | Implementa lo que la tarea dice para ese caso (normalmente, un valor configurable o el dato de ejemplo) y no inventes el dato real |
| 5 intentos fallidos con la CI, o el mismo error después de 3 enfoques distintos | Detente y explícale a la persona el problema, lo que intentaste y las opciones |

**Marcar una tarea como bloqueada.** Cambia `estado: bloqueada` y agrega la línea `bloqueo: <qué falta y quién puede resolverlo>`. Haz un PR que **solo** cambie ese archivo y la bitácora, con el título `[<ID>] Bloqueada: <motivo>`, e intégralo como en B10.

**Crear una tarea nueva** (por un error ajeno o algo que falta):
- Copia `plan/tareas/_plantilla.md` a `plan/tareas/<PREFIJO>-<siguiente número libre de esa persona>-<descripcion>.md`.
- Complétala con su responsable según `plan/convenciones.md` §2, su `hito`, su `prioridad` y su `programada` (el primer día libre de esa persona después de sus dependencias).
- Ejecuta `node scripts/tareas.mjs --calendario --escribir` y agrégala en tu PR. Anótalo en tu bitácora.

---

## D. Reglas para no pisarse

- Cada persona trabaja **solo** en sus tareas y en sus carpetas (`plan/convenciones.md` §2).
- Los archivos protegidos solo los cambia el coordinador (`plan/convenciones.md` §3).
- Integra seguido: una tarea por PR, integrada el mismo día en que se termina.
- Antes de empezar cualquier tarea, actualiza `develop`.

---

## E. El coordinador

El coordinador, **Jordin García** (persona `jordin`, usuario `jordin-garcia`), audita lo que se integra y corrige lo que encuentra.

### E1. Autorización permanente

En cualquier PR suyo, el coordinador puede modificar el código, las pruebas, las migraciones, los archivos protegidos y calientes, las tareas, las bitácoras y la documentación de **cualquier persona**, y terminar o corregir tareas de otros. No necesita preguntar antes. La autorización cubre **solo quién edita qué**: la CI sigue siendo obligatoria, nunca se hace *push* a la rama de otra persona, no se debilitan pruebas y las dependencias nuevas, las cuentas y las credenciales siguen siendo decisiones que se preguntan.

Cada vez que un PR del coordinador toca archivos de otra persona, su entrada en `plan/bitacora/jordin.md` lleva un aviso en negrita para esa persona (`**Josué:**`), con los archivos que cambiaron y la indicación de actualizar su rama desde `develop`.

### E2. Auditoría ("audita <ID>" o "audita lo integrado")

1. **Qué se audita:** las tareas integradas en `develop` después de la auditoría más reciente (`plan/auditorias/`), o la que nombre Jordin.
2. **Revisión de cada tarea**, con subagentes o sesiones en contexto limpio: leer completos la tarea (con `## Resultado`), su contexto de `specs/` y el código actual; comprobar cada criterio de aceptación con código **y** prueba; contrastar con `specs/` y con el prototipo; revisar la seguridad (`plan/prompts/revision.md`, puntos 4 y 5) y el cierre.
3. **Verificación completa:** `npm run verificar`, `npm run build` y `npm run e2e`.
4. **Registro:** `plan/auditorias/<AAAA-MM-DD>.md`, con hallazgos numerados `H-01`… (severidad y `archivo:línea`), agrupados en pasos por tarea, y cada duda marcada **❓ Decisión pendiente**.
5. **Detenerse:** presentarle a Jordin el resumen y **no corregir nada** hasta que lo indique.
6. El plan de la auditoría entra a `develop` con el título `[JG-xx] Plan de la auditoría <AAAA-MM-DD>`, donde `JG-xx` es la tarea de convergencia en curso.

### E3. Corregir una tarea ya integrada

Como la sección B, con estas diferencias: la tarea ya está `hecha` y puede ser de otra persona; las **❓ Decisión pendiente** se preguntan antes de cada paso; la rama es `jordin/<ID>-auditoria-<tema>`; el título del PR es `[<ID>] Correcciones de la auditoría: <tema>`; cada hallazgo corregido lleva una prueba que lo habría detectado; dentro de `## Resultado` se agrega `### Correcciones de la auditoría (AAAA-MM-DD)`; el estado de la tarea no cambia.

### E4. Terminar la tarea de otra persona que no está integrada

1. Preguntarle a Jordin si ya le avisó al dueño.
2. Rama nueva `jordin/<ID>-<descripcion>` a partir de la rama del PR del dueño (`git fetch origin <rama>` y `git switch --no-track -c jordin/<ID>-… origin/<rama>`). Nunca *push* a la rama del dueño.
3. PR nuevo del coordinador; se cierra el original con `gh pr close <n> --comment "Lo continúa #<nuevo> (protocolo §E4)"`.
4. Cierre normal (B9 y B10), mencionando en `## Resultado` que lo terminó el coordinador.

### E5. Revisión de los PR del coordinador

Si el autor del PR es el coordinador, tocar archivos de otra persona no es un problema de alcance. El revisor comprueba en cambio que cada cambio corresponda a un hallazgo de auditoría, al título o a la tarea del PR, que no se debilitó ninguna prueba y que la bitácora tiene el aviso para cada persona afectada.

---

## F. Convergencia

En las tareas de convergencia (JG-12, JG-13, JG-17), el agente del coordinador sigue `plan/prompts/convergencia.md`: compara `specs/` y el prototipo con lo que hay en `develop`, convierte cada brecha en una tarea nueva para su dueño y reprograma el calendario para que el 02/11 siga siendo alcanzable.
