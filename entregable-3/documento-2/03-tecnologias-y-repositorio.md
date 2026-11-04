# Tecnologías y versiones

La versión exacta de cada paquete procede de `package-lock.json`, no del rango de `package.json`. Esta versión 1.0 describe el código instalado al 03/11/2026. Las versiones de servicios y del sistema operativo corresponden a la configuración del despliegue, que no fija un parche del sistema operativo ni la huella de Caddy.

Tabla: Plataforma y decisiones de tecnología {#tab:tecnologias}

| Tecnología | Versión o configuración | Uso y motivo |
|---|---|---|
| Node.js | 24 LTS; engines >=24 <25 | Entorno del servidor y herramientas; imagen node:24-bookworm-slim |
| npm | >=11.19.0 | Instalación reproducible con npm ci |
| PostgreSQL | 18; imagen postgres:18 | Persistencia transaccional, claves, índices y bloqueos |
| Next.js | 16.4.3 | Una aplicación con App Router; páginas del servidor y cliente, acciones y API |
| React | 19.3.1 | Interacción, arrastre y actualizaciones optimistas |
| Prisma | 7.10.1 | Esquema, cliente tipado, migraciones y adaptador pg |
| Better Auth | 1.7.14 | Dos configuraciones de sesión sobre las mismas tablas |
| Tailwind CSS | 4.3.3 | Tokens del prototipo; componentes shadcn copiados en src/componentes/ui |
| Docker Compose | Complemento del VPS; archivo docker-compose.yml | Tres servicios con salud, reinicio, volúmenes y registro con rotación |
| Caddy | 2; imagen caddy:2 | Certificados HTTPS y proxy SSE |
| Ubuntu Server | 24.04 LTS diseñado | VPS requerido: 2 vCPU, 4 GB RAM, 80 GB SSD, IP fija y SSH con llave |

La combinación se decidió en specs/16: monolito modular, una base relacional y un proceso de aplicación. No hay microservicios, inventario propio, SMTP ni conexión directa con Odoo. Las fuentes Poppins, Figtree y JetBrains Mono se sirven desde la aplicación. Los PDF usan variantes locales estáticas y logotipo incrustado.

# Dependencias

Las tablas siguientes incluyen todas las dependencias directas y sus versiones fijadas. Las herramientas de desarrollo no forman parte de la imagen final. Prisma y tsx están en dependencies porque producción aplica migraciones y ejecuta la semilla base y crear-admin.

## Dependencias de producción

Tabla: Dependencias de producción {#tab:dependencies}

| Paquete | Versión | Uso |
|---|---|---|
| `@aws-sdk/client-s3` | 3.1159.0 | Subir y borrar imágenes en R2 mediante API S3 |
| `@date-fns/tz` | 1.5.0 | Zona America/Guatemala |
| `@dnd-kit/core` | 6.3.1 | Arrastre con mouse, toque y teclado |
| `@dnd-kit/sortable` | 10.0.0 | Reordenamiento de tarjetas y filas |
| `@dnd-kit/utilities` | 3.2.2 | Transformaciones del arrastre |
| `@hookform/resolvers` | 5.9.2 | Conectar React Hook Form con Zod |
| `@prisma/adapter-pg` | 7.10.1 | Adaptador de Prisma para PostgreSQL |
| `@prisma/client` | 7.10.1 | Tipos y ejecución de consultas |
| `better-auth` | 1.7.14 | Sesiones y autenticación por sistema |
| `class-variance-authority` | 0.7.1 | Variantes de componentes |
| `clsx` | 2.1.1 | Clases condicionales |
| `date-fns` | 4.4.0 | Fechas y periodos |
| `file-type` | 22.2.0 | Detección del formato real de imágenes |
| `libphonenumber-js` | 1.13.15 | Países y validación telefónica |
| `next` | 16.4.3 | App Router, SSR, acciones y API |
| `pdfmake` | 0.3.13 | Reportes PDF generados en el servidor |
| `pg` | 8.23.1 | Conexión a PostgreSQL |
| `prisma` | 7.10.1 | CLI de generación y migraciones, también requerida en producción |
| `radix-ui` | 1.8.1 | Primitivas accesibles de los componentes |
| `react` | 19.3.1 | Componentes e interacción |
| `react-dom` | 19.3.1 | Renderizado de React |
| `react-hook-form` | 7.91.0 | Estado y validación de formularios |
| `sharp` | 0.35.5 | Recodificación WebP e imágenes del PDF |
| `tailwind-merge` | 3.7.0 | Combinar clases Tailwind |
| `tsx` | 4.23.15 | Semilla base y crear-admin; también se ejecuta en producción |
| `xlsx` | 0.20.3 | SheetJS CE desde vendor; lectura Odoo y exportación XLSX |
| `zod` | 4.6.7 | Validación de entradas |

## Dependencias de desarrollo

Tabla: Dependencias de desarrollo {#tab:devdependencies}

| Paquete | Versión | Uso |
|---|---|---|
| `@axe-core/playwright` | 4.14.0 | Auditorías de accesibilidad |
| `@playwright/test` | 1.64.1 | Pruebas de navegador |
| `@stryker-mutator/core` | 10.0.0 | Pruebas de mutación |
| `@stryker-mutator/vitest-runner` | 10.0.0 | Ejecutar Vitest bajo Stryker |
| `@tailwindcss/postcss` | 4.3.3 | Transformación de CSS en compilación |
| `@types/node` | 24.19.2 | Tipos de Node.js 24 |
| `@types/pg` | 8.23.1 | Tipos de pg |
| `@types/react` | 19.3.0 | Tipos de React |
| `@types/react-dom` | 19.3.0 | Tipos de React DOM |
| `eslint` | 9.39.5 | Análisis estático |
| `eslint-config-next` | 16.4.3 | Reglas de Next.js |
| `eslint-config-prettier` | 10.1.8 | Compatibilidad de ESLint y Prettier |
| `fast-check` | 4.10.2 | Propiedades aleatorias de conversión |
| `husky` | 9.1.7 | Verificación antes del commit |
| `lockfile-lint` | 5.1.0 | Orígenes permitidos de dependencias |
| `postcss` | 8.5.32 | Procesamiento CSS |
| `prettier` | 3.9.10 | Formato uniforme |
| `tailwindcss` | 4.3.3 | Tokens y estilos |
| `typescript` | 6.0.3 | Tipos y compilador |
| `vitest` | 5.0.5 | Pruebas unitarias e integración PostgreSQL |

## Actualización y cadena de suministro

Se ejecuta npm ci sin reescribir el lock. SheetJS 0.20.3 procede de `vendor/xlsx-0.20.3.tgz`, con integridad aprobada; no se instala la versión 0.18.5 del registro. Sus avisos se revisan en cada entrega porque npm audit no sustituye esa revisión. Las fuentes de dependencias están limitadas a npm oficial y el tarball aprobado por `scripts/cadena-suministro.mjs`.

Dependabot agrupa versiones menores y parches por ecosistema, separa mayores y actualizaciones de seguridad, y conserva TypeScript en 6.0 y los tipos de Node en 24. La CI ejecuta npm audit, lockfile-lint y OSV-Scanner. La excepción GHSA-g3hv-75wg-m249 de minimatch está limitada a herramientas de desarrollo y vence el 15/11/2026 según `osv-scanner.toml`; no constituye una certificación de ausencia de vulnerabilidades.

# Estructura del repositorio

La aplicación está organizada por módulo de dominio. Las rutas contienen presentación; las reglas y la persistencia viven en los módulos y los servicios transversales.

```
proyecto_incovsa/
  specs/                     requisitos y decisiones vigentes
  plan/                      tareas, bitácoras, revisiones y evidencias
  entregable-1/              prototipo aprobado y documentación inicial
  entregable-2/              v0.4 y herramientas de armado conservadas
  entregable-3/              fuentes de los seis documentos v1.0
  src/app/(sitio)/            páginas públicas
  src/app/acceso/             acceso personal e inicios de sesión
  src/app/panel/              panel y documentación interna
  src/app/picking/            Facturación, Bodega, Tablero, Ruta, Reportes, Configuración
  src/app/api/                autenticación, imágenes, SSE y exportaciones
  src/modulos/                servicios, esquemas, acciones y pruebas
  src/componentes/            interfaz común, ui y componentes por área
  src/lib/                   sesión, cookies, Prisma, fechas, errores y registros
  src/proxy.ts               primera barrera y cabeceras
  prisma/                    esquema, migraciones, semilla base y demostración
  pruebas/                   configuración y archivos anonimizados
  pruebas-e2e/               recorridos Playwright por área
  scripts/                   administración, respaldos y verificaciones
  vendor/                    tarball aprobado de SheetJS
  .github/workflows/         CI, revisión, seguridad y operaciones
  Dockerfile                 imagen de varias etapas
  docker-compose.yml         Caddy, aplicación y PostgreSQL
  Caddyfile                  configuración del proxy
```

Los módulos son almacenamiento, contenido, solicitudes, documentos, camiones, odoo, envios, bodega, ruta, reportes y conversion; los transversales, permisos, usuarios, bitacora y tiempo-real. Las pruebas unitarias y de integración se guardan junto a la implementación. `src/generated/prisma` es salida de prisma generate y no se edita.

Las reglas de propiedad están en plan/convenciones.md §2. Solo el coordinador cambia el esquema, migraciones, dependencias, reglas del plan y configuración protegida. En cada módulo se consultan sus README y el Resultado de la tarea que lo implementó.

No se versionan secretos, archivos subidos, node_modules, .next, datos de producción ni los DOCX/PDF. Los nombres y carnés de portada viven en equipo.local.json. El HTML armado del prototipo sí está versionado por la decisión 63. `docs/Reuniones/` es la excepción temporal de la decisión 90 y se retira con CE-15 antes de transferir el repositorio; permanece en el historial Git.
