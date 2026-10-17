---
id: DM-05
titulo: "Panel: industrias y catálogo de productos públicos"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: pendiente
depende_de: [DM-04, DM-03]
programada: 2026-10-18
requisitos: [RF-SW-07, RF-SW-23, RF-SW-25, CU-07]
pantallas: [panel.js › industrias, catalogo]
---

# DM-05 · Panel: industrias y catálogo de productos públicos

**Responsable:** Daniela Marín · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** DM-04, DM-03

## Objetivo
Las secciones **Industrias** (descripción y galería de cada una) y **Catálogo** (crear, editar y eliminar productos públicos con sus industrias y su galería) del panel.

## Contexto que debes leer
- `specs/05` §"Panel administrativo" (filas Industrias y Catálogo) y §"Producto público en el panel" **completos**
- `specs/03` (permisos `sit.industrias` y `sit.catalogo`); `specs/14` (PRODUCTO_SITIO, PRODUCTO_INDUSTRIA, IMAGEN)
- Prototipo: `#/panel/industrias?cuenta=ejemplo.08` y `#/panel/catalogo?cuenta=ejemplo.08`; `panel.js` › `industrias()` y `catalogo()` (tabla, ventana del producto, eliminar con confirmación)
- `## Resultado` de DM-03 y DM-04

## Qué hacer
1. **Industrias** (`/panel/industrias`, `sit.industrias`): una tarjeta por industria con su ícono y número, su galería (hasta 5) y su descripción, con "Guardar"; bitácora "Cambio de contenido del sitio" con la industria. Los productos de cada industria **no** se editan aquí: salen del Catálogo (P-97, specs/05).
2. **Catálogo** (`/panel/catalogo`, `sit.catalogo`): tabla con imagen (con el número de imágenes si hay más de una), nombre, presentación, países de origen e industrias, y acciones editar y eliminar; botón "Nuevo producto". La ventana del producto pide nombre (obligatorio), descripción, presentación, países de origen (texto), industrias (una o varias) y galería (hasta 5). Eliminar pide confirmación y borra sus imágenes. La bitácora registra "Creación de producto público", "Edición de producto público" y "Eliminación de producto público" (los nombres del prototipo).
3. Acciones con `exigirPermiso` y Zod; los cambios se ven de inmediato en el sitio público.

## Archivos que creas o modificas
- `src/app/panel/industrias/**`, `src/app/panel/catalogo/**`, `src/componentes/panel/**` (crear)
- `src/modulos/contenido/**` (modificar)
- `pruebas-e2e/panel/industrias-y-catalogo.spec.ts` (crear)

## Criterios de aceptación
1. Cambiar la descripción o la galería de una industria se ve en su página pública.
2. Crear, editar y eliminar un producto público funciona; un producto con dos industrias aparece al filtrar por cualquiera de ellas.
3. **RF-SW-25** (CP-54): sin `sit.catalogo`, crear un producto se rechaza en el servidor aunque se llame directo a la acción.
4. Eliminar pide confirmación y queda en la bitácora.
5. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración de las acciones con permisos (criterios 2 a 4)
- `pruebas-e2e/panel/industrias-y-catalogo.spec.ts` (criterios 1, 2 y 5)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/panel/industrias-y-catalogo.spec.ts
```

## Fuera de alcance
- Las demás secciones del panel.
