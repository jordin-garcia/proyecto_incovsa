---
id: JG-29
titulo: Guía de estudio para la prueba individual del 04/11
persona: jordin
responsable: Jordin García
hito: entrega
prioridad: P1
estado: pendiente
depende_de: []
programada: 2026-11-03
requisitos: []
pantallas: []
---

# JG-29 · Guía de estudio para la prueba individual del 04/11

**Responsable:** Jordin García · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** —

> **Replanificación del 02/11 (JG-32):** se integra el **03/11 a mediodía**, para que el equipo estudie esa tarde y esa noche.

## Objetivo
Una guía corta para que cada integrante del equipo prepare la **prueba individual de conocimientos** del 04/11, que puede preguntar sobre la problemática, la solución, la arquitectura, las tecnologías, la base de datos, la seguridad, el despliegue, el funcionamiento y los módulos principales. También sirve para las preguntas individuales de la presentación del 09/11.

## Contexto que debes leer
- `specs/00` y `specs/01` (problema, alcance y exclusiones), `specs/03` (roles y permisos), `specs/12` (reglas de negocio, en especial la conversión RN-01)
- `specs/14` (modelo de datos), `specs/16` (arquitectura, stack, seguridad, despliegue y decisiones principales), `specs/17` (lo que exige el curso)
- `specs/05` a `specs/11` (qué hace cada módulo)

## Qué hacer
1. Escribir `plan/guia-de-estudio-entregable-3.md`, en lenguaje claro, con estos temas:
   1. problemática de INCOVSA y por qué importa;
   2. solución: los dos sistemas (sitio autoadministrable y control logístico de bodega) y cómo responden a la necesidad;
   3. arquitectura general y por qué se eligió (una sola aplicación Next.js, PostgreSQL, Docker, Caddy, VPS);
   4. tecnologías principales y para qué se usa cada una;
   5. base de datos: entidades principales y relaciones;
   6. seguridad: autenticación, permisos por usuario y sede, validación, cabeceras, contraseñas y bitácora;
   7. despliegue, respaldos y restauración;
   8. funcionamiento: el flujo pedido facturado → conversión → picking → preparación → carga → despacho → estado → reporte, y la conversión de kg a unidades con un ejemplo;
   9. módulos principales de cada sistema;
   10. exclusiones aprobadas (inventario, P-58) y por qué.
2. Al final, de 20 a 30 preguntas de práctica con su respuesta corta.
3. Todo sale de `specs/` y del código: no se inventa nada. Sin credenciales ni datos personales.

## Archivos que creas o modificas
- `plan/guia-de-estudio-entregable-3.md` (crear)

## Criterios de aceptación
1. La guía cubre los diez temas, cada uno con lo esencial en pocas líneas y la referencia a `specs/`.
2. Tiene entre 20 y 30 preguntas de práctica con su respuesta.
3. Ningún dato de la guía contradice `specs/`.

## Verificación
```
node scripts/tareas.mjs --validar
```

## Fuera de alcance
- Las diapositivas y el guion de las presentaciones (JG-22 y JG-31).
