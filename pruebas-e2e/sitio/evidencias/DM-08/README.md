# DM-08 · Contacto e Información de contacto

Fecha: 24/10/2026. Implementó Daniela (`daniela/DM-08-contacto`); terminó e integró el coordinador (`jordin/DM-08-contacto`, protocolo §E4).

## Estado

La recepción pública `enviarSolicitud` vive sola en `src/modulos/solicitudes/recepcion-publica.ts`. `incovsa-accion-sin-permiso` excluye solo esa ruta, y la regla `incovsa-recepcion-publica` falla si el archivo exporta otra cosa o si cambia el cuerpo de `enviarSolicitud` ([specs/16](../../../../specs/16-arquitectura-y-tecnologia.md), «Seguridad»). La revisión en contexto limpio pidió dos correcciones, ya aplicadas: el tope de 2000 caracteres del mensaje y que la prueba de salida del campo se haga antes de cualquier envío.

## Verificación (coordinador, 24/10)

- Fase roja de la excepción: Semgrep 1.182.0 (Docker) rechaza `enviarSolicitud` de la rama de Daniela con `incovsa-accion-sin-permiso`.
- `scripts/probar-semgrep.mjs` con el escáner real: **28 casos aprobados** (10 nuevos). Escaneo de la CI (`.semgrep/seguridad.yml`, `p/typescript`, `p/nextjs` sobre `src`): **0 hallazgos**.
- `npm run verificar`: 48 archivos, **390 pruebas aprobadas** (`verificacion-local.txt`).
- `npm run build`: aprobado, con `/contacto` y `/panel/contacto` (`compilacion.txt`).
- `npm run e2e -- pruebas-e2e/sitio/contacto.spec.ts`: **9 aprobadas** en 390, 768 y 1440 px, con axe (`e2e-contacto.txt`). La prueba de salida del campo falla, como debe, si el formulario se cambia a `mode: "onSubmit"`.
- `node scripts/tareas.mjs --validar`: plan válido.
- Next-devtools sin errores; en la consola solo el 404 previo de `/favicon.ico`.
- Suite E2E completa (`e2e-completo.txt`), en una base local nueva: Claude Code la detuvo a los 36,5 min por falta de memoria del equipo, con 279 aprobadas. Los fallos son los ya conocidos de este equipo en `develop` (RN-54 de `acceso-personal` y Facturación), tiempos agotados en archivos sin relación con DM-08 y, al final, fallos de 0 ms por la falta de memoria. Las pruebas de Contacto de esa corrida pasaron solas después (línea anterior). Esta corrida no se presenta como aprobada.

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
