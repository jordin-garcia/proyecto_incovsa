# 11. Módulo de Configuración

> **Cambio del 13/10/2026 (reunión 5), detallado el 14/10/2026.** Como los datos del archivo de Odoo se usan tal como vienen (el Peso de Conversión, el lote, el cliente y el sector salen del archivo), el picking **ya no tiene catálogos de productos, clientes ni sectores**. Por decisión del coordinador del 14/10, Configuración queda solo con **Camiones** y **Usuarios**, y se eliminan los permisos "Administrar productos y su Peso de Conversión" y "Administrar clientes y sectores".

## Acceso

- **Camiones:** usuarios del picking con el permiso "Administrar camiones", en las sedes que tengan asignadas.
- **Usuarios:** solo Gerencia y Soporte.
- Gerencia y Soporte tienen acceso a todo, en todas las sedes ([03-roles-y-accesos.md](03-roles-y-accesos.md)).

## Camiones

Se pueden **ver, crear, editar y eliminar** camiones.

| Campo | Regla |
|---|---|
| Identificación | Pendiente de recibir (P-01) |
| Capacidad máxima | En kg, número mayor que cero |
| Sede | Sede a la que pertenece |

- Quetzaltenango tiene 3 camiones: dos de 3,400 kg y uno de 6,000 kg.
- Los camiones de la sede aparecen en la **lista desplegable** de la opción "Envío por camión" de Facturación (13/10).
- Eliminar un camión es una **eliminación lógica** (12/10): desaparece de las listas, y las rutas, los reportes y la bitácora donde aparece se conservan intactos.

## Usuarios del picking (RF-SL-03, RF-SL-48, RF-SL-56, RF-SL-57)

Los usuarios del sistema de picking se administran **aquí**, en la pestaña "Usuarios". Los del sitio se administran en el panel del sitio.

- Lo hacen **Gerencia y Soporte**.
- Campos del usuario: nombre completo, nombre de usuario, **contraseña** (al crearlo, 13/10), **rol** (texto libre), **sedes** a las que tiene acceso (casillas), **permisos** del picking (casillas), estado y correo opcional.
- El nombre de usuario es único **dentro del picking**. Se puede usar el **mismo nombre de usuario** que tiene una cuenta del sitio, para que la persona entre a los dos sistemas con el mismo usuario (13/10, RN-54).
- Se pueden **crear, editar y eliminar** usuarios, y **agregar, editar o revocar** sus permisos y sedes.
- Los pilotos son los usuarios cuyo rol es **"Piloto"**.
- Desde aquí, Gerencia y Soporte **restablecen la contraseña** de un usuario que se lo pida, escribiendo la nueva contraseña (RF-SL-48). No hay restablecimiento por correo.
- El modelo completo y el catálogo de permisos están en [03-roles-y-accesos.md](03-roles-y-accesos.md).

## Lo que se quitó el 13/10 y el 14/10

| Elemento | Motivo |
|---|---|
| Pestaña **Productos** (nombre y Peso de Conversión) | El Peso de Conversión viene en el archivo de Odoo (RN-37) |
| Pestañas **Clientes** y **Sectores** | El cliente y el sector vienen en el archivo de Odoo y no se guardan en ninguna base |
| Carga inicial del catálogo de `Picking II` (336 productos y 314 clientes) | Ya no hay catálogos que cargar ([13-datos-maestros.md](13-datos-maestros.md)) |
| Permisos "Administrar productos y su Peso de Conversión" y "Administrar clientes y sectores" | Ya no hay qué administrar |
