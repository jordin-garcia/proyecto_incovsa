---
id: JC-07
titulo: Exportación de los reportes a Excel y PDF
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: hecha
depende_de: [JC-06]
programada: 2026-10-25
requisitos: [RF-SL-38, CU-14]
pantallas: [picking.js › reportes (botones data-exp)]
---

# JC-07 · Exportación de los reportes a Excel y PDF

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** dom 25/10 · **Depende de:** JC-06

## Objetivo
Los botones **Excel** y **PDF** de las tres pestañas de Reportes, generados en el servidor con SheetJS y pdfmake (specs/16, decisión 43; CAM-96).

## Contexto que debes leer
- `specs/10-picking-reportes.md` §"Exportación" **completo** (contenido, formato y nombre de cada archivo)
- `specs/16`: decisiones 43, 59 (pdfmake ≥ 0.3.6, sin recursos remotos) y 85 (SheetJS desde `vendor/`)
- `## Resultado` de JC-06
- Context7: SheetJS 0.20.3 (`utils.aoa_to_sheet`, `write` a *buffer*), pdfmake 0.3 en Node (fuentes propias, tablas, imágenes como datos)

## Qué hacer
1. `src/app/api/reportes/exportar/route.ts`: recibe la pestaña, el formato y el periodo; verifica la sesión, `pk.reportes` y la sede (`exigirPermiso`); valida con Zod; genera el archivo con las mismas consultas de JC-06 y lo entrega con el nombre de `specs/10` (por ejemplo `despacho-quetzaltenango-16-10-2026.xlsx`).
2. **Excel:** una sola hoja, sin formato, con el encabezado (sede y periodo) y la tabla de la pestaña; en Despacho, los indicadores y el total.
3. **PDF:** con el logotipo del sitio, el título de la pestaña, la sede (salvo en la Bitácora), el periodo y la tabla; fuentes Figtree y JetBrains Mono incluidas en el servidor; **sin** cargar imágenes ni fuentes desde direcciones remotas (decisión 59).
4. Los botones del prototipo descargan el archivo de la pestaña y el periodo que se ven.

## Archivos que creas o modificas
- `src/app/api/reportes/**` (crear), `src/modulos/reportes/**` (modificar), `src/componentes/picking/reportes/**` (modificar)
- `pruebas-e2e/picking/reportes-exportacion.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-38 / CAM-96:** cada una de las tres pestañas descarga su Excel y su PDF con el contenido y el nombre de `specs/10`.
2. Los valores del Excel coinciden exactamente con la tabla en pantalla para el mismo periodo.
3. Sin sesión, sin `pk.reportes` o con otra sede, la ruta responde con error y no entrega datos.
4. El PDF no hace ninguna petición a direcciones externas al generarse.

## Pruebas obligatorias
- Integración de la ruta: contenido del Excel (leído con SheetJS) y del PDF (que existe y tiene el título), permisos (criterios 1 a 4)
- `pruebas-e2e/picking/reportes-exportacion.spec.ts` (descarga de los seis archivos)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/reportes-exportacion.spec.ts
```

## Fuera de alcance
- Formato de colores en el Excel (la versión gratuita de SheetJS no lo permite, decisión 43).

## Resultado

- Hecho: habilité Excel y PDF en las tres pestañas de Reportes. La ruta del servidor valida sesión, `pk.reportes`, sede y parámetros; genera hojas XLSX y documentos PDF con las fuentes locales y el logotipo, sin peticiones externas. Los seis archivos usan el periodo visible y los nombres definidos en `specs/10`.
- Decisiones tomadas: ninguna conducta nueva fuera de `specs/`. Apliqué las decisiones 43, 59 y 85 de `specs/16`; no añadí dependencias ni modifiqué el esquema o las migraciones.
- Archivos principales: `src/app/api/reportes/exportar/route.ts`, `src/modulos/reportes/exportacion.ts`, `src/componentes/picking/reportes/Reportes.tsx` y `pruebas-e2e/picking/reportes-exportacion.spec.ts`. Las fuentes incluidas están en `src/modulos/reportes/fuentes/`.
- Uso: en Picking → Reportes, selecciona una pestaña y periodo y pulsa Excel o PDF para descargar ese informe.
- Verificación: `npm run verificar` (342 pruebas en 39 archivos), `node --test scripts/design-system.test.mjs`, `npm run build` y `npm run e2e -- pruebas-e2e/picking/reportes-exportacion.spec.ts` (3/3, teléfono, tableta y escritorio) pasan. Las capturas comparativas de las tres pestañas y tamaños están en `pruebas-e2e/picking/evidencias/jc-07/`. La suite E2E completa sobre la base local limpia quedó en 244 aprobadas, 12 fallidas y 2 no ejecutadas; una repetición de 33 casos ajenos a JC-07 dio 27 aprobados y 6 fallidos. Esos fallos son de otras áreas y se detallan en la bitácora. El bot pidió corregir el total cuando el resto era cero; ya se corrigió y cubrió con una prueba. La revisión independiente en contexto limpio quedó LISTO, sin hallazgos de corrección.
