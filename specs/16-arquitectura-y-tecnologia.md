# 16. Arquitectura, tecnología y forma de trabajo

## Arquitectura

- **Una sola aplicación web monolítica**, con renderizado en el servidor y organizada por módulos de dominio. Contiene el sitio público, el panel, la documentación interna y los cinco módulos del picking (Facturación, Bodega, Ruta, Reportes y Configuración), todo bajo incovsa.com.
- **Capas:**
  - presentación: rutas y vistas por área;
  - lógica de negocio: lectura del archivo de Odoo, conversión, rutas y pedidos, preparación, ruta, contenido, documentación, solicitudes, permisos y reportes;
  - acceso a datos: ORM y migraciones;
  - base de datos relacional.
- La lógica de conversión y la lectura del archivo de Odoo viven en la capa de negocio. Se comportan igual sin importar desde qué pantalla se llamen.
- Control de acceso: autenticación con sesión y **autorización en dos niveles** (12/10):
  - el intermediario de Next.js (`proxy.ts`, antes llamado middleware) revisa la sesión al entrar a cada área. Es **solo una primera barrera**;
  - **cada operación del servidor** (acciones del servidor, rutas de la API y consulta de la documentación interna) vuelve a verificar la sesión, **los permisos del usuario** (29/09) y su sede (11/10) antes de leer o cambiar datos. Ver "Seguridad".

## Stack

La contraparte lo revisó y no tuvo objeción.

| Capa | Tecnología |
|---|---|
| Entorno de ejecución | **Node.js 24 LTS** (12/10; antes 22). **(17/10)** Con **npm 11.19** o posterior, y las dependencias se instalan con `npm ci` |
| Framework | **Next.js 16** (App Router) con TypeScript, en su versión más reciente con los parches de seguridad al día (16.4.0 al 12/10; antes Next.js 15). **(16/10)** Mínimo **16.4.2**, por los avisos críticos del 14/10 (decisión 59) |
| Base de datos | **PostgreSQL 18** (12/10; antes 16) |
| ORM y migraciones | Prisma 7. **(16/10)** Se fija la versión 7.x: la etiqueta `latest` de npm apunta a una versión preliminar de Prisma 8 (decisión 59) |
| Autenticación | **Better Auth 1.7** (12/10; antes Auth.js), con inicio de sesión por **nombre de usuario** y contraseña, y sesiones guardadas en la base de datos. Contraseñas con **scrypt**, el algoritmo de Better Auth (antes bcrypt) |
| Permisos | Modelo propio de permisos por usuario en Prisma (29/09). Se verifican **en el servidor en cada operación**; el `proxy.ts` de Next.js (antes llamado middleware) es solo una primera barrera (12/10) |
| Interfaz | Tailwind CSS y shadcn/ui, configurados con los tokens del design system del prototipo aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)) |
| Lectura de .xlsx | **SheetJS Community Edition 0.20.3**, instalada desde el sitio oficial (`npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), **no** desde el registro de npm, cuya versión 0.18.5 está abandonada y es vulnerable. Medidas en "Decisiones técnicas" (12/10) |
| Validación | Zod, en cliente y servidor |
| Exportación de reportes | **(16/10)** Excel con **SheetJS** y PDF con **pdfmake**, generados en el servidor, en las tres pestañas de Reportes ([10-picking-reportes.md](10-picking-reportes.md)) |
| Formularios | **(16/10)** **React Hook Form** con su resolvedor de Zod: valida al salir de cada campo con el mismo esquema que vuelve a validar el servidor |
| Arrastrar y soltar | **(16/10)** **`@dnd-kit/core`** y **`@dnd-kit/sortable`**, en Facturación, Bodega y Ruta |
| Fechas y zona horaria | **(16/10)** **date-fns 4** con **`@date-fns/tz`**, fijado a `America/Guatemala` |
| Imágenes | **(16/10)** **`file-type`** para validar el formato por su contenido y **`sharp`** para volver a codificarlas ("Entradas y archivos") |
| Pruebas automatizadas | Vitest. **La conversión, la lectura del archivo de Odoo y la verificación de permisos y sedes deben tener pruebas obligatoriamente** (los movimientos de existencias ya no existen; permisos y sedes desde el 12/10). **(16/10)** Además, **Playwright** para las pruebas de extremo a extremo (decisión 46) |
| Formato y estilo del código | ESLint y **Prettier** (16/10) |
| Calidad y seguridad automáticas | **(16/10)** husky, Semgrep, gitleaks, StrykerJS, fast-check, axe, lockfile-lint, OSV-Scanner, actionlint y OWASP ZAP (decisión 66) |
| Revisión de los pull requests | **(16/10)** Bot de Claude en GitHub Actions (Claude Code GitHub Action con la suscripción del coordinador): revisa cada PR, lo aprueba o lo rechaza, y el PR se integra solo en `develop` cuando todas las verificaciones pasan (decisión 60) |
| Control de versiones | Git y GitHub, repositorio privado. **(16/10)** Integración continua con **GitHub Actions** y seguimiento de tareas con **GitHub Issues y Projects** |
| Producción | **(16/10)** **Docker Compose** en un VPS con **Caddy**, la aplicación y PostgreSQL 18. En las computadoras del equipo no se usa Docker ("Despliegue", abajo) |

## Almacenamiento

| Qué | Dónde |
|---|---|
| Datos | PostgreSQL |
| Imágenes del sitio | **Cloudflare R2, plan gratuito**. En la base de datos solo se guarda su dirección. **(16/10)** Se sirven desde el subdominio `imagenes.incovsa.com`, conectado al bucket, lo que requiere que el DNS de incovsa.com esté en Cloudflare (P-93). La dirección gratuita de R2 (`r2.dev`) tiene límite de uso y no se usa en producción |
| Documentos técnicos (FT, HS, COA) | **Google Drive de la empresa** (13/10). En la base de datos solo se guardan los enlaces, que el sistema muestra únicamente a quien tiene permiso. El sistema ya no guarda archivos PDF |

## Servicios externos

| Servicio | Uso |
|---|---|
| Cloudflare R2 | Imágenes del sitio y, en un bucket privado aparte, los respaldos (12/10) |
| Google Drive de la empresa | Aloja los documentos técnicos. El sistema guarda sus enlaces, muestra la vista previa de Drive y el enlace de descarga según los permisos (13/10) |
| Odoo | Un enlace al inicio de sesión. Además, Facturación **lee el archivo .xlsx que el facturador exporta de Odoo** (29/09). No hay conexión directa con Odoo |
| Cloudflare DNS | **(16/10)** DNS de incovsa.com, plan gratuito, para conectar `imagenes.incovsa.com` al bucket de R2 (P-93) |
| GitHub | **(16/10)** Repositorio, integración continua (GitHub Actions) y registro de imágenes de Docker (GHCR) del despliegue automático |
| VPS | **(16/10)** Servidor de producción, que contrata INCOVSA (P-10) |

No hay más integraciones. La integración directa con Odoo es a futuro y está fuera del alcance (29/09). **El sistema no envía correos** (13/10): las solicitudes de contacto solo se guardan en el sistema y las contraseñas las restablecen Gerencia o Soporte, así que no hace falta una cuenta SMTP.

## Seguridad (12/10, 14/10 y 16/10)

Medidas que el equipo adoptó el 12/10/2026 para que la aplicación sea segura y mantenible en el tiempo. Complementan RNF-03 a RNF-05, RNF-09, RNF-10, RNF-12, RNF-15 y RNF-16 ([15-requerimientos-no-funcionales.md](15-requerimientos-no-funcionales.md)).

### Autorización en el servidor

- **Toda operación del servidor verifica la sesión, el permiso y la sede** antes de leer o cambiar datos: acciones del servidor, rutas de la API, carga del archivo de Odoo, consulta de los enlaces de la documentación interna y exportación de reportes.
- El **`proxy.ts`** de Next.js 16 (el antiguo middleware) se usa solo como primera barrera (redirigir a quien no tiene sesión). **No** es el único control: en 2025 se publicó una vulnerabilidad (CVE-2025-29927) que permitía saltarse el middleware.
- La verificación vive en **una sola función de la capa de negocio** (por ejemplo, `exigirPermiso(usuario, permiso, sede)`), que usan todas las operaciones. Así no se duplica ni se olvida.
- El servidor **nunca confía** en lo que manda el navegador sobre el usuario: la sede, los permisos y el rol salen de la sesión y de la base de datos, no de la petición.
- Ocultar un botón en la pantalla **no** es un control de acceso; solo mejora la experiencia.

### Autenticación y sesiones

- Better Auth con nombre de usuario y contraseña, y sesiones en la base de datos; contraseñas con scrypt (RNF-03). No se programa un sistema de autenticación propio. Se eligió en lugar de Auth.js porque Auth.js está en modo mantenimiento desde septiembre de 2025 (solo parches de seguridad) y sus mantenedores recomiendan Better Auth para proyectos nuevos.
- Cookies de sesión `HttpOnly`, `Secure` y `SameSite=Lax`. La sesión se renueva al iniciar sesión.
- **Límite de intentos de inicio de sesión** (RNF-15): 5 intentos fallidos seguidos de un mismo usuario lo bloquean 15 minutos, y 20 intentos fallidos desde una misma dirección IP en 15 minutos la bloquean 15 minutos. Un inicio de sesión correcto reinicia el conteo del usuario. Los intentos se cuentan en la base de datos, a partir de la bitácora (RN-39), para que no se pierdan si se reinicia el servidor.
- **Paso del usuario del acceso personal (13/10 y 14/10):** dice si el usuario existe, por pedido de la contraparte ([03](03-roles-y-accesos.md)). Cada consulta de un usuario que no existe cuenta como intento fallido de la dirección IP (20 en 15 minutos la bloquean) y queda en la bitácora.
- El mensaje de la contraseña incorrecta no dice si lo que falló es el usuario o la contraseña.
- **Una configuración de Better Auth por sistema (16/10):** la administración del sitio y el picking tienen cada uno su configuración de Better Auth, con **su propia cookie de sesión** (prefijo distinto). Así una persona puede estar conectada a los dos sistemas a la vez en el mismo navegador, como en el prototipo, y cerrar uno no cierra el otro. Cada configuración solo acepta las cuentas de su sistema y las del sistema "ambos" (Gerencia y Soporte). `proxy.ts` y `exigirPermiso` leen la cookie del sistema al que pertenece cada área. Las dos comparten las tablas de usuarios y sesiones.
- **Expiración (16/10):** la sesión vence por falta de uso y se renueva mientras se usa. Mientras INCOVSA no defina el tiempo (P-07) se usa el valor por omisión de Better Auth: **7 días**, renovados con el uso una vez al día. El tiempo se configura con una variable de entorno.
- **Cierre forzado (16/10):** al eliminar o desactivar un usuario, o al restablecer su contraseña, se borran todas sus sesiones.
- **Dirección IP (16/10):** la aplicación toma la dirección IP del usuario solo de la cabecera que agrega Caddy, para que nadie pueda falsearla y saltarse el límite de intentos por dirección IP.
- **(30/10, JG-26) Cookies con `__Host-`:** en producción todas las cookies propias se llaman `__Host-…`: las de sesión de los dos sistemas (`__Host-incovsa-sitio.session_token` y `__Host-incovsa-picking.session_token`), la de la sede de trabajo (`__Host-incovsa-sede`) y la del usuario escrito en el acceso personal (`__Host-incovsa-acceso-usuario`). El navegador solo las acepta con `Secure`, `path=/` y sin `Domain`, así que no se comparten con otros hosts ni las puede sobrescribir un subdominio. En desarrollo y en las pruebas, por HTTP, conservan el nombre sin prefijo. Los nombres y atributos salen de `src/lib/cookies.ts`. La cookie de la sede se envía en todo el sitio, para que la exportación de Reportes use la sede que se ve en pantalla.
- **(30/10, JG-26) Contraseñas:** scrypt con **N=2^14, r=8 y p=5** (el mínimo de OWASP, equivalente a N=2^17, r=8, p=1), con una sal de 16 bytes y los parámetros escritos en cada hash (`$scrypt$N=…,r=…,p=…$sal$clave`), para poder subirlos sin perder las contraseñas anteriores. Una sola función (`src/lib/contrasenas.ts`) cifra y verifica en el inicio de sesión de los dos sistemas, la administración de usuarios, `crear-admin` y las semillas. Las contraseñas cifradas con el formato anterior de Better Auth siguen sirviendo.
- **(30/10, JG-26) Sesión anterior y cierre de sesión:** al iniciar sesión en un sistema se cierra la sesión que ese navegador ya tenía en ese sistema; la del otro sistema sigue abierta. Al cerrar sesión, la página se recarga por completo, el servidor responde con `Clear-Site-Data: "cache"` y una página autenticada que el navegador restaura con Atrás se vuelve a pedir al servidor. No se borran las cookies del otro sistema. Cuando una petición llega con una sesión que ya no es válida, el servidor la manda al acceso sin borrar la cookie: así una petición en curso con la sesión anterior no puede borrar la cookie de la sesión recién iniciada.
- **(30/10, JG-26) Reautenticación:** `reautenticar` (`src/app/acceso/servicio.ts`) confirma la contraseña del usuario de la sesión con el mismo bloqueo transaccional y el mismo límite de intentos que el inicio de sesión. Con un bloqueo vigente responde que la contraseña no es correcta aunque lo sea, y cada fallo cuenta y queda en la bitácora como un intento fallido de inicio de sesión. La usa CE-14 al restablecer la contraseña de una cuenta de acceso total.
- **Primer administrador (16/10):** se crea con el comando `npm run crear-admin`, que pide en la terminal el nombre de usuario y la contraseña; en producción se ejecuta dentro del contenedor de la aplicación. Ninguna credencial queda en el repositorio ni en la semilla. Quién es está pendiente (P-08).

### Entradas y archivos

- **Todo lo que llega al servidor se valida con Zod** (RNF-05): formularios, parámetros y el contenido del archivo de Odoo.
- Archivos subidos:
  - el .xlsx de Odoo y las imágenes se validan por su **contenido**, no solo por la extensión;
  - el servidor genera el nombre con que se guarda cada imagen en R2.
- **Imágenes (16/10):**
  - se aceptan solo **JPG, PNG y WebP**, comprobados por su contenido con `file-type`. No se aceptan SVG, porque pueden llevar código, ni GIF;
  - máximo **5 MB** por imagen;
  - el servidor las vuelve a codificar con `sharp`: quita los metadatos (EXIF y ubicación GPS), las reduce a un máximo de **2000 px de ancho** y las guarda en **WebP**, que conserva la transparencia de los logotipos;
  - la imagen pasa siempre por el servidor antes de guardarse en R2; el navegador no la sube directo a R2.
- **Tamaño de lo que se envía al servidor (16/10):** el límite de las acciones del servidor sube a **3 MB**, para que entre el archivo de Odoo de hasta 2 MB.
- Enlaces de la documentación interna (13/10): se aceptan solo direcciones `https://` de Google Drive (`drive.google.com` o `docs.google.com`). El sistema obtiene el identificador del archivo y arma con él la dirección de la vista previa y la de descarga; nunca inserta en la página una dirección que no sea de Google Drive.
- **Base de datos:** solo consultas de Prisma, que son parametrizadas. No se arman consultas SQL uniendo textos (no se usa `$queryRawUnsafe` con datos del usuario). El bloqueo de la opción de envío (decisión 41) usa `$queryRaw` con plantilla, que también es parametrizada.
- **Contenido de los usuarios y del archivo de Odoo** (noticias, solicitudes, clientes, sectores, productos y lotes del archivo): se muestra siempre escapado. No se usa `dangerouslySetInnerHTML` con ese contenido.
- **Peticiones falsificadas (CSRF):** las acciones del servidor de Next.js verifican el origen; las rutas de la API que cambian datos también lo verifican.

### Cabeceras y transporte

- HTTPS en todo el sitio (RNF-12), con HSTS.
- Cabeceras de seguridad (RNF-16): `Content-Security-Policy` (que permita las imágenes de Cloudflare R2, los mapas insertados de Google Maps y la vista previa de Google Drive, specs/05), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y protección contra que otro sitio inserte el nuestro en un marco (`frame-ancestors`).
- **(22/10, JG-11)** La CSP usa un nonce nuevo por respuesta para los scripts de Next.js; el HTML se renderiza por petición para que el nonce de la cabecera coincida con el de la hidratación. No se permiten scripts en línea sin nonce ni `unsafe-eval` en producción. Los estilos escritos por los componentes posicionados y el arrastre usan `style-src 'self' 'unsafe-inline'`. Las imágenes externas se limitan al origen HTTPS de `URL_IMAGENES`; los marcos, a los mapas insertados de Google y la vista previa de Drive. `frame-ancestors 'none'` impide insertar la aplicación desde cualquier origen. HSTS se envía en producción y mantiene el valor de Caddy.
- **(30/10, JG-26)** La CSP lleva `object-src 'none'` y `base-uri 'none'`, y su nonce tiene 128 bits del generador criptográfico. Next.js no envía `X-Powered-By`. Todas las respuestas llevan `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` y `Cross-Origin-Opener-Policy: same-origin`. No se envía `Cross-Origin-Embedder-Policy`, porque bloquearía los mapas de Google y la vista previa de Drive, que no envían `Cross-Origin-Resource-Policy`.
- Los errores que ve el usuario no muestran detalles técnicos; el detalle queda solo en el registro del servidor.
- **Registro del servidor (30/10, JG-26):** aparte de la bitácora de Reportes, el servidor escribe una línea JSON por cada rechazo de autorización (sin sesión, sin permiso, sede ajena, origen ajeno, entrada inválida, o un registro o una sede ajenos que rechaza un servicio con `ErrorAcceso`), por cada cookie de sede que no es del usuario y por cada error inesperado, también en la ruta de autenticación. Cada línea lleva la fecha, el nivel, el evento, el sistema, el identificador del usuario y la operación (el permiso que exige), y en los errores su tipo, su código y su ubicación. Nunca lleva datos personales, entradas del usuario, contraseñas, secretos ni el mensaje del error, que puede contener datos. `exigirPermiso` fija el contexto de cada operación (`src/lib/registro.ts`). **(17/10)** Ante un error inesperado, el mensaje es "No se pudo completar la operación. Inténtelo de nuevo." (`src/lib/errores.ts`); los errores de las reglas de negocio muestran su propio mensaje.
- **(16/10)** Caddy obtiene y renueva solo el certificado HTTPS y agrega la cabecera HSTS.

### Secretos y dependencias

- Claves, contraseña de la base de datos y credenciales de R2 solo en variables de entorno, fuera del repositorio (RNF-10).
- **Dependencias al día** (RNF-16): Dependabot de GitHub activado, `npm audit` en cada pull request y el archivo de bloqueo (`package-lock.json`) en el repositorio. Los parches de seguridad de Next.js, Better Auth y Prisma se aplican en cuanto salen. **(24/10)** Dependabot junta en un solo PR por ecosistema (npm y GitHub Actions) las versiones menores y los parches; cada versión mayor llega en su propio PR, y las actualizaciones de seguridad, aparte, en cuanto salen. En npm ignora las versiones mayores de `typescript` (se queda en la 6.0) y de `@types/node` (sigue a Node.js 24) ([18](18-historial-de-decisiones.md), "Dependabot agrupado").
- **(22/10, JG-11)** Las reglas propias de Semgrep comprueban las operaciones exportadas y las API inseguras. La ruta exacta de imágenes públicas de disco de la decisión 78 conserva su acceso sin sesión (404 en producción); no es una operación de datos internos y no exige permisos. Better Auth conserva sus controles propios. `lockfile-lint` y la validación previa a la descarga admiten solo el registro HTTPS oficial de npm y el tarball de SheetJS de `vendor/` con su huella aprobada; los paquetes incluidos dentro de otro tarball se verifican mediante su contenedor íntegro.
- **(24/10, DM-08)** La recepción del formulario de Contacto (RF-SW-06) es la **única acción del servidor sin sesión**: la persona que escribe no tiene cuenta. Vive sola en `src/modulos/solicitudes/recepcion-publica.ts`, que la regla de permisos de Semgrep excluye por su ruta exacta, y otra regla (`incovsa-recepcion-publica`) hace fallar la CI si ese archivo exporta algo que no sea `enviarSolicitud`, si cambia su cuerpo o si importa algo distinto de `crearSolicitud` y `aResultadoDeError`. La acción valida la entrada con un esquema Zod estricto, comprueba país, sede y territorios contra la base, solo crea la solicitud y solo devuelve el folio. Todas las demás acciones, incluidas las de la bandeja de solicitudes, siguen exigiendo `exigirPermiso`.
- **(30/10, JG-26)** La imagen de producción solo lleva las dependencias de producción. `prisma` (`migrate deploy`) y `tsx` (`crear-admin` y la semilla base) están en `dependencies` porque se ejecutan en producción. La imagen no lleva Vitest, Playwright ni las demás herramientas de desarrollo, la semilla de demostración ni los scripts de desarrollo, de la CI o de respaldo; el flujo de la imagen de producción lo comprueba.
- **(28/10, JG-25)** Las acciones de administración de usuarios (`src/modulos/usuarios/acciones.ts`, del picking y del sitio) no dependen de ninguna casilla de permisos: solo Gerencia y Soporte las ejecutan, con la sesión del mismo sistema ([03](03-roles-y-accesos.md)). Llaman a `exigirAccesoTotal(sesion, sistema)` en lugar de `exigirPermiso` con un permiso de otro módulo, como hacían antes solo para que Semgrep no fallara (auditoría del 22/10, H-44). La regla de permisos excluye ese archivo exacto, y la regla `incovsa-usuarios-acceso-total` hace fallar la CI si alguna de sus acciones no llama a `exigirAccesoTotal`.

### Respaldos

- Los respaldos de PostgreSQL son **automáticos** y se prueba la restauración (RNF-09). Desde el 13/10 no hay PDF en el servidor: los documentos técnicos están en el Google Drive de la empresa.
- Frecuencia: **diaria, en la noche** (`pg_dump` de la base). Se conservan **7 diarios y 4 semanales**.
- Destino: fuera del servidor, en un bucket **privado** de Cloudflare R2, distinto del de las imágenes.
- **Cómo (16/10):** una tarea de `cron` del VPS ejecuta `pg_dump` dentro del contenedor de PostgreSQL y sube el archivo a R2 con `rclone`. El mismo script borra los respaldos que sobran (conserva 7 diarios y 4 semanales). La credencial de R2 del VPS solo tiene acceso a ese bucket. No se agrega un cifrado propio: R2 cifra lo que guarda, y una llave de cifrado perdida dejaría los respaldos inservibles.
- **Configuración (22/10, RNF-09):** la configuración sin secretos (`docker-compose.yml`, `Caddyfile` y `.env.produccion.example`) se respalda en el repositorio. La copia de respaldo de los secretos del `.env` del VPS y de la configuración de `rclone` se guarda solo en el medio seguro que el coordinador acuerde con INCOVSA para entregar las credenciales (Anexo J, CE-12), nunca en las computadoras del equipo (decisión 70). El Documento 5 (CE-11) explica cómo rehacer el `.env` desde la plantilla con esos valores.

### Mantenibilidad

- Las reglas de negocio (conversión RN-01, lectura del archivo de Odoo, permisos y sedes, armado de rutas y pedidos) viven en módulos de la capa de negocio, separados de las pantallas. Se prueban solas y se podrán reutilizar cuando exista la conexión directa con Odoo.
- Pruebas automatizadas obligatorias de esas reglas (ver "Stack").

## Despliegue

- Hace falta un servidor capaz de ejecutar Node.js y PostgreSQL. Un hosting compartido tradicional (cPanel con PHP) no sirve.
- La empresa paga el hosting y el dominio.
- El Entregable 2 se prueba **solo en las computadoras del equipo**. No hay entorno de pruebas en internet ni se contrata un servicio de terceros (12/10, resuelve P-11).

> **Decisiones del 16/10/2026.** El Ing. William Ambrossio se comprometió a contratar un **VPS** (P-10). El equipo definió cómo se instala, se despliega y se respalda la aplicación.

### Servidor (VPS)

Características que se le piden a INCOVSA:

| Recurso | Mínimo |
|---|---|
| Sistema operativo | Ubuntu Server 24.04 LTS |
| Procesador | 2 vCPU |
| Memoria | 4 GB de RAM |
| Disco | 80 GB SSD |
| Red | Dirección IP fija |
| Acceso | SSH con llave |

### Ambientes

- **Desarrollo:** en las computadoras del equipo, **sin Docker**, con el Node.js 24 y el PostgreSQL 18 que ya tienen instalados (`npm run dev`).
- **Integración continua:** GitHub Actions, con su propio PostgreSQL 18.
- **Producción:** el VPS, en `incovsa.com`. **Solo hay ambiente de producción**: no hay ambiente de pruebas en internet.

### Producción con Docker Compose

En el VPS, un archivo `docker-compose.yml` con tres servicios:

| Servicio | Qué hace |
|---|---|
| Caddy | HTTPS con certificado automático, HSTS y redirección al puerto de la aplicación. Maneja sin configuración extra los avisos en tiempo real (SSE) |
| Aplicación | Next.js compilado como servidor independiente (`output: 'standalone'`), en **un solo proceso**, porque el aviso en tiempo real vive en la memoria del servidor (decisión 10) |
| PostgreSQL 18 | La base de datos, con sus datos en un volumen de Docker |

- Las credenciales están en un archivo de variables de entorno del VPS, **nunca dentro de la imagen** ni en el repositorio.
- Solo quien despliega necesita conocer Docker; el resto del equipo no lo usa.

### Despliegue

- **Primer despliegue:** cuando la aplicación esté **completa**: el **lunes 02/11/2026**, al integrar `develop` en `main` (decisión 75). Antes no se despliega.
- **Después, cada despliegue es automático desde GitHub.** Al integrar en `main`, GitHub Actions:
  1. corre las revisiones de integración continua ("Forma de trabajo");
  2. compila la imagen de Docker de la aplicación y la guarda en el registro de GitHub (GHCR), privado;
  3. entra al VPS por SSH, descarga la imagen, aplica las migraciones (`prisma migrate deploy`) y reinicia la aplicación con la imagen nueva.
- El VPS no compila: solo descarga la imagen, así que el sitio no se pone lento durante un despliegue.
- **Volver atrás:** se arranca la imagen anterior. GitHub Actions conserva solo las **últimas 5 imágenes**. La cuenta es de GitHub Student, que incluye GitHub Pro y da 2 GB de almacenamiento en GHCR (500 MB en una cuenta gratuita); con 5 imágenes se queda holgadamente dentro del límite. Al transferir el repositorio a INCOVSA, el límite depende del plan de su cuenta (P-94).
- Los registros de la aplicación salen por la salida estándar y los guarda Docker en el VPS (`docker compose logs`), con rotación para que no llenen el disco.

### Cuentas de los servicios

- La cuenta de **Cloudflare** (R2 y DNS) y la del **VPS** se crean desde el inicio **a nombre de INCOVSA**, con un correo de la empresa, y se invita al equipo (P-94).
- El **repositorio** se transfiere a una cuenta u organización de INCOVSA el día de la entrega (Anexo J).

## Decisiones técnicas (12/10)

Las tomó el equipo el 12/10/2026 (coordinador Jordin García). Resuelven P-37, P-39 y P-42 y todas las [DECISIÓN TÉCNICA] que estaban abiertas.

### Datos y base de datos

| # | Tema | Decisión |
|---|---|---|
| 1 | Cantidades en kg | `Decimal(12,3)` en la base de datos (Prisma `Decimal`) para todas las cantidades y el Peso de Conversión. La conversión (RN-01) se calcula en **gramos enteros**, como `convertir()` del prototipo, nunca con punto flotante. Los archivos de la empresa traen hasta 2 decimales, 4,536 kg por línea y un Peso de Conversión de hasta 2,500 kg |
| 2 | Eliminar registros con historial (P-42) | **Eliminación lógica** en camiones y usuarios (desde el 13/10 ya no hay productos, clientes ni sectores en el picking): el registro guarda la fecha de eliminación, desaparece de listas y selectores y el historial queda intacto. Un usuario eliminado no puede iniciar sesión y su nombre de usuario queda reservado |
| 3 | Eliminar un pedido facturado del tablero | Se **borra** de la base de datos, porque nunca llegó a Bodega y nada depende de él. La bitácora guarda sus datos |
| 4 | Número de Odoo repetido | **Sin restricción de unicidad**, con un índice para buscar. Una segunda carga de la misma referencia no falla |
| 5 | Bitácora (RN-39) | Una sola tabla con sistema (sitio o picking), usuario (vacío en un intento fallido de un usuario que no existe), nombre de usuario escrito, dirección IP (en inicios de sesión), operación, entidad, identificador del registro, detalle en JSON y fecha. Se escribe desde la capa de negocio **en la misma transacción** que la operación. No se edita ni se borra |
| 6 | Fechas y zona horaria | Todas las fechas se guardan en UTC (`timestamptz`). Días, semanas de lunes a domingo y rangos de Reportes se calculan en la hora de Guatemala (`America/Guatemala`) |

### Acceso y seguridad

| # | Tema | Decisión |
|---|---|---|
| 7 | Acceso total de Gerencia y Soporte (RN-38) | Por **rol**: `exigirPermiso` da todos los permisos y todas las sedes a los usuarios cuyo rol es Gerencia o Soporte, sin depender de sus casillas. Los módulos y sedes nuevos les quedan incluidos solos |
| 8 | Comparación de roles | "Piloto", "Gerencia" y "Soporte" se comparan sin distinguir mayúsculas, acentos ni espacios al inicio o al final (función `norm` del prototipo) |
| 9 | Intentos de inicio de sesión (RNF-15) | Ver "Autenticación y sesiones" |

### Picking

| # | Tema | Decisión |
|---|---|---|
| 10 | Tiempo real en Bodega (P-39, RNF-13) | **SSE** desde una ruta de la API con el entorno de Node.js. Ante cualquier cambio, el servidor avisa "cambió la sede X" y cada pantalla vuelve a pedir el estado. Si la conexión se cae, la pantalla consulta cada pocos segundos hasta reconectarse (**cada 5 segundos**, 16/10). El aviso vive en la memoria del servidor (un solo proceso); si algún día hay varios procesos, se cambia a `LISTEN/NOTIFY` de PostgreSQL. Para el Entregable 2 se puede empezar con la consulta periódica, porque la pantalla funciona igual |
| 11 | Dónde vive el orden compartido | En la base de datos se guarda **solo el orden actual**, sin historial ni bitácora: la posición de cada ruta o pedido en la cola de Bodega, la de cada línea de preparación y la de cada cliente de la ruta antes de entregar. Al pulsar "Ruta Entregada", el orden de la ruta queda como recorrido (RN-29). El marcado ya se guarda en LINEA_PREPARACION ([14](14-modelo-de-datos.md)) |
| 12 | Lectura del archivo de Odoo | SheetJS 0.20.3 (ver "Stack"), con la versión y la huella fijas en `package-lock.json`. Como `npm audit` y Dependabot no vigilan esa librería, en cada entrega se revisa a mano <https://cdn.sheetjs.com/advisories>. El archivo se rechaza si pesa más de **2 MB** (el de ejemplo pesa 25 KB con 80 referencias). Se lee solo en el servidor, solo las columnas que se usan, y todo se valida con Zod. Se ignoran las filas de agrupación (Referencia con texto, sin Contacto ni Producto). Si una línea de una referencia "Hecho" trae una cantidad o un Peso de Conversión vacío, no numérico o menor o igual a 0, ese pedido facturado no se carga y se avisa en el resumen de la carga (RN-50). **(13/10)** Se leen también las columnas `Movimientos de stock/Producto/Peso` y `Movimientos de stock/Números de serie`; el lote se guarda como texto, tal como viene |
| 13 | Comparación del nombre del producto | **Ya no aplica** (13/10): el picking no tiene catálogo de productos. Bodega agrupa las líneas por el texto exacto del producto, el lote y el Peso de Conversión (RN-51) |

### Sitio

| # | Tema | Decisión |
|---|---|---|
| 14 | Productos Recomendados (RF-SW-17) | Primero los que comparten industria y después los de relleno, cada grupo en **orden alfabético** por nombre |

### Repositorio y operación

| # | Tema | Decisión |
|---|---|---|
| 15 | Estructura de carpetas | **Por módulo de dominio** (ver abajo). Se documenta en el Documento 2 |
| 16 | Semillas (P-37) y carga inicial | La semilla del repositorio (`prisma/seed.ts`) solo lleva datos que no son personales ni de producción: sedes, permisos, estados, las dos opciones de envío de cada sede, "Usuario de ejemplo NN" y "Camión 1" a "Camión 3" con sus capacidades. **(13/10)** Ya no hay carga de productos ni de clientes: los datos de los pedidos llegan en cada archivo de Odoo, y el script `npm run importar` y el Excel maestro limpio (P-35) ya no se necesitan |
| 17 | Respaldos (RNF-09) | Ver "Respaldos" |

## Decisiones técnicas del 14/10

Las tomó el equipo el 14/10/2026 para aplicar los cambios de la reunión 5 (coordinador Jordin García).

| # | Tema | Decisión |
|---|---|---|
| 18 | Numeración diaria (RN-52) | El número de una ruta o de un pedido se calcula en la misma transacción que lo crea: el siguiente de los de su sede, tipo y fecha de envío (hora de Guatemala). La base de datos declara única la combinación (sede, tipo, fecha, número), para que dos envíos simultáneos no reciban el mismo número |
| 19 | Fecha de creación (RN-57) | Todas las tablas tienen `creado_en` con valor por omisión `now()` en la base de datos (`@default(now())` en Prisma), y las que se modifican, `actualizado_en` (`@updatedAt`). La aplicación no escribe esos campos |
| 20 | Galerías de imágenes (RN-56, RNF-17) | Una tabla IMAGEN con el área, el dueño y la posición (1 a 5); el servidor rechaza la sexta. En la página, la galería es un componente que muestra la primera imagen con prioridad y descarga las demás de forma diferida (`loading="lazy"` y después de cargar la página). Con una sola imagen no se activa la rotación. Respeta la preferencia de reducir el movimiento |
| 21 | Enlaces de Google Drive | Del enlace se extrae el identificador del archivo. La vista previa usa `https://drive.google.com/file/d/<id>/preview` dentro de un marco, y la descarga, `https://drive.google.com/uc?export=download&id=<id>`. La vista previa solo se muestra con el permiso de ver, y el botón de descarga solo con el permiso de descargar |
| 22 | Nombre de usuario por sistema (RN-54) | Restricción única sobre (nombre de usuario, sistema). Al crear una cuenta, el servidor rechaza un nombre que ya use una cuenta de Gerencia o Soporte del otro sistema |
| 23 | Paso del usuario del acceso personal | Una acción del servidor responde solo en qué sistemas tiene cuenta activa el nombre escrito. Cuenta en el límite de intentos por dirección IP y registra en la bitácora las consultas de nombres que no existen |
| 24 | Contraseñas | Las escriben Gerencia o Soporte al crear y al restablecer, dos veces para confirmarla. Mínimo 8 caracteres, el valor por omisión de Better Auth |
| 25 | Cierre de sesión (RF-SW-30) | Después de cerrar la sesión, la aplicación redirige a la página de inicio del sitio |
| 26 | Cuentas en Better Auth con el mismo nombre de usuario en los dos sistemas (RN-54) | Better Auth exige que su nombre de usuario y su correo sean únicos en toda la tabla de usuarios, y el correo es obligatorio. Cada cuenta guarda: el nombre de usuario que escribe la persona (`display_username`), único junto con el sistema; una **clave de acceso interna** única formada por el sistema y el nombre de usuario (`username`, por ejemplo `picking.maria.argueta`), que es la que recibe Better Auth al iniciar sesión; y un correo interno único derivado de esa clave, que nunca se muestra ni se usa para enviar correos. El correo real, opcional, se guarda en un campo aparte. **(15/10)** Las cuentas de Gerencia y Soporte, que sirven en los dos sistemas, guardan el sistema "ambos", y su clave de acceso interna se forma con él (por ejemplo, `ambos.maria.argueta`) |

## Decisiones técnicas del 16/10

Las tomó el coordinador (Jordin García) el 16/10/2026 a partir de las recomendaciones del equipo, para dejar especificado todo lo necesario antes del plan de desarrollo.

### Despliegue y operación

| # | Tema | Decisión |
|---|---|---|
| 27 | Docker | **Solo en producción.** En el VPS, Docker Compose con Caddy, la aplicación y PostgreSQL 18. En las computadoras del equipo no se usa Docker: ya tienen Node.js 24 y PostgreSQL 18, y en Windows Docker hace lenta la recarga automática de Next.js ("Despliegue") |
| 28 | Servidor (VPS) | Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM, 80 GB SSD, IP fija y SSH con llave. Lo contrata INCOVSA (P-10) |
| 29 | HTTPS y proxy inverso | **Caddy**, en un contenedor: certificado automático y avisos en tiempo real sin búfer (`flush_interval -1`). La aplicación toma la IP del usuario solo de la cabecera de Caddy (RNF-15). **(28/10)** HSTS y las demás cabeceras de seguridad las envía Next.js (RNF-16); Caddy no las repite, para que no salgan dos HSTS. El flujo de la imagen de producción comprueba a través de Caddy las cabeceras y el primer aviso en tiempo real |
| 30 | Ambientes | **Solo producción** en internet. Desarrollo en las computadoras del equipo |
| 31 | Despliegue | El primero, cuando la aplicación esté completa. Después, **automático** al integrar en `main`: GitHub Actions compila la imagen, la guarda en GHCR y la despliega en el VPS por SSH, con las migraciones. Se conservan las últimas 5 imágenes para volver atrás |
| 32 | DNS e imágenes | El DNS de incovsa.com pasa a **Cloudflare** (plan gratuito) para servir las imágenes de R2 desde `imagenes.incovsa.com`. Si no se pudiera (P-93), la aplicación serviría las imágenes desde una ruta propia |
| 33 | Cuentas de servicios | Cloudflare y el VPS a nombre de INCOVSA, con un correo de la empresa, con el equipo invitado (P-94). El repositorio se transfiere a INCOVSA el día de la entrega |
| 34 | Respaldos | `cron` en el VPS, `pg_dump` dentro del contenedor de PostgreSQL y `rclone` hacia el bucket privado de R2; 7 diarios y 4 semanales; sin cifrado propio ("Respaldos") |

### Acceso y sesiones

| # | Tema | Decisión |
|---|---|---|
| 35 | Sesión por sistema | Dos configuraciones de Better Auth, una por sistema, cada una con su propia cookie. Se puede estar conectado a los dos sistemas a la vez y cerrar uno no cierra el otro, como en el prototipo |
| 36 | Expiración y cierre forzado | 7 días sin uso, renovados una vez al día mientras se usa, configurable por variable de entorno, mientras INCOVSA no defina el tiempo (P-07). Al eliminar o desactivar un usuario, o al restablecer su contraseña, se borran todas sus sesiones |
| 37 | Primer administrador | Comando `npm run crear-admin`, que pide en la terminal el usuario y la contraseña. Quién es: P-08 |

### Picking

| # | Tema | Decisión |
|---|---|---|
| 38 | Arrastrar y soltar | `@dnd-kit/core` y `@dnd-kit/sortable`: pulsación larga en pantallas táctiles (decisión de diseño del 14/10), uso con teclado (RNF-08) y arrastre de varias tarjetas seleccionadas |
| 39 | Dos facturadores en la misma sede | El servidor valida cada movimiento contra el estado guardado y rechaza el que ya no corresponde; Facturación recibe el mismo aviso en tiempo real que Bodega ([06](06-picking-facturacion.md)) |
| 40 | Actualización de las pantallas en tiempo real | Al recibir el aviso, la pantalla vuelve a pedir su contenido al servidor (`router.refresh()`). El marcado se ve al instante en la pantalla de quien marca, antes de que conteste el servidor (`useOptimistic`). Sin conexión de avisos, consulta cada 5 segundos (decisión 10) |
| 41 | Numeración diaria y doble clic | El envío a Bodega bloquea la fila de su opción de envío (`SELECT … FOR UPDATE`) dentro de la transacción. Como hay una sola opción de cada tipo por sede, los envíos que compiten por el mismo número esperan su turno, y un segundo clic encuentra la opción vacía. Se mantiene la restricción única de la decisión 18 |
| 42 | Lote vacío | Se guarda como texto vacío, no como nulo, en las líneas del pedido facturado y en las de preparación; Bodega muestra "Sin lote" ([14](14-modelo-de-datos.md)) |

### Reportes y sitio

| # | Tema | Decisión |
|---|---|---|
| 43 | Exportación de reportes | Excel con SheetJS (una hoja, sin formato) y PDF con pdfmake, generados en el servidor, en Despacho, Rutas realizadas y Bitácora ([10](10-picking-reportes.md)) |
| 44 | Imágenes | JPG, PNG o WebP validados con `file-type`; máximo 5 MB; `sharp` quita los metadatos, reduce a 2000 px de ancho y guarda en WebP; siempre pasan por el servidor ("Entradas y archivos") |
| 45 | Lista de países | La semilla la genera con los códigos de `libphonenumber-js` y los nombres en español de `Intl.DisplayNames`, como el prototipo. Departamentos y municipios, de `guatemala.json` (INE, Censo 2018) |

### Calidad y código

| # | Tema | Decisión |
|---|---|---|
| 46 | Pruebas | **Vitest** contra una base PostgreSQL de pruebas real (no simulada), para la conversión, la lectura del archivo de Odoo, los permisos y sedes, y el envío a Bodega con su transacción y su numeración. **Playwright** para el flujo completo, los permisos, las pruebas responsive (teléfono, tableta y escritorio) y las de navegadores (Chromium, Firefox y WebKit), con capturas como evidencia del Documento 6. **(30/10, JG-16)** El navegador se elige con la variable `NAVEGADOR` (`chromium` si no se indica, `firefox` o `webkit`), y los proyectos conservan sus nombres en los tres. La matriz completa (3 navegadores × 4 tamaños, cada combinación con su propia base) corre a mano en GitHub Actions con `gh workflow run matriz-navegadores.yml --ref develop`, y también en los PR que cambian ese flujo, `playwright.config.ts` o `scripts/resumen-matriz.mjs`, para probarlos antes de integrarlos (como el recorrido diario, decisión 67). Con WebKit, las pruebas que arrancan el servidor de producción lo usan detrás de un proxy HTTPS local con un certificado autofirmado, como Caddy, porque WebKit no guarda en `http://localhost` las cookies `Secure` de producción |
| 47 | Integración continua | GitHub Actions en cada pull request: ESLint, Prettier, revisión de tipos de TypeScript, Vitest sobre PostgreSQL 18, migraciones desde cero, `npm audit` y compilación. Playwright se corre antes de cada versión, no en cada pull request |
| 48 | Formularios | React Hook Form con el resolvedor de Zod; el servidor vuelve a validar con el mismo esquema |
| 49 | Formato del código | Prettier, junto con ESLint |
| 50 | Fechas | date-fns 4 con `@date-fns/tz` y la zona `America/Guatemala` |
| 51 | Tipografías | Poppins, Figtree y JetBrains Mono se sirven desde el propio servidor con `next/font`, no desde Google Fonts |
| 52 | Animaciones y galerías | Con CSS y la detección de desplazamiento del navegador (`IntersectionObserver`), como en el prototipo, sin librerías |
| 53 | Íconos | Los SVG del prototipo |
| 54 | Design system | Los tokens de `estilos.css` del prototipo pasan al tema de Tailwind CSS |
| 55 | Sede de trabajo | La sede elegida en la barra superior se guarda en una cookie; el servidor verifica en cada operación que el usuario la tenga asignada |
| 56 | Modo claro u oscuro del tablero | Se guarda en cada pantalla (en el navegador) y no se comparte |
| 57 | Orden de las listas | Posiciones enteras que se vuelven a escribir al reordenar |
| 58 | Límite de envío al servidor | 3 MB para las acciones del servidor, para el archivo de Odoo de hasta 2 MB. **(28/10)** Caddy acepta cuerpos de hasta **27 MB** (`max_size 27MB`, en MB de base 10): es el tope de `/api/imagenes/publicar`, que recibe hasta 5 imágenes de 5 MB más el formato multipart en una sola petición (decisión 44) |

## Decisiones del 16/10 sobre el desarrollo con agentes de IA

Las tomó el coordinador el 16/10/2026, después de la investigación sobre cómo desarrollar con agentes de IA (`plan/investigacion-desarrollo-con-agentes-ia.md`). Todos los integrantes trabajan con un agente de IA que implementa sus tareas. Las personas intervienen solo cuando el agente necesita datos, cuentas o decisiones a los que no puede llegar con sus herramientas.

### Método

| # | Tema | Decisión |
|---|---|---|
| 59 | Versiones mínimas por seguridad | Verificado el 16/10 en la base de avisos de GitHub y en npm. **Next.js 16.4.2** o posterior: la 16.4.0 quedó expuesta a dos ejecuciones remotas de código sin autenticación (GHSA-673q-mjm6-r5xr y CVE-2026-96889) y a una denegación de servicio en Server Actions, corregidas en la 16.4.1. **sharp 0.35.5** o posterior (GHSA-wq5f-xc86-pv6w), también como dependencia propia. **Better Auth 1.7.10** o posterior estable: ningún aviso publicado afecta a las versiones estables 1.7.x; nunca una versión beta o rc. **pdfmake 0.3.6** o posterior (SSRF, GHSA-wp52-r2fp-4vmr), y el PDF se arma sin cargar imágenes ni fuentes desde direcciones remotas. **file-type 21.3.2** o posterior. **Prisma 7.x** fijo: la etiqueta `latest` de npm apunta a `8.0.0-rc`, así que se instala con versión explícita. Antes de instalar cualquier dependencia se revisan sus avisos en la base de avisos de GitHub |
| 60 | Revisión e integración de los pull requests | **Un bot de Claude revisa, aprueba o rechaza, e integra.** El flujo `revision-claude` de GitHub Actions corre la Claude Code GitHub Action, fijada por SHA, con un token de la suscripción del coordinador (`claude setup-token`, secreto `CLAUDE_CODE_OAUTH_TOKEN`). Revisa el PR contra su tarea, `specs/` y el prototipo, publica su veredicto (`VEREDICTO: LISTO` o `VEREDICTO: CORREGIR`) y deja una revisión formal: **aprobar** o **solicitar cambios** (para eso se activa en el repositorio la opción de GitHub que permite a GitHub Actions aprobar pull requests). El veredicto es una verificación obligatoria: falla con hallazgos de corrección o si la revisión no se completó. El agente del autor activa la integración automática (`gh pr merge --auto`), y GitHub integra el PR en `develop` cuando **todas** las verificaciones obligatorias pasan. No hace falta aprobación humana. Solo el coordinador puede integrar un PR con un falso positivo del bot. Un segundo flujo, `claude-interactivo`, responde a `@claude` en issues y PR. Se toma como base el bot que el coordinador ya usa en el repositorio `shapi` |
| 61 | Revisión local antes del PR | Además del bot, cada agente pide una revisión **en contexto limpio** antes de abrir el PR: un subagente revisor (Claude Code) o una sesión nueva (Codex, Cursor y Antigravity) con las mismas instrucciones de revisión del bot |
| 62 | Harness y equipo de cada integrante | Jordin: Claude Code y Codex, en Windows. Carlos Hugo: Cursor, en macOS; **(19/10)** también puede usar el agente en la nube de Cursor, que sube sus cambios como `cursor[bot]`, y `revision-claude` lo admite con `allowed_bots: "cursor"` (solo ese bot). José Daniel: Codex, en macOS. Daniela: Codex, en Windows. Josué: Codex, en Windows (antes Antigravity; decisión 84). La configuración de los agentes cubre siempre los cuatro harnesses, también Antigravity: `AGENTS.md` como fuente única de instrucciones (los cuatro lo leen); `CLAUDE.md` contiene solo `@AGENTS.md`, sin enlaces simbólicos, por Windows; las skills viven en `.agents/skills/` y un script las copia a `.claude/skills/`, porque Claude Code solo lee esa carpeta (verificado en su documentación el 16/10) |
| 63 | Prototipo en el repositorio | El **prototipo de simulación armado** (`entregable-1/prototipos/prototipo-simulacion-incovsa.html`) **se sube al repositorio**, aunque contiene datos reales de la empresa, porque el repositorio es privado. Así lo usan los agentes y GitHub Actions como referencia de las pantallas y del comportamiento. Cada cambio del código fuente del prototipo se sube junto con el HTML vuelto a armar. Es una excepción a RNF-10 |

### Organización del trabajo

| # | Tema | Decisión |
|---|---|---|
| 64 | Reparto por módulos | Cada integrante es dueño de módulos completos, de la base de datos a la pantalla. **Jordin:** base del proyecto (estructura, autenticación, permisos, bitácora, CI, `AGENTS.md`, el bot y la configuración de los agentes), **esquema de la base de datos**, revisión y calidad. **Josué:** Bodega con su tablero, y Ruta. **José Daniel:** Facturación (lectura del archivo de Odoo, opciones de envío, rutas y pedidos) y Reportes. **Daniela:** sitio público y panel del sitio. **Carlos Hugo:** Configuración (camiones y usuarios), despliegue y documentos. Reemplaza el reparto por capas (frontend del sitio, frontend y backend del picking) |
| 65 | Dueño del esquema de la base de datos | **Jordin** es el único que modifica `prisma/schema.prisma` y crea migraciones. Quien necesite un cambio del esquema lo pide al coordinador. Solo hay un PR con migración abierto a la vez |
| 66 | Calidad y seguridad automáticas | Meta de verificación: **OWASP ASVS 5.0, nivel 2**. Además de lo de la decisión 47: **husky** (formato, lint, tipos y búsqueda de secretos antes de cada *commit*); **Semgrep** (gratis hasta 10 contribuidores) con reglas propias, por ejemplo que toda acción del servidor y toda ruta de la API llamen a `exigirPermiso`, y que no se use `$queryRawUnsafe` ni `dangerouslySetInnerHTML`; **gitleaks** (secretos; GitHub Pro no incluye el escaneo de secretos en repositorios privados); **StrykerJS** (pruebas de mutación de la conversión, los permisos y los estados de rutas y pedidos) y **fast-check** (propiedades de la conversión); **`@axe-core/playwright`** (accesibilidad WCAG A y AA); **lockfile-lint** y **OSV-Scanner** (dependencias), con aviso al coordinador ante cualquier dependencia nueva; **actionlint** y acciones de GitHub fijadas por SHA, con permisos mínimos; **OWASP ZAP** (prueba básica de seguridad antes de entregar). La CI falla si se borran o se desactivan pruebas (`.skip`, `.only`) o si bajan los umbrales. Una prueba de integración comprueba que cada acción del servidor rechaza a un usuario sin sesión o sin permiso |
| 67 | Recorrido diario del flujo completo | Mientras no exista el primer despliegue (decisión 31), GitHub Actions recorre **cada día**, sobre `develop` y en su propio entorno temporal (PostgreSQL 18 y el servidor de producción *standalone*, `node .next/standalone/server.js`, el mismo que ejecuta la imagen de Docker; con `output: "standalone"` no se usa `next start`, 27/10), el flujo pedido facturado → conversión → preparación → despacho → entrega → reporte con Playwright (`.github/workflows/recorrido-diario.yml`, 06:00 de Guatemala). Si falla, avisa al coordinador en el issue "Tablero del plan" |
| 68 | Alcance | **No se recorta nada.** Todo se implementa como está especificado en `specs/` y como está en el prototipo aprobado |
| 69 | Dónde vive el plan | La carpeta **`plan/`** del repositorio tiene la guía, el protocolo de los agentes, las convenciones, el calendario, **una tarea por archivo** y **una bitácora por persona** (decisión 71, que reemplaza el mismo 16/10 a las tareas en GitHub Issues). El informe de la investigación está en `plan/`; las notas de la investigación no se suben (`research_notes/` en `.gitignore`) |
| 70 | Dónde trabajan los agentes | **Windows nativo** (Jordin, Daniela y Josué), con reglas que impiden a los agentes leer `.env*`, llaves y `~/.ssh`, porque el aislamiento de comandos de Claude Code no funciona en Windows nativo. En **macOS** (Carlos Hugo y José Daniel) se usa además el aislamiento del propio harness. En ningún equipo se usan los modos sin confirmación (por ejemplo `--dangerously-skip-permissions` o `--yolo`), y ninguna computadora del equipo guarda credenciales de producción: viven solo en el VPS y en los secretos de GitHub Actions |

## Decisiones del 16/10 sobre el plan de desarrollo

Las tomó el coordinador el 16/10/2026, junto con el plan de desarrollo (`plan/`), a partir del modelo que ya usa en su repositorio `shapi`.

| # | Tema | Decisión |
|---|---|---|
| 71 | Tareas | **Una tarea por archivo** en `plan/tareas/`, con metadatos que valida `scripts/tareas.mjs`; una bitácora por persona en `plan/bitacora/`; el issue fijo "Tablero del plan" avisa a cada persona. Reemplaza a GitHub Issues y Projects (decisión 69). Los issues y el Project anteriores se borraron el 16/10, junto con `PLAN_DE_PROYECTO.md` de `main` |
| 72 | Calendario e hitos | Se trabaja **todos los días** desde el sábado 17/10/2026. **E2:** el avance del Entregable 2 queda terminado el domingo 18/10 y Jordin lo presenta el lunes 19/10 al Ing. Manuel Rojas, sin preparar nada más que la demostración; su alcance es la base del proyecto (aplicación, base de datos, inicio de sesión y permisos), el flujo obligatorio del picking (carga del archivo de Odoo → conversión → envío a Bodega → preparación) y el panel con contenido institucional, industrias y catálogo, con las páginas públicas que los muestran. **E3:** el desarrollo queda completo el lunes 02/11. **Entrega:** capacitación el martes 03/11 y entrega final el miércoles 04/11. El plan incluye los documentos (con una versión nueva del Documento 2; la v0.4 no se edita) y la presentación |
| 73 | Fechas que dependen de INCOVSA | Se le pide al Ing. William el acceso al VPS y al DNS a más tardar el **28/10** (P-10, P-93 y P-94); la capacitación es el **03/11** y la entrega de accesos el **04/11** |
| 74 | Fidelidad al prototipo | Cada pantalla tiene los mismos textos, estructura, orden, estados y colores del design system que el prototipo, salvo donde `specs/` cambia los textos, los datos o el comportamiento (en diseño manda el prototipo, decisión 89); no se exige coincidencia píxel por píxel, porque el prototipo usa otros datos. Cada PR lleva capturas lado a lado en 390, 768 y 1440 px (`plan/convenciones.md` §7). Después de que el coordinador aprueba una pantalla, sus capturas pueden quedar como referencia para detectar cambios |
| 75 | Ramas y despliegue | `develop` es la **rama por defecto** del repositorio y `main` queda solo para versiones y despliegue. Los PR se integran en `develop` con *squash*. `develop` se integra en `main` el **lunes 02/11/2026**, lo que hace el primer despliegue (decisión 31) |
| 76 | Personas, prefijos y ramas | Jordin (`jordin`, JG, jordin-garcia), Carlos Hugo (`carlos`, CE, carloshugoeg), Daniela (`daniela`, DM, InAlexa), Josué (`josue`, JM, Josh-JM) y José Daniel (`jose-daniel`, JC, JDaniC). Ramas `<clave>/<ID>-<descripcion>` |
| 77 | Datos de prueba | Un script genera una copia **anonimizada** del archivo de Odoo de ejemplo, con la misma estructura y las mismas cifras, que se sube como dato de prueba; se regenera cuando llegue el archivo completo (P-91). Los recursos gráficos que la aplicación necesita (logotipos, fotografías de las pantallas de acceso e imágenes del catálogo de prueba) se extraen del prototipo armado |
| 78 | Imágenes sin R2 en desarrollo | Con `ALMACENAMIENTO=disco`, en desarrollo y en GitHub Actions las imágenes se guardan en disco (`almacenamiento-local/`, fuera del repositorio); en producción, en R2 |
| 79 | Datos de demostración | En desarrollo, la semilla de demostración tiene las cuentas de ejemplo del prototipo, los tres camiones y los productos públicos de prueba. La demostración final del 04/11 usa el **contenido oficial** de INCOVSA, cargado desde el panel |
| 80 | Archivos protegidos | Solo el coordinador modifica la configuración de los agentes, los flujos de GitHub Actions, el esquema y las migraciones, `package.json` y el archivo de bloqueo, y las reglas del plan (`plan/convenciones.md` §3); una verificación obligatoria lo hace cumplir. Excepción: Carlos puede modificar los flujos de producción y despliegue |
| 81 | Autoridad del coordinador | El agente del coordinador puede corregir, terminar o modificar el trabajo de cualquier persona, con aviso en su bitácora (`plan/protocolo.md` §E) |
| 82 | Auditorías y convergencias | El coordinador audita lo integrado y hace tres convergencias (21/10, 25/10 y 30/10) que comparan `specs/` y el prototipo con `develop` y convierten cada brecha en una tarea |
| 83 | Cuota del bot | El bot usa la suscripción Pro del coordinador; si no alcanza para los PR del equipo, el coordinador pasa a Claude Max |
| 84 | Josué con Codex | Josué trabaja con Codex en lugar de Antigravity gratuito. Antigravity se mantiene siempre en la configuración y en la guía de instalación, por si alguien lo usa |
| 85 | SheetJS desde el repositorio | El paquete de SheetJS 0.20.3 se guarda en `vendor/xlsx-0.20.3.tgz` y se instala desde ahí, porque npm 12 bloquea por defecto las dependencias que se instalan desde una dirección web. `package.json` exige Node 24 |
| 86 | Herramientas obligatorias del agente | **GitHub CLI, Context7 y Playwright** (como MCP o plugin), más los MCP de **next-devtools** y **shadcn**. La primera tarea de cada persona las integra en su harness, con la ayuda de la persona cuando el agente no puede hacerlo solo, y ninguna otra tarea empieza antes. Todas las dependencias del proyecto se instalan de una vez en la primera tarea del proyecto base (JG-02) |
| 87 | Avisos por correo del plan | Los avisos del plan llegan **por correo** con las notificaciones de GitHub, sin un servicio de correo propio: cada día a las 07:00 el tablero menciona a cada integrante con sus tareas del día y las atrasadas; cada vez que se integra una tarea, menciona a **todo el equipo** con las tareas que se desbloquearon; y cuando el bot rechaza un PR, menciona a su autor con los hallazgos. Cada integrante activa los avisos por correo de GitHub (`plan/instalacion.md` §3). Las ramas de GitHub se borran solas al integrar el PR (configuración del repositorio, activada el 17/10) |
| 88 | Una tarea por conversación | Cada tarea se implementa en **su propia conversación** con el agente, para que no se exceda su ventana de contexto. Al integrar una tarea, el agente no sigue con otra: le pide a la persona que abra una conversación nueva. Si una tarea se interrumpe antes de integrarse, se retoma en una conversación nueva desde su rama (`plan/protocolo.md` §B) |
| 89 | En diseño manda el prototipo | **(22/10, Jordin, JG-12)** En cómo se ve la aplicación (disposición, estructura visual, tamaños, colores, tipografía, espaciado y estilos), el **prototipo aprobado manda sobre `specs/`**, sin excepciones: si no coinciden, se sigue el prototipo y se corrige `specs/` con su línea en `specs/18`. En los requisitos, las reglas, los textos, los datos y el comportamiento sigue mandando `specs/`. Si seguir el prototipo haría fallar una prueba (por ejemplo, el contraste de RNF-08), el agente se detiene y le pregunta al coordinador: las pruebas no se debilitan |

## Estructura de carpetas

```
src/app/(sitio)/        sitio público
src/app/panel/          panel del sitio y documentación interna
src/app/picking/        Facturación, Bodega, Ruta, Reportes y Configuración
src/app/api/            rutas de la API (SSE y exportaciones)
src/modulos/<modulo>/   de dominio: contenido, solicitudes, documentos, camiones, odoo,
                        envios, bodega, ruta, reportes, conversion; transversales:
                        permisos, usuarios, bitacora, tiempo-real. Cada uno con
                        servicio.ts, esquemas.ts (Zod), acciones.ts y sus pruebas *.test.ts
src/componentes/ui/     componentes de shadcn/ui con los tokens del design system
src/lib/                cliente de Prisma, las dos configuraciones de Better Auth, sesión
prisma/                 schema.prisma, migraciones y seed.ts
scripts/                crear-admin, respaldo de la base de datos y scripts del plan y de los agentes (16/10)
plan/                   hoja de ruta, plan vivo y bitácora por módulo, informe de la investigación (16/10)
AGENTS.md y CLAUDE.md   instrucciones para los agentes de IA (CLAUDE.md solo contiene @AGENTS.md) (16/10)
.agents/skills/         skills de los agentes; un script las copia a .claude/skills/ (16/10)
pruebas-e2e/            pruebas de Playwright (16/10)
.github/workflows/      integración continua y despliegue automático (16/10)
Dockerfile              imagen de la aplicación para producción (16/10)
docker-compose.yml      Caddy, aplicación y PostgreSQL en el VPS (16/10)
Caddyfile               configuración de Caddy (16/10)
```

La importación de datos maestros ya no hace falta (13/10). Desde el 16/10 la carpeta `scripts/` contiene solo el comando `crear-admin` y el script de respaldo.

## Forma de trabajo

### Git

- Ramas:
  - `main`: solo versiones entregadas. **(16/10)** Después del primer despliegue, cada integración en `main` se despliega automáticamente en producción;
  - `develop`: integración;
  - **(16/10, decisión 76)** `<clave>/<ID>-<descripcion>`: una rama por tarea, con la clave de la persona y el ID de la tarea (por ejemplo, `josue/JM-03-bodega-preparacion`). Reemplaza a `feature/<modulo>-<descripcion>` y `fix/<descripcion>`.
- Todo entra a `develop` por pull request. Nadie hace push directo a `main` ni a `develop`.
- **Revisión de los pull requests (16/10, decisión 60):** los revisa, aprueba o rechaza **el bot de Claude** (`revision-claude`), y GitHub los integra solos en `develop` cuando todas las verificaciones obligatorias pasan. No hace falta aprobación humana. La integración de `develop` en `main` la hace solo el coordinador. Reemplaza, el mismo 16/10, a "cualquier integrante distinto del autor aprueba y Jordin revisa los que tocan el esquema, los permisos, la bitácora o la autenticación", y a la regla del 12/10 de que todos los revisaba Jordin.
- Un pull request se integra si corre sin errores, cumple la tarea, no incluye credenciales ni archivos generados, las migraciones corren desde cero y **(16/10)** pasan las revisiones de GitHub Actions (decisiones 47 y 66) y la del bot (decisión 60). La cuenta de GitHub del repositorio es de **GitHub Student**, que incluye GitHub Pro (16/10, resuelve P-95): por eso, cuando exista la integración continua, las reglas de protección de `develop` y `main` se configuran para **exigir** que esas revisiones pasen antes de integrar.
- **Tareas (16/10, decisión 71):** una tarea por archivo en `plan/tareas/`, con sus metadatos (responsable, hito, prioridad, dependencias y fecha programada), y `node scripts/tareas.mjs` para consultarlas y validarlas. El issue fijo "Tablero del plan" muestra el estado y avisa a cada persona. Reemplaza a GitHub Issues y Projects.
- **Integración (16/10, decisión 75):** *squash* en `develop`; `develop` es la **rama por defecto** del repositorio; `develop` se integra en `main` el 02/11/2026.
- Commits en español con prefijo: `feat:`, `fix:`, `docs:`, `db:`, `test:`, `chore:`; desde el 16/10, con el módulo y el ID de la tarea: `feat(bodega): marcado de filas (JM-03)`. Título del PR: `[<ID>] <título de la tarea>`.
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
  - las notas de investigación (`research_notes/`).

  **(16/10)** El HTML armado del prototipo de simulación ya **no** se excluye: se sube al repositorio (decisión 63).

  La carpeta de archivos subidos se agrega al `.gitignore` cuando el proyecto base la defina.

### Qué va al repositorio

- **Sí:** código, migraciones, semillas anonimizadas, `.env.example`, README, `specs/`, `plan/`, diagramas y prototipos. Del prototipo de simulación se suben el código fuente (`entregable-1/prototipos/simulacion/`) y, desde el 16/10, también el HTML armado (`prototipo-simulacion-incovsa.html`), aunque contiene datos reales de la empresa, porque el repositorio es privado (decisión 63).
- **No:** actas, propuesta, lineamientos, archivos de datos de la empresa (`docs_incovsa/`), documentos entregables .docx y .pdf, ni otros archivos con datos personales. Estos se guardan en la carpeta local y en el Google Drive del equipo.

### Definición de "terminado" para una tarea

1. El código está en `develop`, integrado por un pull request que aprobó el bot de Claude con todas las verificaciones obligatorias en verde (decisión 60).
2. Si cambió la base de datos, las migraciones y semillas están actualizadas.
3. Los casos de prueba del módulo están escritos y ejecutados, con evidencia.
4. La sección correspondiente del Documento 2 y del manual está redactada.
5. Esta carpeta `specs/` está actualizada si cambió alguna regla.
