---
id: DM-03
titulo: "Sitio público: Industrias, Productos y detalle de producto"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: pendiente
depende_de: [DM-02]
programada: 2026-10-18
requisitos: [RF-SW-03, RF-SW-04, RF-SW-05, RF-SW-15, RF-SW-17, CU-08]
pantallas: [sitio.js › industrias, catalogo, producto, tarjetaProducto, tarjetaIndustria; base.js › INDUSTRIAS, imgsProd]
---

# DM-03 · Sitio público: Industrias, Productos y detalle de producto

**Responsable:** Daniela Marín · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** DM-02

## Objetivo
Las páginas de **Industrias** (navegación con íconos), **Productos** (catálogo informativo con búsqueda y filtro por industria) y el **detalle de producto** con "Productos Recomendados", leyendo de la base de datos.

## Contexto que debes leer
- `specs/05-sitio-web.md` §"Industrias", §"Catálogo de productos" y §"Detalle de producto" (con §"Productos Recomendados") **completos**
- `specs/04`: RF-SW-03 a RF-SW-05, RF-SW-15, RF-SW-17; `specs/16`: decisión 14
- `specs/19`: **P-97** (productos de cada industria)
- Prototipo: `#/industrias`, `#/industrias/cuero`, `#/productos` y `#/productos/pp01`; `sitio.js` › `industrias()`, `catalogo()`, `producto()`, `tarjetaProducto()` y `tarjetaIndustria()`
- `## Resultado` de DM-02

## Qué hacer
1. **Industrias** (`/industrias` y `/industrias/[id]`, RF-SW-03): barra lateral izquierda **solo con íconos** de las 9 industrias; al pasar el cursor o el foco del teclado se muestra el nombre; al elegir una, la página no salta (como `conservarDesplazamiento`); la industria elegida muestra su número ("Industria 01 de 9"), su nombre, el botón "Ver en el catálogo", su **descripción**, su **galería** (sin imágenes, el ícono de la industria como en el prototipo) y **sus productos como texto**. **Sin pie de página.**
   - **Productos de cada industria (P-97):** aplica lo que diga `specs/05` una vez resuelto P-97. Si P-97 sigue abierto en `specs/19`, **detente en este punto y pregúntale a la persona** (protocolo §C) y sigue con lo demás.
2. **Productos** (`/productos`, RF-SW-04): solo informativo, sin precios; búsqueda y filtro por industria como el prototipo (incluido "Todas las industrias" con su cuenta); tarjeta con la galería, el nombre, los países de origen y la presentación; **nunca el lote**. **Sin pie de página.**
3. **Detalle** (`/productos/[id]`, RF-SW-05): galería, nombre, descripción, presentación, países de origen e industrias; sin documentos técnicos; **sin pie de página**.
4. **Productos Recomendados** (RF-SW-17, decisión 14): siempre aparece; hasta 4 productos: primero los que comparten alguna industria con el producto, en orden alfabético por nombre; si no alcanzan, se completa con otros productos del catálogo, en orden alfabético; nunca el mismo producto.
5. Lecturas públicas en `src/modulos/contenido/` (industrias, productos públicos con sus industrias e imágenes).

## Archivos que creas o modificas
- `src/app/(sitio)/industrias/**`, `src/app/(sitio)/productos/**` (crear)
- `src/componentes/sitio/**`, `src/modulos/contenido/**` (modificar)
- `pruebas-e2e/sitio/industrias-y-productos.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-03:** la barra de industrias muestra solo íconos y el nombre al pasar el cursor o con el foco; cada industria muestra su descripción, su galería y sus productos en texto.
2. **RF-SW-04:** la búsqueda y el filtro por industria funcionan como en el prototipo; ningún producto muestra un lote.
3. **RF-SW-17** (CP-55): un producto sin industrias en común muestra 4 recomendados de relleno en orden alfabético, sin repetirse; uno con industrias en común muestra primero esos.
4. **RF-SW-15:** Industrias, Productos y el detalle no tienen pie de página.
5. Coinciden con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tienen violaciones serias de axe.

## Pruebas obligatorias
- Unitaria de la regla de Productos Recomendados (criterio 3)
- `pruebas-e2e/sitio/industrias-y-productos.spec.ts` (criterios 1, 2, 4 y 5)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/industrias-y-productos.spec.ts
```

## Fuera de alcance
- La edición de industrias y del catálogo en el panel (DM-05).
