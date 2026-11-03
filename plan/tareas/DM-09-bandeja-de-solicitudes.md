---
id: DM-09
titulo: Bandeja de solicitudes del panel
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
depende_de: [DM-08]
programada: 2026-10-24
requisitos: [RF-SW-12, RF-SW-20, RF-SW-31, RN-42, CU-21]
pantallas: [panel.js › solicitudes, Panel.vista (indicador de nuevas)]
---

# DM-09 · Bandeja de solicitudes del panel

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 24/10 · **Depende de:** DM-08

## Objetivo
La **bandeja** del panel para ver y gestionar las solicitudes del formulario de contacto: división por motivo, responsable, comentario y estados, y el **indicador de solicitudes nuevas** en el menú.

## Contexto que debes leer
- `specs/05` §"Gestión de solicitudes" **completo**
- `specs/04`: RF-SW-12, RF-SW-20, RF-SW-31; `specs/12`: RN-42; `specs/20`: CAM-50 y CAM-85
- `specs/03` (permisos `sit.sol.ver` y `sit.sol.gestionar`)
- Prototipo: `#/panel/solicitudes?cuenta=ejemplo.08`; `panel.js` › `solicitudes()` y el indicador de `Panel.vista()`
- `## Resultado` de DM-08 y JG-05 (insignia del armazón)

## Qué hacer
1. `/panel/solicitudes`: pestañas por motivo (todas, solicitud, queja y reclamo, con su cuenta), lista y detalle como el prototipo. El motivo con inicial mayúscula ("Solicitud", "Queja", "Reclamo") en verde, ámbar y rojo; el mensaje **completo** dentro de su cuadro, con sus saltos de línea y las palabras largas partidas (CAM-85); los datos de contacto, el lugar y la sede.
2. Abrir una solicitud la marca como leída.
3. Con `sit.sol.gestionar`:
   - **responsable**: lista de los usuarios activos del sitio (bitácora "Responsable de solicitud");
   - **comentario**: uno solo; mientras no hay, el botón dice "Guardar comentario"; ya guardado, el cuadro queda de solo lectura y el botón pasa a "Editar comentario", que habilita el cuadro y vuelve a "Guardar comentario" (bitácora "Comentario de solicitud");
   - **estados**: botones Asignado, En proceso y Solucionado, sin estado inicial y sin orden (RN-42; bitácora "Cambio de estado de solicitud").
   Con solo `sit.sol.ver`, todo es de solo lectura.
4. **Indicador** (RF-SW-31): el ícono de Solicitudes del menú muestra la cantidad de solicitudes sin leer, también con el menú reducido. Usa la insignia del armazón de JG-05: en `src/app/panel/layout.tsx` (archivo del coordinador que esta tarea **sí** puede tocar, solo para esto) pasa a la opción Solicitudes el número que devuelve `contarSolicitudesNuevas()` de `src/modulos/solicitudes`, solo si el usuario tiene `sit.sol.ver`. Avísale al coordinador en tu bitácora (**Jordin:**).
5. Nada se envía por correo.

## Archivos que creas o modificas
- `src/app/panel/solicitudes/**`, `src/componentes/panel/**` (crear)
- `src/modulos/solicitudes/**` (modificar)
- `src/app/panel/layout.tsx` (modificar, solo la insignia de Solicitudes)
- `src/componentes/comunes/armazon/ArmazonServidor.tsx` (ampliación mínima autorizada por Daniela: propiedad opcional de contadores por ruta)
- `pruebas-e2e/panel/solicitudes.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-20 / RN-42:** se puede marcar cualquier estado en cualquier orden; al llegar no tiene estado.
2. **CP-63:** el comentario pasa de "Guardar comentario" a "Editar comentario" y vuelve, con el cuadro de solo lectura en medio.
3. **RF-SW-31** (CP-59): una solicitud nueva enciende el indicador con el menú normal y reducido; al abrirla, baja la cuenta.
4. Con solo `sit.sol.ver` no se puede cambiar nada (el servidor lo rechaza); sin ninguno de los dos permisos, la sección no aparece.
5. Cada cambio queda en la bitácora.
6. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración con permisos (criterios 1, 4 y 5)
- `pruebas-e2e/panel/solicitudes.spec.ts` (criterios 2, 3 y 6)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/panel/solicitudes.spec.ts
```

## Resultado

Implementada `/panel/solicitudes` con pestañas y cuentas por motivo, lista y detalle, mensaje completo con saltos de línea y palabras largas partidas, datos de contacto, lugar y sede. La apertura marca la solicitud como leída y revalida el layout del panel para reducir la insignia. Los estados no tienen orden ni estado inicial; pulsar el estado activo no modifica datos ni duplica la bitácora, como en el prototipo.

Con `sit.sol.gestionar` se eligen responsables activos del sitio o de ambos sistemas, se guarda y edita el comentario único y se cambia cualquier estado. Con solo `sit.sol.ver`, los controles quedan de solo lectura y el servidor rechaza la gestión. Sin permiso de lectura no se consulta ni se muestra la bandeja o el contador. Los cambios de responsable, comentario y estado se registran en la misma transacción. No se envían correos.

**Archivos y uso.** `src/modulos/solicitudes/bandeja.ts` expone `leerBandeja(sesion)`, `contarSolicitudesNuevas(sesion)`, `abrirSolicitud(entrada, sesion)` y `gestionarSolicitud(entrada, sesion)`. `acciones.ts` obtiene la sesión real y autoriza las acciones `abrir` y `gestionar`; las entradas usan `esquemas-bandeja.ts`. La recepción pública de DM-08 permanece separada y sin nuevas exportaciones. `BandejaSolicitudes.tsx` y `solicitudes.module.css` reproducen la pantalla. La insignia se conecta desde `panel/layout.tsx`; `ArmazonServidor` acepta `contadores?: Record<string, number>` y solo los aplica a opciones ya permitidas.

**Decisiones autorizadas por Daniela.** Se permitió esa ampliación mínima del adaptador del armazón, propiedad de Jordin. También se autorizó `--g600` únicamente en las pestañas inactivas y el texto secundario de la fila seleccionada: axe reprodujo 4.46:1 y 4.40:1 en el prototipo. La excepción está documentada en `specs/05` y `specs/18`, sin cambiar reglas o umbrales de axe. `.codex/config.toml` queda fuera de los commits.

**Verificación.** Plan válido (66 tareas); formato, lint, tipos y 395 pruebas en 49 archivos aprobados; compilación aprobada. Cinco pruebas de integración propias con PostgreSQL, con fase roja y verde incluida para la repetición del estado activo. Nueve E2E finales aprobados sin reintentos en 390, 768 y 1440 px, incluidos filtros, vacío, permisos, comentario, indicador y axe. Suite E2E completa con código 0: 361 aprobadas y 2 intermitentes aprobadas al repetir los grupos de tiempo real de teléfono y escritorio; sin fallos definitivos. Next-devtools sin errores. Design system y gitleaks aprobados. Revisión independiente final: LISTO, sin hallazgos pendientes. Evidencia y 29 capturas en `pruebas-e2e/panel/evidencias/DM-09/`.

### Correcciones de la auditoría (2026-10-26)

CE-13: H-57 guarda en la bitácora los textos del prototipo (estado, responsable o «sin responsable», y solo el folio en el comentario). H-63 limita el comentario a 2000 caracteres en el navegador y en el servidor, sin migración. H-65 escribe las capturas de `pruebas-e2e/panel/solicitudes.spec.ts` solo con `EVIDENCIA=1`. El estado de esta tarea no cambia.
