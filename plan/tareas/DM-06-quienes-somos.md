---
id: DM-06
titulo: "Sitio público: Quiénes somos"
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: pendiente
depende_de: [DM-04]
programada: 2026-10-19
requisitos: [RF-SW-02, RF-SW-15, RF-SW-16, RF-SW-29, CU-08]
pantallas: [sitio.js › nosotros, misionVision; base.js › logoInquiserca]
---

# DM-06 · Sitio público: Quiénes somos

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** lun 19/10 · **Depende de:** DM-04

## Objetivo
La página **Quiénes somos**, con el banner que alterna los logotipos de INCOVSA e Inquiserca, la historia, misión y visión, los 5 valores, "A quién servimos" y el bloque "INCOVSA e Inquiserca".

## Contexto que debes leer
- `specs/05-sitio-web.md` §"Misión y visión" y §"Quiénes somos" **completos**
- `specs/04`: RF-SW-02, RF-SW-29; `specs/20`: CAM-41, CAM-42, CAM-79, CAM-80
- Prototipo: `#/nosotros`; `sitio.js` › `nosotros()` y `misionVision()`; `base.js` › `logoInquiserca()`
- `## Resultado` de DM-02 y DM-04

## Qué hacer
1. `/nosotros`, igual a `nosotros()`, en el orden del prototipo:
   - **banner** con los logotipos de INCOVSA e Inquiserca **alternándose** en el mismo lugar; sin logotipo de Inquiserca, solo el de INCOVSA;
   - **historia**: el texto del panel y su galería opcional. Mientras el texto esté vacío (P-19), la sección muestra solo lo que tenga; la nota amarilla del prototipo no se muestra (`specs/20`);
   - **misión y visión**, con el componente de DM-02;
   - **valores**: solo 5 imágenes, una por valor, en una fila, sin texto; mientras falte la imagen de un valor, su lugar muestra la tarjeta de pendiente del prototipo (specs/05); en teléfono, la fila se acomoda al ancho;
   - **"A quién servimos"** (mercado industrial y artesanal), como el prototipo;
   - bloque **"INCOVSA e Inquiserca"** con los dos logotipos alternándose, como el banner;
   - fondos: "Misión y visión" y "A quién servimos" con el verde del pie (`--v950`); historia, valores e "INCOVSA e Inquiserca" con fondo claro (CAM-79);
   - con pie de página y presentación dinámica.

## Archivos que creas o modificas
- `src/app/(sitio)/nosotros/**`, `src/componentes/sitio/**` (crear y modificar)
- `pruebas-e2e/sitio/nosotros.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-02:** el banner y el bloque "INCOVSA e Inquiserca" alternan los dos logotipos; al quitar el de Inquiserca en el panel, solo queda el de INCOVSA.
2. **RF-SW-29:** los valores son 5 imágenes en una fila, sin texto; los que faltan muestran la tarjeta de pendiente.
3. Los fondos alternan claro y verde como en `specs/05`.
4. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- `pruebas-e2e/sitio/nosotros.spec.ts` (criterios 1 a 4)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/nosotros.spec.ts
```
