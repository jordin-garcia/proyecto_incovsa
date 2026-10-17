# 19. Pendientes

Al resolver un pendiente: se actualiza el archivo afectado, se registra en [18-historial-de-decisiones.md](18-historial-de-decisiones.md) y se elimina de esta lista.

**Prioridad:** P1 = bloquea el diseño de la base de datos o el desarrollo; P2 = antes del Entregable 3 (04/11) y necesario para desarrollar; P3 = antes del Entregable 3 (04/11).

Las dudas sobre los cambios de la reunión 5 (13/10/2026) las resolvió el coordinador el 14/10/2026 ([18-historial-de-decisiones.md](18-historial-de-decisiones.md)). El 16/10/2026 se resolvió P-58, se agregaron P-93 a P-96 y se resolvieron P-95 y P-96. Con el plan de desarrollo (`plan/`) se resolvió P-40 y se agregó P-97.

## Con INCOVSA

| Id | Pendiente | Prioridad |
|---|---|---|
| P-91 | **Archivo de Odoo con todos los datos.** El Ing. William se comprometió el 13/10 a entregar el archivo con todos los datos de las columnas que usa el sistema. En el archivo de ejemplo, 82 de 205 líneas traen el Peso de Conversión en 0 (46 de 79 pedidos facturados), y con RN-50 esos pedidos facturados no se cargan. El 16/10 el coordinador informó que se compartirá en los próximos días | P1 |
| P-90 | En el archivo de ejemplo, `SODA ASH (CHI-SAC/0040KG)` trae Peso de Conversión 25 en sus 12 líneas, aunque su nombre dice 40 kg. El sistema usa 25, como viene (RN-37). Confirmar con INCOVSA que ese dato de Odoo es correcto | P2 |
| P-92 | **Google Drive de la documentación interna:** cuenta o carpeta de Google Drive donde INCOVSA guardará los documentos técnicos, y cómo los compartirá (solo con cuentas de la empresa y con la descarga deshabilitada para quien solo puede ver), porque de eso depende la protección de los documentos ([05](05-sitio-web.md)) | P2 |
| P-01 | Identificación de los 3 camiones de Quetzaltenango | P2 |
| P-02 | Nombres y cantidad de pilotos | P2 |
| P-06 | URL de inicio de sesión de Odoo | P2 |
| P-07 | Tiempo de expiración de las sesiones | P2 |
| P-08 | Usuario administrador inicial | P2 |
| P-10 | **VPS.** El Ing. William se comprometió a contratarlo (16/10). Se le pide el acceso **a más tardar el 28/10** ([16](16-arquitectura-y-tecnologia.md), decisión 73). Falta confirmar esa fecha y confirmar que cumple las características de [16](16-arquitectura-y-tecnologia.md) (Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM, 80 GB SSD, IP fija y SSH con llave) | P2 |
| P-93 | **DNS de incovsa.com:** quién lo administra y si se puede pasar a Cloudflare (plan gratuito), para servir las imágenes desde `imagenes.incovsa.com` ([16](16-arquitectura-y-tecnologia.md), decisión 32). Se necesita a más tardar el 28/10 (decisión 73) | P2 |
| P-94 | **Cuentas de servicios** (a más tardar el 28/10, decisión 73): correo de INCOVSA con el que se crean las cuentas de Cloudflare y del VPS, y la cuenta u organización de GitHub de INCOVSA a la que se transfiere el repositorio ([16](16-arquitectura-y-tecnologia.md), decisión 33) | P2 |
| P-17 | Datos de los productos públicos: nombre, descripción, presentación, países de origen e industrias de cada uno | P2 |
| P-18 | Logotipo vectorial, códigos de color exactos y tipografía | P2 |
| P-19 | Texto de la historia de la empresa y sus imágenes (opcionales), y las imágenes de los 5 valores | P2 |
| P-21 | Descripciones definitivas e imágenes en alta resolución de las 9 industrias | P2 |
| P-22 | Horarios de Quetzaltenango y Guatemala (desde el 13/10 ya no hace falta el correo que recibía las solicitudes) | P2 |
| P-23 | Contenido inicial de Noticias | P2 |
| P-38 | Navegadores que usa la empresa | P3 |
| P-03 | Personas que recibirán la capacitación, quién recibe las credenciales y quién probará el panel sin ayuda del equipo | P3 |

## Con el docente

| Id | Pendiente | Prioridad |
|---|---|---|
| P-31 | Retroalimentación del Entregable 1 | P1 |
| P-46 | ¿Para el Entregable 2 bastan el diagrama de actividades del flujo principal y el de estados, o pide los 4 de la sección 3.3? | P2 |

## Del equipo

| Id | Pendiente | Prioridad |
|---|---|---|
| P-04 | Archivar la evidencia (correos o WhatsApp) del cuestionario del 09–11/09, la reunión del 18/09, las aclaraciones del 19–20/09 y las respuestas del 23–24/09 | P1 |
| P-97 | **Productos de cada industria en el sitio.** El prototipo muestra en cada industria una lista fija de productos tomada de Google Sites (`base.js` › `INDUSTRIAS`), pero el modelo de datos no la guarda y el panel no permite editarla. Opciones: **(a)** mostrar los productos públicos del catálogo que tienen esa industria (la relación N:M que ya existe), y así se administra desde el Catálogo; **(b)** guardar la lista como texto de cada industria y agregar ese campo en el panel de Industrias. Recomendación del equipo: (a). Lo necesita DM-03 (18/10) | P1 |
| P-77 | Actualizar el Documento 1 y los diagramas con los cambios de las reuniones 4 y 5, y archivar las actas en Markdown de las reuniones 4 y 5 como las de las reuniones 1 a 3. Las notas de la reunión 5 dicen "Fecha: 14 de octubre de 2026", pero la reunión fue el 13/10/2026 (lo confirman la captura de la reunión y el coordinador): corregirlo en el acta | P2 |
