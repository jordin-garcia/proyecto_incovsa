---
id: JC-02
titulo: Lectura del archivo de Odoo
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E2
prioridad: P1
estado: hecha
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

## Resultado

Implementado `leerArchivoOdoo` como función pura asíncrona del servidor. Comprueba el límite de 2 MB y el contenido real con `file-type` antes de interpretar el libro con SheetJS 0.20.3. Lee exclusivamente la primera hoja, localiza las ocho columnas por sus encabezados y reconstruye los pedidos de arriba hacia abajo. Zod valida la entrada, cada fila y el resultado.

Con el archivo anonimizado devuelve 33 pedidos aceptados, 46 rechazados por Peso de Conversión, una referencia de otro estado y una fila de agrupación. Con `cantidad-invalida.xlsx` devuelve 30 aceptados y 49 rechazados (3 por cantidad y 46 por peso). No guarda datos, consulta la base, genera identificadores, agrupa líneas ni modifica los bytes recibidos.

### Tipos y uso para JC-03

Los tipos y esquemas se exportan desde `src/modulos/odoo/esquemas.ts`:

```ts
type BodegaOdoo = "XE" | "GT" | "ESC";

type LineaPedidoFacturadoLeida = {
  producto: string;
  lote: string;
  pesoConversionKg: string;
  cantidadKg: string;
};

type PedidoFacturadoLeido = {
  numero: string;
  referencia: string;
  bodega: BodegaOdoo;
  cliente: string;
  sector: string;
  lineas: LineaPedidoFacturadoLeida[];
};

type PedidoNoCargado = {
  numero: string;
  cliente: string;
  motivo: "no traen productos"
    | "tienen líneas con la cantidad en 0 o vacía"
    | "tienen líneas con el Peso de Conversión en 0 o vacío (RN-50)";
};

type ResultadoLecturaOdoo = {
  pedidos: PedidoFacturadoLeido[];
  noCargados: PedidoNoCargado[];
  otrosEstados: number;
  filasDeAgrupacion: number;
};
```

- Firma: `leerArchivoOdoo(bytes: Uint8Array, sedeDeTrabajo: BodegaOdoo): Promise<ResultadoLecturaOdoo>`. Acepta también `Buffer`, que es un `Uint8Array`.
- La acción de carga de JC-03 debe autorizar sesión, permiso `pk.facturacion` y sede con `exigirPermiso` antes de llamar al lector. Después pasa el `prefijoOdoo` de la sede autorizada, validado con `esquemaBodegaOdoo`. No pasa el ID numérico de la sede. Escuintla es `ESC`, como en la semilla de Prisma; `ES` es solo la clave interna del prototipo.
- Las cantidades y los pesos son textos decimales positivos de tres posiciones (`"25.000"`, `"45.360"`), listos para Prisma `Decimal(12,3)` y para `convertir`. La normalización usa `Prisma.Decimal` desde texto, sin cálculos decimales con `Number`; el redondeo a tres posiciones conserva el comportamiento del prototipo.
- `numero` y `lote` conservan sus ceros iniciales. Un lote vacío se devuelve como `""`. Los textos solo pierden espacios exteriores.
- Los motivos son los fragmentos literales de `preparar()` para construir el resumen. Se exportan también en `motivosNoCargados`. La prioridad es sin productos, cantidad inválida y Peso de Conversión inválido; un pedido se rechaza una sola vez.
- `otrosEstados` cuenta referencias, no líneas, y no se incluye en `noCargados`. La bodega se revisa en todas las referencias Hecho antes de descartar pedidos por sus líneas. Cero pedidos aceptados con rechazos individuales es un resultado válido.
- `esquemaFilaOdoo` devuelve `cantidadKg` y `pesoConversionKg` como `string | null`: `null` representa una cantidad o un peso inválido. Esto permite rechazar el pedido completo sin convertir el defecto de una línea en un error de todo el archivo.
- También se exportan `esquemaEntradaLecturaOdoo`, `esquemaLineaPedidoFacturadoLeido`, `esquemaPedidoFacturadoLeido`, `esquemaPedidoNoCargado` y `esquemaResultadoLecturaOdoo`.

### Errores del archivo

Se lanzan como `ErrorNegocio` de `@/lib/errores`, con los mensajes del prototipo. La acción de JC-03 puede convertirlos con `aResultadoDeError`:

- `El archivo pesa más de 2 MB. No se cargó.`
- `El archivo debe ser .xlsx, exportado de Odoo.`
- `No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.`
- `El archivo no tiene la columna «<columna>». ¿Es el export de salidas de Odoo?`
- `El archivo no trae referencias.`
- `El archivo no trae referencias en estado «Hecho».`
- `Hay referencias de una bodega que no se reconoce. Se esperan los prefijos XE, GT o ESC.`
- `El archivo trae referencias de más de una bodega. Cada archivo debe ser de una sola bodega.`
- `El archivo es de la bodega de <bodega> y usted está trabajando en <sede>. Cambie la sede o cargue el archivo correcto. No se cargó nada.`

### Archivos y verificación

- `src/modulos/odoo/servicio.ts`: lectura, reconstrucción y clasificación.
- `src/modulos/odoo/esquemas.ts`: esquemas, tipos y normalización decimal exacta.
- `src/modulos/odoo/servicio.test.ts`: 40 casos con códigos RF/RN y CP. Usan los siete archivos de JG-04 y libros generados en memoria; los archivos originales no cambian.
- Fase roja: 37 fallos y una prueba de esquemas aprobada sobre el contrato inicial sin implementación de lectura.
- `npm run verificar`: formato, lint y tipos correctos; 15 archivos y 169 pruebas aprobadas.
- `npm test -- src/modulos/odoo`: 40 pruebas aprobadas.
- `npm run build`: compilación, tipos y generación de páginas correctos.
- `node scripts/tareas.mjs --validar`: plan válido, 62 tareas.
- Revisión independiente en contexto limpio con `plan/prompts/revision.md`: LISTO, sin hallazgos obligatorios ni opcionales; repitió las 40 pruebas del módulo y las 169 generales.
- Se comprobó el límite exacto de 2 MB, el rechazo antes de SheetJS, Excel binario y ZIP truncado, todas las columnas obligatorias, la primera hoja, herencia de líneas, lote vacío, referencias repetidas, los motivos y su prioridad, sedes y precisión hasta milésimas.
- Las cuatro líneas decimales originales pertenecen a pedidos rechazados por RN-50. Una copia en memoria con pesos válidos demuestra que se conservan `45.360`, `45.360`, `204.120` y `44.850`; el archivo anonimizado original mantiene sus 46 rechazos.
- Las comprobaciones usan PostgreSQL 18 con bases locales desechables. No se leyó ni creó ningún `.env`.
- No aplica B7: no se crean pantallas y este servicio todavía no está conectado a una pantalla (la conexión es JC-03).

### Decisiones

- No se agregaron dependencias ni se cambiaron especificaciones, archivos protegidos, datos de prueba o código de otra persona. Se siguió la precedencia de `specs/` y los mensajes del prototipo.
- La implementación se verificó en un worktree temporal para conservar intacta la configuración local de Obsidian, que impedía ejecutar Prettier en el checkout principal.
