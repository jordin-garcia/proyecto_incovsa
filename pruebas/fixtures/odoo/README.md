# Archivos de Odoo para las pruebas

Datos de prueba del archivo de pedidos de Odoo (RF-SL-50, [specs/13](../../../specs/13-datos-maestros.md) y [specs/06](../../../specs/06-picking-facturacion.md)), generados en JG-04 (specs/16, decisión 77). **El archivo real de INCOVSA nunca se sube** (RNF-10): estos archivos no tienen datos personales y las pruebas no dependen del real.

## Origen de cada archivo

| Archivo | Origen | Qué tiene |
|---|---|---|
| `odoo-ejemplo-anonimizado.xlsx` | `node scripts/anonimizar-odoo.mjs "docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx" pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx` (solo en el equipo del coordinador) | Copia del archivo de ejemplo con la misma estructura y las mismas cifras. Cada `Contacto` distinto es `Cliente de ejemplo NNN` (numerados en orden de aparición); `Contacto/Calle`, `Contacto/Calle2` y `Contacto/Estado` están vacíos; `Documento origen` es `S9NNNN` consecutivo. Todo lo demás es igual al real, incluidas la fila de agrupación, el sector (`Contacto/Ciudad`) y los Pesos de Conversión en 0. No copia las propiedades del libro real (autor ni fechas) |
| `otra-bodega-gt.xlsx` | `node scripts/generar-fixtures-odoo.mjs` | El anonimizado con **todas** las Referencias con prefijo `GT-` |
| `bodegas-mezcladas.xlsx` | ídem | El anonimizado con las Referencias 1 a 40 con `XE-` y de la 41 a la 80 con `GT-` |
| `prefijo-desconocido.xlsx` | ídem | El anonimizado con la última Referencia del archivo (`XE-IN/SALIDA/03626`) con prefijo `ZZ-` |
| `sin-columna-peso.xlsx` | ídem | El anonimizado sin la columna `Movimientos de stock/Producto/Peso` |
| `cantidad-invalida.xlsx` | ídem | El anonimizado con la primera línea de tres referencias "Hecho" que sí se cargarían (todos sus pesos y cantidades mayores que 0) con cantidad vacía, `diez` y `0`, en ese orden. Con RN-50 se cargarían 30 pedidos facturados en vez de 33 |
| `no-es-xlsx.xlsx` | ídem | Un texto con extensión `.xlsx` |

Cada archivo inválido tiene **solo** el defecto que dice su nombre (lo comprueba `scripts/generar-fixtures-odoo.test.mjs`, celda por celda). El archivo de más de 2 MB no se sube: JC-02 lo genera en memoria en su prueba.

Los dos scripts son deterministas: el mismo archivo de entrada produce siempre los mismos bytes.

## Cifras esperadas de `odoo-ejemplo-anonimizado.xlsx`

Las mismas de [specs/13](../../../specs/13-datos-maestros.md) §"Cifras del archivo de ejemplo". Las comprueba `scripts/anonimizar-odoo.test.mjs`.

| Concepto | Cantidad |
|---|---|
| Hojas | 1, `Sheet1`, con las 16 columnas de Odoo |
| Filas de agrupación de Odoo (`agosto 2026 (80)`) | 1, la primera fila de datos. No es un pedido y se ignora |
| Referencias | 80, todas con prefijo `XE-IN` (Quetzaltenango), del 03539 al 03627, sin repetidos |
| Referencias en estado "Cancelado" | 1 (con 3 líneas). No se carga (RN-35) |
| Referencias en estado "Hecho" | 79, con 205 líneas de producto |
| Contactos distintos | 52, de `Cliente de ejemplo 001` a `Cliente de ejemplo 052`. Un mismo contacto aparece en hasta 4 referencias |
| Líneas de referencias "Hecho" con Peso de Conversión en 0 | **82, en 46 de las 79 referencias.** Con RN-50 se cargan **33** pedidos facturados |
| Líneas de referencias "Hecho" sin lote | 0. El lote es texto (por ejemplo, `0169`, con el cero a la izquierda) |
| Pesos de Conversión distintos (sin contar el 0) | 25, 30, 35, 45, 50, 120, 180 y 200 kg |
| Productos con más de un Peso de Conversión | 0 |
| `SODA ASH (CHI-SAC/0040KG)` | Peso 25 en sus 12 líneas (P-90) |
| Líneas con cantidad decimal | 4 |

## Cuando llegue el archivo completo de Odoo (P-91)

El coordinador vuelve a ejecutar los dos scripts con el archivo nuevo, actualiza las cifras de esta tabla, de `specs/13` y de `scripts/anonimizar-odoo.test.mjs`, y avisa a José Daniel en su bitácora.
