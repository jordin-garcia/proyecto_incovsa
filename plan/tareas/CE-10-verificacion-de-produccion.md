---
id: CE-10
titulo: Verificación de producción después del primer despliegue
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-19]
programada: 2026-11-07
requisitos: [RNF-09, RNF-12, RNF-16]
pantallas: []
---

# CE-10 · Verificación de producción después del primer despliegue

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** sáb 07/11 · **Depende de:** JG-19

## Objetivo
Comprobar, el mismo día del primer despliegue (JG-19), que la aplicación en producción funciona completa, segura y con respaldos, y dejar la evidencia para el Documento 5.

## Contexto que debes leer
- `## Resultado` de CE-05 a CE-08 y JG-19
- `plan/calendario.md` §"Guion de las presentaciones del 09/11 y del 12/11"

## Qué hacer
1. Recorrer en https://incovsa.com, con Playwright, el sitio público, el acceso personal, el panel y el flujo del picking con una cuenta de prueba creada para eso (y eliminada al terminar).
2. Comprobar el certificado HTTPS, las cabeceras de seguridad, la redirección de HTTP a HTTPS y que PostgreSQL no es accesible desde fuera.
3. Ejecutar un respaldo manual y una **restauración de prueba** en una base aparte en el VPS (Documento 5 §15), con evidencia.
4. Dejar el informe en `plan/produccion/<AAAA-MM-DD del despliegue>.md`.

## Archivos que creas o modificas
- `plan/produccion/<AAAA-MM-DD del despliegue>.md` (crear)

## Criterios de aceptación
1. Todo el recorrido funciona en producción.
2. El respaldo y la restauración de prueba quedan documentados con su resultado.
3. Ningún dato de prueba queda en producción.
