# Prueba de inventario

Los lineamientos piden comprobar las entradas, las salidas, las existencias, los movimientos derivados del despacho y la consistencia de las cantidades. **Esta prueba no aplica**, porque el sistema no lleva inventario.

## Justificación

- El 29/09/2026, en la reunión 4, INCOVSA (Ing. William Ambrossio) sacó el control de inventario del alcance del sistema de picking: las existencias, las entradas, las salidas y los lotes los sigue llevando Odoo, que lleva el inventario de todas las bodegas. El sistema de picking recibe los pedidos ya facturados en el archivo que exporta Odoo.
- El 14/10/2026 se le entregó al Ing. Manuel Rojas la nota «Exclusión del control de inventario», y el **16/10/2026 el docente aprobó la exclusión** (pendiente P-58, resuelto; `specs/17`).
- En consecuencia, el sistema no tiene pantallas, tablas ni operaciones de inventario: el picking quedó con cinco módulos (Facturación, Bodega, Ruta, Reportes y Configuración), y la especificación registra el módulo de Inventario como eliminado (`specs/09-picking-inventario.md`).

## Qué se comprobó en su lugar

Aunque no hay inventario, sí se comprobó que las **cantidades sean consistentes** a lo largo del flujo, que es la parte de esta prueba que aplica al sistema:

- la cantidad en kilogramos de cada línea del archivo de Odoo llega sin cambios a Bodega, agrupada por producto, lote y Peso de Conversión (RN-51, casos CP-19 y CP-26);
- la conversión a unidades y el resto en kilogramos suman exactamente la cantidad original, sin errores de redondeo (RN-05, caso CP-18 y sección 9);
- el peso total de cada envío por camión es la suma de sus pedidos facturados, con la alerta de sobrepeso del camión (sección 3);
- el reporte de rutas realizadas muestra las mismas cantidades que se prepararon y despacharon (sección 10).

Si en el futuro INCOVSA decide llevar el inventario en este sistema, la prueba se diseñará con los casos que piden los lineamientos y se agregará en una nueva versión de este documento.
