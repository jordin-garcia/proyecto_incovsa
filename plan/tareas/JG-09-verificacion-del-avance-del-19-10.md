---
id: JG-09
titulo: Verificación del avance del Entregable 2 (19/10)
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: [JG-07, JG-08, CE-03, DM-03, DM-05, JC-04, JM-03]
programada: 2026-10-18
requisitos: [RF-SL-50, RF-SL-16, RF-SL-21, RF-SL-22, RF-SL-23, RF-SL-24, RF-SW-07, RF-SW-03, RF-SW-04]
pantallas: []
---

# JG-09 · Verificación del avance del Entregable 2 (19/10)

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** JG-07, JG-08, CE-03, DM-03, DM-05, JC-04, JM-03

## Objetivo
Comprobar, la noche del domingo 18/10, que el avance que Jordin presenta el lunes 19/10 al Ing. Manuel Rojas funciona de punta a punta con lógica de negocio y datos guardados de verdad (specs/16, decisión 72; `specs/17` §"Qué exige cada entregable"), y dejar el equipo de Jordin listo para la demostración.

## Contexto que debes leer
- `plan/calendario.md` §"Guion de la demostración del 19/10"
- `specs/17-lineamientos-del-curso.md` §"Qué exige cada entregable" (Entregable 2)
- `## Resultado` de todas las tareas del hito E2

## Qué hacer
1. En el equipo de Jordin: `git switch develop && git pull`, `npm ci`, `npm run db:reiniciar`, `npm run db:semilla`, `npm run semilla:demo` y `npm run build && npm start` (modo de producción en local).
2. Recorrer con Playwright **cada paso** del guion de la demostración del 19/10 y guardar una captura de cada uno en `plan/convergencia/2026-10-18-avance-e2/`.
3. Cargar en Facturación el archivo anonimizado (`pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx`) y comprobar que el resumen de la carga dice 33 pedidos facturados cargados y 46 sin cargar por el Peso de Conversión en 0 (P-91).
4. Por cada paso que falle: si es de otra persona y se corrige en minutos, corrígelo (protocolo §E1) con aviso en la bitácora; si no, anótalo en el informe con el dueño y la alternativa para la demostración.
5. Escribir `plan/convergencia/2026-10-18-avance-e2.md`: qué funciona (con su captura), qué falla y cómo se presenta, y la lista de lo que queda para el hito E3.
6. Dejar en el informe los comandos exactos para levantar la demostración el lunes por la mañana.
7. Crear la etiqueta `v0.5-entregable2` sobre el *commit* de `develop` verificado (specs/16, "Forma de trabajo").

## Archivos que creas o modificas
- `plan/convergencia/2026-10-18-avance-e2.md` y sus capturas (crear)
- Correcciones puntuales en archivos de otros, con aviso en `plan/bitacora/jordin.md` (protocolo §E1)

## Criterios de aceptación
1. El guion de la demostración del 19/10 se puede seguir completo, con datos guardados en PostgreSQL: lo que se hace en un paso sigue ahí al recargar la página o al entrar con otro usuario.
2. El flujo obligatorio funciona: **pedido facturado** (carga del archivo de Odoo) → **conversión** de kg a unidades → **generación del picking** (envío a Bodega con sus líneas de preparación) → **preparación** (marcado de filas y despacho).
3. El panel del sitio permite editar el contenido institucional, las industrias y el catálogo, y el sitio público muestra los cambios.
4. El inicio de sesión con usuario y contraseña y los permisos por usuario funcionan en los dos sistemas.
5. El informe tiene una captura por paso del guion.

## Pruebas obligatorias
- Las pruebas de las tareas del hito E2 pasan en `develop` (`npm run verificar` y `npm run e2e`).

## Verificación
```
npm run verificar
npm run build
npm run e2e
```

## Fuera de alcance
- Implementar funcionalidades nuevas: solo se verifica y se corrige lo que falla.

## Notas
- El Documento 2 v0.4 ya está entregado y no se edita (specs/16, decisión 72 y P-96). Para el 19/10 no se prepara nada más que la demostración.

## Resultado

El avance se presentó al Ing. Manuel Rojas el 19/10 y esta tarea se cerró después, el 22/10. Por decisión de Jordin, se verificó el `develop` de ese día (`e96cf3f`, que ya incluye lo integrado hasta JG-11), y el informe y las capturas llevan la fecha del 22/10 en lugar de la del 18/10. Se redactó como verificación posterior, sin alternativas para una demostración que ya ocurrió.

### Qué se hizo

- Se reinició la base local, se cargaron las dos semillas y se compiló y arrancó la aplicación en modo de producción (`npm run build && npm start`).
- Un script de Playwright recorrió los 8 pasos del guion del 19/10 y guardó 31 capturas en `plan/convergencia/2026-10-22-avance-e2/`. Todo el flujo obligatorio funciona con datos persistidos: carga del archivo de Odoo (33 cargados y 46 sin cargar por P-91), Ruta 1 y Pedido 1 enviados a Bodega, conversión «N unidades + R kg», marcado, ordenamiento, Detalle de Ruta y los dos despachos, persistencia tras recargar y con otro usuario, creación de un usuario con permisos por casillas y sede, y edición del contenido, las industrias y el catálogo con su reflejo en el sitio público.
- Informe: `plan/convergencia/2026-10-22-avance-e2.md`, con el resultado por paso y por criterio, los hallazgos, los comandos para levantar la demostración y lo que queda para E3.
- Etiqueta `v0.5-entregable2` creada y publicada sobre `e96cf3f`.

### Hallazgos (detalle en el informe)

- **H-01:** en producción local no se puede iniciar sesión sin Caddy, porque solo se acepta `X-Real-IP` (decisión 29). Es intencional y no se cambió. Para la verificación, el script envió esa cabecera como lo haría Caddy.
- **H-02:** en producción local no hay imágenes sin R2 (decisión 78): falla la subida y las imágenes de la semilla dan 404. La subida se comprobó con `npm run dev`. Depende de CE-08 (bloqueada por P-94).
- **H-03:** `next start` avisa que no corresponde con `output: standalone`, aunque funcionó.
- **Observación para JG-12:** el encabezado de Bodega no muestra el formato del prototipo que la entrada de JM-08 le pidió a JM-04.
- No se corrigió código ajeno: ningún paso falló por un error de otra persona.

### Verificación

- `npm run verificar`: formato, lint y tipos correctos; 347 pruebas en 40 archivos.
- `npm run build`: correcto.
- `npm run e2e`: 275 de 276 casos aprobados, sin omisiones. El caso que falla en este equipo es «RNF-13 / RF-SL-23 (CP-37)» de `bodega-tiempo-real.spec.ts` en escritorio, por el límite de 30 segundos de la prueba. El aviso SSE tardó 1499 ms, dentro de los 2 segundos; el tiempo se agota en la parte de reversión, por las llamadas a `npx tsx` de 4 a 5 segundos en este equipo. Se anota para JG-12.
- `node scripts/tareas.mjs --validar`: plan válido.

### Cómo usar lo que se creó

- **Demostración local:** usar `npm run dev` con los comandos del informe; no `npm start` (H-01 y H-02).
- **JG-12 (Convergencia 1):** partir de la sección «Lo que queda para el hito E3» y de la observación sobre el encabezado de Bodega del informe.
- **JG-14:** el guion y la tabla de resultados del informe sirven de base para el flujo completo. El script de Playwright del recorrido fue temporal y no se conservó en el repositorio. En modo de producción sin Caddy hay que enviar `X-Real-IP`, como ya hacen `pruebas-e2e/flujo/tiempo-real.spec.ts` y `pruebas-e2e/picking/bodega-tiempo-real.spec.ts`.
