---
id: JG-28
titulo: Cambios del Ing. Manuel Rojas en el sitio, el panel y el picking
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: []
programada: 2026-11-02
requisitos: [RF-SW-02, RF-SW-03, RF-SW-04, RNF-08]
pantallas: [sitio.js › nosotros, industrias, catalogo, producto, noticias, contacto; panel.js › catálogo, contenido, documentos; picking.js › facturación]
---

# JG-28 · Cambios del Ing. Manuel Rojas en el sitio, el panel y el picking

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** —

> **Urgente (replanificación del 02/11, JG-32):** se integra **antes del 03/11 a las 10:00**, porque Daniela (DM-13) y Josué (JM-07) toman las capturas de los manuales después de esta tarea. Es el único cambio de código permitido en `develop` hasta la entrega del 04/11.

## Objetivo
Aplicar los cambios que pidió el Ing. Manuel Rojas antes de la entrega del 04/11: banners de la misma altura en las secciones del sitio, la barra lateral de Industrias igual a la de Productos (las dos con el ícono de cada industria) y ningún texto ni elemento del prototipo que no deba ir en la aplicación final.

## Contexto que debes leer
- `specs/05-sitio-web.md` (Quiénes somos, Industrias, Productos, Noticias, Contacto, panel)
- `specs/16`, decisión 89 (en diseño manda el prototipo): estos cambios son una **excepción pedida por el docente**, que se registra en `specs/05` y `specs/18`
- `src/componentes/sitio/EncabezadoPagina.tsx`, `src/app/(sitio)/nosotros/page.tsx` (banner propio con logotipos), `src/componentes/sitio/sitio.css` y `nosotros.css`
- `src/componentes/sitio/Industrias.tsx` (barra de solo íconos), `src/componentes/sitio/CatalogoCliente.tsx` (filtros por industria) y `src/componentes/sitio/navegacion.ts` (`ICONOS_INDUSTRIAS`)

## Qué hacer
1. **Banners de la misma altura.** Quiénes somos, Industrias, Productos, Noticias y Contacto muestran el banner con **la misma altura** en cada tamaño de pantalla (teléfono, tableta y escritorio), sin importar el largo del título o del texto. El contenido queda centrado verticalmente. Quiénes somos conserva sus logotipos alternados dentro de esa altura.
2. **Barra lateral de Productos con íconos.** Cada industria del filtro de Productos lleva su ícono (el mismo de `ICONOS_INDUSTRIAS` que usan Inicio e Industrias), a la izquierda del nombre, con el número de productos. La opción «Todas las industrias» se queda sin ícono.
3. **Barra lateral de Industrias igual a la de Productos.** Reemplazar la barra de solo íconos por una lista con el mismo ancho, tipografía, colores, ícono, nombre, número de productos y forma de marcar la industria activa que la de Productos, sin la opción «Todas las industrias». Sigue siendo navegación (`<nav>`, enlaces a `/industrias/<clave>`, `aria-current`). En teléfono se comporta igual que la de Productos.
4. **Quitar lo que viene del prototipo y no va en la aplicación final.** Revisa el código y recorre con Playwright **todas** las pantallas del sitio, del panel y del picking. Ya se encontraron estos:
   - Quiénes somos: «Imagen del valor pendiente de INCOVSA» (`src/app/(sitio)/nosotros/page.tsx`).
   - Productos y su detalle: el aviso «Industria por confirmar» (tarjeta, filtro y detalle) y «Por confirmar» en presentación y origen (`TarjetaProducto.tsx`, `CatalogoCliente.tsx`, `productos/[id]/page.tsx`).
   - Industrias: «Imagen de la industria» cuando no hay imagen (`Industrias.tsx`).
   - Panel: «Por confirmar» en el editor del catálogo (`EditorCatalogo.tsx`) y el texto de ayuda «Texto pendiente de INCOVSA» (`EditorContenido.tsx`).
   - Textos con códigos internos de pendientes: «(P-92)» en Documentos (`src/componentes/panel/Documentos.tsx`) y «(P-91)» en Facturación (`src/componentes/picking/facturacion/FacturacionTablero.tsx`).

   **Criterio:** en el sitio público, si falta un dato, el elemento no se muestra (sin aviso, sin hueco y sin el filtro «Industria por confirmar»; un producto sin industria solo aparece en «Todas las industrias»; también se quita `"sin"` del `z.enum` de `src/app/(sitio)/productos/page.tsx`). En el panel, la celda sin dato queda vacía. Los códigos P-xx se quitan del texto, sin cambiar el resto del mensaje. La página `/muestras/[sistema]` no existe en producción (`notFound()` fuera de desarrollo): no se toca.
5. **Registrar el cambio** en `specs/05` (banners, barras laterales y datos que faltan) y en `specs/18`, como pedido del Ing. Manuel Rojas del 02/11 que se aparta del prototipo aprobado.
6. Actualizar las pruebas que buscaban esos textos o la barra de íconos para que comprueben el comportamiento nuevo. Es un cambio de requisito: no se borran casos sin reemplazarlos.

## Archivos que creas o modificas
- `src/componentes/sitio/**`, `src/app/(sitio)/**` (Daniela), `src/componentes/panel/EditorCatalogo.tsx`, `EditorContenido.tsx`, `Documentos.tsx` (Daniela), `src/componentes/picking/facturacion/FacturacionTablero.tsx` (José Daniel): autorización del coordinador (protocolo §E1), con aviso en la bitácora
- `pruebas-e2e/sitio/**`, `pruebas-e2e/panel/**`, `pruebas-e2e/picking/facturacion*.spec.ts` y las pruebas unitarias que correspondan
- `specs/05-sitio-web.md`, `specs/18-historial-de-decisiones.md`

## Criterios de aceptación
1. **Banners:** en teléfono, tableta y escritorio, el banner de Quiénes somos, Industrias, Productos, Noticias y Contacto mide lo mismo (diferencia de 1 px como máximo).
2. **Barra de Productos:** cada industria muestra su ícono, su nombre y su número de productos; «Todas las industrias» no lleva ícono.
3. **Barra de Industrias:** tiene el mismo ancho, ícono, nombre, número de productos y estado activo que la de Productos, y cada enlace lleva a su industria con `aria-current="page"` en la activa.
4. **Sin restos del prototipo:** ninguna pantalla del sitio, del panel ni del picking muestra «pendiente de INCOVSA», «por confirmar», «Imagen de la industria» ni códigos P-xx.
5. Se mantienen el contraste (RNF-08) y la accesibilidad de axe en las pantallas cambiadas.

## Pruebas obligatorias
- e2e del sitio: misma altura de los cinco banners en los tres tamaños; íconos en las dos barras; navegación de la barra de Industrias; producto sin industria sin aviso.
- e2e o unitarias del panel y de Facturación sin los textos quitados.
- `pruebas-e2e/flujo/sin-restos-del-prototipo.spec.ts`: recorre con Playwright todas las pantallas del sitio, del panel y del picking, y falla si aparece alguno de los textos prohibidos.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio pruebas-e2e/panel pruebas-e2e/picking/facturacion-carga.spec.ts pruebas-e2e/flujo/sin-restos-del-prototipo.spec.ts
```

## Fuera de alcance
- Cambios de contenido (los textos oficiales los carga DM-12).
- Cualquier otro cambio de diseño que no haya pedido el docente.

## Notas
- Antes de empezar, toma capturas del estado actual de las cinco secciones en los tres tamaños, para comparar en el PR.
