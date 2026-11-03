---
id: JM-09
titulo: Correcciones de la auditoría del 26/10 en Bodega, el tablero y Ruta
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
depende_de: [JM-06, JG-23]
programada: 2026-10-27
requisitos: [RF-SL-26, RF-SL-61, RNF-14, RN-17]
pantallas: [picking.js › rutaMod(), tablero.js › Tablero.ruta()]
---

# JM-09 · Correcciones de la auditoría del 26/10 en Bodega, el tablero y Ruta

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JM-06, JG-23

## Objetivo
Corregir los hallazgos del paso 2 de la auditoría del 26/10 (H-66 a H-74) en Ruta (JM-06), el tablero (JM-05) y Bodega (JG-23), y agregar la prueba de D-09. Ninguno es grave: son pruebas que faltan, una cantidad que viaja como número, un radio distinto del prototipo, el panel de una ruta que se queda sin camión y una transacción que no vuelve atrás en una carrera.

## Contexto que debes leer
- `plan/auditorias/2026-10-26.md`, paso 2 (H-66 a H-74) y D-09
- `specs/08-picking-ruta.md` («Acceso», precisión del 26/10 de D-09); `specs/07-picking-bodega.md` (tablero en pantalla completa); `specs/18`, «Decisiones de la auditoría del 26/10»
- `plan/protocolo.md` §E3: aunque no eres el coordinador, se corrige igual: cada hallazgo lleva una prueba que lo habría detectado
- Prototipo: `picking.js` › `rutaMod()` (l. 390) y `rutasVisibles` (l. 385); `tablero.js` (l. 96, camión «—»); `estilos.css:401` (`.ruta-op`)
- `## Resultado` de JM-05, JM-06 y JG-23 (y las ayudas de prueba que dejó JG-23: `comprobarRechazosDeAccion()` con función en `entradaOtraSede`, y `comprobarEncabezadoModulo()`)

## Qué hacer
1. **H-66:** en `src/modulos/ruta/acciones.test.ts`, el caso «otra sede» usa una ruta En Ruta **real** de la sede 2 (función en `entradaOtraSede`) y comprueba que no cambió.
2. **H-67:** `totalKg` de Ruta viaja como texto exacto (`toString()`), no con `.toNumber()`. Ajusta el tipo `EntregaRutaItem.totalKg` y `servicio.test.ts`.
3. **H-68:** `.ruta-op` con el radio de 16 px del prototipo (`estilos.css:401`). No hay ningún token de 16 px. Esta tarea te autoriza a agregar `--radius-prototipo-10: 16px` en `src/app/globals.css`, junto a los demás `--radius-prototipo-*`, y a usarlo (decisión del coordinador del 26/10).
4. **H-69 (RNF-14):** una prueba de navegador con `hasTouch` que reordena dos clientes con el arrastre táctil en el teléfono, como `bodega-tiempo-real.spec.ts:422`.
5. **H-70 (RF-SL-61):** `ruta.spec.ts` llama a `comprobarEncabezadoModulo()` con «Mis rutas» (piloto) y «Rutas en curso» (con `pk.ruta.todas`).
6. **H-71:** si el camión de una ruta En Preparación se cambió de sede, el tablero muestra la **ruta** con el camión «—», como `tablero.js:96`, y no el texto de «El cliente recoge en bodega». Con su prueba.
7. **H-72:** en `tablero.spec.ts`, la exclusión de axe de `.tb-num.recoge small` aplica solo en el modo claro (la excepción de JM-08 es del cuadro lima del modo claro).
8. **H-73:** prueba de que `/picking/tablero` sin permiso de Bodega o sin sede lleva al módulo inicial (`ejemplo.06` → `/picking/ruta`), como dice `specs/07`.
9. **H-74:** en `src/modulos/bodega/servicio.ts`, las operaciones que hoy llaman a `exigirCambios()` después de un `$transaction([...])` en arreglo (l. 252-267, 373-385 y 408-423) usan una transacción interactiva y lanzan el error dentro, para que, si otra pantalla despacha a la mitad, no quede nada guardado. Con su prueba.
10. **D-09:** una prueba de un piloto con **dos sedes** que solo ve las rutas de la sede de trabajo elegida, y las de la otra al cambiar de sede.
11. En el `## Resultado` de JM-05, JM-06 y JG-23, agrega `### Correcciones de la auditoría (2026-10-26)` con lo que se corrigió. Su estado no cambia.

## Archivos que creas o modificas
- `src/modulos/ruta/**` (servicio, acciones y sus pruebas); `src/componentes/picking/ruta/**`; `src/app/picking/ruta/ruta.css`; `src/app/globals.css` (solo el token de H-68)
- `src/modulos/bodega/servicio.ts`, `src/modulos/bodega/tablero.ts` y sus pruebas; `src/componentes/picking/bodega/tablero/TableroCliente.tsx`
- `pruebas-e2e/picking/ruta.spec.ts`, `pruebas-e2e/picking/tablero.spec.ts`
- `plan/tareas/JM-05-*.md`, `plan/tareas/JM-06-*.md`, `plan/tareas/JG-23-*.md` (solo la sección de correcciones); `plan/bitacora/josue.md`

## Criterios de aceptación
1. **RN-17 / RF-SL-26 (H-66, D-09):** el caso «otra sede» de Ruta usa una ruta real de la sede 2 y no la cambia; un piloto con dos sedes ve solo las rutas de la sede de trabajo.
2. **RNF-14 (H-69):** el piloto reordena los clientes con el arrastre táctil en el teléfono, con prueba.
3. **RF-SL-61 (H-70):** el encabezado de Ruta pasa `comprobarEncabezadoModulo()` en sus dos variantes.
4. **H-67 y H-68:** `totalKg` de Ruta es texto exacto y `.ruta-op` tiene 16 px de radio.
5. **H-71, H-72 y H-73:** la ruta sin camión se ve como ruta con camión «—»; axe solo excluye el cuadro lima en el modo claro; la redirección del tablero sin permiso tiene prueba.
6. **H-74:** si el envío deja de estar En Preparación durante la operación, no queda guardado ningún cambio de esa operación (prueba que lo habría detectado).

## Pruebas obligatorias
- Una prueba por hallazgo (criterios 1 a 6), con el hallazgo o el requisito en el nombre (`H-74: …`, `RNF-14: …`)
- La batería completa de navegador (protocolo B7)

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking
```

## Fuera de alcance
- Los hallazgos de otros pasos (CE-13, JC-09, JG-25).
- Cambiar el comportamiento de D-09: el filtro por sede se queda como está; solo se agrega su prueba.

## Notas
- Rama `josue/JM-09-correcciones-auditoria`. Tarea creada en la convergencia 2 (JG-13), por decisión de Jordin del 26/10.

## Resultado

Implementado por Josué Menéndez el 27/10/2026 sobre la rama `josue/JM-09-correcciones-auditoria` desde `develop` (`ec6b593`).

### Qué se hizo
1. **H-66 (RN-17):** En `src/modulos/ruta/acciones.test.ts`, se actualizó el caso de prueba «otra sede» usando una función generadora que crea una ruta En Ruta real en la sede 2 (`entradaOtraSede`). Se verificó que las server actions rechazan la operación (`ErrorAcceso`) y que en base de datos la ruta no cambia ni su orden de paradas ni su estado.
2. **D-09 (RF-SL-26):** En `src/modulos/ruta/servicio.test.ts`, se agregó prueba de integración con un piloto que tiene dos sedes asignadas (sede 1 y sede 2), verificando que cuando su sede activa es la sede 1 solo ve las rutas de esa sede, y al cambiar a sede 2 solo ve las de la sede 2.
3. **H-67:** En `src/modulos/ruta/servicio.ts`, `EntregaRutaItem.totalKg` y `RutaEnCursoItem.totalKg` se tiparon y serializan como texto exacto (`toString()`, tipo `string`), eliminando conversiones a `number` vía `.toNumber()`. Se actualizaron las aserciones de `servicio.test.ts` para verificar la precisión exacta como texto.
4. **H-68:** Se agregó el token CSS `--radius-prototipo-10: 16px` en `src/app/globals.css` y se actualizó `src/app/picking/ruta/ruta.css` para que `.ruta-op` use `border-radius: var(--radius-prototipo-10);`, igualando los 16 px del prototipo (`estilos.css:401`).
5. **H-69 (RNF-14):** En `pruebas-e2e/picking/ruta.spec.ts`, se añadió prueba E2E de reordenamiento de clientes mediante arrastre táctil en teléfono utilizando emulación CDP `Input.dispatchTouchEvent` con `hasTouch: true`, espera de retardo táctil de 420 ms y verificación de persistencia en la tabla y en BD. Se enriqueció `pruebas-e2e/picking/preparar-ruta.ts` con una segunda entrega en la ruta 3.
6. **H-70 (RF-SL-61):** En `pruebas-e2e/picking/ruta.spec.ts`, se incorporaron llamadas a `comprobarEncabezadoModulo()` para validar tanto el encabezado de «Mis rutas» (piloto) como el de «Rutas en curso» (usuario con `pk.ruta.todas`).
7. **H-71:** En `src/componentes/picking/bodega/tablero/TableroCliente.tsx`, si una ruta En Preparación carece de camión asignado (`camion == null`), la tarjeta lateral muestra la silueta del camión con matrícula «—», capacidad de 1 kg y cálculo de ocupación porcentual sobre las líneas, en lugar de mostrar «El cliente recoge en bodega». En `src/modulos/bodega/tablero.test.ts` y `pruebas-e2e/picking/tablero.spec.ts` se crearon pruebas unitarias y E2E correspondientes.
8. **H-72:** En `pruebas-e2e/picking/tablero.spec.ts`, la exclusión de contraste de axe para `.tb-num.recoge small` se restringió exclusivamente al modo claro, comprobando accesibilidad estricta en modo oscuro.
9. **H-73:** En `pruebas-e2e/picking/tablero.spec.ts`, se agregó caso de prueba E2E que comprueba que un usuario sin permiso de Bodega o sin sede activa (`ejemplo.06`) es redirigido a su módulo inicial (`/picking/ruta`).
10. **H-74:** En `src/modulos/bodega/servicio.ts`, las funciones `ordenarLineasPorPeso`, `reordenarColaBodega` y `reordenarLineasPreparacion` se migraron de transacciones por lotes (`$transaction([...])`) a transacciones interactivas (`prisma.$transaction(async (tx) => ...)`) con `exigirCambios(resultados)` ejecutado dentro del callback para garantizar rollback atómico si el envío deja de estar En Preparación. Se agregó prueba de concurrencia en `servicio.test.ts`.
11. Se agregaron las subsecciones `### Correcciones de la auditoría (2026-10-26)` en `JM-05`, `JM-06` y `JG-23`.

### Verificación
Evidencias fotográficas y comparación con el prototipo documentadas en [`plan/evidencias/JM-09/`](../evidencias/JM-09/README.md).
- `npm run formato`: Archivos formateados con Prettier (aprobado).
- `npm run lint`: 0 errores, 0 advertencias.
- `npm run tipos`: TypeScript compila sin errores.
- `npm test`: 52 archivos de prueba pasados, 432 pruebas unitarias/integración aprobadas (incluyendo `servicio.test.ts`, `acciones.test.ts`, `tablero.test.ts`).
- `npm run build`: Compilación de producción Next.js 16 exitosa.
- `node scripts/tareas.mjs --validar`: Plan válido, 69 tareas.
- `npm run e2e -- pruebas-e2e/picking`: Batería completa de picking aprobada con 161 de 161 pruebas pasadas (13.8m con 1 worker), cubriendo `bodega.spec.ts`, `bodega-tiempo-real.spec.ts`, `tablero.spec.ts`, `ruta.spec.ts`, `camiones.spec.ts`, `facturacion-carga.spec.ts`, `facturacion-dos-facturadores.spec.ts`, `facturacion-envio.spec.ts`, `reportes.spec.ts`, `reportes-exportacion.spec.ts`, `usuarios.spec.ts` y `auditoria-jg24.spec.ts`.
- Capturas lado a lado con el prototipo aprobadas en 390, 768 y 1440 px para Ruta (`rutaMod()`, H-68) y en 390, 768, 1440 y 1920 px para Tablero (`Tablero.ruta()`, H-71) en [`plan/evidencias/JM-09/`](../evidencias/JM-09/README.md).


