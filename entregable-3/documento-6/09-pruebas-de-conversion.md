# Pruebas de conversión

La conversión de kilogramos a unidades es la regla central del picking. Los lineamientos exigen probar diferentes productos y presentaciones, cantidades completas, cantidades que requieren un tratamiento especial, datos incorrectos y modificaciones en las equivalencias. También exigen comparar los resultados con los cálculos validados por INCOVSA.

## Regla aprobada

La regla es RN-01, con RN-05 y RN-21, de `specs/12`:

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − (unidades × Peso de Conversión)
```

- El **Peso de Conversión** es el peso en kg de una unidad (saco, garrafa o tonel). Desde el 13/10/2026 llega en cada línea del archivo de Odoo, en la columna `Movimientos de stock/Producto/Peso` (RN-37), y es la **equivalencia** del producto.
- Si sobran kilogramos (ventas fraccionadas), se muestran como «N unidades + R kg». Si no sobran, solo «N unidades».
- Los cálculos no usan números de punto flotante: las cantidades se guardan como decimales exactos con 3 decimales y la conversión se calcula en gramos enteros, para que no haya errores de redondeo.
- En Bodega, la conversión se hace sobre la cantidad agrupada por producto, lote y Peso de Conversión (RN-51).

## Casos validados por INCOVSA

INCOVSA validó 15 casos el 23/09/2026. Cada uno es una prueba automatizada que compara el resultado del sistema con el valor validado.

Tabla: Comparación con los cálculos validados por INCOVSA {#tab:conversion-incovsa}

| Caso | Producto y presentación | Cantidad (kg) | Peso de Conversión (kg) | Esperado (INCOVSA) | Obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | Sulfato de sodio, saco de 25 kg | 25 | 25 | 1 | 1 | Aprobado |
| CP-02 | Sulfato de sodio, saco de 25 kg, otro lote | 25 | 25 | 1 | 1 | Aprobado |
| CP-03 | Hidrosulfito de sodio, tonel de 50 kg | 50 | 50 | 1 | 1 | Aprobado |
| CP-04 | Metanol, tonel de 55 | 55 | 55 | 1 | 1 | Aprobado |
| CP-05 | Negro sulfuroso high quality, saco de 25 kg | 50 | 25 | 2 | 2 | Aprobado |
| CP-06 | Negro sulfuroso, saco de 25 kg | 50 | 25 | 2 | 2 | Aprobado |
| CP-07 | Sulfuro de sodio (Turquía), saco de 25 kg | 50 | 25 | 2 | 2 | Aprobado |
| CP-08 | Sulfato de aluminio, saco de 25 kg | 50 | 25 | 2 | 2 | Aprobado |
| CP-09 | Soda ash, saco de 25 kg | 50 | 25 | 2 | 2 | Aprobado |
| CP-10 | Soda cáustica (México), saco de 25 kg | 75 | 25 | 3 | 3 | Aprobado |
| CP-11 | Inco-Fitex, garrafa de 30 kg | 90 | 30 | 3 | 3 | Aprobado |
| CP-12 | Soda cáustica (China), saco de 25 kg | 500 | 25 | 20 | 20 | Aprobado |
| CP-13 | Sulfuro de sodio (México), saco de 25 kg | 500 | 25 | 20 | 20 | Aprobado |
| CP-14 | Soda cáustica (China), saco de 25 kg | 800 | 25 | 32 | 32 | Aprobado |
| CP-15 | Soda cáustica (China), saco de 25 kg | 1,000 | 25 | 40 | 40 | Aprobado |

Los 15 casos cubren 10 productos distintos, algunos de dos orígenes, y cuatro presentaciones: saco de 25 kg, garrafa de 30 kg, tonel de 50 kg y tonel de 55. Las cantidades van de 1 a 40 unidades. **Los 15 coinciden con el cálculo validado por INCOVSA** (EV-01).

## Cantidades que requieren tratamiento especial

Tabla: Ventas fraccionadas, agrupación y redondeo {#tab:conversion-fraccionados}

| Caso | Escenario | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| CP-16 | 60 kg con Peso de Conversión 25 (venta fraccionada) | 2 unidades + 10 kg | 2 unidades + 10 kg | Aprobado |
| CP-17 | 10 kg con Peso de Conversión 25 (menos de una unidad) | 0 unidades + 10 kg | 0 unidades + 10 kg | Aprobado |
| CP-18 | 37.5 kg con Peso de Conversión 25 (decimales) | 1 unidad + 12.5 kg, sin errores de redondeo | 1 unidad + 12.5 kg | Aprobado |
| CP-19 | El mismo producto y lote para dos clientes (25 + 15 kg) y otro lote (10 kg) | Una fila por lote: 40 kg («1 unidad + 15 kg») y 10 kg («0 unidades + 10 kg») | Igual al esperado | Aprobado |
| CP-101 | Miles de cantidades y Pesos de Conversión aleatorios con 3 decimales (pruebas de propiedades) | Siempre unidades × peso + resto = cantidad, con 0 ≤ resto < peso | Se cumple en todos | Aprobado |
| CP-104 | El mismo producto en lotes distintos, en el reporte de Despacho | Suma de kg y conversión exacta por producto y peso | Igual al esperado | Aprobado |

## Datos incorrectos

Tabla: Conversión con datos incorrectos {#tab:conversion-incorrectos}

| Caso | Escenario | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| CP-21 | Línea del archivo con el Peso de Conversión en 0, vacío o con texto (RN-50) | Ese pedido facturado no se carga y el resumen indica el motivo | Igual al esperado | Aprobado |
| CP-23 | El archivo de ejemplo de INCOVSA, que trae 82 líneas con peso 0 | 33 pedidos cargados y 46 no cargados, con la lista | Igual al esperado | Aprobado |
| CP-27 | Cantidad vacía, con texto o en 0 | El pedido facturado no se carga | Igual al esperado | Aprobado |
| CP-102 | Peso 0 o negativo, cantidad negativa, más de 3 decimales, texto o comas mal puestas | Se rechaza sin convertir | Igual al esperado | Aprobado |

## Modificaciones en las equivalencias

En este sistema la equivalencia es el Peso de Conversión de cada línea del archivo de Odoo. Si INCOVSA cambia el peso de un producto en Odoo, el archivo siguiente trae el peso nuevo.

Tabla: Cambios en el Peso de Conversión {#tab:conversion-equivalencias}

| Caso | Escenario | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| CP-26 | El nombre del producto dice 40 kg (`CHI-SAC/0040KG`), pero el archivo trae peso 25 | La conversión usa 25, el valor del archivo | Usa 25 | Aprobado |
| CP-103 | El mismo producto y lote con pesos 25 y 40 en un mismo envío | Filas separadas, cada una con su peso y su conversión | Igual al esperado | Aprobado |
| CP-20 | Una ruta ya enviada con peso 25, y después se carga otro archivo con el mismo producto y peso 50 (RN-33) | La ruta conserva el peso 25 y su conversión | Comprobado de forma indirecta: cada línea enviada guarda su propio peso | Aprobado en parte |

## Calidad de las pruebas de conversión

El módulo de conversión está incluido en las **pruebas de mutación** con Stryker. Stryker cambia el código a propósito (por ejemplo, cambia una división por una multiplicación o un `<` por un `<=`) y comprueba que alguna prueba falle. El puntaje global de los cuatro módulos críticos (conversión, permisos, envíos y Bodega) fue de **67.90 %** el 01/11/2026, por encima del umbral de 60 % que hace fallar la CI (EV-06).

## Resultado

**Aprobado.** Los 15 casos validados por INCOVSA dan exactamente el resultado esperado. Las ventas fraccionadas, los decimales y los datos incorrectos se tratan según las reglas aprobadas. La prueba directa de CP-20 se agrega en la convergencia final (JG-17).
