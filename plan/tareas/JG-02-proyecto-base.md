---
id: JG-02
titulo: Proyecto base de Next.js, dependencias y calidad local
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JG-01]
programada: 2026-10-17
requisitos: [RNF-07, RNF-10, RNF-16]
pantallas: []
---

# JG-02 · Proyecto base de Next.js, dependencias y calidad local

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-01

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
- Antes de esta tarea no hay CI: integra con `gh pr merge --squash --delete-branch` después de verificar en local (protocolo B10).
- En el `## Resultado`, deja la lista de versiones exactas instaladas y cómo usar `src/lib/fechas.ts`, `errores.ts` y `roles.ts`.
