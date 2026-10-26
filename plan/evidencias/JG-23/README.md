# Evidencia de JG-23 · Correcciones de la auditoría del 22/10 en Bodega

## Hallazgos y pruebas que los detectan

| Hallazgo | Corrección | Prueba |
|---|---|---|
| H-16 | `DecimalExacto` excluye `number`; Bodega y el Detalle pasan texto | `conversion/servicio.test.ts` (`@ts-expect-error`) y `bodega/servicio.test.ts` (Detalle en texto) |
| H-17 y H-29 | Encabezado de Bodega con `EncabezadoModulo` | `comunes/encabezado.ts`, usado en `picking/bodega.spec.ts` y `comunes/armazon.spec.ts` |
| H-18, H-19 y H-20 | `.ped-meta .prog`, `.ped-avance` hasta 720 px y `.ped-herr` como `estilos.css` | `picking/bodega.spec.ts` (color, peso, separación, relleno, fondo y ancho) |
| H-21 | `.det-grupos` sin `max-height`: se desplaza la ventana | `picking/bodega.spec.ts` (ventana de 560 px de alto) |
| H-22 | `ErrorNegocio` para un envío de la sede que ya salió de Bodega | `bodega/servicio.test.ts` (6 operaciones), `bodega/acciones.test.ts` y CP-37 |
| H-23 | Envío real de la sede 2 en el caso «otra sede» | `bodega/acciones.test.ts` |
| H-24 | Las acciones, el Detalle y el despacho capturan la falla de red | `picking/bodega.spec.ts` con `route.abort()` |
| H-25 y H-26 | CP-37 mide desde `esperarPublicacion`, cambia el estado con `pg` y llama a tsx sin npx | `picking/bodega-tiempo-real.spec.ts` |

Las rutas de navegador son relativas a `pruebas-e2e/`; las de integración, a `src/modulos/`.

## Fase roja

- H-16: `npm run tipos` falló con «Unused '@ts-expect-error' directive» en las dos llamadas con `number`.
- H-22: `servicio.test.ts` recibió `ErrorAcceso` («No tiene permisos…») en lugar del error de negocio.
- H-17: `bodega.spec.ts` no encontró `.cab-pag.cab-fx`. H-18: `rgb(114, 115, 114)` en lugar de `rgb(13, 90, 36)`. H-21: `max-height` de 336 px en lugar de `none`. H-24: no apareció el mensaje de error.
- La revisión en contexto limpio señaló que la prueba del encabezado no fallaba si `.cab-fx-t` dejaba de ser flex. Después de corregirla se comprobó, con una prueba temporal que se borró, que falla con `display: block` y con `flex-direction: column`.

## Comparación con el prototipo

Capturas `aplicacion-*` y `prototipo-*` en 390, 768 y 1440 px, de Bodega y del Detalle de Ruta, con `ejemplo.05`. Playwright midió lo mismo en la aplicación y en el prototipo en los tres tamaños:

| Medida | 390 px | 768 px | 1440 px |
|---|---|---|---|
| Instrucción a la par del título | debajo (no cabe) | debajo (no cabe) | a la par |
| Título | 26 px | 26 px | 26 px |
| Botón «Abrir tablero…» | x 16, ancho 358 | x 438, ancho 298 | x 1110, ancho 298 |
| «Programada» | `rgb(13, 90, 36)`, 700 | igual | igual |
| `.ped-herr` | 8 px, `12px 22px`, blanco | igual | igual |
| Avance / cabecera de la tarjeta | 312 de 356 | 190 de 702 | 190 de 1110 |

Los datos de las tarjetas son distintos porque la aplicación usa los envíos de prueba y el prototipo los suyos. La consola no registró errores, y next-devtools devolvió `issues: []`.

## Verificación

| Comando | Resultado | Archivo |
|---|---|---|
| `npm run verificar` | formato, lint y tipos sin errores; 51 archivos, 418 pruebas | `verificar.txt` |
| `npm run build` | compilado sin errores | `build.txt` |
| `node scripts/tareas.mjs --validar` | plan válido, 66 tareas | — |
| Batería E2E completa (B7), base limpia `incovsa_jg23_final`, 1 worker, por partes | 390 de 390 | `e2e-*.txt` |

La batería se corrió por partes porque, entera, Claude Code la detuvo por falta de memoria en este equipo de 8 GB: `acceso` 54, `comunes` 51, `flujo` y `seguridad` 21, `panel` 60, `sitio` 54 y `picking` 150 (teléfono 47, tableta 47, escritorio y TV 56). En la parte 3, el servidor de producción no arrancó a tiempo en su primer arranque en frío (`flujo`: «No inició el servidor de producción de JG-10») y no se ejecutó ninguna aserción; al repetir `flujo` pasaron sus 9 pruebas (`e2e-3b-flujo-repeticion.txt`).

**Criterio 6 (CP-37):** pasa en los tres tamaños con un worker, sin reintentos y con el límite de 2 s, medido desde la publicación del aviso: 650, 621 y 666 ms en la batería (corridas previas de la tarea: entre 588 y 934 ms).
