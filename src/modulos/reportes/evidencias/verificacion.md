# Verificación de JC-06

- `node scripts/tareas.mjs --validar`: plan válido, 63 tareas.
- `npm run verificar`: formato, lint y tipos correctos; 29 archivos y 273 pruebas aprobadas contra la base local exclusiva de pruebas.
- `npm run build`: compilación de producción y tipos correctos; `/picking/reportes` disponible como ruta dinámica.
- `node --test scripts/design-system.test.mjs`: tres pruebas aprobadas; colores, tipografías, radios y sombras respetan los tokens.
- E2E propio (`npm run e2e -- pruebas-e2e/picking/reportes.spec.ts`): seis pruebas aprobadas en teléfono, tableta y escritorio; cinco periodos, calendario, Enter, desenfoque, fecha inválida, datos de despacho y rutas, dos sistemas en Bitácora y axe.
- Suite E2E completa en una base local nueva: 163 aprobadas, dos omisiones existentes de JC-03 y tres fallos fuera de JC-06. Las pruebas `facturacion-carga` y `facturacion-envio` de escritorio se ejecutan en paralelo e importan la misma fixture; el tablero llega a 66 pedidos en vez de 33. Usuarios de escritorio encuentra contraste serio (3.70–4.21:1). La primera suite contra una base reutilizada también mostró dos falsos fallos de `document-title`; ambos pasaron en la ejecución limpia.
- next-devtools: `compile_route("/picking/reportes")` no encontró problemas. `get_errors` no devolvió estado porque no había una sesión de navegador conectada.
- Revisión independiente final: LISTO, sin hallazgos.
