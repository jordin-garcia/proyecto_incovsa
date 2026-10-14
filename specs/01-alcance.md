# 01. Alcance

## Componentes

La solución es **una sola aplicación web**, bajo el dominio **incovsa.com**, con dos componentes:

1. **Sitio web corporativo e institucional autoadministrable.** Es la presencia digital de la empresa y el punto de entrada a los sistemas internos.
2. **Sistema de control logístico de bodega (sistema de picking).** Cubre el proceso posterior a la facturación: carga del pedido facturado desde Odoo, conversión a unidades, preparación, despacho, ruta y reportes.

> **Cambio del 29/09/2026 (reunión 4).** El sistema de picking **ya no lleva control de inventario** (existencias, entradas y salidas), y los pedidos se cargan desde un archivo exportado de Odoo en lugar de capturarse a mano. El acceso pasa a depender de **permisos por usuario**.
>
> **Cambio del 13/10/2026 (reunión 5).** Los datos del archivo de Odoo (producto, Peso de Conversión, lote, cliente y sector) se usan **tal como vienen**: el picking ya no tiene catálogos de productos, clientes ni sectores. Lo que sale en camión se llama **ruta** y lo que recoge el cliente, **pedido**. La documentación interna pasa a **enlaces de Google Drive** y las solicitudes de contacto **ya no se envían por correo**.

### Niveles de acceso del sitio

| Nivel | Contenido | Acceso |
|---|---|---|
| 1. Sitio informativo | Información institucional, industrias, catálogo, noticias, contacto | Público |
| 2. Documentación interna | Fichas técnicas, hojas de seguridad y certificados de análisis | Usuarios con permisos de documentación |
| 3. Sistema de picking | Módulos logísticos | Usuarios del picking, según sus permisos y las sedes que tienen asignadas |

### Módulos del sistema de picking

| Módulo | Propósito | Especificación |
|---|---|---|
| Facturación | Cargar los pedidos ya facturados en Odoo, desde el archivo .xlsx exportado, y armar las rutas y los pedidos | [06-picking-facturacion.md](06-picking-facturacion.md) |
| Bodega | Tablero de preparación: qué sacar de la bodega, de qué lote y en qué unidades | [07-picking-bodega.md](07-picking-bodega.md) |
| Ruta | Clientes de la ruta asignada al piloto y cierre de la entrega | [08-picking-ruta.md](08-picking-ruta.md) |
| Reportes | Despacho por producto y rutas realizadas, con filtros por periodo | [10-picking-reportes.md](10-picking-reportes.md) |
| Configuración | Camiones y usuarios del picking (13/10) | [11-picking-configuracion.md](11-picking-configuracion.md) |

El módulo de **Inventario se eliminó** el 29/09/2026 ([09-picking-inventario.md](09-picking-inventario.md)).

## Dentro del alcance

### Sitio web

- Información institucional: historia, misión, visión y valores. Misión y visión con su texto y su imagen; valores como 5 imágenes (13/10).
- Galerías de hasta 5 imágenes que rotan en las áreas con imágenes del sitio (13/10).
- Industrias atendidas, con navegación por industria en una barra de íconos, imágenes por industria y sus productos en texto.
- Catálogo informativo de productos, sin precios y sin comercio electrónico, con búsqueda.
- Detalle de producto (nombre, descripción, presentación, países de origen, imagen e industrias) con Productos Recomendados.
- Noticias con fotografía, título y texto.
- Información de contacto de Quetzaltenango y Guatemala, con su mapa de Google Maps, y formulario de solicitudes, quejas o reclamos, que se guardan en el sistema.
- Panel administrativo (CMS) para editar ese contenido sin tocar código, incluida la carga de imágenes.
- Gestión de las solicitudes de contacto: motivo, responsable, comentario y estado.
- Documentación interna protegida por permisos: productos documentados con los enlaces de Google Drive de su ficha técnica, hoja de seguridad y certificado de análisis, con búsqueda por lote, nombre y país de origen.
- Autenticación, restablecimiento de contraseña por Gerencia o Soporte y administración de usuarios del sitio con permisos.
- Acceso personal: usuario, elección del sistema (Odoo como enlace, administración del sitio o picking) y contraseña.
- Diseño responsivo.

### Sistema de picking

- Carga de pedidos facturados desde el archivo .xlsx exportado de Odoo a un tablero de pedidos facturados, que se guarda en la base de datos.
- Armado de rutas y pedidos: el facturador selecciona y arrastra los pedidos facturados a "Envío por camión" (con camión y piloto) o a "Cliente recoge en bodega", los ordena y escribe la fecha y hora programadas; cada ruta o pedido puede tener varios clientes, y el camión lleva control de peso.
- Conversión de kilogramos a unidades con el Peso de Conversión que trae el archivo de Odoo, con resto en kg para ventas fraccionadas.
- Alerta informativa de capacidad del camión.
- Tablero de preparación con lote, marcado por línea, prioridad y orden por peso compartidos en tiempo real, en modo claro u oscuro.
- Ruta del piloto, con recorrido y cierre de entrega.
- Estados de rutas y pedidos y registro histórico de rutas en Reportes.
- Reportes de despacho y rutas, con filtros por periodo y exportación a Excel y PDF.
- Configuración de camiones.
- Administración de usuarios del picking con rol, sedes y permisos por casillas.
- Bitácora de las acciones de los usuarios, incluidos los inicios de sesión, consultable en Reportes.

## Fuera del alcance

Cada exclusión tiene su motivo. Ninguna se debe presentar como implementada.

| Exclusión | Motivo |
|---|---|
| **Control de inventario**: existencias, entradas (compras, ajustes, traslados, devoluciones) y salidas | Decisión de INCOVSA (29/09). El sistema está pensado para integrarse en el futuro con Odoo, que es el que lleva el inventario de todas las bodegas. Falta la aprobación del docente (P-58) |
| Validación y descuento de existencias al registrar un pedido | Consecuencia de lo anterior (29/09) |
| Devoluciones y marca "Con devolución" | Eran entradas de inventario (29/09) |
| Captura manual de pedidos fila por fila | Reemplazada por la carga del archivo de Odoo (29/09) |
| Catálogos de productos, clientes y sectores en el picking | El archivo de Odoo trae esos datos y se usan tal como vienen (13/10) |
| Envío de correos (solicitudes de contacto o contraseñas) | Las solicitudes solo se guardan en el sistema (13/10) y las contraseñas las restablecen Gerencia o Soporte (11/10) |
| Guardar archivos PDF de la documentación interna | Los documentos están en el Google Drive de la empresa y el sistema guarda sus enlaces (13/10) |
| Integración directa con Odoo (API o base de datos) | El sistema solo **lee el archivo .xlsx** que el facturador exporta de Odoo y sube. El sitio solo enlaza al inicio de sesión de Odoo. La integración es a futuro |
| Recuperación de contraseña por correo | La contraseña la restablecen Gerencia o Soporte (11/10) |
| Mostrar la sede de Escuintla en el sitio | Es solo bodega, sin oficina para clientes (11/10) |
| Validar que una referencia de Odoo no se cargue dos veces | No puede pasar, porque los datos vienen de Odoo (11/10) |
| Control de lotes | El lote lo controla Odoo. El picking solo muestra el lote que trae el archivo (13/10) |
| Ubicaciones dentro de la bodega | No se guardan ni se muestran |
| Número de factura | No se registra |
| Separar INCOVSA e Inquiserca en el picking | Comparten productos |
| Distinguir productos "Controlados" y "No controlados" | No afecta al sistema |
| Lectura de código de barras | No forma parte de los módulos |
| Dirección y teléfono en la tabla de Ruta | La contraparte solo quiere Cliente, Sector y Total |
| Hora de salida y de regreso de la ruta | Solo se registran número, fecha, camión y piloto |
| Confirmación de carga en el camión | No se requiere |
| Registrar quién marca cada línea en Bodega | Decisión de la contraparte (24/09), reconfirmada el 11/10 |
| Editar el registro de una ruta | No se requiere |
| Pedidos en borrador | Un pedido no se guarda hasta enviarlo a bodega |
| Planificación de rutas en mapa y seguimiento del piloto | Propuesta 2, no seleccionada |
| Mantenimiento y combustible de la flota | Propuesta 3, no seleccionada |
| Comercio electrónico y precios en el sitio | Catálogo solo informativo |
| Cálculo de costos logísticos | El equipo entrega la herramienta; la empresa evalúa los costos |
| Control de papelería y permisos de precursores de los clientes | No fue solicitado |

### Cambios de alcance anteriores

- El 23/09 se habían incluido el registro de entradas (compras), los traslados entre sedes y un inventario propio. **El 29/09 salieron del alcance** junto con todo el control de inventario.
- La creación de productos en Configuración (23/09) **salió del alcance el 13/10**, porque el Peso de Conversión viene en el archivo de Odoo.
