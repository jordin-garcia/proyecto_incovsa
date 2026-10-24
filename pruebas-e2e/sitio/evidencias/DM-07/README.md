# DM-07 · Noticias en el panel y en el sitio

## Implementación

`/panel/noticias` exige `sit.noticias` para leer y modificar. La galería reutiliza `CampoGaleria` y el almacenamiento de DM-04. El formulario comparte el esquema Zod de título y texto con el servidor. La ruta multipart `/panel/noticias/publicar` controla sesión, permiso, origen y tamaño antes de procesar imágenes de hasta 5 MB; admite de una a cinco. No se modifican límites compartidos ni archivos protegidos.

Las operaciones guardan la noticia, su galería ordenada y la bitácora en la misma transacción. La fecha de publicación se asigna al crear y no se cambia al editar. Solo se pueden conservar referencias pertenecientes a esa noticia; las imágenes retiradas se borran del almacenamiento. La eliminación también borra su galería. Se invalida el layout del sitio después de cada publicación o eliminación.

La lectura pública selecciona únicamente ID, título, texto, fecha y direcciones de las imágenes, de la publicación más reciente a la más antigua. `/noticias` usa las galerías y el pie existentes; muestra cada noticia completa, respeta saltos de línea y parte palabras largas. Por debajo de 860 px la imagen queda encima del texto, como el prototipo.

No se inventa contenido inicial (P-23). Se omiten la nota amarilla, Demostración y la leyenda académica del prototipo conforme a specs/20. No existe estado de publicación, opción de ocultar ni migración nueva.

## Pruebas y fase roja

- Integración: la primera ejecución falló por ausencia de `acciones-noticias`; después se verificaron publicación, edición, fecha conservada, bitácora y eliminación física, cinco archivos reales, rechazo de cero/seis imágenes y referencias ajenas, orden y protección de acciones, lectura privada y ruta multipart.
- E2E: la fase roja falló al buscar el encabezado de Noticias, porque la página no existía. Se prueban estados vacíos, creación, validación sin imágenes, edición, texto completo con salto de línea y palabra de 80 caracteres, disposición responsiva, confirmación cancelada y aceptada, desaparición pública y las tres operaciones de bitácora.
- Las pruebas usan cuentas y bases de desarrollo. Las E2E aíslan las noticias con un candado de PostgreSQL y restauran las filas originales incluso si fallan. Cada prueba usa un título único para no confundir entradas de bitácora de ejecuciones anteriores.
- La prueba espera el cierre del diálogo y el aviso «Noticia eliminada.» antes de navegar: contar filas por rol mientras el diálogo las oculta no demuestra que el servidor terminó.
- Axe completo comprueba los estados públicos, panel, formulario y confirmación sin omitir contraste.

## Capturas comparativas

Cada enlace agrupa teléfono (390 px), tableta (768 px) y escritorio (1440 px).

| Estado | Aplicación | Prototipo |
|---|---|---|
| Público vacío | [390](publico-vacio-390.png), [768](publico-vacio-768.png), [1440](publico-vacio-1440.png) | [390](prototipo-publico-vacio-390.png), [768](prototipo-publico-vacio-768.png), [1440](prototipo-publico-vacio-1440.png) |
| Panel vacío | [390](panel-vacio-390.png), [768](panel-vacio-768.png), [1440](panel-vacio-1440.png) | [390](prototipo-panel-vacio-390.png), [768](prototipo-panel-vacio-768.png), [1440](prototipo-panel-vacio-1440.png) |
| Nueva noticia | [390](nueva-390.png), [768](nueva-768.png), [1440](nueva-1440.png) | [390](prototipo-nueva-390.png), [768](prototipo-nueva-768.png), [1440](prototipo-nueva-1440.png) |
| Validación | [390](error-390.png), [768](error-768.png), [1440](error-1440.png) | [390](prototipo-error-390.png), [768](prototipo-error-768.png), [1440](prototipo-error-1440.png) |
| Panel con noticia | [390](panel-publicada-390.png), [768](panel-publicada-768.png), [1440](panel-publicada-1440.png) | [390](prototipo-panel-publicada-390.png), [768](prototipo-panel-publicada-768.png), [1440](prototipo-panel-publicada-1440.png) |
| Edición | [390](editar-390.png), [768](editar-768.png), [1440](editar-1440.png) | [390](prototipo-editar-390.png), [768](prototipo-editar-768.png), [1440](prototipo-editar-1440.png) |
| Publicación completa | [390](publico-publicada-390.png), [768](publico-publicada-768.png), [1440](publico-publicada-1440.png) | [390](prototipo-publico-publicada-390.png), [768](prototipo-publico-publicada-768.png), [1440](prototipo-publico-publicada-1440.png) |
| Confirmación de eliminación | [390](eliminar-390.png), [768](eliminar-768.png), [1440](eliminar-1440.png) | [390](prototipo-eliminar-390.png), [768](prototipo-eliminar-768.png), [1440](prototipo-eliminar-1440.png) |

## Revisión independiente

El revisor leyó la tarea, su contexto, servicios, acciones, ruta multipart, formulario, pruebas y capturas de los tres tamaños, siguiendo `plan/prompts/revision.md`. No modificó archivos ni ejecutó pruebas en paralelo. [Veredicto: LISTO, sin hallazgos de corrección ni opcionales](revision.md).

## Verificación local · 22/10/2026

Sobre `develop` con JC-06 y JM-04 integradas:

- `node scripts/tareas.mjs --validar`: plan válido, 63 tareas.
- `npm run verificar`: formato, lint y tipos aprobados; **345 pruebas en 39 archivos**, todas aprobadas.
- `npm run build`: compilación, tipos y generación de páginas correctas; incluye `/noticias`, `/panel/noticias` y `/panel/noticias/publicar`.
- `npm run e2e -- pruebas-e2e/sitio/noticias.spec.ts --workers=1`: **6 aprobadas**, sin reintentos, con axe y capturas en los tres tamaños.
- `node --test scripts/design-system.test.mjs`: **3 aprobadas**, sin omisiones.
- `node scripts/archivos-protegidos.mjs InAlexa`: sin archivos protegidos no permitidos, 63 archivos revisados en el commit de implementación. `.codex/config.toml` se conserva fuera del PR.
- Next-devtools, `get_errors`: `configErrors: []`, `sessionErrors: []` al recorrer Noticias. La consola del recorrido público solo registra el 404 de `/favicon.ico`, que tampoco existe en `origin/develop`; no se modifica el layout ni se crea una imagen fuera del alcance.

## Pausa solicitada por Daniela · 22/10/2026

Se detuvo la suite completa y sus procesos por petición expresa de Daniela. **No hay resultado final de la suite general ni PR abierto. La tarea permanece pendiente.** Antes de la pausa, el despacho de Bodega falló inicialmente y pasó al reintentar el grupo; Reportes en teléfono agotó inicialmente los 30 segundos. No se modificaron pruebas ni código de esos módulos. El equipo tenía aproximadamente 500 MB de memoria física libre. Debe repetirse la suite completa antes del cierre.

Rama: `daniela/DM-07-noticias-panel`; implementación y 48 capturas en el commit `c206720`. Este resumen de verificación permanece como cambio local. También hay capturas ajenas regeneradas por la suite, que deben excluirse del PR. Los cambios de capturas que ya existían antes de DM-07 están conservados en el stash «Capturas locales previas a DM-07». `.codex/config.toml` sigue intacto y fuera de los commits.

Para retomar: completar B7 (suite general y diagnóstico de fallos persistentes), actualizar esta evidencia, completar B9 (Resultado de la tarea y bitácora), validar el cierre y seguir B10/B11 hasta integrar en `develop`. No se debe declarar terminada ni omitir verificaciones pendientes.

## Reanudación y decisión pendiente · 23/10/2026

Se incorporó `origin/develop` en `5046267`, con JG-11 y JG-12. Se instaló con `npm ci` sin cambiar dependencias ni el lockfile; la base local no tenía migraciones pendientes. La ruta POST ahora exige explícitamente `sit.noticias` y la prueba invoca el endpoint real.

La revisión según la decisión 89 encontró tres diferencias de diseño: errores inline en vez del primer aviso flotante, dimensiones de galería y ancho de la primera columna. Se comprobaron en rojo y se corrigieron únicamente en Noticias. Las dos E2E de escritorio pasaron después de los ajustes, con axe y las aserciones originales conservadas. Falta repetir los demás tamaños, la verificación general y completar el cierre tras resolver el bloqueo.

**Bloqueo de diseño y accesibilidad:** el gris `--g500` del área de subida del prototipo produce una violación seria de axe: contraste 4,4:1, inferior a 4,5:1. [Evidencia reproducida contra el prototipo](contraste-prototipo.json). La implementación conserva `--g600`, que pasa axe. El protocolo §C y la decisión 89 requieren consultar cuando seguir el diseño haría fallar una prueba. Daniela confirmó que la consulta a Jordin queda pendiente. No se cambia el prototipo, las especificaciones protegidas ni el criterio de axe sin esa decisión; el código no se integra.

Los cambios de capturas preexistentes y los regenerados durante la pausa están conservados en stashes identificados. `.codex/config.toml` sigue fuera de los commits. La implementación permanece en `daniela/DM-07-noticias-panel`; el registro de bloqueo se tramita en un PR separado que solo modifica la tarea y la bitácora.

## Reanudación autorizada · 23/10/2026

Se incorporó `develop` con el desbloqueo de Jordin, registrado en la tarea, `specs/18` y `specs/20`. Se conserva `--g600` sin modificar axe. Los ajustes del estado al pasar el cursor y del relleno del componente compartido quedan para JG-24, como indica el coordinador.

- `npm ci`: 854 paquetes instalados, sin cambios de dependencias ni lockfile y cero vulnerabilidades informadas.
- `npm run db:aplicar`: dos migraciones existentes, ninguna pendiente.
- `node scripts/tareas.mjs --validar`: plan válido, 66 tareas.
- `node --test scripts/design-system.test.mjs`: tres aprobadas, ninguna omitida.
- `npm run verificar`: formato, lint y tipos aprobados; 356 pruebas aprobadas en 42 archivos, código de salida 0.
- `npm run build`: compilación, tipos, páginas y artefacto standalone aprobados; incluye `/noticias`, `/panel/noticias` y `/panel/noticias/publicar`.
- `npm run e2e -- pruebas-e2e/sitio/noticias.spec.ts --workers=1`: seis aprobadas en 2,3 minutos, sin reintentos; incluye axe y capturas en 390, 768 y 1440 px.
- Playwright MCP abrió la aplicación y el prototipo. Next-devtools en el puerto 3000 devuelve `configErrors: []` y `sessionErrors: []`. La consola pública conserva únicamente el 404 preexistente de `/favicon.ico`.
- Revisión independiente actualizada: LISTO, sin hallazgos de corrección ni opcionales; ver `revision.md`.

La verificación general, la compilación y la batería E2E completa deben terminar antes del cierre. `.codex/config.toml` y las capturas regeneradas de otras tareas no se incluyen en el PR.
