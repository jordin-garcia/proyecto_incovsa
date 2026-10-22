---
id: JG-11
titulo: Controles automáticos de seguridad y calidad
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
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

## Resultado

Se incorporaron cabeceras con CSP y nonce por respuesta, protección contra marcos externos, `nosniff`, política de referencia y HSTS en producción. Google Maps y la vista previa de Drive conservan sus rutas autorizadas; las imágenes externas se limitan al origen HTTPS configurado en `URL_IMAGENES`. Las páginas se renderizan por petición para aplicar el nonce. Las pruebas reales del navegador cubren respuestas normales, errores, redirecciones, recursos, marcos autorizados y bloqueo de scripts y marcos ajenos.

Los nuevos trabajos son `semgrep`, `secretos`, `cadena-suministro`, `workflows`, `integridad-pruebas` y `mutacion`. Las reglas propias revisan todos los módulos con `"use server"` y todos los `src/app/**/route.ts`; conservan las excepciones específicas de autenticación y del almacenamiento público local de la decisión 78. Se agregaron llamadas explícitas a los permisos existentes en las acciones de Envíos, las de Usuarios y la publicación multipart de Catálogo e Industrias. No se crearon permisos ni reglas de negocio. Las pruebas negativas de GitHub se cerraron sin integrar: [#106](https://github.com/jordin-garcia/proyecto_incovsa/pull/106), [#107](https://github.com/jordin-garcia/proyecto_incovsa/pull/107) y [#108](https://github.com/jordin-garcia/proyecto_incovsa/pull/108).

La primera ejecución completa válida de Stryker obtuvo **60,634081902245704 %** sobre 15 archivos y 1519 mutantes. El piso queda en **60**, escrito en `stryker.config.mjs`, y nunca se reduce. Se conserva el resumen y la referencia al informe en `plan/evidencias/JG-11/mutacion-base.json`. El adaptador de Vitest 5 corrige únicamente la selección de pruebas anidadas del runner oficial de Stryker 10; conserva los ID y la cobertura, y rechaza corridas sin pruebas ejecutadas. Una regresión ejecuta ambos programas reales. Los cinco esquemas inválidos generados por mutación mantienen su clasificación oficial, verificada independientemente.

### Cómo usar los controles

- Ejecutar `npm ci` para instalar las tres dependencias de desarrollo autorizadas. Las herramientas de análisis de CI están fijadas por versión y SHA-256 en `scripts/instalar-controles.sh`.
- Ejecutar `npm run test:mutacion` para mutar los cuatro módulos completos. Con `BASE_MUTACION=<referencia-git>` se mutan completos solo los archivos cambiados del alcance; si no cambió ninguno, informa que la evaluación completa corresponde a la noche. La CI usa esa modalidad en PR y la completa a las 02:00 de Guatemala. Los informes quedan en `reports/mutation/` y como artefacto de GitHub.
- Ejecutar `node scripts/integridad-pruebas.mjs <base> [<cabeza>]` para comprobar que no se borraron ni redujeron pruebas, se agregaron exclusiones o se bajaron umbrales. La CI ejecuta la versión de la base para evitar que el PR altere su propio control.
- Ejecutar `node scripts/cadena-suministro.mjs --solo-origenes` antes de instalar dependencias. El control completo también ejecuta lockfile-lint; OSV y el aviso de cambios de dependencias se ejecutan en CI. Solo se admite npm oficial y el archivo de SheetJS aprobado de `vendor/`, verificado por integridad.
- Instalar gitleaks según `plan/instalacion.md` §2 para revisar los archivos preparados en cada commit. Si falta, husky avisa y la CI mantiene el control obligatorio. Las excepciones de `.gitleaks.toml` son valores ficticios exactos limitados por archivo.
- Consultar `plan/evidencias/JG-11/verificacion.md` para las pruebas, la revisión y los enlaces a las ejecuciones. `protecciones.json` registra la comprobación de los checks obligatorios de `develop` y `main`.

Durante B7 se corrigió la precondición de hidratación de Reportes con el mismo atributo de diagnóstico usado por Catálogo. Se separaron las auditorías de pestañas de su caso extenso conservando todas las aserciones, axe, capturas y límites; no se cambiaron textos ni estilos de la aplicación. Se agregó integración real de las acciones autorizadas de Envíos con persistencia y avisos por sede.

Después de incorporar JM-04 se ajustaron las pruebas de Bodega a su respuesta optimista: esperan la confirmación del POST y vuelven a comprobar persistencia tras recargar. Las pruebas de tiempo real usan el artefacto de producción de JG-10, con ambas pantallas y el contexto táctil en el mismo servidor; mantienen los 2 segundos, las aserciones y todos los escenarios. Se debe ejecutar `npm run build` antes de esas pruebas.

### Verificación de cierre

- `npm run verificar`: formato, lint, tipos y 347 pruebas aprobadas en 40 archivos.
- `npm run build`: standalone aprobado, con compilación y tipos correctos.
- Navegador: batería completa de 276 casos; tras corregir las precondiciones, 54 casos afectados aprobados en los tres tamaños, sin omisiones. La combinación por archivo, título y proyecto comprueba los 276 casos; no se presenta como una sola ejecución sin fallos. Las mediciones de marcado remoto de Bodega fueron 943, 827 y 790 ms, menores de 2 segundos. Resumen en `navegador-completo.json` y `navegador-final.json`.
- Semgrep: 77 reglas, 196 archivos y cero hallazgos; 18 regresiones del escáner real aprobadas. Comprobadores de integridad, cadena de suministro y workflows: 51 casos aprobados. gitleaks: historial completo sin secretos; actionlint aprobado; lockfile-lint, OSV y npm audit aprobados sin vulnerabilidades.
- Mutación completa: ejecución aprobada [39737245993](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39737245993), puntaje 60,63 %, piso 60. Los PR negativos y sus rechazos están enlazados en la evidencia.
- Protecciones: 14 checks obligatorios y modo estricto en `develop` y `main`, comprobados de nuevo por la revisión independiente. Se conserva la regla exclusiva del coordinador.
