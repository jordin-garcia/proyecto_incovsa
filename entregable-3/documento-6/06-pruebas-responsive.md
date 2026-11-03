# Pruebas responsive

Las pruebas responsive comprueban que la aplicación funcione y se vea bien en diferentes tamaños de pantalla.

## Tamaños probados

Los tamaños son los de la convención del proyecto (`plan/convenciones.md` §6), que representan los equipos que usará INCOVSA.

Tabla: Tamaños de pantalla probados {#tab:tamanos}

| Tamaño | Resolución | Táctil | Uso en INCOVSA |
|---|---|---|---|
| Teléfono | 390 × 844 | Sí | Pilotos (módulo de Ruta) y visitantes del sitio |
| Tableta | 768 × 1024 | Sí | Personal de Bodega |
| Escritorio | 1440 × 900 | No | Facturación, Reportes, Configuración y el panel del sitio |
| TV | 1920 × 1080 | No | Tablero de Bodega en pantalla completa (solo las pruebas del tablero) |

## Cómo se probó

- **Toda la batería de extremo a extremo** se ejecuta en teléfono, tableta y escritorio, en los tres navegadores (sección 7). Las pruebas del tablero de Bodega se ejecutan además en la TV.
- Cada prueba comprueba que las acciones funcionen en ese tamaño: arrastrar con el dedo en las pantallas táctiles, abrir el menú reducido, desplazar las listas y mostrar las ventanas de confirmación.
- Al construir cada pantalla, se tomaron capturas en 390, 768 y 1440 px y se compararon con el prototipo aprobado (`plan/convenciones.md` §7), que manda en el diseño (decisión 89 de `specs/16`). Las diferencias que encontraron las auditorías se corrigieron (INC-02, INC-03 e INC-20).
- Hay pruebas específicas de la disposición por tamaño:
    - el tablero pasa a dos columnas solo con más de 900 px (CP-40);
    - la misión muestra el texto a la izquierda y la imagen a la derecha con más de 900 px (CP-51);
    - la lista de Facturación no salta al seleccionar en el teléfono (CP-61).

## Resultado por tamaño

Tabla: Resultado por tamaño de pantalla (03/11/2026, los tres navegadores) {#tab:resultado-tamanos}

| Tamaño | Casos | Aprobados | Aprobados al repetirse | Fallidos |
|---|---|---|---|---|
| Teléfono (390 × 844) | 549 | 546 | 2 | 1 (WebKit) |
| Tableta (768 × 1024) | 549 | 546 | 1 | 2 (WebKit) |
| Escritorio (1440 × 900) | 549 | 545 | 3 | 1 (WebKit) |
| TV (1920 × 1080) | 33 | 33 | 0 | 0 |
| **Total** | **1 680** | **1 670** | **6** | **4** |

Los cuatro casos fallidos son de WebKit y se explican en la sección 7 (INC-47 e INC-48). En Chromium y Firefox, todos los casos pasan en todos los tamaños.

## Accesibilidad

En todos los tamaños, la revisión con axe-core de todas las páginas no encontró violaciones serias ni críticas (CP-109). También se comprobó que se puede navegar solo con el teclado (CP-110) y que la rotación de imágenes se detiene cuando el sistema pide reducir el movimiento.

Las capturas de Bodega en el teléfono, la tableta y la TV están en el Anexo G (EV-19).

## Resultado

**Aprobado en parte.** La aplicación funciona en los cuatro tamaños: 1 676 de 1 680 casos pasan (EV-04). Los cuatro que fallan son de WebKit, en el teléfono, la tableta y el escritorio, y están en análisis (INC-47 e INC-48, sección 7). Las pantallas se compararon con el prototipo aprobado en 390, 768 y 1440 px al construirlas, y las diferencias que encontraron las auditorías se corrigieron.
