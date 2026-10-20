# DM-02 · Comparación de Inicio

Capturas del 19/10/2026 tomadas con Playwright MCP, con fuentes cargadas y movimiento reducido en ambas versiones para mostrar todas las tarjetas en la captura de página completa. La aparición y desaparición con movimiento habilitado se verifica en `inicio.spec.ts`.

| Tamaño | Aplicación | Prototipo |
| --- | --- | --- |
| Teléfono, 390 × 844 | [Inicio](app-inicio-390.png) | [Inicio](prototipo-inicio-390.png) |
| Tableta, 768 × 1024 | [Inicio](app-inicio-768.png) | [Inicio](prototipo-inicio-768.png) |
| Escritorio, 1440 × 900 | [Inicio](app-inicio-1440.png) | [Inicio](prototipo-inicio-1440.png) |
| Menú de teléfono | [Abierto](app-menu-390.png) | [Abierto](prototipo-menu-390.png) |

Se contrastaron navegación, textos, orden de las secciones, las nueve industrias, cifras, misión y visión, espacios sin imágenes, sedes, mapas y llamado a enviar una solicitud. Ningún tamaño tiene desbordamiento horizontal.

## Diferencias previstas por las especificaciones

- El pie usa, como el prototipo (`sitio.js` › `logoOscuro()`), el logotipo blanco sobre el verde mientras no se suba otro desde el panel; con uno subido, ese mismo sobre una placa clara. Las capturas de la aplicación se repitieron el 19/10 tras corregirlo, junto con los mapas en proporción 4:3 y el teléfono y el correo en letra monoespaciada. No incluye la leyenda académica ni el botón de demostración del prototipo.
- Los recuentos de productos por industria salen de la relación del catálogo en la base, no de la lista fija del prototipo.
- Los textos pequeños usan `--g600` donde el gris del prototipo no alcanza el contraste de RNF-08, siguiendo el criterio de JG-05. Los estilos están limitados a `.sitio` y usan los tokens existentes.
- La cifra de tres sedes se conserva por la excepción explícita de `specs/05`; las tarjetas y el pie solo muestran las oficinas de Quetzaltenango y Guatemala.
- Los mapas conservan las direcciones de `specs/05`. Su contenido externo depende de Google Maps; las pruebas comprueban ambos marcos y sus atributos sin sustituir ese servicio.

## Revisión independiente

Se aplicó `plan/prompts/revision.md` en contexto limpio. Se corrigieron la animación de la foto de portada y el orden de correos y WhatsApp del pie, con comprobaciones automatizadas. Segunda revisión: **LISTO**, sin hallazgos de corrección ni opcionales.

## Reproducción

Levantar el prototipo con `node scripts/servir-prototipo.mjs` y la aplicación con `npm run dev`. Abrir `/` y `http://127.0.0.1:4173/#/` en los tamaños indicados. Para las pruebas propias: `npm run e2e -- pruebas-e2e/sitio/inicio.spec.ts`. La prueba de galerías prepara imágenes de prueba bajo un candado entre procesos y restaura los registros previos al terminar.
