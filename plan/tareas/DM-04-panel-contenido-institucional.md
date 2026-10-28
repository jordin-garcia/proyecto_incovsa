---
id: DM-04
titulo: "Panel: almacenamiento de imágenes, resumen y contenido institucional"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: hecha
depende_de: [DM-01, JG-07]
programada: 2026-10-18
requisitos: [RF-SW-07, RF-SW-23, RF-SW-28, RF-SW-29, RN-56, RNF-05, CU-07]
pantallas: [panel.js › Panel.resumen, contenido; base.js › leerImagen, campoGaleria, montarGalerias, galeriaInterior]
---

# DM-04 · Panel: almacenamiento de imágenes, resumen y contenido institucional

**Responsable:** Daniela Marín · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** DM-01, JG-07

## Objetivo
El almacenamiento seguro de imágenes del sitio, el campo de galería del panel, la página de **resumen** del panel y la sección **Contenido institucional** (portada, logotipos, misión, visión, historia y valores).

## Contexto que debes leer
- `specs/05-sitio-web.md` §"Panel administrativo" (tabla de secciones, carga de imágenes) e §"Imágenes del sitio" **completos**
- `specs/04`: RF-SW-07, RF-SW-23, RF-SW-28, RF-SW-29; `specs/12`: RN-56
- `specs/16`: "Entradas y archivos" (imágenes) y decisiones 20, 32, 44 y 78; `plan/convenciones.md` §4.3
- `specs/03` (permiso `sit.contenido`)
- Prototipo: `#/panel?cuenta=ejemplo.08` y `#/panel/contenido?cuenta=ejemplo.08`; `panel.js` › `Panel.resumen()` y `contenido()` (bloques, "Guardar y publicar", galerías pendientes, quitar el logotipo de Inquiserca); `base.js` › `campoGaleria()`, `montarGalerias()` y `galeriaInterior()`
- `## Resultado` de JG-05, JG-06 y JG-07
- Context7: `sharp` (recodificar a WebP, redimensionar, quitar metadatos), `file-type`, `@aws-sdk/client-s3` con R2

## Qué hacer
1. **`src/modulos/almacenamiento/`** (decisiones 44 y 78, `plan/convenciones.md` §4.3):
   - `guardarImagen(bytes)`: acepta solo **JPG, PNG o WebP** comprobados por su contenido con `file-type` (no SVG ni GIF), de hasta **5 MB**; la vuelve a codificar con `sharp` a **WebP**, con un máximo de **2000 px de ancho**, sin metadatos (EXIF ni GPS) y conservando la transparencia; el nombre lo genera el servidor; la guarda en disco o en R2 según `ALMACENAMIENTO` y devuelve su dirección;
   - `borrarImagen(direccion)`;
   - `src/app/api/imagenes/[...clave]/route.ts`: sirve las imágenes del disco **solo fuera de producción**.
2. **Campo de galería del panel** (`src/componentes/panel/CampoGaleria.tsx`, igual a `campoGaleria()`): agregar imágenes eligiéndolas o arrastrándolas, quitar y reordenar, **hasta 5** (el servidor rechaza la sexta).
3. **Resumen del panel** (`/panel`, `Panel.resumen()`): las tarjetas de cada sección que permiten los permisos del usuario, con su estado, como el prototipo.
4. **Contenido institucional** (`/panel/contenido`, permiso `sit.contenido`), igual a `contenido()`:
   - **portada** (galería de hasta 5), **logotipo de INCOVSA** (reemplazar; sin subir, el recibido de `public/marca/`), **misión** y **visión** (texto y galería de hasta 5), **historia** (texto y galería opcional de hasta 5), **valores** (5 imágenes, una por valor, sin texto) y **logotipo de Inquiserca** (viene cargado, se puede reemplazar o quitar);
   - sin la sección "Imágenes del sitio" (CAM-49);
   - "Guardar y publicar" por bloque, como el prototipo; cada cambio guardado se registra en la bitácora ("Cambio de contenido del sitio", con el bloque) y se ve de inmediato en el sitio público.
5. Acciones en `src/modulos/contenido/` con `exigirPermiso(sesion, "sit.contenido")` y Zod; las imágenes que se reemplazan o se quitan se borran del almacenamiento.

## Archivos que creas o modificas
- `src/modulos/almacenamiento/**`, `src/app/api/imagenes/**` (crear)
- `src/modulos/contenido/**` (modificar)
- `src/app/panel/page.tsx` (reemplaza la redirección de JG-07 por el resumen), `src/app/panel/contenido/**`, `src/componentes/panel/**` (crear)
- `pruebas-e2e/panel/contenido.spec.ts` (crear)

## Criterios de aceptación
1. **RNF-05 / decisión 44:** se rechazan un SVG, un GIF, un archivo de texto renombrado a `.jpg` y una imagen de más de 5 MB; una foto JPG con datos GPS se guarda como WebP de 2000 px de ancho como máximo y **sin** metadatos.
2. **RN-56** (CP-52): una galería acepta hasta 5 imágenes y el servidor rechaza la sexta.
3. **RF-SW-23 / CU-07** (CP-51): con `ejemplo.08`, cambiar el texto de la misión y subir una imagen se ve en Inicio con el texto a la izquierda y la imagen a la derecha.
4. **RF-SW-29** (CP-53): las 5 imágenes de valores se suben y quedan en su posición.
5. Quitar el logotipo de Inquiserca lo quita del sitio; reemplazar el de INCOVSA cambia la cabecera y el pie.
6. **RF-SW-25:** sin `sit.contenido`, las acciones se rechazan en el servidor y la sección no aparece.
7. La bitácora registra cada cambio publicado.
8. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración de `guardarImagen` (criterio 1) y de las acciones de contenido con permisos (criterios 2, 4, 6 y 7)
- `pruebas-e2e/panel/contenido.spec.ts` (criterios 3, 5 y 8)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/panel/contenido.spec.ts
```

## Fuera de alcance
- Industrias y catálogo en el panel (DM-05); la configuración de R2 en producción (CE-05 y P-94).

## Avance histórico (19/10/2026; antes de la integración)

Implementados almacenamiento de imágenes, campo de galería, resumen en `/panel/resumen` y contenido institucional. Se conserva `/panel` como entrada que redirige, conforme a `specs/05` y JG-07. Publicación con Zod, permiso en servidor, transacción y bitácora; eliminación de imágenes sustituidas y revalidación del sitio.

En ese momento, la usuaria autorizó avanzar DM-04 y esperar a DM-02 para integrar. Inicio, cabecera y pie aún no existían y faltaban las verificaciones públicas de los criterios 3 y 5. Este registro es histórico; el cierre posterior está en «Resultado».

Evidencia, interfaces, pruebas, revisión y capturas: [avance de DM-04](../../pruebas-e2e/panel/evidencias/README.md). Verificación local: 219 pruebas y compilación correctas; las 12 pruebas propias de Playwright pasan. La suite general detectó además un contraste insuficiente en Bodega, ajeno a estos cambios, que debe atender su responsable.

## Resultado

Se completó el 20/10/2026 después de incorporar `develop` con DM-02 y la corrección de Bodega del coordinador. Se conservaron las lecturas públicas y ambas entradas de bitácora al resolver los conflictos de integración.

- **Almacenamiento:** `src/modulos/almacenamiento/servicio.ts` ofrece `guardarImagen(bytes)` y `borrarImagen(direccion)`. Valida JPG, PNG y WebP por contenido con `file-type`, limita a 5 MB, recodifica con `sharp` a WebP de hasta 2000 px, elimina metadatos y conserva transparencia. Genera claves en el servidor. Usa disco en desarrollo o R2 según la configuración existente; no borra los originales de `/marca/`. La ruta GET `/api/imagenes/[...clave]` devuelve 404 en producción.
- **Panel:** `/panel` conserva la entrada de JG-07; `/panel/resumen` muestra tarjetas y estados según los permisos. `/panel/contenido` administra portada, logotipos, misión, visión, historia y las cinco posiciones de valores. `CampoGaleria` acepta imágenes elegidas o arrastradas, permite quitar y mover antes, y conserva los borradores hasta publicar. Los logotipos y valores se publican al elegirlos, como el prototipo.
- **Publicación segura:** `publicarContenido(FormData)` exige sesión del sitio y `sit.contenido`, valida con Zod y llama a `guardarPublicacion`. Contenido y bitácora «Cambio de contenido del sitio» se guardan en la misma transacción. Solo se conservan referencias de imágenes que pertenecen al bloque; las sustituidas o retiradas se borran. El formulario usa `/api/imagenes/publicar`, con control de origen, sesión, permiso y tamaño, para admitir imágenes de 5 MB sin modificar el límite de las acciones de Odoo. Revalida el layout raíz para actualizar el sitio.
- **Integración pública:** se conservan `leerEstructuraSitio()` y `leerInicioSitio()` de DM-02. El contrato público añade `logotipoInquiserca: string | null`; quitarlo devuelve `null` y recuperarlo devuelve el original. Las pruebas verifican misión e imagen en Inicio sin sesión y sustitución del logotipo en cabecera y pie.
- **Alcance autorizado:** la usuaria autorizó cerrar DM-04 comprobando Inquiserca en la base y en el contrato público. Su comprobación visual en Quiénes somos queda expresamente para DM-06, cuya pantalla aún no existe. No se implementó DM-06 ni se cambiaron requisitos de producto.
- **Cómo reutilizarlo:** DM-05 y DM-07 pueden usar `guardarImagen` y `borrarImagen` después de autorizar su permiso; `CampoGaleria` trabaja con `string | File` y no publica por sí solo. Sus operaciones deben validar propietario y límite de cinco imágenes. DM-06 debe consumir `logotipoInquiserca` y comprobar que `null` elimina el logotipo y su alternancia.
- **Verificación:** `npm run verificar` pasó formato, lint, tipos y **279 pruebas en 30 archivos**. `npm run build` pasó. Las **21 pruebas propias de Playwright** pasaron en 390, 768 y 1440 px, con axe, carga real de 5 MB, persistencia, limpieza física y publicación pública. La suite completa terminó con código 0: **180 aprobadas directamente, 1 intermitente aprobada al reintentar y 2 omisiones preexistentes de Facturación** y sin fallos definitivos. Plan válido: 63 tareas; sin archivos protegidos no permitidos para InAlexa. Revisión independiente: **LISTO**, sin hallazgos pendientes.
- **Evidencia:** [verificación, capturas e interfaces](../../pruebas-e2e/panel/evidencias/README.md) y [revisión en contexto limpio](../../pruebas-e2e/panel/evidencias/revision.md). No se agregaron dependencias, migraciones ni credenciales de servicios externos. La configuración de producción de R2 sigue siendo CE-05/P-94.
- **Correcciones del PR:** las etiquetas reflejan el contenido publicado hasta guardar, aunque se elijan imágenes nuevas; el resumen reproduce los recuadros de sus iconos. Las pruebas aíslan y restauran el contenido institucional para tomar capturas con los textos aprobados sin alterar los datos anteriores del equipo. El selector muestra los logotipos completos dentro del campo, separados del aviso inferior de 13 px y radio de 10 px. Se añadieron comprobaciones de límites, no solapamiento y regresión y se repitió la revisión independiente.

### Correcciones de la auditoría (2026-10-22)

H-03 a H-06: el avance previo se identifica como histórico; publicar o quitar una imagen de valor registra y anuncia «Imagen del valor N». La ruta multipart usa el origen público configurado y el menú oculta la sección sin permiso. CampoGaleria recupera el relleno, tamaño de letra y hover del prototipo, conservando el color accesible aprobado.

### Correcciones de la auditoría (2026-10-26)

CE-13 (H-58) dejó la galería compartida con la rejilla, la miniatura 4:3, el radio y las acciones del prototipo, sin cambiar el contraste `--g600` del área de subida. H-65 escribe las capturas de `pruebas-e2e/panel/contenido.spec.ts` solo con `EVIDENCIA=1`. El estado de esta tarea no cambia.
