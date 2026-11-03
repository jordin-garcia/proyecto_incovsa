# Registro de entradas de inventario

## Estado del módulo: Exclusión aprobada (No aplica)

### Objetivo
Explicar las razones técnicas y organizacionales por las cuales el registro de compras, recepciones de proveedores, ajustes positivos y traslados de entrada no forma parte del sistema logístico de picking.

### Justificación de la exclusión

Al igual que la consulta de existencias, el registro de entradas de inventario fue retirado del alcance del sistema por mutuo acuerdo con INCOVSA y el docente del curso:

1. **Gestión centralizada de compras:** todas las recepciones de materias primas importadas y nacionales, pesajes de ingreso en báscula, ingresos por compras locales y transferencias entre bodegas son ingresadas directamente en **Odoo** por el departamento de Compras y Almacén Central.
2. **Exclusión formal (RF-SL-41, RF-SL-43):** los requerimientos correspondientes a compras y traslados fueron declarados formalmente excluidos el 29 de septiembre de 2026 y ratificados en el historial de decisiones (`specs/09` y `specs/18`).
3. **Evitar doble digitación:** si los bodegueros tuviesen que registrar las entradas tanto en Odoo como en el sistema de picking, se duplicaría el tiempo administrativo y aumentarían los riesgos de error humano.

### Flujo de recepción en la empresa

El personal de bodega de INCOVSA debe seguir el procedimiento establecido en las políticas internas de la compañía:

1. Recepcionar el camión de abastecimiento en la rampa de descarga de la sede correspondiente.
2. Cotejar la guía de remisión física y el certificado de análisis del proveedor contra la orden de compra emitida por la empresa.
3. El encargado administrativo de almacén ingresa al sistema **Odoo** y valida la recepción en el módulo de inventarios, asignando el número de lote y registrando la entrada oficial.
4. El producto queda inmediatamente disponible en el stock de Odoo para ser facturado por los ejecutivos de ventas.

### Resultado esperado
Las entradas de mercancía quedan centralizadas en Odoo, garantizando la consistencia fiscal, contable y física del inventario empresarial.

> **Nota:** Este apartado se incluye en el presente manual para dar cumplimiento riguroso a la estructura de 22 secciones exigida por los lineamientos del curso, dejando constancia de su justificación aprobada.

