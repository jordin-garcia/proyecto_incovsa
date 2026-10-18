---
id: JM-02
titulo: Conversión de kilogramos a unidades
persona: josue
responsable: Josué Menéndez
hito: E2
prioridad: P1
estado: hecha
depende_de: [JM-01, JG-02]
programada: 2026-10-17
requisitos: [RN-01, RN-02, RN-05, RN-21, RF-SL-22]
pantallas: [base.js › convertir, textoUnidades, textoConversion, htmlConversion, fmt]
---

# JM-02 · Conversión de kilogramos a unidades

**Responsable:** Josué Menéndez · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JM-01, JG-02

## Objetivo
El módulo `conversion`: el cálculo central del proyecto, que convierte una cantidad en kg en unidades completas y kg sueltos con el Peso de Conversión (RN-01), **sin errores de redondeo**, con las pruebas obligatorias de los lineamientos. Lo usan Bodega, el tablero, la Ruta y los Reportes.

## Contexto que debes leer
- `specs/12-reglas-de-negocio.md`: RN-01, RN-02, RN-05, RN-21 y §"Conversión" **completa** (fórmula, ejemplos y los **15 casos validados por INCOVSA**)
- `specs/07` §"Tabla de cada ruta o pedido" (ejemplos con resto y cantidad exacta)
- `specs/16`: decisión 1 (`Decimal(12,3)` y cálculo en gramos enteros)
- `entregable-2/documento-2/06-logica-de-negocio.md` §"Lógica de conversión" y `90-anexo-f-casos-de-prueba.md` (CP-01 a CP-18)
- Prototipo: `base.js` › `convertir()`, `textoUnidades()`, `textoConversion()`, `htmlConversion()` y `fmt()`
- Context7: `fast-check` (propiedades con Vitest)

## Qué hacer
1. `src/modulos/conversion/servicio.ts`:
   - `convertir(cantidadKg, pesoConversionKg)`: recibe decimales exactos (texto o `Decimal` de Prisma, nunca `Number` con decimales), los pasa a **gramos enteros** y devuelve `{ unidades, restoKg }` con `unidades = parte entera (cantidad ÷ peso)` y `resto = cantidad − unidades × peso` (RN-01), sin redondear (RN-05);
   - lanza `ErrorNegocio` si el Peso de Conversión no es mayor que cero (nunca debería llegar, por RN-50);
   - `textoConversion(cantidadKg, pesoConversionKg)`: "N unidades + R kg"; "N unidades" sin "+ 0 kg" si es exacta; "1 unidad" en singular; los números con el mismo formato que `fmt()` del prototipo.
2. Componente `src/componentes/picking/bodega/Unidades.tsx` que muestra la conversión como `htmlConversion()` (unidades grandes y el resto aparte), para Bodega, el tablero y el detalle.

## Archivos que creas o modificas
- `src/modulos/conversion/servicio.ts`, `src/modulos/conversion/servicio.test.ts` (crear)
- `src/componentes/picking/bodega/Unidades.tsx` (crear)

## Criterios de aceptación
1. **RN-01** (CP-01 a CP-15): los 15 casos validados por INCOVSA de `specs/12` dan exactamente las unidades esperadas.
2. **RN-21 / RN-05** (CP-16 a CP-18): 60 kg con 25 → "2 unidades + 10 kg"; 10 kg con 25 → "0 unidades + 10 kg"; 37.5 kg con 25 → "1 unidad + 12.5 kg", sin errores de redondeo.
3. **RN-01 (exacta):** 50 kg con 25 → "2 unidades"; 55 kg con 55 → "1 unidad"; 110 kg con 55 → "2 unidades".
4. **Propiedades** (fast-check, con cantidades de hasta 4,536 kg y pesos de hasta 2,500 kg con 3 decimales): `unidades × peso + resto = cantidad` exactamente; `0 ≤ resto < peso`; `unidades` es un entero ≥ 0.
5. Un Peso de Conversión 0 o negativo lanza `ErrorNegocio`.

## Pruebas obligatorias
- `src/modulos/conversion/servicio.test.ts`: cada caso como prueba propia, nombrada con su regla y su CP (`it("RN-01 CP-12: 500 kg con 25 kg son 20 unidades", …)`), más las propiedades del criterio 4

## Verificación
```
npm run verificar
npm test -- src/modulos/conversion
```

## Fuera de alcance
- Agrupar líneas (lo hace el envío a Bodega, JC-04) y la pantalla de Bodega (JM-03).

## Notas
- No tiene pantallas ni base de datos: puede hacerse el sábado después de JG-02.
- Este módulo entra en las pruebas de mutación de JG-11: las pruebas deben detectar cualquier cambio de la fórmula.

## Resultado

Se implementó el servicio central de conversión de kilogramos a unidades en `src/modulos/conversion/servicio.ts` y el componente de interfaz `src/componentes/picking/bodega/Unidades.tsx`, con su batería completa de 31 pruebas unitarias y de propiedades en `src/modulos/conversion/servicio.test.ts`.

El cálculo convierte las cantidades y el Peso de Conversión a gramos enteros (`BigInt`), garantizando exactitud matemática sin pérdida de precisión por aritmética de punto flotante IEEE 754 (specs/16, decisión 1; RN-01, RN-05, RN-21).

**Decisiones tomadas:**
- **Entrada polimórfica exacta (`DecimalExacto`):** La función `convertir` admite cadenas de texto numéricas (`string`), instancias de `Decimal` de Prisma (`Prisma.Decimal`) y números (`number`), normalizando siempre a gramos enteros sin aproximaciones previas.
- **Validación de Peso de Conversión (RN-50):** Si `pesoConversionKg <= 0`, lanza `ErrorNegocio("El Peso de Conversión debe ser mayor que cero.")`. Si la cantidad es negativa, lanza `ErrorNegocio("La cantidad no puede ser negativa.")`.
- **Formato idéntico al prototipo:** `fmt()`, `textoUnidades()`, `textoConversion()` y `htmlConversion()` reproducen con exactitud los textos, separadores de miles, omisión de "+ 0 kg" en conversiones exactas y etiquetas HTML (`unid`, `resto`) de `base.js` y `estilos.css`.
- **Componente `<Unidades />`:** Admite recibir `cantidadKg` y `pesoConversionKg` para calcular la conversión en el renderizado, o bien `unidades` y `restoKg` ya precalculados. Aplica los estilos tipográficos monoespaciados y la pastilla verde (`#EEF6E2`, `#45691A`) del design system.

**Archivos principales:**
- `src/modulos/conversion/servicio.ts`: Servicio con `convertir`, `textoConversion`, `textoUnidades`, `htmlConversion`, `fmt` y tipos `DecimalExacto`, `ResultadoConversion`.
- `src/modulos/conversion/servicio.test.ts`: 31 pruebas que cubren CP-01 a CP-15 (casos validados por INCOVSA), CP-16 a CP-18 (fraccionados), conversiones exactas, validación de errores (RN-50), propiedades matemáticas exhaustivas con `fast-check` (1,000 corridas con números hasta 4,536 kg y pesos hasta 2,500 kg con 3 decimales, más corridas con `Prisma.Decimal`), y pruebas del componente React con `react-dom/server`.
- `src/componentes/picking/bodega/Unidades.tsx`: Componente visual para Bodega, tablero y detalle.

**Cómo usar lo que se creó:**
- **Calcular conversión en servicios o componentes:**
  ```ts
  import { convertir, textoConversion } from "@/modulos/conversion/servicio";

  const { unidades, restoKg } = convertir(linea.cantidadKg, linea.pesoConversionKg);
  // o también mediante los alias u y r del prototipo:
  // const { u, r } = convertir(...);

  const texto = textoConversion(linea.cantidadKg, linea.pesoConversionKg);
  // Ejemplo: "2 unidades + 10 kg" o "2 unidades"
  ```
- **Mostrar en componentes de Bodega / Tablero:**
  ```tsx
  import { Unidades } from "@/componentes/picking/bodega/Unidades";

  // Calculando directamente desde cantidad y peso:
  <Unidades cantidadKg={linea.cantidadKg} pesoConversionKg={linea.pesoConversionKg} />

  // O con valores ya calculados:
  <Unidades unidades={linea.unidades} restoKg={linea.restoKg} />
  ```
