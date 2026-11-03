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

MATRIZ_TAMANOS

## Accesibilidad

En todos los tamaños, la revisión con axe-core de todas las páginas no encontró violaciones serias ni críticas (CP-109). También se comprobó que se puede navegar solo con el teclado (CP-110) y que la rotación de imágenes se detiene cuando el sistema pide reducir el movimiento.

Las capturas de Bodega en el teléfono, la tableta y la TV están en el Anexo G (EV-19).

## Resultado

MATRIZ_CONCLUSION_TAMANOS
