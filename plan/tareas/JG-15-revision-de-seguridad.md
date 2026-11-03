---
id: JG-15
titulo: Revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
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

## Resultado

La aplicación se revisó contra los 253 requisitos de los niveles 1 y 2 de OWASP ASVS 5.0.0 y con un escaneo básico de OWASP ZAP. **112 se cumplen, 86 no aplican y 55 no se cumplen.** Cada uno de los 55 tiene su tarea, P1 y con fecha antes del 02/11. ZAP no reportó alertas altas, y ninguna dependencia tiene avisos.

### Qué se hizo

- **`plan/seguridad/asvs-nivel-2.md`:** una fila por requisito, con estado, evidencia (`archivo:línea` y la prueba) y tarea. Cuatro subagentes en contexto limpio evaluaron un grupo de capítulos cada uno. El informe también trae la revisión manual de las operaciones del servidor, la revisión de las dependencias y las tareas de corrección.
- **Revisión manual (paso 2):** otros dos subagentes revisaron una por una 82 operaciones del servidor: 44 del picking y 38 del sitio y el panel, entre acciones del servidor, rutas de la API y páginas que leen datos. Todas llaman a `exigirPermiso` (o a `exigirAccesoTotal`), validan con Zod y filtran por la sede de la sesión. No hay ningún acceso a datos de otra sede. Hubo cinco hallazgos (R-P01 a R-P03, R-S01 y R-S02).
- **`.github/workflows/zap.yml`:** compila la aplicación y la levanta con el servidor de producción *standalone*, sobre PostgreSQL 18 con la semilla de demostración. Corre `zap-baseline.py` de ZAP 2.17.0, con la imagen oficial fijada por su huella, y falla si hay alertas altas. Se ejecuta a mano y en los PR que cambian el flujo. La revisión de cada alerta está en **`plan/seguridad/zap-2026-10-29.md`**: 1 media (justificada, la CSP de estilos de JG-11), 5 bajas (tres se corrigen en JG-26 y dos quedan justificadas) y 10 informativas.
- **Dependencias:** se consultaron los avisos de GitHub para la versión instalada de las 47 dependencias directas, y no hay ninguno. `npm audit` no encuentra vulnerabilidades en los 806 paquetes. SheetJS 0.20.3 es la última versión y no está afectada por sus dos CVE. No hizo falta actualizar nada.

### Decisiones del coordinador (29/10/2026)

- **P-98 se resuelve:** Contacto acepta 5 solicitudes por hora por IP y tiene un campo trampa (`specs/05`).
- **Contraseñas:** reautenticación al restablecer la contraseña de una cuenta de acceso total, y rechazo de las contraseñas fáciles de adivinar con una lista local (`specs/03`).
- **Topes:** 10 000 caracteres en los textos largos del panel (`specs/05`); límites del .xlsx descomprimido, de filas y de columnas (`specs/06`).
- **Riesgos aceptados:** las funciones nuevas que `specs/` no tiene (MFA, cambio de la contraseña propia, gestión de sesiones) y todos los cambios de la infraestructura del VPS. Se documentan en JG-27.
- Todo queda registrado en `specs/18` › "Revisión de seguridad con ASVS 5.0 y ZAP (29/10/2026, JG-15)". P-98 sale de `specs/19`.

### Tareas de corrección

| Tarea | Dueño | Fecha | Lo principal |
|---|---|---|---|
| JC-10 | José Daniel | 30/10 | **Alta:** el .xlsx se descomprime sin tope y puede tumbar el servidor (V5.2.3) |
| JG-26 | Jordin | 30/10 | **Media:** la exportación de reportes usa la primera sede (R-P01); cookies `__Host-`, CSP, nonce, scrypt, sesiones, registros, imagen de Docker y la columna `ip` para DM-14 |
| DM-14 | Daniela | 30/10 | **Media:** límite y campo trampa de Contacto (P-98); topes del panel; mensajes de Zod |
| CE-14 | Carlos | 31/10 | **Media:** reautenticación (V7.5.1); contraseñas fáciles de adivinar; mensajes de Zod; `charset` y TRACE en Caddy |
| JM-10 | Josué | 30/10 | **Baja:** identificadores repetidos al reordenar líneas (R-P02) |
| JG-27 | Jordin | 31/10 | Documentación de seguridad de `specs/16` y riesgos aceptados |

**JG-19** (integración en `main` y primer despliegue, 02/11) espera a las seis. No se agregaron a JG-17 porque la correrían al 31/10 junto con CE-09, que depende de ella.

### Cómo usar lo que se creó

- **Repetir ZAP:** `gh workflow run zap.yml --ref develop`. El resumen de alertas sale en la página de la ejecución, y el informe HTML, en el artefacto `zap-<id>`. Repetirlo después de JG-26 y DM-14, y en producción con HTTPS en JG-19.
- **Documento 6 §8 (JG-18):** usa `asvs-nivel-2.md` (resumen por capítulo) y `zap-2026-10-29.md` como evidencia de las pruebas de seguridad.
- **Al corregir:** cada tarea de corrección actualiza su fila de `asvs-nivel-2.md` a "Cumple", con la evidencia.

### Verificación

- `gh workflow run zap.yml --ref develop`: no se puede ejecutar a mano antes de integrar el flujo en `develop` (GitHub solo lo permite desde la rama por omisión). Corrió en el PR #148 y aprobó sin alertas altas: [40986033558](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/40986033558).
- `npm audit --audit-level=high`: `found 0 vulnerabilities`.
