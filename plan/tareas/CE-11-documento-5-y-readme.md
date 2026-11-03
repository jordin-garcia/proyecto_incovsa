---
id: CE-11
titulo: Documento 5 (instalación, despliegue y mantenimiento) y README final
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [CE-07]
programada: 2026-11-03
requisitos: [RNF-07, RNF-09]
pantallas: []
---

# CE-11 · Documento 5 (instalación, despliegue y mantenimiento) y README final

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** CE-07

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
El **Documento 5** con los 19 apartados de los lineamientos, para que un tercero pueda volver a poner el sistema en funcionamiento, y el **README final** del repositorio con sus 16 secciones completas.

## Contexto que debes leer
- `specs/17` (Documento 5: 19 apartados, con al menos una prueba de restauración; README: 16 secciones)
- `specs/16` §"Despliegue" y "Seguridad"; `plan/instalacion.md`
- `## Resultado` de CE-05 a CE-07 y la guía de `evidencia/CE-08/`; `README.md`. CE-08, JG-19 y CE-10 se hacen después del 04/11

## Qué hacer
1. Crear `entregable-3/documento-5/` con `documento.json` y un `.md` por apartado: requisitos (software, versiones, cuentas y servicios), obtención del código, dependencias (comandos reales), variables de entorno (todas, con valores de ejemplo), base de datos, migraciones, ejecución en desarrollo, compilación, **despliegue** completo y reproducible (VPS, Docker Compose, Caddy, despliegue automático), dominio y HTTPS, almacenamiento (R2), servicios externos, **creación del primer administrador** (`npm run crear-admin`), respaldo (base de datos, imágenes en R2, documentos en el Drive de INCOVSA, configuración), **restauración** (con la prueba de restauración de CE-07), actualización del sistema y de las dependencias (incluida la revisión manual de SheetJS), mantenimiento preventivo y diagnóstico de errores comunes.
2. **Versión 1.0:** lo que solo existe en producción (IP, dominio real, certificado, buckets de R2 y la verificación de CE-10) se escribe como procedimiento, con esos datos marcados para completarse al desplegar. CE-15 los completa en la versión 1.1.
3. Completar las secciones *pendientes* del `README.md` (instalación, configuración, variables de entorno, base de datos, ejecución, pruebas y despliegue) con los comandos reales.
4. Armar el `.docx` (carpeta local y Drive).

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
