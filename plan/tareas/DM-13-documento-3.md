---
id: DM-13
titulo: Documento 3, manual de usuario de la administración del sitio
persona: daniela
responsable: Daniela Marín
hito: entrega
prioridad: P1
estado: hecha
depende_de: [DM-11, CE-04]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# DM-13 · Documento 3, manual de usuario de la administración del sitio

**Responsable:** Daniela Marín · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** DM-11, CE-04

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

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
3. Capturas con Playwright de la aplicación con la semilla de demostración. Las pantallas que cambia JG-28 (banners del sitio, barras laterales de Industrias y Productos, y textos que venían del prototipo) se capturan cuando JG-28 esté integrada en `develop`, a más tardar el 03/11 a las 10:00. Mientras, redacta el texto.
4. Armar el `.docx` (se guarda en la carpeta local y en el Drive del equipo).

## Archivos que creas o modificas
- `entregable-3/documento-3/**` (crear)

## Criterios de aceptación
1. Los 17 apartados están completos, con capturas reales del sistema implementado.
2. Una persona de INCOVSA puede seguir el manual sin ayuda (se comprueba en la capacitación, JG-21, antes del 12/11).

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-3
```

## Resultado

- Se creó `entregable-3/documento-3/` con los 17 apartados, sus procedimientos, advertencias y 19 capturas reales de la aplicación con la semilla de demostración. Incluye las instrucciones de acceso restringido de Google Drive basadas en P-92.
- El archivo `Documento 3 - Manual de usuario de la administracion del sitio v1.0.docx` se generó en `entregable-3/` y se subió a `Proyecto INCOVSA/Documentación Tecnica` en el Drive compartido del equipo. El documento tiene 29 páginas y fue renderizado e inspeccionado visualmente.
- La portada usa `entregable-3/equipo.local.json`, archivo local ignorado por Git. No se versionan nombres/carnés en ese JSON ni el DOCX/PDF.
- Para regenerar el DOCX, ejecutar el comando de Verificación desde la raíz del repositorio. Los índices automáticos se desactivaron porque el generador deja sus campos vacíos fuera de Word; se comprobó que la versión final no tenga páginas de índice en blanco.
- La capacitación JG-21 queda como comprobación de uso con personal, tal como está programada; los ajustes que surjan se incorporarán a la versión 1.1.

## Notas
- La portada del documento lee los nombres y carnés de `entregable-3/equipo.local.json`, que no se sube al repositorio (tiene datos personales). Si no existe en tu equipo, pídele a Jordin una copia de `entregable-2/equipo.local.json` y guárdala con ese nombre en `entregable-3/`.
- Los `.docx` y `.pdf` no se suben al repositorio (`.gitignore`): se guardan en la carpeta local y en el Drive del equipo.
