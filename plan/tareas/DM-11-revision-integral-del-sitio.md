---
id: DM-11
titulo: Rendimiento de las galerías y revisión integral del sitio y del panel
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
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
1. **RNF-17** (CP-52): con galerías de 5 imágenes, la carga inicial no descarga más imágenes ni tarda más que con galerías de 1. La comparación temporal admite los **10 ms** de ruido de medición autorizados por Daniela y documentados en `specs/05` y `specs/15`; bytes y solicitudes secundarias antes de `load` se comprueban estrictamente.
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

## Resultado

Revisión de todas las páginas públicas, detalle de producto y panel en teléfono, tableta y escritorio, con axe, teclado, movimiento reducido y detección de errores del navegador. `revision-integral.spec.ts` cubre los recorridos y la geometría; `rendimiento-galerias.spec.ts` compara doce pares de muestras alternadas de producción sin caché, después del calentamiento.

Se corrigieron las tres columnas de Misión, Visión e Historia en tableta (se apilan hasta 720 px, como el prototipo) y el foco de Catálogo › Editar producto: el nombre queda enfocado sin selección y Escape devuelve el foco al botón Editar. Las pruebas de Documentos esperan el final real de la animación antes de medir axe; no se cambian colores ni reglas de contraste.

Daniela autorizó 10 ms de ruido entre medianas temporales de una y cinco imágenes, registrado en specs/05, specs/15 y specs/18. Los bytes iniciales son exactamente iguales (161 702 en los tres tamaños) y ninguna imagen secundaria se solicita antes de load. Las mediciones del 28/10 y sus capturas están en `pruebas-e2e/sitio/evidencias/DM-11/README.md`.

Uso: ejecutar `npm run build` y luego `npm run e2e -- pruebas-e2e/sitio pruebas-e2e/panel`. Para regenerar evidencia propia, usar `EVIDENCIA=1` al ejecutar las dos pruebas nuevas; para las referencias, servir el prototipo en 4173 y ejecutar `EVIDENCIA=1 node pruebas-e2e/sitio/capturar-prototipo.mjs`. Sin esa variable no escriben en el repositorio. No se requieren dependencias, migraciones ni cambios de configuración.

Verificación final del 29/10 sobre CE-13 (#143) y JG-25 (#146): plan válido (69 tareas); formato, lint, tipos y 450 pruebas en 54 archivos aprobados; compilación aprobada; design system y D-08: seis comprobaciones aprobadas. Los 186 E2E del sitio y panel pasan, incluidos los 42 de DM-11. Cobertura general de los 476 casos: 408 aprobados en la ejecución completa, 65 en la repetición de producción y los tres de Bodega de teléfono aprobados en una repetición adicional. Las claves de ejemplo rechazadas por JG-25 se sustituyeron solo en el entorno temporal del proceso por claves aleatorias, sin editar archivos de secretos. El timeout de Bodega por un elemento retirado del DOM no se reprodujo; se conservaron todas sus aserciones. Registros completos en la carpeta de evidencia. Revisión independiente final: LISTO, sin hallazgos de corrección ni opcionales; registro en la evidencia.

### Pantallas y capturas

La tabla compara aplicación y prototipo. Las diferencias de datos de demostración y las notas P-xx omitidas siguen specs/20; Usuarios se recorre con Gerencia sin modificar su código.
| Pantalla | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| inicio | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-inicio-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-inicio-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-inicio-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-inicio-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-inicio-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-inicio-1440.png) |
| nosotros | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-nosotros-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-nosotros-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-nosotros-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-nosotros-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-nosotros-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-nosotros-1440.png) |
| industrias | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-industrias-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-industrias-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-industrias-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-industrias-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-industrias-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-industrias-1440.png) |
| productos | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-productos-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-productos-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-productos-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-productos-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-productos-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-productos-1440.png) |
| detalle | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-detalle-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-detalle-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-detalle-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-detalle-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-detalle-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-detalle-1440.png) |
| noticias | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-noticias-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-noticias-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-noticias-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-noticias-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-noticias-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-noticias-1440.png) |
| contacto | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-contacto-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-contacto-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-contacto-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-contacto-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-contacto-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-contacto-1440.png) |
| acceso | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-acceso-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-acceso-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-acceso-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-acceso-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-acceso-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-acceso-1440.png) |
| ejemplo.08-resumen | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-resumen-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-resumen-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-resumen-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-resumen-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-resumen-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-resumen-1440.png) |
| ejemplo.08-contenido | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contenido-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contenido-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contenido-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contenido-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contenido-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contenido-1440.png) |
| ejemplo.08-industrias | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-industrias-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-industrias-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-industrias-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-industrias-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-industrias-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-industrias-1440.png) |
| ejemplo.08-catalogo | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-catalogo-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-catalogo-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-catalogo-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-catalogo-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-catalogo-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-catalogo-1440.png) |
| ejemplo.08-noticias | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-noticias-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-noticias-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-noticias-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-noticias-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-noticias-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-noticias-1440.png) |
| ejemplo.08-contacto | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contacto-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contacto-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contacto-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contacto-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-contacto-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-contacto-1440.png) |
| ejemplo.08-solicitudes | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-solicitudes-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-solicitudes-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-solicitudes-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-solicitudes-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-solicitudes-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-solicitudes-1440.png) |
| ejemplo.08-documentos | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-documentos-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-documentos-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-documentos-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-documentos-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.08-documentos-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.08-documentos-1440.png) |
| ejemplo.09-documentos | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.09-documentos-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.09-documentos-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.09-documentos-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.09-documentos-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.09-documentos-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.09-documentos-1440.png) |
| ejemplo.10-documentos | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.10-documentos-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.10-documentos-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.10-documentos-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.10-documentos-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-ejemplo.10-documentos-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-ejemplo.10-documentos-1440.png) |
| usuarios | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-usuarios-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-usuarios-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-usuarios-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-usuarios-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-usuarios-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-usuarios-1440.png) |
| Catálogo › Editar producto | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-catalogo-editor-390.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-catalogo-editor-390.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-catalogo-editor-768.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-catalogo-editor-768.png) | [Aplicación](../../pruebas-e2e/sitio/evidencias/DM-11/aplicacion-catalogo-editor-1440.png) · [Prototipo](../../pruebas-e2e/sitio/evidencias/DM-11/prototipo-catalogo-editor-1440.png) |
