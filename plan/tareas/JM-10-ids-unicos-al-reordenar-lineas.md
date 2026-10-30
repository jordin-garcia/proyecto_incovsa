---
id: JM-10
titulo: Identificadores únicos al reordenar las líneas en Bodega
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: pendiente
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
