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
| 2 (14/10) | **Avance funcional real**, con lógica y persistencia: sitio con CMS, autenticación y roles, contenido, industrias y catálogo; picking con productos, equivalencias (Peso2), inventario, pedidos y generación del picking, y avance en preparación, estados y tablero. Además: arquitectura actualizada, diagramas de componentes, clases y secuencia, ER actualizado, diccionario de datos, estructura del repositorio, migraciones, dependencias, seguridad, README preliminar, casos de prueba iniciales y matriz de trazabilidad. **Demostración obligatoria:** pedido facturado → conversión → picking → preparación |
| 3 (04/11) | Sistema completo y desplegado, los 6 documentos finales, pruebas con evidencia, capacitación y transferencia de accesos. **Demostración obligatoria del flujo completo:** pedido facturado → conversión → picking → preparación → actualización de inventario → carga → despacho → estado → reporte |

## Cómo cubre el sistema lo que piden los lineamientos

| Lo que piden los lineamientos | Cómo se cubre |
|---|---|
| Conversión de kilogramos a unidades | RN-01, con resto en kg para ventas fraccionadas |
| Productos | Configuración (CRUD de productos) |
| Presentaciones y equivalencias | Cada código de producto tiene **una sola presentación**, y su equivalencia es el **Peso2** en kg, que se configura al crear o editar el producto. No hay entidades separadas de presentación o equivalencia (P-45) |
| Inventario, entradas y salidas, existencias | Módulo de Inventario: compras, ajustes, traslados, devoluciones y ventas (RN-22) |
| Pedidos pendientes de despacho | Pedidos En Preparación en Bodega |
| Generación del picking | Facturación más la agrupación y conversión de Bodega |
| Preparación y cambios de estado | Marcado por fila y botón "Pedido Despachado" (RN-11) |
| Tablero para personal de bodega | El módulo de Bodega es el tablero |
| Carga de vehículos | Asignación de camión y piloto más la alerta de capacidad. No hay confirmación de carga (P-45) |
| Despacho | "Pedido Despachado" (Despachado o En Ruta) |
| Rutas realizadas | Módulo de Ruta y su registro histórico |
| Reportes | Módulo de Reportes, pendiente de especificar (P-05) |
| Usuarios y roles | [03-roles-y-accesos.md](03-roles-y-accesos.md) |
| Historial de operaciones | Bitácora y movimientos de inventario |
| Lotes | No se controlan; lo hace Odoo (P-45) |

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

> **P-45.** El docente todavía no ha aprobado que presentaciones y equivalencias se cubran con el Peso2 de cada producto, que no haya confirmación de carga ni control de lotes, ni cómo se documentan en los Documentos 4 y 6 las secciones que dependen de esto.
