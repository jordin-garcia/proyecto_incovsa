# Registro de entradas de inventario

## Estado del módulo: Exclusión aprobada (No aplica)

### Objetivo
Explicar las razones técnicas y organizacionales por las cuales el registro de compras, recepciones de proveedores, ajustes positivos y traslados de entrada no forma parte del sistema logístico de picking.

### Justificación de la exclusión

Al igual que la consulta de existencias, el registro de entradas de inventario fue retirado del alcance del sistema por mutuo acuerdo con INCOVSA y el docente del curso:

1. **El inventario lo lleva Odoo:** las entradas de mercancía y los traslados entre bodegas se registran en el ERP **Odoo** de la empresa, según su procedimiento interno.
2. **Exclusión formal (RF-SL-41, RF-SL-43):** los requerimientos correspondientes a compras y traslados fueron declarados formalmente excluidos el 29 de septiembre de 2026 y ratificados en el historial de decisiones (`specs/09` y `specs/18`).
3. **Evitar doble digitación:** si los bodegueros tuviesen que registrar las entradas tanto en Odoo como en el sistema de picking, se duplicaría el tiempo administrativo y aumentarían los riesgos de error humano.

### Procedimiento operativo

El registro de entradas de mercancía (recepciones de compras, ingresos y traslados de entrada) se realiza y controla directamente en el ERP **Odoo**. El sistema logístico de picking no gestiona entradas físicas ni kardex de compras, por lo que no interviene en este proceso.

### Resultado esperado
Las entradas de mercancía se registran en Odoo, que lleva el inventario de la empresa.

> **Nota:** Este apartado se incluye en el presente manual para dar cumplimiento riguroso a la estructura de 22 secciones exigida por los lineamientos del curso, dejando constancia de su justificación aprobada.

