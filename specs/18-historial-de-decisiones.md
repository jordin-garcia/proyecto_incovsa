# 18. Historial de decisiones

## Fuentes

| Fecha | Fuente | Dónde está |
|---|---|---|
| 27/08/2026 | Reunión 1, virtual (Ing. William Ambrossio e Ing. Luis Orozco) | `docs/Reuniones/Reunion1_270826/` |
| 01/09/2026 | Documento "INCOVSA Propuesta de proyectos" | `docs/` |
| 04/09/2026 | Reunión 2, virtual. Se aprueba la propuesta 1 junto con el sitio web | `docs/Reuniones/Reunion2_040926/` |
| 08/09/2026 | Lineamientos del docente | `docs/` |
| 09 al 11/09/2026 | Cuestionario respondido por escrito por la contraparte | **No archivado** (P-04) |
| 17/09/2026 | Reunión 3, presencial: visita a la bodega de Quetzaltenango | `docs/Reuniones/Reunion3_170926/` |
| 18/09/2026 | Reunión de especificación de módulos | **Sin acta** (P-04) |
| 19/09/2026 | Entrega de `Picking II.xlsm` y de las imágenes institucionales | `docs_incovsa/` |
| 19 y 20/09/2026 | Aclaraciones con la contraparte | **No archivadas** (P-04) |
| 20/09/2026 | Especificación del sistema v1.0 (`ESPECIFICACION_SISTEMA.md`) | Reemplazada por esta carpeta |
| 21/09/2026 | Documento 1 v0.1 (Entregable 1) | `entregable-1/` |
| 22/09/2026 | Entrega de `INVENTARIO INCOVSA.xlsx` y `Data Odo Para Picking.xlsx` | `docs_incovsa/PROYECTO PICKING/` |
| 23/09/2026 | Entrega del catálogo de prueba (28 imágenes) y de documentos técnicos de ejemplo | `docs_incovsa/PAGINA WEB/` |
| 23/09/2026 | Respuestas del equipo (coordinador Jordin García) a los 74 puntos por aclarar. Incluyen la confirmación del Ing. William sobre entradas y salidas | Esta carpeta |
| 24/09/2026 | Respuestas del equipo a las dudas D1–D30 y a 8 preguntas de cierre | Esta carpeta |
| 24/09/2026 | Respuestas del equipo a los pendientes P-12, P-14, P-15, P-24, P-28, P-29, P-36 y P-43 | Esta carpeta |

## Decisiones reemplazadas

Si un documento anterior dice lo de la columna "Antes", ya no aplica.

| Tema | Antes | Ahora | Desde |
|---|---|---|---|
| Selector de sede al iniciar sesión | Sí había selector (acta 3, 17/09) | No hay selector; la sede sale de la cuenta | 20/09, reconfirmado el 23/09 |
| Módulos del picking | 3 (acta 3) y luego 4 (18/09) | 6: Facturación, Bodega, Ruta, Inventario, Reportes y Configuración | 24/09 |
| Estados del pedido | Validado, Preparado y Cancelado (notas de la reunión 3) | Pendiente, Cancelado, En Preparación, Despachado, En Ruta y Entregado | 20/09 |
| Pendiente y Cancelado | Se guardaban (el Documento 1 decía "el sistema registra el pedido en estado Pendiente") | No se guardan. La cancelación queda en la bitácora | 23/09 |
| Estado "Editado" | Se agregaba al editar la ruta por devolución | Se reemplaza por la marca "Con devolución" | 24/09 |
| Cantidades exactas (RN-03) | Solo se vendían cantidades exactas | Se permiten ventas fraccionadas, con resto en kg | 23/09 |
| Unidad de la cantidad (RN-04) | La misma unidad del Peso2: kg, galón, libra o litro | Todo en kg | 23/09 |
| Alerta de capacidad aproximada | Se debía a la mezcla de unidades | Todo es kg; INCOVSA acepta igual que sea aproximada | 23/09 |
| Unicidad del SKU (RN-15) | Los 4 dígitos finales diferenciaban cada registro | El sufijo es el lote de Odoo y no es único. La clave es el código completo | 23/09 |
| Cantidad de productos | "857 códigos distintos" | 856; hay uno duplicado | 23/09 |
| Catálogo maestro | Odoo (respuesta 7 del 23/09) | Productos y Peso2 de `Picking II`; existencias de `INVENTARIO INCOVSA` (Xela) | 24/09 |
| Entradas de inventario | Fuera del alcance. Solo había devoluciones | Compras, ajustes, traslados y devoluciones | 23/09 |
| Traslados entre sedes | Fuera del alcance | Dentro, automáticos entre origen y destino | 23/09 |
| Creación de productos | Fuera del alcance | Gerencia y Soporte IT, en Configuración | 23/09 |
| Inventario "espejo de Odoo" | Se cargaba una vez y solo cambiaba por despachos y devoluciones | Existencias propias con entradas y salidas, sin conexión con Odoo | 23 y 24/09 |
| Devoluciones | Se editaba el registro de ruta, una sola vez, por producto y cliente | Módulo de Inventario, ligadas al pedido, por línea, varias veces sin superar lo vendido, para ambos tipos de pedido | 24/09 |
| Prioridad en Bodega | Se asignaba desde la tableta; no estaba claro si se guardaba | Compartida en tiempo real y no guardada en el historial | 24/09 |
| Recorrido de la ruta | "El orden que el piloto define" | El orden al pulsar "Pedido Entregado" | 24/09 |
| Número de ruta | Sin definir | Correlativo por sede | 24/09 |
| Cuentas compartidas | Solo Gerencia (20/09). El 23/09 se respondió que cualquiera podía usar la misma cuenta | Se mantiene: solo Gerencia, y un solo rol por sistema | 24/09 |
| Quién crea usuarios | Gerencia y Soporte IT creaban usuarios de cualquier rol | Sitio: solo Gerencia, desde el panel. Picking: Gerencia y Soporte IT, desde Configuración. La cuenta de Gerencia se crea en cualquiera de los dos | 24/09 |
| Recuperación de contraseña | Por correo para los usuarios del panel | Sitio: por correo si hay correo; si no, Gerencia. Picking: Soporte IT | 24/09 |
| Acceso a documentos internos | Por rol mínimo por documento (ER del Documento 1); "por documento" (respuesta del 23/09) | Por rol del usuario | 24/09 |
| Vista general | "Descargar PDF" | Solo visualizar el PDF | 24/09 |
| Asociación de documentos | Al producto operativo, pendiente de confirmar | A uno o varios productos públicos; el COA lleva además el código o lote como texto | 23 y 24/09 |
| Administración del contenido del sitio | Administrativo y Gerencia | Se mantiene: Gerencia y Administrativo | 24/09 |
| Almacenamiento de imágenes | Sistema de archivos del servidor | Cloudflare R2, plan gratuito. Los PDF siguen en el servidor | 23 y 24/09 |
| Industrias | 8 (propuesta de la empresa) | 9, con Lavandería | 23/09 |
| Producto e industria | Un producto, una industria (ER) | Un producto puede tener varias industrias | 23/09 |
| Presencia web | "La empresa no cuenta con sitio web" | Tiene una página básica en Google Sites. No tiene sitio corporativo | 24/09 |
| Separar INCOVSA e Inquiserca en el picking | El plan (SL-15) dividía el sistema por empresa | No se separan; comparten existencias | 23/09 |
| Ubicaciones | Se consideraba el recorrido dentro de la bodega (plan B7) | No se guardan ni se muestran; se suma por sede | 24/09 |

## Pendientes resueltos el 24/09/2026

| Pendiente | Decisión |
|---|---|
| P-12 | Administrativo **sí** descarga documentos internos |
| P-14 | Soporte IT **sí** opera Facturación, Bodega y Ruta, en todas las sedes |
| P-15 | Gerencia y Soporte IT **sí** crean, editan y eliminan clientes, sectores y camiones |
| P-24 | El correlativo del pedido es **por sede** |
| P-28 | La fecha de la ruta es la del envío de Facturación a Bodega, y el número se asigna en ese mismo paso |
| P-29 | Los movimientos de inventario **sí** se pueden editar (el detalle queda en P-50) |
| P-36 | Los clientes son **comunes** a las 3 sedes |
| P-43 | Si cambia el Peso2, los pedidos ya enviados **conservan** el Peso2 con el que se vendieron |

## Documentos alineados el 24/09/2026

- **Se eliminaron:**
  - `ESPECIFICACION_SISTEMA.md` y `PLAN_DE_PROYECTO.md`;
  - `entregable-1/ANEXO_E_REGLAS_DE_CONVERSION.md` y `entregable-1/DOCUMENTO_1.md`;
  - `entregable-1/diagramas/mermaid-anterior/` y los archivos temporales.
- **Diagramas:** se actualizaron las figuras 1 a 8.
- **Prototipos:**
  - Se agregó la pantalla de Inventario.
  - Cada pantalla operativa muestra solo el menú de su rol.
  - Se quitó el registro de devolución de Ruta y se corrigieron los textos.
  - Se regeneraron las capturas y el prototipo navegable.
- **Documento 1:**
  - Se generó la v0.2 alineada con esta carpeta.
  - La v0.1 entregada se conserva como `… v0.1.docx` y `… v0.1.pdf`.
  - Se corrigieron dos defectos de la v0.1: el nombre de la empresa en la portada y la numeración de los pasos de los casos de uso.

## Decisiones vigentes que no cambiaron

Siguen vigentes, sin cambios, las decisiones de la especificación del 20/09 que no aparecen en la tabla anterior. Todas están copiadas en esta carpeta.
