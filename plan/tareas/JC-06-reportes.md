---
id: JC-06
titulo: "Reportes: Despacho, Rutas realizadas y Bitácora con filtros de periodo"
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: hecha
depende_de: [JC-04, JM-03]
programada: 2026-10-23
requisitos: [RF-SL-36, RF-SL-37, RF-SL-38, RF-SL-59, RN-39, CU-14]
pantallas: [picking.js › periodo, controlPeriodo, reportes]
---

# JC-06 · Reportes: Despacho, Rutas realizadas y Bitácora con filtros de periodo

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 23/10 · **Depende de:** JC-04, JM-03

## Objetivo
El módulo de Reportes con sus tres pestañas y el filtro de periodo, calculado en la hora de Guatemala. La exportación a Excel y PDF es JC-07.

## Contexto que debes leer
- `specs/10-picking-reportes.md` **completo** (salvo §"Exportación", que es de JC-07)
- `specs/12`: RN-01, RN-11, RN-29 y RN-39 (qué registra la bitácora)
- `specs/16`: decisión 6 (UTC y `America/Guatemala`)
- Prototipo: `#/picking/reportes?cuenta=ejemplo.01`; `picking.js` › `periodo()`, `controlPeriodo()` y `reportes()` (indicadores, tablas, textos y estados vacíos)
- `## Resultado` de JC-04, JM-02 (conversión), JM-03, JG-05 (`CampoFecha`, `Pestanas`, `BotonesSegmentados`) y JG-06 (`consultarBitacora`)

## Qué hacer
1. `src/modulos/reportes/`: consultas por sede y periodo (permiso `pk.reportes`):
   - **Despacho:** los cuatro indicadores de `specs/10` y la tabla por producto y Peso de Conversión (un mismo producto con distinto Peso de Conversión va en filas separadas), con la cantidad en kg y las unidades según RN-01 (con `src/modulos/conversion`), y el total del periodo en kg y en "N unidades + R kg";
   - **Rutas realizadas:** las rutas de la sede del periodo, de la más reciente a la más antigua, con las columnas de `specs/10` y el recorrido ("Se guarda al entregar" mientras no se entrega);
   - **Bitácora:** `consultarBitacora` del periodo (de los dos sistemas), con fecha y hora, usuario, operación y detalle.
2. **Filtro de periodo** (RF-SL-59): Diario, Semanal (lunes a domingo), Mensual, Anual y Rango, en las tres pestañas, con los controles del prototipo (`CampoFecha` para el día, la semana y el rango; listas para el mes y el año). Al abrir, el día de hoy. El rango incluye sus dos extremos. Todo calculado en la hora de Guatemala (`src/lib/fechas.ts`). El periodo se actualiza al pulsar Enter, al salir del campo o al elegir en el calendario; una fecha que no existe no cambia el periodo y marca el campo en rojo (CAM-91, CP-64).
3. El nombre de la pestaña Despacho cambia con el periodo ("Despacho diario", "Despacho semanal"…), como `periodo()`.
4. Los botones Excel y PDF quedan en su lugar del prototipo, sin funcionalidad, hasta JC-07.

## Archivos que creas o modificas
- `src/modulos/reportes/**` (crear)
- `src/app/picking/reportes/**`, `src/componentes/picking/reportes/**` (crear)
- `pruebas-e2e/picking/reportes.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-38:** con envíos de prueba despachados en el periodo, los indicadores y la tabla por producto suman exactamente los kg y las unidades (RN-01); los totales coinciden con la suma de las filas.
2. **RF-SL-59:** la semana va de lunes a domingo; un envío a las 23:30 del domingo en Guatemala cuenta en esa semana y no en la siguiente; el rango incluye sus extremos.
3. **RF-SL-37:** Rutas realizadas muestra En Ruta y Entregado; el recorrido aparece solo en las entregadas y en el orden guardado.
4. **RN-39:** la bitácora del periodo muestra las operaciones de los dos sistemas y no muestra el marcado de filas.
5. Un usuario con solo Quetzaltenango no ve datos de Guatemala; sin `pk.reportes` se rechaza en el servidor.
6. Las tres pestañas coinciden con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tienen violaciones serias de axe.

## Pruebas obligatorias
- Integración de las consultas (criterios 1 a 5)
- `pruebas-e2e/picking/reportes.spec.ts` (criterios 2 y 6, y CP-64)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/reportes.spec.ts
```

## Fuera de alcance
- La exportación a Excel y PDF (JC-07).

## Resultado

- Hecho: implementé las consultas de Despacho, Rutas realizadas y Bitácora con filtros diario, semanal, mensual, anual y rango. La pantalla conserva el comportamiento del prototipo y las capturas comparativas cubren 390, 768 y 1440 px.
- Decisiones tomadas: el periodo y las fechas se resuelven con `America/Guatemala`; las consultas verifican sesión, `pk.reportes` y sede. La Bitácora filtra registros de Picking según la sede del usuario objetivo, ocultando cambios que cruzan sedes. No cambié esquema, migraciones ni dependencias. Excel y PDF siguen deshabilitados para JC-07.
- Archivos principales: `src/modulos/reportes/servicio.ts`, `src/modulos/reportes/periodo.ts`, `src/app/picking/reportes/page.tsx`, `src/componentes/picking/reportes/Reportes.tsx` y `pruebas-e2e/picking/reportes.spec.ts`.
- Uso para JC-07: `consultarDespacho`, `consultarRutas` y `consultarOperaciones` reciben sesión, sede y filtro validado; el filtro se construye con `resolverPeriodo` de `src/modulos/reportes/periodo.ts`. Los tipos de retorno de esas funciones contienen los datos listos para la presentación y exportación.
- Verificación: `npm run verificar` (273 pruebas), `npm run build`, seis E2E de JC-06, tres pruebas de tokens y revisión independiente LISTO. La suite E2E completa tuvo tres fallos ajenos a JC-06, descritos en `src/modulos/reportes/evidencias/verificacion.md`.
