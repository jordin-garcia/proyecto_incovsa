---
id: JG-28
titulo: Cambios del Ing. Manuel Rojas en el sitio, el panel y el picking
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: hecha
depende_de: []
programada: 2026-11-02
requisitos: [RF-SW-02, RF-SW-03, RF-SW-04, RNF-08]
pantallas: [sitio.js › nosotros, industrias, catalogo, producto, noticias, contacto; panel.js › catálogo, contenido, documentos; picking.js › facturación]
---

# JG-28 · Cambios del Ing. Manuel Rojas en el sitio, el panel y el picking

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** —

> **Urgente (replanificación del 02/11, JG-32):** se integra **antes del 03/11 a las 10:00**, porque Daniela (DM-13) y Josué (JM-07) toman las capturas de los manuales después de esta tarea. Es el único cambio de código permitido en `develop` hasta la entrega del 04/11.

## Objetivo
Aplicar los cambios que pidió el Ing. Manuel Rojas antes de la entrega del 04/11: banners de la misma altura en las secciones del sitio, la barra lateral de Productos igual a la de solo íconos de Industrias, con un ícono más para «Todas las industrias» (corregido el 03/11), y ningún texto ni elemento del prototipo que no deba ir en la aplicación final.

## Contexto que debes leer
- `specs/05-sitio-web.md` (Quiénes somos, Industrias, Productos, Noticias, Contacto, panel)
- `specs/16`, decisión 89 (en diseño manda el prototipo): estos cambios son una **excepción pedida por el docente**, que se registra en `specs/05` y `specs/18`
- `src/componentes/sitio/EncabezadoPagina.tsx`, `src/app/(sitio)/nosotros/page.tsx` (banner propio con logotipos), `src/componentes/sitio/sitio.css` y `nosotros.css`
- `src/componentes/sitio/Industrias.tsx` (barra de solo íconos), `src/componentes/sitio/CatalogoCliente.tsx` (filtros por industria) y `src/componentes/sitio/navegacion.ts` (`ICONOS_INDUSTRIAS`)

## Qué hacer
1. **Banners de la misma altura.** Quiénes somos, Industrias, Productos, Noticias y Contacto muestran el banner con **la misma altura** en cada tamaño de pantalla (teléfono, tableta y escritorio), sin importar el largo del título o del texto. El contenido queda centrado verticalmente. Quiénes somos conserva sus logotipos alternados dentro de esa altura.
2. **Barra lateral de Productos igual a la de Industrias (corregido el 03/11).** El filtro de Productos usa la misma barra de solo íconos de Industrias (la del prototipo, con el nombre en un globo), con una opción más al principio: «Todas las industrias», con un ícono de cuadrícula. El globo muestra solo el nombre. Junto a la barra, la rejilla del catálogo tiene 2 columnas hasta 720 px. *(El 02/11 decía: cada industria con su ícono a la izquierda del nombre y su número de productos, «Todas las industrias» sin ícono.)*
3. **Barra lateral de Industrias (corregido el 03/11).** Se queda como la del prototipo: solo íconos, nombre en un globo, navegación (`<nav>`, enlaces a `/industrias/<clave>`, `aria-current`). *(El 02/11 decía: reemplazarla por una lista igual a la de Productos, con nombre y número de productos.)*
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
2. **Barra de Productos (corregido el 03/11):** es la barra de solo íconos de Industrias (mismo ancho, tamaño de cada opción, fondo y colores normal y activo), con «Todas las industrias» primero y su ícono de cuadrícula, y las 9 industrias con su ícono en el mismo orden; sin nombres ni números fuera del globo, que muestra solo el nombre; la rejilla tiene 2 columnas hasta 720 px y 3 en tableta y escritorio.
3. **Barra de Industrias (corregido el 03/11):** solo íconos; el nombre aparece en un globo al pasar el cursor o con el teclado; cada enlace lleva a su industria con `aria-current="page"` en la activa.
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

## Resultado

**Qué se hizo**
- **Banners:** `.pag-cab` (`src/componentes/sitio/sitio.css`) tiene una altura mínima común, `--alto-pag-cab`, con el contenido centrado: 440 px en escritorio, 380 px en tableta (721–1024 px), 480 px de 481 a 720 px y 560 px en teléfono (hasta 480 px). Los cinco banners miden lo mismo desde 360 px de ancho; más angosto, el de Quiénes somos crece para no recortarse. En Quiénes somos (`nosotros.css`), los logotipos van a la par del texto en tableta (200 × 100 px) y debajo en teléfono (180 × 90 px). Antes medían de 254 a 626 px.
- **Barras laterales:** Productos (`CatalogoCliente.tsx`) muestra el ícono de `ICONOS_INDUSTRIAS` a la izquierda de cada industria; «Todas las industrias» no lleva ícono. Industrias (`Industrias.tsx`) usa la misma barra (`.filtros` y `.filtro-nombre`, 260 px): ícono, nombre y número de productos, como `<nav aria-label="Industrias">` con enlaces y `aria-current="page"`. En 900 px o menos, las dos son una fila que se desplaza de lado. Se quitaron los estilos de la barra de solo íconos y del globo con el nombre.
- **Sin restos del prototipo:** se quitaron el filtro y el chip «Industria por confirmar» (también `"sin"` del `z.enum` de `/productos`), «Por confirmar» en el detalle y en el Catálogo del panel (celdas vacías), «Imagen de la industria» (sin imágenes no se muestra la galería), «Imagen del valor pendiente de INCOVSA» (la tarjeta conserva solo su número), el texto de ayuda «Texto pendiente de INCOVSA», «(P-92)» en Documentos, «(P-91)» en Facturación y la instrucción interna de Noticias sin publicaciones. En el detalle de un producto, el dato que falta no se muestra.
- **Especificaciones:** `specs/04` (RF-SW-03, 04 y 05), `specs/05` («Cambios del Ing. Manuel Rojas» y sus secciones) y `specs/18`.

**Decisiones (con Jordin, 02/11)**
- Se conservan el recuadro vacío de misión y visión sin imagen (decisión del 14/10) y las cinco tarjetas de los valores sin imagen, solo con su número.
- Se quita la línea «Las noticias se publican desde el panel del sitio…» del estado vacío de Noticias.
- La tarjeta de un producto sin imagen conserva el ícono de imagen: es un elemento de diseño, no un aviso.

**Pruebas**
- `pruebas-e2e/sitio/banners.spec.ts`: los cinco banners miden lo mismo (±1 px), centrados, en los tres tamaños, con axe.
- `pruebas-e2e/sitio/industrias-y-productos.spec.ts`: barras de Productos e Industrias (ver «Corrección del coordinador» abajo), navegación con `aria-current`, producto sin industria solo en «Todas», detalle sin datos.
- `pruebas-e2e/flujo/sin-restos-del-prototipo.spec.ts`: recorre todas las pantallas del sitio, del panel y del picking (con un producto sin industria ni datos) y falla si aparece un texto prohibido, también en `placeholder`, `title`, `aria-label` y `alt`.
- Se actualizaron `nosotros.spec.ts`, `noticias.spec.ts` y `facturacion-carga.spec.ts`. Con el banner más alto, en teléfono el contenido con presentación dinámica (RF-SW-16) queda debajo del borde: las pruebas que lo usan se desplazan hasta él antes de comprobarlo (`industrias-y-productos.spec.ts` y `auditoria-ce13.spec.ts`).

**Cómo usarlo**
- Una página pública nueva con `EncabezadoPagina` recibe la altura común sin hacer nada más. Si un banner nuevo tiene más contenido que Quiénes somos, hay que subir `--alto-pag-cab` en `sitio.css` y en `specs/05`.
- Capturas de antes y después, y salidas de la verificación: `plan/evidencias/JG-28/`.

### Corrección del coordinador (2026-11-03)

Las instrucciones de las barras estaban al revés: la barra de **Productos** tenía que quedar como la de solo íconos de Industrias del prototipo, con un ícono más para «Todas las industrias». Esta corrección reemplaza el punto «Barras laterales» de arriba:
- **Industrias** (`Industrias.tsx`) vuelve a la barra del prototipo: `<nav className="ind-barra" aria-label="Industrias">`, solo íconos, nombre en un globo (`.ind-nombre`, `role="tooltip"`) al pasar el cursor o con el teclado, enlaces con `aria-label` y `aria-current="page"`.
- **Productos** (`CatalogoCliente.tsx`) usa esa misma barra (`.ind-lay2` y `.ind-barra`) con botones (`aria-pressed`): primero «Todas las industrias» con el ícono nuevo `cuadricula` (`src/componentes/comunes/iconos.tsx`) y después las 9 industrias. Sin nombres ni números de productos (decisión de Jordin: el globo dice solo el nombre).
- Junto a la barra, la rejilla del catálogo baja a 2 columnas hasta 720 px (decisión de Jordin); en tableta y escritorio sigue con 3.
- Se quitaron los estilos `.cat-lay`, `.filtros` y `.filtro-nombre`, que ya no se usan, y se restauraron los de `.ind-barra` y `.ind-nombre` para `a` y `button`.
- Prueba: «JG-28 / RF-SW-03 / RF-SW-04: Productos usa la barra de solo íconos de Industrias…» (`industrias-y-productos.spec.ts`) compara las dos barras (nombres, íconos, orden, ancho, tamaño de cada opción, fondo y colores normal y activo), comprueba que no muestran texto fuera del globo, el ícono propio de «Todas», el globo oculto que aparece al pasar el cursor o con el teclado, y las columnas de la rejilla en cada tamaño. La prueba «RF-SW-03 / P-97» vuelve a comprobar el globo de Industrias, como antes del 02/11.
- Capturas: `plan/evidencias/JG-28/correccion-*.png`.
