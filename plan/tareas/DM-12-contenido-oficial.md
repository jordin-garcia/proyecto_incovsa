---
id: DM-12
titulo: Carga del contenido oficial de INCOVSA en producción
persona: daniela
responsable: Daniela Marín
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-19, DM-11]
programada: 2026-11-02
requisitos: [RF-SW-07]
pantallas: []
---

# DM-12 · Carga del contenido oficial de INCOVSA en producción

**Responsable:** Daniela Marín · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** JG-19, DM-11

## Objetivo
Cargar en producción, **desde el panel**, el contenido oficial que entregue INCOVSA, para la demostración final del 04/11 (specs/16, decisión 79).

## Contexto que debes leer
- `specs/19`: P-17 (productos públicos), P-18 (logotipo, colores y tipografía), P-19 (historia y valores), P-21 (industrias), P-22 (horarios), P-23 (noticias)
- `specs/05` (dónde va cada contenido)

## Qué hacer
1. Pídele a Daniela el contenido oficial que haya entregado INCOVSA (textos e imágenes). **No se inventa ni se completa nada**: lo que falte se queda vacío y se anota.
2. Cargarlo en producción con el panel (a mano o automatizando el panel con Playwright, con una cuenta del sitio con los permisos de contenido): portada, logotipo, historia, misión y visión, valores, industrias, productos públicos, información de contacto (con horarios) y noticias.
3. Si INCOVSA entregó los códigos exactos de los colores o la tipografía (P-18), **no** cambies el design system: avísale a Jordin, que decide.
4. Registrar en `specs/19` qué pendientes quedaron resueltos (avísale a Jordin: el archivo es protegido) y en el `## Resultado` qué se cargó y qué falta.

## Archivos que creas o modificas
- Ninguno de código. El archivo de la tarea y la bitácora.

## Criterios de aceptación
1. Todo el contenido oficial recibido está publicado en https://incovsa.com y se ve como en el prototipo.
2. El `## Resultado` lista lo cargado y lo que INCOVSA todavía no entregó.

## Fuera de alcance
- Cambiar textos fijos de la aplicación o el design system.
