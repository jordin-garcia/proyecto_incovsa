# 11. Módulo de Configuración

## Acceso

Gerencia y Soporte IT, en todas las sedes.

## Productos (RF-SL-04)

Gerencia y Soporte IT pueden **ver, crear, editar y eliminar** productos.

| Campo | Regla |
|---|---|
| Código completo | Obligatorio y **único**. Formato del Excel de la empresa: `NOMBRE-ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD]-SUFIJO` |
| Peso2 (kg) | Obligatorio, número mayor que cero. Se captura al crear el producto y **se cambia al editarlo** |
| Unidad Medida | Texto informativo que trae la carga inicial (por ejemplo, `0025KG`). Si se captura al crear un producto nuevo está pendiente (P-30) |

- El SKU que se muestra en las tablas es el sufijo del código; no es un campo aparte.
- Los productos son **comunes a las tres sedes**. Lo que cambia por sede es la existencia.
- Un producto nuevo arranca con existencia 0 en todas las sedes. La existencia se carga con una compra, un ajuste o un traslado ([09-picking-inventario.md](09-picking-inventario.md)).
- Qué pasa al eliminar un producto, cliente, sector o camión que ya tiene pedidos, rutas o movimientos: [DECISIÓN TÉCNICA] P-42. Hay que conservar el historial y la bitácora.
- Si se cambia el Peso2, **los pedidos ya enviados conservan el Peso2 con el que se vendieron**. El valor nuevo aplica solo a los pedidos que se envíen desde ese momento (RN-33, confirmado el 24/09).
- **No existe un catálogo aparte de "unidades de venta":** la unidad de venta de cada producto es su Peso2. Esto sale de la respuesta del 24/09 (el Peso2 se ingresa al crear el producto) y falta confirmarlo (P-44).

## Camiones

| Campo | Regla |
|---|---|
| Identificación | Pendiente de recibir (P-01) |
| Capacidad máxima | En kg |
| Sede | Sede a la que pertenece |

Quetzaltenango tiene 3 camiones: dos de 3,400 kg y uno de 6,000 kg.

## Clientes y sectores

- Gerencia y Soporte IT pueden **ver, crear, editar y eliminar** clientes, sectores y camiones (confirmado el 24/09).
- Cliente: nombre y sector. Los clientes son **comunes a las tres sedes**.
- Sector: texto tal como viene en el archivo de la empresa, sin normalizar (por ejemplo, "sector 1 san andres xecul").

## Usuarios del picking (RF-SL-03, RF-SL-48)

- Gerencia y Soporte IT crean usuarios de **cualquier rol** del picking, sin límite de cantidad.
- Campos: nombre completo, nombre de usuario, rol (uno solo), sede ("Todas las sedes" solo para Gerencia y Soporte IT), estado y correo opcional.
- Desde aquí se restablecen las contraseñas de los usuarios del picking.
- Una cuenta de **Gerencia** creada o editada aquí queda habilitada también en el sitio web ([03-roles-y-accesos.md](03-roles-y-accesos.md)).
