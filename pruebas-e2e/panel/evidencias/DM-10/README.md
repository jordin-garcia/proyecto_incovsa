# DM-10 · Documentación interna

Capturas de aplicación y prototipo en 390 × 844, 768 × 1024 y 1440 × 900. Los archivos `aplicacion-*` se generan con `pruebas-e2e/panel/documentos.spec.ts`; los `prototipo-*` corresponden a `#/panel/documentos` y las cuentas 08, 09 y 10 del prototipo aprobado.

Las seis capturas adicionales `aplicacion-tabla-con-datos-*` y `aplicacion-tres-documentos-*` se tomaron con Playwright y un registro sintético retirado al terminar. En total se conservan 57 PNG.

| Estado | Aplicación (390 / 768 / 1440) | Prototipo (390 / 768 / 1440) |
| --- | --- | --- |
| Tabla | [390](aplicacion-tabla-con-datos-390.png) · [768](aplicacion-tabla-con-datos-768.png) · [1440](aplicacion-tabla-con-datos-1440.png) | [390](prototipo-tabla-390.png) · [768](prototipo-tabla-768.png) · [1440](prototipo-tabla-1440.png) |
| Nuevo | [390](aplicacion-nuevo-390.png) · [768](aplicacion-nuevo-768.png) · [1440](aplicacion-nuevo-1440.png) | [390](prototipo-nuevo-390.png) · [768](prototipo-nuevo-768.png) · [1440](prototipo-nuevo-1440.png) |
| Editar | [390](aplicacion-editar-390.png) · [768](aplicacion-editar-768.png) · [1440](aplicacion-editar-1440.png) | [390](prototipo-editar-390.png) · [768](prototipo-editar-768.png) · [1440](prototipo-editar-1440.png) |
| Eliminar | [390](aplicacion-eliminar-390.png) · [768](aplicacion-eliminar-768.png) · [1440](aplicacion-eliminar-1440.png) | [390](prototipo-eliminar-390.png) · [768](prototipo-eliminar-768.png) · [1440](prototipo-eliminar-1440.png) |
| Solo ver | [390](aplicacion-ejemplo.10-documentos-390.png) · [768](aplicacion-ejemplo.10-documentos-768.png) · [1440](aplicacion-ejemplo.10-documentos-1440.png) | [390](prototipo-ejemplo.10-documentos-390.png) · [768](prototipo-ejemplo.10-documentos-768.png) · [1440](prototipo-ejemplo.10-documentos-1440.png) |
| Ver y descargar | [390](aplicacion-ejemplo.09-documentos-390.png) · [768](aplicacion-ejemplo.09-documentos-768.png) · [1440](aplicacion-ejemplo.09-documentos-1440.png) | [390](prototipo-ejemplo.09-documentos-390.png) · [768](prototipo-ejemplo.09-documentos-768.png) · [1440](prototipo-ejemplo.09-documentos-1440.png) |
| Vista previa (solo ver) | [390](aplicacion-ejemplo.10-vista-previa-390.png) · [768](aplicacion-ejemplo.10-vista-previa-768.png) · [1440](aplicacion-ejemplo.10-vista-previa-1440.png) | [390](prototipo-ejemplo.10-vista-previa-390.png) · [768](prototipo-ejemplo.10-vista-previa-768.png) · [1440](prototipo-ejemplo.10-vista-previa-1440.png) |
| Vista previa (ver y descargar) | [390](aplicacion-ejemplo.09-vista-previa-390.png) · [768](aplicacion-ejemplo.09-vista-previa-768.png) · [1440](aplicacion-ejemplo.09-vista-previa-1440.png) | [390](prototipo-ejemplo.09-vista-previa-390.png) · [768](prototipo-ejemplo.09-vista-previa-768.png) · [1440](prototipo-ejemplo.09-vista-previa-1440.png) |

Estados: tabla, producto nuevo, edición, confirmación de eliminación, resultado vacío, documentos de solo lectura (`ejemplo.10`), documentos con descarga (`ejemplo.09`) y vista previa. La aplicación muestra datos sintéticos y el prototipo sus PDF de simulación; la implementación solo admite enlaces de Drive, según `specs/20`. El aviso verde conserva el texto sobre la protección en Drive y omite la frase exclusiva del producto de ejemplo.

La prueba del visor intercepta la respuesta externa para no depender de cuentas, permisos o documentos reales de Google. Verifica la directiva `frame-src` real, la dirección del iframe y que su contenido se cargue. Las respuestas HTML del servidor se comprueban antes de interactuar: la cuenta 10 no recibe direcciones de descarga y la cuenta 09 sí.

## Pruebas primero

- Primera ejecución de integración: roja por la inexistencia del servicio. Primera E2E: roja por la ausencia de la pantalla y sus acciones.
- Regresiones de revisión: dos pruebas rojas porque se aceptaban nombres equivalentes con y sin acentos, incluso simultáneamente. Tras serializar las escrituras y normalizar la comparación, las ocho pruebas de integración pasan.
- Se corrigió el localizador del país para usar su rol accesible y la expectativa de CSP para verificar su ruta específica `/file/d/`.

## Revisión independiente

Un agente que no escribió el código leyó la tarea, su contexto y `plan/prompts/revision.md`. Hallazgos corregidos: comparación normalizada y segura frente a concurrencia; prueba de carga real del iframe bajo la CSP. Segunda revisión: **LISTO**, sin correcciones ni opcionales pendientes. No se modificaron dependencias, esquema, migraciones ni archivos protegidos. `.codex/config.toml` permanece fuera de los commits.

## Verificación final

- `node scripts/tareas.mjs --validar`: plan válido, 66 tareas.
- `npm run verificar`: formato, lint y tipos aprobados; 426 pruebas aprobadas en 52 archivos.
- `npm run build`: compilación aprobada, incluida `/panel/documentos`.
- `npm run e2e -- pruebas-e2e/panel/documentos.spec.ts --workers=1`: seis pruebas aprobadas, sin reintentos, con axe en los tres tamaños.
- `npm run e2e -- --workers=2`: 384 aprobadas, cuatro fallidas y ocho sin ejecutar de los grupos de tiempo real. Tras generar el artefacto actual, `npm run e2e -- pruebas-e2e/flujo/tiempo-real.spec.ts pruebas-e2e/picking/bodega-tiempo-real.spec.ts --workers=1 --retries=1`: código 0, 17 aprobadas directamente y una intermitente aprobada al reintentar el inicio del servidor de producción. Se ejecutaron los 396 casos de la suite y no quedan fallos pendientes. No se cambiaron esas pruebas, sus límites ni sus aserciones.
- `node --test scripts/design-system.test.mjs`: tres pruebas aprobadas. Gitleaks sin secretos. next-devtools sin errores de configuración ni sesión.
