---
id: DM-07
titulo: Noticias en el panel y en el sitio
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
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

## Desbloqueo · 23/10/2026

Jordin decidió **conservar `--g600`** en el texto del área de subida de `CampoGaleria`, en reposo y al pasar el cursor. Con el `--g500` del prototipo el contraste es 4.46:1 sobre `--g50` y 4.41:1 sobre `--v50`; con `--g600` es 7.02:1 y 6.94:1 (RNF-08). Es una excepción de contraste a la decisión 89, solo para el color del texto, registrada en `specs/18` y `specs/20`. La prueba de axe no cambia.

Para terminar: retoma `daniela/DM-07-noticias-panel` actualizada desde `develop`, conserva `--g600` en el área de subida y completa B6–B11. El estado al pasar el cursor y el relleno de `CampoGaleria` (componente compartido) los corrige Jordin en JG-24; no los cambies en esta rama.

## Resultado

Implementación y verificación local completadas el 24/10/2026, después de incorporar JG-24 desde `develop`.

- **Panel:** `/panel/noticias` permite crear, editar y eliminar con confirmación. Cada noticia tiene título, texto y entre una y cinco imágenes ordenadas; se publica al guardar, conserva su fecha al editar y no tiene estado de publicación ni opción de ocultar.
- **Sitio:** `/noticias` muestra cada noticia completa a todo el ancho, de la más reciente a la más antigua, con galería, fecha y pie. En teléfono y tableta la imagen queda encima del texto; se respetan saltos de línea y palabras largas.
- **Servidor:** las lecturas internas, acciones y endpoint exigen `sit.noticias`; las entradas se validan con Zod. Noticia, galería y bitácora se guardan en la misma transacción. Se comprueba que las referencias conservadas pertenecen a esa noticia, se validan los archivos por contenido mediante DM-04 y se eliminan las imágenes retiradas. El endpoint admite el origen público configurado en `BETTER_AUTH_URL`, también detrás del proxy, y rechaza orígenes interno y ajeno.
- **Interfaces reutilizables:** `leerNoticiasSitio()` devuelve únicamente ID, título, texto, fecha ISO e imágenes públicas; `leerNoticiasPanel(sesion)` agrega el permiso. `publicarNoticia(FormData)` recibe `datos` como JSON e `imagenes` como archivos; `datos.imagenes` conserva direcciones propias o índices de los archivos nuevos. El panel usa `publicarGaleria("noticias", datos, imagenes)` con `/panel/noticias/publicar`; `eliminarNoticia(id)` elimina y revalida el sitio. Las operaciones registran «Creación de noticia», «Edición de noticia» y «Eliminación de noticia».
- **Diseño:** se conserva `--g600` según la autorización de Jordin en `specs/18` y `specs/20`. Tras JG-24 se heredan las medidas y el estado al pasar el cursor del componente compartido. No se inventa contenido inicial (P-23). No se agregaron dependencias ni migraciones, y `.codex/config.toml` queda fuera de los commits.
- **Verificación:** `npm run verificar` aprobado, con 366 pruebas en 44 archivos; `npm run build` aprobado. Batería E2E completa de 306 casos: 300 aprobados directamente y 6 pendientes por dos fallos intermitentes de tiempo real aprobados al repetir; código 0 en la repetición, sin cambiar aserciones, axe ni límites. Las nueve E2E de Noticias pasaron en 390, 768 y 1440 px con axe y capturas, incluida la regresión de acceso denegado del PR #126. Plan válido (66 tareas), design system aprobado y revisión independiente LISTO sin hallazgos.
- **Archivos principales y evidencia:** servicios y pruebas en `src/modulos/contenido/*noticias*`, páginas de Noticias y `EditorNoticias.tsx`; [interfaces, verificaciones y 54 capturas comparativas](../../pruebas-e2e/sitio/evidencias/DM-07/README.md) y [revisión final](../../pruebas-e2e/sitio/evidencias/DM-07/revision.md).

### Correcciones de la auditoría (2026-10-26)

CE-13: H-56 guarda el título en `detalle.resumen` al crear, editar y eliminar; H-58 quita la copia de la galería en `noticias.module.css`; H-59 aísla el sexto elemento único. H-65 escribe las capturas de `pruebas-e2e/sitio/noticias.spec.ts` solo con `EVIDENCIA=1`. El estado de esta tarea no cambia.
