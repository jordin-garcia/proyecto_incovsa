# Lógica de conversión de kilogramos a unidades

Esta sección se completa en la versión 0.2 de este documento, con el módulo `conversion` y sus pruebas. La regla vigente es RN-01: `unidades = parte entera (cantidad en kg ÷ Peso de Conversión)` y `resto = cantidad en kg − unidades × Peso de Conversión`, calculada en gramos enteros, sin redondeo (RN-05).

# Lógica de inventario

El sistema **no lleva control de inventario** (RN-40): ni existencias, ni entradas, ni salidas. El 29/09/2026 INCOVSA decidió sacarlo del alcance porque el inventario de todas sus bodegas ya lo lleva su ERP, Odoo. Llevarlo también en este sistema duplicaría el registro y obligaría a conciliar dos fuentes.

Por eso no hay módulo, tablas ni pantallas de inventario. Los pedidos llegan al sistema en el archivo que el facturador exporta de Odoo, después de facturar, y el sistema se encarga de la preparación, la carga y el despacho.

# Lógica de picking y despacho

Esta sección se completa en la versión 0.2 de este documento, con los módulos `odoo`, `pedidos` y `bodega`.

# Manejo de archivos

Tabla: Archivos que maneja el sistema {#tab:archivos}

| Archivo | Dónde se guarda | Controles |
|---|---|---|
| Archivo .xlsx de Odoo | No se guarda: se lee en el servidor y se descarta | Máximo 2 MB (el de ejemplo pesa 25 KB con 80 referencias). Se valida que el contenido sea realmente un .xlsx, se leen solo las columnas que se usan y todo se valida con Zod antes de mostrar sus líneas |
| Imágenes del sitio | Cloudflare R2 | Se validan por su contenido (que sea una imagen de un formato admitido) y el servidor genera el nombre con que se guardan |
| Documentos internos (FT, HS y COA) | Sistema de archivos del servidor, **fuera de la carpeta pública** | Se valida que sean PDF por su contenido. Solo se entregan por una ruta protegida que verifica los permisos del usuario (RN-19). El servidor genera el nombre con que se guardan; el nombre original solo se guarda como dato |

Que el servidor genere el nombre de cada archivo evita que alguien escriba fuera de la carpeta prevista o reemplace otro archivo usando un nombre manipulado.

## Lectura del archivo de Odoo

El archivo se lee con SheetJS 0.20.3, solo en el servidor, con estas reglas (RN-35 a RN-37):

- Se lee de arriba hacia abajo. Una fila sin Referencia ni Contacto pertenece a la última referencia y contacto de arriba.
- Solo se cargan las referencias en estado «Hecho».
- Se ignoran las filas de agrupación que agrega Odoo (texto en Referencia sin Contacto ni Producto).
- Si una línea de una referencia «Hecho» trae una cantidad vacía, no numérica o menor o igual a 0, ese pedido facturado no se carga y se avisa en el resumen de la carga.
- El Peso de Conversión sale del catálogo del sistema, nunca de la columna de peso del archivo.

# Manejo de errores

- **Errores de validación** (un dato que falta o está mal escrito): se muestran al usuario junto al campo, con un mensaje que dice cómo corregirlo. Los esquemas de Zod son los mismos en el navegador y en el servidor.
- **Errores de la carga del archivo de Odoo:** se muestran en un resumen de la carga, con los productos que faltan, los clientes que no existen y los pedidos facturados que no se cargaron y por qué.
- **Errores inesperados:** el usuario ve un mensaje general, sin detalles técnicos. El detalle (operación, usuario y error) queda solo en el registro del servidor.
- **Errores de permisos:** si alguien intenta una operación sin permiso, el servidor la rechaza y no revela qué datos existen.
- **Transacciones:** el envío de un pedido a bodega crea el pedido, sus líneas, su estado y su ruta en una sola transacción. Si algo falla, no se guarda nada (RNF-06).

# Servicios externos

Tabla: Servicios externos {#tab:servicios}

| Servicio | Uso | Cómo se conecta |
|---|---|---|
| Cloudflare R2 (plan gratuito) | Imágenes del sitio y, en un bucket privado aparte, los respaldos | API compatible con S3, con credenciales en variables de entorno |
| Servidor de correo SMTP de la empresa | Envío por correo de las solicitudes del formulario de contacto. No se usa para recuperar contraseñas | Nodemailer, con la cuenta SMTP de la empresa en variables de entorno |
| Odoo | Enlace al inicio de sesión de Odoo, y archivo .xlsx que el facturador exporta de Odoo y sube a Facturación | No hay conexión directa: el archivo se sube desde el navegador |

No hay más integraciones. La conexión directa con Odoo queda como trabajo futuro, fuera del alcance. La lógica de lectura del archivo vive en el módulo `odoo`, separada de las pantallas, para poder reutilizarla cuando exista esa conexión.
