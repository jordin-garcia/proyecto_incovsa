# Evidencia visual de JG-05 · 18/10/2026

Capturas obtenidas con Playwright, con fuentes cargadas, en 390 × 844, 768 × 1024 y 1440 × 900. Cuenta fija «Usuario de ejemplo 01», Gerencia. La aplicación muestra componentes de prueba en `/panel` y `/picking`: los módulos de negocio los implementan sus tareas. Se compara el **armazón**, no ese contenido temporal, con `panel.js › armazon()` y `picking.js › vista()`.

| Área y tamaño | Aplicación: normal | Prototipo: normal | Aplicación: abierto/reducido | Prototipo: abierto/reducido |
|---|---|---|---|---|
| Panel · 390 | [Captura](app-panel-390-normal.png) | [Captura](prototipo-panel-390-normal.png) | [Abierto](app-panel-390-abierto.png) | [Abierto](prototipo-panel-390-abierto.png) |
| Panel · 768 | [Captura](app-panel-768-normal.png) | [Captura](prototipo-panel-768-normal.png) | [Abierto](app-panel-768-abierto.png) | [Abierto](prototipo-panel-768-abierto.png) |
| Panel · 1440 | [Expandido](app-panel-1440-normal.png) | [Expandido](prototipo-panel-1440-normal.png) | [Reducido](app-panel-1440-reducido.png) | [Reducido](prototipo-panel-1440-reducido.png) |
| Picking · 390 | [Captura](app-picking-390-normal.png) | [Captura](prototipo-picking-390-normal.png) | [Abierto](app-picking-390-abierto.png) | [Abierto](prototipo-picking-390-abierto.png) |
| Picking · 768 | [Captura](app-picking-768-normal.png) | [Captura](prototipo-picking-768-normal.png) | [Abierto](app-picking-768-abierto.png) | [Abierto](prototipo-picking-768-abierto.png) |
| Picking · 1440 | [Expandido](app-picking-1440-normal.png) | [Expandido](prototipo-picking-1440-normal.png) | [Reducido](app-picking-1440-reducido.png) | [Reducido](prototipo-picking-1440-reducido.png) |

En los dos: barra superior de **66 px**, menú móvil de **280 px**, barra lateral de escritorio de **264 px**, reducida de **76 px**; misma marca, orden, íconos, fondos y tipografías. La preferencia reducida se conserva al recargar en la aplicación. El panel de ejemplo muestra una insignia de tres solicitudes para comprobarla también en el menú reducido; el prototipo inicia con cero.

Se conserva la paleta aprobada. La única precisión de color es la de RNF-08 documentada en `specs/20`: `--g600` en textos que sobre `--g50` no alcanzan 4.5:1 con `--g500`. El indicador de desarrollo de Next.js no forma parte de la interfaz; está oculto con `devIndicators: false` (los errores siguen disponibles). En las capturas del prototipo se ocultó únicamente el botón de presentación «Demostración».

Las nueve capturas adicionales muestran los componentes compartidos, los formatos inválidos y la confirmación, después de la revisión independiente. En total hay **33 capturas**.

| Tamaño | Componentes | Fecha y hora inválidas | Confirmación |
|---|---|---|---|
| 390 | [Página completa](componentes-390.png) | [Errores](campos-error-390.png) | [Ventana](confirmacion-390.png) |
| 768 | [Página completa](componentes-768.png) | [Errores](campos-error-768.png) | [Ventana](confirmacion-768.png) |
| 1440 | [Página completa](componentes-1440.png) | [Errores](campos-error-1440.png) | [Ventana](confirmacion-1440.png) |
