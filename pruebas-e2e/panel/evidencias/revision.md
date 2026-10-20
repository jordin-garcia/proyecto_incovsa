# Revisión independiente de DM-04 · 20/10/2026

Revisor en contexto limpio, distinto del agente que escribió el código, con `plan/prompts/revision.md` como instrucción.

Se revisaron almacenamiento, autorización, validación, transacción con bitácora, limpieza de imágenes, contrato público, formularios y pruebas. Se conservan las lecturas públicas integradas de DM-02. La usuaria autorizó verificar Inquiserca en la base y el contrato público, y dejar su comprobación visual en Quiénes somos para DM-06.

```text
REVISIÓN DM-04
CORRECCIÓN (obligatorio corregir):
Ninguno.
OPCIONAL (no bloquea):
Ninguno.
VEREDICTO: LISTO
```

La revisión anterior del avance encontró que un arrastre vacío podía eliminar un logotipo; se corrigió y se conserva su prueba automatizada. Las notas amarillas P-xx no se trasladan a la aplicación, conforme a specs/20.

## Correcciones de la revisión del PR

Un segundo revisor en contexto limpio comprobó la separación entre borrador y estado publicado, los recuadros de los iconos del resumen y el aislamiento reversible de las pruebas. Verificó que se conserva el mismo candado de DM-02, que se restauran las filas originales y que solo se eliminan las imágenes locales nuevas. No encontró hallazgos obligatorios ni opcionales: **LISTO**.

La segunda revisión del bot confirmó esas tres correcciones y señaló el campo de logotipos. Se contuvo la vista y se separó del aviso inferior de 13 px, fondo blanco translúcido y radio de 10 px. La prueba detectó primero el aviso de 15 px y después un solapamiento de 2 px; ambos se corrigieron. La revisión independiente de `CampoGaleria`, estilos y pruebas no encontró hallazgos estáticos: **LISTO**. Las capturas y las pruebas de límites y no solapamiento completan su comprobación visual.
