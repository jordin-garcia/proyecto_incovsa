---
id: JC-09
titulo: Correcciones de la auditoría del 26/10 en Reportes, Facturación y la Bitácora
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JC-07, JG-24]
programada: 2026-10-27
requisitos: [RF-SL-07, RF-SL-36, RF-SL-38, RF-SL-61, RN-39]
pantallas: [picking.js › reportes(), picking.js › facturacion()]
---

# JC-09 · Correcciones de la auditoría del 26/10 en Reportes, Facturación y la Bitácora

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JC-07, JG-24

## Objetivo
Corregir los hallazgos H-75 a H-81 del paso 3 de la auditoría del 26/10, en la exportación de Reportes (JC-07) y en las correcciones de JG-24 sobre la Bitácora, el acceso y Facturación. Hay que completar pruebas, arreglar las negritas del PDF, avisar si una descarga falla y evitar que un GET de la página de acceso escriba en la bitácora.

## Contexto que debes leer
- `plan/auditorias/2026-10-26.md`, paso 3 (H-75 a H-81) y D-10
- `specs/10-picking-reportes.md` («Exportación», con la precisión del 26/10 de D-10); `specs/06-picking-facturacion.md` (rejilla de D-06); `specs/18`, «Decisiones de la auditoría del 26/10»
- `plan/protocolo.md` §E3: cada hallazgo lleva una prueba que lo habría detectado
- Prototipo: `picking.js` › `reportes()` y `facturacion()`; `estilos.css:699` (`.fx-lista`)
- `## Resultado` de JC-07 y JG-24 (y `comprobarEncabezadoModulo()` de `pruebas-e2e/comunes/encabezado.ts`, de JG-23)

## Qué hacer
1. **H-75 (RF-SL-38):** completa `src/modulos/reportes/exportacion.test.ts`:
   - en el Excel de Despacho, los cuatro indicadores y el periodo;
   - en el PDF, la sede, el periodo y la tabla;
   - el nombre de archivo con un rango (`del-…-al-…`).
2. **H-76:** el PDF sale con las negritas de verdad. Registra un Figtree Bold estático, o quita `bold` si no hay archivo. No agregues dependencias: si hace falta un archivo de fuente nuevo, va en `public/` o en la carpeta de fuentes que ya use el proyecto, con su licencia (OFL).
3. **H-77:** si la exportación responde 400, 403 o 500, la pantalla muestra un mensaje de error, no solo una descarga fallida del navegador. Por ejemplo, descarga con `fetch` y un `Blob`, y usa los avisos de error del design system. Pon el texto que diga `specs/10` o el prototipo; si ninguno lo dice, aplica `plan/protocolo.md` §C.
4. **H-78 (RN-39):** `src/app/acceso/[sistema]/page.tsx` decide la redirección con una consulta de **solo lectura**. Cargar la página nunca escribe «Intento de acceso fallido» ni suma al bloqueo por IP. Con su prueba.
5. **H-79 (RF-SL-36):** pruebas de las ramas históricas de `detalleLegible()`:
   - `resumen` como arreglo;
   - «Eliminación de pedidos facturados» sin `resumen`;
   - bloqueos con `{}`.
6. **H-80 (RF-SL-07, D-06):** una prueba de navegador que exige la rejilla de Facturación del prototipo (`repeat(auto-fill, minmax(210px, 1fr))`) y la tarjeta sin asa ni «x».
7. **H-81 (RF-SL-61):** `comprobarEncabezadoModulo()` también en Facturación y en Reportes.
8. **D-10:** el PDF conserva el logotipo fijo del sistema; agrega una prueba que lo compruebe.
9. En el `## Resultado` de JC-07, JC-03 y JG-24, agrega `### Correcciones de la auditoría (2026-10-26)`. Su estado no cambia.

## Archivos que creas o modificas
- `src/modulos/reportes/exportacion.ts`, `exportacion.test.ts`; `src/app/api/reportes/exportar/route.ts` (si hace falta para H-77)
- `src/componentes/picking/reportes/Reportes.tsx`
- `src/app/acceso/[sistema]/page.tsx`, `src/app/acceso/servicio.ts` y sus pruebas (H-78)
- `src/modulos/bitacora/detalle.ts` (solo si una prueba lo exige) y su prueba
- `pruebas-e2e/picking/facturacion-carga.spec.ts`, `pruebas-e2e/picking/reportes.spec.ts`, `pruebas-e2e/picking/reportes-exportacion.spec.ts`, `pruebas-e2e/acceso/**`
- `plan/tareas/JC-07-*.md`, `plan/tareas/JC-03-*.md`, `plan/tareas/JG-24-*.md` (solo la sección de correcciones); `plan/bitacora/jose-daniel.md`

## Criterios de aceptación
1. **RF-SL-38 (H-75, H-76, D-10):** las pruebas comprueban el contenido de `specs/10` en Excel y PDF, el nombre con rango y el logotipo fijo; el título, los encabezados y el total del PDF salen en negrita.
2. **RF-SL-38 (H-77):** una descarga que falla muestra un mensaje en la pantalla.
3. **RN-39 (H-78):** cargar `/acceso/<sistema>` con la cookie de una cuenta desactivada o eliminada no escribe en la bitácora ni suma intentos fallidos.
4. **RF-SL-36 (H-79):** las ramas históricas de `detalleLegible()` tienen prueba.
5. **RF-SL-07 y RF-SL-61 (H-80, H-81):** la rejilla de Facturación y el encabezado de Facturación y Reportes tienen prueba.

## Pruebas obligatorias
- Una prueba por hallazgo (criterios 1 a 5), con el hallazgo o el requisito en el nombre
- La batería completa de navegador (protocolo B7)

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking pruebas-e2e/acceso
```

## Fuera de alcance
- El Detalle de la Bitácora en Noticias y Solicitudes (H-56 y H-57): lo corrige CE-13.
- Cambiar el logotipo del PDF por el configurado en el panel (D-10 lo descartó).

## Notas
- Rama `jose-daniel/JC-09-correcciones-auditoria`. Tarea creada en la convergencia 2 (JG-13), por decisión de Jordin del 26/10.
- CE-13 cambia cómo las pruebas de navegador guardan la evidencia (`EVIDENCIA=1`, `plan/convenciones.md` §6) y toca `pruebas-e2e/acceso/auditoria-jg24.spec.ts`. Si integra antes que tú, actualiza tu rama desde `develop` y conserva los dos cambios.
