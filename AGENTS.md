# AGENTS.md — Instrucciones para los agentes de IA del proyecto INCOVSA

Este repositorio construye **una sola aplicación web** para INCOVSA (Industria del Cuero Covadonga S. A.): el **sitio web institucional autoadministrable** (sitio público, panel y documentación interna) y el **sistema de control logístico de bodega (picking)**. La usará una empresa real: se exige la máxima calidad y seguridad.

Trabajamos con **desarrollo dirigido por especificaciones**:
- **`specs/` es la fuente de verdad.** Si el código, una tarea o el prototipo la contradicen, vale `specs/`.
- **El prototipo de simulación aprobado** (`entregable-1/prototipos/prototipo-simulacion-incovsa.html`, con su código fuente en `entregable-1/prototipos/simulacion/src/`) es la referencia de **diseño y comportamiento** en todo lo que `specs/` no detalla.
- **Las tareas de `plan/tareas/`** dicen qué construir, quién lo hace y cómo se verifica.

## Antes de hacer cualquier cosa

1. **Lee `plan/protocolo.md` completo.** Es el procedimiento obligatorio para buscar, implementar e integrar tareas.
2. **Averigua quién es el usuario.** Pregúntaselo o dedúcelo con `git config user.name` o `gh api user --jq .login`:

| Persona (clave) | Nombre | GitHub | Prefijo | Agente y equipo |
|---|---|---|---|---|
| `jordin` | Jordin García (coordinador) | jordin-garcia | JG | Claude Code y Codex, Windows |
| `carlos` | Carlos Hugo Escobar | carloshugoeg | CE | Cursor, macOS |
| `daniela` | Daniela Marín | InAlexa | DM | Codex, Windows |
| `josue` | Josué Menéndez | Josh-JM | JM | Codex, Windows |
| `jose-daniel` | José Daniel Cifuentes | JDaniC | JC | Codex, macOS |

3. **Solo implementa tareas de esa persona** y solo las disponibles (sin dependencias pendientes): `node scripts/tareas.mjs --persona <clave>`.
   **Excepción: el coordinador (`jordin`)** está autorizado de forma permanente a corregir, terminar o modificar el trabajo de cualquier persona, según `plan/protocolo.md` §E.
4. **Sigue el calendario.** Cada tarea tiene el día en que debe integrarse (`programada`). Entre las disponibles, primero las atrasadas y luego la del día (`--persona` y `--siguiente` ya las dan en ese orden).
5. **La primera tarea de cada persona (`XX-01`) instala y verifica las herramientas obligatorias del agente.** Hasta que esté hecha, no se implementa ninguna otra.

## Herramientas obligatorias

| Herramienta | Para qué se usa, siempre |
|---|---|
| **GitHub CLI (`gh`)** | Todo lo de GitHub: PR, verificaciones, integración automática, issues del tablero |
| **Context7** (MCP o plugin) | **Antes de escribir código con cualquier librería**, consulta su documentación vigente: Next.js 16, React 19, Prisma 7, Better Auth 1.7, Tailwind CSS 4, shadcn/ui, Zod 4, dnd-kit, React Hook Form, date-fns 4, SheetJS, pdfmake, sharp, Vitest, Playwright. No escribas APIs de memoria: estas versiones son recientes |
| **Playwright** (MCP o plugin) | Abrir el prototipo y la aplicación, comparar pantallas, tomar capturas de evidencia y depurar pruebas de extremo a extremo |
| **next-devtools** (MCP) | Leer los errores de compilación, de ejecución y de tipos del servidor de desarrollo de Next.js |
| **shadcn** (MCP) | Buscar e instalar componentes de shadcn/ui correctamente |

La instalación en cada harness (Claude Code, Codex, Cursor y Antigravity) está en `plan/instalacion.md` §6.

## Pedidos habituales del usuario

- **"¿Qué me toca?" / "Revisa el plan"**: ejecuta `node scripts/tareas.mjs --hoy <clave>` y `node scripts/tareas.mjs --persona <clave>`, lee los archivos de las tareas disponibles y resúmelas: qué hace cada una, su fecha programada y de quién depende lo que está en espera. Empieza por lo atrasado y lo de hoy. Incluye los avisos que los demás le dejaron en sus bitácoras (`plan/protocolo.md` §A, paso 5). Recomienda la siguiente según el calendario. **No implementes nada todavía.**
- **"Implementa <ID>"** o **"continúa"**: sigue la sección B de `plan/protocolo.md` de principio a fin, hasta que el *pull request* quede integrado en `develop`, **sin volver a preguntarle al usuario**, salvo en los casos de "Preguntar antes" o si necesitas algo a lo que no puedes acceder. **Una sola tarea por conversación**: al integrarla, no sigas con otra; pídele al usuario que abra una conversación nueva.
- **"Audita <ID>"** o **"audita lo integrado"** (solo el coordinador): `plan/protocolo.md` §E2.

## Comandos

| Qué | Comando |
|---|---|
| Plan | `node scripts/tareas.mjs --persona <clave>` · `--hoy [<clave>]` · `--ver <ID>` · `--siguiente <clave>` · `--validar` · `--validar-cierre "[<ID>] <título>"` |
| Entorno | `node scripts/verificar-entorno.mjs` |
| Prototipo | `node scripts/servir-prototipo.mjs` → http://127.0.0.1:4173/ |
| Aplicación (desde JG-02) | `npm install` · `npm run dev` · `npm run build` |
| Calidad (desde JG-02) | `npm run formato` · `npm run lint` · `npm run tipos` · `npm test` · `npm run e2e` · `npm run verificar` (formato, lint, tipos y pruebas) |
| Base de datos (desde JG-03) | `npm run db:aplicar` (migraciones) · `npm run db:semilla` · `npm run semilla:demo` · `npm run db:reiniciar` (solo tu base local). **`npm run db:migrar` (crear migraciones) solo lo usa el coordinador** |
| Administrador inicial (desde JG-06) | `npm run crear-admin` |
| GitHub | `gh pr create` · `gh pr checks --watch` · `gh pr merge --auto --squash --delete-branch` |

## Dónde está cada cosa

- `specs/`: alcance, glosario, roles y permisos, requisitos (RF/RNF), módulos, reglas de negocio (RN), modelo de datos, arquitectura y **decisiones técnicas** (`specs/16`), historial y pendientes (`specs/19`). **Si el código las contradice, el código está mal.**
- `entregable-1/prototipos/`: el prototipo aprobado. Cada pantalla está en `simulacion/src/` (`sitio.js`, `panel.js`, `picking.js`, `tablero.js`, `base.js`, `estilos.css`). Se abre con `node scripts/servir-prototipo.mjs`.
- `plan/`: guía rápida, instalación, protocolo, convenciones, calendario, `tareas/` (una por archivo), `bitacora/` (una por persona) y `prompts/` (revisión y convergencia).
- `src/`, `prisma/`, `pruebas-e2e/`, `scripts/`: el código, con la estructura de `specs/16` y `plan/convenciones.md` §1. Qué carpeta es de quién: `plan/convenciones.md` §2.

## Límites

**✅ Siempre**
- Implementa **una sola tarea por conversación**, para no exceder la ventana de contexto del agente (`specs/16`, decisión 88). Si en esta conversación ya trabajaste otra tarea, detente y pídele al usuario que abra una nueva.
- Trabaja en una rama `<clave>/<ID>-<descripcion-corta>` creada desde un `develop` actualizado.
- Consulta Context7 antes de usar la API de una librería, y compara cada pantalla con el prototipo usando Playwright.
- Escribe primero las pruebas de los criterios de aceptación y nómbralas con el código del requisito o la regla (`RN-01: …`).
- Ejecuta los comandos de la sección **Verificación** de la tarea y muestra su salida como evidencia en el PR.
- Haz la revisión en contexto limpio con `plan/prompts/revision.md` antes de abrir el PR.
- En el mismo PR, pon `estado: hecha` en el archivo de la tarea, agrega `## Resultado` y una entrada en `plan/bitacora/<clave>.md`.
- Escribe el código, los *commits*, el PR y los comentarios en español, con los nombres de `specs/02-glosario.md`.
- En cada operación del servidor, verifica sesión, permiso y sede con `exigirPermiso` antes de leer o cambiar datos, y valida toda entrada con Zod (`specs/16`, "Seguridad").

**⚠️ Preguntar antes** (detente y pregúntale al usuario, con opciones y tu recomendación)
- Agregar una dependencia que no esté en `package.json`.
- Modificar archivos de otra persona que la tarea no menciona, o un "archivo protegido" (`plan/convenciones.md` §3). Si la persona es el coordinador, no hace falta preguntar (protocolo §E1).
- Contradecir o cambiar una decisión de `specs/16` o cualquier regla de `specs/`.
- Cualquier cosa que requiera cuentas, credenciales, datos de INCOVSA o servicios externos.

**🚫 Nunca**
- Inventar requisitos, textos, datos, pantallas o comportamientos. Si `specs/` y el prototipo no lo dicen, sigue `plan/protocolo.md` §C.
- Hacer *push* directo a `develop` o a `main`, `git push --force` sobre ramas ajenas, `--no-verify`, ni desactivar u omitir verificaciones de la CI.
- Borrar, debilitar, saltar (`.skip`, `.only`) o reducir pruebas o umbrales para que la CI pase.
- Leer, mostrar o hacer *commit* de secretos o archivos `.env`. Las credenciales de ejemplo van en `.env.example`.
- Crear o modificar migraciones o `prisma/schema.prisma` si no eres el coordinador.
- Usar modos sin confirmación (`--dangerously-skip-permissions`, `--yolo` o similares).
- Implementar tareas de otra persona, salvo el coordinador (protocolo §E4), o marcar como hecha una tarea sin verificarla.

## Definición de terminado

Una tarea está terminada cuando se cumplen todas estas condiciones:
1. Todos sus criterios de aceptación tienen una prueba automatizada que pasa.
2. `npm run verificar` pasa en local, y en la CI pasan todas las verificaciones obligatorias, incluida la del bot de revisión (`revision-claude`).
3. Si la tarea tiene pantallas, coinciden con el prototipo: mismos textos, datos, orden, estados y colores del design system, en teléfono, tableta y escritorio, con capturas como evidencia (`plan/convenciones.md` §7).
4. Si se precisó algún comportamiento que `specs/` no decía, quedó registrado en `specs/` y en `specs/18-historial-de-decisiones.md`.
5. La revisión en contexto limpio no deja hallazgos de corrección.
6. El PR quedó integrado en `develop`.
