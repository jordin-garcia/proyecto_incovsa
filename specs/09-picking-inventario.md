# 09. Módulo de Inventario

**Estado: Eliminado** el 29/09/2026 (reunión 4, Ing. William Ambrossio).

## Decisión

El sistema **ya no lleva control de inventario**: ni existencias, ni entradas, ni salidas de productos. Queda fuera del alcance porque el sistema está pensado para integrarse en el futuro con Odoo, y Odoo es el que lleva el inventario de todas las bodegas.

El sistema de picking queda con **cinco módulos**: Facturación, Bodega, Ruta, Reportes y Configuración ([01-alcance.md](01-alcance.md)).

## Qué se elimina

| Elemento | Antes | Referencia |
|---|---|---|
| Consulta de existencias por producto y sede | RF-SL-40, CU-16 | Eliminado |
| Compras | RF-SL-41, RN-27, CU-17 | Eliminado |
| Ajustes | RF-SL-42, RN-26, CU-18 | Eliminado |
| Traslados entre sedes | RF-SL-43, RN-25, CU-19 | Eliminado |
| Devoluciones y marca "Con devolución" | RF-SL-44, RF-SL-45, RN-23, CU-06 | Eliminado. La devolución era una entrada de inventario |
| Validación de existencias al registrar el pedido | RF-SL-15, RN-07 | Eliminado |
| Salida por venta al enviar el pedido a bodega | RF-SL-16, RN-06 | Eliminado (RF-SL-16 se modifica) |
| Existencia nunca negativa | RF-SL-46, RN-24 | Eliminado |
| Registro y edición de movimientos | RF-SL-47, RF-SL-49, RN-34, CU-20 | Eliminado |
| Carga inicial de existencias de Quetzaltenango | [13-datos-maestros.md](13-datos-maestros.md) | Eliminado |
| Entidades EXISTENCIA, MOVIMIENTO_INVENTARIO, TRASLADO y DEVOLUCION | [14-modelo-de-datos.md](14-modelo-de-datos.md) | Eliminado |

Los códigos no se reutilizan. Los requerimientos y reglas eliminados conservan su código con estado *Eliminado* en [04-requerimientos-funcionales.md](04-requerimientos-funcionales.md) y [12-reglas-de-negocio.md](12-reglas-de-negocio.md).

## Lo que no cambia

- La conversión a unidades sigue igual (RN-01). Desde el 13/10 el Peso de Conversión viene en el archivo de Odoo y el picking ya no tiene catálogo de productos ([11-picking-configuracion.md](11-picking-configuracion.md)).
- El sistema sigue sin controlar lotes ni ubicaciones (RN-32); desde el 13/10 solo muestra el lote que trae el archivo.

> **P-58 (resuelto el 16/10).** Los lineamientos del curso piden inventario, entradas, salidas y existencias en el Entregable 2, y "actualización de inventario" en la demostración del Entregable 3. El Ing. Manuel Rojas **aprobó esta exclusión** ([17-lineamientos-del-curso.md](17-lineamientos-del-curso.md)).
