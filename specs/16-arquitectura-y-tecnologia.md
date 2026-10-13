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
| Lectura de .xlsx | **SheetJS Community Edition 0.20.3**, instalada desde el sitio oficial (`npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), **no** desde el registro de npm, cuya versión 0.18.5 está abandonada y es vulnerable. Medidas en "Decisiones técnicas" (12/10) |
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
| Cloudflare R2 | Imágenes del sitio y, en un bucket privado aparte, los respaldos (12/10) |
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
- **Límite de intentos de inicio de sesión** (RNF-15): 5 intentos fallidos seguidos de un mismo usuario lo bloquean 15 minutos, y 20 intentos fallidos desde una misma dirección IP en 15 minutos la bloquean 15 minutos. Un inicio de sesión correcto reinicia el conteo del usuario. Los intentos se cuentan en la base de datos, a partir de la bitácora (RN-39), para que no se pierdan si se reinicia el servidor.
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

- Los respaldos de PostgreSQL y de los PDF del servidor son **automáticos** y se prueba la restauración (RNF-09).
- Frecuencia: **diaria, en la noche** (`pg_dump` de la base y copia de la carpeta de PDF). Se conservan **7 diarios y 4 semanales**.
- Destino: fuera del servidor, en un bucket **privado** de Cloudflare R2, distinto del de las imágenes. Los detalles dependen del hosting (P-10).

### Mantenibilidad

- Las reglas de negocio (conversión RN-01, lectura del archivo de Odoo, permisos y sedes, armado de pedidos) viven en módulos de la capa de negocio, separados de las pantallas. Se prueban solas y se podrán reutilizar cuando exista la conexión directa con Odoo.
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
| 2 | Eliminar registros con historial (P-42) | **Eliminación lógica** en productos, clientes, sectores, camiones y usuarios: el registro guarda la fecha de eliminación, desaparece de listas y selectores y el historial queda intacto. Un usuario eliminado no puede iniciar sesión y su nombre de usuario queda reservado |
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
| 11 | Dónde vive el orden compartido | En la base de datos se guarda **solo el orden actual**, sin historial ni bitácora: la posición de cada pedido en la cola de Bodega, la de cada línea de preparación y la de cada cliente de la ruta antes de entregar. Al pulsar "Pedido Entregado", el orden de la ruta queda como recorrido (RN-29). El marcado ya se guarda en LINEA_PREPARACION ([14](14-modelo-de-datos.md)) |
| 12 | Lectura del archivo de Odoo | SheetJS 0.20.3 (ver "Stack"), con la versión y la huella fijas en `package-lock.json`. Como `npm audit` y Dependabot no vigilan esa librería, en cada entrega se revisa a mano <https://cdn.sheetjs.com/advisories>. El archivo se rechaza si pesa más de **2 MB** (el de ejemplo pesa 25 KB con 80 referencias). Se lee solo en el servidor, solo las columnas que se usan, y todo se valida con Zod. Se ignoran las filas de agrupación (Referencia con texto, sin Contacto ni Producto). Si una línea de una referencia "Hecho" trae una cantidad vacía, no numérica o menor o igual a 0, ese pedido facturado no se carga y se avisa en el resumen de la carga, igual que cuando falta un producto (P-81) |
| 13 | Comparación del nombre del producto | Cada producto guarda una **clave normalizada** (mayúsculas, sin acentos, sin puntos y sin espacios), que es **única**. El nombre del archivo de Odoo se compara por esa clave. Así tampoco se pueden crear dos productos que solo se diferencien por un punto o un espacio (ver P-88) |

### Sitio

| # | Tema | Decisión |
|---|---|---|
| 14 | Productos Recomendados (RF-SW-17) | Primero los que comparten industria y después los de relleno, cada grupo en **orden alfabético** por nombre |

### Repositorio y operación

| # | Tema | Decisión |
|---|---|---|
| 15 | Estructura de carpetas | **Por módulo de dominio** (ver abajo). Se documenta en el Documento 2 |
| 16 | Semillas (P-37) y carga inicial | La semilla del repositorio (`prisma/seed.ts`) solo lleva datos que no son personales ni de producción: sedes, permisos, estados, los 15 productos de los casos de conversión ([12](12-reglas-de-negocio.md)), "Cliente de ejemplo 001…", "Usuario de ejemplo NN" y "Camión 1" a "Camión 3" con sus capacidades. Los datos reales se cargan con `npm run importar -- <ruta>`, que lee el Excel maestro limpio (P-35) **desde fuera del repositorio** y se puede correr varias veces sin duplicar: actualiza los productos por su clave y los clientes por nombre y sector (hay 2 nombres de cliente que se repiten con sectores distintos, [13](13-datos-maestros.md)) |
| 17 | Respaldos (RNF-09) | Ver "Respaldos" |

### Estructura de carpetas

```
src/app/(sitio)/        sitio público
src/app/panel/          panel del sitio y documentación interna
src/app/picking/        Facturación, Bodega, Ruta, Reportes y Configuración
src/app/api/            rutas de la API (SSE, descargas, exportaciones)
src/modulos/<modulo>/   conversion, odoo, pedidos, bodega, ruta, contenido, usuarios,
                        permisos, bitacora, reportes: servicio.ts, esquemas.ts (Zod),
                        acciones.ts y sus pruebas *.test.ts
src/componentes/ui/     componentes de shadcn/ui con los tokens del design system
src/lib/                cliente de Prisma, Auth.js, sesión
prisma/                 schema.prisma, migraciones y seed.ts
scripts/                importar-datos-maestros.ts
```

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
