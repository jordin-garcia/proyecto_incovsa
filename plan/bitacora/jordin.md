# Bitácora de Jordin García

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JG-01 · Herramientas obligatorias del agente (Claude Code y Codex)
- Hecho: entorno verificado en ✅ (Node 24.13.0, npm 11.6.2, Git 2.52.0, gh 2.98.0, PostgreSQL 18.6). GitHub CLI, Context7 y Playwright probados en Claude Code 2.1.267 y en Codex 0.157.1 (extensión de VS Code); next-devtools y shadcn registrados en los dos, con su prueba real en JG-02 y JG-05. Context7 con clave personal en Codex y como plugin en Claude Code.
- Decisiones: los servidores de `.mcp.json` se aprobaron en `.claude/settings.local.json` (personal). Se aplicó la configuración global de Git de `plan/instalacion.md` §3.
- Pendiente o aviso para otros:
**Todos:** en Claude Code, los servidores de `.mcp.json` quedan "Pending approval" hasta aprobarlos con `/mcp`. En Codex, revisen con `codex mcp list` que el proyecto esté marcado como confiable, porque sin eso no aparecen los servidores del proyecto. Las herramientas de Playwright no aparecen en `codex exec` (modo sin interfaz): pruébenlo en la sesión interactiva o en la extensión de VS Code.

## 2026-10-17 · JG-08 · Integración continua, bot de revisión, tablero del plan y protección de ramas
- Hecho: flujos `ci`, `titulo-pr`, `archivos-protegidos`, `revision-claude`, `claude-interactivo` y `tablero-plan`, más Dependabot, con las acciones fijadas por SHA. Scripts `archivos-protegidos`, `veredicto-revision` y `tablero`, con 78 pruebas. Repositorio con integración automática, solo *squash* y Actions autorizado para aprobar. Rulesets de `develop` y `main` con las ocho verificaciones obligatorias. Secreto del bot guardado.
- Decisiones: la revisión formal la deja el flujo a partir del veredicto, no el bot. `archivos-protegidos` ejecuta el script de la rama base. El coordinador puede saltarse las reglas solo al integrar un PR. Los PR de Dependabot los integra el coordinador.
- Pendiente o aviso para otros:
**Todos:** desde ahora cada PR se integra solo con `gh pr merge --auto --squash --delete-branch` cuando pasan las ocho verificaciones, incluida la del bot. El título debe ser `[<ID>] <título>`.
**Todos:** activen los avisos por correo de GitHub (`plan/instalacion.md` §3) y confírmenle a Jordin cuando les llegue el primer aviso del "Tablero del plan".
**JG-02:** anotar en la bitácora el resultado de los criterios 5, 6 y 7 de JG-08: protección de ramas, tablero fijado, aviso de tarea integrada y recordatorio manual.

## 2026-10-17 · JG-02 · Proyecto base de Next.js, dependencias y calidad local
- Hecho: aplicación Next.js 16.4.2 en la raíz con todas las dependencias del proyecto (versiones exactas en el `## Resultado` de la tarea), SheetJS 0.20.3 desde `vendor/`, Prettier, ESLint, TypeScript estricto, Vitest, Playwright con los proyectos `telefono`, `tableta`, `escritorio` y `tv`, gancho `pre-commit` de husky, `.env.example`, la estructura de carpetas con los 15 README de módulos, y `src/lib/fechas.ts`, `errores.ts` y `roles.ts` con 34 pruebas. `npm run verificar`, `npm run build`, `npm run e2e` y `npm audit --audit-level=high` pasan.
- Decisiones: `overrides` de `fast-glob` → `tinyglobby` en `@next/eslint-plugin-next` por el aviso alto de `braces` sin versión corregida; ESLint 9 y TypeScript 6.0; Tailwind con PostCSS; `agentRules: false` para que `next dev` no escriba en `AGENTS.md`; Vitest con `*.test.ts` (las pruebas `.mjs` de los scripts siguen con `node:test`); Prettier ignora `*.md` y se formatearon los scripts; mensaje general de error "No se pudo completar la operación. Inténtelo de nuevo." (registrado en `specs/16` y `specs/18`); npm 11.19 o posterior en `engines` y `npm ci` en `AGENTS.md`, el protocolo y la guía de instalación, porque el lockfile de npm 11.6 rompía el `npm ci` de la CI.
- Criterios 5, 6 y 7 de JG-08: los rulesets `develop`, `main` y `main: solo integra el coordinador` están activos (con `pull_request`, `required_status_checks`, `non_fast_forward`, `deletion` y `update`); el issue #59 "Tablero del plan" está fijado; el recordatorio diario del 17/10 se publicó solo con el cron (programado a las 13:00 UTC, salió a las 16:00 UTC) y menciona a cada persona con sus tareas. El aviso de tarea integrada se comprueba al integrar este PR, el primero de una tarea desde JG-08. No se ejecutó el recordatorio manual, para no enviar otro correo al equipo el mismo día.
- Pendiente o aviso para otros:
**Todos:** antes de instalar, actualicen Node.js 24 a la última 24.x (24.21 o posterior trae npm 11.19), o ejecuten `npm i -g npm@11.19.0`; `node scripts/verificar-entorno.mjs` lo comprueba. Desde ahora se instala con **`npm ci`**, nunca con `npm install`: un npm más antiguo reescribe `package-lock.json` (archivo protegido) y rompe la CI.
**Todos:** actualicen `develop` y ejecuten `npm ci` y `npx playwright install chromium` (o la lista de `plan/instalacion.md` §5). Desde ahora, cada *commit* pasa por `npm run formato`, `npm run lint` y `npm run tipos`; si el formato falla, `npm run formato:arreglar`. No usen `--no-verify`.
**Todos:** las fechas y horas se calculan y se muestran solo con `@/lib/fechas`, y los errores de las acciones con `ErrorNegocio` y `aResultadoDeError` de `@/lib/errores` (ejemplos en el `## Resultado` de JG-02). Los textos de fecha sin zona lanzan `RangeError`.
**DM-02:** reemplaza `src/app/page.tsx`. `pruebas-e2e/comunes/aplicacion.spec.ts` comprueba en `/` que el título contenga "INCOVSA", que `lang` sea `es` y que axe no encuentre violaciones serias; tu página de inicio debe cumplirlo.
**CE-05:** `next.config.ts` ya tiene `output: "standalone"`. El script `prepare` ejecuta `husky`: en la imagen de Docker instala con `npm ci --omit=dev --ignore-scripts` (o `HUSKY=0`).
**JG-04:** la aplicación no tiene ícono (`/favicon.ico` da 404) y el prototipo tampoco; si INCOVSA entrega uno, se agrega con los recursos gráficos.
**JG-16:** los proyectos de Playwright usan solo Chromium; agrega Firefox y WebKit (decisión 46).

## 2026-10-17 · JG-04 · Datos de prueba y recursos gráficos del prototipo
- Hecho: copia anonimizada del archivo de Odoo con las cifras de `specs/13` (52 contactos `Cliente de ejemplo NNN`, sin calles, estados ni documentos reales, ni las propiedades del libro), los 6 archivos inválidos para JC-02, los 5 recursos de `public/marca/` y las 28 imágenes del catálogo de prueba, con tres scripts reproducibles y 27 pruebas nuevas. El trabajo `plan` de la CI ahora instala las dependencias antes de las pruebas de los scripts.
- Decisiones: las imágenes son los mismos bytes WebP del prototipo; los defectos de cada archivo inválido están en `pruebas/fixtures/odoo/README.md`; `Documento origen` se numera por fila; sigue sin haber ícono (`/favicon.ico`) porque INCOVSA no lo ha entregado.
- Pendiente o aviso para otros:
**JC-02:** usa `pruebas/fixtures/odoo/`: con el anonimizado se cargan 33 pedidos facturados (46 se rechazan por peso 0 y 1 está cancelado) y con `cantidad-invalida.xlsx`, 30. El README tiene las cifras y el defecto de cada archivo; el de más de 2 MB se genera en memoria en tu prueba.
**Todos:** los logotipos y las fotografías están en `public/marca/` (rutas y uso en el `## Resultado` de JG-04). No usen `docs_incovsa/` ni el prototipo como fuente de imágenes.
**Todos:** si agregan un script con dependencias, sus pruebas `scripts/*.test.mjs` ya corren con `npm ci` en el trabajo `plan` de la CI.

## 2026-10-17 · JG-03 · Esquema completo de la base de datos, migración inicial y semillas
- Hecho: esquema de Prisma con las 32 tablas de los dos sistemas, la migración inicial y una con SQL propio (CHECK y disparadores de la bitácora), `prisma.config.ts`, el cliente único `@/lib/prisma` con `@prisma/adapter-pg`, la semilla base y la de demostración (idempotentes), y la base de pruebas de Vitest con `pruebas/bd.ts`. Hay 21 pruebas de integración más 2 de `@/lib/cuentas`, y una de ellas compara la base real con el diccionario del Documento 2 columna por columna. `npm run verificar` (57 pruebas), `npm run build`, las semillas dos veces y `prisma migrate diff` sin diferencias pasan, contra un PostgreSQL 18.6 desechable en Docker.
- Decisiones: manda `specs/14` sobre el diccionario: el lote es `NOT NULL DEFAULT ''` y `pedido_facturado` lleva `actualizado_en`. La unicidad de `imagen` se declara con índices únicos parciales. Todas las claves foráneas que no van en cascada son `ON DELETE RESTRICT`. El correo interno es `<clave>@incovsa.invalid` (`@/lib/cuentas`). El logotipo de Inquiserca viene cargado (`/marca/inquiserca.webp`) y vacío significa quitado. El cliente se genera en `src/generated/prisma/` con `postinstall`. Las pruebas corren un archivo tras otro porque comparten la base. Todo está registrado en `specs/14`, `specs/18` y el `## Resultado` de la tarea.
- Pendiente o aviso para otros:
**Todos:** después de actualizar `develop`, ejecuten `npm ci`, creen dos bases en su PostgreSQL local (`incovsa` e `incovsa_pruebas`) y escriban en su `.env` `DATABASE_URL`, `DATABASE_URL_PRUEBAS` (una base distinta) y `CLAVE_DEMO` (8 caracteres o más). Luego ejecuten `npm run db:aplicar`, `npm run db:semilla` y `npm run semilla:demo`. Desde ahora `npm test` no corre sin `DATABASE_URL_PRUEBAS`.
**Todos:** en las pruebas de integración usen `beforeEach(() => limpiarTablasDeNegocio())` de `pruebas/bd.ts`; nada de simular Prisma. Los nombres de los modelos, los tipos y la plantilla están en el `## Resultado` de JG-03. Si necesitan un cambio del esquema, pídanselo a Jordin.
**JG-06:** configura Better Auth con `modelName` `usuario`, `cuenta`, `sesion` y `verificacion`, y con `sistema`, `rol`, `correo`, `activo` y `eliminadoEn` en `additionalFields`. La clave de acceso interna y el correo interno salen de `claveAccesoInterna` y `correoInterno` de `@/lib/cuentas`, las mismas que usa la semilla de demostración.
**CE-03:** al crear cuentas, arma `username` y `email` con `claveAccesoInterna` y `correoInterno` de `@/lib/cuentas`.
**DM-04:** el logotipo de Inquiserca viene cargado (`configuracion_sitio.logotipo_inquiserca_url = "/marca/inquiserca.webp"`); "quitarlo" es guardar `null`. El de INCOVSA en `null` es el recibido de `public/marca/`. Para reordenar una galería, borra sus imágenes y vuelve a insertarlas en una transacción: la posición es única en la galería, va de 1 a 5 y un UPDATE que intercambia dos posiciones falla.
**CE-05:** `postinstall` ejecuta `prisma generate`, y `db:aplicar` y `db:semilla` usan `prisma` y `tsx`, que están en `devDependencies`. En la imagen de Docker, genera el cliente en la etapa de compilación y asegúrate de que producción pueda ejecutar `npm run db:aplicar` y `npm run db:semilla`, con `prisma/` incluido, también `prisma/datos/guatemala.json`. Con `npm ci --omit=dev --ignore-scripts` esos comandos no existirán.
**JC-08:** en la nueva versión del Documento 2, el diccionario debe decir que el lote de `detalle_pedido_facturado` y `linea_preparacion` es «No» nulo con valor por omisión `''`, agregar `actualizado_en` a `pedido_facturado` y explicar que la unicidad de `imagen` usa índices parciales. La prueba `JG-03 criterio 2` lee `entregable-2/documento-2/02b-diccionario-de-datos.md`: si el diccionario nuevo vive en otra ruta, avísale a Jordin para que la prueba lo lea.

## 2026-10-18 · CE-01 · Herramientas obligatorias del agente (Cursor) — decisión sobre el bloqueo
- Hecho: se respondió el aviso de Carlos en su bitácora del 18/10. En `plan/tareas/CE-01-herramientas-del-agente.md` se cambiaron el campo `bloqueo` y la subsección "Cómo desbloquear" del `## Resultado`. La tarea sigue `bloqueada`.
- Decisiones: CE-01 y todas las tareas de Carlos se trabajan en Cursor local en su Mac, como dice la decisión 70 de `specs/16`. No se usa Cursor Cloud Agent ni un token personal (PAT) en servicios externos, y no se cambian `scripts/verificar-entorno.mjs` ni el criterio 2 de las tareas XX-01. Dar más acceso a la App de Cursor no lo resuelve: `gh api user` responde 403 con el token de instalación de la App (`cursor[bot]`), porque ese token no representa a un usuario, y ningún permiso adicional de la App lo cambia.
- Pendiente o aviso para otros:
**Carlos:** Jordin cambió `plan/tareas/CE-01-herramientas-del-agente.md`; actualiza tu rama desde `develop`. Repite CE-01 en Cursor local en tu Mac: `gh auth login` con la cuenta `carloshugoeg` y `gh auth setup-git`, y sigue "Cómo desbloquear" en el `## Resultado` de la tarea. Hasta que CE-01 esté hecha no puedes empezar otra tarea. CE-02 y CE-03 están programadas para hoy, pero además esperan a JG-07.

## 2026-10-18 · JG-05 · Design system, componentes comunes y estructura del panel y del picking
- Hecho: tokens del prototipo en Tailwind 4, fuentes locales, configuración de shadcn, SVG originales, componentes base y comunes, campos de fecha/hora con teclado y selector nativo, y armazones presentacionales para `/panel` y `/picking`. Se documenta un ejemplo de uso de cada componente en el Resultado de JG-05. Hay 33 capturas comparativas y de estados; las 51 pruebas de navegador pasan en teléfono, tableta y escritorio, con axe y teclado. La revisión independiente corrigió el orden del reinicio de sombras y las flechas de los selectores.
- Decisiones: sin dependencias nuevas; se adapta shadcn a las librerías ya aprobadas. RNF-08 requiere `--g600` donde el gris original sobre `--g50` no alcanza 4.5:1; precisión en `specs/20` y `specs/18`. El borrador inválido de fecha/hora se conserva para corregirlo, entrega ISO vacío y bloquea la validación HTML. Se oculta solo el indicador flotante de desarrollo de Next.js para que no cubra controles móviles.
- Pendiente o aviso para otros:
**Todos:** actualicen su rama desde `develop` y usen los tokens de `src/app/globals.css` y los componentes de `src/componentes/comunes/` y `src/componentes/ui/`. El Resultado de JG-05 contiene las correspondencias del prototipo, las propiedades y ejemplos; la evidencia está en `plan/evidencias/JG-05/README.md`.
**JG-06 / JG-07:** `Armazon` es presentacional; los layouts usan `ArmazonEjemplo`, sin sesión ni operaciones del servidor. JG-07 debe reemplazar ese adaptador con sesión, permisos, sede en cookie y cierre real de sesión. Los módulos reemplazarán sus páginas temporales; no reutilicen los controles de demostración como lógica de negocio.
**Daniela:** el coordinador creó `src/app/panel/layout.tsx` y `src/app/panel/page.tsx` como parte de JG-05. Actualiza tu rama desde `develop`; conserva el armazón compartido y sustituye la página temporal al implementar los módulos del panel. También se actualizaron los estilos globales y las fuentes del layout raíz.
