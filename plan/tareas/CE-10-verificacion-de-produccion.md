---
id: CE-10
titulo: Verificación de producción después del primer despliegue
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-19]
programada: 2026-11-02
requisitos: [RNF-09, RNF-12, RNF-16]
pantallas: []
---

# CE-10 · Verificación de producción después del primer despliegue

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** lun 02/11 · **Depende de:** JG-19

## Objetivo
Comprobar, el mismo 02/11, que la aplicación en producción funciona completa, segura y con respaldos, y dejar la evidencia para el Documento 5.

## Contexto que debes leer
- `## Resultado` de CE-05 a CE-08 y JG-19
- `plan/calendario.md` §"Guion de la demostración del 04/11"

## Qué hacer
1. Recorrer en https://incovsa.com, con Playwright, el sitio público, el acceso personal, el panel y el flujo del picking con una cuenta de prueba creada para eso (y eliminada al terminar).
2. Comprobar el certificado HTTPS, las cabeceras de seguridad, la redirección de HTTP a HTTPS y que PostgreSQL no es accesible desde fuera.
3. Ejecutar un respaldo manual y una **restauración de prueba** en una base aparte en el VPS (Documento 5 §15), con evidencia.
4. Dejar el informe en `plan/produccion/2026-11-02.md`.

## Archivos que creas o modificas
- `plan/produccion/2026-11-02.md` (crear)

## Criterios de aceptación
1. Todo el recorrido funciona en producción.
2. El respaldo y la restauración de prueba quedan documentados con su resultado.
3. Ningún dato de prueba queda en producción.
