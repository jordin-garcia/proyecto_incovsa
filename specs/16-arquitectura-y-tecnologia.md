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
| Entorno de ejecución | **Node.js 24 LTS** (12/10; antes 22) |
| Framework | **Next.js 16** (App Router) con TypeScript, en su versión más reciente con los parches de seguridad al día (16.4.0 al 12/10; antes Next.js 15) |
| Base de datos | **PostgreSQL 18** (12/10; antes 16) |
| ORM y migraciones | Prisma 7 |
| Autenticación | **Better Auth 1.7** (12/10; antes Auth.js), con inicio de sesión por **nombre de usuario** y contraseña, y sesiones guardadas en la base de datos. Contraseñas con **scrypt**, el algoritmo de Better Auth (antes bcrypt) |
| Permisos | Modelo propio de permisos por usuario en Prisma (29/09). Se verifican **en el servidor en cada operación**; el `proxy.ts` de Next.js (antes llamado middleware) es solo una primera barrera (12/10) |
| Interfaz | Tailwind CSS y shadcn/ui, configurados con los tokens del design system del prototipo aprobado ([20-prototipo-aprobado.md](20-prototipo-aprobado.md)) |
| Lectura de .xlsx | **SheetJS Community Edition 0.20.3**, instalada desde el sitio oficial (`npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), **no** desde el registro de npm, cuya versión 0.18.5 está abandonada y es vulnerable. Medidas en "Decisiones técnicas" (12/10) |
| Validación | Zod, en cliente y servidor |
| Exportación de reportes | PDF y Excel, como en el prototipo aprobado ([10-picking-reportes.md](10-picking-reportes.md)) |
| Pruebas automatizadas | Vitest. **La conversión, la lectura del archivo de Odoo y la verificación de permisos y sedes deben tener pruebas obligatoriamente** (los movimientos de existencias ya no existen; permisos y sedes desde el 12/10) |
| Control de versiones | Git y GitHub, repositorio privado |

## Almacenamiento

| Qué | Dónde |
|---|---|
| Datos | PostgreSQL |
| Imágenes del sitio | **Cloudflare R2, plan gratuito**. En la base de datos solo se guarda su dirección |
| Documentos técnicos (FT, HS, COA) | **Google Drive de la empresa** (13/10). En la base de datos solo se guardan los enlaces, que el sistema muestra únicamente a quien tiene permiso. El sistema ya no guarda archivos PDF |

## Servicios externos

| Servicio | Uso |
|---|---|
| Cloudflare R2 | Imágenes del sitio y, en un bucket privado aparte, los respaldos (12/10) |
| Google Drive de la empresa | Aloja los documentos técnicos. El sistema guarda sus enlaces, muestra la vista previa de Drive y el enlace de descarga según los permisos (13/10) |
| Odoo | Un enlace al inicio de sesión. Además, Facturación **lee el archivo .xlsx que el facturador exporta de Odoo** (29/09). No hay conexión directa con Odoo |

No hay más integraciones. La integración directa con Odoo es a futuro y está fuera del alcance (29/09). **El sistema no envía correos** (13/10): las solicitudes de contacto solo se guardan en el sistema y las contraseñas las restablecen Gerencia o Soporte, así que no hace falta una cuenta SMTP.

## Seguridad (12/10 y 14/10)

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
- El tiempo de expiración de las sesiones sigue pendiente (P-07).

### Entradas y archivos

- **Todo lo que llega al servidor se valida con Zod** (RNF-05): formularios, parámetros y el contenido del archivo de Odoo.
- Archivos subidos:
  - el .xlsx de Odoo y las imágenes se validan por su **contenido**, no solo por la extensión;
  - el servidor genera el nombre con que se guarda cada imagen en R2.
- Enlaces de la documentación interna (13/10): se aceptan solo direcciones `https://` de Google Drive (`drive.google.com` o `docs.google.com`). El sistema obtiene el identificador del archivo y arma con él la dirección de la vista previa y la de descarga; nunca inserta en la página una dirección que no sea de Google Drive.
- **Base de datos:** solo consultas de Prisma, que son parametrizadas. No se arman consultas SQL uniendo textos (no se usa `$queryRawUnsafe` con datos del usuario).
- **Contenido de los usuarios y del archivo de Odoo** (noticias, solicitudes, clientes, sectores, productos y lotes del archivo): se muestra siempre escapado. No se usa `dangerouslySetInnerHTML` con ese contenido.
- **Peticiones falsificadas (CSRF):** las acciones del servidor de Next.js verifican el origen; las rutas de la API que cambian datos también lo verifican.

### Cabeceras y transporte

- HTTPS en todo el sitio (RNF-12), con HSTS.
- Cabeceras de seguridad (RNF-16): `Content-Security-Policy` (que permita las imágenes de Cloudflare R2, los mapas insertados de Google Maps y la vista previa de Google Drive, specs/05), `X-Content-Type-Options: nosniff`, `Referrer-Policy` y protección contra que otro sitio inserte el nuestro en un marco (`frame-ancestors`).
- Los errores que ve el usuario no muestran detalles técnicos; el detalle queda solo en el registro del servidor.

### Secretos y dependencias

- Claves, contraseña de la base de datos y credenciales de R2 solo en variables de entorno, fuera del repositorio (RNF-10).
- **Dependencias al día** (RNF-16): Dependabot de GitHub activado, `npm audit` en cada pull request y el archivo de bloqueo (`package-lock.json`) en el repositorio. Los parches de seguridad de Next.js, Better Auth y Prisma se aplican en cuanto salen.

### Respaldos

- Los respaldos de PostgreSQL son **automáticos** y se prueba la restauración (RNF-09). Desde el 13/10 no hay PDF en el servidor: los documentos técnicos están en el Google Drive de la empresa.
- Frecuencia: **diaria, en la noche** (`pg_dump` de la base). Se conservan **7 diarios y 4 semanales**.
- Destino: fuera del servidor, en un bucket **privado** de Cloudflare R2, distinto del de las imágenes. Los detalles dependen del hosting (P-10).

### Mantenibilidad

- Las reglas de negocio (conversión RN-01, lectura del archivo de Odoo, permisos y sedes, armado de rutas y pedidos) viven en módulos de la capa de negocio, separados de las pantallas. Se prueban solas y se podrán reutilizar cuando exista la conexión directa con Odoo.
- Pruebas automatizadas obligatorias de esas reglas (ver "Stack").

## Despliegue

- Hace falta un servidor capaz de ejecutar Node.js y PostgreSQL. Un hosting compartido tradicional (cPanel con PHP) no sirve.
- La contraparte iba a probar la compatibilidad del hosting actual; el resultado está pendiente (P-10).
- La empresa paga el hosting y el dominio.
- El Entregable 2 se prueba **solo en las computadoras del equipo**. No hay entorno de pruebas en internet ni se contrata un servicio de terceros (12/10, resuelve P-11).

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
| 10 | Tiempo real en Bodega (P-39, RNF-13) | **SSE** desde una ruta de la API con el entorno de Node.js. Ante cualquier cambio, el servidor avisa "cambió la sede X" y cada pantalla vuelve a pedir el estado. Si la conexión se cae, la pantalla consulta cada pocos segundos hasta reconectarse. El aviso vive en la memoria del servidor (un solo proceso); si algún día hay varios procesos, se cambia a `LISTEN/NOTIFY` de PostgreSQL. Para el Entregable 2 se puede empezar con la consulta periódica, porque la pantalla funciona igual |
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
| 26 | Cuentas en Better Auth con el mismo nombre de usuario en los dos sistemas (RN-54) | Better Auth exige que su nombre de usuario y su correo sean únicos en toda la tabla de usuarios, y el correo es obligatorio. Cada cuenta guarda: el nombre de usuario que escribe la persona (`display_username`), único junto con el sistema; una **clave de acceso interna** única formada por el sistema y el nombre de usuario (`username`, por ejemplo `picking.maria.argueta`), que es la que recibe Better Auth al iniciar sesión; y un correo interno único derivado de esa clave, que nunca se muestra ni se usa para enviar correos. El correo real, opcional, se guarda en un campo aparte |

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
src/lib/                cliente de Prisma, Better Auth, sesión
prisma/                 schema.prisma, migraciones y seed.ts
```

La carpeta `scripts/` con la importación de datos maestros ya no hace falta (13/10).

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
