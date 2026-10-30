---
id: JC-10
titulo: Límites del archivo de Odoo contra archivos comprimidos maliciosos
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-15]
programada: 2026-10-30
requisitos: [RNF-05, RF-SL-50]
pantallas: []
---

# JC-10 · Límites del archivo de Odoo contra archivos comprimidos maliciosos

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** JG-15

## Objetivo
Corregir la brecha más grave de la revisión de seguridad (JG-15, ASVS V5.2.3, severidad alta). El .xlsx es un ZIP, y hoy solo se comprueban su tamaño comprimido (2 MB) y su firma. Después, SheetJS descomprime todo sin tope. Un archivo de 2 MB muy comprimido puede ocupar gigabytes de memoria y tumbar el servidor. También se agregan los largos máximos de las columnas (ASVS V2.2.1).

## Contexto que debes leer
- `specs/06-picking-facturacion.md`, paso 8 de la carga (precisión del 29/10, JG-15)
- `specs/16` decisión 12 (lectura del archivo de Odoo) y "Entradas y archivos"
- `plan/seguridad/asvs-nivel-2.md`: filas V5.2.3 y V2.2.1
- `src/modulos/odoo/servicio.ts` (`comprobarArchivo` y `leerPrimeraHoja`) y `src/modulos/odoo/esquemas.ts`
- Documentación de Node.js 24 sobre `zlib.inflateRawSync` y su opción `maxOutputLength` (Context7)

## Qué hacer
1. En `comprobarArchivo`, antes de llamar a SheetJS, recorrer el directorio central del ZIP y rechazar el archivo si tiene **más de 100 entradas** o si su tamaño **descomprimido real** pasa de **50 MB** en total.
   - No basta con los tamaños que declara el ZIP, porque se pueden falsear. Descomprime cada entrada con `zlib.inflateRawSync` y `maxOutputLength`, de modo que nunca se pase del tope, o usa otro método que mida los bytes reales.
   - Usa solo `node:zlib`, sin dependencias nuevas.
2. Leer la hoja con `sheetRows` y rechazar el archivo si la primera hoja tiene **más de 20 000 filas**. No lo cortes en silencio, porque se perderían pedidos.
3. En `esquemaFilaOdoo`, agregar `.max()` iguales a las columnas de la base (`prisma/schema.prisma`): referencia 40, número 20, cliente, sector y producto 200, y lote 40.
4. En los tres casos se muestra el mensaje que ya existe: «No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.»
5. **Informe:** en `plan/seguridad/asvs-nivel-2.md`, cambiar a "Cumple" las filas V5.2.3 y V2.2.1 (la parte de Odoo), con su evidencia.

## Archivos que creas o modificas
- `src/modulos/odoo/servicio.ts`, `src/modulos/odoo/esquemas.ts` (modificar)
- `src/modulos/odoo/servicio.test.ts` (modificar)
- `plan/seguridad/asvs-nivel-2.md` (solo sus filas; autorizado por el coordinador)

## Criterios de aceptación
1. **ASVS V5.2.3:** un .xlsx de menos de 2 MB con una entrada que descomprimida pasa de 50 MB se rechaza sin pasar a SheetJS, y la memoria del proceso no crece más que el tope.
2. **ASVS V5.2.3:** un ZIP con más de 100 entradas, o que declara tamaños menores que los reales, se rechaza.
3. **RNF-05:** una hoja con más de 20 000 filas se rechaza, y una con 20 000 se lee completa.
4. **RNF-05:** un valor más largo que su columna rechaza el archivo con el mensaje existente, en lugar del error general.
5. Los archivos de `pruebas/fixtures/odoo/` se siguen leyendo igual.

## Pruebas obligatorias
- Vitest, con nombres que empiecen por `ASVS V5.2.3:` y `RNF-05:`. Genera los archivos maliciosos dentro de la prueba, en memoria (por ejemplo, con `zlib.deflateRawSync` de un búfer de ceros), sin agregar archivos grandes al repositorio.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
```

## Fuera de alcance
- Cambiar los textos o el resumen de la carga.

## Notas
- La revisión que encontró la brecha comprobó que un archivo de 1,9 MB hace que SheetJS ocupe 200 MB (`plan/seguridad/asvs-nivel-2.md`, V5.2.3).
