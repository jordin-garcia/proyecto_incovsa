---
id: JM-07
titulo: Documento 4, manual de usuario del sistema logístico
persona: josue
responsable: Josué Menéndez
hito: entrega
prioridad: P1
estado: hecha
depende_de: [JM-06, JC-07, CE-03]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# JM-07 · Documento 4, manual de usuario del sistema logístico

**Responsable:** Josué Menéndez · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** JM-06, JC-07, CE-03

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
Redactar el **Documento 4** para el personal de INCOVSA, con los 22 apartados de los lineamientos, capturas reales del sistema y lenguaje no técnico.

## Contexto que debes leer
- `specs/17` (Documento 4: 22 apartados) y los lineamientos del docente
- `specs/06` a `specs/11` (cómo funciona cada módulo) y `specs/03` (accesos y permisos)
- `entregable-2/LEEME.md` y `entregable-2/herramientas/` (cómo se arma un documento)

## Qué hacer
1. Crear `entregable-3/documento-4/` con `documento.json` y un `.md` por apartado, en el formato de `entregable-2/herramientas/armar_documento.py`. Cada procedimiento con objetivo, requisitos previos, pasos numerados, capturas, resultado esperado y advertencias.
2. Apartados de los lineamientos, adaptados al sistema real: acceso; panel principal; productos, presentaciones y equivalencias (el producto y el Peso de Conversión llegan en el archivo de Odoo); consulta de inventario, registro de entradas y de salidas (**no aplica**: el inventario lo lleva Odoo, exclusión aprobada por el docente); pedidos pendientes (tablero de Facturación); generación del picking (opciones de envío y envío a Bodega); interpretación de kg y unidades; preparación; actualización de estado; tablero; registro de carga (envío por camión, control de peso); asignación de productos al vehículo; despacho; rutas realizadas; historial (bitácora); reportes; usuarios y roles (Configuración); problemas frecuentes.
3. Capturas con Playwright de la aplicación con la semilla de demostración y el archivo anonimizado, en escritorio y, para Ruta, en teléfono. Las pantallas que cambia JG-28 (textos que venían del prototipo, como los códigos P-xx de Facturación) se capturan cuando JG-28 esté integrada en `develop`, a más tardar el 03/11 a las 10:00. Mientras, redacta el texto.
4. Armar el `.docx` (se guarda en la carpeta local y en el Drive del equipo).

## Archivos que creas o modificas
- `entregable-3/documento-4/**` (crear)

## Criterios de aceptación
1. Los 22 apartados están, cada uno con su procedimiento completo o con la justificación de "no aplica".
2. Cada procedimiento tiene capturas reales del sistema implementado.
3. El lenguaje es comprensible para el personal de bodega, facturación y pilotos.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-4
```

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Resultado

Se redactó y compiló el **Documento 4: Manual de usuario del sistema logístico (picking)** en `entregable-3/documento-4/`, dando cumplimiento estricto a los 22 apartados requeridos por los lineamientos del curso y adaptados a la realidad operativa de INCOVSA y `develop`:

1. **22 apartados estructurados y redactados:** cada uno en formato Markdown con objetivo, requisitos previos, pasos numerados, resultado esperado, advertencias y capturas reales del sistema. Los apartados 5, 6 y 7 justifican detalladamente por qué la consulta de existencias y los registros de entradas y salidas no aplican en el sistema de picking al ser administrados centralmente en Odoo (exclusión P-58 aprobada formalmente por el docente).
2. **23 figuras con capturas reales:** se incorporaron las pantallas de acceso en tres pasos, tablero principal de picking, resumen de carga de Odoo, tablero de pedidos facturados, opciones de envío por camión y recolección, confirmaciones modulares, tarjetas de preparación en bodega con lotes y agrupaciones (RN-51), detalle de ruta, alistamiento físico completo, tablero en pantalla completa en modo oscuro para televisores industriales, control de capacidad vehicular y prevención de sobrepeso, pantalla de rutas para pilotos en teléfonos móviles con reordenamiento de paradas (RN-29), confirmación de entrega en ruta, indicadores cuantitativos y reporte consolidado por producto en Despacho, histórico de rutas realizadas, bitácora de auditoría inmutable, configuración de camiones y usuarios, y gestión de incidencias.
3. **Compilación validada:** el documento compila limpiamente mediante `python entregable-2/herramientas/armar_documento.py entregable-3/documento-4`, generando `Documento 4 - Manual de usuario del sistema logistico v1.0.docx` con portada institucional, tabla de control de versiones v1.0, índices automáticos y numeración formal.

### Archivos creados o modificados
- `entregable-3/documento-4/documento.json`: configuración y orden de secciones del manual.
- `entregable-3/documento-4/01-acceso.md` a `22-problemas-frecuentes.md`: las 22 secciones del manual.
- `entregable-3/documento-4/figuras/*.png`: 23 capturas reales de la aplicación.
- `plan/tareas/JM-07-documento-4.md`: tarea marcada como hecha con resultado y evidencias.
- `plan/bitacora/josue.md`: entrada de bitácora correspondiente a la finalización de la tarea.

### Cómo usar lo creado
Para compilar el documento en formato `.docx`:
```bash
python entregable-2/herramientas/armar_documento.py entregable-3/documento-4
```
El archivo resultante se genera en `entregable-3/Documento 4 - Manual de usuario del sistema logistico v1.0.docx` y puede abrirse en Microsoft Word para actualizar campos de índices o exportar a `.pdf`.


Lo integró el coordinador (protocolo §E4) el 03/11/2026 desde el PR #165 de Josué, sin cambiar su contenido. La revisión automática de su último commit no se completó por una falla del bot, que se corrigió en JG-08 (#169 y #170), y la rama iba atrasada respecto de `develop`. La rama `jordin/JM-07-documento-4` integra `develop` y se revisa con el bot corregido.

**Correcciones del coordinador (03/11/2026), por la revisión automática de #171:** el PDF de Reportes es A4 horizontal y sin fecha de emisión, y la Bitácora también se exporta (`specs/10`); el modo oscuro del tablero usa grises para el lote y el cuadro de «PEDIDO», con los botones «Modo claro», «Modo oscuro», «Pantalla completa» y «Volver al módulo» (`specs/07`); un camión solo está protegido si está elegido en «Envío por camión»; el resumen de la carga y los mensajes de bodega son los de la aplicación; y se quitaron procesos de INCOVSA que `specs/` no recoge (compras, báscula, notas de crédito). También se corrigieron el texto del medidor de peso, la ubicación de «Cancelar», la forma de nombrar los permisos, el detalle de la carga en la bitácora (apartado 19) y los mensajes de error de la carga.
