# Verificación de JC-06

- `node scripts/tareas.mjs --validar`: plan válido, 63 tareas.
- `npm run verificar`: formato, lint y tipos correctos; 29 archivos y 272 pruebas aprobadas, usando una base exclusiva de pruebas real.
- `npm run build`: compilación y tipos correctos; `/picking/reportes` disponible como ruta dinámica.
- `node --test scripts/design-system.test.mjs`: tres pruebas aprobadas; colores, tipografías, radios y sombras respetan los tokens.
- E2E propio: seis pruebas aprobadas (dos casos en teléfono, tableta y escritorio), con datos y sin datos, cinco periodos, fecha inválida y axe. Las capturas se regeneran tras la hidratación.
- next-devtools: `get_errors` devuelve `configErrors: []` y `sessionErrors: []`.
- Revisión independiente: LISTO, sin hallazgos; segunda revisión de ajustes también LISTO.

## Verificación general de navegador pendiente

La primera ejecución completa terminó con 163 pruebas aprobadas, dos omisiones preexistentes de JC-03 y tres fallos:

- Usuarios, teléfono y tableta: axe mide el contraste mientras el diálogo aún se está animando. El CSS existente ya usa `--g600`. El cambio mínimo propuesto es esperar `getAnimations().map(animacion => animacion.finished)` antes del análisis; no se ha modificado el archivo ajeno y se solicitó autorización de acuerdo con protocolo §C.
- Facturación, escritorio: tras el arrastre no aparecen las dos tarjetas en la opción. La repetición aislada pasó en los tres tamaños, junto con las seis pruebas finales de Reportes (9/9). No se modificó su implementación ni se debilitó su prueba.

La tarea permanece pendiente de cierre e integración mientras la verificación general no sea satisfactoria.

## Repetición final

`npm run e2e -- pruebas-e2e/picking/reportes.spec.ts pruebas-e2e/picking/facturacion-envio.spec.ts --workers=1`: nueve pruebas aprobadas, incluidas seis de JC-06 con calendario, Enter, desenfoque y controles de los cinco periodos. Facturación también aprobó sus tres tamaños en la repetición. Queda pendiente autorizar el ajuste de la espera de animación de Usuarios y realizar la ejecución general posterior.
