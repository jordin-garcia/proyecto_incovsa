---
id: JG-02
titulo: Proyecto base de Next.js, dependencias y calidad local
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: [JG-01, JG-08]
programada: 2026-10-17
requisitos: [RNF-07, RNF-10, RNF-16]
pantallas: []
---

# JG-02 · Proyecto base de Next.js, dependencias y calidad local

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-01, JG-08

## Objetivo
Crear la aplicación vacía con el stack de `specs/16`, **todas** las dependencias del proyecto ya instaladas (así nadie más toca `package.json`), la estructura de carpetas de `plan/convenciones.md` §1, las herramientas de calidad locales y los scripts de `npm` que usa todo el plan. Es la base de todas las demás tareas.

## Contexto que debes leer
- `specs/16-arquitectura-y-tecnologia.md`: "Stack", "Seguridad" (Entradas y archivos, Secretos y dependencias), "Estructura de carpetas" y las decisiones 1, 6, 15, 27, 46 a 51, 58, 59, 85 y 86
- `plan/convenciones.md` §1, §3, §4.4 y §6
- `AGENTS.md` (tabla de comandos: los nombres de los scripts de `npm` son un contrato)
- Context7: `create-next-app` y la configuración de Next.js 16 (`next.config.ts`, `output: 'standalone'`, `serverActions.bodySizeLimit`), Tailwind CSS 4, Vitest y Playwright

## Qué hacer
1. Crear el proyecto en la raíz del repositorio con `create-next-app` de **Next.js 16.4.2 o posterior**: TypeScript, App Router, carpeta `src/`, Tailwind CSS 4, ESLint y el alias `@/*`. No sobrescribir `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore` ni nada existente: integrar lo que genere.
2. `package.json`: `"name": "incovsa"`, `"private": true`, `"engines": { "node": ">=24 <25" }` y `.npmrc` con `engine-strict=true`.
3. **SheetJS desde el repositorio** (specs/16, decisión 85): descargar `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` a `vendor/xlsx-0.20.3.tgz` e instalarlo con `npm i --save ./vendor/xlsx-0.20.3.tgz`. Anotar su huella (`sha512` del `package-lock.json`) en el `## Resultado`.
4. Instalar **todas** las dependencias del proyecto, con las versiones mínimas de la decisión 59. Antes de instalar cada una, consulta sus avisos de seguridad (`gh api "/advisories?ecosystem=npm&affects=<paquete>"`):
   - producción: `next` (≥ 16.4.2), `react` y `react-dom` (19.3.x), `@prisma/client` y `@prisma/adapter-pg` (**7.x**, versión explícita: `latest` apunta a Prisma 8 rc), `pg`, `better-auth` (≥ 1.7.10, estable), `zod` (4.x), `react-hook-form`, `@hookform/resolvers`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `date-fns` (4.x), `@date-fns/tz`, `libphonenumber-js`, `pdfmake` (≥ 0.3.6), `sharp` (≥ 0.35.5), `file-type` (≥ 21.3.2), `@aws-sdk/client-s3`, y las bases de shadcn/ui (`class-variance-authority`, `clsx`, `tailwind-merge` y `radix-ui` o lo que indique la documentación vigente de shadcn);
   - desarrollo: `prisma` (**7.x**), `typescript`, `tsx`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `fast-check`, `eslint`, `eslint-config-next`, `prettier`, `eslint-config-prettier`, `husky`, y los `@types` necesarios.
   - No instalar ninguna otra librería (por ejemplo, de íconos, de animación, de estado o de fechas distintas a date-fns). StrykerJS lo instala JG-11.
5. Scripts de `package.json` (nombres exactos de `AGENTS.md`): `dev` (`next dev`), `build`, `start`, `formato` (`prettier --check .`), `formato:arreglar`, `lint` (`eslint .`), `tipos` (`tsc --noEmit`), `test` (`vitest run`), `e2e` (`playwright test`), `verificar` (formato, lint, tipos y pruebas, en ese orden). Los de base de datos (`db:*`, `semilla:demo`) los agrega JG-03 y `crear-admin`, JG-06.
6. `next.config.ts`: `output: 'standalone'`, `experimental.serverActions.bodySizeLimit = '3mb'` (o la clave vigente según Context7, decisión 58) y nada más por ahora (las cabeceras de seguridad son de JG-11).
7. TypeScript en modo estricto. ESLint con `eslint-config-next` y Prettier (comillas dobles, punto y coma, ancho 120). `.prettierignore` con `entregable-*/`, `specs/`, `plan/`, `vendor/`, `.next/` y los archivos generados.
8. **husky**: gancho `pre-commit` que ejecuta `npm run formato`, `npm run lint` y `npm run tipos` (la búsqueda de secretos la agrega JG-11). Script `prepare` para instalarlo.
9. Estructura de carpetas de `plan/convenciones.md` §1, con un `README.md` corto en cada carpeta de `src/modulos/<modulo>/` que diga su dueño (§2) y para qué es. La página de inicio generada por `create-next-app` se reemplaza por una página mínima con el texto "INCOVSA" (Daniela la reemplaza en DM-02).
10. `src/lib/fechas.ts`: zona `America/Guatemala` con `@date-fns/tz`; funciones `fechaGuatemala(instante)` (día en Guatemala como `AAAA-MM-DD`), `inicioDelDiaGuatemala`, `finDelDiaGuatemala`, `semanaLunesADomingo(fecha)`, `formatoFecha(instante)` → `dd/mm/aaaa`, `formatoHora(instante)` → `HH:MM` (24 h), `leerFecha("dd/mm/aaaa")` y `leerHora("HH:MM")` que devuelven `null` si la fecha u hora no existe (por ejemplo 31/02/2026 o 25:90).
11. `src/lib/errores.ts`: clase `ErrorNegocio` (mensaje para el usuario, en español) y la función que convierte cualquier error en el resultado `{ ok: false, error }` de las acciones sin revelar detalles técnicos (specs/16, "Cabeceras y transporte").
12. `src/lib/roles.ts`: `normalizarRol(texto)` (sin mayúsculas, acentos ni espacios al inicio o al final; decisión 8) y `esAccesoTotal(rol)` (Gerencia o Soporte).
13. Configuración de **Vitest** (entorno node, archivos `src/**/*.test.ts` y `scripts/**/*.test.mjs`; la base de pruebas la conecta JG-03) y de **Playwright** (`pruebas-e2e/`, proyectos `telefono` 390×844, `tableta` 768×1024, `escritorio` 1440×900 y `tv` 1920×1080; servidor web `npm run dev` en local).
14. `.env.example` con **todas** las variables del proyecto, con valores de ejemplo y un comentario por variable: `DATABASE_URL`, `DATABASE_URL_PRUEBAS`, `BETTER_AUTH_SECRET_SITIO`, `BETTER_AUTH_SECRET_PICKING`, `BETTER_AUTH_URL`, `SESION_DIAS=7` (P-07), `CLAVE_DEMO` (mínimo 8 caracteres), `ALMACENAMIENTO=disco` (`disco` o `r2`, decisión 78), `R2_CUENTA`, `R2_LLAVE`, `R2_SECRETO`, `R2_BUCKET_IMAGENES`, `URL_IMAGENES`, `URL_ODOO` (P-06, vacía), `TIEMPO_REAL_CONSULTA_MS=5000`. Nunca valores reales.
15. Agregar al `.gitignore` lo que genere el proyecto (`/playwright-report`, `/test-results`, `/almacenamiento-local`, `next-env.d.ts` si corresponde) y crear `.cursorignore` con `.env`, `.env.local` y `.env.*.local`.
16. `scripts/verificar-entorno.mjs` ya existe: no lo cambies salvo para agregar, si hace falta, la comprobación de `npm install` hecho.

## Archivos que creas o modificas
- `package.json`, `package-lock.json`, `.npmrc`, `vendor/xlsx-0.20.3.tgz` (crear)
- `next.config.ts`, `tsconfig.json`, `eslint.config.*`, `.prettierrc*`, `.prettierignore`, `vitest.config.ts`, `playwright.config.ts`, `postcss.config.*` (crear)
- `.husky/pre-commit` (crear), `.env.example` (crear), `.gitignore` (modificar), `.cursorignore` (crear)
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (crear; el diseño lo completa JG-05)
- `src/lib/fechas.ts`, `src/lib/errores.ts`, `src/lib/roles.ts` y sus pruebas (crear)
- `src/modulos/<modulo>/README.md` para los 15 módulos, carpetas de `src/componentes/`, `pruebas-e2e/` y `pruebas/fixtures/` (crear)

## Criterios de aceptación
1. `npm install` en un equipo limpio (Windows y macOS) instala todo sin errores, con Node 24, y `npm ls xlsx` muestra la 0.20.3 instalada desde `vendor/`.
2. `npm run verificar` y `npm run build` pasan. `npm run dev` levanta la aplicación en http://localhost:3000 con la página mínima.
3. Las versiones instaladas cumplen la decisión 59: `next` ≥ 16.4.2, `sharp` ≥ 0.35.5, `better-auth` ≥ 1.7.10 estable, `pdfmake` ≥ 0.3.6, `file-type` ≥ 21.3.2, `prisma` y `@prisma/client` en 7.x. `npm audit --audit-level=high` no reporta vulnerabilidades altas ni críticas.
4. Un *commit* con un archivo mal formateado o con un error de tipos es rechazado por el gancho de husky.
5. **Fechas (decisión 6):** `fechaGuatemala` de `2026-10-18T05:30:00Z` es `2026-10-17` (en Guatemala aún es el 17); `semanaLunesADomingo("2026-10-21")` da del 19/10 al 25/10; `leerFecha("31/02/2026")` y `leerHora("25:90")` dan `null`; `formatoFecha` y `formatoHora` dan `dd/mm/aaaa` y `HH:MM`.
6. `normalizarRol(" Gérencia ")` es igual a `normalizarRol("gerencia")`, y `esAccesoTotal` es verdadero para Gerencia y Soporte en cualquier escritura y falso para "Piloto".
7. `.env.example` tiene todas las variables del paso 14 y ningún valor real; ningún archivo `.env` queda en el repositorio.
8. Los scripts de `npm` tienen exactamente los nombres de `AGENTS.md`.

## Pruebas obligatorias
- `src/lib/fechas.test.ts` (criterio 5, incluidos los cambios de día cerca de la medianoche de Guatemala)
- `src/lib/roles.test.ts` (criterio 6)
- `src/lib/errores.test.ts` (un error inesperado no revela su mensaje técnico)

## Verificación
```
npm install
npm run verificar
npm run build
npm audit --audit-level=high
npm ls xlsx next sharp better-auth prisma @prisma/client pdfmake file-type
```

## Fuera de alcance
- Esquema de Prisma y semillas (JG-03), design system y componentes (JG-05), autenticación (JG-06), permisos (JG-07), CI (JG-08), cabeceras de seguridad y herramientas de seguridad (JG-11).

## Notas
- Esta tarea ya pasa por la CI y el bot de JG-08. Desde aquí, los trabajos de la CI que dependen de la aplicación corren completos.
- En el `## Resultado`, deja la lista de versiones exactas instaladas y cómo usar `src/lib/fechas.ts`, `errores.ts` y `roles.ts`.

## Resultado

La aplicación base de Next.js 16.4.2 está en la raíz del repositorio, con **todas** las dependencias del proyecto, la calidad local (Prettier, ESLint, TypeScript estricto, Vitest, Playwright y husky), la estructura de carpetas de `plan/convenciones.md` §1 y las utilidades de `src/lib` para fechas, errores y roles. Desde ahora corren completos los trabajos `calidad`, `pruebas`, `compilacion` y `dependencias` de la CI.

**Versiones exactas instaladas** (`package-lock.json`)
- Producción: next 16.4.2, react y react-dom 19.3.1, @prisma/client y @prisma/adapter-pg 7.10.1, pg 8.23.1, better-auth 1.7.10, zod 4.6.7, react-hook-form 7.90.0, @hookform/resolvers 5.9.2, @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0, @dnd-kit/utilities 3.2.2, date-fns 4.4.0, @date-fns/tz 1.5.0, libphonenumber-js 1.13.15, pdfmake 0.3.12, sharp 0.35.5, file-type 22.2.0, @aws-sdk/client-s3 3.1152.0, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0, radix-ui 1.8.1 y xlsx 0.20.3.
- Desarrollo: prisma 7.10.1, typescript 6.0.3, tsx 4.23.15, vitest 5.0.5, @playwright/test 1.64.1, @axe-core/playwright 4.14.0, fast-check 4.10.2, eslint 9.39.5, eslint-config-next 16.4.2, eslint-config-prettier 10.1.8, prettier 3.9.10, husky 9.1.7, tailwindcss y @tailwindcss/postcss 4.3.3, postcss 8.5.30, @types/node 24.19.2, @types/react y @types/react-dom 19.3.0, y @types/pg 8.23.1.
- **SheetJS** desde `vendor/xlsx-0.20.3.tgz` (`"xlsx": "file:vendor/xlsx-0.20.3.tgz"`), con la huella `sha512-oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA==`, igual a la del archivo que se descarga de cdn.sheetjs.com.
- Antes de instalar cada paquete se consultaron sus avisos en la base de avisos de GitHub, en la versión elegida: ninguno tiene avisos. `npm audit --audit-level=high`: 0 vulnerabilidades.

**Decisiones tomadas**
- **`braces` (GHSA-vfj7-8cjw-p6xm, alta y sin versión corregida):** llegaba solo por `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`. Con la aprobación del coordinador, un `overrides` de `package.json` reemplaza ese `fast-glob` por `npm:tinyglobby@^0.2.17`. El plugin solo usa `globSync(patrón, { onlyDirectories: true })` en `dist/utils/get-root-dirs.js`, y solo si se configura `settings.next.rootDir`; tinyglobby tiene esa misma función. **El override se quita** cuando `@next/eslint-plugin-next` deje `fast-glob` o salga una versión corregida de `braces`. Mientras tanto, cada vez que se actualice el plugin hay que revisar que siga usando solo `globSync`.
- **npm 11.19 o posterior y `npm ci`** (aprobado por el coordinador). La primera ejecución de la CI falló en `npm ci`: el `package-lock.json` que escribió npm 11.6.2 (Node 24.13) no traía `@emnapi/runtime` ni `@emnapi/core` 1.11.3, dependencias opcionales de wasm de sharp y de Tailwind que exige el npm 11.19.0 de la CI (Node 24.21). Se regeneró el lockfile con npm 11.19.0. Para que no se vuelva a dañar: `engines.npm` es `>=11.19.0` (con `engine-strict`, un npm más antiguo se niega a instalar), `scripts/verificar-entorno.mjs` comprueba la versión, y `AGENTS.md`, `plan/protocolo.md` (B2) y `plan/instalacion.md` usan `npm ci`, que nunca reescribe el lockfile. Quedó en `specs/16` y `specs/18`.
- **ESLint 9 y TypeScript 6.0** (aprobado por el coordinador): ESLint 9 terminó su soporte, pero los plugins de `eslint-config-next` 16.4.2 todavía no admiten ESLint 10. TypeScript queda en `~6.0.3` porque `typescript-eslint` exige una versión menor que la 6.1.
- **Tailwind con PostCSS** (`@tailwindcss/postcss` y `postcss.config.mjs`), en lugar del cargador `@tailwindcss/turbopack` que ahora genera create-next-app, para que `next.config.ts` quede como pide la tarea.
- **`agentRules: false` en `next.config.ts`:** cada vez que arranca, `next dev` 16.4 escribe sus instrucciones en `AGENTS.md`, que es un archivo protegido. Con esta opción ya no lo hace, y si encuentra el bloque, lo quita.
- **Vitest** (`vitest.config.mts`) incluye `src/**/*.test.ts` y `scripts/**/*.test.ts`, no `scripts/**/*.test.mjs`. Las pruebas `.mjs` de los scripts usan `node:test` y las corre `node --test "scripts/*.test.mjs"` en el trabajo `plan` de la CI: una prueba de Vitest con ese patrón rompería ese trabajo. Los scripts nuevos en TypeScript (por ejemplo `crear-admin.ts`) ponen sus pruebas en `*.test.ts`. La extensión `.mts` evita el aviso de Vite por cargar ESM como CommonJS.
- **Prettier** ignora además los `*.md` (documentación, igual que `specs/` y `plan/`). Los scripts `.mjs` del plan y de la CI se formatearon con Prettier, sin cambios de comportamiento: las 78 pruebas siguen pasando.
- **Mensaje general de error**, elegido por el coordinador: "No se pudo completar la operación. Inténtelo de nuevo." Quedó registrado en `specs/16` y `specs/18`.
- **Fechas:** solo se aceptan textos `AAAA-MM-DD` o ISO 8601 con `Z` o desfase, con una fecha y una hora que existan. Un texto sin zona se leería con la hora del equipo: UTC en producción y Guatemala en desarrollo. Es el hallazgo de la revisión en contexto limpio.
- No se instalaron `tw-animate-css` ni `lucide-react`, que agrega `shadcn init`: la tarea prohíbe las librerías de animación y de íconos (decisiones 52 y 53).
- La página mínima no tiene ícono (`/favicon.ico` da 404). El prototipo tampoco tiene uno, así que no se inventó.
- `playwright.config.ts`: los proyectos `telefono`, `tableta` y `escritorio` corren todas las pruebas, y `tv` solo las de `tablero*.spec.ts` (JM-05 crea `pruebas-e2e/picking/tablero.spec.ts`). Todos usan Chromium; Firefox y WebKit los agrega JG-16.
- El script `prepare` ejecuta `husky`. En una instalación sin dependencias de desarrollo (`npm ci --omit=dev`, por ejemplo en Docker) hay que usar `--ignore-scripts` o `HUSKY=0`.

**Archivos principales**
- `package.json`, `package-lock.json`, `.npmrc` y `vendor/xlsx-0.20.3.tgz`.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `postcss.config.mjs`, `vitest.config.mts`, `playwright.config.ts`, `.husky/pre-commit`, `.env.example`, `.gitignore` y `.cursorignore`.
- `src/app/layout.tsx` (título "INCOVSA" con la plantilla "<página> · INCOVSA" del prototipo, y `lang="es"`), `src/app/page.tsx` (página mínima) y `src/app/globals.css` (solo Tailwind).
- `src/lib/fechas.ts`, `src/lib/errores.ts` y `src/lib/roles.ts`, con sus pruebas (34).
- `src/modulos/<módulo>/README.md` (15), las carpetas `src/componentes/{ui,comunes,sitio,panel,picking}/` y `pruebas/fixtures/`, y `pruebas-e2e/comunes/aplicacion.spec.ts`.

**Evidencia**
- `npm ci` con npm 11.19.0 en una carpeta limpia (solo `package.json`, el lockfile y `vendor/`): instala 687 paquetes sin errores. Con npm 11.19, `npm install` deja el lockfile igual.
- `npm run verificar`: formato, lint y tipos sin errores; Vitest, 34 de 34. `node --test "scripts/*.test.mjs"`: 78 de 78.
- `npm run build`: compila (Next.js 16.4.2, Turbopack, salida `standalone`).
- `npm run e2e`: 6 de 6 (dos pruebas en cada proyecto: `telefono`, `tableta` y `escritorio`), incluida la de axe, sin violaciones serias ni críticas.
- `npm audit --audit-level=high`: 0 vulnerabilidades. `npm ls xlsx` muestra `xlsx@0.20.3`, instalado desde `vendor/`.
- Criterio 4: un *commit* con un archivo mal formateado falló en `npm run formato`, y otro con un error de tipos falló en `npm run tipos` ("husky - pre-commit script failed"). HEAD no cambió.
- Las pruebas de fechas pasan con el sistema en UTC, America/Guatemala, Asia/Tokyo y America/New_York.
- `npm run dev`: http://localhost:3000 muestra "INCOVSA", y next-devtools no reporta errores de compilación ni de ejecución.

**Cómo usar lo que se creó**
- **Fechas** (`@/lib/fechas`). Un *día* es un texto `AAAA-MM-DD` del calendario de Guatemala. Un *instante* es un `Date`, una marca de tiempo en milisegundos o un texto ISO con `Z` o desfase. Un texto sin zona o con otro formato lanza `RangeError`.
  - `fechaGuatemala(instante)` → `"2026-10-17"`: el día de Guatemala, para la numeración diaria y los filtros por día.
  - `inicioDelDiaGuatemala(día | Date)` y `finDelDiaGuatemala(día | Date)` → `Date`, el primer y el último milisegundo del día en Guatemala. Sirven para consultar por rango: `{ gte: inicioDelDiaGuatemala(d), lte: finDelDiaGuatemala(d) }`.
  - `semanaLunesADomingo(día | Date)` → `{ inicio: "2026-10-19", fin: "2026-10-25" }`.
  - `formatoFecha(instante)` → `"17/10/2026"` y `formatoHora(instante)` → `"23:30"`, en la hora de Guatemala. Con un día, `formatoFecha("2026-10-17")` da `"17/10/2026"`.
  - `leerFecha("17/10/2026")` → `"2026-10-17"` y `leerHora("8:30")` → `"08:30"`. Aceptan lo mismo que el prototipo (`d/m/aaaa`, `ddmmaaaa`, `H:MM` y `HHMM`) y devuelven `null` si la fecha o la hora no existe (`31/02/2026`, `25:90`). Se pueden usar en los esquemas de Zod.
- **Errores** (`@/lib/errores`). Las reglas de negocio lanzan `new ErrorNegocio("mensaje para el usuario")`. Las acciones terminan así:
  ```ts
  try {
    // exigirPermiso, validar con Zod y llamar al servicio
    return { ok: true, datos };
  } catch (error) {
    return aResultadoDeError(error); // { ok: false, error } sin detalles técnicos
  }
  ```
  `aResultadoDeError` vuelve a lanzar `redirect()` y `notFound()` de Next.js, y deja los errores inesperados en el registro del servidor. El tipo `Resultado<T>` describe lo que devuelve cada acción.
- **Roles** (`@/lib/roles`): `normalizarRol(texto)` para comparar roles, y `esAccesoTotal(rol)`, que es verdadero para Gerencia y Soporte (RN-38).
- **Instalar:** `npm ci` (nunca `npm install`, que puede reescribir `package-lock.json`), con npm 11.19 o posterior.
- **Comandos:** `npm run dev`, `build`, `start`, `formato`, `formato:arreglar`, `lint`, `tipos`, `test`, `e2e` y `verificar`. Antes del primer `npm run e2e` hay que ejecutar `npx playwright install chromium` (o la lista de `plan/instalacion.md` §5).
