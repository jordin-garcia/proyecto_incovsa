# Revisión independiente de JG-06

Revisión en contexto limpio por un agente que no escribió el código, siguiendo `plan/prompts/revision.md`. Se revisaron la tarea, el diff preparado, las especificaciones, el prototipo y las capturas. El revisor no modificó archivos ni ejecutó pruebas sobre la base compartida.

## Hallazgos corregidos

1. El límite de 60 caracteres mostraba el mensaje inglés por omisión de Zod. Se reutilizó el texto español aprobado «Escriba su nombre de usuario.», se limitó el campo a 60 caracteres y se agregó una prueba para una entrada de 61 caracteres.
2. La comprobación de atributos de cookies se ejecutaba después del cierre de las dos sesiones. Se movió antes del cierre y ahora exige exactamente dos cookies, ambas HttpOnly y SameSite=Lax.

## Veredicto posterior a las correcciones

```
REVISIÓN JG-06
CORRECCIÓN (obligatorio corregir):
Ninguno.
OPCIONAL (no bloquea):
Ninguno.
VEREDICTO: LISTO
```

La consulta de bitácora conserva un control local de sesión y `pk.reportes` hasta que JG-07 introduzca `exigirPermiso`. La API de autenticación es pública por definición y solo expone las operaciones necesarias, con el control de origen y el límite persistente de intentos.

## Revisión adicional de UTC

La verificación general detectó que el adaptador PostgreSQL de Prisma reemplaza el desplazamiento de `timestamptz` sin convertir la hora. El revisor comprobó el código instalado, la opción de conexión `pg` y la prueba de regresión; confirmó que fijar UTC en cada conexión es una corrección adecuada. El veredicto siguió siendo LISTO. Se quitó una referencia numérica incorrecta en el comentario y el nombre de la prueba.

La separación de IP de los navegadores de pruebas es válida. En ejecuciones repetidas contra una misma base se siguen respetando los bloqueos persistentes: una IP fija puede acumular intentos hasta su vencimiento, como exige RNF-15. Las ejecuciones de CI usan una base nueva.
