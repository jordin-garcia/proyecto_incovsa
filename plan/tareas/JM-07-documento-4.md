---
id: JM-07
titulo: Documento 4, manual de usuario del sistema logístico
persona: josue
responsable: Josué Menéndez
hito: entrega
prioridad: P1
estado: pendiente
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
