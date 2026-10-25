---
id: DM-08
titulo: Contacto, formulario de solicitudes e información de contacto
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
depende_de: [DM-02, DM-04]
programada: 2026-10-23
requisitos: [RF-SW-06, RF-SW-15, RF-SW-19, RF-SW-22, RNF-05, CU-09]
pantallas: [sitio.js › contacto, sedes; panel.js › contacto; base.js › paises, nombrePais, GUATEMALA, MAPAS]
---

# DM-08 · Contacto, formulario de solicitudes e información de contacto

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 23/10 · **Depende de:** DM-02, DM-04

## Objetivo
La página de **Contacto** con el formulario de solicitudes, quejas o reclamos (que **solo se guarda en el sistema**) y la sección **Información de contacto** del panel.

## Contexto que debes leer
- `specs/05` §"Contacto" (tabla de campos) y la fila "Información de contacto" de §"Panel administrativo" **completos**
- `specs/04`: RF-SW-06, RF-SW-19, RF-SW-22; `specs/14` (SOLICITUD_CONTACTO con su folio, INFORMACION_CONTACTO, PAIS, DEPARTAMENTO, MUNICIPIO)
- `specs/16`: decisiones 45 (países) y 48 (React Hook Form con Zod); `specs/20`: CAM-74 y CAM-82
- `specs/03` (permiso `sit.contacto`)
- Prototipo: `#/contacto` y `#/panel/contacto?cuenta=ejemplo.08`; `sitio.js` › `contacto()` (campos, validaciones con `libphonenumber`, listas de Guatemala, folio, aviso "Solicitud recibida") y `sedes()`; `panel.js` › `contacto()`
- `## Resultado` de DM-02 y DM-04
- Context7: `libphonenumber-js`, React Hook Form con su resolvedor de Zod

## Qué hacer
1. **Formulario** (`/contacto`), con los campos y reglas de `specs/05`: tipo de mensaje (solicitud, queja o reclamo), nombre completo, empresa (opcional), correo (estructura válida, al salir del campo y al enviar), teléfono (opcional, con código de área por país y estructura válida para ese país), **país** (todos, obligatorio), **departamento** y **municipio** (solo si el país es Guatemala, y entonces obligatorios, de las tablas de la semilla), **sede** (solo Quetzaltenango y Guatemala, obligatoria) y mensaje. Validación con el mismo esquema Zod en el navegador y en el servidor.
2. Al enviar: la solicitud se guarda **sin estado**, como no leída, con el **folio** que se le muestra a la persona, con el formato del prototipo (`"SOL-" + año + "-" + consecutivo de 4 dígitos`, por ejemplo `SOL-2026-0001`; `sitio.js` › `contacto()`), generado en la misma transacción para que no se repita; **no se envía a ningún correo**; la página **se desplaza hasta el aviso "Solicitud recibida"** (CAM-82). La acción es pública (sin sesión), con validación estricta y sin revelar nada más que el folio.
3. La página muestra los datos de Quetzaltenango y Guatemala (nunca Escuintla) y lleva pie de página.
4. **Panel** (`/panel/contacto`, `sit.contacto`): dirección, teléfono, correo, WhatsApp, horario y mapa de Quetzaltenango y Guatemala; el mapa solo acepta una dirección `https://www.google.com/maps/embed?…` (como las de `specs/05`); bitácora "Cambio de contenido del sitio".

## Archivos que creas o modificas
- `src/app/(sitio)/contacto/**`, `src/app/panel/contacto/**`, `src/componentes/sitio/**`, `src/componentes/panel/**` (crear y modificar)
- `src/modulos/solicitudes/**` (crear), `src/modulos/contenido/**` (modificar)
- `pruebas-e2e/sitio/contacto.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-19** (CP-58): sin país no se envía; con Guatemala, departamento y municipio son obligatorios; con otro país no aparecen. Correo y teléfono inválidos se marcan al salir del campo.
2. **RF-SW-06:** la solicitud se guarda con su folio, sin estado y sin leer, y no se envía ningún correo; la página se desplaza al aviso "Solicitud recibida".
3. Dos solicitudes enviadas al mismo tiempo reciben folios distintos y consecutivos, con el formato del prototipo.
4. El servidor rechaza una solicitud que no cumple el esquema aunque se salte el navegador.
5. Cambiar la información de contacto en el panel se ve en Contacto, en Inicio y en el pie; un mapa que no es de Google Maps se rechaza.
6. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del servicio de solicitudes (criterios 2 a 4) y de la información de contacto con permisos (criterio 5)
- `pruebas-e2e/sitio/contacto.spec.ts` (criterios 1, 2 y 6)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/contacto.spec.ts
```

## Fuera de alcance
- La bandeja de solicitudes (DM-09).

## Resultado

Lo implementó Daniela y lo terminó e integró el coordinador (Jordin) el 24/10/2026 (`plan/protocolo.md` §E4), a partir de `daniela/DM-08-contacto`. La tarea estuvo bloqueada porque la regla de Semgrep `incovsa-accion-sin-permiso` exigía `exigirPermiso` en toda acción del servidor, y RF-SW-06 exige que el formulario se envíe sin sesión.

**Qué se hizo.**
- `/contacto`: formulario con tipo de mensaje, nombre, empresa, correo, teléfono con código por país (`libphonenumber-js`), país, departamento y municipio (solo con Guatemala, de la semilla), sede (solo Quetzaltenango y Guatemala) y mensaje. React Hook Form valida con el mismo `esquemaSolicitud` que el servidor, al salir de cada campo y al enviar, con el resumen rojo del prototipo. Al enviar, la página se desplaza hasta «Solicitud recibida» con el folio (CAM-82). A la derecha, las tarjetas de las dos oficinas (sin mapa) y el aviso de restricciones de venta.
- `crearSolicitud` (`src/modulos/solicitudes/servicio.ts`): valida con el esquema estricto, comprueba país, sede y que el municipio sea del departamento, y en una transacción bloquea la fila de `configuracion_sitio` para calcular el folio `SOL-AAAA-NNNN` y guardar la solicitud sin estado y sin leer. No envía correo ni escribe la bitácora, y solo devuelve `{ folio }`.
- **Excepción de seguridad (coordinador):** `enviarSolicitud` vive sola en `src/modulos/solicitudes/recepcion-publica.ts`. `.semgrep/seguridad.yml` excluye solo esa ruta de `incovsa-accion-sin-permiso`, y la regla nueva `incovsa-recepcion-publica` falla si el archivo exporta otra cosa (otras funciones, constantes, clases, reexportaciones o una exportación por defecto) o si cambian el cuerpo de `enviarSolicitud` o sus dos importaciones. `scripts/probar-semgrep.mjs` agrega 13 casos con el escáner real, incluido que `enviarSolicitud` en cualquier otro archivo sigue exigiendo permiso.
- `/panel/contacto` (`sit.contacto`): dirección, teléfono, correo, WhatsApp, horario y mapa de Quetzaltenango y Guatemala. `guardarContacto` (`src/modulos/contenido/contacto.ts`) acepta solo `https://www.google.com/maps/embed?…`, limita las sedes a esas dos y escribe «Cambio de contenido del sitio» en la misma transacción; `publicarContacto` revalida el layout raíz para que se vea en Contacto, Inicio y el pie.

**Decisiones tomadas.**
- El consecutivo del folio es uno solo y no se reinicia al cambiar de año, como `S.corr.sol` del prototipo; el año es el de la hora de Guatemala (`specs/05`, «Contacto»).
- La única acción sin sesión del sistema queda descrita en `specs/16` («Seguridad») y en `specs/18` («Recepción pública de Contacto»), por decisión de Jordin.
- Por decisión de Jordin, el mensaje admite hasta 2000 caracteres (`specs/05`); el límite de envíos por IP queda como pendiente P-98 (`specs/19`).
- `Sedes` acepta `conMapa={false}` para la presentación de Contacto, sin cambiar Inicio.

**Archivos principales.** `src/app/(sitio)/contacto/page.tsx`, `src/componentes/sitio/FormularioContacto.tsx`, `src/modulos/solicitudes/{esquemas,servicio,recepcion-publica}.ts`, `src/app/panel/contacto/page.tsx`, `src/componentes/panel/EditorContacto.tsx`, `src/modulos/contenido/{contacto,esquemas-contacto,acciones-contacto}.ts`, `.semgrep/seguridad.yml`, `scripts/probar-semgrep.mjs` y `pruebas-e2e/sitio/contacto.spec.ts`. Evidencia en `pruebas-e2e/sitio/evidencias/DM-08/`.

**Cómo usarlo (DM-09 y siguientes).**
- Las solicitudes llegan a `solicitud_contacto` con `estado: null`, `leida: false` y sin responsable. La bandeja las lee y cambia con acciones nuevas en `src/modulos/solicitudes/acciones.ts`, **siempre con `exigirPermiso`**. No agregues nada a `recepcion-publica.ts`: Semgrep rechaza cualquier exportación distinta de `enviarSolicitud` y cualquier cambio en su cuerpo o en sus importaciones.
- `leerOpcionesContacto()` devuelve países, departamentos, municipios y las dos oficinas, por si la bandeja necesita mostrar sus nombres.
- `esquemaSolicitud` es la fuente de verdad de los campos; si cambia, cambia en el navegador y en el servidor a la vez.
