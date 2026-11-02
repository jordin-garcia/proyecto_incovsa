---
id: JC-11
titulo: Facturación en Firefox, la lista al seleccionar todos
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-16]
programada: 2026-11-01
requisitos: [RF-SL-69, RNF-11]
pantallas: [picking/facturacion]
---

# JC-11 · Facturación en Firefox, la lista al seleccionar todos

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** dom 01/11 · **Depende de:** JG-16

## Objetivo
La matriz de navegadores de JG-16 encontró que, en Firefox y en el teléfono, la prueba `RF-SL-50 / RF-SL-67 / RF-SL-69: carga, muestra y selecciona pedidos facturados` (`pruebas-e2e/picking/facturacion-carga.spec.ts`) falla. Después de marcar «Seleccionar todos», el `scrollTop` del tablero de pedidos pasa de 360 a 106.5; en Chromium y WebKit se queda en 360. Hay que confirmar si la persona ve que la lista salta y corregirlo.

## Contexto que debes leer
- `specs/04` RF-SL-69 y `specs/15` RNF-11
- `plan/pruebas/matriz-2026-10-30.md` (JG-16): resultado de Firefox en el teléfono
- `## Resultado` de JG-16: cómo correr una prueba en Firefox (`NAVEGADOR=firefox`)

## Qué se sabe
- Lo provoca la aplicación, no Playwright: también pasa al marcar la casilla con el teclado (Espacio). Al seleccionar todos, las tarjetas se encogen y el desplazamiento máximo de la lista baja de 4791 a 1386 px.
- Chromium conserva el `scrollTop`. Firefox lo cambia con su anclaje de desplazamiento (*scroll anchoring*), que intenta dejar quieto lo que se ve, así que puede que la tarjeta visible no se mueva aunque el número cambie.

## Qué hacer
1. Reproducirlo: `npx playwright install firefox` y `NAVEGADOR=firefox npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --project=telefono --workers=1`.
2. Comprobar en Firefox, con Playwright, si la tarjeta que se veía antes de seleccionar todos sigue en el mismo lugar de la lista.
3. Si la lista salta a la vista, corregir el tablero para que conserve la posición en los tres navegadores. Si no salta, cambiar la comprobación de la prueba para que mida la posición de la tarjeta visible en lugar del `scrollTop`, con un comentario que lo explique. En los dos casos, la prueba debe seguir detectando un salto real.
4. Correr la prueba en Chromium, Firefox y WebKit, en los tres tamaños.

## Archivos que creas o modificas
- `src/componentes/picking/facturacion/**` (si hay que corregir la pantalla)
- `pruebas-e2e/picking/facturacion-carga.spec.ts` (modificar)

## Criterios de aceptación
1. **RF-SL-69 / RNF-11:** al seleccionar todos, la lista no salta a la vista en Chromium, Firefox ni WebKit, y la prueba lo comprueba en los tres navegadores y en los tres tamaños.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
NAVEGADOR=firefox npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
NAVEGADOR=webkit npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
```

## Fuera de alcance
- Las demás pruebas de la matriz: JG-16 ya las dejó pasando.


## Resultado

Se confirmó un salto visible: en la traza de Firefox de la matriz original, el pedido 03553 subía aproximadamente 110 px al seleccionar todos. La corrección conserva la posición de una tarjeta visible antes de repintar, priorizando una tarjeta completa o un encabezado visible; contempla también tarjetas parciales. Se desactiva el segundo ajuste automático de anclaje del navegador en esa lista. Se mantiene la compactación aprobada de las tarjetas seleccionadas, sin textos, controles, dependencias ni operaciones del servidor nuevas.

### Archivos principales

- `FacturacionTablero.tsx`: captura y restauración del ancla visible; compensación del espacio cuando el nuevo desplazamiento quedaría fuera del rango.
- `FacturacionTablero.module.css`: `overflow-anchor: none` en la lista que restaura su propia posición.
- `pruebas-e2e/picking/facturacion-carga.spec.ts`: conserva las comprobaciones de selección individual y verifica la posición real de la tarjeta tras seleccionar todos (tolerancia de 1 px y espera de dos repintados). Incluye selección con teclado, una ventana sin tarjetas completas y dos tarjetas parcialmente visibles.
- Capturas de aplicación y prototipo en los tres tamaños: `pruebas-e2e/picking/evidencias/jc-11/`.

### Verificación

- Fase roja: la nueva regresión falló en los tres tamaños de Chromium, con saltos de 368, 367,125 y 302,125 px.
- Regresión corregida en Chromium: 3/3, incluidos los casos adicionales de tarjetas parciales y teclado.
- [Matriz final 41390020826](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/41390020826): 1 554 casos aprobados, ninguna prueba omitida ni fallo definitivo. Facturación pasa en las nueve combinaciones de navegador y tamaño. Dos pruebas de arrastre de Bodega en WebKit pasaron al repetirse.
- `npm run verificar`: formato, lint, tipos y 501 pruebas en 57 archivos aprobados; `npm run build` correcto.
- Batería E2E local: 514 aprobadas, 2 tiempos de espera agotados y 2 casos posteriores sin ejecutar. Repetición de Contacto: 3/3; repetición de Bodega y flujo completo en tableta: 4/4. Los 518 casos distintos quedaron comprobados.
- Revisión independiente en contexto limpio: LISTO tras corregir y cubrir los dos hallazgos sobre tarjetas parciales.

### Cómo usarlo

No requiere configuración nueva. En Facturación, desplazar la lista y marcar «Seleccionar todos» con ratón, toque o teclado conserva el pedido visible. Repetir con los tres comandos de la sección Verificación. La matriz completa se ejecuta con `gh workflow run matriz-navegadores.yml --ref <rama>` y conserva reportes y trazas en sus artefactos.
