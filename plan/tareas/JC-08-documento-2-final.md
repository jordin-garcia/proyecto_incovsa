---
id: JC-08
titulo: Documento 2, nueva versión para el Entregable 3
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JC-07, JG-17]
programada: 2026-10-31
requisitos: []
pantallas: []
---

# JC-08 · Documento 2, nueva versión para el Entregable 3

**Responsable:** José Daniel Cifuentes · **Hito:** entrega · **Prioridad:** P1 · **Programada:** sáb 31/10 · **Depende de:** JC-07, JG-17

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
3. Armar el `.docx` con `entregable-2/herramientas/` (se guarda en la carpeta local y en el Drive del equipo, no en el repositorio).

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
