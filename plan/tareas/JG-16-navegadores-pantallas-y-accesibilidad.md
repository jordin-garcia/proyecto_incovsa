---
id: JG-16
titulo: Pruebas en navegadores, tamaños de pantalla y accesibilidad
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-14]
programada: 2026-10-29
requisitos: [RNF-01, RNF-02, RNF-08, RNF-11, RNF-14, RNF-17, RF-SW-08]
pantallas: []
---

# JG-16 · Pruebas en navegadores, tamaños de pantalla y accesibilidad

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** jue 29/10 · **Depende de:** JG-14

## Objetivo
Correr todas las pruebas de extremo a extremo en **Chromium, Firefox y WebKit** y en los tamaños de teléfono, tableta, escritorio y TV, con accesibilidad (axe), para la evidencia del Documento 6 §6 (responsive) y §7 (compatibilidad) (specs/16, decisión 46).

## Contexto que debes leer
- `specs/15`: RNF-01, RNF-02, RNF-08, RNF-11 (navegadores, P-38), RNF-14 y RNF-17
- `plan/convenciones.md` §6 y §7
- `specs/17` (Documento 6)

## Qué hacer
1. Configurar Playwright para correr todas las pruebas de `pruebas-e2e/` en Chromium, Firefox y WebKit, y en los proyectos `telefono`, `tableta`, `escritorio` y (solo el tablero) `tv`.
2. Correr la matriz completa en GitHub Actions (`.github/workflows/matriz-navegadores.yml`, ejecución manual) y guardar el reporte como artefacto.
3. Agregar axe a cada página que todavía no lo tenga, y comprobar que no hay violaciones serias ni críticas.
4. Comprobar RNF-17: la carga inicial de Inicio con galerías de 5 imágenes no tarda más que con galerías de una (prueba de DM-11).
5. Por cada fallo, crear la tarea de corrección para el dueño de la pantalla (P1) o corregirlo (§E1).
6. Escribir `plan/pruebas/matriz-<fecha>.md` con el resultado por navegador y tamaño (evidencia del Documento 6).

## Archivos que creas o modificas
- `playwright.config.ts` (modificar), `.github/workflows/matriz-navegadores.yml` (crear)
- `plan/pruebas/matriz-<fecha>.md` (crear)

## Criterios de aceptación
1. Todas las pruebas de `pruebas-e2e/` pasan en los tres navegadores y en todos los tamaños, o cada fallo tiene su tarea de corrección con fecha antes del 02/11.
2. Ninguna página tiene violaciones de accesibilidad serias ni críticas.
3. El informe tiene el resultado por navegador y tamaño.

## Verificación
```
npm run e2e
gh workflow run matriz-navegadores.yml --ref develop
```

## Fuera de alcance
- Los navegadores exactos de la empresa siguen pendientes (P-38); si INCOVSA los confirma, se agregan a esta matriz.
