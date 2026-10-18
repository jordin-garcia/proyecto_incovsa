---
id: JG-04
titulo: Datos de prueba y recursos gráficos del prototipo
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: [JG-02]
programada: 2026-10-17
requisitos: [RF-SL-50, RF-SL-51, RF-SL-53, RN-35, RN-50, RNF-10]
pantallas: []
---

# JG-04 · Datos de prueba y recursos gráficos del prototipo

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-02

## Objetivo
1. Generar una copia del archivo de ejemplo de Odoo **sin datos personales**, con la misma estructura y las mismas cifras, para que las pruebas automáticas de la lectura del archivo (JC-02) y del flujo completo corran en cualquier equipo y en GitHub Actions (specs/16, decisión 77). El archivo real de INCOVSA nunca se sube.
2. Extraer del prototipo aprobado los **recursos gráficos** que la aplicación necesita (logotipos, fotografías de las pantallas de acceso e imágenes del catálogo de prueba), para que nadie dependa de `docs_incovsa/`.

## Contexto que debes leer
- `specs/13-datos-maestros.md` §"Archivo de pedidos de Odoo" (estructura de 16 columnas y la tabla "Cifras del archivo de ejemplo")
- `specs/06-picking-facturacion.md` §"Archivo de Odoo" y §"Cómo se lee"
- `specs/16`, decisiones 12 y 77; `specs/15` RNF-10
- Context7: SheetJS 0.20.3 (`read`, `utils.sheet_to_json`, `utils.aoa_to_sheet`, `writeFile`)

## Qué hacer
1. `scripts/anonimizar-odoo.mjs <archivo real> <archivo de salida>`: lee el `.xlsx` real (solo en el equipo del coordinador: `docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx`) y escribe una copia donde:
   - cada valor distinto de `Contacto` se reemplaza por `Cliente de ejemplo NNN` (el mismo cliente siempre recibe el mismo nombre, numerados en orden de aparición);
   - `Contacto/Calle`, `Contacto/Calle2` y `Contacto/Estado` quedan vacíos; `Documento origen` se reemplaza por `S9NNNN` consecutivo;
   - **todo lo demás queda igual**: el orden de las filas, la fila de agrupación, las filas sin Referencia ni Contacto, `Referencia`, `Contacto/Ciudad` (sector), `Estado`, productos, Pesos de Conversión (incluidos los 0), lotes y cantidades.
2. Generar `pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx` con ese script.
3. Generar también, con un script reproducible (`scripts/generar-fixtures-odoo.mjs`), los archivos inválidos para JC-02:
   - `otra-bodega-gt.xlsx` (todas las referencias con prefijo `GT-`);
   - `bodegas-mezcladas.xlsx` (referencias `XE-` y `GT-`);
   - `prefijo-desconocido.xlsx` (una referencia con prefijo `ZZ-`);
   - `sin-columna-peso.xlsx` (falta `Movimientos de stock/Producto/Peso`);
   - `cantidad-invalida.xlsx` (una línea de una referencia "Hecho" con cantidad vacía, otra con texto y otra en 0);
   - `no-es-xlsx.xlsx` (un texto con extensión `.xlsx`).
   El archivo de más de 2 MB **no** se sube: JC-02 lo genera en memoria en su prueba.
4. `pruebas/fixtures/odoo/README.md` con el origen de cada archivo y la tabla de cifras esperadas del archivo anonimizado (las de `specs/13`).
5. **Recursos gráficos:** `scripts/extraer-recursos-prototipo.mjs` lee `window.RECURSOS` del HTML armado del prototipo (`entregable-1/prototipos/prototipo-simulacion-incovsa.html`; los arma `construir.py`) y escribe, en WebP:
   - `public/marca/incovsa-quimicos.webp` y `public/marca/incovsa-quimicos-blanco.webp` (`logo` y `logoBlanco`: el logotipo de la cabecera, specs/05);
   - `public/marca/inquiserca.webp` (`inquiserca`, recibido el 13/10);
   - `public/marca/foto-equipo.webp` y `public/marca/foto-reunion.webp` (`fotoEquipo` y `fotoReunion`: las fotografías de las pantallas de acceso y del fondo de la portada cuando no hay imágenes subidas, como en el prototipo);
   - `pruebas/fixtures/catalogo/01.webp` a `28.webp` (`catalogo`: las 28 imágenes de los productos públicos de prueba, en el orden de `base.js` › `PRODUCTOS_PUB_BASE`). Son solo para la semilla de demostración y las pruebas; nunca se sirven desde `public/`.

## Archivos que creas o modificas
- `scripts/anonimizar-odoo.mjs`, `scripts/generar-fixtures-odoo.mjs` y sus pruebas (crear)
- `pruebas/fixtures/odoo/*.xlsx` y `pruebas/fixtures/odoo/README.md` (crear)
- `scripts/extraer-recursos-prototipo.mjs`, `public/marca/*.webp`, `pruebas/fixtures/catalogo/*.webp` (crear)

## Criterios de aceptación
1. El archivo anonimizado conserva exactamente las cifras de `specs/13`: 1 fila de agrupación, 80 referencias (todas `XE-IN`, del 03539 al 03627), 1 "Cancelado", 79 "Hecho" con 205 líneas, **82 líneas con Peso de Conversión 0 en 46 referencias**, ninguna línea sin lote, los Pesos de Conversión 25, 30, 35, 45, 50, 120, 180 y 200, 4 líneas con cantidad decimal y `SODA ASH (CHI-SAC/0040KG)` con peso 25 en sus 12 líneas.
2. El archivo anonimizado tiene 52 contactos distintos, todos con el formato `Cliente de ejemplo NNN`, y ningún valor de `Contacto`, `Contacto/Calle`, `Contacto/Calle2`, `Contacto/Estado` ni `Documento origen` del archivo real.
3. Los archivos inválidos del paso 3 existen y cada uno tiene el defecto que dice su nombre, y nada más.
4. Ejecutar el script dos veces sobre el mismo archivo real produce el mismo resultado.
5. Los 5 archivos de `public/marca/` y las 28 imágenes de `pruebas/fixtures/catalogo/` existen, se ven iguales que en el prototipo y ninguno pesa más de lo que pesaba dentro del HTML.

## Pruebas obligatorias
- `scripts/anonimizar-odoo.test.mjs`: criterios 1 y 2 sobre el archivo generado (la prueba lee `pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx`, no el real)
- `scripts/generar-fixtures-odoo.test.mjs`: criterio 3

## Verificación
```
node scripts/anonimizar-odoo.mjs "docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx" pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx
node scripts/generar-fixtures-odoo.mjs
node scripts/extraer-recursos-prototipo.mjs
npm run verificar
```

## Fuera de alcance
- La lectura del archivo dentro de la aplicación (JC-02).

## Notas
- **Cuando llegue el archivo completo de Odoo (P-91)**, el coordinador vuelve a ejecutar el script con el archivo nuevo, actualiza las cifras esperadas de este README y avisa a José Daniel en su bitácora.
- Solo el equipo del coordinador tiene `docs_incovsa/`. Ninguna prueba debe depender del archivo real.

## Resultado

Hecha por el coordinador el 17/10/2026.

**Qué se hizo**
- `scripts/anonimizar-odoo.mjs`: copia del archivo de Odoo sin datos personales. Cada `Contacto` distinto → `Cliente de ejemplo NNN` (en orden de aparición); `Contacto/Calle`, `Contacto/Calle2` y `Contacto/Estado` vacíos; `Documento origen` → `S9NNNN` consecutivo por fila. Todo lo demás queda igual, valor y tipo (el lote sigue siendo texto, con sus ceros a la izquierda). El libro de salida es nuevo: no copia las propiedades del real (autor ni fechas). Es determinista: el mismo archivo real produce los mismos bytes.
- `pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx`, generado con el archivo real. Comparado celda por celda con el real: 0 diferencias fuera de las 5 columnas anonimizadas, 0 valores reales de esas columnas en la copia y 52 contactos con la misma agrupación.
- `scripts/generar-fixtures-odoo.mjs`: a partir del anonimizado, genera `otra-bodega-gt.xlsx`, `bodegas-mezcladas.xlsx`, `prefijo-desconocido.xlsx`, `sin-columna-peso.xlsx`, `cantidad-invalida.xlsx` y `no-es-xlsx.xlsx`, cada uno con solo su defecto.
- `scripts/extraer-recursos-prototipo.mjs`: lee `window.RECURSOS` del prototipo armado y escribe los 5 archivos de `public/marca/` y las 28 imágenes de `pruebas/fixtures/catalogo/`. Las imágenes ya eran WebP dentro del HTML: se escriben los mismos bytes, así que se ven igual y pesan lo mismo.
- Pruebas (`node:test`): `scripts/anonimizar-odoo.test.mjs` (criterios 1, 2 y 4), `scripts/generar-fixtures-odoo.test.mjs` (criterio 3) y `scripts/extraer-recursos-prototipo.test.mjs` (criterio 5).
- CI: el trabajo `plan` ahora ejecuta `npm ci` (con caché de npm y 10 minutos de límite) antes de `node --test "scripts/*.test.mjs"`, porque las pruebas nuevas importan `xlsx`. `scripts/flujos.test.mjs` lo comprueba.

**Decisiones**
- `bodegas-mezcladas.xlsx`: referencias 1 a 40 con `XE-` y 41 a 80 con `GT-`. `prefijo-desconocido.xlsx`: la última referencia del archivo (`XE-IN/SALIDA/03626`) con `ZZ-`. En `otra-bodega-gt.xlsx` y estos dos solo cambia la columna `Referencia` (no `Bodega de Ingreso/Salida` ni `Ubicación de origen`, que no se usan).
- `cantidad-invalida.xlsx`: la primera línea de las 3 primeras referencias "Hecho" que sí se cargarían (todos sus pesos y cantidades > 0) tiene, en orden, cantidad vacía, `"diez"` y `0`. Con RN-50 se cargan 30 pedidos facturados en vez de 33.
- `Documento origen` se numera por fila, como dice la tarea: en el real dos referencias comparten documento y en la copia no. La columna no se usa.
- No hay ícono (`/favicon.ico`): ni el prototipo ni INCOVSA lo han entregado.

**Cómo usarlo**
- Lectura del archivo (JC-02): `pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx` con las cifras esperadas de `pruebas/fixtures/odoo/README.md` (80 referencias, 79 "Hecho", 205 líneas, 46 pedidos con peso 0 y **33 que se cargan**), y los 6 inválidos. El de más de 2 MB se genera en memoria en la prueba. Desde código: `leerFilas(bytes)` y `indices(encabezado)` de `scripts/anonimizar-odoo.mjs` y `referencias(filas)` de `scripts/generar-fixtures-odoo.mjs` sirven para preparar casos en las pruebas.
- Marca (JG-05, DM-02 y quien dibuje el acceso): `/marca/incovsa-quimicos.webp` (logotipo a color), `/marca/incovsa-quimicos-blanco.webp` (sobre fondo oscuro: menú lateral del panel, pantallas de acceso y tablero oscuro), `/marca/inquiserca.webp`, `/marca/foto-equipo.webp` (acceso al picking y fondo de la portada sin imágenes subidas) y `/marca/foto-reunion.webp` (acceso al sitio).
- Semilla de demostración: `pruebas/fixtures/catalogo/NN.webp` es la imagen del producto `NN` de `PRODUCTOS_PUB_BASE` (tabla en `pruebas/fixtures/catalogo/README.md`). No se sirven desde `public/`.
- Cuando llegue el archivo completo de Odoo (P-91): `node scripts/anonimizar-odoo.mjs "<archivo nuevo>" pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx`, luego `node scripts/generar-fixtures-odoo.mjs`, y actualizar las cifras del README, de `specs/13` y de `scripts/anonimizar-odoo.test.mjs`.
