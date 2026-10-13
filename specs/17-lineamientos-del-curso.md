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

> **P-58 (con el docente).** Desde el 29/09 el sistema no lleva inventario por decisión de INCOVSA. El Entregable 2 pide "inventario" y la demostración del Entregable 3 incluye "actualización de inventario". La exclusión se le explicará al docente en el Entregable 2. El coordinador espera que la apruebe, porque son requerimientos de la empresa, y **no impide seguir adelante** con el proyecto (11/10).

## Cómo cubre el sistema lo que piden los lineamientos

| Lo que piden los lineamientos | Cómo se cubre |
|---|---|
| Conversión de kilogramos a unidades | RN-01, con resto en kg para ventas fraccionadas |
| Productos | Configuración (CRUD de productos) |
| Presentaciones y equivalencias | Cada producto tiene **un nombre y un Peso de Conversión** en kg, que se configura al crear o editar el producto. No hay entidades separadas de presentación o equivalencia. Aprobado con el prototipo (P-45, resuelto el 11/10) |
| Inventario, entradas y salidas, existencias | **No se cubre.** INCOVSA lo sacó del alcance el 29/09: el inventario lo lleva Odoo. Falta la aprobación del docente (P-58) |
| Pedidos pendientes de despacho | Pedidos En Preparación en Bodega |
| Generación del picking | Carga del archivo de Odoo en Facturación, más la agrupación y conversión de Bodega |
| Preparación y cambios de estado | Marcado por fila y botón "Pedido Despachado" (RN-11) |
| Tablero para personal de bodega | El módulo de Bodega es el tablero |
| Carga de vehículos | El facturador arrastra los pedidos a cada camión, con control de peso, alerta de sobrepeso y piloto asignado. No hay confirmación de carga (aprobado, P-45) |
| Despacho | "Pedido Despachado" (Despachado o En Ruta) |
| Rutas realizadas | Módulo de Ruta y su registro histórico |
| Reportes | Módulo de Reportes del prototipo aprobado, con filtros por periodo ([10-picking-reportes.md](10-picking-reportes.md)) |
| Usuarios y roles | Permisos por usuario; roles predeterminados Gerencia y Soporte ([03-roles-y-accesos.md](03-roles-y-accesos.md)) |
| Historial de operaciones | Bitácora consultable en la pestaña "Bitácora" de Reportes, con inicios de sesión (RN-39), y registro histórico de rutas en Reportes |
| Lotes | No se controlan; lo hace Odoo (aprobado, P-45) |

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
