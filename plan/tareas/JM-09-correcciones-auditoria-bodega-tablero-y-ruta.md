---
id: JM-09
titulo: Correcciones de la auditoría del 26/10 en Bodega, el tablero y Ruta
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JM-06, JG-23]
programada: 2026-10-27
requisitos: [RF-SL-26, RF-SL-61, RNF-14, RN-17]
pantallas: [picking.js › ruta(), tablero.js › Tablero.ruta()]
---

# JM-09 · Correcciones de la auditoría del 26/10 en Bodega, el tablero y Ruta

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JM-06, JG-23

## Objetivo
Corregir los hallazgos del paso 2 de la auditoría del 26/10 (H-66 a H-74) en Ruta (JM-06), el tablero (JM-05) y Bodega (JG-23), y agregar la prueba de D-09. Ninguno es grave: son pruebas que faltan, una cantidad que viaja como número, un radio distinto del prototipo, el panel de una ruta que se queda sin camión y una transacción que no vuelve atrás en una carrera.

## Contexto que debes leer
- `plan/auditorias/2026-10-26.md`, paso 2 (H-66 a H-74) y D-09
- `specs/08-picking-ruta.md` («Acceso», precisión del 26/10 de D-09); `specs/07-picking-bodega.md` (tablero en pantalla completa); `specs/18`, «Decisiones de la auditoría del 26/10»
- `plan/protocolo.md` §E3: aunque no eres el coordinador, se corrige igual: cada hallazgo lleva una prueba que lo habría detectado
- Prototipo: `picking.js` › `ruta()` y `rutasVisibles` (l. 385); `tablero.js` (l. 96, camión «—»); `estilos.css:401` (`.ruta-op`)
- `## Resultado` de JM-05, JM-06 y JG-23 (y las ayudas de prueba que dejó JG-23: `comprobarRechazosDeAccion()` con función en `entradaOtraSede`, y `comprobarEncabezadoModulo()`)

## Qué hacer
1. **H-66:** en `src/modulos/ruta/acciones.test.ts`, el caso «otra sede» usa una ruta En Ruta **real** de la sede 2 (función en `entradaOtraSede`) y comprueba que no cambió.
2. **H-67:** `totalKg` de Ruta viaja como texto exacto (`toString()`), no con `.toNumber()`. Ajusta el tipo `EntregaRutaItem.totalKg` y `servicio.test.ts`.
3. **H-68:** `.ruta-op` con el radio de 16 px del prototipo (`estilos.css:401`). No hay un token de 16 px: usa el valor del design system más cercano que dé 16 px, o pregúntale al coordinador antes de agregar un token.
4. **H-69 (RNF-14):** una prueba de navegador con `hasTouch` que reordena dos clientes con el arrastre táctil en el teléfono, como `bodega-tiempo-real.spec.ts:422`.
5. **H-70 (RF-SL-61):** `ruta.spec.ts` llama a `comprobarEncabezadoModulo()` con «Mis rutas» (piloto) y «Rutas en curso» (con `pk.ruta.todas`).
6. **H-71:** si el camión de una ruta En Preparación se cambió de sede, el tablero muestra la **ruta** con el camión «—», como `tablero.js:96`, y no el texto de «El cliente recoge en bodega». Con su prueba.
7. **H-72:** en `tablero.spec.ts`, la exclusión de axe de `.tb-num.recoge small` aplica solo en el modo claro (la excepción de JM-08 es del cuadro lima del modo claro).
8. **H-73:** prueba de que `/picking/tablero` sin permiso de Bodega o sin sede lleva al módulo inicial (`ejemplo.06` → `/picking/ruta`), como dice `specs/07`.
9. **H-74:** en `src/modulos/bodega/servicio.ts`, las operaciones que hoy llaman a `exigirCambios()` después de un `$transaction([...])` en arreglo (l. 252-267, 373-385 y 408-423) usan una transacción interactiva y lanzan el error dentro, para que, si otra pantalla despacha a la mitad, no quede nada guardado. Con su prueba.
10. **D-09:** una prueba de un piloto con **dos sedes** que solo ve las rutas de la sede de trabajo elegida, y las de la otra al cambiar de sede.
11. En el `## Resultado` de JM-05, JM-06 y JG-23, agrega `### Correcciones de la auditoría (2026-10-26)` con lo que se corrigió. Su estado no cambia.

## Archivos que creas o modificas
- `src/modulos/ruta/**` (servicio, acciones y sus pruebas); `src/componentes/picking/ruta/**`; `src/app/picking/ruta/ruta.css`
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
- CE-13 cambia cómo las pruebas de navegador guardan la evidencia (`EVIDENCIA=1`, `plan/convenciones.md` §6) y toca `tablero.spec.ts` y `bodega-tiempo-real.spec.ts`. Si integra antes que tú, actualiza tu rama desde `develop` y conserva los dos cambios.
