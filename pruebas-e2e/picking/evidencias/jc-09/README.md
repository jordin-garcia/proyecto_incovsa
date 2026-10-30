# JC-09 · Evidencia de la auditoría del 26/10

Capturas de la aplicación y del prototipo aprobado en 390, 768 y 1440 px. Las de la aplicación se generan exclusivamente con `EVIDENCIA=1`; incluyen las tres pestañas de Reportes, Facturación con tarjetas y errores de descarga 400, 403 y 500.

- `jc09-prototipo-reportes-<ancho>.png` y `jc09-prototipo-facturacion-<ancho>.png`: referencia aprobada.
- `aplicacion-despacho-<proyecto>.png`, `aplicacion-rutas-realizadas-<proyecto>.png` y `aplicacion-bitacora-<proyecto>.png`: pestañas y descargas.
- `aplicacion-facturacion-<proyecto>.png`: rejilla sin asa ni botón de eliminar en la tarjeta.
- `aplicacion-error-<estado>-<proyecto>.png`: aviso de error autorizado por José Daniel.

Se compararon textos, estructura, orden, estados y colores. Los datos son los fixtures anonimizados de la aplicación; el prototipo muestra su semilla. Los encabezados se verifican además con `comprobarEncabezadoModulo()` en los tres tamaños.

## Verificación

- `npm run verificar`: formato, lint y tipos correctos; 55 archivos y 456 pruebas aprobadas.
- `npm run build`: correcto.
- `node scripts/tareas.mjs --validar`: plan válido, 69 tareas.
- Pruebas dirigidas de navegador: 48 aprobadas, incluidos H-77, H-78, H-80 y H-81 en los tres tamaños.
- Next DevTools: `get_errors`, sin errores de configuración ni de sesión.
- Gitleaks: sin secretos en el cambio.

## Revisión independiente

Se aplicó `plan/prompts/revision.md` en un agente que no escribió el código: LISTO, sin hallazgos de corrección. Observación opcional: el metadato de peso de JetBrains Mono Bold es 558, aunque su nombre interno es Bold. Se comprobó la procedencia: es el archivo estático oficial `fonts/ttf/JetBrainsMono-Bold.ttf`, sin transformaciones; el PDF incorpora esa variante y la prueba exige su nombre interno.

## Fuentes

Se conservan las licencias OFL existentes en `src/modulos/reportes/fuentes/`.

- Figtree Bold: https://github.com/erikdkennedy/figtree/blob/master/fonts/ttf/Figtree-Bold.ttf
- JetBrains Mono Bold: https://github.com/JetBrains/JetBrainsMono/blob/master/fonts/ttf/JetBrainsMono-Bold.ttf

No se añadieron dependencias. Los títulos, encabezados y total usan variantes estáticas Bold; los números del total conservan JetBrains Mono.

## Batería completa

La batería completa en base temporal nueva dio 482 aprobadas, 5 fallidas y 4 sin ejecutar. Los 9 afectados se repitieron aislados en otra base temporal: 6 aprobados (Bodega) y 3 fallidos (H-58, galería del panel en teléfono, tableta y escritorio). Ambas bases se eliminaron al terminar.

H-58 pasó después del ajuste autorizado por José Daniel: campo habilitado, galería visible y animaciones terminadas antes de axe. Portada es un borrador local; se descartó la hipótesis inicial de publicación automática. No se eliminaron comprobaciones ni se modificaron umbrales. Los tres casos de galería pasan en una base temporal nueva; con los seis de Bodega repetidos, los 491 casos quedaron comprobados.
