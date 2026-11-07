---
id: JG-34
titulo: Ajustes del Ing. William al sitio y textos sin códigos de reglas
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: []
programada: 2026-11-06
requisitos: [RF-SW-01, RF-SW-02, RF-SW-05, RF-SW-06, RF-SW-23, RF-SW-29]
pantallas: [sitio.js › inicio, sitio.js › nosotros, sitio.js › contacto, sitio.js › producto, panel.js › contenido]
---

# JG-34 · Ajustes del Ing. William al sitio y textos sin códigos de reglas

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** vie 06/11 · **Depende de:** —

> Pedido del Ing. William (INCOVSA) del 06/11, con las dudas resueltas por el coordinador el mismo día. Se aparta del prototipo y de `specs/` a pedido del cliente: se registra en `specs/18` y se ajusta `specs/`.

## Objetivo
Quitar los valores del sitio y del panel, mostrar misión y visión sin recuadros vacíos, justificar los párrafos de Inicio y «Quiénes somos», quitar los avisos de Contacto y de la ficha de producto y que ningún texto visible de la aplicación muestre códigos de reglas o requisitos (RN, RF, RNF) ni rutas de `specs/`.

## Contexto que debes leer
- `specs/05-sitio-web.md` § «Misión y visión», § «Quiénes somos», § «Detalle de producto», § «Contacto» y § «Contenido institucional»
- `specs/04-requerimientos-funcionales.md` › RF-SW-02, RF-SW-23 y RF-SW-29
- Prototipo: `entregable-1/prototipos/simulacion/src/sitio.js` › `inicio()`, `nosotros()`, `contacto()` y `producto()`; `panel.js` › `contenido()`

## Qué hacer
1. **Valores:** quitar la sección «Valores · Lo que nos guía» de «Quiénes somos», su lectura y sus estilos, y el bloque «Valores» del panel (editor, esquema, servicio y resumen). La tabla `valor` se queda: no hay migración.
2. **Fondos de «Quiénes somos»** (decisión del coordinador del 06/11): la misión y la visión van en secciones separadas: Historia claro, Misión verde (con el encabezado «Misión y visión»), Visión claro, «A quién servimos» verde e «INCOVSA e Inquiserca» claro, para que se alternen hasta el pie verde. En Inicio siguen juntas.
3. **Misión y visión** (Inicio y «Quiénes somos»): sin imágenes, la fila es de una columna, solo con el texto y sin el recuadro vacío; sin texto pero con imágenes, la fila conserva la etiqueta y el título (decisión del coordinador del 06/11) y la galería, sin el párrafo; sin texto ni imágenes, la fila no se muestra.
4. **Párrafos justificados** en Inicio y «Quiénes somos» (`text-align: justify` con `hyphens: auto`): portada, misión, visión, historia, mercados, grupo y los párrafos de las secciones. Los títulos, los botones y las tarjetas de industrias y sedes no cambian.
5. **Avisos:** quitar el de Contacto («Los productos químicos que distribuye INCOVSA tienen restricciones de venta…») y el de la ficha de producto completo («El precio y el número de lote no se publican…»).
6. **Textos sin códigos:** quitar «(RN-53)», «(RN-50)», «(RN-13)» y «(RN-54)» de los mensajes y avisos, con una prueba que revise todos los textos de `src`.
7. **Resumen del panel** (decisión del coordinador del 06/11): «Completo» cuando hay historia y, si no, «Falta la historia»; el detalle queda «Portada, logotipos, historia, misión y visión».
8. Ajustar `specs/01`, `specs/03`, `specs/04`, `specs/05`, `specs/14` y `specs/18`.

## Archivos que creas o modificas
- `src/app/(sitio)/page.tsx`, `nosotros/page.tsx`, `contacto/page.tsx` y `productos/[id]/page.tsx` (modificar)
- `src/componentes/sitio/MisionVision.tsx`, `sitio.css`, `nosotros.css` y `PresentacionDinamica.tsx` (modificar)
- `src/componentes/panel/EditorContenido.tsx` y `contenido.module.css` (modificar)
- `src/modulos/contenido/esquemas.ts`, `nosotros.ts`, `resumen.ts` y `servicio.ts` (modificar), con `nosotros.test.ts` y `acciones.test.ts`
- `src/modulos/envios/opciones.ts`, `src/modulos/odoo/esquemas.ts` y `src/componentes/picking/` (`FacturacionTablero.tsx`, `OpcionEnvio.tsx` y `ConfiguracionCliente.tsx`) (modificar), con `src/modulos/odoo/servicio.test.ts`
- `src/lib/textos-sin-codigos.test.ts` (crear)
- `pruebas-e2e/sitio/nosotros.spec.ts`, `inicio.spec.ts`, `contacto.spec.ts` e `industrias-y-productos.spec.ts`; `pruebas-e2e/panel/contenido.spec.ts` y `auditoria-jg24.spec.ts`; `pruebas-e2e/picking/facturacion-carga.spec.ts` y `pruebas-e2e/flujo/flujo-completo.spec.ts` (modificar)
- `specs/01`, `03`, `04`, `05`, `14` y `18` (modificar)

## Criterios de aceptación
1. **RF-SW-02 (06/11):** «Quiénes somos» no muestra la sección de valores y sus fondos se alternan: Historia claro, Misión verde, Visión claro, «A quién servimos» verde e «INCOVSA e Inquiserca» claro.
2. **RF-SW-23 (06/11):** el panel de contenido institucional no tiene el bloque «Valores», el servidor rechaza publicar el bloque `valores` y el resumen dice «Falta la historia» mientras no haya historia.
3. **RF-SW-01 / RF-SW-02 (06/11):** en misión y visión, sin imágenes la fila tiene una sola columna, solo con el texto y sin recuadro vacío; sin texto, la fila muestra la etiqueta, el título y la galería, sin párrafo; sin texto ni imágenes, la fila no se muestra.
4. **RF-SW-01 / RF-SW-02 (06/11):** los párrafos de Inicio y «Quiénes somos» están justificados; los títulos y las tarjetas de industrias no.
5. **RF-SW-06 / RF-SW-05 (06/11):** Contacto y la ficha de producto no muestran avisos de restricciones de venta, de precio ni de lote.
6. **(06/11)** Ningún texto visible de la aplicación contiene códigos de reglas o requisitos (RN-xx, RF-xx, RNF-xx) ni rutas de `specs/`.

## Pruebas obligatorias
- `src/lib/textos-sin-codigos.test.ts` (criterio 6) y los mensajes de carga en `src/modulos/odoo/servicio.test.ts`, `facturacion-carga.spec.ts` y `flujo-completo.spec.ts`.
- `src/modulos/contenido/nosotros.test.ts` y `acciones.test.ts` (criterios 1 y 2).
- `pruebas-e2e/sitio/nosotros.spec.ts`, `inicio.spec.ts`, `contacto.spec.ts` e `industrias-y-productos.spec.ts` (criterios 1, 3, 4 y 5).
- `pruebas-e2e/panel/contenido.spec.ts` (criterio 2).

## Verificación
Autorizado por el coordinador el 06/11 para esta tarea: en local se prueba solo lo que se edita; la CI corre la batería completa y no se omite.
```
npm run formato
npm run lint
npm run tipos
npx vitest run src/lib src/modulos/contenido src/modulos/odoo src/modulos/envios src/modulos/conversion
npx playwright test pruebas-e2e/sitio/nosotros.spec.ts pruebas-e2e/sitio/inicio.spec.ts pruebas-e2e/sitio/contacto.spec.ts pruebas-e2e/sitio/industrias-y-productos.spec.ts pruebas-e2e/panel/contenido.spec.ts pruebas-e2e/panel/auditoria-jg24.spec.ts pruebas-e2e/picking/facturacion-carga.spec.ts pruebas-e2e/picking/facturacion-envio.spec.ts --workers=1
npm run build
```

## Fuera de alcance
- Borrar la tabla `valor` o cambiar `prisma/schema.prisma`.
- Cambiar el prototipo aprobado: los cambios son un pedido del cliente posterior a su aprobación.
