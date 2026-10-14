# 13. Datos maestros

Todos los datos de prueba vienen de archivos entregados por INCOVSA. Esos archivos están en `docs_incovsa/`, **fuera del repositorio**. Aquí solo se describen su estructura, las reglas de carga y las cifras.

> **Cambio del 13/10/2026 (reunión 5).** El sistema de picking **ya no tiene catálogos** de productos, clientes ni sectores: el producto, el Peso de Conversión, el lote, el cliente y el sector vienen en cada archivo de Odoo y se usan tal como vienen ([06-picking-facturacion.md](06-picking-facturacion.md)). Por eso **ya no hay carga inicial** de productos ni de clientes desde `Picking II.xlsm`, y el Excel maestro limpio (P-35) ya no hace falta.

## Archivos de la empresa

| Archivo | Uso en el proyecto |
|---|---|
| `PROYECTO PICKING/Data Odo Para Picking.xlsx` | Export de 80 salidas de Odoo (agosto 2026). Es el **formato del archivo que se carga en Facturación** y el dato de prueba de la importación (ver abajo). La copia local tiene fecha del 08/10/2026 |
| `PROYECTO PICKING/Picking II.xlsm` | Era la fuente de productos, Peso de Conversión, clientes y sectores. **El sistema ya no lo usa** (13/10). El prototipo de simulación toma de ahí nombres de productos, pesos, lotes y clientes reales solo para armar sus rutas y pedidos de ejemplo ([20](20-prototipo-aprobado.md)) |
| `PROYECTO PICKING/INVENTARIO INCOVSA.xlsx` | Export de existencias de Odoo (22/09). **Ya no se usa** desde el 29/09, porque el sistema no lleva inventario |
| `PAGINA WEB/CATALOGO/` (28 imágenes) | Productos públicos de prueba para el sitio |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (3 PDF) | Ejemplos de ficha técnica, hoja de seguridad y certificado de análisis. Desde el 13/10 los documentos se registran como enlaces de Google Drive; estos PDF sirven de ejemplo en el prototipo |
| `PAGINA WEB/DOCUMENTOS TECNICOS/CONTROL DE DOCUMENTOS TECNICOS POR INGRESO 2026.xlsx` | Solo sirvió en una reunión para mostrar cómo se manejan los documentos técnicos. **No se carga nada** de él (12/10) |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (2 videos de WhatsApp, 21/09) | **No tienen ningún uso** en el proyecto (12/10) |
| `PAGINA WEB/INFORMACION EMPRESA/` | Misión, visión, el logotipo "INCOVSA Químicos", el logotipo "Transformamos INCOVSA" (uso interno) y, desde el 13/10, el **logotipo de Inquiserca** (`Inquiserca.jpeg`, 1280 × 350 px), que resuelve P-69 |

> Los archivos que empiezan con `~$` son archivos temporales que crea Excel mientras un archivo está abierto. No son datos.

## Archivo de pedidos de Odoo

**Uso:** formato del archivo que el facturador sube a Facturación (RF-SL-50, [06-picking-facturacion.md](06-picking-facturacion.md)). Las reglas de lectura están en RN-35, RN-36, RN-37 y RN-50.

### Estructura del archivo de ejemplo

Una sola hoja, `Sheet1`, con 16 columnas. El archivo de Odoo **siempre** se exporta con esta misma estructura (12/10):

| Columna | ¿Se usa? |
|---|---|
| `Referencia` | **Sí.** Número de pedido facturado (tercer segmento) y bodega (primer segmento) |
| `Contacto` | **Sí.** Nombre del cliente, tal como viene |
| `Contacto/Ciudad` | **Sí.** Sector del cliente, tal como viene |
| `Contacto/Calle`, `Contacto/Calle2`, `Contacto/Estado`, `Contacto/País` | No se usan |
| `Documento origen` | No se usa (por ejemplo, `S27798`) |
| `Tipo de Compra` | No se usa (`VENTAS`) |
| `Bodega de Ingreso/Salida` | No se usa (`BODEGA XE`) |
| `Estado` | **Sí.** Solo se cargan las referencias "Hecho" |
| `Movimientos de stock/Producto` | **Sí.** Nombre del producto, con el origen y la presentación entre paréntesis: `SODA ASH (CHI-SAC/0040KG)` |
| `Movimientos de stock/Producto/Peso` | **Sí, desde el 13/10.** Peso de Conversión de la línea, en kg (RN-37). Hasta el 13/10 no se usaba porque en algunos productos venía en cero |
| `Movimientos de stock/Números de serie` | **Sí, desde el 13/10.** Lote de la línea (por ejemplo, `5287`). Se guarda y se muestra en Bodega |
| `Movimientos de stock/Cantidad hecha` | **Sí.** Cantidad en kg |
| `Ubicación de origen/Nombre mostrado` | No se usa (`XE-IN/Existencias`) |

### Cifras del archivo de ejemplo

Análisis del equipo del 09/10/2026 y del 14/10/2026, sin datos personales:

| Concepto | Cantidad |
|---|---|
| Filas de agrupación de Odoo (texto en Referencia sin Contacto ni Producto, por ejemplo "agosto 2026 (80)") | 1. No es un pedido y se ignora |
| Referencias | 80, todas con prefijo `XE-IN` (Quetzaltenango), del número 03539 al 03627, sin repetidos |
| Referencias en estado "Cancelado" | 1. No se carga (RN-35) |
| Referencias en estado "Hecho" | 79, con 205 líneas de producto |
| Contactos distintos | 52. Un mismo contacto aparece en hasta 4 referencias, y cada referencia es un pedido facturado distinto |
| Líneas de referencias "Hecho" con Peso de Conversión en 0 | **82, en 46 de las 79 referencias.** Con RN-50, esos 46 pedidos facturados no se cargan y con el archivo de ejemplo se cargan **33** |
| Líneas de referencias "Hecho" sin lote | 0 |
| Pesos de Conversión distintos (sin contar el 0) | 25, 30, 35, 45, 50, 120, 180 y 200 kg |
| Productos con más de un Peso de Conversión en el archivo | 0 |
| Producto cuyo peso no coincide con la presentación de su nombre | `SODA ASH (CHI-SAC/0040KG)`: peso 25 en sus 12 líneas. Se usa 25, como viene (P-90) |
| Líneas con cantidad decimal | 4 |

El Ing. William se comprometió a entregar el archivo con **todos los datos** de las columnas que usa el sistema (13/10). El archivo de ejemplo actual no los trae completos (columna de peso).

## Carga inicial

| Dato | Carga inicial |
|---|---|
| Productos, clientes y sectores del picking | **Ninguna** (13/10). No existen como catálogos |
| Camiones | Los 3 de Quetzaltenango: dos de 3,400 kg y uno de 6,000 kg. Falta su identificación (P-01) |
| Sedes, permisos y estados | Fijos, en la semilla ([16](16-arquitectura-y-tecnologia.md)) |
| Usuarios | El usuario administrador inicial (P-08). Los demás los crean Gerencia y Soporte |
| Contenido del sitio | Los textos e imágenes que entregue INCOVSA (P-17 a P-23) |

### Decisiones anteriores sobre el catálogo de `Picking II` que ya no se aplican

Hasta el 13/10 el catálogo del picking se cargaba de `Picking II.xlsm`, convertido al formato de nombres de Odoo: 856 códigos, 9 códigos con errores de escritura (6 corregidos y 3 excluidos), 3 corregidos por la clave normalizada (P-88), METANOL con 164 kg, y 336 productos y 314 clientes como resultado. Todo eso **deja de aplicar** el 13/10, porque los datos vienen en el archivo de Odoo. El detalle queda en [18-historial-de-decisiones.md](18-historial-de-decisiones.md).

## Datos personales

Los nombres de clientes, pilotos y personal, las coordenadas y los documentos de identidad **no se suben al repositorio** ni se escriben en esta carpeta. Las semillas de base de datos que se suban al repositorio usan solo datos ficticios o ya públicos en esta carpeta ("Usuario de ejemplo NN", "Camión 1" a "Camión 3"). Los pedidos facturados reales llegan siempre en el archivo de Odoo.
