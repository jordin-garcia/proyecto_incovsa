# DM-11 · Revisión integral y rendimiento

**Revisión del 28/10, después de CE-13 integrada en [#143](https://github.com/jordin-garcia/proyecto_incovsa/pull/143).** Se incorporaron las correcciones y la regla D-08: las pruebas nuevas usan la ayuda de evidencia y solo escriben capturas o mediciones con `EVIDENCIA=1`. Las capturas se regeneraron sobre esta base y también incluyen Catálogo › Editar producto, con el nombre enfocado sin seleccionar.

La verificación del 28/10 aprobó formato, lint, tipos, **440 pruebas en 52 archivos** y compilación (`verificacion-local.txt` y `compilacion.txt`). La ejecución propia (`e2e-propios.txt`) aprobó 41 casos; el de teléfono no llegó a medir por el arranque en frío H-84 y pasó íntegro al repetirlo (`e2e-rendimiento-telefono.txt`). El 29/10 se incorporó JG-25 (#146), que corrige H-84: **formato, lint, tipos, 450 pruebas en 54 archivos y compilación aprobados**, en `verificacion-final.txt` y `compilacion-final.txt`. En la batería general de esta base, **los 42 casos de DM-11 pasan sin reintentos**, incluidas las tres mediciones de producción.

La primera batería del sitio y panel aprobó 183 de 186 casos; las tres fallas medían contraste durante la entrada de los diálogos de Documentos. Se espera ahora su animación real antes de axe, sin cambiar colores ni reglas. Los seis casos de Documentos pasaron después en los tres tamaños, sin guardar capturas. En la batería completa posterior, **los 186 casos del sitio y panel pasan**, incluidos los 42 de DM-11.

La batería general del 29/10 (`e2e-completo-final.txt`) terminó con **408 aprobados, 16 fallidos al autenticarse en producción y 52 no ejecutados por los grupos seriales**. JG-25 rechaza las claves de ejemplo en producción. Una comprobación aislada confirmó HTTP 200 con claves temporales válidas y la cabecera de IP de confianza. Los 68 casos afectados se repitieron íntegros en `e2e-produccion-final.txt`, con dos claves aleatorias distintas solo en las variables del proceso: **65 aprobados, un timeout por retirada del botón del DOM en Bodega de teléfono y dos casos sin ejecutar del mismo grupo**. La repetición íntegra de esos tres pasó (`e2e-bodega-telefono-final.txt`, SSE 320 ms). **Cobertura final de los 476 casos, sin fallos pendientes**. No se inspeccionan, muestran, editan ni agregan archivos de secretos al PR, ni se modifican las pruebas o las exigencias de autenticación.

Capturas de Playwright de todas las páginas públicas, detalle de producto y secciones del panel. Las cuentas 08, 09 y 10 verifican los permisos del sitio; Usuarios se revisa con Gerencia (01), sin modificar su implementación.

La aplicación omite los controles de Demostración, notas amarillas P-xx, ejemplos PDF incrustados y leyenda del prototipo conforme a specs/20. La lista de productos de Industrias procede de la relación del catálogo según P-97. Las diferencias de datos de prueba y los ajustes de contraste ya autorizados no son cambios de diseño de DM-11.

## Comparación en tres tamaños

| Pantalla | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| inicio | [Aplicación](aplicacion-inicio-390.png) · [Prototipo](prototipo-inicio-390.png) | [Aplicación](aplicacion-inicio-768.png) · [Prototipo](prototipo-inicio-768.png) | [Aplicación](aplicacion-inicio-1440.png) · [Prototipo](prototipo-inicio-1440.png) |
| nosotros | [Aplicación](aplicacion-nosotros-390.png) · [Prototipo](prototipo-nosotros-390.png) | [Aplicación](aplicacion-nosotros-768.png) · [Prototipo](prototipo-nosotros-768.png) | [Aplicación](aplicacion-nosotros-1440.png) · [Prototipo](prototipo-nosotros-1440.png) |
| industrias | [Aplicación](aplicacion-industrias-390.png) · [Prototipo](prototipo-industrias-390.png) | [Aplicación](aplicacion-industrias-768.png) · [Prototipo](prototipo-industrias-768.png) | [Aplicación](aplicacion-industrias-1440.png) · [Prototipo](prototipo-industrias-1440.png) |
| productos | [Aplicación](aplicacion-productos-390.png) · [Prototipo](prototipo-productos-390.png) | [Aplicación](aplicacion-productos-768.png) · [Prototipo](prototipo-productos-768.png) | [Aplicación](aplicacion-productos-1440.png) · [Prototipo](prototipo-productos-1440.png) |
| detalle | [Aplicación](aplicacion-detalle-390.png) · [Prototipo](prototipo-detalle-390.png) | [Aplicación](aplicacion-detalle-768.png) · [Prototipo](prototipo-detalle-768.png) | [Aplicación](aplicacion-detalle-1440.png) · [Prototipo](prototipo-detalle-1440.png) |
| noticias | [Aplicación](aplicacion-noticias-390.png) · [Prototipo](prototipo-noticias-390.png) | [Aplicación](aplicacion-noticias-768.png) · [Prototipo](prototipo-noticias-768.png) | [Aplicación](aplicacion-noticias-1440.png) · [Prototipo](prototipo-noticias-1440.png) |
| contacto | [Aplicación](aplicacion-contacto-390.png) · [Prototipo](prototipo-contacto-390.png) | [Aplicación](aplicacion-contacto-768.png) · [Prototipo](prototipo-contacto-768.png) | [Aplicación](aplicacion-contacto-1440.png) · [Prototipo](prototipo-contacto-1440.png) |
| acceso | [Aplicación](aplicacion-acceso-390.png) · [Prototipo](prototipo-acceso-390.png) | [Aplicación](aplicacion-acceso-768.png) · [Prototipo](prototipo-acceso-768.png) | [Aplicación](aplicacion-acceso-1440.png) · [Prototipo](prototipo-acceso-1440.png) |
| ejemplo.08-resumen | [Aplicación](aplicacion-ejemplo.08-resumen-390.png) · [Prototipo](prototipo-ejemplo.08-resumen-390.png) | [Aplicación](aplicacion-ejemplo.08-resumen-768.png) · [Prototipo](prototipo-ejemplo.08-resumen-768.png) | [Aplicación](aplicacion-ejemplo.08-resumen-1440.png) · [Prototipo](prototipo-ejemplo.08-resumen-1440.png) |
| ejemplo.08-contenido | [Aplicación](aplicacion-ejemplo.08-contenido-390.png) · [Prototipo](prototipo-ejemplo.08-contenido-390.png) | [Aplicación](aplicacion-ejemplo.08-contenido-768.png) · [Prototipo](prototipo-ejemplo.08-contenido-768.png) | [Aplicación](aplicacion-ejemplo.08-contenido-1440.png) · [Prototipo](prototipo-ejemplo.08-contenido-1440.png) |
| ejemplo.08-industrias | [Aplicación](aplicacion-ejemplo.08-industrias-390.png) · [Prototipo](prototipo-ejemplo.08-industrias-390.png) | [Aplicación](aplicacion-ejemplo.08-industrias-768.png) · [Prototipo](prototipo-ejemplo.08-industrias-768.png) | [Aplicación](aplicacion-ejemplo.08-industrias-1440.png) · [Prototipo](prototipo-ejemplo.08-industrias-1440.png) |
| ejemplo.08-catalogo | [Aplicación](aplicacion-ejemplo.08-catalogo-390.png) · [Prototipo](prototipo-ejemplo.08-catalogo-390.png) | [Aplicación](aplicacion-ejemplo.08-catalogo-768.png) · [Prototipo](prototipo-ejemplo.08-catalogo-768.png) | [Aplicación](aplicacion-ejemplo.08-catalogo-1440.png) · [Prototipo](prototipo-ejemplo.08-catalogo-1440.png) |
| ejemplo.08-noticias | [Aplicación](aplicacion-ejemplo.08-noticias-390.png) · [Prototipo](prototipo-ejemplo.08-noticias-390.png) | [Aplicación](aplicacion-ejemplo.08-noticias-768.png) · [Prototipo](prototipo-ejemplo.08-noticias-768.png) | [Aplicación](aplicacion-ejemplo.08-noticias-1440.png) · [Prototipo](prototipo-ejemplo.08-noticias-1440.png) |
| ejemplo.08-contacto | [Aplicación](aplicacion-ejemplo.08-contacto-390.png) · [Prototipo](prototipo-ejemplo.08-contacto-390.png) | [Aplicación](aplicacion-ejemplo.08-contacto-768.png) · [Prototipo](prototipo-ejemplo.08-contacto-768.png) | [Aplicación](aplicacion-ejemplo.08-contacto-1440.png) · [Prototipo](prototipo-ejemplo.08-contacto-1440.png) |
| ejemplo.08-solicitudes | [Aplicación](aplicacion-ejemplo.08-solicitudes-390.png) · [Prototipo](prototipo-ejemplo.08-solicitudes-390.png) | [Aplicación](aplicacion-ejemplo.08-solicitudes-768.png) · [Prototipo](prototipo-ejemplo.08-solicitudes-768.png) | [Aplicación](aplicacion-ejemplo.08-solicitudes-1440.png) · [Prototipo](prototipo-ejemplo.08-solicitudes-1440.png) |
| ejemplo.08-documentos | [Aplicación](aplicacion-ejemplo.08-documentos-390.png) · [Prototipo](prototipo-ejemplo.08-documentos-390.png) | [Aplicación](aplicacion-ejemplo.08-documentos-768.png) · [Prototipo](prototipo-ejemplo.08-documentos-768.png) | [Aplicación](aplicacion-ejemplo.08-documentos-1440.png) · [Prototipo](prototipo-ejemplo.08-documentos-1440.png) |
| ejemplo.09-documentos | [Aplicación](aplicacion-ejemplo.09-documentos-390.png) · [Prototipo](prototipo-ejemplo.09-documentos-390.png) | [Aplicación](aplicacion-ejemplo.09-documentos-768.png) · [Prototipo](prototipo-ejemplo.09-documentos-768.png) | [Aplicación](aplicacion-ejemplo.09-documentos-1440.png) · [Prototipo](prototipo-ejemplo.09-documentos-1440.png) |
| ejemplo.10-documentos | [Aplicación](aplicacion-ejemplo.10-documentos-390.png) · [Prototipo](prototipo-ejemplo.10-documentos-390.png) | [Aplicación](aplicacion-ejemplo.10-documentos-768.png) · [Prototipo](prototipo-ejemplo.10-documentos-768.png) | [Aplicación](aplicacion-ejemplo.10-documentos-1440.png) · [Prototipo](prototipo-ejemplo.10-documentos-1440.png) |
| usuarios | [Aplicación](aplicacion-usuarios-390.png) · [Prototipo](prototipo-usuarios-390.png) | [Aplicación](aplicacion-usuarios-768.png) · [Prototipo](prototipo-usuarios-768.png) | [Aplicación](aplicacion-usuarios-1440.png) · [Prototipo](prototipo-usuarios-1440.png) |

## Corrección y pruebas

- Contenido institucional: Misión, Visión e Historia conservan tres columnas en tableta y escritorio, y se apilan solo hasta 720 px, como `.r3` del prototipo. La prueba de geometría falla antes de la corrección (Visión en y=1126,70 frente a Misión en y=594,73) y pasa después; axe sigue activo.
- `revision-integral.spec.ts`: títulos, ausencia de desbordamiento, axe sin violaciones serias o críticas, aparición y desaparición al desplazarse, movimiento reducido, navegación pública y panel con teclado, detalle y retorno al catálogo, reducción del menú en escritorio y errores de ejecución del navegador.
- Los candados de los preparadores aíslan las capturas de los cambios temporales de otras pruebas. Documentos comparte el candado 2026102610.
- `capturar-prototipo.mjs` permite regenerar las capturas de referencia con el servidor del prototipo en 4173.
- Catálogo › Editar producto enfoca el nombre sin seleccionar su texto, como el prototipo. Escape devuelve el foco al botón Editar. La prueba falló con la selección automática anterior y pasa con el foco explícito; también se comprueba Tab y axe después de la animación.

| Estado adicional | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Catálogo › Editar producto | [Aplicación](aplicacion-catalogo-editor-390.png) · [Prototipo](prototipo-catalogo-editor-390.png) | [Aplicación](aplicacion-catalogo-editor-768.png) · [Prototipo](prototipo-catalogo-editor-768.png) | [Aplicación](aplicacion-catalogo-editor-1440.png) · [Prototipo](prototipo-catalogo-editor-1440.png) |

## RNF-17 / CP-52

`rendimiento-galerias.spec.ts` usa el artefacto de producción del fixture existente. En cada tamaño mide doce pares alternados de galerías de una y cinco imágenes, después de descartar una pareja de calentamiento. Cada muestra usa un contexto sin caché y las imágenes reales; solo se neutralizan los mapas externos. Antes de navegar registra las solicitudes: comprueba también las que aún están descargándose al llegar load. En el evento load toma los bytes de imágenes, incluida la precarga de next/image, el tiempo hasta la primera portada y el tiempo de carga.

La igualdad de bytes y la ausencia de solicitudes secundarias antes de load son estrictas. Las mediciones completas quedan en rendimiento-390.txt, rendimiento-768.txt y rendimiento-1440.txt. La mutación temporal que permite todas las imágenes antes de load falla por una solicitud secundaria; el componente se restauró sin cambios.

**Decisión autorizada por Daniela el 26/10:** margen temporal de 10 ms al comparar medianas, documentado en specs/05, specs/15 y specs/18. La igualdad de bytes y cero solicitudes secundarias antes de load siguen siendo estrictas. Se conservan todas las mediciones, sin usar valores atípicos como umbral.

| Ancho | Bytes iniciales, una y cinco | Mediana portada, una → cinco | Mediana load, una → cinco |
| --- | --- | --- | --- |
| 390 px | 161 702 | 39,65 → 38,80 ms | 121,70 → 126,20 ms |
| 768 px | 161 702 | 28,55 → 31,80 ms | 94,55 → 97,35 ms |
| 1440 px | 161 702 | 30,35 → 26,90 ms | 106,15 → 101,05 ms |
