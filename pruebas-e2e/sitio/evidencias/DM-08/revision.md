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
