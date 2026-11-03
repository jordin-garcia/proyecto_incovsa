# Registro de salidas de inventario

## Estado del módulo: Exclusión aprobada (No aplica)

### Objetivo
Aclarar el tratamiento contable y administrativo de las salidas de mercancía, bajas por merma y ajustes negativos, delimitando la responsabilidad entre el ERP Odoo y el sistema de control logístico.

### Justificación de la exclusión

Los lineamientos académicos solicitaban un apartado para el registro manual de salidas de inventario. En el modelo operativo de INCOVSA, este proceso no se realiza de forma manual en el sistema de picking por los siguientes motivos:

1. **La salida se genera al facturar en Odoo:** cuando un cliente realiza una compra, el área comercial emite la factura en Odoo. En ese instante, el ERP descarga automáticamente las existencias de la bodega contable y genera el documento de entrega en estado **Hecho**.
2. **Entrada al sistema logístico:** el sistema de picking no "crea" la salida; la recibe como una orden en firme ya descontada de los libros de Odoo para proceder exclusivamente a su **preparación física y despacho**.
3. **No se registran devoluciones ni mermas en el picking (RF-SL-44, RF-SL-45):** cualquier devolución de producto, rechazo por inconformidad o merma por rotura se reporta al departamento de Calidad y Contabilidad para su ingreso y nota de crédito en Odoo (`specs/08` y `specs/09`).

### Procedimiento operativo

Las salidas contables y ajustes de inventario se gestionan directamente en el ERP **Odoo**. El sistema logístico de picking no emite bajas de existencias ni registra devoluciones (RF-SL-44, RF-SL-45), concentrándose exclusivamente en el alistamiento físico, el control de carga en camiones y la confirmación de la entrega de los pedidos facturados.

### Resultado esperado
Se asegura la total transparencia del kardex valorizado en Odoo, reservando el sistema de picking para el alistamiento ágil de las entregas a clientes.

> **Nota:** La delimitación de este proceso cuenta con la aprobación del docente del curso (P-58) y asegura el estricto cumplimiento de los estándares de auditoría financiera de INCOVSA.

