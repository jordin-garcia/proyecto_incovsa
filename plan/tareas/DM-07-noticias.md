---
id: DM-07
titulo: Noticias en el panel y en el sitio
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: bloqueada
bloqueo: "Jordin debe resolver el contraste del área de subida del prototipo: su gris produce una violación seria de axe; reproducirlo contradice RNF-08 (decisión 89 y protocolo §C)."
depende_de: [DM-04]
programada: 2026-10-22
requisitos: [RF-SW-15, RF-SW-18, CU-07, CU-08]
pantallas: [panel.js › noticias; sitio.js › noticias]
---

# DM-07 · Noticias en el panel y en el sitio

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** jue 22/10 · **Depende de:** DM-04

## Objetivo
Crear, editar y **eliminar** noticias desde el panel, y la página pública de Noticias con cada noticia completa a todo el ancho.

## Contexto que debes leer
- `specs/05` §"Noticias" y la fila Noticias de §"Panel administrativo" **completos**
- `specs/04`: RF-SW-18; `specs/14` (NOTICIA sin atributo "publicada"); `specs/20`: CAM-81 y CAM-84
- `specs/03` (permiso `sit.noticias`)
- Prototipo: `#/panel/noticias?cuenta=ejemplo.08` y `#/noticias`; `panel.js` › `noticias()`; `sitio.js` › `noticias()`
- `## Resultado` de DM-02 y DM-04

## Qué hacer
1. **Panel** (`/panel/noticias`, `sit.noticias`): lista con imagen, título, fecha y los botones editar (lápiz) y eliminar (basurero, con confirmación), como el Catálogo; sin columna de estado ni "Ocultar" (CAM-84). Crear y editar: título, texto y galería (al menos una imagen, hasta 5). Al guardar, se publica; la fecha de publicación es la de creación y se conserva al editar. Eliminar borra la noticia y sus imágenes. La bitácora registra "Creación de noticia", "Edición de noticia" y "Eliminación de noticia" (los nombres del prototipo).
2. **Página pública** (`/noticias`): cada noticia a **todo el ancho**, con su galería a la izquierda y la fecha, el título y el **texto completo** a la derecha (en teléfono, uno debajo del otro); el texto respeta sus saltos de línea y las palabras muy largas se parten; de la más reciente a la más antigua; con pie de página.
3. Acciones con `exigirPermiso` y Zod.

## Archivos que creas o modificas
- `src/app/panel/noticias/**`, `src/app/(sitio)/noticias/**`, `src/componentes/panel/**`, `src/componentes/sitio/**` (crear y modificar)
- `src/modulos/contenido/**` (modificar)
- `pruebas-e2e/sitio/noticias.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-18** (CP-62): una noticia creada aparece en el sitio; al eliminarla (con confirmación) deja de mostrarse y queda en la bitácora; no existe la opción de ocultar.
2. Una noticia sin imagen no se puede guardar; con 6 imágenes, el servidor rechaza la sexta.
3. El texto se muestra completo, con sus saltos de línea, y una palabra de 80 caracteres no se sale del cuadro.
4. Sin `sit.noticias`, las acciones se rechazan en el servidor.
5. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración de las acciones con permisos (criterios 1, 2 y 4)
- `pruebas-e2e/sitio/noticias.spec.ts` (criterios 1, 3 y 5)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/noticias.spec.ts
```

## Bloqueo · 23/10/2026

Daniela confirmó que queda pendiente consultar a Jordin. El área de subida del prototipo usa `--g500` (`#727372`, 13,5 px), que axe identifica con contraste 4,4:1 y severidad seria; exige 4,5:1. La implementación conserva `--g600`, que pasa axe. La decisión 89 y el protocolo §C obligan a consultar cuando seguir el diseño del prototipo haría fallar una prueba. No se autoriza una excepción ni se debilita axe en este PR.

La implementación permanece sin integrar en `daniela/DM-07-noticias-panel`, commit `c944942`: panel, publicación, edición, eliminación, galerías y bitácora; página pública completa; permiso explícito del endpoint según JG-11. Las correcciones de avisos, geometría de galería y columna de imagen pasaron las dos E2E de escritorio; las seis pruebas de integración de Noticias también pasaron. La batería general se interrumpió por petición de Daniela el 22/10 y todavía no tiene un resultado final; la tarea no está hecha.

[Evidencia del contraste](https://github.com/jordin-garcia/proyecto_incovsa/blob/c944942/pruebas-e2e/sitio/evidencias/DM-07/contraste-prototipo.json) y [avance, capturas y verificaciones](https://github.com/jordin-garcia/proyecto_incovsa/blob/c944942/pruebas-e2e/sitio/evidencias/DM-07/README.md).

Para desbloquear: Jordin debe decidir cómo resolver el conflicto de diseño y accesibilidad. Después se retoma la rama de implementación, se incorpora esa decisión y se completan B6–B11, incluida la batería E2E completa, la revisión actualizada y los 14 controles obligatorios. Este registro de bloqueo solo modifica la tarea y la bitácora.
