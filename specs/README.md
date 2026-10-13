# Especificaciones del proyecto INCOVSA

Esta carpeta es la **fuente de verdad** del proyecto. Todo lo que el equipo o un agente de IA necesita saber para diseñar, programar, probar o documentar el sistema debe estar aquí.

**Versión:** 1.1
**Fecha de corte:** 12 de octubre de 2026 (incorpora los cambios de la reunión 4, del 29/09/2026, las respuestas del coordinador del 11/10/2026 y las medidas de seguridad del 12/10/2026)
**Responsable de mantenerla:** Jordin García (coordinador)

---

## Reglas de precedencia

1. Si algún documento del proyecto contradice a esta carpeta, **esta carpeta tiene la razón**. Eso incluye actas, plan de proyecto, Documento 1, anexos, prototipos, diagramas y notas.
2. Las actas de reunión (`docs/Reuniones/`) son el **registro histórico** de lo que se dijo ese día. No se modifican. Si una decisión posterior las contradice, la explicación está en [18-historial-de-decisiones.md](18-historial-de-decisiones.md).
3. Lo marcado como **[PENDIENTE]** no está decidido. No debe implementarse ni documentarse como decidido hasta que se resuelva y se registre aquí.
4. Lo marcado como **[DECISIÓN TÉCNICA]** lo resuelve el equipo de desarrollo, no INCOVSA. Una vez resuelto se registra en [16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md).
5. No se inventan datos. Si falta un dato, se agrega a [19-pendientes.md](19-pendientes.md).
6. El **prototipo de simulación aprobado** es la referencia de diseño y de comportamiento en todo lo que esta carpeta no detalla. Si contradice a esta carpeta, vale esta carpeta ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)).

## Índice

| Archivo | Contenido |
|---|---|
| [00-proyecto.md](00-proyecto.md) | Empresa, curso, equipo, contraparte, fechas y entregables |
| [01-alcance.md](01-alcance.md) | Componentes, módulos, alcance y fuera del alcance |
| [02-glosario.md](02-glosario.md) | Significado exacto de cada término del proyecto |
| [03-roles-y-accesos.md](03-roles-y-accesos.md) | Accesos, cuentas, permisos por usuario, roles y administración de usuarios |
| [04-requerimientos-funcionales.md](04-requerimientos-funcionales.md) | Catálogo de requerimientos funcionales y casos de uso, con su estado |
| [05-sitio-web.md](05-sitio-web.md) | Sitio público, panel administrativo y documentación interna |
| [06-picking-facturacion.md](06-picking-facturacion.md) | Módulo de Facturación: carga del archivo de Odoo |
| [07-picking-bodega.md](07-picking-bodega.md) | Módulo de Bodega (tablero de preparación) |
| [08-picking-ruta.md](08-picking-ruta.md) | Módulo de Ruta |
| [09-picking-inventario.md](09-picking-inventario.md) | Módulo de Inventario: **eliminado** el 29/09 y lo que se quitó |
| [10-picking-reportes.md](10-picking-reportes.md) | Módulo de Reportes |
| [11-picking-configuracion.md](11-picking-configuracion.md) | Módulo de Configuración: catálogos del picking |
| [12-reglas-de-negocio.md](12-reglas-de-negocio.md) | Reglas de negocio, conversión, estados del pedido y bitácora |
| [13-datos-maestros.md](13-datos-maestros.md) | Origen de los datos, carga inicial y archivos de la empresa |
| [14-modelo-de-datos.md](14-modelo-de-datos.md) | Modelo conceptual de datos |
| [15-requerimientos-no-funcionales.md](15-requerimientos-no-funcionales.md) | Requerimientos no funcionales |
| [16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md) | Arquitectura, stack, servicios externos y forma de trabajo |
| [17-lineamientos-del-curso.md](17-lineamientos-del-curso.md) | Exigencias del docente y cómo las cubre el sistema |
| [18-historial-de-decisiones.md](18-historial-de-decisiones.md) | Fuentes, decisiones y decisiones reemplazadas |
| [19-pendientes.md](19-pendientes.md) | Todo lo que falta definir o recibir |
| [20-prototipo-aprobado.md](20-prototipo-aprobado.md) | Prototipo de simulación aprobado, design system y registro de cambios de la reunión 4 |

## Convenciones

- **Códigos de requerimiento:** `RF-SW-xx` (sitio web), `RF-SL-xx` (sistema logístico o picking), `RNF-xx` (no funcionales), `RN-xx` (reglas de negocio), `CU-xx` (casos de uso), `P-xx` (pendientes), `CAM-xx` (cambios de la reunión 4, en [20-prototipo-aprobado.md](20-prototipo-aprobado.md)).
- **Estado de un requerimiento o regla:** *Vigente* (sin cambios desde el Documento 1), *Modificado* (cambió su contenido), *Nuevo* (no existía en el Documento 1), *Eliminado* (ya no aplica) o *Pendiente* (falta definirlo).
- **Los códigos no se reutilizan.** Un requerimiento eliminado conserva su código con estado *Eliminado*, para que la trazabilidad con el Documento 1 no se rompa.
- **Unidades:** todas las cantidades del sistema de picking están en **kilogramos (kg)**. Las capacidades de camión también.
- **Cambios de la reunión 4 y respuestas posteriores:** se marcan en el texto con **(29/09)** u **(11/10)**, o con una nota "Cambio del …".
- **Peso de Conversión:** desde el 11/10 es el nombre del dato que antes se llamaba "Peso2". La columna del Excel de la empresa conserva su nombre literal, `Peso2`.
- **Fechas:** formato dd/mm/aaaa.

## Cómo actualizar esta carpeta

1. Modificar el archivo que corresponda.
2. Registrar el cambio, con su fecha y su fuente, en [18-historial-de-decisiones.md](18-historial-de-decisiones.md).
3. Si el cambio resuelve un pendiente, quitarlo de [19-pendientes.md](19-pendientes.md).
4. Si el cambio afecta un requerimiento, actualizar su estado en [04-requerimientos-funcionales.md](04-requerimientos-funcionales.md).

## Privacidad

Esta carpeta se sube al repositorio de GitHub. Por eso **no contiene** datos personales ni nombres reales de clientes, pilotos o personal de la empresa, ni números de documento de identidad, direcciones, teléfonos, credenciales ni cantidades de inventario por cliente. Los archivos de datos de la empresa (`docs_incovsa/`) y las actas (`docs/`) **no se suben al repositorio**.
