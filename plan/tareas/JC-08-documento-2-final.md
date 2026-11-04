---
id: JC-08
titulo: Documento 2, nueva versión para el Entregable 3
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: entrega
prioridad: P1
estado: hecha
depende_de: [JC-07]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# JC-08 · Documento 2, nueva versión para el Entregable 3

**Responsable:** José Daniel Cifuentes · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** JC-07

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
Crear la versión final del **Documento 2, Documentación técnica del sistema**, con las 28 secciones de los lineamientos y todo actualizado al sistema implementado. La v0.4 ya no se edita (specs/16, decisión 72; P-96).

## Contexto que debes leer
- `specs/17` (Documento 2: 28 secciones, incluido el procedimiento obligatorio para extender el sistema con un ejemplo real)
- `entregable-2/documento-2/**` (v0.4, como punto de partida), `entregable-2/LEEME.md` y `entregable-2/herramientas/`
- `specs/14`, `specs/16` completos; `prisma/schema.prisma`; `src/modulos/**`; `.github/workflows/**`; `Dockerfile` y `docker-compose.yml`
- `## Resultado` de todas las tareas del hito E3

## Qué hacer
1. Crear `entregable-3/documento-2/` copiando la estructura de `entregable-2/documento-2/` y actualizar **cada** sección al sistema real: arquitectura, componentes, **despliegue** (Docker Compose, Caddy, VPS, GitHub Actions), clases, secuencias, modelo entidad-relación y diccionario de datos (regenerados desde `prisma/schema.prisma`), tecnologías y versiones exactas, dependencias, estructura del repositorio, variables de entorno, configuración de desarrollo y de producción, migraciones, autenticación, roles y permisos, conversión, inventario (excluido), picking y despacho, archivos, errores, servicios externos, respaldos, **procedimiento para agregar funcionalidades con un ejemplo real del proyecto**, convenciones y problemas conocidos.
2. Actualizar los diagramas con las herramientas de `entregable-2/diagramas/` (copiadas a `entregable-3/diagramas/` si hace falta).
3. La sección de seguridad parte de `entregable-2/documento-2/05-seguridad.md`, `specs/16` › "Seguridad" y la revisión de JG-15 (`plan/seguridad/`). JG-27 se hace después del 04/11. El despliegue se describe como está diseñado (CE-05 a CE-07): el primer despliegue (JG-19) es posterior.
4. Armar el `.docx` con `entregable-2/herramientas/` (se guarda en la carpeta local y en el Drive del equipo, no en el repositorio).

## Archivos que creas o modificas
- `entregable-3/documento-2/**`, `entregable-3/diagramas/**`, `entregable-3/figuras/**` (crear)

## Criterios de aceptación
1. Las 28 secciones están completas y describen el sistema implementado (nada de "se completa en el Entregable 3").
2. El diccionario de datos coincide con `prisma/schema.prisma` y las versiones con `package-lock.json`.
3. El procedimiento para extender el sistema usa un ejemplo real del proyecto.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
```

## Fuera de alcance
- Los demás documentos.

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.

## Resultado

- Creada la versión 1.0 en `entregable-3/documento-2/`, con las 28 secciones técnicas actualizadas al código de `develop` del 03/11/2026. La v0.4 no se modificó.
- Diccionario y siete vistas ER regenerados desde `prisma/schema.prisma`: 32 tablas y 240 columnas, con tipos, precisión, claves, nulabilidad, relaciones e índices. Las versiones directas se contrastan con `package-lock.json`.
- Actualizados arquitectura, componentes, clases, cinco secuencias y despliegue: 16 figuras. Se documentan Docker Compose, Caddy, GHCR/Actions, configuración, migraciones, sesiones, permisos, SSE, conversión, Odoo, reportes, archivos, errores, respaldos y limitaciones. Se distinguen el despliegue diseñado y los controles actuales de los pendientes CE-08, CE-14 y JG-27.
- El procedimiento de extensión sigue la funcionalidad real de JC-07, desde el filtro y la consulta autorizada hasta la generación de XLSX/PDF, la descarga y sus pruebas.
- Armado obligatorio aprobado con `python entregable-2/herramientas/armar_documento.py entregable-3/documento-2`. El armador local de esta versión ajusta columnas, figuras y estilos sin cambiar la herramienta compartida. Word/PDF locales: 106 páginas, 56 tablas de contenido y tres índices completos. Los nombres y carnés aportados por José Daniel se guardan únicamente en el archivo local excluido de Git.
- Verificación: criterios documentales 3/3, incluidas alteraciones negativas de tipo/nulabilidad; `npm run verificar` (509 pruebas en 57 archivos), `npm run build`, plan válido (82 tareas), inspección estructural y visual de todas las páginas. Revisión independiente LISTO después de reforzar la prueba del diccionario. E2E completa local exenta por decisión 90; la CI se conserva íntegra.
- No se añadieron dependencias, cambios de esquema, requisitos ni comportamiento. Evidencia resumida en `entregable-3/documento-2/VERIFICACION.md`. José Daniel confirmó que hará personalmente la subida a Drive. Se preparó `entregable-3/para-subir-JC-08/` con únicamente el Word y el PDF finales; no se afirma una subida por el agente.

### Cómo regenerarlo

Desde la raíz, con Python 3, python-docx y Pillow:

```
python entregable-3/diagramas/generar_figuras.py
python entregable-3/documento-2/verificar_documento.py
python entregable-2/herramientas/armar_documento.py entregable-3/documento-2
python entregable-3/documento-2/armar_version_final.py
```

`entregable-3/documento-2/README.md` explica la portada, la revisión y la actualización de los campos de índices. Los DOCX/PDF se generan en `entregable-3/` y nunca se versionan. JG-30 puede compilar las fuentes integradas con su archivo `equipo.local.json` y usar el documento para armar la entrega académica.
