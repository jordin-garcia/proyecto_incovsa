# Entregable No. 1: contenido de esta carpeta

**Fecha de entrega:** lunes 21 de septiembre de 2026
**Valor:** 10 puntos

La especificación vigente del proyecto está en [`../specs/`](../specs/README.md). Si algo de esta carpeta la contradice, vale lo que dice `specs/`.

---

## Versiones del Documento 1

| Archivo | Qué es |
|---|---|
| `Documento 1 - Memoria general y especificacion del sistema v0.1.docx` y `.pdf` | La versión **entregada** el 21/09/2026 (79 páginas). Se conserva sin cambios como registro de lo que se entregó |
| `Documento 1 - Memoria general y especificacion del sistema v0.2.docx` y `.pdf` | La versión **vigente** (24/09/2026, 86 páginas). Incorpora las decisiones del 23 y 24/09/2026. **Todavía no** incorpora los cambios de las reuniones 4 y 5 (29/09 y 13/10/2026) ni los ajustes posteriores (P-77 en `specs/19-pendientes.md`). Mientras tanto, lo vigente es `specs/` |

### Qué cambió de la v0.1 a la v0.2

- **Módulos:** se agregó el módulo de Inventario (compras, ajustes, traslados entre sedes y devoluciones). El sistema de picking pasa a tener seis módulos.
- **Cantidades:** todas son en kilogramos y se permiten ventas fraccionadas, que se muestran como "N unidades + R kg".
- **Devoluciones:** se registran en Inventario, ligadas al pedido. La edición de ruta y el estado "Editado" se eliminaron.
- **Roles y accesos:**
  - Vista general solo visualiza los documentos.
  - Solo Gerencia administra los usuarios del sitio.
  - Soporte IT opera todos los módulos del picking.
  - La recuperación de contraseña depende del sistema.
- **Requerimientos:**
  - Se actualizaron los requerimientos funcionales y no funcionales, las reglas de negocio y la matriz de trazabilidad.
  - Los códigos eliminados se conservan, marcados como eliminados.
  - Se agregaron los casos de uso CU-16 a CU-20.
- **Figuras:**
  - Se actualizaron las figuras 1 a 8.
  - Se regeneraron los prototipos y se agregó la figura 34, del módulo de Inventario. Reportes y Configuración pasan a ser las figuras 35 y 36.
- **Correcciones:**
  - La portada decía "Industria de Cuero"; ahora dice "Industria del Cuero".
  - Los pasos de cada caso de uso ahora se numeran desde 1. En la v0.1 la numeración continuaba de un caso de uso al siguiente.

### Antes de imprimir o exportar

Los índices general y de figuras ya están actualizados. Si alguien edita el texto:

- el **índice general** se actualiza en la pestaña **Referencias**, botón **Actualizar tabla**, opción **Actualizar toda la tabla**;
- el **índice de figuras** y el **índice de tablas** son tablas escritas a mano, así que hay que ajustarlas también a mano si cambia una figura o una tabla.

---

## Material de apoyo

| Carpeta o archivo | Qué es |
|---|---|
| `figuras/` | Las ocho figuras de los capítulos, en PNG a alta resolución |
| `figuras/prototipos/` | Las capturas de los prototipos. El número del nombre de archivo sigue el orden del lienzo; en el Documento 1 son las figuras 20 a 36 |
| `figuras/evidencias/` | Las once imágenes de las reuniones y de la visita (figuras 9 a 19) |
| `diagramas/` | El código fuente de cada figura. Las figuras 1 a 5 se dibujan con guiones de Python; las figuras 6 a 8 son archivos Mermaid (`.mmd`) |
| `prototipos/simulacion/` | El código fuente del **prototipo de simulación aprobado** (ver abajo) |
| `prototipos/herramientas/` | Las herramientas que generaron las capturas y el prototipo navegable del Documento 1. Ya no funcionan: los `.dc.html` y `canvas.json` que leían se borraron el 14/10/2026 |
| `prototipos/pickit-visual/` | Propuesta original del tablero de carga (modos iPad admin y TV) y siluetas de los camiones. Es una referencia histórica: el diseño vigente del tablero es el del prototipo de simulación (`specs/07`, `specs/20`) |

### Para volver a generar las figuras 1 a 5

Con Python y la biblioteca Pillow instalada, desde la carpeta `diagramas/`:

```
python figura-1-casos-de-uso-sitio.py ../figuras/figura-1-casos-de-uso-sitio.png
```

Lo mismo para las figuras 2 a 5, cambiando el nombre del archivo. El módulo `uml.py` contiene las funciones de dibujo que comparten los cinco guiones.

### Para volver a generar las figuras 6 a 8

Con el paquete `@mermaid-js/mermaid-cli` y el tema `neutral`, desde la carpeta `diagramas/`:

```
mmdc -i figura-6-modelo-er-catalogos.mmd -o ../figuras/figura-6-modelo-er-catalogos.png -b white -s 2 -t neutral
```

También se pueden editar en <https://mermaid.live>.

### Para volver a capturar los prototipos

> **Ya no aplica.** Los archivos `.dc.html` y `canvas.json` se borraron del repositorio el 14/10/2026 (commit "Prototipo mejorado"); las capturas de `figuras/prototipos/` quedan como las de la v0.2. Las instrucciones se conservan como registro y para recuperar esos archivos del historial de git si hiciera falta.

Con Python, Pillow y Google Chrome instalados, desde `prototipos/herramientas/`:

```
python capturar_prototipos.py
```

Vuelve a generar los diecisiete PNG de `figuras/prototipos/` en el orden del lienzo `canvas.json`. Dos salvedades:

- El Documento 1 no usa la captura de la pantalla de inicio en teléfono.
- La figura 28, «Prototipo de la pantalla Inicio de Sesión», es la pantalla de Ingreso con la opción «Administración del sitio» elegida. El guion no la genera; su copia está en `figuras/prototipos/inicio-de-sesion.png`.

Los archivos `.dc.html` necesitan un `support.js` que no vino con los prototipos. El archivo `herramientas/support.js` es un sustituto escrito para este proyecto. Hace lo siguiente:

- resuelve las plantillas;
- dibuja el estado inicial de cada pantalla, incluida la opción elegida de cada lista desplegable;
- atiende los clics.

Sirve tanto para las capturas como para el prototipo navegable, pero no reproduce todo lo que hacía el original.

---

## Prototipo de simulación aprobado

El prototipo navegable del Entregable 1 (`prototipo-completo-incovsa.html`) se quitó del repositorio el 12/10/2026. El prototipo vigente es el **prototipo de simulación**, aprobado por el Ing. William Ambrossio y presentado al Ing. Manuel Rojas como avance del Entregable 2. Lo que tiene, cómo se usa para desarrollar y su design system están en [`specs/20-prototipo-aprobado.md`](../specs/20-prototipo-aprobado.md).

- **Código fuente:** `prototipos/simulacion/src/`.
- **Cómo se arma:** desde `prototipos/simulacion/`, `python construir.py` (requiere Python 3 con Pillow, numpy y openpyxl, y la carpeta `docs_incovsa/`). Genera `prototipos/prototipo-simulacion-incovsa.html`, que se abre con doble clic.
- El HTML armado **no se sube** al repositorio, porque contiene datos reales de la empresa (RNF-10).
- `prototipos/simulacion/GUIA-CAMBIOS-PROTOTIPO.md` es la guía con que se aplicaron los cambios de la reunión 4 el 12/10/2026. Es un registro histórico.

---

## Anexos

Los tres anexos que piden los lineamientos para este entregable están dentro del Documento 1.

| Anexo | Contenido | Dónde está |
|---|---|---|
| A | Actas de reuniones | En el Documento 1. El texto fuente de cada acta está en `docs/Reuniones/<reunión>/acta-reunion-N.md`, junto a las notas originales. Las actas no se modifican: son el registro de cada reunión |
| B | Evidencias del levantamiento de requerimientos | En el Documento 1, figuras 9 a 19. Las imágenes vienen de `docs/Reuniones/` y su copia está en `figuras/evidencias/` |
| C | Prototipos | En el Documento 1, figuras 20 a 36. El lienzo y su copia local están en `prototipos/` |

Las reglas y los casos de prueba de conversión (Anexo E de los lineamientos) están en `specs/12-reglas-de-negocio.md`.

---

## Elementos que corresponden al Entregable No. 2

Los lineamientos ubican en el segundo entregable lo siguiente, que el Documento 1 deja señalado como pendiente. Ya está en el Documento 2 (`../entregable-2/`), salvo el diagrama de despliegue, que se completa en el Entregable 3:

- Diagramas de secuencia de los procesos críticos.
- Diagrama de componentes, diagrama de despliegue y diagrama de clases.
- Estructura del repositorio y detalle de dependencias.
- Diccionario de datos completo, reglas de integridad y procedimiento de migraciones.
- Especificación del módulo de Reportes. Está definida en `specs/10-picking-reportes.md`, a partir del prototipo aprobado.
