# 11. Módulo de Configuración

## Acceso

Usuarios del picking con permisos sobre Configuración, en las sedes que tengan asignadas ([03-roles-y-accesos.md](03-roles-y-accesos.md)). Gerencia y Soporte tienen acceso a todo, en todas las sedes.

## Productos (RF-SL-04)

Se pueden **ver, crear, editar y eliminar** productos. Los productos siguen siendo necesarios aunque ya no haya inventario: su **Peso de Conversión** es el divisor de la conversión.

> **Cambio del 11/10/2026.** Al agregar un producto **solo se piden el nombre y el Peso de Conversión**. El dato "Unidad de Medida" ya no se usa en ninguna parte. El dato que antes se llamaba `Peso2` pasa a llamarse **Peso de Conversión** en todo el sistema.

| Campo | Regla |
|---|---|
| Nombre | Obligatorio y **único**. Tiene el **mismo formato que el nombre de producto del archivo de Odoo**: `NOMBRE (ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD])`, sin el lote. Ejemplo: `SODA ASH (CHI-SAC/0040KG)` |
| Peso de Conversión (kg) | Obligatorio, número mayor que cero. Se captura al crear el producto y **se cambia al editarlo** |

- Los productos también se pueden agregar **desde Facturación**, cuando el archivo de Odoo trae un producto que no está en el catálogo. Ahí solo se pide el Peso de Conversión, porque el nombre es el del archivo ([06-picking-facturacion.md](06-picking-facturacion.md)).
- Los productos son **comunes a las tres sedes**.
- El sistema **ya no lleva existencias** (29/09/2026). La tabla de productos del prototipo pierde las columnas de existencia por sede y la columna "Unidad medida", y un producto ya no se bloquea para eliminar por tener existencia ([09-picking-inventario.md](09-picking-inventario.md)).
- La columna **SKU** se quita de todas las pantallas (11/10).
- La carga inicial convierte los códigos de `Picking II` a este formato; las reglas están en [13-datos-maestros.md](13-datos-maestros.md).
- Eliminar un producto, cliente, sector o camión es una **eliminación lógica** (12/10, resuelve P-42): desaparece de listas y selectores, y los pedidos, rutas, reportes y la bitácora donde aparece se conservan intactos.
- Si se cambia el Peso de Conversión, **los pedidos ya enviados conservan el Peso de Conversión con el que se vendieron**. El valor nuevo aplica solo a los pedidos que se envíen desde ese momento (RN-33, confirmado el 24/09).
- **No existe un catálogo aparte de "unidades de venta":** el producto solo tiene nombre y Peso de Conversión (respuesta del 11/10, resuelve P-44).

## Camiones

| Campo | Regla |
|---|---|
| Identificación | Pendiente de recibir (P-01) |
| Capacidad máxima | En kg |
| Sede | Sede a la que pertenece |

- Quetzaltenango tiene 3 camiones: dos de 3,400 kg y uno de 6,000 kg.
- Cada camión de la sede aparece como una opción de envío en Facturación.

## Clientes y sectores

- Se pueden **ver, crear, editar y eliminar** clientes, sectores y camiones (confirmado el 24/09).
- Cliente: nombre y sector. Los clientes son **comunes a las tres sedes**.
- Los clientes también se pueden guardar **desde Facturación**, cuando el archivo de Odoo trae un cliente que no está en la base; ahí se piden su nombre y su sector ([06-picking-facturacion.md](06-picking-facturacion.md)). El sector se elige de la lista de sectores o se agrega uno nuevo.
- En los pedidos, el nombre y el sector del cliente salen de las columnas `Contacto` y `Contacto/Ciudad` del archivo de Odoo.
- Sector: texto tal como viene en el archivo de la empresa, sin normalizar (por ejemplo, "sector 1 san andres xecul").

## Usuarios del picking (RF-SL-03, RF-SL-48, RF-SL-56, RF-SL-57)

Los usuarios del sistema de picking se administran **aquí**, en la pestaña "Usuarios". Los del sitio se administran en el panel del sitio (respuesta del 11/10 a P-59).

- Lo hacen **Gerencia y Soporte**.
- Campos del usuario: nombre completo, nombre de usuario, **rol** (texto libre), **sedes** a las que tiene acceso (casillas), **permisos** del picking (casillas), estado y correo opcional.
- Se pueden **crear, editar y eliminar** usuarios, y **agregar, editar o revocar** sus permisos y sedes.
- Los pilotos son los usuarios cuyo rol es **"Piloto"**.
- Desde aquí, Gerencia y Soporte **restablecen la contraseña** de un usuario que se lo pida (RF-SL-48).
- El modelo completo y el catálogo de permisos están en [03-roles-y-accesos.md](03-roles-y-accesos.md).
