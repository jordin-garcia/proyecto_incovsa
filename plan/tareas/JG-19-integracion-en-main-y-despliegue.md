---
id: JG-19
titulo: Integración de develop en main y primer despliegue a producción
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-17, CE-06, CE-07, CE-08, JC-10, JG-26, DM-14, CE-14, JM-10, JG-27]
programada: 2026-11-02
requisitos: [RNF-12]
pantallas: []
---

# JG-19 · Integración de develop en main y primer despliegue a producción

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** JG-17, CE-06, CE-07, CE-08, JC-10, JG-26, DM-14, CE-14, JM-10, JG-27

## Objetivo
El lunes 02/11, con el desarrollo completo, integrar `develop` en `main`, lo que dispara el **primer despliegue automático** a producción (specs/16, decisiones 31 y 75), y verificar con Carlos que la aplicación funciona en `incovsa.com` con HTTPS.

## Contexto que debes leer
- `specs/16` "Despliegue" y decisiones 27 a 34, 37 y 75
- `## Resultado` de CE-05, CE-06, CE-07 y CE-08
- `plan/convergencia/2026-10-30.md`

## Qué hacer
1. Confirmar que `develop` tiene todas las verificaciones en verde, que el recorrido diario del día pasó y que no quedan tareas del hito E3 pendientes.
2. Abrir el PR `[JG-19] Versión 1.0: integración de develop en main` de `develop` a `main` e integrarlo (solo el coordinador; integración de tipo *merge*, para conservar la historia).
3. Seguir el despliegue automático (`gh run watch`): imagen en GHCR, migraciones y reinicio en el VPS.
4. En el VPS, crear el administrador inicial con `npm run crear-admin` dentro del contenedor (P-08: la persona que indique INCOVSA). Si P-08 no está resuelto, detente y pregúntale a Jordin.
5. Crear la etiqueta `v1.0-final` sobre el *commit* de `main` desplegado.
6. Con CE-10, verificar producción.

## Archivos que creas o modificas
- Ninguno de código. El archivo de esta tarea y la bitácora (en un PR a `develop`).

## Criterios de aceptación
1. `main` tiene todo `develop`, y el despliegue automático terminó sin errores.
2. https://incovsa.com responde con HTTPS válido y las cabeceras de seguridad.
3. El administrador inicial existe y entra a los dos sistemas.
4. La etiqueta `v1.0-final` existe.

## Verificación
```
gh run list --branch main --limit 3
curl -sI https://incovsa.com
```

## Fuera de alcance
- La carga del contenido oficial (DM-12) y la verificación detallada de producción (CE-10).
