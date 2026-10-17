---
id: JG-22
titulo: Presentación del Entregable 3 (04/11)
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-19]
programada: 2026-11-03
requisitos: []
pantallas: []
---

# JG-22 · Presentación del Entregable 3 (04/11)

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** JG-19

## Objetivo
Preparar la presentación en clase del miércoles 04/11: el **guion de la demostración del flujo completo** en producción y las diapositivas.

## Contexto que debes leer
- `specs/17` §"Qué exige cada entregable" (Entregable 3: demostración obligatoria del flujo completo)
- `plan/calendario.md` §"Guion de la demostración del 04/11"
- `## Resultado` de JG-14 y JG-19

## Qué hacer
1. Completar el guion del 04/11 en `entregable-3/presentacion/guion.md`: quién presenta cada parte, en qué orden, con qué usuario y qué datos, y qué decir de la exclusión del inventario (aprobada por el docente).
2. Preparar las diapositivas. **Antes de empezarlas, pregúntale a Jordin el formato** (PowerPoint, Google Slides u otro): no se asume.
3. Ensayar el guion en producción con Playwright y dejar capturas de respaldo por si falla la conexión.

## Archivos que creas o modificas
- `entregable-3/presentacion/**` (crear)

## Criterios de aceptación
1. El guion recorre el flujo pedido facturado → conversión → picking → preparación → carga → despacho → estado → reporte, más el sitio y el panel.
2. Las diapositivas están en el formato que pidió Jordin.
3. Hay capturas de respaldo de cada paso.
