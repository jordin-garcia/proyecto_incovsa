# 17. Lineamientos del curso

Resumen de los "Lineamientos para la documentación y entrega del proyecto" del Ing. Manuel Rojas (recibidos el 08/09/2026), y de cómo los cubre el sistema.

## Documentos exigidos

| Documento | Contenido | Responsable |
|---|---|---|
| 1 | Memoria general y especificación del sistema (capítulos 1 a 8) | Carlos Hugo Escobar |
| 2 | Documentación técnica (28 secciones, incluido el procedimiento obligatorio para extender el sistema con un ejemplo real) | José Daniel Cifuentes |
| 3 | Manual de usuario de la administración del sitio (17 apartados) | Daniela Marín |
| 4 | Manual de usuario del sistema logístico (22 apartados) | Josué Menéndez |
| 5 | Manual técnico de instalación, despliegue y mantenimiento (19 apartados, con al menos una prueba de restauración) | Carlos Hugo Escobar |
| 6 | Plan y evidencias de pruebas (13 secciones, con prueba integral y pruebas de conversión obligatorias) | Jordin García |

Además se entregan el repositorio (con un README de 16 secciones obligatorias) y los anexos A a J.

**Formato:**

- carta, márgenes de 2.54 cm, Arial 11 o 12, interlineado 1.5 y texto justificado;
- títulos numerados con estilos de Word e índices automáticos;
- figuras y tablas identificadas;
- tabla de control de versiones;
- citas en APA 7.

## Qué exige cada entregable

| Entregable | Exige |
|---|---|
| 1 (21/09) | Definición, análisis y diseño inicial. Alcance, flujos, reglas de conversión y prototipos **validados con INCOVSA** |
| 2 (14/10) | **Avance funcional real**, con lógica y persistencia: sitio con CMS, autenticación y roles, contenido, industrias y catálogo; picking con productos, equivalencias (Peso de Conversión), inventario, pedidos y generación del picking, y avance en preparación, estados y tablero. Además: arquitectura actualizada, diagramas de componentes, clases y secuencia, ER actualizado, diccionario de datos, estructura del repositorio, migraciones, dependencias, seguridad, README preliminar, casos de prueba iniciales y matriz de trazabilidad. **Demostración obligatoria:** pedido facturado → conversión → picking → preparación |
| 3 (04/11) | Sistema completo y desplegado, los 6 documentos finales, pruebas con evidencia, capacitación y transferencia de accesos. **Demostración obligatoria del flujo completo:** pedido facturado → conversión → picking → preparación → actualización de inventario → carga → despacho → estado → reporte |

> **P-58 (resuelto el 16/10).** Desde el 29/09 el sistema no lleva inventario por decisión de INCOVSA. El Entregable 2 pide "inventario" y la demostración del Entregable 3 incluye "actualización de inventario". La exclusión se le explicó al docente con la nota del 14/10 y el **Ing. Manuel Rojas la aprobó** (informado por el coordinador el 16/10).

## Cómo cubre el sistema lo que piden los lineamientos

| Lo que piden los lineamientos | Cómo se cubre |
|---|---|
| Conversión de kilogramos a unidades | RN-01, con resto en kg para ventas fraccionadas |
| Productos | **(13/10)** El producto llega en cada línea del archivo de Odoo, con su Peso de Conversión y su lote, y se usa tal como viene. El picking ya no tiene catálogo de productos |
| Presentaciones y equivalencias | La presentación está en el nombre del producto de Odoo y la equivalencia es el **Peso de Conversión** en kg que trae cada línea del archivo (13/10). No hay entidades separadas de presentación o equivalencia |
| Inventario, entradas y salidas, existencias | **No se cubre.** INCOVSA lo sacó del alcance el 29/09: el inventario lo lleva Odoo. El docente aprobó la exclusión (16/10) |
| Pedidos pendientes de despacho | Rutas y pedidos En Preparación en Bodega |
| Generación del picking | Carga del archivo de Odoo en Facturación, armado de rutas y pedidos, y agrupación por producto y lote con su conversión en Bodega |
| Preparación y cambios de estado | Marcado por fila (también todo de una vez) y botón "Ruta Despachada" o "Pedido Despachado" (RN-11) |
| Tablero para personal de bodega | El módulo de Bodega es el tablero |
| Carga de vehículos | El facturador arrastra los pedidos facturados a "Envío por camión", elige camión y piloto, con control de peso y alerta de sobrepeso. No hay confirmación de carga (aprobado, P-45) |
| Despacho | "Pedido Despachado" (el pedido pasa a Despachado) o "Ruta Despachada" (la ruta pasa a En Ruta) |
| Rutas realizadas | Módulo de Ruta para las rutas en curso; el registro histórico está en la pestaña "Rutas realizadas" de Reportes (RF-SL-79) |
| Reportes | Módulo de Reportes del prototipo aprobado, con filtros por periodo ([10-picking-reportes.md](10-picking-reportes.md)) |
| Usuarios y roles | Permisos por usuario; roles predeterminados Gerencia y Soporte ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |
| Historial de operaciones | Bitácora consultable en la pestaña "Bitácora" de Reportes, con inicios de sesión (RN-39), y registro histórico de rutas en Reportes |
| Lotes | No se controlan; lo hace Odoo. Desde el 13/10 Bodega muestra el lote de cada línea |

## Anexos

| Anexo | Contenido |
|---|---|
| A | Actas de reuniones |
| B | Evidencias del levantamiento de requerimientos |
| C | Prototipos aprobados |
| D | Matriz completa de requerimientos |
| E | Reglas y tablas de conversión aprobadas por INCOVSA |
| F | Casos de prueba |
| G | Evidencias de pruebas |
| H | Evidencia de capacitación |
| I | Evidencia de entrega |
| J | Inventario de servicios y accesos. Las credenciales se entregan por un medio seguro y separado |

> **P-45 (resuelto el 11/10).** La aprobación del prototipo por el Ing. Manuel Rojas cubre que presentaciones y equivalencias se resuelvan con el Peso de Conversión de cada producto, y que no haya confirmación de carga ni control de lotes.
