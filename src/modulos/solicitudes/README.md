# Módulo `solicitudes`

**Dueño:** Daniela Marín (`daniela`), según `plan/convenciones.md` §2.

Solicitudes de contacto que llegan desde el formulario de Contacto (solicitud, queja o reclamo) y su gestión en el panel, con los estados Asignado, En proceso y Solucionado.

Especificación: `specs/05-sitio-web.md`, "Gestión de solicitudes".

Archivos: `servicio.ts` (reglas de negocio), `esquemas.ts` (Zod), `acciones.ts` (acciones del servidor de la bandeja, con `exigirPermiso`) y sus pruebas `*.test.ts` (`plan/convenciones.md` §4.1).

`recepcion-publica.ts` contiene solo `enviarSolicitud`, la recepción pública del formulario (RF-SW-06), la única acción sin sesión. Semgrep falla si ese archivo exporta cualquier otra cosa: las acciones nuevas van en `acciones.ts` ([specs/16](../../../specs/16-arquitectura-y-tecnologia.md), "Seguridad").

## Bandeja del panel (DM-09)

`bandeja.ts` contiene `leerBandeja(sesion)` y `contarSolicitudesNuevas(sesion)`, que exigen `sit.sol.ver`. Devuelven los campos de presentación, los responsables activos del sitio y el contador de solicitudes sin leer. La bandeja del sitio no usa el selector de sede del picking (`specs/03`, RN-17).

`abrirSolicitud(entrada, sesion)` marca como leída una solicitud con `sit.sol.ver`. `gestionarSolicitud(entrada, sesion)` exige `sit.sol.gestionar`, valida la unión estricta de `esquemas-bandeja.ts` (`estado`, `responsable` o `comentario`) y escribe el cambio y su bitácora en una transacción. Repetir el estado activo no modifica la solicitud ni duplica la bitácora, como el prototipo.

Los componentes llaman a las acciones `abrir` y `gestionar` de `acciones.ts`; ambas obtienen la sesión real, comprueban su permiso y revalidan el layout `/panel`, incluida la insignia. Ninguna operación envía correo.
