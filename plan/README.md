# Plan de desarrollo de INCOVSA: guía rápida

> **Si es la primera vez que trabajas así, lee esta página completa (10 minutos).** Todo lo demás lo lee tu agente de IA.

## ¿Cómo trabajamos?

Usamos **desarrollo dirigido por especificaciones** con agentes de IA (specs/16, decisiones 59 a 86):

1. **Lo que hay que construir ya está escrito.** `specs/` describe todo el sistema (requisitos, reglas, datos, decisiones) y el prototipo aprobado (`entregable-1/prototipos/`) muestra cómo se ve y cómo se comporta cada pantalla.
2. **El trabajo está dividido en tareas pequeñas.** Cada una está en un archivo de `plan/tareas/`, con su responsable, qué leer, qué hacer, qué archivos tocar, cómo verificar que funciona, de qué depende y qué día se hace.
3. **Tu agente hace el trabajo.** Busca tus tareas, las implementa con pruebas, las compara con el prototipo, abre el *pull request* y lo deja integrándose en `develop`. Un **bot de Claude** revisa cada PR y GitHub lo integra solo cuando todo pasa. Tú solo das la instrucción y respondes si el agente necesita algo que no puede conseguir.

Todo agente (Claude Code, Codex, Cursor o Antigravity) lee `AGENTS.md`. Ahí están las reglas y el procedimiento: no tienes que explicarle nada.

## Antes de empezar (una sola vez)

Tu primera tarea (`JG-01`, `CE-01`, `DM-01`, `JM-01` o `JC-01`) es dejar tu agente con sus herramientas obligatorias: **GitHub CLI**, **Context7** y **Playwright**, más next-devtools y shadcn. Dile a tu agente:
> Soy **<tu nombre>**. Implementa mi primera tarea siguiendo el protocolo.

Te pedirá lo que no pueda hacer solo (instalar algo con ventana, iniciar sesión, tu clave de Context7), paso a paso, según `plan/instalacion.md`. **Hasta que termine esa tarea no se empieza ninguna otra.**

## Tu rutina en cada sesión de trabajo

Abre tu agente **dentro de la carpeta `proyecto_incovsa`** y usa estos mensajes.

**1. Ver qué te toca:**
> Soy **<tu nombre>**. Revisa el plan y dime qué tareas me tocan.

**2. Mandarla a hacer:**
> Implementa la tarea **<ID>** siguiendo el protocolo. No te detengas hasta integrarla, salvo que necesites algo que no puedas obtener.

**3. Seguir con la próxima (opcional):**
> Continúa con mi siguiente tarea disponible.

**Solo en Claude Code**, en modo auto: `/goal La tarea <ID> está integrada en develop: su PR está mergeado, el archivo de la tarea dice "estado: hecha" y todos los comandos de su sección Verificación pasaron`.

## ¿Cuándo te va a preguntar algo tu agente?

Solo en estos casos:
- Necesita una **credencial, una cuenta, un dato de INCOVSA o un acceso** que no tiene.
- Encontró algo que **`specs/` y el prototipo no resuelven** y que se vería en pantalla, o una decisión importante: una librería nueva, un cambio en la base de datos o en archivos de otro compañero, o algo de seguridad. Te dará opciones y una recomendación. Si no estás seguro, pregúntale a Jordin.
- Algo **falla una y otra vez**: 5 intentos con la CI o 3 enfoques distintos para el mismo error.

Si no puedes responder en ese momento, pídele: "Marca la tarea como bloqueada con este motivo: …".

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| [`instalacion.md`](instalacion.md) | Qué instalar y configurar, por sistema y por agente |
| [`calendario.md`](calendario.md) | Fechas, hitos, guiones de demostración y el calendario por día |
| [`protocolo.md`](protocolo.md) | El procedimiento que sigue el agente, paso a paso |
| [`convenciones.md`](convenciones.md) | Estructura del código, qué carpeta es de quién y reglas técnicas |
| [`tareas/`](tareas/) | **Una tarea por archivo.** El nombre empieza con el prefijo de su responsable |
| [`bitacora/`](bitacora/) | Un diario por persona, donde el agente anota qué hizo |
| [`prompts/`](prompts/) | Instrucciones de la revisión (local y del bot) y de la convergencia |
| [`investigacion-desarrollo-con-agentes-ia.md`](investigacion-desarrollo-con-agentes-ia.md) | El informe en que se basa este método (solo de consulta) |

## Quién hace qué

| Persona | Clave | Prefijo | Responsabilidad |
|---|---|---|---|
| **Jordin García** | `jordin` | JG | Base del proyecto, esquema de la base de datos, autenticación, permisos, bitácora, tiempo real, CI y bot, calidad y seguridad, convergencias, Documento 6, capacitación y presentación |
| **Carlos Hugo Escobar** | `carlos` | CE | Configuración (camiones), usuarios de los dos sistemas, producción con Docker, despliegue, respaldos, Documentos 1 y 5, anexos de entrega |
| **Daniela Marín** | `daniela` | DM | Sitio público, panel del sitio, solicitudes, documentación interna, Documento 3 |
| **Josué Menéndez** | `josue` | JM | Conversión de kg a unidades, Bodega, tablero y Ruta, Documento 4 |
| **José Daniel Cifuentes** | `jose-daniel` | JC | Lectura del archivo de Odoo, Facturación, Reportes y exportaciones, Documento 2 |

Estado del plan: `node scripts/tareas.mjs` (equipo) o `node scripts/tareas.mjs --persona <clave>`. Qué te toca hoy: `node scripts/tareas.mjs --hoy <clave>`. Desde JG-08, el issue fijo "Tablero del plan" te avisa cada mañana.

## Reglas de oro

1. **Nunca se trabaja directo en `develop` ni en `main`.** El agente siempre crea una rama y un PR.
2. **Nada se inventa.** Lo que no dicen `specs/` ni el prototipo se pregunta.
3. **No edites a mano las tareas de otro compañero.** Si algo suyo falla, tu agente crea una tarea nueva para esa persona. La excepción es Jordin, que audita y puede corregir el trabajo de cualquiera.
4. **Si la CI está en rojo en `develop`**, avisa al grupo: tiene prioridad sobre todo lo demás.
5. **Las fechas no se mueven:** el desarrollo termina el lunes 02/11/2026. Nada del alcance se recorta.

## Preguntas frecuentes

**¿Tengo que revisar el código que escribe el agente?** No es obligatorio: la CI, las pruebas, la revisión local y el bot lo verifican. Pero lee el resumen de cada PR para poder explicar tu parte en la presentación y en tu documento.

**¿Qué pasa si mi tarea depende de la de otra persona que no ha terminado?** El script la muestra "en espera" y dice de quién depende. Avísale o haz otra de tus tareas disponibles.

**¿Dónde veo cómo debe verse una pantalla?** `node scripts/servir-prototipo.mjs` y abre http://127.0.0.1:4173/. Entra con el botón "Demostración".
