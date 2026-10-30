---
id: JG-27
titulo: Documentación de seguridad y riesgos aceptados
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-15]
programada: 2026-10-31
requisitos: [RNF-03, RNF-04, RNF-05, RNF-15, RNF-16]
pantallas: []
---

# JG-27 · Documentación de seguridad y riesgos aceptados

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 31/10 · **Depende de:** JG-15

## Objetivo
Cerrar las brechas documentales de ASVS 5.0 nivel 2 que encontró JG-15. Además, dejar por escrito en `specs/16` cada riesgo que el coordinador aceptó el 29/10/2026, con su justificación y los controles que lo compensan. Es la base de la sección de seguridad del Documento 6 (JG-18).

## Contexto que debes leer
- `plan/seguridad/asvs-nivel-2.md`: todas las filas cuya tarea es JG-27
- `specs/18-historial-de-decisiones.md` › "Revisión de seguridad con ASVS 5.0 y ZAP (29/10/2026, JG-15)"
- `specs/16` "Seguridad", "Despliegue" y "Servicios externos"; `specs/03`; `entregable-2/documento-2/05-seguridad.md`

## Qué hacer
1. **Documentar en `specs/16`**, en una sección nueva "Seguridad: verificación ASVS":
   - límites de la lógica de negocio por usuario y globales (V2.1.3);
   - tipos, extensiones y tamaños de archivo permitidos, incluido el tamaño descomprimido del .xlsx (V5.1.1);
   - por qué el límite de intentos no permite bloquear cuentas a propósito sin dejar rastro, y sus límites (V6.1.1);
   - palabras de la empresa que se rechazan en las contraseñas (V6.1.2);
   - todas las vías de autenticación (la acción `ingresar` y `POST /api/auth/<sistema>/sign-in/username`) y sus controles (V6.1.3 y V6.3.4);
   - expiración por inactividad y su justificación frente a NIST SP 800-63B, y cuántas sesiones simultáneas se permiten (V7.1.1 y V7.1.2);
   - política de gestión de claves e inventario criptográfico: secretos de Better Auth, PostgreSQL, R2, rclone, scrypt, TLS de Caddy (V11.1.1 y V11.1.2);
   - comunicaciones completas, incluidas Google Maps, Google Drive, la CA de Caddy, GHCR y Docker Hub (V13.1.1);
   - clasificación de los datos sensibles y requisitos por nivel (V14.1.1 y V14.1.2);
   - plazos de corrección de dependencias vulnerables según su severidad (V15.1.1);
   - funciones costosas y sus defensas (V15.1.3);
   - inventario de registros: qué se registra, dónde, quién lo lee y cuánto se guarda (V16.1.1).
2. **Riesgos aceptados**, cada uno con su justificación y los controles que lo compensan:
   - MFA, cambio de la contraseña propia, contraseñas filtradas y contraseña inicial que obliga a cambiarla;
   - sesiones: vida máxima absoluta, cierre por un administrador, ver y cerrar las propias;
   - TLS interno, cuentas de PostgreSQL, contraseña de ejemplo, lista blanca de salida, gestor de secretos y registros remotos;
   - retención de solicitudes e IP;
   - límites de conexiones de tiempo real y de exportaciones.
3. **Actualizar `plan/seguridad/asvs-nivel-2.md`:** los requisitos documentales pasan a "Cumple", con la sección de `specs/16` como evidencia. Los riesgos aceptados siguen como "No cumple", con el enlace a su justificación.
4. **Revisar `entregable-2/documento-2/05-seguridad.md`** y avisar a José Daniel (JC-08) de lo que cambia para el Documento 2.

## Archivos que creas o modificas
- `specs/16-arquitectura-y-tecnologia.md`, `specs/18-historial-de-decisiones.md` (modificar)
- `plan/seguridad/asvs-nivel-2.md` (modificar)

## Criterios de aceptación
1. Cada requisito documental de ASVS con tarea JG-27 tiene en `specs/16` la información que pide, y en `asvs-nivel-2.md` queda "Cumple" con la sección como evidencia.
2. Cada riesgo aceptado tiene en `specs/16` su justificación y sus controles compensatorios, y `asvs-nivel-2.md` lo enlaza.

## Verificación
Además de los comandos generales del protocolo (B6):
```
node scripts/tareas.mjs --validar
npm run formato
```

## Fuera de alcance
- Implementar los riesgos aceptados.
