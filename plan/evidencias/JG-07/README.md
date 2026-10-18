# Comparación visual de JG-07

Referencia: `panel.js` (`armazon`, `Panel.SECCIONES`, `sinAcceso`), `picking.js` (`vista`, `ruta`) y `base.js` (permisos y sede), con las mismas cuentas de ejemplo. Tamaños: teléfono 390 × 844, tableta 768 × 1024 y escritorio 1440 × 900.

El alcance de estas capturas es el armazón conectado a la sesión: nombre y rol reales, sedes, opciones permitidas y estados de navegación y de acceso denegado. En las capturas de módulos permitidos se oculta exclusivamente `.contenido` en **ambas** versiones: las pantallas de negocio son de otras tareas. En los estados de acceso denegado se conserva toda la pantalla. No se muestran productos ni clientes de la simulación.

Cada caso tiene captura normal y menú abierto (390/768), o menú expandido y reducido (1440). `capturar.mjs` las reproduce con el servidor de la aplicación en 3000, el prototipo en 4173 y `CLAVE_DEMO` en el entorno local. No usa contraseñas ni datos de INCOVSA.

## Armazones por cuenta

Las pruebas de `pruebas-e2e/acceso/permisos.spec.ts` comprueban el texto y el orden exactos de todos los enlaces en los tres tamaños, además de axe. Se comparan visualmente las capturas para comprobar estructura, colores, tipos, usuario, sede y comportamiento del menú.

| Cuenta / sistema | Aplicación (390 / 768 / 1440) | Prototipo (390 / 768 / 1440) |
|---|---|---|
| 03 / picking: Facturación | [390](capturas/ejemplo.03-picking-facturacion-390-aplicacion-menu.png) · [768](capturas/ejemplo.03-picking-facturacion-768-aplicacion-menu.png) · [1440](capturas/ejemplo.03-picking-facturacion-1440-aplicacion.png) | [390](capturas/ejemplo.03-picking-facturacion-390-prototipo-menu.png) · [768](capturas/ejemplo.03-picking-facturacion-768-prototipo-menu.png) · [1440](capturas/ejemplo.03-picking-facturacion-1440-prototipo.png) |
| 03 / sitio: Documentación interna | [390](capturas/ejemplo.03-sitio-documentos-390-aplicacion-menu.png) · [768](capturas/ejemplo.03-sitio-documentos-768-aplicacion-menu.png) · [1440](capturas/ejemplo.03-sitio-documentos-1440-aplicacion.png) | [390](capturas/ejemplo.03-sitio-documentos-390-prototipo-menu.png) · [768](capturas/ejemplo.03-sitio-documentos-768-prototipo-menu.png) · [1440](capturas/ejemplo.03-sitio-documentos-1440-prototipo.png) |
| 05 / picking: Bodega y Tablero | [390](capturas/ejemplo.05-picking-bodega-390-aplicacion-menu.png) · [768](capturas/ejemplo.05-picking-bodega-768-aplicacion-menu.png) · [1440](capturas/ejemplo.05-picking-bodega-1440-aplicacion.png) | [390](capturas/ejemplo.05-picking-bodega-390-prototipo-menu.png) · [768](capturas/ejemplo.05-picking-bodega-768-prototipo-menu.png) · [1440](capturas/ejemplo.05-picking-bodega-1440-prototipo.png) |
| 06 / picking: Ruta | [390](capturas/ejemplo.06-picking-ruta-390-aplicacion-menu.png) · [768](capturas/ejemplo.06-picking-ruta-768-aplicacion-menu.png) · [1440](capturas/ejemplo.06-picking-ruta-1440-aplicacion.png) | [390](capturas/ejemplo.06-picking-ruta-390-prototipo-menu.png) · [768](capturas/ejemplo.06-picking-ruta-768-prototipo-menu.png) · [1440](capturas/ejemplo.06-picking-ruta-1440-prototipo.png) |
| 08 / sitio: todas las secciones salvo Usuarios | [390](capturas/ejemplo.08-sitio-contenido-390-aplicacion-menu.png) · [768](capturas/ejemplo.08-sitio-contenido-768-aplicacion-menu.png) · [1440](capturas/ejemplo.08-sitio-contenido-1440-aplicacion.png) | [390](capturas/ejemplo.08-sitio-contenido-390-prototipo-menu.png) · [768](capturas/ejemplo.08-sitio-contenido-768-prototipo-menu.png) · [1440](capturas/ejemplo.08-sitio-contenido-1440-prototipo.png) |
| 09 / sitio: Documentación interna | [390](capturas/ejemplo.09-sitio-documentos-390-aplicacion-menu.png) · [768](capturas/ejemplo.09-sitio-documentos-768-aplicacion-menu.png) · [1440](capturas/ejemplo.09-sitio-documentos-1440-aplicacion.png) | [390](capturas/ejemplo.09-sitio-documentos-390-prototipo-menu.png) · [768](capturas/ejemplo.09-sitio-documentos-768-prototipo-menu.png) · [1440](capturas/ejemplo.09-sitio-documentos-1440-prototipo.png) |
| 01 / picking: acceso total y tres sedes | [390](capturas/ejemplo.01-picking-facturacion-390-aplicacion-menu.png) · [768](capturas/ejemplo.01-picking-facturacion-768-aplicacion-menu.png) · [1440](capturas/ejemplo.01-picking-facturacion-1440-aplicacion.png) | [390](capturas/ejemplo.01-picking-facturacion-390-prototipo-menu.png) · [768](capturas/ejemplo.01-picking-facturacion-768-prototipo-menu.png) · [1440](capturas/ejemplo.01-picking-facturacion-1440-prototipo.png) |
| 01 / sitio: acceso total, incluido Usuarios | [390](capturas/ejemplo.01-sitio-contenido-390-aplicacion-menu.png) · [768](capturas/ejemplo.01-sitio-contenido-768-aplicacion-menu.png) · [1440](capturas/ejemplo.01-sitio-contenido-1440-aplicacion.png) | [390](capturas/ejemplo.01-sitio-contenido-390-prototipo-menu.png) · [768](capturas/ejemplo.01-sitio-contenido-768-prototipo-menu.png) · [1440](capturas/ejemplo.01-sitio-contenido-1440-prototipo.png) |

## Acceso denegado

| Estado | Aplicación (390 / 768 / 1440) | Prototipo (390 / 768 / 1440) |
|---|---|---|
| 03: Bodega sin `pk.bodega` | [390](capturas/ejemplo.03-picking-bodega-390-aplicacion.png) · [768](capturas/ejemplo.03-picking-bodega-768-aplicacion.png) · [1440](capturas/ejemplo.03-picking-bodega-1440-aplicacion.png) | [390](capturas/ejemplo.03-picking-bodega-390-prototipo.png) · [768](capturas/ejemplo.03-picking-bodega-768-prototipo.png) · [1440](capturas/ejemplo.03-picking-bodega-1440-prototipo.png) |
| 09: Usuarios reservado a Gerencia y Soporte | [390](capturas/ejemplo.09-sitio-usuarios-390-aplicacion.png) · [768](capturas/ejemplo.09-sitio-usuarios-768-aplicacion.png) · [1440](capturas/ejemplo.09-sitio-usuarios-1440-aplicacion.png) | [390](capturas/ejemplo.09-sitio-usuarios-390-prototipo.png) · [768](capturas/ejemplo.09-sitio-usuarios-768-prototipo.png) · [1440](capturas/ejemplo.09-sitio-usuarios-1440-prototipo.png) |

Se corrigieron el centrado del candado y los márgenes del título, la explicación y el enlace usando los valores del prototipo. Los textos son los de `sinAcceso()` y el enlace lleva al primer módulo permitido.

## Diferencias previstas

- El botón «Demostración» solo está en el prototipo (specs/20).
- Las cuentas, los permisos, las sedes y el cierre de sesión de la aplicación proceden del servidor. La sede se guarda en cookie y se revalida; el prototipo usa `sessionStorage`.
- El Resumen del panel está en `/panel/resumen` para cumplir la redirección de `/panel` que pide JG-07, sin cambiar su texto ni su regla de permisos.
- Las pantallas funcionales de cada módulo quedan fuera de JG-07; las rutas de conexión no inventan operaciones ni datos.
