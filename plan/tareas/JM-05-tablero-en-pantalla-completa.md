---
id: JM-05
titulo: Tablero de Bodega en pantalla completa, modo claro y modo oscuro
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JM-04]
programada: 2026-10-22
requisitos: [RF-SL-25, RF-SL-58, RF-SL-77, RNF-02]
pantallas: [tablero.js › ruta, pagina, actual, linea, lateral, ajustar; picking.js › herramientas, detalle]
---

# JM-05 · Tablero de Bodega en pantalla completa, modo claro y modo oscuro

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** jue 22/10 · **Depende de:** JM-04

## Objetivo
El **tablero** que se proyecta en la TV o se usa en la tableta: la ruta o el pedido en curso con su avance, las líneas con unidades grandes, el panel del camión con la ocupación por peso y la cola, en **modo claro** y **modo oscuro**, con tiempo real.

## Contexto que debes leer
- `specs/07` §"Tablero en pantalla completa" y §"Legibilidad" **completos** (modos, lote y cuadro del pedido en cada modo, numeración de las filas, silueta del camión)
- `specs/15`: RNF-02; `specs/16`: decisiones 36 (sesión de 7 días en la TV) y 56 (el modo se guarda en cada pantalla)
- `specs/20` §"Design system aprobado" (tablero "Pickit Visual") y CAM-71, CAM-93, CAM-94
- Prototipo: `#/picking/tablero?cuenta=ejemplo.05&tema=oscuro` y `&tema=claro`; `tablero.js` **completo** (`ruta()`, `pagina()`, `actual()`, `linea()`, `lateral()`, `ajustar()`); las siluetas de `entregable-1/prototipos/pickit-visual/camion-grande.svg`
- `## Resultado` de JM-02, JM-03 y JM-04

## Qué hacer
1. Pantalla `src/app/picking/tablero/` (permiso `pk.bodega`), sin el armazón, igual a `tablero.js`:
   - la ruta o el pedido en curso (el primero de la cola) con el anillo de avance, su número, su fecha y hora programadas, y en la ruta el camión y el piloto;
   - las líneas con producto, lote, unidades grandes (`Unidades`), resto y casilla, repartidas en una o dos columnas según el alto disponible (`ajustar()`); **numeradas de arriba hacia abajo, primero la columna izquierda y después la derecha** (RF-SL-77);
   - el panel lateral con la **silueta del camión grande** para todos los camiones (con su nombre y capacidad arriba) y la ocupación por peso, y la cola de rutas y pedidos;
   - la barra superior con **"Modo claro"** y **"Modo oscuro"** (RF-SL-58), el reloj y, también aquí, el Detalle, el orden por peso y el marcar todo.
2. **Modos** (specs/07): claro igual al modo "Tableta" del prototipo; oscuro en escala de negros y grises. En el modo claro, el lote en verde y el cuadro de "PEDIDO" en verde lima (`--lima`); en el oscuro, los dos en gris (fondo #3A3A3E, texto #EDEDED). El modo elegido se guarda en esa pantalla (en el navegador) y no se comparte.
3. Tiempo real con `useCambiosDeSede(sede)`; las marcas que cambian en otra pantalla se resaltan como en el prototipo (`marcasPrevias`).
4. Legible en una TV de 1920×1080 a distancia y usable con el dedo en una tableta (RNF-02).

## Archivos que creas o modificas
- `src/app/picking/tablero/**`, `src/componentes/picking/bodega/tablero/**` (crear)
- `public/` o `src/componentes/picking/bodega/` (la silueta del camión como componente SVG) (crear)
- `pruebas-e2e/picking/tablero.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-58:** el tablero cambia entre modo claro y oscuro, y el modo se conserva al recargar esa pantalla sin afectar a otras.
2. **CAM-93 / CAM-94:** colores del lote y del cuadro del pedido de cada modo, exactamente los de `specs/07`; todas las rutas con la silueta del camión grande.
3. **RF-SL-77** (CP-40): con más líneas de las que caben en una columna, la numeración va de arriba hacia abajo, primero la izquierda y después la derecha.
4. **RNF-13:** marcar una línea en Bodega se ve en el tablero en menos de 2 segundos.
5. Coincide con el prototipo en 1920×1080 (TV) y 768×1024 (tableta), en los dos modos (capturas en el PR), y no tiene violaciones serias de axe.

## Pruebas obligatorias
- `pruebas-e2e/picking/tablero.spec.ts` (criterios 1 a 5, proyecto `tv` y `tableta`)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/tablero.spec.ts
```

## Fuera de alcance
- Bodega en el armazón (JM-03 y JM-04).
