# DM-03 · Industrias, catálogo y detalle público

Capturas de Playwright MCP del 21/10/2026, con movimiento reducido para que la página completa muestre las tarjetas. Las pruebas propias comprueban también la aparición con movimiento habilitado. Las rutas de aplicación son `/industrias/cuero`, `/productos`, `/productos?industria=cuero` y el detalle del primer producto del catálogo; sus equivalentes del prototipo usan `#/` y `pp01`.

| Pantalla o estado | 390 px: aplicación / prototipo | 768 px: aplicación / prototipo | 1440 px: aplicación / prototipo |
| --- | --- | --- | --- |
| Industrias | [Aplicación](aplicacion-industrias-390.png) / [Prototipo](prototipo-industrias-390.png) | [Aplicación](aplicacion-industrias-768.png) / [Prototipo](prototipo-industrias-768.png) | [Aplicación](aplicacion-industrias-1440.png) / [Prototipo](prototipo-industrias-1440.png) |
| Catálogo | [Aplicación](aplicacion-catalogo-390.png) / [Prototipo](prototipo-catalogo-390.png) | [Aplicación](aplicacion-catalogo-768.png) / [Prototipo](prototipo-catalogo-768.png) | [Aplicación](aplicacion-catalogo-1440.png) / [Prototipo](prototipo-catalogo-1440.png) |
| Filtro Cuero | [Aplicación](aplicacion-filtrado-390.png) / [Prototipo](prototipo-filtrado-390.png) | [Aplicación](aplicacion-filtrado-768.png) / [Prototipo](prototipo-filtrado-768.png) | [Aplicación](aplicacion-filtrado-1440.png) / [Prototipo](prototipo-filtrado-1440.png) |
| Búsqueda sin coincidencias | [Aplicación](aplicacion-vacio-390.png) / [Prototipo](prototipo-vacio-390.png) | [Aplicación](aplicacion-vacio-768.png) / [Prototipo](prototipo-vacio-768.png) | [Aplicación](aplicacion-vacio-1440.png) / [Prototipo](prototipo-vacio-1440.png) |
| Detalle y recomendados | [Aplicación](aplicacion-detalle-390.png) / [Prototipo](prototipo-detalle-390.png) | [Aplicación](aplicacion-detalle-768.png) / [Prototipo](prototipo-detalle-768.png) | [Aplicación](aplicacion-detalle-1440.png) / [Prototipo](prototipo-detalle-1440.png) |

## Criterios y diferencias exigidas por las especificaciones

- RF-SW-03 / P-97: Cuero muestra los cuatro productos relacionados del catálogo de demostración, ordenados alfabéticamente, frente a los nueve de la lista fija del prototipo. Las pruebas cambian una relación real de PostgreSQL y comprueban su desaparición de Cuero y aparición en Textil tras recargar.
- RF-SW-04: búsqueda sin distinción de acentos o mayúsculas, filtro combinado, filtros con recuentos y opción «Industria por confirmar». Se mantiene el orden del catálogo por identificador, como los productos de demostración del prototipo. Países de origen y presentación aparecen cuando están cargados; el lote no forma parte de la lectura pública.
- RF-SW-05: galería, descripción, presentación, origen e industrias; enlaces al catálogo, a la industria y a Contacto. Los identificadores numéricos pertenecen a la base de datos; no son los `ppNN` locales del simulador.
- RF-SW-17: la sección siempre se dibuja, aun sin candidatos. Hasta cuatro recomendaciones, coincidencias de cualquier industria antes del relleno, cada grupo en orden alfabético español y excluyendo el producto actual. Pruebas de cero, uno, cuatro y más candidatos, sin industria compartida y sin industrias asignadas.
- RF-SW-15: ninguna de estas rutas tiene pie.
- RNF-08: en teléfono, la cabecera de la tarjeta de industria se acomoda en varias líneas para evitar el desbordamiento horizontal del prototipo. Los textos secundarios usan `--g600` cuando el gris del prototipo no alcanza contraste AA sobre el fondo claro. No se agregan colores ni dependencias.
- Las marcas de demostración y notas P-xx se excluyen conforme a `plan/convenciones.md` §7 y `specs/20`; el contenido no cargado conserva el texto «Por confirmar» del prototipo.
- La revisión visual detectó y corrigió la cascada del espacio superior del detalle, el tamaño de «Productos Recomendados», el rótulo del encabezado y las tres columnas del catálogo en teléfono. Las capturas finales esperan la hidratación y la carga de las imágenes, conservando el cursor de texto sin alterar el HTML.

## Verificación

- Fase roja: Vitest no encontraba `./catalogo`; Playwright encontraba cero enlaces de industria porque aún no existía la ruta.
- `npm ci`: 687 paquetes, cero vulnerabilidades, sin cambios al archivo de bloqueo.
- `npm run db:aplicar`: dos migraciones existentes, ninguna pendiente.
- `node scripts/tareas.mjs --validar`: plan válido, 63 tareas.
- `npm run verificar`: formato, lint, tipos y 307 pruebas en 34 archivos aprobados.
- `npm run build`: compilación, TypeScript y rutas de Industrias/Productos aprobados.
- Suite propia: nueve comprobaciones aprobadas en los tres proyectos, con axe completo y sin violaciones serias o críticas.
- `npm run e2e -- --workers=1 --retries=2`: código 0, 211 aprobadas directamente y dos intermitentes aprobadas al primer reintento, sin fallos definitivos ni omisiones. Los dos reintentos son los configurados en CI. Intermitencias: inicio del servidor de producción SSE en teléfono (`No inició el servidor de producción de JG-10`) y contraste durante la animación del modal de Usuarios del panel en escritorio. Se dejan avisos a sus responsables; no se modificaron las pruebas ni el código de esos módulos. La primera ejecución, sin build actualizado, se interrumpió para preparar la compilación y repetir la suite completa.

## Revisión independiente

Revisión en contexto limpio con `plan/prompts/revision.md`, sin modificar código ni bases. Se corrigieron los hallazgos de fidelidad y se comprobaron las capturas definitivas.

```text
REVISIÓN DM-03
CORRECCIÓN (obligatorio corregir):
Ninguno.
OPCIONAL (no bloquea):
Ninguno.
VEREDICTO: LISTO
```

El cambio local autorizado de `.codex/config.toml` permanece fuera de los commits.
