# Evidencia de JM-09 · Correcciones de la auditoría del 26/10 en Bodega, el tablero y Ruta

Capturas tomadas con Playwright sobre la compilación de producción y el prototipo de simulación aprobado (`entregable-1/prototipos/`).

## Hallazgos y pruebas que los detectan

| Hallazgo | Corrección | Prueba |
|---|---|---|
| H-66 | `acciones.test.ts` usa una ruta En Ruta real de la sede 2 en `entradaOtraSede` y comprueba que ni su orden ni su estado cambian | `src/modulos/ruta/acciones.test.ts` |
| D-09 | Piloto con dos sedes asignadas solo ve las rutas de su sede de trabajo activa | `src/modulos/ruta/servicio.test.ts` |
| H-67 | `totalKg` viaja al cliente como texto exacto (`toString()`, tipo `string`) sin imprecisiones numéricas de IEEE 754 | `src/modulos/ruta/servicio.test.ts` |
| H-68 | `.ruta-op` con 16 px de radio con token `--radius-prototipo-10: 16px` en `globals.css` | `src/app/picking/ruta/ruta.css` |
| H-69 | Reordenamiento de clientes con arrastre táctil (`hasTouch: true`, espera 420 ms) en teléfono | `pruebas-e2e/picking/ruta.spec.ts` |
| H-70 | Encabezado del módulo de Ruta validado con `comprobarEncabezadoModulo()` en «Mis rutas» y «Rutas en curso» | `pruebas-e2e/picking/ruta.spec.ts` |
| H-71 | Ruta sin camión asignado en tablero muestra camión «—» y capacidad 1 kg en vez de «El cliente recoge en bodega» | `src/modulos/bodega/tablero.test.ts` y `pruebas-e2e/picking/tablero.spec.ts` |
| H-72 | Exclusión de contraste de axe para `.tb-num.recoge small` restringida exclusivamente al modo claro | `pruebas-e2e/picking/tablero.spec.ts` |
| H-73 | Usuario sin permiso de Bodega o sin sede redirige a su módulo inicial (`/picking/ruta`) | `pruebas-e2e/picking/tablero.spec.ts` |
| H-74 | Transacciones interactivas con `exigirCambios()` dentro para garantizar atomicidad ante condiciones de carrera | `src/modulos/bodega/servicio.test.ts` |

## Comparación con el prototipo

### 1. Módulo de Ruta (`rutaMod()`) · Radio de 16 px en `.ruta-op` (H-68)

| Tamaño | Prototipo | Aplicación |
|---|---|---|
| Teléfono 390 × 844 | [prototipo-ruta-390.png](prototipo-ruta-390.png) | [aplicacion-ruta-390.png](aplicacion-ruta-390.png) |
| Tableta 768 × 1024 | [prototipo-ruta-768.png](prototipo-ruta-768.png) | [aplicacion-ruta-768.png](aplicacion-ruta-768.png) |
| Escritorio 1440 × 900 | [prototipo-ruta-1440.png](prototipo-ruta-1440.png) | [aplicacion-ruta-1440.png](aplicacion-ruta-1440.png) |

Las tarjetas `.ruta-op` coinciden en radio (16 px), bordes, tipografía, espaciados y estados con el prototipo (`estilos.css:401`).

### 2. Tablero en pantalla completa (`Tablero.ruta()`) · Ruta sin camión (H-71)

| Tamaño | Prototipo | Aplicación |
|---|---|---|
| Teléfono 390 × 844 | [prototipo-tablero-390.png](prototipo-tablero-390.png) | [aplicacion-tablero-390.png](aplicacion-tablero-390.png) |
| Tableta 768 × 1024 | [prototipo-tablero-768.png](prototipo-tablero-768.png) | [aplicacion-tablero-768.png](aplicacion-tablero-768.png) |
| Escritorio 1440 × 900 | [prototipo-tablero-1440.png](prototipo-tablero-1440.png) | [aplicacion-tablero-1440.png](aplicacion-tablero-1440.png) |
| TV 1920 × 1080 | [prototipo-tablero-1920.png](prototipo-tablero-1920.png) | [aplicacion-tablero-1920.png](aplicacion-tablero-1920.png) |

Cuando una ruta en preparación carece de camión asignado (o el camión cambió de sede), la tarjeta lateral muestra la silueta del camión con matrícula «—», capacidad 1 kg y ocupación porcentual sobre las líneas (`tablero.js:96`), y no «El cliente recoge en bodega».

## Verificación

| Comando | Resultado |
|---|---|
| `npm run formato` | Prettier aprobado sin diferencias |
| `npm run lint` | ESLint 0 errores, 0 advertencias |
| `npm run tipos` | TypeScript compila sin errores |
| `npm test` | 52 archivos de prueba pasados, 432 pruebas unitarias/integración aprobadas |
| `npm run build` | Compilación Next.js 16 de producción exitosa |
| `node scripts/tareas.mjs --validar` | Plan válido (69 tareas) |
| `node scripts/tareas.mjs --validar-cierre "[JM-09] ..."` | Cierre válido: JM-09 (hecha) |
| `npm run e2e -- pruebas-e2e/picking` | 161 de 161 pruebas aprobadas (13.8m, 1 worker) |
