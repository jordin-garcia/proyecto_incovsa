---
id: DM-09
titulo: Bandeja de solicitudes del panel
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: pendiente
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
