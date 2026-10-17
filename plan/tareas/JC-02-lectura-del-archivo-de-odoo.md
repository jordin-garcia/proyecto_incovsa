---
id: JC-02
titulo: Lectura del archivo de Odoo
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JC-01, JG-02, JG-04]
programada: 2026-10-17
requisitos: [RF-SL-50, RF-SL-51, RF-SL-52, RF-SL-53, RF-SL-54, RF-SL-73, RN-35, RN-36, RN-37, RN-50, RNF-05]
pantallas: [picking.js › leerOdoo, preparar]
---

# JC-02 · Lectura del archivo de Odoo

**Responsable:** José Daniel Cifuentes · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JC-01, JG-02, JG-04

## Objetivo
Implementar en el módulo `odoo` la lectura y validación del archivo `.xlsx` que el facturador exporta de Odoo, como **función pura**: recibe los bytes del archivo y la sede de trabajo, y devuelve los pedidos facturados que se pueden cargar, los que no y por qué. No guarda nada (eso es JC-03). Es la regla de negocio más probada del picking.

## Contexto que debes leer
- `specs/06-picking-facturacion.md` §"Archivo de Odoo", §"Cómo se lee", §"Columnas que se usan" y §"Bodega del archivo" **completos**
- `specs/12`: RN-35, RN-36, RN-37 y RN-50; `specs/13` §"Archivo de pedidos de Odoo"
- `specs/16`: "Entradas y archivos" y decisiones 1, 12, 77 y 85
- `pruebas/fixtures/odoo/README.md` (JG-04: archivos de prueba y cifras esperadas)
- Prototipo: `picking.js` › `leerOdoo()` y `preparar()` (columnas, lectura de arriba hacia abajo, prefijos, motivos de rechazo y textos del resumen); `base.js` › `leerNumero()` y `PREFIJOS_ODOO`
- Context7: SheetJS 0.20.3 (`read` con `type: "buffer"`, `sheet_to_json` con `header: 1`), `file-type`, Zod 4

## Qué hacer
1. `src/modulos/odoo/servicio.ts` › `leerArchivoOdoo(bytes, sedeDeTrabajo)`:
   - rechaza sin leer un archivo de más de **2 MB** o que no sea realmente un `.xlsx` (comprobado por su contenido con `file-type`, no por la extensión);
   - lee solo la primera hoja y solo las columnas de `specs/06`; si falta una de ellas, rechaza el archivo indicando cuál;
   - lee **de arriba hacia abajo**: una fila sin Referencia ni Contacto es otra línea de la última referencia; ignora las filas de agrupación (texto en Referencia sin Contacto ni Producto);
   - solo carga las referencias en estado **"Hecho"**; cuenta las demás (por ejemplo, "Cancelado") para el resumen;
   - número del pedido facturado = tercer segmento de la Referencia, con sus ceros (RN-36); bodega = primer segmento (`XE`, `GT`, `ESC`);
   - **no carga nada**, con el motivo, si hay un prefijo desconocido, referencias de más de una bodega o una bodega distinta de la sede de trabajo (specs/06 §"Bodega del archivo");
   - toma tal como vienen (sin espacios al inicio o al final) el cliente (`Contacto`), el sector (`Contacto/Ciudad`), el producto, el lote (vacío = texto vacío, decisión 42), el Peso de Conversión y la cantidad en kg (RN-37);
   - un pedido facturado **no se carga** si alguna de sus líneas trae la cantidad o el Peso de Conversión vacío, no numérico o ≤ 0 (RF-SL-73, RN-50), o si no tiene líneas; los demás sí;
   - cantidades y pesos como decimales exactos con 3 decimales (decisión 1), nunca con `Number` para calcular.
2. Resultado tipado: `{ pedidos: PedidoFacturadoLeido[], noCargados: { numero, cliente, motivo }[], otrosEstados: number, filasDeAgrupacion: number }` o un error de archivo con su mensaje. Los mensajes son los del prototipo (`preparar()`).
3. `src/modulos/odoo/esquemas.ts`: esquemas Zod de cada fila leída y del resultado.

## Archivos que creas o modificas
- `src/modulos/odoo/servicio.ts`, `src/modulos/odoo/esquemas.ts`, `src/modulos/odoo/servicio.test.ts` (crear)

## Criterios de aceptación
1. **RF-SL-51 / RN-35** (CP-22): con `odoo-ejemplo-anonimizado.xlsx` y la sede Quetzaltenango, se leen 80 referencias: 79 "Hecho" y 1 "Cancelado" (ignorada); la fila de agrupación se ignora.
2. **RN-50 / RF-SL-73** (CP-21, CP-23): se pueden cargar **33** pedidos facturados; los **46** con alguna línea de Peso de Conversión en 0 quedan en `noCargados` con su motivo.
3. **RN-36** (CP-25): la referencia `XE-IN/SALIDA/03543` da el número `03543` y la bodega Quetzaltenango.
4. **RN-37** (CP-24, CP-26): cliente, sector, producto, lote, Peso de Conversión y cantidad salen tal como vienen; `SODA ASH (CHI-SAC/0040KG)` queda con Peso de Conversión 25.
5. **RNF-05** (CP-27, CP-28): `cantidad-invalida.xlsx` deja sin cargar los pedidos con cantidad vacía, con texto o en 0; `no-es-xlsx.xlsx` y un archivo de más de 2 MB generado en la prueba se rechazan sin leerlos; `sin-columna-peso.xlsx` se rechaza nombrando la columna.
6. **Bodega** (CP-29): `otra-bodega-gt.xlsx` con la sede Quetzaltenango, `bodegas-mezcladas.xlsx` y `prefijo-desconocido.xlsx` no cargan nada y dan el motivo del prototipo.
7. Las cantidades decimales del archivo (4 líneas) conservan su valor exacto.

## Pruebas obligatorias
- `src/modulos/odoo/servicio.test.ts` con todos los criterios, cada prueba nombrada con su RF/RN y su CP

## Verificación
```
npm run verificar
npm test -- src/modulos/odoo
```

## Fuera de alcance
- Guardar los pedidos facturados y la pantalla de Facturación (JC-03).

## Notas
- Esta tarea no tiene pantallas ni base de datos: puede hacerse el sábado después de JG-02 y JG-04.
- En el `## Resultado`, documenta los tipos que devuelve `leerArchivoOdoo` y los mensajes de error, porque JC-03 los muestra tal cual.
