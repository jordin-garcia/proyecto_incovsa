---
id: DM-05
titulo: "Panel: industrias y catálogo de productos públicos"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: hecha
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

## Resultado

Implementado el 21/10/2026 por Daniela Marín (`InAlexa`).

- **Industrias:** `/panel/industrias`, protegida con `sit.industrias`, muestra las nueve tarjetas en el orden aprobado, con ícono, número, descripción, galería de hasta cinco imágenes y «Guardar». La publicación cambia la página pública y registra «Cambio de contenido del sitio» con la industria. Los productos siguen administrándose exclusivamente en Catálogo, según P-97.
- **Catálogo:** `/panel/catalogo`, protegida con `sit.catalogo`, muestra imagen y recuento, nombre, descripción abreviada, presentación, países de origen, industrias y acciones. «Nuevo producto» y «Editar» abren el formulario aprobado; «Eliminar» pide confirmación, retira el producto público y limpia su galería del almacenamiento. Las tres operaciones se registran con sus nombres del prototipo. Se bloquean todos los cierres del formulario durante una publicación y un error conserva el borrador.
- **Servidor:** acciones en `src/modulos/contenido/acciones-catalogo.ts`, esquemas Zod en `esquemas-catalogo.ts` y servicios en `servicio-catalogo.ts`. Cada entrada exige sesión y permiso antes de validar; las lecturas del panel también autorizan. Las escrituras bloquean el registro antes de leer imágenes y guardan contenido, relaciones y bitácora en la misma transacción. Solo se conservan fotos propias; se rechazan referencias ajenas, índices repetidos y la sexta imagen. Un fallo limpia las nuevas fotos y una publicación confirmada limpia las retiradas.
- **Carga de imágenes:** rutas multipart `/panel/industrias/publicar` y `/panel/catalogo/publicar`, dentro de las carpetas autorizadas. Comprueban origen, sesión, permiso y tamaño total; las acciones validan cada archivo y reutilizan `guardarImagen` de DM-04. Admiten cinco imágenes de hasta 5 MB sin cambiar límites compartidos ni archivos protegidos. `publicarGaleria` construye el formulario: `datos` es JSON y `imagenes` contiene referencias actuales o índices de archivos nuevos, también enviados como `imagenes`.
- **Uso para otras tareas:** `leerIndustriasPanel(sesion)` y `leerCatalogoPanel(sesion)` entregan los datos autorizados. `publicarIndustria(FormData)`, `publicarProducto(FormData)` y `eliminarProducto(id)` devuelven resultados mínimos tipados. Las lecturas públicas `leerCatalogoSitio()` de DM-03 reflejan las relaciones y galerías actualizadas; se revalida el layout raíz después de cambiar datos.
- **Verificación:** fase roja de integración y E2E comprobada; plan válido (63 tareas), `npm ci` (687 paquetes, cero vulnerabilidades), migraciones sin pendientes, `npm run verificar` (formato, lint, tipos y 322 pruebas en 36 archivos), `npm run build`, 12 E2E propias en tres tamaños con axe y suite completa con **228 aprobadas, sin fallos, omisiones ni reintentos**. Para el servidor local de producción en Windows, la ejecución completa utilizó `NODE_OPTIONS=--dns-result-order=ipv4first`; no se modificaron las pruebas ni sus umbrales. Next-devtools sin errores y recorrido público con Playwright sin errores de ejecución.
- **Revisión independiente:** LISTO, sin hallazgos pendientes. Se corrigieron el cierre durante publicación y el espaciado de las tarjetas. La prueba de respuesta retrasada falló antes de la corrección y pasa después.
- **Evidencia:** [36 capturas, cobertura e interfaces](../../pruebas-e2e/panel/evidencias/DM-05/README.md) y [revisión independiente](../../pruebas-e2e/panel/evidencias/DM-05/revision.md). Incluye industrias, catálogo, producto nuevo y editado, confirmación, publicación y error en 390, 768 y 1440 px. Las notas P-xx y la demostración se excluyen según specs/20. Sin dependencias, migraciones ni cambios de especificaciones.

El cambio local autorizado de `.codex/config.toml` se conserva fuera de los commits. Se restauraron únicamente evidencias ajenas regeneradas por las pruebas, sin cambios previos del usuario.

### Corrección durante la CI

La comprobación `plan` detectó radios literales en el CSS nuevo. Se reemplazaron por los tokens existentes con los mismos valores de 12, 10 y 999 px, conservando el diseño aprobado. No se cambiaron las pruebas ni los tokens globales; se ejecutaron también las pruebas de `scripts/*.test.mjs` para comprobar esta regla localmente.

### Correcciones de la auditoría (2026-10-22)

H-05, H-07 y H-08: las publicaciones multipart comparan el origen público configurado; las pantallas sin permiso ofrecen «Ir a mi módulo». La prueba del límite de imágenes usa referencias distintas y exige el error específico de una sexta imagen, separado de referencias duplicadas o ajenas.
