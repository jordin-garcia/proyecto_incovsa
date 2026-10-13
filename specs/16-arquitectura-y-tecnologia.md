# 16. Arquitectura, tecnología y forma de trabajo

## Arquitectura

- **Una sola aplicación web monolítica**, con renderizado en el servidor y organizada por módulos de dominio. Contiene el sitio público, el panel, la documentación interna y los cinco módulos del picking (Facturación, Bodega, Ruta, Reportes y Configuración), todo bajo incovsa.com.
- **Capas:**
  - presentación: rutas y vistas por área;
  - lógica de negocio: lectura del archivo de Odoo, conversión, pedidos, preparación, ruta, contenido, solicitudes, permisos y reportes;
  - acceso a datos: ORM y migraciones;
  - base de datos relacional.
- La lógica de conversión y la lectura del archivo de Odoo viven en la capa de negocio. Se comportan igual sin importar desde qué pantalla se llamen.
- Control de acceso: autenticación con sesión y **autorización en dos niveles** (12/10):
  - el intermediario (middleware) de Next.js revisa la sesión al entrar a cada área. Es **solo una primera barrera**;
  - **cada operación del servidor** (acciones del servidor, rutas de la API y descarga de PDF) vuelve a verificar la sesión, **los permisos del usuario** (29/09) y su sede (11/10) antes de leer o cambiar datos. Ver "Seguridad".

## Stack

La contraparte lo revisó y no tuvo objeción.

| Capa | Tecnología |
|---|---|
| Entorno de ejecución | Node.js 22 LTS |
| Framework | Next.js 15 (App Router) con TypeScript. Con los parches de seguridad al día: como mínimo **15.2.3**, que corrige CVE-2025-29927 (12/10) |
| Base de datos | PostgreSQL 16 |
| ORM y migraciones | Prisma |
| Autenticación | Auth.js con credenciales y sesiones; contraseñas con bcrypt |
| Permisos | Modelo propio de permisos por usuario en Prisma (29/09). Se verifican **en el servidor en cada operación**; el middleware de Next.js es solo una primera barrera (12/10) |
| Interfaz | Tailwind CSS y shadcn/ui, configurados con los tokens del design system del prototipo aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)) |
| Lectura de .xlsx | Librería para leer el archivo de Odoo en el servidor. Cuál, es una [DECISIÓN TÉCNICA] |
| Validación | Zod, en cliente y servidor |
| Correo | Nodemailer con la cuenta SMTP de la empresa (P-09) |
| Exportación de reportes | PDF y Excel, como en el prototipo aprobado ([10-picking-reportes.md](10-picking-reportes.md)) |
| Pruebas automatizadas | Vitest. **La conversión, la lectura del archivo de Odoo y la verificación de permisos y sedes deben tener pruebas obligatoriamente** (los movimientos de existencias ya no existen; permisos y sedes desde el 12/10) |
| Control de versiones | Git y GitHub, repositorio privado |

## Almacenamiento

| Qué | Dónde |
|---|---|
| Datos | PostgreSQL |
| Imágenes del sitio | **Cloudflare R2, plan gratuito** |
| PDF internos (FT, HS, COA) | Sistema de archivos del servidor, **fuera de la carpeta pública**, entregados por una ruta protegida que verifica **los permisos** del usuario (29/09). El nombre con que se guarda cada archivo lo genera el servidor; el nombre original solo se guarda como dato (12/10) |

## Servicios externos

| Servicio | Uso |
|---|---|
| Cloudflare R2 | Imágenes del sitio |
| SMTP de la empresa | Envío por correo de las solicitudes del formulario de contacto. **No** se usa para recuperar contraseñas (11/10) |
| Odoo | Un enlace al inicio de sesión. Además, Facturación **lee el archivo .xlsx que el facturador exporta de Odoo** (29/09). No hay conexión directa con Odoo |

No hay más integraciones. La integración directa con Odoo es a futuro y está fuera del alcance (29/09).

## Seguridad (12/10)

Medidas que el equipo adoptó el 12/10/2026 para que la aplicación sea segura y mantenible en el tiempo. Complementan RNF-03 a RNF-05, RNF-09, RNF-10, RNF-12, RNF-15 y RNF-16 ([15-requerimientos-no-funcionales.md](15-requerimientos-no-funcionales.md)).

### Autorización en el servidor

- **Toda operación del servidor verifica la sesión, el permiso y la sede** antes de leer o cambiar datos: acciones del servidor, rutas de la API, carga del archivo de Odoo, descarga de PDF y exportación de reportes.
- El **middleware** de Next.js se usa solo como primera barrera (redirigir a quien no tiene sesión). **No** es el único control: en 2025 se publicó una vulnerabilidad (CVE-2025-29927) que permitía saltárselo.
- La verificación vive en **una sola función de la capa de negocio** (por ejemplo, `exigirPermiso(usuario, permiso, sede)`), que usan todas las operaciones. Así no se duplica ni se olvida.
- El servidor **nunca confía** en lo que manda el navegador sobre el usuario: la sede, los permisos y el rol salen de la sesión y de la base de datos, no de la petición.
- Ocultar un botón en la pantalla **no** es un control de acceso; solo mejora la experiencia.

### Autenticación y sesiones

- Auth.js con credenciales y sesiones; contraseñas con bcrypt (RNF-03). No se programa un sistema de autenticación propio.
- Cookies de sesión `HttpOnly`, `Secure` y `SameSite=Lax`. La sesión se renueva al iniciar sesión.
- **Límite de intentos de inicio de sesión** (RNF-15): después de varios intentos fallidos seguidos, la cuenta o la dirección de origen se bloquea un tiempo. El número de intentos y el tiempo de bloqueo son una [DECISIÓN TÉCNICA]. Los intentos fallidos se registran en la bitácora (RN-39).
- El mensaje de error del inicio de sesión no dice si el usuario existe o si la contraseña es la incorrecta.
- El tiempo de expiración de las sesiones sigue pendiente (P-07).

### Entradas y archivos

- **Todo lo que llega al servidor se valida con Zod** (RNF-05): formularios, parámetros y el contenido del archivo de Odoo.
- Archivos subidos:
  - el .xlsx de Odoo, las imágenes y los PDF se validan por su **contenido**, no solo por la extensión (por ejemplo, que un PDF empiece realmente como PDF);
  - el servidor genera el nombre con que se guarda cada archivo, para que nadie pueda escribir fuera de la carpeta prevista.
- **Base de datos:** solo consultas de Prisma, que son parametrizadas. No se arman consultas SQL uniendo textos (no se usa `$queryRawUnsafe` con datos del usuario).
- **Contenido de los usuarios** (noticias, solicitudes, nombres de clientes del archivo de Odoo): se muestra siempre escapado. No se usa `dangerouslySetInnerHTML` con ese contenido.
- **Peticiones falsificadas (CSRF):** las acciones del servidor de Next.js verifican el origen; las rutas de la API que cambian datos también lo verifican.

### Cabeceras y transporte

- HTTPS en todo el sitio (RNF-12), con HSTS.
- Cabeceras de seguridad (RNF-16): `Content-Security-Policy` (que permita las imágenes de Cloudflare R2 y los mapas insertados de Google Maps, specs/05), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y protección contra que otro sitio inserte el nuestro en un marco (`frame-ancestors`).
- Los errores que ve el usuario no muestran detalles técnicos; el detalle queda solo en el registro del servidor.

### Secretos y dependencias

- Claves, contraseña de la base de datos, credenciales SMTP y de R2 solo en variables de entorno, fuera del repositorio (RNF-10).
- **Dependencias al día** (RNF-16): Dependabot de GitHub activado, `npm audit` en cada pull request y el archivo de bloqueo (`package-lock.json`) en el repositorio. Los parches de seguridad de Next.js, Auth.js y Prisma se aplican en cuanto salen.

### Respaldos

- Los respaldos de PostgreSQL y de los PDF del servidor son **automáticos** y se prueba la restauración (RNF-09). La frecuencia y cuántas copias se conservan son una [DECISIÓN TÉCNICA].

### Mantenibilidad

- Las reglas de negocio (conversión RN-01, lectura del archivo de Odoo, permisos y sedes, armado de pedidos) viven en módulos de la capa de negocio, separados de las pantallas. Se prueban solas y se podrán reutilizar cuando exista la conexión directa con Odoo.
- Pruebas automatizadas obligatorias de esas reglas (ver "Stack").

## Despliegue

- Hace falta un servidor capaz de ejecutar Node.js y PostgreSQL. Un hosting compartido tradicional (cPanel con PHP) no sirve.
- La contraparte iba a probar la compatibilidad del hosting actual; el resultado está pendiente (P-10).
- La empresa paga el hosting y el dominio.
- Dónde vive el entorno de pruebas del Entregable 2 está pendiente (P-11).

## Decisiones técnicas abiertas

Las resuelve el equipo y se registran aquí cuando se decidan.

| Id | Decisión |
|---|---|
| P-39 | Cómo se logra el tiempo real en Bodega (RNF-13): SSE, WebSocket o consulta periódica corta. Dónde se guarda el orden compartido y el marcado. Nota del 12/10: Next.js no trae WebSocket de fábrica; los SSE desde una ruta de la API con el entorno de Node.js, o la consulta periódica, funcionan sin un servidor adicional |
| — | Número de intentos fallidos de inicio de sesión antes del bloqueo y duración del bloqueo (RNF-15) |
| — | Frecuencia de los respaldos automáticos y cuántas copias se conservan (RNF-09) |
| P-42 | Qué pasa al eliminar un producto, cliente, sector, camión o **usuario** con historial (por ejemplo, eliminación lógica) |
| — | Librería de lectura de .xlsx y manejo de las filas de agrupación del export de Odoo |
| — | Cómo se representan los permisos y sedes de Gerencia y Soporte (rol especial o todo asignado) |
| — | Cómo se compara el rol "Piloto" (por ejemplo, sin distinguir mayúsculas) y el criterio para completar los Productos Recomendados |
| — | Cómo se guarda la bitácora de los dos sistemas para consultarla en Reportes (RN-39) |
| P-37 | Cómo se anonimizan las semillas que se suben al repositorio |
| — | Tipo numérico y precisión de las cantidades en kg (por ejemplo, `numeric` con 3 decimales) |
| — | Estructura de carpetas del repositorio (se documenta en el Documento 2) |
| — | Script de carga inicial desde el Excel maestro limpio |

## Forma de trabajo

### Git

- Ramas:
  - `main`: solo versiones entregadas;
  - `develop`: integración;
  - `feature/<modulo>-<descripcion>`: una por tarea;
  - `fix/<descripcion>`: correcciones.
- Todo entra a `develop` por pull request, que revisa Jordin (o otro integrante si el autor es Jordin). Nadie hace push directo a `main` ni a `develop`.
- Un pull request se aprueba si corre sin errores, cumple la tarea, no incluye credenciales ni archivos generados, y las migraciones corren desde cero.
- Commits en español con prefijo: `feat:`, `fix:`, `docs:`, `db:`, `test:`, `chore:`.
- Etiquetas por entregable: `v0.1-entregable1`, `v0.5-entregable2`, `v1.0-final`.
- El `.gitignore` excluye:
  - `.env*` (excepto `.env.example`);
  - `node_modules/`, `.next/`, `__pycache__/`;
  - los archivos subidos;
  - `docs/` (actas, propuesta y lineamientos);
  - `docs_incovsa/` (datos de la empresa);
  - archivos `~$*` de Office;
  - los .docx y .pdf de los entregables (`entregable-*/**/*.docx` y `*.pdf`);
  - las evidencias fotográficas del Anexo B (`entregable-*/figuras/evidencias/`), porque tienen fotografías de personas y de la empresa;
  - el HTML armado del prototipo de simulación (`entregable-1/prototipos/prototipo-simulacion-incovsa.html`), porque contiene datos reales de la empresa.

  La carpeta de archivos subidos se agrega al `.gitignore` cuando el proyecto base la defina.

### Qué va al repositorio

- **Sí:** código, migraciones, semillas anonimizadas, `.env.example`, README, `specs/`, diagramas y prototipos. Del prototipo de simulación se sube el código fuente (`entregable-1/prototipos/simulacion/`), **no** el HTML armado (`prototipo-simulacion-incovsa.html`), porque contiene datos reales de la empresa (RNF-10).
- **No:** actas, propuesta, lineamientos, datos de la empresa, documentos entregables .docx y .pdf, ni nada con datos personales. Estos se guardan en la carpeta local y en el Google Drive del equipo.

### Definición de "terminado" para una tarea

1. El código está en `develop`, entrado por un pull request aprobado.
2. Si cambió la base de datos, las migraciones y semillas están actualizadas.
3. Los casos de prueba del módulo están escritos y ejecutados, con evidencia.
4. La sección correspondiente del Documento 2 y del manual está redactada.
5. Esta carpeta `specs/` está actualizada si cambió alguna regla.
