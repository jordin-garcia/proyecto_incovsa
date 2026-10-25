# Revisión en contexto limpio · DM-08 · 24/10/2026

Se aplicó `plan/prompts/revision.md` con un agente que no escribió el código.

## Hallazgos corregidos

1. Se agregó el resumen rojo inferior con icono y mensajes en el orden del prototipo; los mensajes junto a los campos se conservan para correo y teléfono.
2. El panel usa `mode: "onBlur"`. La nueva aserción del mapa inválido al perder foco falló antes de la corrección y pasó después.
3. El texto superpuesto de los selectores usa posición y nivel de apilamiento para quedar visible sobre el control nativo. La captura de error refleja Guatemala y las opciones territoriales completas. Se verificaron las dimensiones de los PNG en 390, 768 y 1440 px.
4. Se igualaron el radio de 12 px, margen superior de 6 px, fondo `--g100` y presentación en bloque de los mapas del panel con la regla del prototipo. El revisor comprobó ese ajuste final y mantuvo LISTO sin hallazgos.

## Veredicto final del avance

REVISIÓN DM-08

Verificadas las correcciones en el checkout original y la captura actualizada `aplicacion-error-390.png`. El veredicto corresponde al avance; la tarea permanece bloqueada por Semgrep y sigue pendiente del ajuste del coordinador, las verificaciones finales y su integración.

CORRECCIÓN (obligatorio corregir):
Ninguno.

OPCIONAL (no bloquea):
Ninguno.

VEREDICTO: LISTO

## Revisión del registro de bloqueo

Otra revisión independiente comprobó el diff exclusivo de tarea y bitácora en `daniela/DM-08-bloqueo-semgrep`, commit `49fd9f5`. Confirmó el conflicto real entre RF-SW-06 y `incovsa-accion-sin-permiso`, el alcance de dos archivos y el plan válido de 66 tareas. Veredicto: LISTO, sin hallazgos.

## Revisión del coordinador (24/10/2026)

El subagente `revisor`, que no escribió el código, revisó la rama `jordin/DM-08-contacto` con la excepción de Semgrep. Veredicto: **CORREGIR**, con dos hallazgos de corrección, ya aplicados:

1. La prueba del criterio 1 marcaba el correo y el teléfono después de un envío, así que también pasaba con `mode: "onSubmit"`. Ahora comprueba la salida del campo en una página recién cargada, antes de cualquier envío, y falla con `onSubmit` (mutación verificada).
2. El mensaje no tenía tope en la única acción sin sesión. Ahora admite hasta 2000 caracteres (decisión de Jordin), en el navegador y en el servidor, con pruebas en `servicio.test.ts`.

Opcionales: se aplicó el cuerpo fijo de `enviarSolicitud` en Semgrep, con dos casos nuevos; el límite de envíos por IP quedó como P-98; y se conserva la presentación de los errores del mapa y de los campos al salir de ellos, ya revisada por la primera revisión.
