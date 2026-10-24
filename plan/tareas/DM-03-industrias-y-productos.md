---
id: DM-03
titulo: "Sitio público: Industrias, Productos y detalle de producto"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: hecha
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
- Prototipo: `#/industrias`, `#/industrias/cuero`, `#/productos` y `#/productos/pp01`; `sitio.js` › `industrias()`, `catalogo()`, `producto()`, `tarjetaProducto()` y `tarjetaIndustria()`
- `## Resultado` de DM-02

## Qué hacer
1. **Industrias** (`/industrias` y `/industrias/[id]`, RF-SW-03): barra lateral izquierda **solo con íconos** de las 9 industrias; al pasar el cursor o el foco del teclado se muestra el nombre; al elegir una, la página no salta (como `conservarDesplazamiento`); la industria elegida muestra su número ("Industria 01 de 9"), su nombre, el botón "Ver en el catálogo", su **descripción**, su **galería** (sin imágenes, el ícono de la industria como en el prototipo) y **sus productos como texto**. **Sin pie de página.**
   - **Productos de cada industria (P-97, resuelto el 17/10):** los productos públicos del catálogo que tienen esa industria, en orden alfabético por nombre, con su cuenta en el título ("Productos para esta industria · N"), como texto. **No** se usa la lista fija de `base.js` › `INDUSTRIAS` (specs/05).
2. **Productos** (`/productos`, RF-SW-04): solo informativo, sin precios; búsqueda y filtro por industria como el prototipo (incluido "Todas las industrias" con su cuenta); tarjeta con la galería, el nombre, los países de origen y la presentación; **nunca el lote**. **Sin pie de página.**
3. **Detalle** (`/productos/[id]`, RF-SW-05): galería, nombre, descripción, presentación, países de origen e industrias; sin documentos técnicos; **sin pie de página**.
4. **Productos Recomendados** (RF-SW-17, decisión 14): siempre aparece; hasta 4 productos: primero los que comparten alguna industria con el producto, en orden alfabético por nombre; si no alcanzan, se completa con otros productos del catálogo, en orden alfabético; nunca el mismo producto.
5. Lecturas públicas en `src/modulos/contenido/` (industrias, productos públicos con sus industrias e imágenes).

## Archivos que creas o modificas
- `src/app/(sitio)/industrias/**`, `src/app/(sitio)/productos/**` (crear)
- `src/componentes/sitio/**`, `src/modulos/contenido/**` (modificar)
- `pruebas-e2e/sitio/industrias-y-productos.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-03:** la barra de industrias muestra solo íconos y el nombre al pasar el cursor o con el foco; cada industria muestra su descripción, su galería y, como texto, los productos públicos que tienen esa industria (P-97); al agregarle o quitarle una industria a un producto en el catálogo, la lista cambia.
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

## Resultado

Implementado el 21/10/2026 por Daniela Marín (`InAlexa`):

- **Industrias:** `/industrias` muestra Cuero; `/industrias/[id]` usa los identificadores estables del prototipo (`cuero`, `textil`, `cereria`, `hulera`, `medicamentos`, `limpieza`, `alimentacion`, `agua`, `lavanderia`). Barra de nueve íconos con nombre al pasar el cursor y al enfocar, navegación sin reiniciar el desplazamiento, descripción, galería y espacio con ícono cuando faltan imágenes. Los productos en texto salen de la relación real del catálogo, en orden alfabético español y con su recuento (P-97).
- **Catálogo público:** `/productos`, con búsqueda por nombre sin distinción de mayúsculas o acentos, filtros de las nueve industrias, «Todas las industrias» e «Industria por confirmar», recuentos y estado sin coincidencias. Admite entrada directa con `?industria=cuero` y los demás identificadores. Conserva tres columnas del catálogo en teléfono, como el prototipo. Las tarjetas muestran galería, nombre, origen, presentación e industrias; ninguna lectura incluye lote.
- **Detalle:** `/productos/[id]` usa el identificador numérico de `ProductoSitio`, validado con Zod antes de consultar datos. Incluye galería, descripción, presentación, origen, enlaces de industrias y las acciones del prototipo. «Productos Recomendados» siempre se dibuja, aun sin candidatos, y devuelve hasta cuatro: primero coincidencias de cualquier industria y luego relleno, ambos grupos alfabéticos y sin el producto actual. Todas las rutas nuevas van sin pie.
- **Lectura pública reutilizable:** `leerCatalogoSitio()` en `src/modulos/contenido/catalogo.ts` devuelve `{ industrias, productos }`, con campos públicos explícitos, galerías ordenadas de hasta cinco direcciones e industrias de cada producto. Su caché es por renderizado de React, no persistente entre visitas. No requiere sesión porque no lee datos internos. `recomendarProductos(actual, catalogo)` contiene la regla probada por separado; tipos `CatalogoSitio` y `ProductoPublico` para las pantallas y DM-05.
- **Componentes:** `Industrias`, `CatalogoCliente` y `TarjetaProducto`, junto con `EncabezadoPagina` y `Galeria` de DM-02. `PresentacionDinamica` observa también inserciones y eliminaciones de tarjetas al filtrar. El catálogo expone `data-hidratado` únicamente tras hidratar, para verificar las interacciones sin carreras.
- **Decisiones:** se mantiene el orden del catálogo por ID del conjunto de demostración; las listas de industria y los recomendados sí se ordenan alfabéticamente. Los filtros desconocidos vuelven a «Todas las industrias» y los identificadores de ruta inválidos usan el 404 de Next.js. Las notas P-xx y el botón de demostración se excluyen según specs/20. El texto «Por confirmar» procede del prototipo. Para RNF-08, la cabecera de la industria puede acomodarse en varias líneas en teléfono y los textos secundarios usan tokens con contraste suficiente. Sin dependencias, migraciones ni cambios de especificaciones.
- **Verificación:** fase roja documentada; `npm ci` (687 paquetes, cero vulnerabilidades), migraciones existentes sin pendientes, plan válido (63 tareas), `npm run verificar` (formato, lint, tipos y 307 pruebas en 34 archivos), `npm run build`, nueve E2E propias en los tres tamaños sin reintentos y suite E2E completa con código 0 (211 aprobadas directamente y dos intermitentes aprobadas al primer reintento, sin omisiones). Axe completo, sin violaciones serias o críticas en las pantallas de DM-03. Next-devtools final sin errores de configuración ni ejecución. No se redujeron pruebas ni umbrales.
- **Evidencia:** 30 capturas comparativas de Industrias, catálogo, detalle, filtro y búsqueda vacía en `pruebas-e2e/sitio/evidencias/DM-03/README.md`. Se corrigieron los hallazgos de fidelidad de la revisión independiente: cascada del espacio superior, tamaño del título de recomendados, rótulo de encabezado y columnas del catálogo móvil.
- **Uso para DM-05:** administrar `Industria`, `ProductoSitio`, `ProductoIndustria` e `Imagen` mediante las acciones protegidas del panel; las lecturas públicas reflejan las relaciones e imágenes guardadas en cada visita. Las industrias de los productos son `{ id, nombre }` y los arreglos `imagenes` contienen solo direcciones públicas. Las fotos mantienen su orden `posicion` y el límite de cinco.

El cambio local autorizado de `.codex/config.toml` se conserva fuera de los commits. Las capturas ajenas regeneradas por la suite se restauraron tras comprobar que no existían cambios previos del usuario en ellas. La edición de industrias y productos en el panel continúa en DM-05, en otra conversación.

### Correcciones de la auditoría (2026-10-22)

H-02: se comprueba el título «Productos para esta industria · N» con el recuento real de los productos relacionados.
