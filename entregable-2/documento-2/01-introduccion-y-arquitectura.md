# Introducción técnica

Este documento explica cómo está construida la solución del proyecto «Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA». Está dirigido a futuros desarrolladores y al personal técnico de INCOVSA. Su propósito es que una persona que no participó en el proyecto pueda comprender la arquitectura, instalar el sistema, mantenerlo y ampliarlo sin depender del equipo original.

## Alcance de esta versión

La versión 0.1 corresponde al Entregable No. 2. Describe el diseño con el que se construye la aplicación: arquitectura general, componentes, tecnologías y versiones, dependencias, estructura del repositorio y medidas de seguridad. También incluye los casos de prueba iniciales (Anexo F).

Las secciones que dependen del código y del esquema de base de datos definitivos (diagrama de clases, diagramas de secuencia, modelo entidad-relación, diccionario de datos y migraciones) se completan en la versión 0.2 de este documento. Las secciones de instalación, despliegue, mantenimiento y extensión del sistema se completan en el Entregable No. 3.

## Fuentes y relación con los demás documentos

- La especificación vigente del sistema está en la carpeta `specs/` del repositorio. Si este documento y `specs/` dicen cosas distintas, vale `specs/`.
- La aplicación se construye a partir del **prototipo de simulación** aprobado por el Ing. William Ambrossio (INCOVSA) y por el Ing. Manuel Rojas, con los cambios solicitados en la reunión del 29/09/2026. El prototipo es la referencia de diseño visual y de comportamiento.
- El Documento 1 (memoria general y especificación) contiene el análisis, los requerimientos, las reglas de negocio y los casos de uso. Este documento cita sus códigos: requerimientos funcionales del sitio (RF-SW-xx) y del sistema logístico (RF-SL-xx), requerimientos no funcionales (RNF-xx), reglas de negocio (RN-xx) y casos de uso (CU-xx).

## Componentes de la solución

La solución tiene dos componentes que conviven en una sola aplicación web:

1. **Sitio web corporativo e institucional autoadministrable.** Sitio público (Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto), panel administrativo para actualizar el contenido sin modificar el código, y área protegida de documentación interna (fichas técnicas, hojas de seguridad y certificados de análisis).
2. **Sistema de control logístico de bodega (picking).** Cinco módulos: Facturación (carga del archivo de Odoo y armado de envíos), Bodega (tablero de preparación), Ruta, Reportes y Configuración.

# Arquitectura general

La solución es **una sola aplicación web monolítica, organizada por módulos de dominio**, que se publica bajo el dominio de INCOVSA. El sitio público, el panel, la documentación interna y los cinco módulos del picking comparten el mismo servidor, la misma base de datos y la misma autenticación, pero cada módulo tiene su propio código de negocio.

## Estilo arquitectónico

Se eligió un **monolito modular en capas** por tres razones:

- **Tamaño del equipo y del sistema.** Una sola aplicación es más fácil de instalar, desplegar y mantener por una persona que no participó en el desarrollo (RNF-07). No hay servicios separados que coordinar.
- **Reglas de negocio compartidas.** La conversión de kilogramos a unidades, la verificación de permisos y sedes y la bitácora se usan desde varias pantallas. En un solo proyecto se escriben una vez y se prueban solas.
- **Renderizado en el servidor.** Next.js genera las páginas en el servidor. El sitio público se indexa bien en buscadores y los datos internos nunca salen del servidor sin pasar por la verificación de permisos.

## Capas

Tabla: Capas de la aplicación {#tab:capas}

| Capa | Responsabilidad | Tecnología |
|---|---|---|
| Presentación | Rutas, páginas y componentes de cada área: sitio público, panel del sitio, documentación interna y módulos del picking | Next.js 16 (App Router), React 19, Tailwind CSS y shadcn/ui con los tokens del design system aprobado |
| Primera barrera | Redirigir a la página de inicio de sesión a quien no tiene sesión | `proxy.ts` de Next.js 16 (antes llamado middleware) |
| Autenticación y autorización | Inicio de sesión, sesiones y verificación de sesión, permiso y sede **en cada operación del servidor** | Better Auth y la función `exigirPermiso` |
| Lógica de negocio | Reglas del sistema: conversión, lectura del archivo de Odoo, pedidos, preparación, ruta, contenido, solicitudes, usuarios y permisos, bitácora y reportes | Módulos de TypeScript en `src/modulos/`, validados con Zod |
| Acceso a datos | Consultas, transacciones y migraciones | Prisma 7 |
| Datos | Almacenamiento persistente | PostgreSQL 18, archivos del servidor y Cloudflare R2 |

La lógica de negocio no depende de las pantallas: la conversión, la lectura del archivo de Odoo y la verificación de permisos se comportan igual desde cualquier pantalla y se prueban de forma automática.

## Elementos de la arquitectura

Tabla: Elementos de la arquitectura {#tab:elementos}

| Elemento | Descripción |
|---|---|
| Frontend | Páginas de Next.js generadas en el servidor, con componentes de React para la interacción: arrastrar pedidos en Facturación, marcar líneas en Bodega y reordenar clientes en Ruta. El diseño es el del prototipo aprobado y se adapta a escritorio, tableta y teléfono (RNF-01) |
| Backend | Acciones del servidor (*server actions*) y rutas de la API de Next.js, que se ejecutan en Node.js 24. Toda operación pasa por la verificación de permisos antes de llamar a la lógica de negocio |
| Base de datos | PostgreSQL 18, con el esquema y las migraciones de Prisma |
| CMS o panel administrativo | Panel propio dentro de la misma aplicación. Permite editar el contenido institucional, las industrias, el catálogo informativo, las noticias, la información de contacto, la bandeja de solicitudes, los documentos internos y los usuarios del sitio, sin tocar el código (RF-SW-07) |
| Almacenamiento | Datos en PostgreSQL. Imágenes del sitio en Cloudflare R2. PDF internos en el sistema de archivos del servidor, fuera de la carpeta pública |
| Servicios externos | Cloudflare R2, el servidor de correo SMTP de la empresa y Odoo (solo un enlace y el archivo .xlsx que exporta el facturador). No hay conexión directa con Odoo |

## Comunicación entre componentes

- **Navegador y aplicación:** HTTPS en todo el sitio (RNF-12). Las pantallas llaman a acciones del servidor y a rutas de la API.
- **Tiempo real en Bodega (RNF-13):** cada pantalla del tablero mantiene abierta una conexión de eventos enviados por el servidor (SSE). Cuando alguien marca una línea, reordena o despacha un pedido, el servidor avisa «cambió la sede X» y cada pantalla vuelve a pedir el estado. Si la conexión se cae, la pantalla consulta cada pocos segundos hasta reconectarse.
- **Aplicación y base de datos:** Prisma, con consultas parametrizadas y transacciones. El envío de un pedido a bodega es una sola transacción (RNF-06).
- **Aplicación y Cloudflare R2:** API compatible con S3, con credenciales en variables de entorno.
- **Aplicación y correo:** SMTP de la empresa, solo para enviar las solicitudes del formulario de contacto.
- **Odoo:** el facturador exporta el archivo .xlsx desde Odoo y lo sube desde el navegador. La aplicación lo lee en el servidor.

## Seguridad

La seguridad se aplica en varias capas. El detalle de cada medida está en las secciones de autenticación, roles y permisos, manejo de archivos y manejo de errores.

Tabla: Medidas de seguridad de la arquitectura {#tab:seguridad}

| Riesgo | Medida |
|---|---|
| Acceso sin permiso | Cada operación del servidor verifica sesión, permiso y sede con una sola función, `exigirPermiso`. `proxy.ts` es solo una primera barrera: en 2025 se publicó una vulnerabilidad de Next.js (CVE-2025-29927) que permitía saltarse el middleware |
| Robo o adivinación de contraseñas | Contraseñas con scrypt (RNF-03), límite de intentos de inicio de sesión (RNF-15) y mensajes de error que no revelan si el usuario existe |
| Datos de entrada maliciosos | Todo lo que llega al servidor se valida con Zod (RNF-05). Solo se usan consultas parametrizadas de Prisma; no se arman consultas SQL uniendo textos |
| Archivos maliciosos | El .xlsx de Odoo, las imágenes y los PDF se validan por su contenido y no solo por la extensión; el servidor genera el nombre con que se guarda cada archivo |
| Inserción de código en las páginas (XSS) | El contenido escrito por los usuarios (noticias, solicitudes, nombres de clientes del archivo de Odoo) se muestra siempre escapado |
| Peticiones falsificadas (CSRF) | Las acciones del servidor de Next.js y las rutas de la API que cambian datos verifican el origen de la petición |
| Interceptación y suplantación del sitio | HTTPS con HSTS (RNF-12) y cabeceras de seguridad: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `frame-ancestors` (RNF-16) |
| Filtración de secretos | Claves y credenciales solo en variables de entorno, fuera del repositorio (RNF-10) |
| Dependencias vulnerables | Archivo de bloqueo, Dependabot, `npm audit` en cada pull request y revisión manual de SheetJS (RNF-16) |
| Pérdida de datos | Respaldos automáticos diarios fuera del servidor y prueba de restauración (RNF-09) |

# Diagrama de arquitectura

La {{fig:arquitectura}} muestra los elementos de la solución y cómo se comunican. Las flechas continuas son llamadas entre elementos; la línea discontinua hacia Odoo indica que no hay intercambio de datos directo.

![Diagrama de arquitectura](../figuras/figura-1-arquitectura.png){#fig:arquitectura}

- **Cliente:** cualquier navegador en escritorio, tableta o teléfono, y la TV o la tableta donde se proyecta el tablero de Bodega.
- **Aplicación web:** una sola aplicación de Next.js 16 que corre en Node.js 24. Toda petición pasa primero por `proxy.ts` y después por la verificación de sesión, permiso y sede de cada operación.
- **Servidor de la empresa:** la base de datos PostgreSQL 18 y los PDF internos, bajo el dominio de INCOVSA con HTTPS. El hosting definitivo lo define la empresa.
- **Servicios externos:** correo SMTP, Odoo y Cloudflare R2.

# Diagrama de componentes

La {{fig:componentes}} muestra los componentes de software y sus dependencias principales, en notación UML: cada línea discontinua con punta abierta significa «depende de». La {{tab:componentes}} lista todas las dependencias.

![Diagrama de componentes](../figuras/figura-2-componentes.png){#fig:componentes}

Tabla: Componentes y sus dependencias {#tab:componentes}

| Componente | Carpeta | Responsabilidad | Depende de |
|---|---|---|---|
| Sitio público | `src/app/(sitio)/` | Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto | contenido, solicitudes |
| Panel del sitio | `src/app/panel/` | Administración del contenido, de la bandeja de solicitudes y de los usuarios del sitio | contenido, solicitudes, usuarios |
| Documentación interna | `src/app/panel/documentos/` | Consulta, descarga y carga de FT, HS y COA | documentos |
| Facturación | `src/app/picking/facturacion/` | Carga del archivo de Odoo, tablero de pedidos facturados y opciones de envío | odoo, pedidos, catalogos |
| Bodega y tablero | `src/app/picking/bodega/` | Preparación, prioridad, marcado y despacho; tablero en pantalla completa | bodega, tiempo-real |
| Ruta | `src/app/picking/ruta/` | Rutas del piloto y registro de la entrega | ruta |
| Reportes | `src/app/picking/reportes/` | Despacho por producto, rutas realizadas y bitácora | reportes, bitacora |
| Configuración | `src/app/picking/configuracion/` | Productos, clientes, sectores, camiones y usuarios del picking | catalogos, usuarios |
| contenido | `src/modulos/contenido/` | Contenido institucional, industrias, catálogo informativo, noticias e información de contacto | almacenamiento (R2) |
| solicitudes | `src/modulos/solicitudes/` | Formulario de contacto, bandeja y estados de las solicitudes | correo (SMTP) |
| documentos | `src/modulos/documentos/` | Documentos internos y su descarga protegida | almacenamiento (archivos del servidor) |
| catalogos | `src/modulos/catalogos/` | Productos con su Peso de Conversión, clientes, sectores y camiones | — |
| odoo | `src/modulos/odoo/` | Lectura y validación del archivo .xlsx de Odoo | SheetJS, catalogos, pedidos |
| pedidos | `src/modulos/pedidos/` | Tablero de pedidos facturados, opciones de envío y envío a bodega | catalogos |
| bodega | `src/modulos/bodega/` | Líneas de preparación, prioridad, marcado y despacho | pedidos, conversion |
| ruta | `src/modulos/ruta/` | Rutas, orden de los clientes y entrega | pedidos |
| reportes | `src/modulos/reportes/` | Indicadores y exportaciones | pedidos, ruta, conversion, bitacora |
| conversion | `src/modulos/conversion/` | Conversión de kilogramos a unidades (RN-01) | — |
| autenticacion | `src/lib/` | Inicio de sesión y sesiones | Better Auth |
| permisos | `src/modulos/permisos/` | Verificación de sesión, permiso y sede (`exigirPermiso`) | usuarios |
| usuarios | `src/modulos/usuarios/` | Cuentas, roles, permisos, sedes y restablecimiento de contraseñas | — |
| bitacora | `src/modulos/bitacora/` | Registro de las operaciones (RN-39) | — |
| tiempo-real | `src/modulos/tiempo-real/` | Avisos SSE a las pantallas de Bodega | — |

Todos los módulos de dominio usan `permisos`, `bitacora` y el acceso a datos de Prisma. El sistema no tiene módulo de inventario: el inventario de todas las bodegas lo lleva Odoo (RN-40).

# Diagrama de despliegue

Esta sección se completa en el Entregable No. 3, cuando INCOVSA defina el hosting.
