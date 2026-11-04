# Registro de salidas de inventario

## Estado del módulo: Exclusión aprobada (No aplica)

### Objetivo
Aclarar el tratamiento contable y administrativo de las salidas de mercancía, bajas por merma y ajustes negativos, delimitando la responsabilidad entre el ERP Odoo y el sistema de control logístico.

### Justificación de la exclusión

Los lineamientos académicos solicitaban un apartado para el registro manual de salidas de inventario. En el modelo operativo de INCOVSA, este proceso no se realiza de forma manual en el sistema de picking por los siguientes motivos:

1. **La salida se registra en Odoo:** la factura y el control de existencias se llevan en el ERP **Odoo**. El sistema de picking solo lee las referencias en estado **Hecho** del archivo que se exporta de Odoo.
2. **Entrada al sistema logístico:** el sistema de picking no "crea" la salida; la recibe en el archivo exportado de Odoo para encargarse solo de su **preparación física y despacho**.
3. **No se registran devoluciones ni mermas en el picking (RF-SL-44, RF-SL-45):** el sistema no registra devoluciones, rechazos ni mermas; se tramitan en Odoo según el procedimiento de la empresa (`specs/08` y `specs/09`).

### Procedimiento operativo

Las salidas contables y ajustes de inventario se gestionan directamente en el ERP **Odoo**. El sistema logístico de picking no emite bajas de existencias ni registra devoluciones (RF-SL-44, RF-SL-45), concentrándose exclusivamente en el alistamiento físico, el control de carga en camiones y la confirmación de la entrega de los pedidos facturados.

### Resultado esperado
El inventario se lleva en Odoo, y el sistema de picking se reserva para preparar y entregar los pedidos a los clientes.

> **Nota:** La delimitación de este proceso cuenta con la aprobación del docente del curso (P-58).

