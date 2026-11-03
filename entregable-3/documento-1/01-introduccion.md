# Introducción

Este documento es la memoria general y la especificación del sistema de INCOVSA. La versión es la 1.0, para la entrega del 4 de noviembre de 2026. Documenta el sistema tal como está en la rama `develop` el 3 de noviembre de 2026.

El texto se redactó a partir de la carpeta `specs/`, versión 1.7, con los cambios que se integraron hasta el 03/11/2026. De las versiones 0.1 y 0.2 se toma lo que dice `entregable-1/LEEME.md`.

Si este documento y `specs/` dicen cosas distintas, vale `specs/` (`specs/README.md`, regla 1).

## Identificación

Tabla: Identificación del proyecto {#tab:identificacion}

| Dato | Valor |
|---|---|
| Nombre del proyecto | Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA |
| Curso | Programación Web |
| Carrera | Ingeniería en Informática y Sistemas |
| Universidad | Universidad Rafael Landívar, Campus San Alberto Hurtado S.J. de Quetzaltenango, Facultad de Ingeniería |
| Docente | Ing. Manuel Rojas |
| Empresa beneficiaria | INCOVSA |
| Razón social a mostrar | Industria del Cuero Covadonga S. A. |
| Empresa del grupo incluida | Inquiserca |
| Contraparte técnica | Ing. William Ambrossio, encargado del área de tecnología |
| Representante de gerencia en la reunión 1 | Ing. Luis Orozco |

El equipo y el reparto de módulos, al 16/10/2026, están en `specs/00-proyecto.md`.

Tabla: Equipo y módulos {#tab:equipo}

| Integrante | Responsabilidad en el proyecto | Módulos |
|---|---|---|
| Héctor Jordin Adolfo García Coyoy | Coordinador, arquitecto, integrador y calidad. Documento 6 | Base del proyecto y esquema de la base de datos |
| Carlos Hugo Escobar Gómez | Requerimientos, documentación general y despliegue. Documentos 1 y 5 | Configuración (camiones y usuarios) y despliegue |
| Daniela Alexandra Marín Orozco | Sitio, panel y actas. Documento 3 | Sitio público y panel del sitio |
| Josué André Menéndez Juárez | Sistema logístico. Documento 4 | Bodega, con su tablero, y Ruta |
| José Daniel Cifuentes Carrascosa | Sistema logístico y documentación técnica. Documento 2 | Facturación y Reportes |

El apellido correcto es Cifuentes. Las notas de reunión originales decían Fuentes por error (`specs/00-proyecto.md`).

## La empresa

INCOVSA compra y vende productos químicos en Guatemala, con más de 30 años en el mercado. Atiende nueve industrias en el sitio: cuero, textil, cerería, hulera, medicamentos, limpieza, alimentación animal, tratamiento de agua y lavandería. Tiene mercado industrial y mercado artesanal. INCOVSA e Inquiserca comparten productos y existencias, y en el sitio se presentan con una misma identidad visual.

Tiene tres sedes y bodegas. Quetzaltenango tiene oficinas y la bodega central. Guatemala y Escuintla son las otras dos. El sistema se implementa y se prueba solo con Quetzaltenango, con las ubicaciones de Odoo que empiezan con `XE`. El modelo de datos y los permisos contemplan las tres sedes desde el inicio.

Tabla: Envíos en ruta por día, según `specs/00-proyecto.md` {#tab:volumen}

| Sede | Envíos en ruta por día |
|---|---|
| Quetzaltenango | 20 aproximadamente |
| Guatemala | 10 a 15 |
| Escuintla | 8 a 10 |

La operación usa el ERP Odoo, incluido el inventario de todas las bodegas. El picking se lleva en el Excel `Picking II.xlsm`. La presencia web actual es una página en Google Sites, <https://sites.google.com/view/incovsa>. La empresa no tiene un sitio corporativo propio.

## Alcance

La solución es una sola aplicación web, bajo el dominio incovsa.com, con dos componentes (`specs/01-alcance.md`).

1. El sitio web corporativo e institucional autoadministrable. Es la presencia digital de la empresa y el punto de entrada a los sistemas internos.
2. El sistema de control logístico de bodega (sistema de picking). Cubre el proceso posterior a la facturación: carga del pedido facturado desde Odoo, conversión a unidades, preparación, despacho, ruta y reportes.

Dentro del alcance del sitio web están:

- la información institucional: historia, misión, visión y valores, con galerías de hasta 5 imágenes que rotan;
- las 9 industrias, con una barra lateral de íconos, sus imágenes y sus productos en texto;
- el catálogo informativo de productos, sin precios y con búsqueda, y el detalle de cada producto con Productos Recomendados;
- las noticias, con imágenes, título y texto;
- la información de contacto de Quetzaltenango y Guatemala, con su mapa, y el formulario de solicitudes, quejas o reclamos, que se guardan en el sistema;
- el panel administrativo, para editar ese contenido sin tocar código, y la bandeja de solicitudes;
- la documentación interna, con los enlaces de Google Drive de cada producto documentado;
- el acceso personal, la administración de usuarios del sitio con permisos y el diseño responsivo.

Dentro del alcance del sistema de picking están:

- la carga de los pedidos facturados desde el archivo .xlsx de Odoo, a un tablero que se guarda en la base de datos;
- el armado de rutas y pedidos en las opciones Envío por camión y Cliente recoge en bodega, con control de peso del camión;
- la conversión de kilogramos a unidades con el Peso de Conversión del archivo, con resto en kg;
- el tablero de preparación, con lote, marcado por línea, prioridad y orden por peso en tiempo real, en modo claro u oscuro;
- la ruta del piloto, con su recorrido y el cierre de la entrega;
- los reportes de despacho, rutas realizadas y bitácora, con filtros por periodo y exportación a Excel y PDF;
- la configuración de camiones y la administración de usuarios del picking con rol, sedes y permisos.

El acceso tiene tres niveles.

Tabla: Niveles de acceso del sitio {#tab:niveles}

| Nivel | Contenido | Acceso |
|---|---|---|
| 1. Sitio informativo | Información institucional, industrias, catálogo, noticias, contacto | Público |
| 2. Documentación interna | Fichas técnicas, hojas de seguridad y certificados de análisis | Usuarios con permisos de documentación |
| 3. Sistema de picking | Módulos logísticos | Usuarios del picking, según sus permisos y sus sedes |

El picking tiene cinco módulos.

Tabla: Módulos del picking {#tab:modulos}

| Módulo | Propósito |
|---|---|
| Facturación | Cargar los pedidos ya facturados en Odoo, desde el archivo .xlsx exportado, y armar las rutas y los pedidos |
| Bodega | Tablero de preparación: qué sacar de la bodega, de qué lote y en qué unidades |
| Ruta | Clientes de la ruta asignada al piloto y cierre de la entrega |
| Reportes | Despacho por producto y rutas realizadas, con filtros por periodo |
| Configuración | Camiones y usuarios del picking |

El módulo de Inventario se eliminó el 29/09/2026 (`specs/09-picking-inventario.md`).

El 29/09/2026, en la reunión 4, el picking dejó de llevar control de inventario. Los pedidos se cargan desde un archivo exportado de Odoo. El acceso pasa a depender de permisos por usuario.

El 13/10/2026, en la reunión 5, los datos del archivo de Odoo se usan tal como vienen. El picking ya no tiene catálogos de productos, clientes ni sectores. Lo que sale en camión se llama ruta. Lo que recoge el cliente se llama pedido. La documentación interna pasa a enlaces de Google Drive. Las solicitudes de contacto ya no se envían por correo.

## Exclusiones

Cada exclusión tiene su motivo en `specs/01-alcance.md`. Ninguna se presenta aquí como función vigente.

La exclusión del control de inventario la decidió INCOVSA el 29/09/2026. El inventario lo lleva Odoo. Los lineamientos del curso piden inventario en el Entregable 2 y actualización de inventario en la demostración del Entregable 3. El Ing. Manuel Rojas aprobó la exclusión. El coordinador lo informó el 16/10/2026 (P-58, `specs/17-lineamientos-del-curso.md`).

Tabla: Fuera del alcance {#tab:exclusiones}

| Exclusión | Motivo |
|---|---|
| Control de inventario: existencias, entradas (compras, ajustes, traslados, devoluciones) y salidas | Decisión de INCOVSA (29/09). Aprobada por el docente (16/10) |
| Validación y descuento de existencias al registrar un pedido | Consecuencia de lo anterior (29/09) |
| Devoluciones y marca Con devolución | Eran entradas de inventario (29/09) |
| Captura manual de pedidos fila por fila | Reemplazada por la carga del archivo de Odoo (29/09) |
| Catálogos de productos, clientes y sectores en el picking | El archivo de Odoo trae esos datos y se usan tal como vienen (13/10) |
| Envío de correos (solicitudes de contacto o contraseñas) | Las solicitudes solo se guardan. Las contraseñas las restablecen Gerencia o Soporte |
| Guardar archivos PDF de la documentación interna | El sistema guarda enlaces de Google Drive (13/10) |
| Integración directa con Odoo (API o base de datos) | Solo se lee el archivo .xlsx que el facturador exporta. El sitio enlaza al inicio de sesión de Odoo |
| Recuperación de contraseña por correo | La restablecen Gerencia o Soporte (11/10) |
| Mostrar la sede de Escuintla en el sitio | Es solo bodega, sin oficina para clientes (11/10) |
| Validar que una referencia de Odoo no se cargue dos veces | Los datos vienen de Odoo (11/10) |
| Control de lotes | El lote lo controla Odoo. El picking muestra el lote del archivo (13/10) |
| Ubicaciones dentro de la bodega | No se guardan ni se muestran |
| Número de factura | No se registra |
| Separar INCOVSA e Inquiserca en el picking | Comparten productos |
| Distinguir productos Controlados y No controlados | No afecta al sistema |
| Lectura de código de barras | No forma parte de los módulos |
| Dirección y teléfono en la tabla de Ruta | La contraparte solo quiere Cliente, Sector y Total |
| Hora de salida y de regreso de la ruta | Solo se registran número, fecha, camión y piloto |
| Confirmación de carga en el camión | No se requiere |
| Registrar quién marca cada línea en Bodega | Decisión de la contraparte (24/09), reconfirmada el 11/10 |
| Editar el registro de una ruta | No se requiere |
| Pedidos en borrador | Un pedido no se guarda hasta enviarlo a bodega |
| Planificación de rutas en mapa y seguimiento del piloto | Propuesta 2, no seleccionada |
| Mantenimiento y combustible de la flota | Propuesta 3, no seleccionada |
| Comercio electrónico y precios en el sitio | Catálogo solo informativo |
| Cálculo de costos logísticos | El equipo entrega la herramienta. La empresa evalúa los costos |
| Control de papelería y permisos de precursores de los clientes | No fue solicitado |

El 23/09/2026 se habían incluido las compras, los traslados entre sedes y un inventario propio. El 29/09/2026 salieron del alcance junto con todo el control de inventario. La creación de productos en Configuración salió del alcance el 13/10/2026, porque el Peso de Conversión viene en el archivo de Odoo.

La revisión de seguridad del 29/10/2026, con OWASP ASVS 5.0 nivel 2, dejó algunos riesgos aceptados. No se implementan antes de la entrega: la autenticación de varios factores, el cambio de la contraseña propia, ver y cerrar las sesiones propias, que un administrador cierre sesiones sin desactivar la cuenta, una vida máxima absoluta de la sesión, un límite de sesiones simultáneas, la contraseña inicial que obliga a cambiarla y la consulta de contraseñas filtradas. Tampoco los cambios de la infraestructura del servidor, la retención de las solicitudes y de las direcciones IP de la bitácora, ni los límites de conexiones de tiempo real y de exportaciones simultáneas (`specs/18-historial-de-decisiones.md`).

## Metodología

El levantamiento se hizo con la contraparte, en reuniones y por escrito. El registro de fuentes está en `specs/18-historial-de-decisiones.md`. Esta sección usa solo ese registro. Las actas y las notas de las reuniones están en el anexo A.

Tabla: Fuentes del levantamiento registradas en `specs/18` {#tab:fuentes}

| Fecha | Fuente |
|---|---|
| 27/08/2026 | Reunión 1, virtual, con el Ing. William Ambrossio y el Ing. Luis Orozco |
| 01/09/2026 | Documento INCOVSA Propuesta de proyectos |
| 04/09/2026 | Reunión 2, virtual. Se aprueba la propuesta 1 junto con el sitio web |
| 08/09/2026 | Lineamientos del docente |
| 09 al 11/09/2026 | Cuestionario respondido por escrito. No archivado (P-04) |
| 17/09/2026 | Reunión 3, presencial. Visita a la bodega de Quetzaltenango |
| 18/09/2026 | Reunión de especificación de módulos. Sin acta (P-04) |
| 19 y 20/09/2026 | Aclaraciones con la contraparte. No archivadas (P-04) |
| 21/09/2026 | Documento 1 v0.1, Entregable 1 |
| 23 y 24/09/2026 | Respuestas del equipo a los puntos por aclarar. Quedan en `specs/` |
| 29/09/2026 | Reunión 4, virtual, con el Ing. William Ambrossio y el equipo. Notas de Daniela Marín |
| 13/10/2026 | Reunión 5, virtual, de 18:00 a 21:30. Notas de Daniela Marín. Dicen 14 de octubre por error (P-77) |
| 16/10/2026 | El docente aprobó la exclusión del inventario. Quedaron el despliegue, el plan de tareas y el trabajo con agentes de IA |
| 22/10/2026 | Decisión del coordinador: en el diseño manda el prototipo aprobado (decisión 89) |
| 22/10 y 26/10/2026 | Auditorías del coordinador sobre lo integrado. Sus decisiones precisan Facturación, Ruta, Reportes, Configuración y la bandeja de solicitudes |
| 29/10/2026 | Revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP |
| 02/11/2026 | El Ing. Manuel Rojas fijó las fechas de la fase final y pidió cambios en el sitio, el panel y el picking. El coordinador corrigió las barras laterales el 03/11 |

La propuesta 2 (planificación de rutas en mapa) y la propuesta 3 (mantenimiento y combustible) no se seleccionaron.

La carpeta `specs/` reemplazó a la especificación v1.0 del 20/09/2026. Los códigos eliminados se conservan con su estado, para no romper la trazabilidad con el Documento 1 v0.1. Lo marcado como pendiente no se documenta aquí como decidido. Los pendientes que siguen abiertos (`specs/19-pendientes.md`) se listan en el capítulo 8.

El prototipo de simulación aprobado (`specs/20-prototipo-aprobado.md`) es la referencia del diseño y del comportamiento que `specs/` no detalla. El Ing. William Ambrossio lo aprobó el 13/10/2026, ya con los cambios de la reunión 4, y pidió los de la reunión 5. Desde el 22/10/2026, en cómo se ve la aplicación (disposición, tamaños, colores, tipografía, espaciado y estilos) manda el prototipo. En los requisitos, las reglas, los textos, los datos y el comportamiento manda `specs/` (`specs/16-arquitectura-y-tecnologia.md`, decisión 89). Las excepciones de diseño están registradas en `specs/18-historial-de-decisiones.md`. Entre ellas están las de contraste que pide RNF-08 y los cambios que pidió el docente el 02/11/2026.

El 16/10/2026 el coordinador fijó el trabajo por módulos, con un plan de tareas del 17/10/2026 al 04/11/2026 (`specs/16-arquitectura-y-tecnologia.md`, decisiones 62 a 86). Este documento no le pone otro nombre a ese modo de trabajo.

El 02/11/2026 se replanificó la fase final (`specs/16-arquitectura-y-tecnologia.md`, decisión 90). INCOVSA todavía no entregó los accesos al servidor, al dominio ni a las cuentas de servicios (P-10, P-93 y P-94), y la reunión con el Ing. William Ambrossio está pendiente. Por eso esta versión 1.0 documenta el sistema tal como está en `develop` el 03/11/2026, y nada de ella depende de esa reunión. Lo que dependa de la reunión o de los accesos de INCOVSA (servidor, dominio y almacenamiento de imágenes en R2) se agrega en la versión 1.1, del 12/11/2026. Si no hay despliegue, la demostración del 04/11 es en local.

## Entregables del curso

Tabla: Fechas de entrega, según `specs/00-proyecto.md` {#tab:entregables}

| Fecha | Entregable | Valor |
|---|---|---|
| Lunes 21/09/2026 | Entregable 1. Definición, análisis y diseño inicial | 10 puntos |
| Miércoles 14/10/2026 | Entregable 2. Avance funcional y documentación técnica. El avance con la aplicación real se presenta el lunes 19/10/2026 | 10 puntos |
| 04/11, 09/11 y 12/11/2026 | Entregable 3, fase final. El miércoles 04/11, antes de las 9:50, entrega académica (sistema funcional y desplegado, repositorio actualizado y documentación también en el portal del curso) y prueba individual de conocimientos. El lunes 09/11, presentación previa de 8 minutos con otro docente. El jueves 12/11, entrega final a la empresa, con manuales y accesos | 30 puntos, 10 por fecha |

Si INCOVSA no entrega los accesos a tiempo, la demostración es en local. El despliegue, la capacitación y la transferencia de los accesos y del repositorio pasan a antes del 12/11/2026 (decisión 90).

`entregable-1/LEEME.md` dice que la v0.2, del 24/09/2026, todavía no incorpora las reuniones 4 y 5 ni los ajustes posteriores (P-77). Esta versión 1.0 incorpora esos cambios y los posteriores desde `specs/`.

## Cómo está armado este documento

Los capítulos 1 a 8 cubren la introducción, los actores y permisos, los requerimientos, las reglas de negocio, los casos de uso, el modelado y la arquitectura, los datos con la seguridad y la interfaz, y las conclusiones. Los anexos A a E cubren actas, evidencias, prototipos, la matriz de trazabilidad y la conversión. Los anexos F a J corresponden a otros documentos del curso (`specs/17-lineamientos-del-curso.md`).
