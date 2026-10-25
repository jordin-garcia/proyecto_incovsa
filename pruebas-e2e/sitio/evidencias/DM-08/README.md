# DM-08 · Avance de Contacto e Información de contacto

Fecha: 24/10/2026. Rama: `daniela/DM-08-contacto`.

## Estado

Avance implementado, sin integrar. Daniela coordinará con Jordin una excepción limitada y probada para la recepción pública `enviarSolicitud`: la regla `incovsa-accion-sin-permiso` todavía exige sesión en todas las acciones, mientras RF-SW-06 exige que esta sea pública. No se omitió ni modificó la regla.

El [PR de registro de bloqueo #129](https://github.com/jordin-garcia/proyecto_incovsa/pull/129) solo contiene tarea y bitácora; recibió revisión independiente LISTO. Su integración automática está activada, pero GitHub Actions no inicia por pagos fallidos o límite de gasto de la cuenta propietaria. La anotación de la ejecución 40146186623 confirma ese impedimento de infraestructura; ninguna verificación llegó a ejecutar código.

## Verificación

- Fase roja: las suites de integración fallaron por ausencia de los módulos; el E2E falló por ausencia del formulario.
- Integración inicial: siete pruebas aprobadas. Se añadió una octava para comprobar la acción pública, su respuesta mínima y el rechazo de campos internos manipulados.
- `npm run verificar`: repetición final aprobada, 374 pruebas en 46 archivos; salida completa en `verificacion-local.txt`.
- `npm run build`: aprobado, incluidas `/contacto` y `/panel/contacto`.
- E2E propio: nueve casos aprobados en 390, 768 y 1440 px con axe completo, sin violaciones serias ni críticas. Comprueban validaciones territoriales y de correo/teléfono, envío real, persistencia sin estado ni lectura, desplazamiento hasta el aviso, publicación del panel en Contacto/Inicio/pie y rechazo de mapas externos.
- Batería E2E completa, 318 casos: la primera ejecución terminó con 297 aprobados, 13 fallidos, dos intermitentes y seis no ejecutados (`e2e-completo.txt`). Una compilación simultánea invalidó archivos del servidor standalone; se reconstruyó secuencialmente. Además, `flujo/tiempo-real.spec.ts` requiere que el proceso cargue el entorno local, como ya advierte la bitácora para pruebas aisladas. Se repitieron completos los 33 casos de los cuatro archivos afectados y los nueve de Contacto con carga explícita del entorno: **42 aprobados al primer intento en 3,4 minutos**, salida y código cero en `e2e-repeticion-entorno.txt`. Quedaron comprobados todos los casos, sin modificar pruebas ajenas, sus límites ni sus umbrales. No se presenta la primera ejecución como aprobada.
- Plan: válido, 66 tareas. Design system: tres pruebas aprobadas. Next-devtools: sin errores de configuración ni de sesión en Contacto.
- No se leyeron secretos ni se agregaron dependencias o migraciones. Las pruebas restauran la información de contacto y eliminan exclusivamente sus propias solicitudes de prueba.

Comando de recuperación (solo carga variables; no muestra su contenido):

```powershell
$env:NODE_OPTIONS='--dns-result-order=ipv4first'
node --env-file=.env node_modules/@playwright/test/cli.js test pruebas-e2e/flujo/tiempo-real.spec.ts pruebas-e2e/picking/bodega-tiempo-real.spec.ts pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts pruebas-e2e/seguridad/cabeceras.spec.ts pruebas-e2e/sitio/contacto.spec.ts --workers=1 --retries=1
```

La compilación final, después de terminar la ejecución que retenía la DLL de `sharp`, pasó y está en `compilacion.txt`. Next-devtools no reportó errores de configuración o ejecución en Contacto. El navegador solo registró el 404 preexistente de `/favicon.ico` y el aviso de proporción del logotipo compartido.

## Comparación visual

El prototipo se recorrió con Playwright MCP en Contacto y en Información de contacto con `ejemplo.08`. Los PNG del prototipo se verificaron leyendo sus dimensiones: 390, 768 y 1440 px. Se oculta solo la barra de desplazamiento del navegador de captura, para que no reste 15 px al ancho útil. Las notas P-22, el botón Demostración y los textos exclusivos de simulación se omiten conforme a `specs/20`.

| Estado | Aplicación | Prototipo |
|---|---|---|
| Contacto | [390](aplicacion-contacto-390.png), [768](aplicacion-contacto-768.png), [1440](aplicacion-contacto-1440.png) | [390](prototipo-contacto-390.png), [768](prototipo-contacto-768.png), [1440](prototipo-contacto-1440.png) |
| Campos de Guatemala | [390](aplicacion-guatemala-390.png), [768](aplicacion-guatemala-768.png), [1440](aplicacion-guatemala-1440.png) | [390](prototipo-guatemala-390.png), [768](prototipo-guatemala-768.png), [1440](prototipo-guatemala-1440.png) |
| Error | [390](aplicacion-error-390.png), [768](aplicacion-error-768.png), [1440](aplicacion-error-1440.png) | [390](prototipo-error-390.png), [768](prototipo-error-768.png), [1440](prototipo-error-1440.png) |
| Solicitud recibida | [390](aplicacion-exito-390.png), [768](aplicacion-exito-768.png), [1440](aplicacion-exito-1440.png) | [390](prototipo-exito-390.png), [768](prototipo-exito-768.png), [1440](prototipo-exito-1440.png) |
| Panel | [390](aplicacion-panel-390.png), [768](aplicacion-panel-768.png), [1440](aplicacion-panel-1440.png) | [390](prototipo-panel-390.png), [768](prototipo-panel-768.png), [1440](prototipo-panel-1440.png) |

## Revisión independiente

Se siguió `plan/prompts/revision.md` con un agente que no escribió el código. Se corrigieron el resumen rojo de errores, la validación al salir del campo en el panel y la superposición de los textos de los selectores. El nuevo caso de validación del mapa al perder foco se reprodujo en rojo antes de corregirlo. Veredicto final del avance: **LISTO**, sin hallazgos de corrección ni opcionales; [registro](revision.md). Ese veredicto no cierra la tarea bloqueada ni sustituye la CI obligatoria.

## Uso del avance

- `/contacto`: formulario público con opciones de países, departamentos, municipios y oficinas leídas de la semilla. La acción comparte `esquemaSolicitud` con el navegador, valida las relaciones territoriales y no envía correo.
- `crearSolicitud`: abre una transacción y bloquea la fila estable de configuración durante el cálculo e inserción del folio; el consecutivo continúa entre años, como el contador del prototipo. La fecha usa `America/Guatemala` mediante `fechaGuatemala`. Solo retorna `{ folio }`.
- `/panel/contacto`: exige `sit.contacto`. `guardarContacto` limita las sedes a Quetzaltenango y Guatemala, valida el mapa insertado de `https://www.google.com/maps/embed?…` y escribe «Cambio de contenido del sitio» en la misma transacción. La acción revalida el layout raíz.
- `Sedes` acepta `conMapa={false}` para reproducir la presentación de Contacto sin cambiar Inicio.
- La bandeja de solicitudes sigue fuera de alcance (DM-09).
