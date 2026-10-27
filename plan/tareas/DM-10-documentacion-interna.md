---
id: DM-10
titulo: Documentación interna con enlaces de Google Drive
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
depende_de: [DM-04]
programada: 2026-10-27
requisitos: [RF-SW-10, RF-SW-14, RF-SW-21, RF-SW-25, RN-19, RN-41, RN-55, CU-10, CU-15]
pantallas: [panel.js › documentos, idDrive, esDrive, vistaPrevia, descarga]
---

# DM-10 · Documentación interna con enlaces de Google Drive

**Responsable:** Daniela Marín (vuelve a ella el 26/10; del 22 al 26/10 la tuvo Carlos Hugo Escobar) · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** DM-04

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

## Notas
- **Vuelve a Daniela el 26/10 (decisión de Jordin, JG-13).** El 22/10 (JG-12) se había reasignado a Carlos, que no llegó a empezarla: no hay rama ni PR suyos. Conserva su fecha (23/10): queda atrasada, así que Daniela la hace antes de DM-11, que depende de ella.
- La tarjeta «Documentación interna» del Resumen del panel ya existe (DM-04) y cuenta los productos documentados.

## Resultado

Implementado el 26/10/2026. `/panel/documentos` permite buscar por lote, producto y país; crear, editar y eliminar con confirmación los productos documentados; y abrir sus FT, HS y COA según los permisos efectivos de la sesión.

- **Servidor:** `src/modulos/documentos/servicio.ts`, `esquemas.ts` y `acciones.ts`. Cada operación exige el permiso correspondiente y valida su entrada con Zod. La gestión usa `sit.doc.gestionar`; la lectura admite cualquiera de los tres permisos. Los países proceden de la lista completa de la base. El sitio no usa la restricción de sedes del picking (`specs/03`). Las escrituras y la bitácora se confirman en una transacción.
- **Drive:** `idDrive()` valida origen HTTPS exacto y extrae un identificador válido. El servidor genera las direcciones de vista previa y descarga, y omite cada dirección sin su permiso. Solo quien gestiona recibe los enlaces originales editables. No se suben PDF ni se requieren credenciales de Google. P-92 continúa pendiente para la configuración de compartición de INCOVSA.
- **Duplicados:** comparación normalizada como el prototipo, sin distinguir acentos, mayúsculas ni espacios exteriores. Las altas y ediciones usan un bloqueo transaccional de PostgreSQL para que las escrituras simultáneas no creen duplicados equivalentes, sin modificar el esquema.
- **Interfaz:** componentes existentes del panel y estilos locales del prototipo. La tabla conserva sus cinco columnas y solo muestra acciones con permiso de gestión. La ventana limita Ver y Descargar y carga Drive dentro del marco. Se conserva el aviso verde de protección en Drive, sin la frase sobre el producto de simulación excluido por `specs/20`.
- **Cómo reutilizar:** `leerDocumentos(sesion, busqueda?)` devuelve productos, documentos con direcciones condicionadas por permiso y países solo para gestión. `guardar(entrada)` y `eliminar({ id })` obtienen la sesión real y revalidan el panel y su Resumen. El contrato y los comandos están en `src/modulos/documentos/README.md`.
- **Verificación:** plan válido; formato, lint, tipos y **426 pruebas en 52 archivos** aprobados; compilación aprobada. **Seis E2E propios** aprobados en los tres tamaños con axe, respuesta del servidor sin descarga para la cuenta de solo lectura y carga efectiva del iframe bajo la CSP real. Suite general inicial: 384 aprobados, cuatro fallos de tiempo real y ocho sin ejecutar; con el artefacto recién compilado, se repitieron íntegros los 18 casos de esos dos archivos: 17 aprobados directamente y uno intermitente aprobado al reintentar. Quedan cubiertos los 396 casos, sin fallos pendientes ni pruebas modificadas de otras tareas. Design system y gitleaks aprobados; next-devtools sin errores.
- **Revisión:** independiente según `plan/prompts/revision.md`, veredicto final **LISTO**. Se corrigieron duplicados normalizados/concurrentes y la comprobación efectiva de CSP/iframe, con pruebas de regresión. No se agregaron dependencias, migraciones ni cambios a archivos protegidos. `.codex/config.toml` se conserva fuera de los commits.
- **Evidencia:** [57 capturas y registro de revisión y pruebas](../../pruebas-e2e/panel/evidencias/DM-10/README.md), con aplicación y prototipo en 390, 768 y 1440 px. Las capturas y latencias ajenas regeneradas por la suite se restauraron.
