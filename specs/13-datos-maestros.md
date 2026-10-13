# 13. Datos maestros

Todos los datos de prueba vienen de archivos entregados por INCOVSA. Esos archivos están en `docs_incovsa/`, **fuera del repositorio**. Aquí solo se describen su estructura, las reglas de carga y las cifras.

## Archivos de la empresa

| Archivo | Uso en el proyecto |
|---|---|
| `PROYECTO PICKING/Picking II.xlsm` | **Fuente de productos, Peso de Conversión, clientes y sectores** |
| `PROYECTO PICKING/INVENTARIO INCOVSA.xlsx` | Export de existencias de Odoo (recibido el 22/09). Era la fuente de las existencias iniciales de Quetzaltenango. **Ya no se usa** desde el 29/09, porque el sistema no lleva inventario |
| `PROYECTO PICKING/Data Odo Para Picking.xlsx` | Export de 80 salidas de Odoo (agosto 2026). Desde el 29/09 es el **formato del archivo que se carga en Facturación** y sirve como dato de prueba de la importación (ver abajo). La copia local tiene fecha del 08/10/2026 |
| `PAGINA WEB/CATALOGO/` (28 imágenes) | Productos públicos de prueba para el sitio |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (3 PDF) | Ejemplos de ficha técnica, hoja de seguridad y certificado de análisis |
| `PAGINA WEB/DOCUMENTOS TECNICOS/CONTROL DE DOCUMENTOS TECNICOS POR INGRESO 2026.xlsx` | Registro de notas de ingreso con sus documentos (hojas INCOVSA e Inquiserca). Solo sirvió en una reunión para mostrar cómo se manejan los documentos técnicos. **No se carga nada** de él en la documentación interna y se quitará de la carpeta (12/10, resuelve P-33) |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (2 videos de WhatsApp, 21/09) | **No tienen ningún uso** en el proyecto; se ignoran y se quitarán de la carpeta (12/10, resuelve P-34) |
| `PAGINA WEB/INFORMACION EMPRESA/` | Misión, visión y dos logotipos |

> Los archivos que empiezan con `~$` son archivos temporales que crea Excel mientras un archivo está abierto. No son datos.

## Productos

**Fuente:** hoja "Base Datos Productos" de `Picking II.xlsm`.

| Columna del Excel | Uso en el sistema |
|---|---|
| PRODUCTOS | Código del producto. Se convierte al **nombre** del catálogo con el formato de Odoo (ver "Conversión al formato de Odoo") |
| Unidad Medida | **No se usa** (11/10) |
| `Peso2` | **Peso de Conversión en kg**, tomado tal cual (RN-02) |
| KG | No se usa. Todo el sistema trabaja en kg |

### Cifras

- 857 filas y **856 códigos distintos.** `ACIDO ACETICO-GUA-GAR/0030KG-GLACI-8566` está duplicado y se carga una sola vez (confirmado el 23/09).
- 491 sufijos distintos. Los sufijos se repiten entre productos distintos (RN-15).
- Presentación declarada en el código:
  - 792 filas en KG, 20 en GL, 13 en LB, 1 en LT y 1 en "K";
  - **27 productos por unidad** (repuestos, maquinaria e insumos): 26 con `UND` y 1 con `0125UN`. En 25 el Peso de Conversión es 1; en `CUCHILLAS PARA REBAJAR MED. 1800X190.5X330MM-ITA-UND-0937` y en `ESMERIL 250X20X32-ITA-UND-3423` es 11;
  - 3 códigos que no siguen el formato: `METABISULFITO DE SODIO II` (Peso de Conversión 25), `SAL (INVENTARIO II)` (Peso de Conversión 100) y `ACIDO ACETICO-CHI-GAR/0030-GLACI-1234` (Peso de Conversión 30).
- **En todos los casos el Peso de Conversión se toma tal cual como kg** (decisión del 24/09).
- 670 valores de Peso de Conversión vienen, en el Excel original, de una fórmula que los saca del texto. El sistema guarda el **valor resultante** como número y no replica la fórmula.
- Hay 13 filas donde el Peso de Conversión no coincide con la presentación del código. Se usan tal cual (decisión del 20/09):
  - ACIDO SULFURICO en pipa: 8 filas `20000KG` con Peso de Conversión 2000, y 1 fila `25000KG` con Peso de Conversión 2500;
  - HILO 22/2 `45.36KG`: 2 filas con Peso de Conversión 100;
  - P/600 `19.65KG`: Peso de Conversión 19.6;
  - EXTRACTO DE MIMOSA `00225KG`: Peso de Conversión 25.
- Los 27 productos por unidad **sí pasan por el picking** (confirmado el 23/09).

## Archivo de pedidos de Odoo

**Uso:** formato del archivo que el facturador sube a Facturación (RF-SL-50, [06-picking-facturacion.md](06-picking-facturacion.md)). Las reglas de lectura que dio la contraparte están en RN-35, RN-36 y RN-37.

### Estructura del archivo de ejemplo

Una sola hoja, `Sheet1`, con 16 columnas. El archivo de Odoo **siempre** se exporta con esta misma estructura (12/10):

| Columna | ¿Se usa? |
|---|---|
| `Referencia` | **Sí.** Número de pedido (tercer segmento) y bodega (primer segmento) |
| `Contacto` | **Sí.** Nombre del cliente |
| `Contacto/Ciudad` | **Sí.** Sector del cliente (11/10) |
| `Contacto/Calle`, `Contacto/Calle2`, `Contacto/Estado`, `Contacto/País` | No se usan |
| `Documento origen` | No se usa (por ejemplo, `S27798`) |
| `Tipo de Compra` | No se usa (`VENTAS`) |
| `Bodega de Ingreso/Salida` | No se usa (`BODEGA XE`) |
| `Estado` | **Sí.** Solo se cargan las referencias "Hecho" (11/10) |
| `Movimientos de stock/Producto` | **Sí.** Nombre del producto, con el origen y la presentación entre paréntesis: `SODA ASH (CHI-SAC/0040KG)` |
| `Movimientos de stock/Producto/Peso` | **No.** La contraparte indicó no usarla (RN-37) |
| `Movimientos de stock/Números de serie` | No se mencionó. Trae el **lote** del producto (por ejemplo, `5287`), que en `Picking II` es el sufijo del código. El catálogo no usa el lote |
| `Movimientos de stock/Cantidad hecha` | **Sí.** Cantidad en kg |
| `Ubicación de origen/Nombre mostrado` | No se usa (`XE-IN/Existencias`) |

### Cifras del archivo de ejemplo

Análisis del equipo del 09/10/2026, sin datos personales:

| Concepto | Cantidad |
|---|---|
| Filas de agrupación de Odoo (texto en Referencia sin Contacto ni Producto, por ejemplo "agosto 2026 (80)") | 1. No es un pedido y se ignora (12/10) |
| Referencias | 80, todas con prefijo `XE-IN` (Quetzaltenango), del número 03539 al 03627, sin repetidos |
| Líneas de producto | 208 |
| Contactos distintos | 52. Un mismo contacto aparece en hasta 4 referencias, y cada referencia es un pedido distinto |
| Referencias en estado "Cancelado" | 1. No se carga (RN-35) |
| Líneas con peso 0 en la columna que no se usa | 82, lo que confirma por qué no se usa |
| Líneas sin número de serie (lote) | 3 |
| Líneas con cantidad decimal | 4 |

### Conversión del catálogo al formato de Odoo (11/10)

Decisión del 11/10 (P-80): el catálogo de `Picking II` se convierte a los nombres de producto de Odoo, **sin el lote**.

**Regla:** el código `NOMBRE-ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD]-LOTE` se convierte en `NOMBRE (ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD])`: se quita el último segmento (el lote) y lo que va desde el origen se pone entre paréntesis.

| Código de `Picking II` | Nombre en el catálogo |
|---|---|
| `SODA ASH-TUR-SAC/0025KG-5275` | `SODA ASH (TUR-SAC/0025KG)` |
| `ACIDO ACETICO-GUA-GAR/0030KG-GLACI-8566` | `ACIDO ACETICO (GUA-GAR/0030KG-GLACI)` |

- Los códigos de distintos lotes del mismo producto quedan en **un solo producto**.
- El Peso de Conversión es el mismo en todos los lotes, salvo en `METANOL (GUA-TON/0055GL)`, que tenía lotes con 164 y 55: se usa **164 kg** (decisión del 11/10).
- **Resultado del análisis del equipo (11/10):** los 856 códigos dan **339 nombres** con la regla automática. Otros **9 códigos** no siguen el formato:
  - **6 se corrigen** agregando el guion que falta (decisión del 11/10). Los seis nombres corregidos ya existían en el catálogo con otros lotes y con el mismo Peso de Conversión, así que se unen a ellos:

    | Código de `Picking II` | Error | Nombre en el catálogo | Peso de Conversión |
    |---|---|---|---|
    | `SULFATO DE ALUMINIO TUR-SAC/0025KG-5449` | Falta el guion entre nombre y origen | `SULFATO DE ALUMINIO (TUR-SAC/0025KG)` | 25 |
    | `SULFATO DE ALUMINIO TUR-SAC/0025KG-9232` | Igual | `SULFATO DE ALUMINIO (TUR-SAC/0025KG)` | 25 |
    | `SULFURO DE SODIO TUR-SAC/0025KG-9131` | Igual | `SULFURO DE SODIO (TUR-SAC/0025KG)` | 25 |
    | `SULFATO DE SODIO CHI-SAC/0050KG-4765` | Igual | `SULFATO DE SODIO (CHI-SAC/0050KG)` | 50 |
    | `SULFATO DE SODIO CHI-SAC/0050KG-0823` | Igual | `SULFATO DE SODIO (CHI-SAC/0050KG)` | 50 |
    | `SODA CAUSTICA-CHISAC/0025KG-1240` | Falta el guion entre origen y envase | `SODA CAUSTICA (CHI-SAC/0025KG)` | 25 |

  - **3 no se cargan** (decisión del 11/10): `METABISULFITO DE SODIO II`, `SAL (INVENTARIO II)` y `TRICLORO GRANULAR-TON/0050KG-9127`, porque no tienen origen o presentación y no se puede saber su nombre en Odoo. Si un archivo de Odoo trae alguno, se agrega desde Facturación con su Peso de Conversión (RN-43).
- **Catálogo inicial: 339 productos.**
- La comparación con el nombre del archivo de Odoo no distingue mayúsculas, espacios ni puntos. Se hace con una **clave normalizada** de cada producto (mayúsculas, sin acentos, sin puntos y sin espacios), que es única (12/10).
- Con esa clave, **2 pares** de productos del catálogo convertido quedan iguales, porque solo se diferencian por una mayúscula o un espacio: `INCO BLACK VSF 600% (IND-CAJ/0025KG)` y `INCOBLACK VSF 600% (IND-CAJ/0025KG)`, y `SODA ASH (SOL-SAC/0025KG)` y `SODa ASH (SOL-SAC/0025KG)`. Los dos de cada par tienen Peso de Conversión 25. Además, `SODA ASH-SOL-SAC/SAC/0025KG-2479` da el nombre `SODA ASH (SOL-SAC/SAC/0025KG)`, con el envase repetido. Qué se hace con ellos está pendiente (P-88).

### Correspondencia del archivo de ejemplo con el catálogo convertido

| Resultado | Líneas de referencias "Hecho" |
|---|---|
| El producto existe en el catálogo convertido | 194 de 205 |
| El producto no existe: el sistema preguntará si se agrega (RN-43) | 11, en 7 productos (por ejemplo, `SULFATO DE CROMO SB (TUR-SAC/0025KG)` y `METANOL (USA-TON/0055GL)`) |

- Clientes: 29 de los 52 contactos coinciden exactamente con un nombre de la hoja "Base Datos Clientes"; **23 no están**. Para ellos aplica RN-44: el sistema pregunta si se guardan.

## Existencias iniciales

**Eliminado** el 29/09/2026: el sistema ya no lleva existencias ([09-picking-inventario.md](09-picking-inventario.md)). Las reglas de carga desde `INVENTARIO INCOVSA.xlsx` (filas `XE`, armado del código, cruce del 24/09) dejan de aplicar.

### Excel maestro limpio

El equipo arma un Excel nuevo con los datos ya depurados. Es la **única fuente** de la carga inicial (P-35). Columnas mínimas:

| Columna | Contenido |
|---|---|
| Nombre | Nombre del producto en formato de Odoo, sin lote y sin duplicados |
| Peso de Conversión (kg) | Valor tal cual de la columna `Peso2` del Excel de la empresa |

Se quitaron la columna "Existencia inicial Xela (kg)" (29/09) y las columnas "Unidad Medida" y "SKU" (11/10).

## Clientes y sectores

**Fuente:** hoja "Base Datos Clientes" de `Picking II.xlsm`.

| Columna | Uso |
|---|---|
| No | No se usa |
| Nombre cliente | Base de clientes. Si el `Contacto` del archivo de Odoo existe aquí, se usan el nombre y el sector de la base |
| Sector | Base de clientes. Si el cliente no está en la base y no se guarda, se usa la columna `Contacto/Ciudad` del archivo |
| Ejecutivo Ventas | No se usa |
| Direccion | Son coordenadas geográficas. No se usa |

- 318 clientes, 312 nombres distintos. **6 nombres se repiten** (decisión del 11/10, resuelve P-25):
  - **4 son duplicados exactos** (mismo cliente y mismo sector; en uno de ellos el sector está escrito de dos formas, "sector 1 salcaja" y "Sector 1, Salcaja"). **Se carga un solo registro** de cada uno, con el sector del primer registro del archivo.
  - **2 tienen sectores distintos** en sus dos registros. Se cargan los dos registros. Cuando el `Contacto` de un archivo de Odoo coincide con uno de estos nombres, el pedido facturado toma el sector de la columna `Contacto/Ciudad` del archivo.
  - Resultado: **314 clientes** en la carga inicial.
  - Los nombres no se escriben en esta carpeta porque son datos personales; están en `Picking II.xlsm`.
- 43 sectores distintos, que se cargan tal como vienen en el archivo.
- Los clientes son **comunes a las tres sedes** (confirmado el 24/09).

## Camiones y pilotos

- Quetzaltenango: 3 camiones, dos de 3,400 kg y uno de 6,000 kg. Falta su identificación (P-01).
- Faltan los nombres de los pilotos (P-02).

## Datos personales

Los nombres de clientes, pilotos y personal, las coordenadas y los documentos de identidad **no se suben al repositorio** ni se escriben en esta carpeta. Las semillas de base de datos que se suban al repositorio usan solo datos ficticios o ya públicos en esta carpeta ("Cliente de ejemplo 001…", "Usuario de ejemplo NN", los 15 productos de los casos de conversión); los datos reales se cargan con un script que lee el Excel maestro desde fuera del repositorio (12/10, resuelve P-37; detalle en [16](16-arquitectura-y-tecnologia.md)).
