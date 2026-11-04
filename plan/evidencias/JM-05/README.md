# Evidencia de JM-05 · Tablero de Bodega en pantalla completa

Capturas del 24/10/2026, tomadas con Playwright sobre la compilación de producción y una base local nueva con los datos de `preparar-envio.ts crear-tablero` (más una ruta de 9 líneas de prueba y un pedido de 3).

## Comparación con el prototipo

| Tamaño | Prototipo | Aplicación |
|---|---|---|
| TV 1920 × 1080, modo oscuro | [prototipo-ruta-oscuro-1920.png](prototipo-ruta-oscuro-1920.png) | [app-ruta-oscuro-1920.png](app-ruta-oscuro-1920.png) |
| TV 1920 × 1080, modo claro | [prototipo-ruta-claro-1920.png](prototipo-ruta-claro-1920.png) | [app-ruta-claro-1920.png](app-ruta-claro-1920.png) |
| Tableta 768 × 1024, modo claro | [prototipo-ruta-claro-768.png](prototipo-ruta-claro-768.png) | [app-ruta-claro-768.png](app-ruta-claro-768.png) |
| Teléfono 390 × 844, modo claro | [prototipo-ruta-claro-390.png](prototipo-ruta-claro-390.png) | [app-ruta-claro-390.png](app-ruta-claro-390.png) |

Además, en 1440, 768 y 390 px y en los dos modos: `app-ruta-*` (ruta con camión) y `app-pedido-*` (pedido que recoge el cliente, con el cuadro lima o gris).

El prototipo usa otros datos (decisión 74): se comparan textos, estructura, orden, estados y colores.

## Rutas largas (decisión de Jordin del 24/10)

`app-ruta-60-lineas-<tamaño>.png` muestra el inicio de una ruta de 60 líneas y `app-ruta-60-lineas-final-<tamaño>.png`, la misma ruta desplazada hasta la línea 60, en 1920, 1440, 768 y 390 px. Todas las líneas se pueden ver y tocar. En 768, 1440 y 1920 px se desplaza solo el área de las líneas: la cabecera, las opciones y el botón de despacho siguen a la vista, y el panel del camión no se ensancha. En 390 px se desplaza toda la pantalla, como en el prototipo.

## Diferencias con el prototipo aprobadas por Jordin

- Sin elección previa, y al reiniciar el navegador, el tablero abre en **modo claro** (el prototipo abre en oscuro).
- Si las líneas no caben, en tableta, escritorio y TV se desplaza el área de las líneas (en el prototipo quedan ocultas), y en el teléfono la barra superior pasa a otra línea (en el prototipo, a 390 px, el contenido se corta por la derecha).
