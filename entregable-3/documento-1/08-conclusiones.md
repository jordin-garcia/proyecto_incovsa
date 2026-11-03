# Conclusiones

La especificación 1.7, con los cambios hasta el 03/11/2026, describe una sola aplicación para el sitio institucional y el picking de INCOVSA. Esta versión 1.0 documenta el sistema tal como está en `develop` el 03/11/2026. El picking empieza cuando el pedido ya está facturado en Odoo. Facturación lee el archivo .xlsx. Bodega convierte los kilogramos a unidades con RN-01 y prepara. El despacho deja el pedido en Despachado o la ruta en En Ruta. La entrega de la ruta queda en Entregado. Cada día, una prueba automática recorre ese flujo completo, hasta el reporte. No hay paso de inventario.

El control de inventario salió del alcance el 29/09/2026, porque lo lleva Odoo. El Ing. Manuel Rojas aprobó esa exclusión. El coordinador lo informó el 16/10/2026 (P-58). Los códigos eliminados se conservan con estado Eliminado. No se presentan como funciones vigentes.

El acceso es por permisos de cada usuario. Los únicos roles predeterminados son Gerencia y Soporte. Ellos administran los usuarios de los dos sistemas y restablecen las contraseñas dentro del sistema. No hay correo saliente.

La conversión que INCOVSA validó el 23/09/2026 sigue en los 15 casos del anexo E. Cada caso es una prueba automatizada. El Peso de Conversión llega en el archivo de Odoo desde el 13/10/2026.

La seguridad se revisó el 29/10/2026 contra OWASP ASVS 5.0, nivel 2, y con OWASP ZAP. Las correcciones del 30/10/2026 endurecieron las cookies, las cabeceras, las sesiones, el cifrado de las contraseñas y el registro del servidor. Los riesgos que el coordinador aceptó están en el capítulo de seguridad.

La arquitectura de despliegue está definida y su configuración está en el repositorio. Es Docker Compose en un VPS, con Caddy, una aplicación y PostgreSQL 18. Las imágenes irán a R2. El despliegue todavía no se hizo. Depende del VPS, del DNS y de las cuentas de servicio que INCOVSA no ha entregado (P-10, P-93 y P-94). Mientras tanto, la demostración del 04/11/2026 es en local, como lo aceptó el docente (`specs/16`, decisión 90).

Las actas de las reuniones con la contraparte están en el anexo A.

## Trabajo que sigue

La decisión 90 de `specs/16` reparte la fase final en tres fechas. El 04/11/2026 se entrega esta versión 1.0 y se hace la prueba individual. El 09/11/2026 es la presentación previa con otro docente. El 12/11/2026 es la entrega final a la empresa. Esta versión no depende de la reunión pendiente con el Ing. William Ambrossio. Lo que salga de esa reunión, del despliegue y de la capacitación va en la versión 1.1 de los documentos, del 12/11/2026.

Tabla: Trabajo previsto después del 04/11/2026 {#tab:trabajo-previsto}

| Trabajo | Cuándo |
|---|---|
| Convergencia final de `specs/` y el prototipo con `develop` | Después del 04/11/2026 |
| Rechazo de contraseñas fáciles de adivinar y confirmación de la propia contraseña al restablecer la de una cuenta de Gerencia o Soporte (`specs/03`) | Después del 04/11/2026 y antes del despliegue |
| Documentación de los riesgos de seguridad aceptados en `specs/16` | Después del 04/11/2026 y antes del despliegue |
| Integración de `develop` en `main` y primer despliegue en el VPS | En cuanto INCOVSA entregue los accesos, antes del 12/11/2026 |
| Capacitación al personal de INCOVSA | Antes del 12/11/2026 |
| Transferencia de los accesos y del repositorio a INCOVSA | Antes del 12/11/2026 |
| Versión 1.1 de los documentos y anexos | 12/11/2026 |

Quedan fuera del alcance, como trabajo futuro, la integración directa con Odoo (`specs/16`) y las funciones de seguridad que el coordinador aceptó no implementar antes de la entrega, como MFA o el cambio de la contraseña propia.

## Pendientes abiertos

`specs/19-pendientes.md` es la lista de lo que falta definir o recibir. Ya se resolvieron P-58, P-40, P-95, P-96, P-97 y P-98. No se repiten aquí. Lo que sigue es la lista abierta de ese archivo. No es un plan nuevo.

### Con INCOVSA

Tabla: Pendientes con INCOVSA {#tab:pendientes-incovsa}

| Id | Pendiente | Prioridad |
|---|---|---|
| P-91 | Archivo de Odoo con todos los datos. En el archivo de ejemplo, 82 de 205 líneas traen el Peso de Conversión en 0 (46 de 79 pedidos facturados), y con RN-50 esos pedidos facturados no se cargan. El 16/10/2026 el coordinador informó que se compartirá en los próximos días | P1 |
| P-90 | `SODA ASH (CHI-SAC/0040KG)` trae Peso de Conversión 25 en sus 12 líneas, aunque su nombre dice 40 kg. El sistema usa 25, como viene (RN-37). Falta confirmar con INCOVSA que ese dato de Odoo es correcto | P2 |
| P-92 | Cuenta o carpeta de Google Drive para la documentación interna, y cómo se compartirá | P2 |
| P-01 | Identificación de los 3 camiones de Quetzaltenango | P2 |
| P-02 | Nombres y cantidad de pilotos | P2 |
| P-06 | URL de inicio de sesión de Odoo | P2 |
| P-07 | Tiempo de expiración de las sesiones | P2 |
| P-08 | Usuario administrador inicial | P2 |
| P-10 | VPS. El Ing. William se comprometió a contratarlo (16/10/2026). Se pidió el acceso a más tardar el 28/10/2026 y no se había entregado al 03/11/2026. Falta confirmar que cumple las características de `specs/16` | P2 |
| P-93 | Quién administra el DNS de incovsa.com y si se puede pasar a Cloudflare. Se pidió a más tardar el 28/10/2026 | P2 |
| P-94 | Cuentas de servicios, pedidas a más tardar el 28/10/2026. Correo de INCOVSA para Cloudflare y el VPS, y la organización de GitHub a la que se transfiere el repositorio | P2 |
| P-17 | Datos de los productos públicos | P2 |
| P-18 | Logotipo vectorial, códigos de color exactos y tipografía | P2 |
| P-19 | Texto de la historia de la empresa y sus imágenes, y las imágenes de los 5 valores | P2 |
| P-21 | Descripciones definitivas e imágenes en alta resolución de las 9 industrias | P2 |
| P-22 | Horarios de Quetzaltenango y Guatemala | P2 |
| P-23 | Contenido inicial de Noticias | P2 |
| P-38 | Navegadores que usa la empresa | P3 |
| P-03 | Personas de la capacitación, quién recibe las credenciales y quién probará el panel sin ayuda del equipo | P3 |

### Con el docente

Tabla: Pendientes con el docente {#tab:pendientes-docente}

| Id | Pendiente | Prioridad |
|---|---|---|
| P-31 | Retroalimentación del Entregable 1 | P1 |
| P-46 | Si para el Entregable 2 bastan el diagrama de actividades del flujo principal y el de estados, o si pide los 4 de la sección 3.3 | P2 |

P-46 sigue abierto. Este documento trae el flujo principal y los estados. No agrega los otros diagramas de esa sección, porque `specs/19` no dice que el docente ya los haya exigido.

### Del equipo

Tabla: Pendientes del equipo {#tab:pendientes-equipo}

| Id | Pendiente | Prioridad |
|---|---|---|
| P-04 | Archivar la evidencia del cuestionario del 9 al 11/09/2026, la reunión del 18/09/2026, las aclaraciones del 19 al 20/09/2026 y las respuestas del 23 al 24/09/2026 | P1 |

Esta versión 1.0 alinea el texto y los diagramas con `specs/` y reúne en el anexo A las actas de las cinco reuniones. Con eso se resolvió P-77 el 03/11/2026 (`specs/18`).
