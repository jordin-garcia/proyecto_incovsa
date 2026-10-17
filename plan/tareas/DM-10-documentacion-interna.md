---
id: DM-10
titulo: Documentación interna con enlaces de Google Drive
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: pendiente
depende_de: [DM-04]
programada: 2026-10-23
requisitos: [RF-SW-10, RF-SW-14, RF-SW-21, RF-SW-25, RN-19, RN-41, RN-55, CU-10, CU-15]
pantallas: [panel.js › documentos, idDrive, esDrive, vistaPrevia, descarga]
---

# DM-10 · Documentación interna con enlaces de Google Drive

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 23/10 · **Depende de:** DM-04

## Objetivo
El área protegida de **documentación interna**: los productos documentados con los enlaces de Google Drive de su ficha técnica, hoja de seguridad y certificado de análisis, y la ventana que muestra **solo las opciones que permiten los permisos** del usuario.

## Contexto que debes leer
- `specs/05` §"Documentación interna" **completo** (campos, tabla, ventana y reglas)
- `specs/04`: RF-SW-10, RF-SW-14, RF-SW-21; `specs/12`: RN-19, RN-41, RN-55
- `specs/16`: "Entradas y archivos" (enlaces de Google Drive) y decisión 21; `specs/19`: P-92
- `specs/03` (permisos `sit.doc.ver`, `sit.doc.descargar` y `sit.doc.gestionar`)
- Prototipo: `#/panel/documentos?cuenta=ejemplo.08`, con `ejemplo.09` (ver y descargar) y `ejemplo.10` (solo ver); `panel.js` › `documentos()`, `idDrive()`, `esDrive()`, `vistaPrevia()` y `descarga()`
- `## Resultado` de DM-04

## Qué hacer
1. `src/modulos/documentos/`: crear, editar, eliminar y buscar productos documentados.
   - **Crear o editar** (`sit.doc.gestionar`): nombre del producto (texto), país de origen (lista de todos los países, obligatorio), **lote** (obligatorio, letras y números, RN-41) y los enlaces de FT, HS y COA (opcionales). Cada enlace escrito debe ser `https://drive.google.com/…` o `https://docs.google.com/…`; el servidor extrae el identificador del archivo y guarda el enlace. El trío (nombre, país, lote) no se repite.
   - **Eliminar** con confirmación. La bitácora registra "Creación de producto documentado", "Edición de producto documentado" y "Eliminación de producto documentado" (los nombres del prototipo).
2. `/panel/documentos`: tabla con Producto, País de origen, Lote, Creado (fecha y usuario) y Acciones (solo editar con el lápiz y eliminar con el basurero, solo con `sit.doc.gestionar`); **búsqueda** por lote, nombre y país; sin columnas Documento ni Tipo ni filtro por tipo.
3. **Ventana del producto** (clic en la fila): sus documentos, con **solo** las opciones que permiten los permisos:
   - `sit.doc.ver` → **Ver**: la vista previa de Google Drive (`https://drive.google.com/file/d/<id>/preview`) dentro de la ventana;
   - `sit.doc.descargar` → **Descargar** (`https://drive.google.com/uc?export=download&id=<id>`).
   El servidor arma esas direcciones y **solo las envía** a quien tiene el permiso; nunca se inserta en la página una dirección que no sea de Google Drive.
4. Un usuario sin sesión o sin ningún permiso de documentación no entra (pantalla de sin acceso).

## Archivos que creas o modificas
- `src/modulos/documentos/**` (crear)
- `src/app/panel/documentos/**`, `src/componentes/panel/**` (crear)
- `pruebas-e2e/panel/documentos.spec.ts` (crear)

## Criterios de aceptación
1. **RN-41 / RF-SW-14** (CP-56): sin lote, o con un enlace que no es de Google Drive, no se guarda y se indica el motivo; un lote con letras y números se acepta.
2. **RF-SW-21 / RN-19** (CP-57): `ejemplo.10` (solo ver) ve la vista previa y **ninguna** opción de descargar; `ejemplo.09` ve las dos; la respuesta del servidor a `ejemplo.10` no contiene la dirección de descarga.
3. Sin `sit.doc.gestionar`, crear, editar o eliminar se rechazan en el servidor y no aparecen las acciones.
4. La búsqueda encuentra por lote, nombre y país.
5. La CSP de JG-11 permite la vista previa de Drive en el marco.
6. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración con permisos (criterios 1 a 4)
- `pruebas-e2e/panel/documentos.spec.ts` (criterios 2, 5 y 6)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/panel/documentos.spec.ts
```

## Fuera de alcance
- Cómo comparte INCOVSA los archivos en su Google Drive (P-92): se explica en el Documento 3.
