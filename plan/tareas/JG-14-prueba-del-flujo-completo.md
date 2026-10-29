---
id: JG-14
titulo: Prueba del flujo completo y recorrido diario en GitHub Actions
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JC-06, JM-06, JC-05, JM-04]
programada: 2026-10-27
requisitos: [RN-11, RF-SL-16, RF-SL-24, RF-SL-29, RF-SL-37, RF-SL-38, RNF-06]
pantallas: []
---

# JG-14 · Prueba del flujo completo y recorrido diario en GitHub Actions

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JC-06, JM-06, JC-05, JM-04

## Objetivo
Escribir la **prueba integral** que exigen los lineamientos (Documento 6 §10) y programarla para que GitHub Actions la corra **cada día** sobre `develop` (specs/16, decisión 67): pedido facturado → conversión de kg a unidades → generación del picking → preparación → carga → despacho → actualización de estado → reporte. La actualización de inventario no aplica (exclusión aprobada, P-58).

## Contexto que debes leer
- `specs/17` §"Qué exige cada entregable" (Entregable 3) y §"Cómo cubre el sistema lo que piden los lineamientos"
- `specs/12`: RN-11 (estados), RN-29, RN-49, RN-51, RN-52
- `specs/06`, `specs/07`, `specs/08` y `specs/10` (lo que se ve en cada paso)
- `specs/16`: decisiones 46, 67 y 77
- `## Resultado` de JC-04, JC-05, JC-06, JM-03, JM-04 y JM-06

## Qué hacer
1. `pruebas-e2e/flujo/flujo-completo.spec.ts`, con usuarios de la semilla de demostración y el archivo anonimizado:
   1. `ejemplo.03` (facturador) carga el archivo y comprueba el resumen (33 cargados, 46 sin cargar por el Peso de Conversión en 0);
   2. arrastra tres pedidos facturados a "Envío por camión", elige el Camión 1 y el piloto `ejemplo.06`, escribe la fecha y la hora programadas, y envía: se crea la **Ruta 1** del día;
   3. arrastra otro a "Cliente recoge en bodega" y lo envía: se crea el **Pedido 1** del día;
   4. `ejemplo.05` (bodega) ve los dos en Bodega con su fecha y hora programadas; comprueba una fila con su lote y su conversión "N unidades + R kg" calculada con RN-01; marca todo y pulsa "Ruta Despachada" y "Pedido Despachado";
   5. `ejemplo.06` (piloto) ve la Ruta 1 en Ruta, reordena dos clientes y pulsa "Ruta Entregada";
   6. `ejemplo.01` (Gerencia) en Reportes, periodo de hoy: Despacho muestra los kg y unidades despachados; Rutas realizadas muestra la Ruta 1 Entregada con su recorrido en el orden del paso 5; la Bitácora muestra la carga, los envíos, los cambios de estado y el cierre de ruta.
2. Cada paso comprueba también el estado en la base de datos (RN-11) y guarda una captura (evidencia del Documento 6).
3. `.github/workflows/recorrido-diario.yml`: todos los días a las 06:00 de Guatemala, sobre `develop`, levanta PostgreSQL 18, aplica migraciones y semillas, compila, arranca la aplicación (`npm start`) y corre la prueba; sube las capturas y el reporte como artefactos; si falla, comenta en el issue "Tablero del plan" mencionando al coordinador.

## Archivos que creas o modificas
- `pruebas-e2e/flujo/flujo-completo.spec.ts` (crear)
- `.github/workflows/recorrido-diario.yml` (crear)

## Criterios de aceptación
1. La prueba pasa completa en local y en GitHub Actions, en Chromium.
2. Cada estado de RN-11 se comprueba en la pantalla y en la base: En Preparación, En Ruta, Entregado (ruta) y En Preparación, Despachado (pedido).
3. La numeración diaria (RN-52) da Ruta 1 y Pedido 1 por separado.
4. El recorrido guardado (RN-29) es el orden del paso 5.
5. El flujo se ejecuta solo cada día y avisa si falla.

## Pruebas obligatorias
- `pruebas-e2e/flujo/flujo-completo.spec.ts`

## Verificación
```
npm run build
npm run e2e -- pruebas-e2e/flujo
gh workflow run recorrido-diario.yml --ref develop
```

## Fuera de alcance
- Corregir los módulos: si un paso falla por un error de otro módulo, crea la tarea para su dueño (protocolo §C) o corrígelo (§E1).

## Notas
- **(26/10, convergencia 2)** El arranque en frío del servidor de producción de `pruebas-e2e/flujo/servidor-produccion.ts` falla a menudo en Windows (auditoría del 26/10, H-84). Lo corrige JG-25. Si haces esta tarea antes, repite la carpeta `flujo` cuando aparezca «No inició el servidor de producción de JG-10», sin cambiar sus tiempos máximos.

## Resultado

**Qué se hizo**
- `pruebas-e2e/flujo/flujo-completo.spec.ts`: la prueba integral del Documento 6 §10 recorre los pasos 1 a 6 con las cuentas de la semilla de demostración y el archivo anonimizado, contra el servidor de producción del fixture de JG-10 (`servidor-produccion.ts`):
  1. `ejemplo.03` carga el archivo (33 cargados, 46 sin cargar por el Peso de Conversión en 0);
  2. mueve tres pedidos facturados de clientes distintos a "Envío por camión" (Camión 1, `ejemplo.06`, fecha de hoy, 14:30) y crea la **Ruta 1**;
  3. mueve otro a "Cliente recoge en bodega" y crea el **Pedido 1**;
  4. `ejemplo.05` ve los dos en Bodega con su programación, comprueba una fila con lote y su conversión "N unidades + R kg" (calculada aparte con RN-01, en gramos enteros), marca todo y despacha;
  5. `ejemplo.06` reordena los dos primeros clientes y entrega la ruta;
  6. `ejemplo.01` ve en Reportes el despacho del día (kg, unidades, rutas y pedidos cerrados), la Ruta 1 Entregada con el recorrido del paso 5 y la bitácora de la carga, los envíos, los cambios de estado y el cierre de ruta.
- Cada paso comprueba la base con `pg`: el estado y el historial completo de RN-11 (ruta: En Preparación → En Ruta → Entregado; pedido: En Preparación → Despachado), el número del día (RN-52), las líneas, los clientes y la bitácora del envío (RNF-06), el recorrido guardado (RN-29) y los registros de bitácora de la corrida.
- Guarda 15 capturas por tamaño, adjuntas al reporte de Playwright. Con `EVIDENCIA=1`, también en `plan/evidencias/JG-14/` (convenciones §6).
- `.github/workflows/recorrido-diario.yml`: todos los días a las 06:00 de Guatemala (`0 12 * * *` UTC) sobre `develop`, y a mano (`workflow_dispatch`).
  - Levanta PostgreSQL 18, genera claves temporales aleatorias, aplica las migraciones y las semillas, instala Chromium, compila y corre la prueba.
  - Sube `playwright-report/` y `test-results/` como artefacto por 14 días.
  - Si el recorrido falla o agota su tiempo, el trabajo `aviso` comenta en el issue "Tablero del plan" mencionando al coordinador.
  - También corre en los PR que cambian la prueba, el fixture o el flujo, sin avisar.

**Decisiones**
- **Decisión 67 precisada (Jordin, 27/10):** el paso 3 de esta tarea decía `npm start`. Con `output: "standalone"`, `next start` no aplica, así que se usa el servidor *standalone* (`node .next/standalone/server.js`), el mismo de la imagen de Docker. Quedó en `specs/16` y `specs/18`.
- La prueba exige una base sin rutas, pedidos ni cambios de estado de hoy en Quetzaltenango; si no, falla con un mensaje claro. Al terminar borra en una transacción los envíos y los pedidos facturados que creó (`id` mayor que el máximo previo, cargados por `ejemplo.03` en la sede). La bitácora no se puede borrar y se conserva.
- Corre en teléfono, tableta y escritorio, uno a la vez, con el bloqueo `e2e:facturacion-envio` que ya usan las pruebas de Facturación. Las tarjetas se mueven con el teclado, que funciona en los tres tamaños. Cada movimiento espera la respuesta del servidor y la pantalla actualizada, porque el siguiente se valida contra lo que ve el facturador (decisión 39).
- El servidor del recorrido corre en UTC, como el contenedor de producción.

**Cómo usarlo**
- En local: `npm run build` y luego `npm run e2e -- pruebas-e2e/flujo/flujo-completo.spec.ts --workers=1`, sobre una base **nueva** (`db:aplicar`, `db:semilla` y `semilla:demo`).
  - Si aparece «No inició el servidor de producción de JG-10», repetir la corrida (H-84, lo corrige JG-25).
  - Para regenerar las capturas: `EVIDENCIA=1`.
- En GitHub: `gh workflow run recorrido-diario.yml --ref develop`. Los resultados quedan en Actions → "Recorrido diario", con las capturas en el artefacto `recorrido-diario-<id>`.
- JG-18 (Documento 6, Anexos F y G) puede usar las capturas de `plan/evidencias/JG-14/` y el reporte del recorrido como evidencia de la prueba integral.
- **Límite conocido:** con más de un trabajador en la batería completa, las pruebas de Bodega, Ruta y el tablero crean cambios de estado de hoy en Quetzaltenango sin el bloqueo, y la condición previa puede fallar. La batería local usa 1 trabajador, y el recorrido diario corre solo esta prueba.

**Evidencia**
- Carpeta `flujo`: 12 de 12 en local, en una base nueva (`plan/evidencias/JG-14/e2e-flujo.txt`).
- `npm run verificar`: 426 de 426 (`verificar.txt`). `npm run build`: sin errores (`build.txt`). En GitHub Actions, el flujo pasó en el PR #142 (3 de 3 en 45 s, artefacto con las capturas): https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/40624973151.

