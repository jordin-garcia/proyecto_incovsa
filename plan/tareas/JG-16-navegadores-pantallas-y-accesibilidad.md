---
id: JG-16
titulo: Pruebas en navegadores, tamaños de pantalla y accesibilidad
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
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

## Resultado

Todas las pruebas de `pruebas-e2e/` corren en Chromium, Firefox y WebKit, en teléfono, tableta, escritorio y TV (solo el tablero). En la matriz de GitHub Actions ([41028328780](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/41028328780)) pasan **1 499 de 1 500 casos**. El único fallo es de Facturación en Firefox, en el teléfono, y queda en **JC-11** (José Daniel, 01/11). El informe por navegador y tamaño, que es la evidencia del Documento 6 §6 y §7, está en `plan/pruebas/matriz-2026-10-30.md`.

### Qué se hizo

- **`playwright.config.ts`:** la variable `NAVEGADOR` elige `chromium` (por defecto), `firefox` o `webkit`. Los cuatro proyectos (`telefono`, `tableta`, `escritorio`, `tv`) conservan su nombre en los tres navegadores, porque varias pruebas separan sus datos por proyecto. Firefox no admite `isMobile`: el teléfono y la tableta conservan la pantalla táctil.
- **`.github/workflows/matriz-navegadores.yml`:** 12 combinaciones, cada una con su propia base PostgreSQL 18 vacía, y un trabajo `resumen` que junta los reportes JSON con `scripts/resumen-matriz.mjs` en una tabla del resumen de la ejecución. Falla si una combinación falla, si no deja resultado o si Playwright reporta errores fuera de las pruebas. Corre a mano y en los PR que cambian el flujo, `playwright.config.ts` o el script. Pruebas en `scripts/matriz-navegadores.test.mjs`.
- **HTTPS de prueba para WebKit** (decisión del coordinador del 30/10): WebKit no guarda en `http://localhost` las cookies `Secure` y `__Secure-` de producción. `pruebas-e2e/flujo/servidor-produccion.ts` pone delante del servidor de producción, solo con WebKit, un proxy HTTPS con un certificado autofirmado que genera `openssl` en cada arranque. La aplicación no cambia.
- **Funciones comunes en `pruebas-e2e/comunes/`**, que ya usan todas las pruebas:
  - `navegacion.ts`: `irA` y `recargar`;
  - `tactil.ts`: `arrastrarConDedo`;
  - `avisos.ts`: `anotarAvisos` y `avisosMostrados`;
  - `archivos.ts`: `imagenWebp`.
- **Correcciones de pruebas** para Firefox y WebKit: esperas de hidratación, del cierre de la confirmación y de la preferencia de movimiento reducido; Shift+Tab en `enfocarConTab`; tolerancias de subpíxel; filtro de consola de hidratación restringido a error o aviso. El detalle, con la causa de cada una, está en el informe. Ninguna quita comprobaciones ni omite pruebas.
- **axe:** todas las páginas ya lo tenían en su estado principal. `pruebas-e2e/comunes/accesibilidad.spec.ts` lo agrega en el paso de la contraseña de Administración del sitio, Reportes con el periodo por defecto y Facturación al entrar. Ninguna página tiene violaciones serias ni críticas.
- **RNF-17:** `sitio/rendimiento-galerias.spec.ts` (DM-11) pasa en los tres navegadores y en los cuatro tamaños.
- **Registro:** `specs/16`, decisión 46; `specs/18`, "Matriz de navegadores y tamaños"; y `plan/convenciones.md` §6.

### Cómo usarlo

- **Una prueba en otro navegador:** `npx playwright install firefox webkit` una vez, y luego `NAVEGADOR=firefox npm run e2e -- <archivos> --workers=1` (o `webkit`). Sin `NAVEGADOR`, `npm run e2e` usa Chromium, como antes.
- **La matriz completa:** `gh workflow run matriz-navegadores.yml --ref develop` (unos 20 minutos). La tabla queda en el resumen de la ejecución, y los reportes y las capturas en sus artefactos. JG-19 la repite antes del primer despliegue, y JG-18 usa el informe para el Documento 6.
- **Pruebas nuevas:** usa `irA`/`recargar` en lugar de `page.goto`/`page.reload` y `arrastrarConDedo` en lugar de CDP, y espera la hidratación antes de escribir (`plan/convenciones.md` §6).
- **Si Google Fonts no responde desde GitHub, la compilación falla.** Es una falla de red de GitHub, no de la aplicación. Se repite la combinación con `gh run rerun <id> --failed`.
