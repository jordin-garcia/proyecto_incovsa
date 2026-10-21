# Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA

> **README del repositorio (Entregable No. 2, 14/10/2026, actualizado el 16/10/2026 con la versión 1.5 de la especificación).** Las secciones 7 a 13 traen los comandos del repositorio. El procedimiento completo está en el Documento 5, carpeta `entregable-3/documento-5/`. La especificación vigente del proyecto está en [`specs/`](specs/README.md) y es la fuente de verdad para el equipo y para los agentes de IA.

## 1. Nombre del proyecto

Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA.

Proyecto del curso Programación Web de la Universidad Rafael Landívar, Campus San Alberto Hurtado S.J. de Quetzaltenango, para Industria del Cuero Covadonga S. A. (INCOVSA).

## 2. Descripción

Una sola aplicación web con dos componentes:

- **Sitio web corporativo e institucional autoadministrable:** sitio público, panel para administrar el contenido sin tocar el código y área protegida de documentación interna (enlaces de Google Drive a fichas técnicas, hojas de seguridad y certificados de análisis).
- **Sistema de control logístico de bodega (picking):** apoya lo que pasa después de la facturación en Odoo. Lee los pedidos facturados desde el archivo .xlsx que exporta Odoo, con su lote y su Peso de Conversión, convierte los kilogramos facturados en unidades físicas y acompaña la preparación, la carga, el despacho y la entrega.

El sistema no lleva control de inventario: el inventario lo lleva Odoo.

## 3. Funcionalidades principales

- Sitio público: Inicio, Quiénes somos, Industrias, Productos (catálogo informativo), Noticias y Contacto, con galerías de imágenes.
- Panel del sitio: portada y logotipos, contenido institucional y valores, industrias, catálogo, noticias, información de contacto, bandeja de solicitudes, documentación interna y usuarios.
- Acceso personal: usuario, elección del sistema y contraseña.
- Facturación: carga del archivo de Odoo, tablero de pedidos facturados y armado de rutas (envío por camión) y pedidos (cliente recoge en bodega), con control de peso y fecha y hora programadas.
- Bodega: tablero de preparación en tiempo real, con lote, conversión de kilogramos a unidades, marcado de líneas, prioridad, orden por peso y despacho.
- Ruta: rutas en curso del piloto y registro de la entrega.
- Reportes: despacho por producto, rutas realizadas y bitácora, con filtros por periodo y exportación a Excel y PDF en las tres pestañas.
- Configuración: camiones y usuarios.
- Acceso por permisos asignados a cada usuario y por sede.

## 4. Arquitectura resumida

Monolito modular en capas, con renderizado en el servidor: presentación (Next.js), primera barrera (`proxy.ts`), autenticación y verificación de permisos en cada operación del servidor, lógica de negocio por módulo de dominio (`src/modulos/`), acceso a datos (Prisma) y PostgreSQL. Imágenes en Cloudflare R2; los documentos técnicos están en el Google Drive de la empresa y el sistema guarda sus enlaces. Las pantallas de Bodega y Facturación se actualizan en tiempo real con avisos del servidor (SSE). Cada sistema (administración del sitio y picking) tiene su propia sesión.

En producción la aplicación corre en un VPS con Docker Compose: Caddy (HTTPS), la aplicación y PostgreSQL 18. Detalle en [`specs/16-arquitectura-y-tecnologia.md`](specs/16-arquitectura-y-tecnologia.md).

## 5. Tecnologías

| Uso | Tecnología |
|---|---|
| Base | Node.js 24 LTS · TypeScript · Next.js 16 · React 19 |
| Datos | PostgreSQL 18 · Prisma 7 |
| Acceso | Better Auth 1.7 |
| Validación y formularios | Zod · React Hook Form |
| Interfaz | Tailwind CSS y shadcn/ui · dnd-kit (arrastrar y soltar) |
| Archivos | SheetJS 0.20.3 (lectura del archivo de Odoo y Excel) · pdfmake (PDF) · file-type y sharp (imágenes) |
| Fechas | date-fns con `@date-fns/tz` (hora de Guatemala) |
| Pruebas | Vitest · Playwright |
| Calidad y seguridad | ESLint · Prettier · husky · Semgrep · gitleaks · StrykerJS · fast-check · axe · lockfile-lint · OSV-Scanner · actionlint · OWASP ZAP · GitHub Actions · bot de revisión con Claude |
| Servicios | Cloudflare R2 y DNS · Google Drive de la empresa |
| Producción | Docker Compose · Caddy · VPS con Ubuntu Server 24.04 LTS |

## 6. Requisitos

**Desarrollo** (no requiere Docker):

- Node.js 24 LTS.
- PostgreSQL 18.
- Git.

**Producción:**

- VPS con Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM y 80 GB SSD, con Docker y Docker Compose.
- Cuenta de Cloudflare con R2 (imágenes y respaldos) y el DNS de incovsa.com.
- Acceso del repositorio de GitHub al registro de imágenes (GHCR) y a GitHub Actions.

El sistema no envía correos.

## 7. Instalación

Con Node.js 24, npm 11.19.0 o posterior, Git, GitHub CLI y PostgreSQL 18:

```
gh repo clone jordin-garcia/proyecto_incovsa
cd proyecto_incovsa
node scripts/verificar-entorno.mjs
npm ci
npx playwright install --with-deps chromium firefox webkit
```

`npm ci` instala `package-lock.json` y ejecuta `prisma generate`. El procedimiento completo está en el Documento 5.

## 8. Configuración

```
cp .env.example .env
```

En Windows, `Copy-Item .env.example .env`. Escriba en `.env` el usuario y la contraseña de su PostgreSQL. No suba ese archivo.

En el VPS, cuando exista, copie `.env.produccion.example` a `.env` y cambie los valores de ejemplo. El detalle está en el Documento 5.

## 9. Variables de entorno

Los nombres y los valores de ejemplo están en `.env.example` y en `.env.produccion.example`. El Documento 5 los lista todos. Nunca se suben credenciales reales al repositorio.

Desarrollo usa `DATABASE_URL` y `DATABASE_URL_PRUEBAS`. Producción agrega `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DOMINIO` y `RCLONE_DEST`. `DATABASE_URL` de producción apunta al servicio `postgres`.

## 10. Base de datos

```
psql -U postgres -c "CREATE DATABASE incovsa;"
psql -U postgres -c "CREATE DATABASE incovsa_pruebas;"
npm run db:aplicar
npm run db:semilla
npm run semilla:demo
```

`npm run db:aplicar` ejecuta `prisma migrate deploy`. Ese es el comando que antes se escribía `npx prisma migrate deploy`. `npm run db:semilla` carga la semilla base, la misma que ejecuta `npx prisma db seed`.

Los pedidos llegan en el archivo de Odoo. No hay carga de catálogos.

El primer administrador se crea con `npm run crear-admin`, que pide el usuario y la contraseña en la terminal. Dentro del contenedor, sin `-T`:

```
docker compose exec app npm run crear-admin
```

`npm run db:reiniciar` borra la base de `DATABASE_URL` y vuelve a aplicar las migraciones. Úselo solo en su base local. Después ejecute otra vez `npm run db:semilla` y `npm run semilla:demo`.

## 11. Ejecución

```
npm run dev
```

Abra http://localhost:3000. Para el servidor ya compilado, ejecute `npm run build` y después `npm run start`.

En producción no se usa `npm run dev`. El VPS arranca con Docker Compose. Vea el Documento 5.

## 12. Pruebas

```
npm test
npm run e2e
npm run verificar
```

`npm test` corre Vitest contra la base PostgreSQL de `DATABASE_URL_PRUEBAS`. Son obligatorias las de la conversión de kilogramos a unidades, la lectura del archivo de Odoo y la verificación de permisos y sedes.

`npm run e2e` corre Playwright. Fuera de CI reutiliza un servidor que ya responda en http://localhost:3000. Si no hay servidor, arranca `npm run dev`. Los proyectos de `playwright.config.ts` son `telefono`, `tableta`, `escritorio` y `tv`. El proyecto `tv` solo incluye pruebas cuyo archivo coincide con `tablero`. El comando de la sección 7 descarga Chromium, Firefox y WebKit.

`npm run verificar` corre el formato, el lint, los tipos y `npm test`, en ese orden. No incluye `npm run e2e`.

GitHub Actions corre en cada pull request ESLint, Prettier, la revisión de tipos, Vitest, las migraciones desde cero, `npm audit` y la compilación.

Los casos formales están en el Anexo F del Documento 2 y en el Documento 6.

## 13. Despliegue

En producción, un VPS que contrata INCOVSA, con Docker Compose. Caddy sirve HTTPS, la aplicación y PostgreSQL 18. El primer despliegue real es JG-19, el 2 de noviembre de 2026, cuando la aplicación esté completa y el coordinador integre `develop` en `main`. La preparación del VPS, del DNS y de R2 sigue bloqueada en CE-08, por P-10, P-93 y P-94.

Después, cada integración en `main` ejecuta el flujo Despliegue. GitHub Actions compila la imagen, la guarda en GHCR con la etiqueta del commit y `produccion`, y la arranca en el VPS con las migraciones. Se conservan las últimas 5 imágenes. Para volver a una etiqueta anterior, sin migraciones:

```
gh workflow run despliegue.yml --ref main -f etiqueta=ETIQUETA
gh run watch
```

Los respaldos diarios de la base de datos van a un bucket privado de Cloudflare R2 con `scripts/respaldo.sh`. La prueba de restauración que ya pasó está en GitHub Actions y usa un remoto local de rclone, no R2.

El procedimiento completo está en el Documento 5.

## 14. Estructura del proyecto

```
specs/            especificación vigente (fuente de verdad)
plan/             plan de desarrollo, bitácoras de avance e informe de la investigación sobre agentes de IA
entregable-1/     Documento 1, diagramas y prototipos (incluido el prototipo de simulación aprobado, ya armado)
entregable-2/     Documento 2, diagramas y herramientas de documentación
src/app/          rutas y pantallas: sitio, panel, picking y API
src/modulos/      lógica de negocio por módulo de dominio
src/componentes/  componentes de interfaz
src/lib/          Prisma, las dos configuraciones de Better Auth y sesión
prisma/           esquema, migraciones y semilla
scripts/          crear-admin y respaldo de la base de datos
pruebas-e2e/      pruebas de Playwright
.github/workflows/ integración continua y despliegue automático
Dockerfile, docker-compose.yml y Caddyfile   producción en el VPS
```

Las carpetas `src/`, `prisma/`, `scripts/`, `pruebas-e2e/` y `.github/workflows/`, y los archivos de producción, se crean con el código.

## 15. Autores

| Integrante | Rol en el proyecto |
|---|---|
| Héctor Jordin Adolfo García Coyoy | Coordinador, arquitecto e integrador, responsable de calidad |
| Carlos Hugo Escobar Gómez | Requerimientos, documentación general y despliegue |
| Daniela Alexandra Marín Orozco | Frontend del sitio y del panel administrativo |
| Josué André Menéndez Juárez | Base de datos y frontend del sistema logístico |
| José Daniel Cifuentes Carrascosa | Backend del sistema logístico y documentación técnica |

Docente: Ing. Manuel Rojas. Contraparte en INCOVSA: Ing. William Ambrossio.

## 16. Consideraciones para mantenimiento

- Antes de cambiar una regla, revisar [`specs/`](specs/README.md) y registrar el cambio en `specs/18-historial-de-decisiones.md`.
- Las reglas de negocio van en `src/modulos/`, nunca en las pantallas, y cada operación del servidor verifica permisos y sede.
- Todo entra a `develop` por pull request; nadie sube cambios directamente a `main` ni a `develop`. Un bot de Claude revisa cada pull request y lo aprueba o lo rechaza; GitHub lo integra solo cuando pasan todas las verificaciones. El esquema de la base de datos solo lo modifica el coordinador.
- Cada integrante trabaja con su propio agente de IA (Claude Code, Codex, Cursor o Antigravity), que lee `AGENTS.md`. El plan y su avance están en `plan/`.
- Cada integración en `main` se despliega automáticamente en producción.
- Mantener las dependencias al día: Dependabot, `npm audit` y revisión manual de los avisos de SheetJS (<https://cdn.sheetjs.com/advisories>), que no está en el registro de npm.
- No subir credenciales, datos personales ni datos reales de la empresa.
