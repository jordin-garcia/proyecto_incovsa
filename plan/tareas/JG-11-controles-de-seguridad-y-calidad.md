---
id: JG-11
titulo: Controles automáticos de seguridad y calidad
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-08]
programada: 2026-10-20
requisitos: [RNF-05, RNF-10, RNF-12, RNF-16]
pantallas: []
---

# JG-11 · Controles automáticos de seguridad y calidad

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 20/10 · **Depende de:** JG-08

## Objetivo
Agregar las verificaciones automáticas de seguridad y calidad de specs/16 (decisión 66) y las cabeceras de seguridad de la aplicación (RNF-16), para que ningún PR que las incumpla llegue a `develop`.

## Contexto que debes leer
- `specs/16`: "Seguridad" completa y decisiones 11, 21, 29, 59, 66 y 80
- `specs/15`: RNF-05, RNF-10, RNF-12, RNF-16
- `plan/convenciones.md` §4.2, §6 y §9
- `## Resultado` de JG-02, JG-07 y JG-08
- Context7: Next.js 16 (`headers()` en `next.config.ts`, CSP), Semgrep (reglas propias en YAML), StrykerJS con Vitest, lockfile-lint, OSV-Scanner, gitleaks, actionlint

## Qué hacer
1. **Cabeceras de seguridad** (RNF-16) en `next.config.ts`: `Content-Security-Policy` que permita solo lo propio, las imágenes de `URL_IMAGENES` (R2), los mapas insertados de Google Maps y la vista previa de Google Drive en marcos (`specs/05`); `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `frame-ancestors 'none'`; `Strict-Transport-Security` en producción. Prueba de Playwright que comprueba las cabeceras.
2. **Semgrep** (trabajo `semgrep`), con reglas propias en `.semgrep/`:
   - toda función exportada de un archivo con `"use server"` en `src/modulos/**/acciones.ts` y todo `route.ts` de `src/app/api/` llama a `exigirPermiso` (salvo las rutas de Better Auth y la acción del paso del usuario del acceso personal, que tienen su propio control);
   - prohibidos `$queryRawUnsafe`, `$executeRawUnsafe`, `dangerouslySetInnerHTML` y `eval`;
   - además, el conjunto de reglas público de seguridad para TypeScript y Next.js.
3. **gitleaks** (trabajo `secretos` en la CI) y en el gancho `pre-commit` de husky si gitleaks está instalado (si no, avisa sin bloquear). Agrega su instalación a `plan/instalacion.md` §2.
4. **Dependencias** (trabajo `cadena-suministro`): `lockfile-lint` (solo el registro de npm y el archivo de `vendor/`), OSV-Scanner sobre `package-lock.json` y un aviso en el PR cuando cambia una dependencia.
5. **Workflows** (trabajo `workflows`): `actionlint` y una comprobación de que todas las acciones están fijadas por SHA.
6. **Integridad de las pruebas** (trabajo `integridad-pruebas`): falla si un PR borra archivos de prueba, reduce el número de pruebas, agrega `.skip` u `.only`, o baja un umbral.
7. **StrykerJS** con Vitest sobre `src/modulos/conversion`, `src/modulos/permisos`, `src/modulos/envios` y `src/modulos/bodega`: script `npm run test:mutacion`; en los PR, solo sobre los archivos cambiados; cada noche, completo. El umbral mínimo es el puntaje de la primera ejecución completa, redondeado hacia abajo a múltiplo de 5, y nunca baja.
8. Agregar los trabajos nuevos a las verificaciones obligatorias de `develop` y `main`.

## Archivos que creas o modificas
- `next.config.ts` (cabeceras) (modificar)
- `.semgrep/**`, `.github/workflows/seguridad.yml`, `.github/workflows/mutacion.yml`, `stryker.config.*` (crear)
- `scripts/integridad-pruebas.mjs` y su prueba (crear)
- `.husky/pre-commit`, `package.json` (StrykerJS y el script `test:mutacion`), `plan/instalacion.md` (modificar)
- `pruebas-e2e/seguridad/cabeceras.spec.ts` (crear)

## Criterios de aceptación
1. **RNF-16:** todas las respuestas tienen las cabeceras del paso 1; un marco de otro sitio no puede insertar la aplicación; la CSP no bloquea los mapas ni la vista previa de Drive.
2. Un PR de prueba con una acción del servidor sin `exigirPermiso`, o con `dangerouslySetInnerHTML`, falla en `semgrep`.
3. Un PR con un secreto de prueba falla en `secretos`; uno con una dependencia de otro registro falla en `cadena-suministro`.
4. Un PR que agrega `.only` o borra una prueba falla en `integridad-pruebas`.
5. `npm run test:mutacion` corre y reporta el puntaje; el umbral queda escrito en la configuración.
6. Las verificaciones nuevas son obligatorias en `develop` y `main`.

## Pruebas obligatorias
- `scripts/integridad-pruebas.test.mjs`
- `pruebas-e2e/seguridad/cabeceras.spec.ts`
- PR de prueba para los criterios 2 a 4 (se cierran sin integrar)

## Verificación
```
npm run verificar
npm run build
npm run test:mutacion
gh pr checks --watch
```

## Fuera de alcance
- La revisión de ASVS y OWASP ZAP (JG-15).

## Notas
- Si una regla de Semgrep encuentra problemas en código ya integrado, crea una tarea de corrección para su dueño (protocolo §C) o corrígelo tú (§E1).
