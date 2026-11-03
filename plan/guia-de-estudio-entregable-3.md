# Guía de estudio · Entregable 3

Para preparar la **prueba individual de conocimientos del miércoles 04/11** y las preguntas individuales de la **presentación del lunes 09/11**. Cada tema tiene lo esencial y dónde ampliarlo en `specs/`. Al final hay 25 preguntas de práctica con su respuesta.

> Todo sale de `specs/` y del código de `develop` al 03/11/2026. Si algo de esta guía no coincide con `specs/`, vale `specs/`.

---

## 1. Problemática de INCOVSA

- **INCOVSA** (Industria del Cuero Covadonga S. A.) compra y vende **productos químicos** en Guatemala desde hace más de 30 años. Atiende 9 industrias (cuero, textil, cerería, hulera, medicamentos, limpieza, alimentación animal, tratamiento de agua y lavandería) y comparte productos y existencias con **Inquiserca**, del mismo grupo.
- Tiene **tres sedes con bodega**: Quetzaltenango (oficinas y bodega central), Guatemala y Escuintla. Salen unos 20 envíos en ruta al día en Quetzaltenango, 10 a 15 en Guatemala y 8 a 10 en Escuintla.
- Usa **Odoo** (ERP) para casi toda su operación, incluido el inventario. Pero **el picking** (qué sacar de la bodega para cada envío) **se llevaba en un Excel** (`Picking II.xlsm`).
- Odoo factura en **kilogramos**, y en la bodega se sacan **unidades físicas** (sacos, toneles, garrafas). Hay que convertir los kg facturados en unidades, con resto en kg cuando la venta es fraccionada.
- En internet solo tenía una **página básica en Google Sites**, sin sitio corporativo propio.

**Por qué importa:** entre las tres sedes salen unos 38 a 45 envíos en ruta al día, y su picking se armaba en un Excel. INCOVSA pidió, entre otras cosas, el reporte diario de kilogramos y sacos despachados (`specs/10`). Además necesitaba una presencia digital propia que pudiera administrar sin programar.

📖 `specs/00-proyecto.md` (La empresa, Volumen de operación), `specs/01-alcance.md`

## 2. Solución: una aplicación con dos sistemas

Es **una sola aplicación web** en **incovsa.com**, con dos componentes:

| Sistema | Qué resuelve |
|---|---|
| **Sitio web institucional autoadministrable** | Presencia digital de la empresa: Inicio, Quiénes somos, Industrias, Productos (catálogo sin precios), Noticias y Contacto. Un **panel (CMS)** para cambiar textos e imágenes sin tocar código, una **bandeja de solicitudes** del formulario de contacto y la **documentación interna** protegida por permisos (enlaces de Google Drive) |
| **Sistema de control logístico de bodega (picking)** | Lo que pasa **después de facturar en Odoo**: carga del archivo .xlsx de Odoo, armado de rutas y pedidos, **conversión de kg a unidades**, tablero de preparación en tiempo real, despacho, ruta del piloto y reportes |

- **Tres niveles de acceso:** sitio público (cualquiera), documentación interna (usuarios con permiso) y picking (usuarios del picking según sus permisos y sedes).
- **Acceso personal:** botón del sitio que pide **usuario**, luego el **sistema** (Odoo como enlace, administración del sitio o picking) y por último la **contraseña**.
- La **sede piloto** es Quetzaltenango (referencias que empiezan con `XE`), pero los datos y permisos contemplan las tres sedes.

📖 `specs/01-alcance.md`, `specs/03-roles-y-accesos.md` (Acceso personal)

## 3. Arquitectura general y por qué se eligió

- **Monolito modular en capas, con renderizado en el servidor:** presentación (rutas y vistas de Next.js) → lógica de negocio (`src/modulos/<modulo>/`) → acceso a datos (Prisma) → PostgreSQL.
- **Una sola aplicación Next.js** contiene el sitio, el panel, la documentación interna y los cinco módulos del picking. Los dos sistemas comparten las tablas de usuarios y sesiones, el modelo de permisos y la bitácora, y se despliegan como una sola imagen.
- Las **reglas de negocio** (conversión, lectura del archivo de Odoo, permisos y sedes, armado de rutas) viven en la capa de negocio, separadas de las pantallas: se prueban solas y se podrán reutilizar cuando exista la conexión directa con Odoo.
- **Autorización en dos niveles:** `proxy.ts` (el antiguo middleware) solo redirige a quien no tiene sesión; **cada operación del servidor** vuelve a verificar sesión, permiso y sede.
- **PostgreSQL:** base relacional, con transacciones para el envío a Bodega y la bitácora.
- **Producción:** un **VPS** (como mínimo: Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM, 80 GB SSD, IP fija y SSH con llave) con **Docker Compose** y tres servicios: **Caddy**, la aplicación y PostgreSQL 18. Un hosting compartido (cPanel con PHP) no sirve, porque hace falta Node.js y PostgreSQL. Lo contrata y lo paga INCOVSA.
- **Caddy** da HTTPS con certificado automático y deja pasar los avisos en tiempo real sin búfer.
- La aplicación corre en **un solo proceso**, porque el aviso en tiempo real (SSE) vive en la memoria del servidor.
- **Docker solo en producción:** en las computadoras del equipo se usa Node.js 24 y PostgreSQL 18 instalados directamente.

📖 `specs/16-arquitectura-y-tecnologia.md` (Arquitectura, Despliegue, decisiones 10, 27 a 31)

## 4. Tecnologías principales

| Tecnología | Para qué |
|---|---|
| **Node.js 24 LTS** y **TypeScript** | Entorno de ejecución y lenguaje |
| **Next.js 16** (App Router) y **React 19** | Framework: páginas, renderizado en el servidor, acciones del servidor y rutas de la API |
| **PostgreSQL 18** | Base de datos |
| **Prisma 7** | ORM y migraciones (consultas parametrizadas) |
| **Better Auth 1.7** | Inicio de sesión por nombre de usuario y sesiones en la base. Se eligió porque Auth.js quedó en modo mantenimiento |
| **Zod** | Validación de toda entrada, en el navegador y en el servidor |
| **React Hook Form** | Formularios, con el mismo esquema Zod que valida el servidor |
| **Tailwind CSS** y **shadcn/ui** | Interfaz con los tokens del design system del prototipo |
| **dnd-kit** | Arrastrar y soltar en Facturación, Bodega y Ruta |
| **SheetJS 0.20.3** | Leer el .xlsx de Odoo y exportar a Excel. Se instala desde `vendor/`, no desde npm, cuya versión 0.18.5 está abandonada y es vulnerable |
| **pdfmake** | Exportar reportes a PDF |
| **date-fns 4** con `@date-fns/tz` | Fechas en la hora de Guatemala |
| **file-type** y **sharp** | Validar las imágenes por su contenido y volver a codificarlas en WebP |
| **Cloudflare R2** | Imágenes del sitio y, en otro bucket privado, los respaldos |
| **Vitest** y **Playwright** | Pruebas unitarias y de integración (contra PostgreSQL real) y de extremo a extremo |
| **GitHub Actions** | Integración continua y despliegue automático, más herramientas de calidad y seguridad (ESLint, Prettier, Semgrep, gitleaks, OSV-Scanner, axe, OWASP ZAP, entre otras) y el bot de revisión con Claude |
| **Docker Compose** y **Caddy** | Producción en el VPS |

📖 `specs/16-arquitectura-y-tecnologia.md` (Stack, Almacenamiento, Servicios externos)

## 5. Base de datos

El esquema está en `prisma/schema.prisma` (32 modelos). Las entidades principales:

**Acceso**
- **SEDE** (con su prefijo de Odoo `XE`, `GT` o `ESC`) y **USUARIO** (rol en texto libre, sistema: sitio, picking o ambos).
- **PERMISO**, con dos tablas N:M: **USUARIO_PERMISO** y **USUARIO_SEDE**.
- **BITACORA**: una sola tabla para los dos sistemas. No se edita ni se borra.

**Picking**
- **PEDIDO_FACTURADO** (una referencia de Odoo de un solo cliente) **1:N DETALLE_PEDIDO_FACTURADO** (producto, lote, Peso de Conversión y cantidad en kg).
- **OPCION_ENVIO**: dos por sede, "Envío por camión" y "Cliente recoge en bodega", con camión, piloto y fecha y hora programadas.
- **ENVIO**: lo que se manda a Bodega; su tipo es **ruta** o **pedido**, con número del día. Reúne **1:N** pedidos facturados.
- **LINEA_PREPARACION**: las líneas de Bodega, una por (envío, producto, lote, Peso de Conversión), con su marcado.
- **ESTADO_ENVIO** e **HISTORIAL_ESTADO** (fecha, hora y usuario de cada cambio).
- **ENTREGA_RUTA**: una fila por cliente de la ruta, con el recorrido final.
- **CAMION** (capacidad en kg y sede).

**Sitio**
- CONTENIDO_INSTITUCIONAL, CONFIGURACION_SITIO, VALOR, INDUSTRIA, **PRODUCTO_SITIO N:M INDUSTRIA** (por PRODUCTO_INDUSTRIA), NOTICIA e **IMAGEN** (galerías de hasta 5; en la base solo se guarda la URL de R2).
- **PRODUCTO_DOCUMENTADO** (nombre, país, lote y tres enlaces de Google Drive), **SOLICITUD_CONTACTO** (con folio `SOL-2026-0001`), INFORMACION_CONTACTO, PAIS, DEPARTAMENTO y MUNICIPIO.

**Convenciones:** cantidades en `Decimal(12,3)`; fechas en UTC, con días y numeraciones calculados en la hora de Guatemala; todas las tablas guardan su fecha de creación (RN-57); camiones y usuarios se eliminan de forma **lógica**.

📖 `specs/14-modelo-de-datos.md`, `specs/16` (decisiones 1 a 6, 18 y 19)

## 6. Seguridad

- **Autenticación:** Better Auth con usuario y contraseña. **Dos configuraciones**, una por sistema, cada una con su cookie: se puede estar conectado a los dos a la vez y cerrar uno no cierra el otro. Cookies `HttpOnly`, `Secure`, `SameSite=Lax` y, en producción, con el prefijo `__Host-`. La sesión vence a los 7 días sin uso.
- **Permisos por usuario y sede:** el acceso depende de **permisos marcados con casillas** (módulo y acción), no del rol. El rol es texto libre; solo **Gerencia** y **Soporte** dan acceso total. Cada usuario del picking ve solo las **sedes** que tiene asignadas. Cada operación del servidor llama a **`exigirPermiso`** (`src/modulos/permisos/servicio.ts`), que toma usuario, permisos y sede de la sesión y de la base, nunca de la petición. Hay dos excepciones:
  - la **administración de usuarios** usa `exigirAccesoTotal`, porque solo la hacen Gerencia y Soporte;
  - la **recepción del formulario de Contacto** es la única acción sin sesión, porque quien escribe no tiene cuenta. Valida con un esquema Zod estricto y admite hasta 5 solicitudes por hora desde una misma IP.

  Ocultar un botón no es un control de acceso.
- **Validación:** toda entrada se valida con **Zod** en el servidor. El .xlsx y las imágenes se validan por su **contenido**, no por la extensión. Las imágenes (JPG, PNG o WebP, hasta 5 MB) se vuelven a codificar con sharp, que quita EXIF y GPS. El contenido de los usuarios se muestra siempre escapado. Las acciones del servidor verifican el origen (CSRF).
- **Cabeceras:** HTTPS con HSTS, **Content-Security-Policy** con nonce por respuesta, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.
- **Contraseñas:** cifradas con **scrypt**, con sal. Mínimo 8 caracteres; se rechazan:
  - las 10 000 más comunes de la lista pública SecLists (que tengan 8 o más caracteres);
  - las que contienen una palabra de la empresa;
  - las que contienen el nombre de usuario, si este tiene 4 o más caracteres. Las escriben y las restablecen Gerencia o Soporte (no hay recuperación por correo). Al restablecer, eliminar o desactivar un usuario se cierran todas sus sesiones.
- **Límite de intentos:** 5 fallos seguidos bloquean al usuario 15 minutos; 20 fallos desde una IP en 15 minutos bloquean esa IP 15 minutos. El mensaje no dice si falló el usuario o la contraseña.
- **Bitácora (RN-39):** registra inicios de sesión, intentos fallidos y bloqueos, cargas de archivos, envíos, cambios de estado, usuarios, permisos, contraseñas y cambios del sitio. Se escribe **en la misma transacción** que la operación. **No** registra el marcado ni la prioridad de Bodega.
- **Secretos:** solo en variables de entorno del servidor, nunca en el repositorio.

📖 `specs/16` (Seguridad), `specs/03-roles-y-accesos.md`, `specs/12` (Bitácora), `specs/15` (RNF-03 a RNF-05, RNF-15, RNF-16)

## 7. Despliegue, respaldos y restauración

**Despliegue**
- Solo hay **producción** en internet (el VPS). El desarrollo es local y la integración continua corre en GitHub Actions.
- El **primer despliegue** se hace cuando la aplicación está completa, al integrar `develop` en `main`, después de la entrega académica del 04/11 y en cuanto INCOVSA entregue los accesos. Si no llegan a tiempo, la demostración es en local (decisión 90).
- Después, **cada despliegue es automático**: al integrar en `main`, GitHub Actions corre las verificaciones, compila la imagen de Docker y la guarda en **GHCR**. Luego entra al VPS por SSH, descarga la imagen, aplica las migraciones (`prisma migrate deploy`) y reinicia la aplicación. El VPS no compila.
- **Volver atrás:** se arranca una de las **últimas 5 imágenes** que se conservan.
- El primer administrador se crea con `npm run crear-admin`, que pide usuario y contraseña en la terminal.

**Respaldos (RNF-09)**
- **Automáticos, cada noche:** `cron` del VPS → `pg_dump` dentro del contenedor de PostgreSQL → `rclone` sube el archivo a un **bucket privado de R2**, distinto del de las imágenes (`scripts/respaldo.sh`).
- Se conservan **7 diarios y 4 semanales**. La configuración sin secretos (`docker-compose.yml`, `Caddyfile`, `.env.produccion.example`) está en el repositorio. Los secretos se entregan por un medio seguro (Anexo J).

**Restauración**
- `scripts/restaurar.sh` descarga el respaldo de R2 y lo restaura en una base nueva. Para sobrescribir la base de producción pide una frase de confirmación exacta.
- La **prueba de restauración** corre en GitHub Actions (`produccion-respaldo.yml`, manual y semanal). Respalda una base de prueba, la restaura en otra y comprueba que cada tabla tenga la misma cantidad de filas. El procedimiento está en el Documento 5.

📖 `specs/16` (Despliegue, Respaldos, decisiones 27 a 34)

## 8. Funcionamiento: el flujo completo

Los lineamientos (`specs/17`) piden demostrar: pedido facturado → conversión → picking → preparación → actualización de inventario → carga → despacho → estado → reporte. Así se corresponde con el sistema:
- la **conversión** se ve en Bodega (y en el detalle de cada ruta o pedido);
- la **carga de vehículos** es el armado de "Envío por camión" en Facturación, con camión, piloto y control de peso (no hay confirmación de carga, P-45);
- la **actualización de inventario** está excluida (P-58, tema 10).

En el orden en que se usa el sistema:

| Paso | Dónde | Qué pasa |
|---|---|---|
| **1. Pedido facturado** | Odoo → Facturación | El facturador exporta de Odoo el .xlsx de salidas y lo **carga**. Solo entran las referencias en estado **"Hecho"**. De `XE-IN/SALIDA/03539`, el número es `03539` y `XE` es Quetzaltenango. Cada referencia es un **pedido facturado** de un cliente y aparece en el **tablero de pedidos facturados** |
| **2. Carga** (armado) | Facturación | Arrastra los pedidos facturados a **"Envío por camión"** (elige camión y piloto, con control de peso y una alerta de sobrepeso que solo informa) o a **"Cliente recoge en bodega"**. Los ordena y escribe la fecha y hora programadas |
| **3. Picking** | Facturación → Bodega | Al pulsar **"Enviar a Bodega"** se crea, en una sola transacción, la **ruta** o el **pedido** con su número del día, sus líneas y su estado **En Preparación** |
| **4. Conversión** | Bodega | Las líneas se **agrupan por producto, lote y Peso de Conversión** (RN-51) y cada fila muestra **"N unidades + R kg"** (RN-01) |
| **5. Preparación** | Bodega (módulo y tablero en TV o tableta) | Los operarios **marcan** cada fila al sacarla. El marcado y la prioridad se ven **al instante** en todas las pantallas de la sede |
| **6. Despacho** | Bodega | Con todas las filas marcadas, **"Pedido Despachado"** (pasa a Despachado) o **"Ruta Despachada"** (pasa a En Ruta y aparece al piloto) |
| **7. Estado** | Ruta | El piloto ve sus clientes (una fila por cliente), ordena el recorrido y pulsa **"Ruta Entregada"**: la ruta pasa a **Entregado** y se guarda el recorrido |
| **8. Reporte** | Reportes | **Despacho** por producto (kg y unidades), **Rutas realizadas** y **Bitácora**, por periodo (diario, semanal, mensual, anual o rango), con exportación a Excel y PDF |

**Estados (RN-11):**
```
Pedido:  Pendiente → En Preparación → Despachado
Ruta:    Pendiente → En Preparación → En Ruta → Entregado
```
"Pendiente" no se guarda como estado: la ruta o el pedido no existe hasta que se envía a Bodega. Cancelar una opción de envío regresa sus pedidos facturados al tablero.

### Conversión de kg a unidades (RN-01)

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − unidades × Peso de Conversión
```

**Ejemplo:** un cliente compra **60 kg** de un producto que viene en sacos de **25 kg** (Peso de Conversión 25).
- 60 ÷ 25 = 2,4 → **2 unidades** (parte entera, sin redondear).
- 60 − 2 × 25 = **10 kg** de resto.
- Bodega muestra **"2 unidades + 10 kg"**: saca 2 sacos completos y pesa 10 kg aparte.

Otros casos: 50 kg ÷ 25 → "2 unidades" (sin "+ 0 kg"); 10 kg ÷ 25 → "0 unidades + 10 kg"; 110 kg ÷ 55 → "2 unidades".

- El **Peso de Conversión** viene en cada línea del archivo de Odoo (columna `Movimientos de stock/Producto/Peso`). El sistema nunca lo deduce del nombre del producto.
- El cálculo es **exacto**: cantidades en `Decimal(12,3)` y la división en **gramos enteros**, sin punto flotante (`convertir()` en `src/modulos/conversion/servicio.ts`).
- Si un pedido facturado trae un Peso de Conversión vacío o ≤ 0, **no se carga** y se avisa en el resumen (RN-50).
- La empresa validó **15 casos exactos**, que son prueba obligatoria (Documento 6).

📖 `specs/12-reglas-de-negocio.md` (Conversión, Estados), `specs/06` a `specs/10`

## 9. Módulos principales

**Sitio web**

| Módulo | Qué hace |
|---|---|
| Sitio público | Inicio, Quiénes somos (historia, misión, visión y 5 valores), Industrias, Productos (catálogo con búsqueda y Productos Recomendados), Noticias y Contacto (Quetzaltenango y Guatemala, con mapa) |
| Formulario de contacto | Solicitud, queja o reclamo. **Se guarda en el sistema** (no se envía por correo) y entrega un folio |
| Panel (CMS) | Contenido institucional y logotipos, industrias, catálogo, noticias, información de contacto, solicitudes, documentación interna y usuarios. Galerías de hasta 5 imágenes que rotan cada 5 segundos |
| Solicitudes | Bandeja con responsable, comentario y estado (Asignado, En proceso, Solucionado) |
| Documentación interna | Productos documentados con enlaces de Google Drive a su ficha técnica, hoja de seguridad y certificado de análisis. Ver y descargar dependen del permiso |

**Picking (cinco módulos)**

| Módulo | Qué hace |
|---|---|
| **Facturación** | Carga el .xlsx de Odoo, muestra el tablero de pedidos facturados y arma rutas y pedidos |
| **Bodega** | Tablero de preparación: lote resaltado, conversión, marcado, prioridad, orden por peso, despacho y pantalla completa en modo claro u oscuro |
| **Ruta** | Rutas En Ruta del piloto, con una fila por cliente, recorrido y "Ruta Entregada" |
| **Reportes** | Despacho, Rutas realizadas y Bitácora, con filtro de periodo y exportación a Excel y PDF |
| **Configuración** | Camiones (con capacidad en kg) y usuarios del picking (rol, sedes y permisos) |

📖 `specs/05-sitio-web.md`, `specs/06` a `specs/11`

## 10. Exclusiones aprobadas

- **Control de inventario (P-58):** el sistema **no** lleva existencias, entradas ni salidas. Lo decidió **INCOVSA el 29/09**, porque **Odoo ya lleva el inventario de todas las bodegas** y el sistema está pensado para integrarse con Odoo en el futuro. Los lineamientos pedían "actualización de inventario" en la demostración; el **docente aprobó la exclusión el 16/10**. En la demostración, ese paso se explica así.
- Con el inventario salieron las **devoluciones**, los **traslados entre sedes**, la validación y el descuento de existencias, y el módulo de Inventario (`specs/09`).
- **Otras exclusiones:**
  - integración directa con Odoo (solo se lee el .xlsx);
  - catálogos de productos, clientes y sectores en el picking (los datos del archivo se usan tal como vienen);
  - control de lotes y ubicaciones;
  - envío de correos;
  - comercio electrónico y precios;
  - planificación de rutas en mapa;
  - confirmación de carga en el camión.

  Ninguna se presenta como implementada.

📖 `specs/01-alcance.md` (Fuera del alcance), `specs/09-picking-inventario.md`, `specs/17-lineamientos-del-curso.md` (P-58)

---

## Preguntas de práctica

1. **¿Qué problema logístico resuelve el sistema de picking?**
   El picking se llevaba en un Excel. El sistema carga los pedidos facturados de Odoo, convierte los kg en unidades físicas y acompaña la preparación, el despacho, la entrega y los reportes.

2. **¿Cuáles son los dos componentes de la aplicación?**
   El sitio web institucional autoadministrable (con panel y documentación interna) y el sistema de control logístico de bodega (picking).

3. **¿Qué comparten los dos sistemas?**
   Los dos sistemas comparten usuarios, sesiones, permisos y bitácora, viven bajo incovsa.com y se despliegan juntos como una sola imagen.

4. **¿Cuál es la fórmula de la conversión?**
   unidades = parte entera (kg ÷ Peso de Conversión) y resto = kg − unidades × Peso de Conversión.

5. **¿Cuánto da 60 kg con Peso de Conversión 25?**
   "2 unidades + 10 kg".

6. **¿De dónde sale el Peso de Conversión?**
   De la columna `Movimientos de stock/Producto/Peso` de cada línea del archivo de Odoo. Nunca se calcula a partir del nombre del producto.

7. **¿Por qué la conversión se calcula en gramos enteros?**
   Para que sea exacta: el punto flotante puede dar errores de redondeo. Las cantidades se guardan como `Decimal(12,3)`.

8. **¿Qué pasa si una línea trae el Peso de Conversión en 0?**
   Ese pedido facturado no se carga y se avisa en el resumen de la carga (RN-50).

9. **¿Qué es un pedido facturado y qué es una ruta?**
   Un pedido facturado es una referencia de Odoo de un solo cliente. Una ruta es lo que se envía a Bodega desde "Envío por camión", con uno o varios pedidos facturados; si lo recoge el cliente, se llama pedido.

10. **¿Qué referencias del archivo se cargan?**
    Solo las que están en estado "Hecho". Si el archivo trae un prefijo desconocido, más de una bodega o una bodega distinta de la sede del facturador, no se carga nada. Un pedido facturado con una cantidad o un Peso de Conversión inválido no se carga, y se avisa.

11. **¿Cuáles son los estados de una ruta?**
    En Preparación → En Ruta → Entregado. Un pedido termina en Despachado.

12. **¿Cómo se agrupan las líneas en Bodega?**
    Una fila por producto, lote y Peso de Conversión, sumando los kg de todos los clientes de la ruta o del pedido (RN-51).

13. **¿Cómo se ve el marcado al instante en todas las pantallas?**
    Con SSE: el servidor avisa "cambió la sede X" y cada pantalla vuelve a pedir su estado. Sin conexión, consulta cada 5 segundos.

14. **¿Qué controla la alerta de sobrepeso?**
    Que la suma de los pedidos facturados de "Envío por camión" no exceda la capacidad del camión. Solo informa: se puede enviar igual.

15. **¿El acceso depende del rol?**
    No: depende de permisos por usuario (módulo y acción) y de sus sedes. Solo Gerencia y Soporte, por su rol, tienen acceso total.

16. **¿Dónde se verifican los permisos?**
    En el servidor, en cada operación, con `exigirPermiso` (la administración de usuarios usa `exigirAccesoTotal`). La única acción sin sesión es la recepción del formulario de Contacto. `proxy.ts` es solo una primera barrera, y ocultar un botón no protege nada.

17. **¿Cómo se guardan las contraseñas?**
    Cifradas con scrypt, con sal. Las escriben y las restablecen Gerencia o Soporte; no hay recuperación por correo.

18. **¿Qué protege contra ataques de fuerza bruta?**
    El límite de intentos: 5 fallos bloquean al usuario 15 minutos y 20 fallos desde una IP en 15 minutos bloquean la IP.

19. **¿Qué registra la bitácora y qué no?**
    Registra inicios de sesión, intentos fallidos, cargas, envíos, cambios de estado, usuarios y cambios del sitio. No registra el marcado ni la prioridad de Bodega.

20. **¿Qué tecnologías forman el stack principal?**
    Next.js 16 con React 19 y TypeScript, PostgreSQL 18 con Prisma 7, Better Auth, Zod, Tailwind con shadcn/ui, SheetJS y pdfmake.

21. **¿Cómo se despliega en producción?**
    En un VPS con Docker Compose (Caddy, la aplicación y PostgreSQL). Al integrar en `main`, GitHub Actions compila la imagen, la sube a GHCR y la despliega por SSH con las migraciones.

22. **¿Cómo son los respaldos?**
    Cada noche, `pg_dump` saca la base y `rclone` la sube a un bucket privado de R2. Se conservan 7 diarios y 4 semanales. Se restaura con `scripts/restaurar.sh`, y una prueba semanal de GitHub Actions comprueba la restauración.

23. **¿Dónde se guardan las imágenes y los documentos técnicos?**
    Las imágenes, en Cloudflare R2 (en la base solo va la URL). Los documentos, en el Google Drive de la empresa: el sistema guarda sus enlaces y los muestra según los permisos.

24. **¿Por qué no hay control de inventario?**
    Porque Odoo ya lleva el inventario de todas las bodegas. INCOVSA lo sacó del alcance el 29/09 y el docente aprobó la exclusión el 16/10 (P-58).

25. **¿Qué pasa con las solicitudes del formulario de contacto?**
    Se guardan en el sistema con un folio y se gestionan en la bandeja del panel (responsable, comentario y estado). No se envían por correo.
