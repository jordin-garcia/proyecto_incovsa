# Documento de requerimientos — RF y RNF

**Proyecto:** Sitio web institucional autoadministrable y Sistema de Control Logístico de Bodega INCOVSA  
**Responsable:** Carlos Hugo Escobar Gómez  
**Apoyo:** José Daniel Cifuentes Carrascosa  
**Versión:** 0.1  
**Fecha:** 14/09/2026  
**Tarea del plan:** 1.1  
**Fuentes:** sección 3 del `PLAN_DE_PROYECTO.md`; actas de reuniones 27/08 y 04/09; propuesta INCOVSA; lineamientos del docente.  
**Pendiente de incorporar:** acuerdos de la reunión del 11/09 (acta Anexo A en Drive) y validaciones de la visita del 17/09 (tarea 1.11).

### Convención de códigos

| Prefijo | Significado |
|---|---|
| RF-SW-xx | Requerimiento funcional — Sitio web / CMS |
| RF-SL-xx | Requerimiento funcional — Sistema logístico |
| RNF-xx | Requerimiento no funcional |

Cada RF incluye: código, enunciado, origen, prioridad (Alta/Media), criterios de aceptación iniciales y trazabilidad tentativa al módulo.

---

## 1. Requerimientos funcionales — Sitio web y CMS

| Código | Enunciado | Origen | Prioridad | Criterios de aceptación iniciales | Módulo |
|---|---|---|---|---|---|
| RF-SW-01 | El sistema debe mostrar una página de inicio con información institucional y noticias publicadas. | Reunión 2 | Alta | Existe ruta de inicio; muestra bloques institucionales y listado de noticias vigentes. | Sitio público |
| RF-SW-02 | El sistema debe exponer el apartado “Quiénes somos” con historia, misión, visión y valores administrables. | Propuesta, Lineamientos | Alta | Los textos se editan desde el CMS sin cambiar código; se reflejan en el sitio. | CMS / Sitio |
| RF-SW-03 | El sistema debe presentar las industrias atendidas con navegación por industria (no en barra superior horizontal). | Propuesta, Reunión 2 | Alta | Hay listado/navegación de industrias conforme al criterio del Ing. William; cada industria enlaza a su contenido. | Sitio |
| RF-SW-04 | El sistema debe ofrecer un catálogo informativo de productos por industria, sin e-commerce y sin precios; al cliente se muestra nombre, origen y presentación en kg; no se muestra el lote. | Propuesta, Reunión 2 | Alta | Catálogo filtrable por industria; no aparecen precios ni lotes. | Sitio / Catálogo |
| RF-SW-05 | El sistema debe mostrar el detalle de producto con presentación, origen, manejo, almacenamiento, humedad, tipo y restricciones. | Reunión 2 | Alta | La ficha pública incluye los campos definidos; campos vacíos no rompen la vista. | Sitio |
| RF-SW-06 | El sistema debe permitir enviar solicitudes, quejas o reclamos mediante un formulario de contacto, con almacenamiento y/o envío por correo, y mostrar un correo de contacto visible. | Propuesta, Reunión 2 | Alta | Validación de campos; registro en BD y/o correo; mensaje de confirmación al usuario. | Contacto |
| RF-SW-07 | El sistema debe proveer un panel administrativo (CMS) para actualizar sin código: información institucional, historia/misión/visión/valores, imágenes, industrias, catálogo, noticias e información de contacto. | Propuesta, Lineamientos | Alta | CRUD de los contenidos listados; cambios visibles en el sitio tras guardar/publicar. | CMS |
| RF-SW-08 | El sitio público y el panel deben ser responsive en escritorio, tableta y móvil. | Propuesta, Lineamientos | Alta | Layout usable en anchos típicos (móvil, tableta, escritorio) sin pérdida de funciones críticas. | Frontend |
| RF-SW-09 | Todas las plataformas deben compartir dominio e identidad visual; el acceso al sistema logístico se realiza desde el sitio (ingreso de personal). | Propuesta, Reunión 2 | Alta | Existe punto de ingreso autenticado hacia logística/admin desde el sitio corporativo. | Auth / Sitio |
| RF-SW-10 | El sistema debe ofrecer un área protegida de documentación interna (fichas técnicas, hojas de seguridad, certificados) con acceso según rol, incluyendo un rol general de documentación. | Propuesta, Reunión 2 | Alta | Solo usuarios autenticados con permiso ven/descargan documentos; carga desde panel. | Docs internas |
| RF-SW-11 | El sitio debe permitir mantenimiento sencillo e intuitivo del contenido por personal no técnico. | Reunión 2 | Media | Operaciones CMS principales se completan sin editar código ni base de datos a mano. | CMS |
| RF-SW-12 | El sistema debe permitir recuperación de contraseña para usuarios del panel. | Lineamientos (Doc. 3) | Alta | Flujo de solicitud y restablecimiento con validación; no revela si el correo existe de forma insegura. | Auth |
| RF-SW-13 | El CMS debe permitir la gestión de usuarios del panel (alta, edición, desactivación) según permisos de administrador. | Lineamientos / rol del equipo | Alta | Solo roles autorizados gestionan usuarios; se asignan roles. | Auth / CMS |
| RF-SW-14 | El sistema debe permitir publicar, editar y despublicar noticias en el inicio del sitio. | Alcance consolidado | Media | Noticia publicada aparece en inicio; despublicada deja de mostrarse. | Noticias |

---

## 2. Requerimientos funcionales — Sistema logístico

| Código | Enunciado | Origen | Prioridad | Criterios de aceptación iniciales | Módulo |
|---|---|---|---|---|---|
| RF-SL-01 | El sistema debe gestionar productos con SKU único e irrepetible, origen y presentaciones. | Propuesta, Reunión 2, Lineamientos | Alta | No se permiten SKU duplicados; producto asocia origen y una o más presentaciones. | Productos |
| RF-SL-02 | El sistema debe gestionar presentaciones y equivalencias kg → unidades por producto. | Propuesta, Lineamientos | Alta | Cada presentación declara kg por unidad; equivalencias consultables y editables. | Presentaciones |
| RF-SL-03 | El sistema debe convertir kilogramos facturados a unidades de bodega según la presentación, aplicando reglas de cantidades no exactas y redondeo aprobadas por INCOVSA. | Propuesta, Lineamientos | Alta | Casos de prueba validados (Anexo E) producen el resultado esperado. | Conversión |
| RF-SL-04 | El sistema debe manejar lotes: crear un lote en cada ingreso; el lote diferencia precio; salidas respetan FIFO. | Reunión 2 | Alta | Entrada crea lote; salida descuenta del lote más antiguo con existencia. | Lotes / Inventario |
| RF-SL-05 | El sistema debe controlar inventario en tiempo real (entradas, salidas, existencias) por producto, presentación, lote y bodega; recepción convertible a kg; venta en lb/kg/galón trabajada internamente en kg. | Propuesta, Reunión 2 | Alta | Existencias coherentes tras movimientos; conversiones de unidad de compra/venta a kg documentadas. | Inventario |
| RF-SL-06 | El sistema debe controlar pedidos de venta facturados pendientes de despacho con estados: pendiente, en preparación, despachado, en ruta. | Propuesta | Alta | Pedido cambia de estado según reglas; historial de cambios consultable. | Pedidos |
| RF-SL-07 | El sistema debe generar automáticamente el picking (unidades a preparar por factura/cliente), listar pedidos a sacar y guardar el recorrido. | Propuesta, Reunión 2 | Alta | A partir de pedidos facturados se generan líneas de picking en unidades; el recorrido queda persistido. | Picking |
| RF-SL-08 | El sistema debe permitir la preparación de pedidos con cambio de estado y registro de quién y cuándo. | Lineamientos | Alta | Al preparar se registra usuario y marca temporal; estado actualizado. | Preparación |
| RF-SL-09 | El sistema debe ofrecer un tablero de proyección del picking/preparación para TV o tableta, permitiendo asignar prioridad diaria. | Propuesta, Reunión 2 | Alta | Vista legible a distancia; prioridad del día editable desde el dispositivo autorizado. | Tablero |
| RF-SL-10 | El sistema debe gestionar vehículos con capacidad mínima y máxima de carga. | Reunión 2 | Alta | CRUD de vehículos; capacidades numéricas obligatorias. | Vehículos |
| RF-SL-11 | El sistema debe controlar la carga de productos/cantidades por camión sin exceder la capacidad máxima. | Propuesta, Reunión 2 | Alta | El sistema rechaza o advierte cargas que superen el máximo. | Carga |
| RF-SL-12 | El sistema debe registrar despachos y la cantidad de rutas realizadas por día. | Propuesta | Alta | Despacho vinculado a pedido/vehículo/ruta; conteo diario disponible. | Despacho / Rutas |
| RF-SL-13 | El sistema debe generar el reporte diario de kilogramos y sacos despachados y demás reportes de despacho acordados, exportables. | Propuesta, Lineamientos | Media | Reporte diario filtrable por fecha/sede; exportación PDF/Excel. | Reportes |
| RF-SL-14 | El sistema debe gestionar usuarios y roles operativos (facturador, despacho, bodega, envío, gerencia — lista por confirmar); cada sede ve solo lo suyo a nivel operativo; gerencia ve todo. | Reunión 2, Lineamientos | Alta | Middleware/permisos restringen por rol y sede; gerencia sin restricción de sede. | Auth / Permisos |
| RF-SL-15 | El sistema debe operar para dos empresas (INCOVSA e Inquiserca) que comparten productos según la logística, con tres bodegas que ven solo lo propio. | Reunión 2 | Alta | Datos filtrados por empresa/sede según el usuario; productos compartidos según regla acordada. | Multi-empresa |
| RF-SL-16 | El sistema debe mantener bitácora/historial de movimientos de inventario, preparación, cambios de estado, cargas y despachos. | Lineamientos | Alta | Eventos relevantes quedan registrados con actor, fecha y detalle. | Bitácora |
| RF-SL-17 | El sistema debe permitir el ingreso de pedidos facturados mediante el mecanismo acordado con INCOVSA (integración Odoo, importación de archivo o registro manual). | Decisión pendiente A1 | Alta | Existe al menos un mecanismo operable documentado; si no hay Odoo, importación/manual cubren el flujo. | Pedidos |

---

## 3. Requerimientos no funcionales

| Código | Enunciado | Origen | Prioridad | Criterios / métrica inicial |
|---|---|---|---|---|
| RNF-01 | El sistema debe ser responsive y usable en escritorio, tableta y móvil. | Propuesta, Lineamientos | Alta | Flujos críticos completables en los tres tipos de dispositivo. |
| RNF-02 | El sistema debe restringir el acceso a rutas de panel, logística, tablero y documentación interna mediante autenticación y autorización por rol/sede/empresa. | Lineamientos, alcance | Alta | Usuario no autenticado o sin permiso recibe denegación; no se exponen datos de otras sedes. |
| RNF-03 | Las contraseñas deben almacenarse con hash seguro (p. ej. bcrypt); las sesiones deben poder cerrarse. | Stack / seguridad | Alta | No se almacenan contraseñas en texto plano; existe cierre de sesión. |
| RNF-04 | Las entradas de formularios y APIs deben validarse en servidor (p. ej. Zod). | Lineamientos cap. 6.5 | Alta | Entradas inválidas se rechazan con mensaje claro. |
| RNF-05 | La carga de archivos debe validar tipo y tamaño; los documentos internos no se sirven desde una carpeta pública abierta. | Alcance docs internas | Alta | Solo tipos permitidos; descarga vía ruta protegida. |
| RNF-06 | El esquema de base de datos debe versionarse con migraciones reproducibles desde cero. | Lineamientos | Alta | `migrate` desde vacío crea el esquema esperado. |
| RNF-07 | El entorno de desarrollo debe documentarse (variables de ejemplo, dependencias, comandos). | Documento 5 / README | Alta | Un integrante nuevo puede levantar el entorno con el README y `.env.example`. |
| RNF-08 | El sistema debe usar tipos numéricos exactos para kilogramos y conversiones. | Stack (PostgreSQL numeric) | Alta | No se usan flotantes binarios para cantidades de inventario/conversión. |
| RNF-09 | El sitio público debe priorizar rendimiento percibido (renderizado adecuado, assets optimizados). | Reunión 2 (ágil/ligero) | Media | Páginas públicas principales cargan sin bloqueos evidentes en red típica. |
| RNF-10 | Debe existir procedimiento de respaldo y restauración de base de datos, archivos y configuración. | Rol DevOps / Doc. 5 | Alta | Respaldo documentado; prueba de restauración con evidencia (Entregable 3). |
| RNF-11 | El despliegue de producción debe usar HTTPS. | Plan de despliegue | Alta | Certificado válido en el dominio de producción. |
| RNF-12 | El código no debe incluir credenciales; los secretos viven en variables de entorno. | Flujo Git / seguridad | Alta | `.env` en `.gitignore`; solo `.env.example` en el repo. |
| RNF-13 | Las reglas de conversión deben estar aisladas y cubiertas con pruebas automatizadas. | Riesgos del plan | Alta | Suite de pruebas con casos del Anexo E en verde. |
| RNF-14 | La interfaz del tablero de bodega debe ser legible a distancia (alto contraste / tipografía grande). | Propuesta TV/tableta | Media | Personal de bodega puede leer estados sin acercarse a la pantalla. |

---

## 4. Fuera de alcance (explícito)

| Código | Exclusión | Condición |
|---|---|---|
| FA-01 | Comercio electrónico y precios en el sitio | Confirmado |
| FA-02 | Planificación de rutas en mapa (Propuesta 2) | Confirmado |
| FA-03 | Mantenimiento y combustible de flota (Propuesta 3) | Confirmado |
| FA-04 | Cálculo de costos logísticos | La empresa evalúa costos con la herramienta entregada |
| FA-05 | Integración con Odoo | **Por decidir** (A1). Si no se integra, documentar como fuera de alcance y usar importación/manual (RF-SL-17) |

---

## 5. Actores (versión inicial)

| Actor | Descripción |
|---|---|
| Visitante | Usuario no autenticado del sitio público |
| Administrador de contenido | Gestiona CMS y, según permiso, noticias/documentos |
| Rol documentación | Accede a documentación interna de productos |
| Facturador | Opera pedidos facturados / ingreso según mecanismo acordado |
| Personal de bodega | Picking, preparación, tablero |
| Despacho / envío | Carga, despacho, rutas |
| Gerencia | Visibilidad multi-sede |
| Administrador del sistema | Usuarios, roles, configuración |
| Sistema externo (Odoo) | Posible fuente de pedidos (pendiente A1) |

---

## 6. Matriz de trazabilidad inicial (extracto)

| Requerimiento | Caso de uso tentativo | Entregable donde se valida |
|---|---|---|
| RF-SW-01..05, 08, 09 | CU-SW — Navegar sitio / consultar catálogo | E1 prototipos; E2 sitio |
| RF-SW-06 | CU-SW — Enviar solicitud de contacto | E2 |
| RF-SW-07, 11, 13, 14 | CU-SW — Administrar contenido / noticias / usuarios | E2 |
| RF-SW-10 | CU-SW — Consultar/cargar documentación interna | E2–E3 |
| RF-SW-12 | CU-SW — Recuperar contraseña | E2 |
| RF-SL-01..05 | CU-SL — Gestionar productos, equivalencias, inventario | E2 |
| RF-SL-03, RNF-13 | CU-SL — Convertir kg a unidades | E1 reglas; E2 pruebas |
| RF-SL-06..09 | CU-SL — Pedidos, picking, preparación, tablero | E2 |
| RF-SL-10..13 | CU-SL — Carga, despacho, rutas, reportes | E3 |
| RF-SL-14..16, RNF-02 | CU-SL — Autenticación, permisos, bitácora | E2–E3 |

---

## 7. Pendientes que afectan esta versión 0.1

1. Incorporar aclaraciones del acta del **11/09** (A1–A5, C7, C11, etc.).
2. Ajustar RF-SL-03, RF-SL-06, RF-SL-07 y RF-SL-17 tras la **visita del 17/09** (tarea 1.11).
3. Confirmar lista definitiva de roles (A5) y nombres comerciales (C11).
4. Pasar este contenido al capítulo 2 del Documento 1 (Word, Drive) — tarea 1.15.

---

## Control de versiones

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 14/09/2026 | Carlos Hugo Escobar Gómez | Primera redacción codificada a partir de la sección 3 del plan |
