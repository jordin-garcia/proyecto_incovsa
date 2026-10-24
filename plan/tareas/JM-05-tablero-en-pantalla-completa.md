---
id: JM-05
titulo: Tablero de Bodega en pantalla completa, modo claro y modo oscuro
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
depende_de: [JM-04]
programada: 2026-10-22
requisitos: [RF-SL-25, RF-SL-58, RF-SL-77, RNF-02]
pantallas: [tablero.js › ruta, pagina, actual, linea, lateral, ajustar; picking.js › herramientas, detalle]
---

# JM-05 · Tablero de Bodega en pantalla completa, modo claro y modo oscuro

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** jue 22/10 · **Depende de:** JM-04

## Objetivo
El **tablero** que se proyecta en la TV o se usa en la tableta: la ruta o el pedido en curso con su avance, las líneas con unidades grandes, el panel del camión con la ocupación por peso y la cola, en **modo claro** y **modo oscuro**, con tiempo real.

## Contexto que debes leer
- `specs/07` §"Tablero en pantalla completa" y §"Legibilidad" **completos** (modos, lote y cuadro del pedido en cada modo, numeración de las filas, silueta del camión)
- `specs/15`: RNF-02; `specs/16`: decisiones 36 (sesión de 7 días en la TV) y 56 (el modo se guarda en cada pantalla)
- `specs/20` §"Design system aprobado" (tablero "Pickit Visual") y CAM-71, CAM-93, CAM-94
- Prototipo: `#/picking/tablero?cuenta=ejemplo.05&tema=oscuro` y `&tema=claro`; `tablero.js` **completo** (`ruta()`, `pagina()`, `actual()`, `linea()`, `lateral()`, `ajustar()`); las siluetas de `entregable-1/prototipos/pickit-visual/camion-grande.svg`
- `## Resultado` de JM-02, JM-03 y JM-04

## Qué hacer
1. Pantalla `src/app/picking/tablero/` (permiso `pk.bodega`), sin el armazón, igual a `tablero.js`:
   - la ruta o el pedido en curso (el primero de la cola) con el anillo de avance, su número, su fecha y hora programadas, y en la ruta el camión y el piloto;
   - las líneas con producto, lote, unidades grandes (`Unidades`), resto y casilla, repartidas en una o dos columnas según el alto disponible (`ajustar()`); **numeradas de arriba hacia abajo, primero la columna izquierda y después la derecha** (RF-SL-77);
   - el panel lateral con la **silueta del camión grande** para todos los camiones (con su nombre y capacidad arriba) y la ocupación por peso, y la cola de rutas y pedidos;
   - la barra superior con **"Modo claro"** y **"Modo oscuro"** (RF-SL-58), el reloj y, también aquí, el Detalle, el orden por peso y el marcar todo.
2. **Modos** (specs/07): claro igual al modo "Tableta" del prototipo; oscuro en escala de negros y grises. En el modo claro, el lote en verde y el cuadro de "PEDIDO" en verde lima (`--lima`); en el oscuro, los dos en gris (fondo #3A3A3E, texto #EDEDED). El modo elegido se guarda en esa pantalla (en el navegador) y no se comparte.
3. Tiempo real con `useCambiosDeSede(sede)`; las marcas que cambian en otra pantalla se resaltan como en el prototipo (`marcasPrevias`).
4. Legible en una TV de 1920×1080 a distancia y usable con el dedo en una tableta (RNF-02).

## Archivos que creas o modificas
- `src/app/picking/tablero/**`, `src/componentes/picking/bodega/tablero/**` (crear)
- `public/` o `src/componentes/picking/bodega/` (la silueta del camión como componente SVG) (crear)
- `pruebas-e2e/picking/tablero.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-58:** el tablero cambia entre modo claro y oscuro, y el modo se conserva al recargar esa pantalla sin afectar a otras.
2. **CAM-93 / CAM-94:** colores del lote y del cuadro del pedido de cada modo, exactamente los de `specs/07`; todas las rutas con la silueta del camión grande.
3. **RF-SL-77** (CP-40): con más líneas de las que caben en una columna, la numeración va de arriba hacia abajo, primero la izquierda y después la derecha.
4. **RNF-13:** marcar una línea en Bodega se ve en el tablero en menos de 2 segundos.
5. Coincide con el prototipo en 1920×1080 (TV) y 768×1024 (tableta), en los dos modos (capturas en el PR), y no tiene violaciones serias de axe.

## Pruebas obligatorias
- `pruebas-e2e/picking/tablero.spec.ts` (criterios 1 a 5, proyecto `tv` y `tableta`)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/tablero.spec.ts
```

## Fuera de alcance
- Bodega en el armazón (JM-03 y JM-04).

## Resultado

Lo terminó el coordinador (Jordin) el 24/10/2026, por la ausencia de Josué y con su aviso (`plan/protocolo.md` §E4). Josué no tenía rama de esta tarea: se partió de `develop`.

**Qué se hizo.** La pantalla `/picking/tablero` (permiso `pk.bodega` y sede de trabajo) reproduce `tablero.js` del prototipo, sin el armazón:
- barra superior con el logotipo de cada modo, «Tablero de preparación · Bodega *sede*», «En vivo», «N en cola», el reloj (HH:MM de Guatemala), «Modo claro», «Modo oscuro», pantalla completa y volver al módulo;
- la ruta o el pedido en curso, con su cuadro (verde en la ruta; lima en el pedido en el modo claro y gris #3A3A3E/#EDEDED en el oscuro), la prioridad, la fecha y hora programadas, el camión y el piloto, el anillo de avance y el total;
- «Detalle de Ruta/Pedido» (la misma ventana del módulo), «Ordenar por peso» y «Marcar todo/Desmarcar todo»;
- las líneas con producto, lote (verde en el modo claro, gris en el oscuro), kg, unidades grandes y resto, en una o dos columnas según el alto, como `ajustar()`; con dos columnas se numeran de arriba hacia abajo, primero la izquierda (RF-SL-77);
- el panel lateral con la silueta del camión grande para todos los camiones, la ocupación por peso y la cama con un segmento por línea; en el pedido, «El cliente recoge en bodega»; y la cola, que se reordena arrastrando;
- el despacho con la misma confirmación del módulo y el aviso de pantalla completa «Ruta N despachada · Pasa a En Ruta · *piloto*».

**Decisiones tomadas.**
- El armazón (`ArmazonConSesion`) deja solo el contenido en `/picking/tablero` y conserva su suscripción de tiempo real (`modulo=tablero`), como pide el Resultado de JG-10: el tablero no abre otra conexión y muestra «En vivo» con `useConexionEnVivo`.
- El modo se guarda en `sessionStorage` (`incovsa-tb-tema`), como el prototipo (decisión 56): se conserva al recargar esa pantalla y no pasa a otras. Por decisión de Jordin del 24/10, sin elección previa y al reiniciar el navegador abre en **modo claro** (el prototipo abre en oscuro).
- Por decisión de Jordin del 24/10, en una ruta que no cabe ni con el alto mínimo de las líneas, todas se pueden ver y tocar en cualquier tamaño: en tableta, escritorio y TV se desplaza el área de las líneas (la cabecera, las opciones y el despacho siguen a la vista), y en el teléfono se desplaza toda la pantalla y la barra superior pasa a otra línea; y el panel del camión no se ensancha con muchas líneas. En el prototipo, las líneas que no caben quedan ocultas y a 390 px el contenido se corta. Lo prueba «RNF-02: en una ruta que no cabe…» con una ruta de 60 líneas.
- La pantalla se queda en la ruta o el pedido que muestra aunque cambie la prioridad, hasta que se despacha (`verPed` del prototipo). Las líneas que cambian, también desde otra pantalla, se resaltan cada vez (`marcasPrevias`).
- La ocupación del camión se calcula en el servidor con `Prisma.Decimal` (`calcularOcupacion`), y las cantidades viajan como texto exacto al navegador.
- Se aplicaron desde el inicio las lecciones de la auditoría del 22/10 en Bodega: las acciones capturan las fallas de red y vuelven atrás con un mensaje (H-24); RNF-13 se mide desde `avisarCambio`, como JG-10 (H-25); y los datos de prueba se crean en un solo proceso (H-26).
- Las precisiones que `specs/07` no decía quedaron en `specs/07` («Precisiones del tablero») y en `specs/18`. El cuadro lima de «PEDIDO» usa la misma excepción de contraste aprobada para el módulo (JM-08).

**Archivos principales.** `src/app/picking/tablero/page.tsx` y `tablero.css`; `src/componentes/picking/bodega/tablero/` (`TableroCliente.tsx`, `SiluetaCamion.tsx`, `disposicion.ts`, `preferencias.ts`); `src/modulos/bodega/tablero.ts`; los tokens `--color-tb-*` y `--radius-tb-*` de `src/app/globals.css`; `pruebas-e2e/picking/tablero.spec.ts`. También cambiaron `ArmazonConSesion.tsx`, `BodegaCliente.tsx` (exporta `reducirEnviosOptimistas`, ahora genérica) y `pruebas-e2e/picking/preparar-envio.ts` (`crear-tablero` y `limpiar` con varios envíos).

**Cómo usarlo.**
- `listarTableroBodega(sedeId)` (`@/modulos/bodega/tablero`) devuelve los envíos En Preparación en el orden de la cola, con las cantidades como texto, el camión con su capacidad y `ocupacion` (`calcularOcupacion`). Exige que el llamador ya haya validado el permiso y la sede.
- `reducirEnviosOptimistas<T>` de `BodegaCliente.tsx` sirve para cualquier lista que extienda `EnvioBodegaItem`.
- Para las pruebas: `npx tsx pruebas-e2e/picking/preparar-envio.ts crear-tablero <base>` crea una ruta, un pedido, una ruta de 25 líneas en el Camión 3, otro pedido y una ruta de 60 líneas; `limpiar <id> <id> …` los borra.

**Verificación (24/10/2026).** `npm run verificar`: formato, lint, tipos y 375 pruebas de Vitest (16 nuevas). `npm run build`: aprobado. `pruebas-e2e/picking/tablero.spec.ts`: 36 aprobadas (9 casos en teléfono, tableta, escritorio y TV), con axe en los dos modos sobre la ruta y el pedido, RNF-13 por debajo de 1999 ms desde `avisarCambio` y una ruta de 60 líneas. Batería E2E completa con un *worker*: 336 aprobadas (dos casos ajenos se repitieron: `permisos.spec.ts`, por envíos de ejemplo que quedaron en la base local, y `bodega-tiempo-real.spec.ts:185` en teléfono, por tiempo, como H-26). Mutación de `src/modulos/bodega/tablero.ts`: 86.11 %. Dos revisiones en contexto limpio; sus hallazgos de corrección quedaron corregidos. Capturas lado a lado con el prototipo en `plan/evidencias/JM-05/`.
