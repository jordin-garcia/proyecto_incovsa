---
id: DM-11
titulo: Rendimiento de las galerías y revisión integral del sitio y del panel
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: pendiente
depende_de: [DM-05, DM-06, DM-07, DM-09, DM-10, CE-13]
programada: 2026-10-28
requisitos: [RF-SW-08, RF-SW-16, RF-SW-26, RF-SW-28, RNF-01, RNF-08, RNF-17]
pantallas: []
---

# DM-11 · Rendimiento de las galerías y revisión integral del sitio y del panel

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 28/10 · **Depende de:** DM-05, DM-06, DM-07, DM-09, DM-10, CE-13

## Objetivo
Comprobar con una prueba de rendimiento que las galerías no hacen más lenta la carga (RNF-17) y recorrer **todo** el sitio público y el panel lado a lado con el prototipo, corrigiendo cada diferencia.

## Contexto que debes leer
- `specs/05` completo; `specs/15`: RNF-01, RNF-08 y RNF-17
- `plan/convenciones.md` §7
- Prototipo: todas las pantallas del sitio (`#/`, `#/nosotros`, `#/industrias`, `#/productos`, `#/noticias`, `#/contacto`, `#/acceso`) y del panel (`#/panel/...` con `ejemplo.08`, `ejemplo.09` y `ejemplo.10`)

## Qué hacer
1. **RNF-17:** prueba de Playwright que mide la carga inicial de Inicio (bytes de imágenes descargados antes del evento `load` y tiempo hasta la primera imagen de la portada) con galerías de 1 y de 5 imágenes, y comprueba que con 5 no es mayor (specs/05: solo la primera imagen se descarga al abrir).
2. Recorrer con Playwright, en 390, 768 y 1440 px, cada página pública y cada sección del panel junto al prototipo, y corregir toda diferencia de textos, orden, datos, estados, colores o animaciones de tus pantallas. Lo que sea de otra persona va en una tarea nueva para ella (protocolo §C).
3. Comprobar la presentación dinámica en todas las páginas públicas (RF-SW-16) y la preferencia de reducir el movimiento.
4. axe sin violaciones serias ni críticas en todas tus pantallas; navegación completa con teclado.
5. Dejar en el `## Resultado` la tabla de pantallas revisadas con sus capturas.

## Archivos que creas o modificas
- `pruebas-e2e/sitio/rendimiento-galerias.spec.ts` (crear)
- Tus pantallas y componentes, para las correcciones

## Criterios de aceptación
1. **RNF-17** (CP-52): con galerías de 5 imágenes, la carga inicial no descarga más imágenes ni tarda más que con galerías de 1.
2. Todas las páginas del sitio y secciones del panel coinciden con el prototipo en los tres tamaños (capturas en el PR).
3. Ninguna pantalla tiene violaciones serias o críticas de axe.

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio pruebas-e2e/panel
```

## Notas
- **(26/10, convergencia 2)** Esta tarea espera a CE-13, en la que Carlos corrige los hallazgos del sitio y del panel de la auditoría del 26/10 (`plan/auditorias/2026-10-26.md`, paso 1), entre ellos la galería de imágenes compartida (H-58). Empieza tu revisión después de que CE-13 esté integrada y actualiza tu rama desde `develop`; las diferencias que ya corrigió CE-13 no se vuelven a corregir. Revisa además una diferencia que vio la convergencia y que no es un hallazgo: al abrir Catálogo › Editar producto, el nombre queda seleccionado, y en el prototipo solo queda con el foco (`plan/convergencia/2026-10-26.md`).
