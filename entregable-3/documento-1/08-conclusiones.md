# Conclusiones

La especificación 1.7, con corte del 16/10/2026, describe una sola aplicación para el sitio institucional y el picking de INCOVSA. El picking empieza cuando el pedido ya está facturado en Odoo. Facturación lee el archivo .xlsx. Bodega convierte los kilogramos a unidades con RN-01 y prepara. El despacho deja el pedido en Despachado o la ruta en En Ruta. La entrega de la ruta queda en Entregado. No hay paso de inventario.

El control de inventario salió del alcance el 29/09/2026, porque lo lleva Odoo. El Ing. Manuel Rojas aprobó esa exclusión. El coordinador lo informó el 16/10/2026 (P-58). Los códigos eliminados se conservan con estado Eliminado. No se presentan como funciones vigentes.

El acceso es por permisos de cada usuario. Los únicos roles predeterminados son Gerencia y Soporte. Ellos administran los usuarios de los dos sistemas y restablecen las contraseñas dentro del sistema. No hay correo saliente.

La conversión que INCOVSA validó el 23/09/2026 sigue en los 15 casos del anexo E. El Peso de Conversión llega en el archivo de Odoo desde el 13/10/2026.

El despliegue de producción está definido. Es Docker Compose en un VPS, con Caddy, una aplicación y PostgreSQL 18. Las imágenes van a R2. El primer despliegue está fechado el 02/11/2026. El VPS, el DNS y las cuentas de servicio siguen abiertos en `specs/19-pendientes.md`.

La prosa de la versión 0.2 y las actas de las reuniones 1 a 5 no están en el repositorio. Esas ausencias quedan marcadas en la introducción y en el anexo A. No se redactó un acta de reemplazo.

## Trabajo que sigue abierto

`specs/19-pendientes.md` es la lista de lo que falta definir o recibir. Al 17/10/2026, según el propio archivo, ya se resolvieron P-58, P-40, P-95, P-96 y P-97. No se repiten aquí. Lo que sigue es la lista abierta de ese archivo. No es un plan nuevo.

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
| P-10 | VPS. El Ing. William se comprometió a contratarlo (16/10/2026). Se le pide el acceso a más tardar el 28/10/2026. Falta confirmar esa fecha y las características de `specs/16` | P2 |
| P-93 | Quién administra el DNS de incovsa.com y si se puede pasar a Cloudflare. Se necesita a más tardar el 28/10/2026 | P2 |
| P-94 | Cuentas de servicios, a más tardar el 28/10/2026. Correo de INCOVSA para Cloudflare y el VPS, y la organización de GitHub a la que se transfiere el repositorio | P2 |
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
| P-77 | Actualizar el Documento 1 y los diagramas con las reuniones 4 y 5, y archivar las actas en Markdown de esas reuniones. La reunión 5 fue el 13/10/2026, no el 14/10/2026 | P2 |

La versión 0.3 de este documento alinea el texto y los diagramas con `specs/` 1.7. Las actas de las reuniones 4 y 5 siguen sin estar en el repositorio, así que P-77 no queda cerrado por este borrador.
