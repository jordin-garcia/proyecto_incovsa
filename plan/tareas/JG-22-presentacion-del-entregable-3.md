---
id: JG-22
titulo: Presentación previa con otro docente (09/11)
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [JG-30]
programada: 2026-11-08
requisitos: []
pantallas: []
---

# JG-22 · Presentación previa con otro docente (09/11)

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** dom 08/11 · **Depende de:** JG-30

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** el 04/11 ya no hay presentación en clase: ese día se entrega la documentación y hay una prueba individual. Esta tarea prepara la **presentación previa del lunes 09/11** con otro docente, que vale 10 puntos **individuales**.

## Objetivo
Preparar la presentación del 09/11: 8 minutos por grupo, sin mostrar código, con la **demostración del flujo completo** y preguntas del docente a cada integrante.

## Contexto que debes leer
- `specs/17` §"Qué exige cada entregable" (las tres fechas de la fase final y lo que se evalúa en cada una)
- `plan/calendario.md` §"Guion de las presentaciones del 09/11 y del 12/11"
- `## Resultado` de JG-14 y, si ya está hecho, de JG-19
- `plan/guia-de-estudio-entregable-3.md` (JG-29), para las preguntas del docente

## Qué hacer
1. Escribir el guion en `entregable-3/presentacion/guion-09-11.md`, con la estructura que pidió el Ing. Manuel Rojas y quién del equipo dice cada parte:
   1. problema y contexto (1 minuto): qué empresa se atendió, qué necesidad tiene y por qué es importante;
   2. solución propuesta (1 minuto): qué se desarrolló y cómo responde a esa necesidad;
   3. arquitectura y tecnologías (1 minuto): arquitectura general, tecnologías principales y decisiones relevantes, **sin mostrar código**;
   4. demostración (3 minutos): el flujo pedido facturado → conversión → picking → preparación → carga → despacho → estado → reporte, con su usuario y sus datos en cada paso, y qué decir de la exclusión del inventario (aprobada por el docente, P-58);
   5. valor para la empresa (1 minuto): qué mejora, qué procesos facilita y qué beneficio aporta;
   6. cierre (1 minuto): resultados y aprendizajes.
2. **Dónde se demuestra:** en producción si JG-19 ya está hecha; si no, en local, con la imagen de producción (`docker compose`) y la semilla de demostración. Dejarlo escrito en el guion.
3. Preparar las diapositivas, simples y visuales, sin texto para leer completo. **Antes de empezarlas, pregúntale a Jordin el formato** (PowerPoint, Google Slides u otro): no se asume.
4. Ensayar la demostración con Playwright en el entorno elegido, medir que quepa en 3 minutos y dejar capturas de respaldo de cada paso por si falla la conexión.

## Archivos que creas o modificas
- `entregable-3/presentacion/**` (crear)

## Criterios de aceptación
1. El guion tiene las seis partes con su tiempo y dura 8 minutos en total.
2. La demostración recorre el flujo pedido facturado → conversión → picking → preparación → carga → despacho → estado → reporte, más el sitio y el panel.
3. Las diapositivas están en el formato que pidió Jordin y no muestran código.
4. Hay capturas de respaldo de cada paso de la demostración.

## Fuera de alcance
- La presentación a la empresa del 12/11 (JG-31).
