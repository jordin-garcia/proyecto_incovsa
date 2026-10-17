---
id: DM-13
titulo: Documento 3, manual de usuario de la administración del sitio
persona: daniela
responsable: Daniela Marín
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [DM-11, CE-04, JG-17]
programada: 2026-10-31
requisitos: []
pantallas: []
---

# DM-13 · Documento 3, manual de usuario de la administración del sitio

**Responsable:** Daniela Marín · **Hito:** entrega · **Prioridad:** P1 · **Programada:** sáb 31/10 · **Depende de:** DM-11, CE-04, JG-17

## Objetivo
Redactar el **Documento 3** para el personal de INCOVSA que administra el contenido, con los 17 apartados de los lineamientos, capturas reales y lenguaje no técnico.

## Contexto que debes leer
- `specs/17` (Documento 3: 17 apartados) y los lineamientos del docente
- `specs/05` y `specs/03` (cómo funciona el panel, los permisos y la documentación interna)
- `specs/19`: P-92 (cómo compartir los archivos en Google Drive)
- `entregable-2/LEEME.md` y `entregable-2/herramientas/` (cómo se arma un documento)

## Qué hacer
1. Crear `entregable-3/documento-3/` con `documento.json` y un `.md` por apartado, en el formato de `entregable-2/herramientas/armar_documento.py`. Cada procedimiento con objetivo, requisitos previos, pasos numerados, capturas, resultado esperado y advertencias.
2. Apartados: acceso (acceso personal en tres pasos); recuperación de contraseña (la restablecen Gerencia o Soporte); conociendo el panel; información institucional; historia, misión, visión y valores; imágenes (galerías de hasta 5, formatos y tamaño); industrias; productos informativos; información de contacto; noticias; documentos internos; cargar fichas técnicas, hojas de seguridad y certificados (enlaces de Google Drive y **cómo compartirlos en Drive** para que solo vean quienes deben, P-92); acceso al contenido restringido (permisos y usuarios del sitio); cerrar sesión; problemas frecuentes.
3. Capturas con Playwright de la aplicación con la semilla de demostración.
4. Armar el `.docx` (se guarda en la carpeta local y en el Drive del equipo).

## Archivos que creas o modificas
- `entregable-3/documento-3/**` (crear)

## Criterios de aceptación
1. Los 17 apartados están completos, con capturas reales del sistema implementado.
2. Una persona de INCOVSA puede seguir el manual sin ayuda (se comprueba el 03/11, JG-21).

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-3
```

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.
