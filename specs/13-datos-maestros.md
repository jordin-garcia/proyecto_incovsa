# 13. Datos maestros

Todos los datos de prueba vienen de archivos entregados por INCOVSA. Esos archivos están en `docs_incovsa/`, **fuera del repositorio**. Aquí solo se describen su estructura, las reglas de carga y las cifras.

## Archivos de la empresa

| Archivo | Uso en el proyecto |
|---|---|
| `PROYECTO PICKING/Picking II.xlsm` | **Fuente de productos, Peso2, clientes y sectores** |
| `PROYECTO PICKING/INVENTARIO INCOVSA.xlsx` | Export de existencias de Odoo (recibido el 22/09). **Fuente de las existencias iniciales de Quetzaltenango** |
| `PROYECTO PICKING/Data Odo Para Picking.xlsx` | Export de 80 salidas de Odoo (agosto 2026). **Solo referencia** de cómo la empresa registra hoy sus movimientos. No se carga ni se usa en pruebas |
| `PAGINA WEB/CATALOGO/` (28 imágenes) | Productos públicos de prueba para el sitio |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (3 PDF) | Ejemplos de ficha técnica, hoja de seguridad y certificado de análisis |
| `PAGINA WEB/DOCUMENTOS TECNICOS/CONTROL DE DOCUMENTOS TECNICOS POR INGRESO 2026.xlsx` | Registro de notas de ingreso con sus documentos (hojas INCOVSA e Inquiserca). **Para qué sirve está pendiente** (P-33) |
| `PAGINA WEB/DOCUMENTOS TECNICOS/` (2 videos de WhatsApp, 21/09) | **Para qué sirven está pendiente** (P-34) |
| `PAGINA WEB/INFORMACION EMPRESA/` | Misión, visión y dos logotipos |

> Los archivos que empiezan con `~$` son archivos temporales que crea Excel mientras un archivo está abierto. No son datos.

## Productos

**Fuente:** hoja "Base Datos Productos" de `Picking II.xlsm`.

| Columna del Excel | Uso en el sistema |
|---|---|
| PRODUCTOS | Código completo, que es la clave única |
| Unidad Medida | Texto informativo de la presentación |
| Peso2 | **Peso2 en kg**, tomado tal cual (RN-02) |
| KG | No se usa. Todo el sistema trabaja en kg |

### Cifras

- 857 filas y **856 códigos distintos.** `ACIDO ACETICO-GUA-GAR/0030KG-GLACI-8566` está duplicado y se carga una sola vez (confirmado el 23/09).
- 491 sufijos distintos. Los sufijos se repiten entre productos distintos (RN-15).
- Presentación declarada en el código:
  - 792 filas en KG, 20 en GL, 13 en LB, 1 en LT y 1 en "K";
  - **27 productos por unidad** (repuestos, maquinaria e insumos): 26 con `UND` y 1 con `0125UN`. En 25 el Peso2 es 1; en `CUCHILLAS PARA REBAJAR MED. 1800X190.5X330MM-ITA-UND-0937` y en `ESMERIL 250X20X32-ITA-UND-3423` es 11;
  - 3 códigos que no siguen el formato: `METABISULFITO DE SODIO II` (Peso2 25), `SAL (INVENTARIO II)` (Peso2 100, columna Unidad Medida `100LB`) y `ACIDO ACETICO-CHI-GAR/0030-GLACI-1234` (Peso2 30).
- **En todos los casos el Peso2 se toma tal cual como kg** (decisión del 24/09).
- 670 valores de Peso2 vienen, en el Excel original, de una fórmula que los saca del texto. El sistema guarda el **valor resultante** como número y no replica la fórmula.
- Hay 13 filas donde el Peso2 no coincide con la presentación del código. Se usan tal cual (decisión del 20/09):
  - ACIDO SULFURICO en pipa: 8 filas `20000KG` con Peso2 2000, y 1 fila `25000KG` con Peso2 2500;
  - HILO 22/2 `45.36KG`: 2 filas con Peso2 100;
  - P/600 `19.65KG`: Peso2 19.6;
  - EXTRACTO DE MIMOSA `00225KG`: Peso2 25.
- Los 27 productos por unidad **sí pasan por el picking** (confirmado el 23/09).

## Existencias iniciales

**Fuente:** `INVENTARIO INCOVSA.xlsx`. Columnas: Producto, Lote/Nº de serie, Cantidad y Ubicación.

### Reglas de carga

1. Se toman solo las filas cuya **Ubicación empieza con `XE`** (Quetzaltenango), sin importar la ubicación interna: Existencias, Inventario 2, Muestras, Maquinaria y Repuestos, Residuos. Son 484 filas.
2. Con cada fila se arma el código: `<texto de Producto antes del paréntesis>-<texto dentro del paréntesis>-<Lote>`. Por ejemplo, `SODA ASH (TUR-SAC/0025KG)` con lote `5275` da `SODA ASH-TUR-SAC/0025KG-5275`.
3. Ese código se compara con el código de `Picking II`, ignorando mayúsculas, espacios y puntos.
4. Las cantidades del mismo código se **suman** entre todas las ubicaciones XE.
5. La cantidad se toma **tal cual como kg**, también en los 7 productos cuya presentación no es kg (decisión del 24/09).
6. Los productos de `Picking II` sin coincidencia arrancan con **existencia 0**.
7. Las filas del inventario sin coincidencia en `Picking II` **se ignoran**.
8. Guatemala y Escuintla arrancan con **existencia 0** en todos los productos.

### Resultado del cruce (24/09)

| Concepto | Cantidad |
|---|---|
| Productos con existencia inicial en Xela | 136 |
| Productos con existencia 0 | 720 |
| Códigos del inventario XE ignorados | 345 |
| Productos con coincidencia cuya presentación no es kg | 7 (alcohol isopropílico ×2, metanol, thinner, alguicida, medidor de humedad, rodillos) |

### Excel maestro limpio

El equipo arma un Excel nuevo con los datos ya depurados. Es la **única fuente** de la carga inicial (P-35). Columnas mínimas:

| Columna | Contenido |
|---|---|
| Código | Código completo, sin duplicados |
| SKU | Sufijo, informativo |
| Unidad Medida | Texto informativo |
| Peso2 (kg) | Valor tal cual del Excel de la empresa |
| Existencia inicial Xela (kg) | Según las reglas anteriores |

## Clientes y sectores

**Fuente:** hoja "Base Datos Clientes" de `Picking II.xlsm`.

| Columna | Uso |
|---|---|
| No | No se usa |
| Nombre cliente | Se muestra y se busca en Facturación y Ruta |
| Sector | Se muestra en Ruta |
| Ejecutivo Ventas | No se usa |
| Direccion | Son coordenadas geográficas. No se usa |

- 318 clientes, 312 nombres distintos (6 nombres se repiten, P-25).
- 43 sectores distintos, que se cargan tal como vienen en el archivo.
- Los clientes son **comunes a las tres sedes** (confirmado el 24/09).

## Camiones y pilotos

- Quetzaltenango: 3 camiones, dos de 3,400 kg y uno de 6,000 kg. Falta su identificación (P-01).
- Faltan los nombres de los pilotos (P-02).

## Datos personales

Los nombres de clientes, pilotos y personal, las coordenadas y los documentos de identidad **no se suben al repositorio** ni se escriben en esta carpeta. Las semillas de base de datos que se suban al repositorio usan datos anonimizados; cómo se anonimizan es una [DECISIÓN TÉCNICA] (P-37).
