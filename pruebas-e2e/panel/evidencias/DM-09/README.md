# DM-09 · Bandeja de solicitudes

Comparación con `panel.js › solicitudes()` y la insignia de `Panel.vista()`. Se conserva la distribución, el orden, los textos, los estados, los controles y la paleta del prototipo. Los datos son exclusivamente de prueba.

| Estado | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Prototipo, bandeja | [Ver](prototipo-bandeja-390.png) | [Ver](prototipo-bandeja-768.png) | [Ver](prototipo-bandeja-1440.png) |
| Aplicación, sin estado | [Ver](aplicacion-sin-estado-390.png) | [Ver](aplicacion-sin-estado-768.png) | [Ver](aplicacion-sin-estado-1440.png) |
| Prototipo, comentario guardado | [Ver](prototipo-comentario-guardado-390.png) | [Ver](prototipo-comentario-guardado-768.png) | [Ver](prototipo-comentario-guardado-1440.png) |
| Aplicación, comentario guardado | [Ver](aplicacion-comentario-guardado-390.png) | [Ver](aplicacion-comentario-guardado-768.png) | [Ver](aplicacion-comentario-guardado-1440.png) |
| Aplicación, queja | [Ver](aplicacion-queja-390.png) | [Ver](aplicacion-queja-768.png) | [Ver](aplicacion-queja-1440.png) |
| Aplicación, solo lectura | [Ver](aplicacion-solo-lectura-390.png) | [Ver](aplicacion-solo-lectura-768.png) | [Ver](aplicacion-solo-lectura-1440.png) |
| Aplicación, indicador | [Ver](aplicacion-indicador-390.png) | [Ver](aplicacion-indicador-768.png) | [Ver](aplicacion-indicador-1440.png) |
| Prototipo, vacío | [Ver](prototipo-vacio-390.png) | [Ver](prototipo-vacio-768.png) | [Ver](prototipo-vacio-1440.png) |
| Aplicación, vacío | [Ver](aplicacion-vacio-390.png) | [Ver](aplicacion-vacio-768.png) | [Ver](aplicacion-vacio-1440.png) |

Menú reducido, disponible desde 1025 px: [prototipo](prototipo-indicador-reducido-1440.png) y [aplicación](aplicacion-indicador-reducido-1440.png). En teléfono y tableta se verifica el indicador con el menú móvil abierto.

## Autorizaciones de Daniela

- Ampliar `ArmazonServidor.tsx` con una propiedad opcional de contadores por ruta. Se aplica solo a las opciones ya permitidas y se conecta desde `panel/layout.tsx`.
- Usar `--g600` únicamente en las pestañas inactivas y el texto secundario de la fila seleccionada. Axe reprodujo 4.46:1 y 4.40:1 en el prototipo; la excepción está registrada en `specs/05` y `specs/18`. Se mantienen el umbral y todas las reglas de axe.

## Verificación

- Fase roja: Vitest falló por ausencia de `bandeja.ts`; los E2E fallaron por ausencia del encabezado de la bandeja y del contador.
- Cinco pruebas de integración con PostgreSQL: estados en cualquier orden, lectura e indicador, responsable/comentario y bitácora, permisos y entradas manipuladas.
- Nueve E2E propios en teléfono, tableta y escritorio: comentario guardar/editar/guardar, estados, responsable, filtros, indicador normal y reducido, permisos, axe y ausencia de desbordamiento horizontal.
- Revisión independiente conforme a `plan/prompts/revision.md`: LISTO, sin hallazgos pendientes. Se corrigió el alcance del gris secundario para limitarlo a la fila seleccionada.
- Verificación final: formato, lint, tipos y 395 pruebas en 49 archivos aprobados; compilación aprobada. Nueve E2E propios sin reintentos (1.4 minutos). Suite E2E completa: código 0, 361 aprobadas y 2 intermitentes aprobadas al repetir los grupos de tiempo real de teléfono y escritorio (28.5 minutos), sin fallos definitivos. Next-devtools sin errores; design system y gitleaks aprobados.
