# Pickit Visual

Prototipo interactivo del sistema visual de carga para INCOVSA.

## Abrir

```bash
python3 -m http.server 8765 --directory .
# http://localhost:8765/
# http://localhost:8765/?modo=tv
# http://localhost:8765/?camion=c3
```

## Qué incluye

| Archivo | Contenido |
|---|---|
| `tokens.css` | Tokens de marca (verde logo `#006800`, gris `#2A2A2A`), tipografía Barlow Condensed / DM Sans / IBM Plex Mono, escalas iPad y TV |
| `incovsa-logo.png` | Logo oficial |
| `camion-pequeno.svg` | Silueta plataforma abierta (3.400 kg) |
| `camion-grande.svg` | Silueta furgón cerrado (6.000 kg) |
| `index.html` | Demo interactiva. Flota 2+1, diagrama de carga, modos Admin / TV |
| `_scratch/directions.html` | Throwaway. Tres direcciones visuales comparadas antes de fijar Planta |

## Modos

- **Admin · iPad.** Hormigón frío, verde de logo, tipografía condensada. Marco de tableta en escritorio.
- **Tablero · TV.** Fondo oscuro de bodega, tipografía grande y alto contraste para lectura a distancia.

## Datos de demo

Flota Quetzaltenango. Camión 1 y 2 (pequeños, 3.400 kg). Camión 3 (grande, 6.000 kg). Productos y posiciones de ejemplo.

## Mock vs real

- **Mock.** Posiciones de carga, orden sugerido, marcas listo, siluetas SVG.
- **Alineado a specs.** Capacidades 3.400 / 6.000 kg, 3 camiones, sin confirmación formal de carga (P-45).

## Mockups PDF

`mockups.pdf` (A3, 7 páginas). Formato alineado a la muestra KoiCloud. También en el store del proyecto en `docs/mockups.pdf`. Fuente HTML: `mockups-source.html`.
