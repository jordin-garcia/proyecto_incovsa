# Presentaciones y equivalencias de peso

## El Peso de Conversión como factor de equivalencia

### Objetivo
Explicar cómo el sistema logístico maneja las diversas presentaciones de empaque (sacos, tambores, garrafas o cubetas) y sus equivalencias de peso mediante el atributo técnico denominado **Peso de Conversión**.

### Requisitos previos
- Conocimiento de los empaques comerciales habituales de los productos distribuidos por INCOVSA.

### Concepto de presentación y equivalencia

En la comercialización de productos químicos y materias primas, los clientes suelen ordenar en kilogramos, pero la bodega despacha bultos cerrados o unidades físicas completas. El sistema modela esta relación de forma directa y transparente:

1. **Presentación comercial:** el tipo de envase se encuentra incorporado en el nombre comercial proveniente de Odoo (por ejemplo, `SAC` para sacos, `TAM` para tambores, `GAR` para garrafas).
2. **Factor de equivalencia (Peso de Conversión):** cada línea de producto contiene un valor numérico en la columna `Movimientos de stock/Producto/Peso`. Este número representa exactamente cuántos kilogramos pesa una unidad física completa y cerrada de dicho producto.
3. **Uso en el sistema:** este valor es utilizado por el motor logístico para calcular automáticamente cuántas unidades completas debe extraer el bodeguero del anaquel y cuántos kilogramos corresponden a producto fraccionado o sobrante.

Tabla: Ejemplos de presentaciones y equivalencias de peso {#tab:equivalencias}

| Producto comercial | Presentación física | Peso de Conversión (kg) |
|---|---|---|
| Bicarbonato de Sodio USP | Saco de papel multicapa | 25.00 |
| Soda Cáustica en Escamas | Saco de polipropileno | 25.00 |
| Ácido Sulfónico Lineal | Tambor plástico | 215.00 |
| Metanol Puro | Tambor metálico | 160.00 |
| Glicerina Grado USP | Tambor | 250.00 |
| Hipoclorito de Sodio | Garrafa | 25.00 |

### Validación estricta del Peso de Conversión

Para garantizar que el personal de bodega siempre reciba instrucciones claras de conteo físico:

- **Regla RN-50:** durante la carga del archivo de Odoo, el sistema valida que el Peso de Conversión sea un número estrictamente mayor que cero.
- Si un pedido facturado incluye alguna línea con peso vacío, igual a 0 o con caracteres no numéricos, **dicho pedido se rechaza íntegramente** y se notifica al usuario con un resumen de advertencia.
- **Caso de discrepancia (P-90):** si el texto del producto indica un peso (por ejemplo, `0040KG`) pero la columna de peso indica `25`, el sistema toma con prioridad el dato numérico de la columna (`25 kg`), asegurando consistencia matemática en las fórmulas de bodega.

![Visualización de opciones de envío con control de peso y unidades](figuras/figura-07-opciones-envio-camion.png){#fig:equivalencias-peso}

### Resultado esperado
El sistema calcula con absoluta precisión el número de bultos completos a retirar sin requerir tablas de conversión estáticas ni cálculos manuales por parte del personal de bodega.

> **Advertencia:** Si un producto fue registrado en Odoo sin su peso unitario correspondiente, el archivo no podrá procesarse. Es indispensable que el área de facturación e inventarios de Odoo asigne el peso correcto a cada ficha de artículo.

