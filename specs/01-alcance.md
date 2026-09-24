# 01. Alcance

## Componentes

La solución es **una sola aplicación web**, bajo el dominio **incovsa.com**, con dos componentes:

1. **Sitio web corporativo e institucional autoadministrable.** Es la presencia digital de la empresa y el punto de entrada a los sistemas internos.
2. **Sistema de control logístico de bodega (sistema de picking).** Cubre el proceso posterior a la facturación: registro del pedido facturado, conversión a unidades, preparación, despacho, ruta y control de existencias.

### Niveles de acceso del sitio

| Nivel | Contenido | Acceso |
|---|---|---|
| 1. Sitio informativo | Información institucional, industrias, catálogo, noticias, contacto | Público |
| 2. Documentación interna | Fichas técnicas, hojas de seguridad y certificados de análisis | Usuarios del sitio, según su rol |
| 3. Sistema de picking | Módulos logísticos | Usuarios del picking, según su rol y su sede |

### Módulos del sistema de picking

| Módulo | Propósito | Especificación |
|---|---|---|
| Facturación | Registrar los pedidos ya facturados en Odoo | [06-picking-facturacion.md](06-picking-facturacion.md) |
| Bodega | Tablero de preparación: qué sacar de la bodega y en qué unidades | [07-picking-bodega.md](07-picking-bodega.md) |
| Ruta | Clientes de la ruta asignada al piloto y cierre de la entrega | [08-picking-ruta.md](08-picking-ruta.md) |
| Inventario | Existencias actuales, entradas y salidas | [09-picking-inventario.md](09-picking-inventario.md) |
| Reportes | Reportes y consultas históricas (pendiente de especificar) | [10-picking-reportes.md](10-picking-reportes.md) |
| Configuración | Catálogos (productos, camiones, clientes, sectores) y usuarios del picking | [11-picking-configuracion.md](11-picking-configuracion.md) |

## Dentro del alcance

### Sitio web

- Información institucional: historia, misión, visión y valores.
- Industrias atendidas, con navegación por industria.
- Catálogo informativo de productos, sin precios y sin comercio electrónico.
- Detalle de producto.
- Noticias.
- Información de contacto y formulario de solicitudes, quejas o reclamos.
- Panel administrativo (CMS) para editar ese contenido sin tocar código.
- Documentación interna protegida por rol.
- Autenticación, recuperación de contraseña y administración de usuarios del sitio.
- Tres botones de acceso: Odoo (solo enlace), administración del sitio y sistema de picking.
- Diseño responsivo.

### Sistema de picking

- Registro de pedidos facturados, de dos tipos: cliente recoge en bodega o envío en camión.
- Conversión de kilogramos a unidades, con resto en kg para ventas fraccionadas.
- Validación de existencias y descuento automático al enviar el pedido a bodega.
- Alerta informativa de capacidad del camión.
- Tablero de preparación con marcado por línea y prioridad compartida en tiempo real.
- Ruta del piloto, con recorrido y cierre de entrega.
- Control de existencias por producto y sede, con estas operaciones:
  - entradas: compras, ajustes, traslados y devoluciones;
  - salidas: ventas, traslados y ajustes.
- Estados del pedido y registro histórico de rutas.
- Configuración de productos (incluido el Peso2), camiones, clientes, sectores y usuarios.
- Bitácora de operaciones.
- Reportes, con contenido pendiente de especificar.

## Fuera del alcance

Cada exclusión tiene su motivo. Ninguna se debe presentar como implementada.

| Exclusión | Motivo |
|---|---|
| Integración de datos con Odoo o con cualquier otra aplicación externa | Decisión de INCOVSA (24/09). El sitio solo enlaza al inicio de sesión de Odoo. Se trabaja con los datos de prueba entregados por la empresa |
| Control de lotes | El lote lo controla Odoo. Aquí solo interesan las existencias actuales. El lote aparece únicamente como parte del código de producto (ver [02-glosario.md](02-glosario.md)) |
| Ubicaciones dentro de la bodega | Las existencias se suman por sede. La ubicación no se guarda ni se muestra |
| Número de factura | Se usa un correlativo interno |
| Separar INCOVSA e Inquiserca en el picking | Comparten existencias |
| Distinguir productos "Controlados" y "No controlados" | No afecta al sistema |
| Datos reales de Guatemala y Escuintla | Las sedes existen en el sistema, pero arrancan con existencia 0. Las pruebas se hacen con Quetzaltenango |
| Lectura de código de barras | No forma parte de los módulos |
| Dirección y teléfono en la tabla de Ruta | La contraparte solo quiere Cliente, Sector y Total |
| Hora de salida y de regreso de la ruta | Solo se registran número, fecha, camión y piloto |
| Confirmación de carga en el camión | No se requiere |
| Registrar quién marca cada línea en Bodega | Decisión de la contraparte |
| Editar el registro de una ruta | Reemplazado por las devoluciones del módulo de Inventario (24/09) |
| Pedidos en borrador | Un pedido no se guarda hasta enviarlo a bodega |
| Planificación de rutas en mapa y seguimiento del piloto | Propuesta 2, no seleccionada |
| Mantenimiento y combustible de la flota | Propuesta 3, no seleccionada |
| Comercio electrónico y precios en el sitio | Catálogo solo informativo |
| Cálculo de costos logísticos | El equipo entrega la herramienta; la empresa evalúa los costos |
| Control de papelería y permisos de precursores de los clientes | No fue solicitado |

### Cosas que antes estaban excluidas y ahora sí están dentro

Estaban excluidas en la especificación del 20/09 y en el Documento 1 v0.1:

- **Registro de entradas de producto** (compras): incluido el 23/09.
- **Traslados entre sedes**: incluidos el 23/09.
- **Creación de productos en el sistema**: permitida en Configuración a Gerencia y Soporte IT (23/09).
