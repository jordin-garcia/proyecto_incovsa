---
id: JM-10
titulo: Identificadores únicos al reordenar las líneas en Bodega
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-15]
programada: 2026-10-30
requisitos: [RNF-05, RNF-06]
pantallas: []
---

# JM-10 · Identificadores únicos al reordenar las líneas en Bodega

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** JG-15

## Objetivo
Corregir el hallazgo R-P02 de la revisión de seguridad (JG-15, severidad baja). `esquemaReordenarLineas` acepta identificadores repetidos (`[a, a]`). La lista pasa la comprobación del servicio y deja posiciones repetidas en Bodega y en el Tablero de la propia sede.

## Contexto que debes leer
- `plan/seguridad/asvs-nivel-2.md`, "Revisión manual de las operaciones del servidor" › "Picking" › R-P02
- `src/modulos/bodega/esquemas.ts` (`esquemaReordenarLineas`) y `src/modulos/bodega/servicio.ts` (reordenar líneas)
- `esquemaReordenarRecorrido` de `src/modulos/ruta/esquemas.ts`, que ya exige identificadores únicos

## Qué hacer
1. Exigir en `esquemaReordenarLineas` que los identificadores sean únicos, como en `esquemaReordenarRecorrido`.
2. Revisar que el servicio compare el conjunto de identificadores con todas las líneas del envío, no solo el largo de la lista.
3. **Informe:** en `plan/seguridad/asvs-nivel-2.md`, marcar R-P02 como corregido.

## Archivos que creas o modificas
- `src/modulos/bodega/esquemas.ts`, `src/modulos/bodega/servicio.ts` (modificar, si hace falta)
- `src/modulos/bodega/servicio.test.ts` o `esquemas.test.ts` (modificar)
- `plan/seguridad/asvs-nivel-2.md` (solo sus filas; autorizado por el coordinador)

## Criterios de aceptación
1. **RNF-05:** una lista con un identificador repetido se rechaza y no cambia ninguna posición.
2. **RNF-05:** una lista con todas las líneas del envío, cada una una vez, se sigue aceptando.

## Pruebas obligatorias
- Vitest, con nombres que empiecen por `RNF-05:`.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
```

## Fuera de alcance
- Cambiar la pantalla de Bodega.

## Resultado

Se corrigió el hallazgo de seguridad R-P02 (severidad baja) para prevenir identificadores duplicados al reordenar líneas de preparación o la cola de envíos en Bodega:

1. **Esquemas de validación Zod (`src/modulos/bodega/esquemas.ts`):**
   - En `esquemaReordenarLineas`, se añadió límite superior `.max(1000)` y refinamiento de unicidad `.refine((ids) => new Set(ids).size === ids.length, { message: "Los IDs de línea no deben contener duplicados" })`, siguiendo el patrón de `src/modulos/ruta/esquemas.ts`.
   - En `esquemaReordenarCola`, se aplicó el mismo control con `.max(1000)` y `.refine((ids) => new Set(ids).size === ids.length)`.

2. **Servicio (`src/modulos/bodega/servicio.ts`):**
   - En `reordenarLineasPreparacion`, se reforzó la comprobación de conjunto en profundidad verificando que `idsEntrada.size === entrada.lineaIds.length`, `entrada.lineaIds.length === envio.lineas.length` y que cada identificador pertenezca a las líneas del envío. Si hay duplicados o elementos faltantes, se lanza `ErrorAcceso()` antes de ejecutar cualquier transacción.
   - En `reordenarColaBodega`, se validó que `new Set(entrada.envioIds).size === entrada.envioIds.length`, rechazando duplicados con `ErrorAcceso()`.

3. **Pruebas automatizadas:**
   - Pruebas unitarias de esquema y servicio con criterio `RNF-05:` en `src/modulos/bodega/servicio.test.ts` y en `src/modulos/bodega/acciones.test.ts`, confirmando que listas con identificadores duplicados son rechazadas sin alterar posiciones en BD, y que listas completas sin duplicados se aceptan correctamente.

4. **Informe de seguridad:**
   - Se marcó el hallazgo R-P02 como corregido en `plan/seguridad/asvs-nivel-2.md`.
