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
