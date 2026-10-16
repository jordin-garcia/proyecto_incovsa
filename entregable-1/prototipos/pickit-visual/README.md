# Pickit Visual

Prototipo interactivo del sistema visual de carga para INCOVSA.

> **Referencia histórica.** El diseño vigente del tablero de Bodega es el del prototipo de simulación aprobado (`../simulacion/`): modo claro y modo oscuro en negros y grises en lugar de "TV" en verde (29/09/2026) y la silueta del camión grande para todos los camiones (15/10/2026). Ver `specs/07-picking-bodega.md` y `specs/20-prototipo-aprobado.md`.

## Abrir

Doble clic en [`index.html`](./index.html) o servir la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8765 --directory .
# luego http://localhost:8765/
```

## Qué incluye

| Archivo | Contenido |
|---|---|
| `tokens.css` | Design tokens: colores INCOVSA, tipografía, escalas **iPad (admin)** y **TV (tablero)** |
| `camion-pequeno.svg` | Silueta del camión pequeño (plataforma abierta, 3.400 kg) |
| `camion-grande.svg` | Silueta del camión grande (furgón cerrado, 6.000 kg) |
| `index.html` | Demo interactiva: flota 2+1, diagrama de carga, modos Admin / TV |

## Modos

- **Admin · iPad** — tipografía y espaciado para tableta; marco de dispositivo en escritorio.
- **Tablero · TV** — fondo verde oscuro, tipografía grande y alto contraste para lectura a distancia.

## Datos de demo

Flota de Quetzaltenango: **Camión 1 y 2** (pequeños, 3.400 kg) + **Camión 3** (grande, 6.000 kg). Productos y posiciones son de ejemplo.

## Mock vs real

- **Mock:** posiciones de carga, orden sugerido, marcas “listo”, siluetas SVG.
- **Alineado a specs:** capacidades 3.400 / 6.000 kg, 3 camiones, sin confirmación formal de carga (P-45); el diagrama es propuesta visual sobre el tablero de Bodega.
