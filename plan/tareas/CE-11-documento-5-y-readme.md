---
id: CE-11
titulo: Documento 5 (instalación, despliegue y mantenimiento) y README final
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [CE-10]
programada: 2026-11-02
requisitos: [RNF-07, RNF-09]
pantallas: []
---

# CE-11 · Documento 5 (instalación, despliegue y mantenimiento) y README final

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** CE-10

## Objetivo
El **Documento 5** con los 19 apartados de los lineamientos, para que un tercero pueda volver a poner el sistema en funcionamiento, y el **README final** del repositorio con sus 16 secciones completas.

## Contexto que debes leer
- `specs/17` (Documento 5: 19 apartados, con al menos una prueba de restauración; README: 16 secciones)
- `specs/16` §"Despliegue" y "Seguridad"; `plan/instalacion.md`
- `## Resultado` de CE-05 a CE-08, CE-10 y JG-19; `README.md`

## Qué hacer
1. Crear `entregable-3/documento-5/` con `documento.json` y un `.md` por apartado: requisitos (software, versiones, cuentas y servicios), obtención del código, dependencias (comandos reales), variables de entorno (todas, con valores de ejemplo), base de datos, migraciones, ejecución en desarrollo, compilación, **despliegue** completo y reproducible (VPS, Docker Compose, Caddy, despliegue automático), dominio y HTTPS, almacenamiento (R2), servicios externos, **creación del primer administrador** (`npm run crear-admin`), respaldo (base de datos, imágenes en R2, documentos en el Drive de INCOVSA, configuración), **restauración** (con la prueba documentada de CE-10), actualización del sistema y de las dependencias (incluida la revisión manual de SheetJS), mantenimiento preventivo y diagnóstico de errores comunes.
2. Completar las secciones *pendientes* del `README.md` (instalación, configuración, variables de entorno, base de datos, ejecución, pruebas y despliegue) con los comandos reales.
3. Armar el `.docx` (carpeta local y Drive).

## Archivos que creas o modificas
- `entregable-3/documento-5/**` (crear), `README.md` (modificar)

## Criterios de aceptación
1. Siguiendo solo el Documento 5, una persona puede instalar el sistema en un equipo nuevo y desplegarlo en un VPS nuevo.
2. Los 19 apartados están completos, con comandos reales y sin credenciales.
3. El README tiene las 16 secciones completas, sin *pendientes*.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-5
```

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.
