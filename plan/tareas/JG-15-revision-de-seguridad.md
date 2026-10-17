---
id: JG-15
titulo: Revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-11, JG-14]
programada: 2026-10-28
requisitos: [RNF-03, RNF-04, RNF-05, RNF-15, RNF-16]
pantallas: []
---

# JG-15 · Revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 28/10 · **Depende de:** JG-11, JG-14

## Objetivo
Verificar la aplicación contra la meta de seguridad del proyecto, **OWASP ASVS 5.0 nivel 2** (specs/16, decisión 66), y correr una prueba básica con **OWASP ZAP**, dejando la evidencia que pide el Documento 6 §8 (pruebas de seguridad básicas).

## Contexto que debes leer
- `specs/16` "Seguridad" completa y decisiones 59 y 66; `specs/15` RNF-03 a RNF-05, RNF-15 y RNF-16
- `entregable-2/documento-2/05-seguridad.md`
- OWASP ASVS 5.0 (capítulos aplicables: autenticación, sesiones, control de acceso, validación, archivos, configuración, registros)

## Qué hacer
1. `plan/seguridad/asvs-nivel-2.md`: una fila por requisito aplicable de ASVS 5.0 nivel 2, con "cumple", "no cumple" o "no aplica", la evidencia (archivo, prueba o captura) y, si no cumple, la tarea de corrección.
2. Revisar a mano, con subagentes en contexto limpio, cada acción del servidor y cada ruta de la API: `exigirPermiso`, Zod, filtro por sede, respuestas mínimas.
3. **OWASP ZAP** (escaneo básico) en GitHub Actions contra la aplicación compilada y levantada con la semilla de demostración (`.github/workflows/zap.yml`, ejecución manual); revisar cada alerta y registrar la decisión.
4. Revisar los avisos de seguridad vigentes de todas las dependencias (`gh api "/advisories?ecosystem=npm&affects=<paquete>"`) y de SheetJS (https://cdn.sheetjs.com/advisories), y actualizar lo que haga falta (decisión 59).
5. Crear las tareas de corrección necesarias, con prioridad P1.

## Archivos que creas o modificas
- `plan/seguridad/asvs-nivel-2.md`, `plan/seguridad/zap-<fecha>.md` (crear)
- `.github/workflows/zap.yml` (crear)
- Tareas nuevas de corrección, si hacen falta

## Criterios de aceptación
1. Cada requisito aplicable de ASVS 5.0 nivel 2 tiene su estado y evidencia, y cada "no cumple" tiene una tarea con fecha antes del 02/11.
2. ZAP no reporta alertas altas sin una tarea de corrección o una justificación escrita.
3. Ninguna dependencia tiene avisos altos o críticos sin corregir.

## Pruebas obligatorias
- Las que agreguen las tareas de corrección.

## Verificación
```
gh workflow run zap.yml --ref develop
npm audit --audit-level=high
```

## Fuera de alcance
- La prueba de restauración del respaldo (CE-07).
