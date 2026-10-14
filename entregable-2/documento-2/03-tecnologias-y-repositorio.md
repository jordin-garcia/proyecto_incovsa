# Tecnologías y versiones

La {{tab:tecnologias}} lista las tecnologías de la solución. Las versiones son las vigentes al 14/10/2026; la versión exacta de cada paquete instalado queda fijada en el archivo `package-lock.json` del repositorio.

Tabla: Tecnologías utilizadas {#tab:tecnologias}

| Tecnología | Versión | Uso dentro del proyecto | Justificación |
|---|---|---|---|
| Node.js | 24 LTS | Entorno de ejecución del servidor | Versión LTS activa; la 22 deja de tener soporte en abril de 2027. Es la instalada en los equipos del equipo |
| TypeScript | 6.0 | Lenguaje de todo el código | El tipado estático detecta errores antes de ejecutar y documenta las estructuras de datos para quien mantenga el sistema |
| Next.js | 16.4 | Framework web: páginas, acciones del servidor, rutas de la API y `proxy.ts` | Versión principal vigente. Une el sitio, el panel y el picking en una sola aplicación con renderizado en el servidor |
| React | 19.3 | Componentes de la interfaz | Lo usa Next.js. Permite las interacciones del prototipo: arrastrar, marcar y reordenar |
| PostgreSQL | 18 | Base de datos relacional | Relacional, transaccional y gratuita. Es la instalada en los equipos del equipo |
| Prisma | 7.10 | Acceso a datos, esquema y migraciones | Consultas tipadas y parametrizadas, y migraciones versionadas que otro desarrollador puede aplicar desde cero |
| Better Auth | 1.7 | Inicio de sesión con nombre de usuario (plugin username) y contraseña, y sesiones en la base de datos | Librería gratuita (MIT) que se integra con Prisma y Next.js. Auth.js, la alternativa prevista, está en modo mantenimiento desde septiembre de 2025 y sus mantenedores recomiendan Better Auth para proyectos nuevos |
| Zod | 4.6 | Validación de formularios, parámetros y del archivo de Odoo, en cliente y servidor | Un solo esquema por dato valida en los dos lados (RNF-05) |
| Tailwind CSS | 4.3 | Estilos | Permite aplicar los tokens del design system aprobado (colores, tipografía, espaciados) en todas las pantallas |
| shadcn/ui | — | Componentes de interfaz (diálogos, tablas, formularios) | Los componentes se copian al proyecto, así que no es una dependencia que haya que actualizar; se ajustan al design system |
| SheetJS Community Edition | 0.20.3 | Lectura del archivo .xlsx de Odoo y exportación de reportes a Excel | Es la librería del prototipo y no tiene vulnerabilidades abiertas. Se eligió frente a ExcelJS 4.4.0, que tiene vulnerabilidades publicadas en agosto de 2026 sin corregir. Se instala desde el sitio oficial de SheetJS, no desde npm |
| Cloudflare R2 | Servicio | Imágenes del sitio y respaldos | Plan gratuito suficiente para el volumen del sitio; compatible con la API de S3 |
| Google Drive | Servicio de la empresa | Documentos técnicos de la documentación interna, enlazados desde el sistema | INCOVSA ya lo usa; el sistema solo guarda los enlaces y no necesita almacenar PDF (decisión del 14/10/2026) |
| Vitest | 5.0 | Pruebas automatizadas | Obligatorias para la conversión, la lectura del archivo de Odoo y la verificación de permisos y sedes |
| ESLint | 9.39 | Revisión estática del código | Detecta errores comunes y mantiene un estilo uniforme. La guía de Next.js 16 indica ESLint 9 para `eslint-config-next@16` |
| Git y GitHub | — | Control de versiones, revisiones y alertas de dependencias (Dependabot) | Repositorio privado del equipo |

La librería para exportar los reportes a PDF se define en el Entregable No. 3, junto con el módulo de Reportes.

# Dependencias

La {{tab:dependencias}} explica para qué se usa cada dependencia del proyecto. Las de desarrollo solo se usan para construir, probar y revisar el código; no se ejecutan en producción.

Tabla: Dependencias principales {#tab:dependencias}

| Paquete | Versión | Tipo | Para qué se usa |
|---|---|---|---|
| `next` | 16.4.0 | Producción | Framework de la aplicación |
| `react` y `react-dom` | 19.3.0 | Producción | Componentes de la interfaz |
| `@prisma/client` | 7.10.0 | Producción | Cliente que ejecuta las consultas a la base de datos |
| `@prisma/adapter-pg` y `pg` | 7.10.0 y 8.23.1 | Producción | Conexión de Prisma 7 con PostgreSQL |
| `better-auth` | 1.7.7 | Producción | Inicio de sesión, sesiones y límite de intentos |
| `zod` | 4.6.7 | Producción | Validación de datos de entrada |
| `xlsx` (SheetJS) | 0.20.3 | Producción | Lectura del archivo de Odoo y exportación a Excel. Se instala con `npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` |
| `@aws-sdk/client-s3` | 3.x | Producción | Subida y lectura de imágenes y respaldos en Cloudflare R2 |
| `libphonenumber-js` | 1.13.15 | Producción | Códigos telefónicos por país y validación del teléfono del formulario de contacto (RF-SW-19), como en el prototipo |
| `tailwindcss` y `@tailwindcss/postcss` | 4.3.3 | Producción | Estilos |
| `radix-ui`, `class-variance-authority`, `clsx` y `tailwind-merge` | 1.8.1, 0.7.1, 2.1.1 y 3.7.0 | Producción | Base de los componentes de shadcn/ui |
| `prisma` | 7.10.0 | Desarrollo | Herramienta de esquema y migraciones |
| `typescript` | 6.0.3 | Desarrollo | Compilador de TypeScript |
| `vitest` | 5.0.4 | Desarrollo | Pruebas automatizadas |
| `eslint` y `eslint-config-next` | 9.39.5 y 16.4.0 | Desarrollo | Revisión estática del código |
| `tsx` | 4.23.15 | Desarrollo | Ejecución de la semilla de la base de datos (`prisma/seed.ts`) |
| `@types/node`, `@types/react`, `@types/react-dom` y `@types/pg` | Los de cada paquete | Desarrollo | Definiciones de tipos para TypeScript |

Los íconos son los del prototipo aprobado, dibujados en SVG dentro del código, por lo que no se usa una librería de íconos. El sistema no envía correos (las solicitudes de contacto solo se guardan, desde el 13/10/2026), por lo que ya no usa Nodemailer.

## Política de dependencias

- El archivo `package-lock.json` está en el repositorio, con la versión y la huella de cada paquete.
- Dependabot de GitHub avisa de las vulnerabilidades y `npm audit` se ejecuta en cada pull request (RNF-16).
- Los parches de seguridad de Next.js, Better Auth y Prisma se aplican en cuanto salen.
- SheetJS no está en el registro de npm, así que ni Dependabot ni `npm audit` la vigilan: en cada entrega se revisa a mano su página de avisos de seguridad, <https://cdn.sheetjs.com/advisories>.

# Estructura del repositorio

El repositorio está organizado por módulos de dominio. La siguiente estructura es la del proyecto; las carpetas `src/` y `prisma/` se crean junto con el código de la aplicación. Desde el 13/10/2026 no hace falta la carpeta `scripts/` con la importación de datos maestros, porque el picking ya no tiene catálogos que cargar.

```
proyecto_incovsa/
├── specs/                      especificación vigente (fuente de verdad)
├── entregable-1/               Documento 1, diagramas y prototipos
├── entregable-2/               Documento 2, diagramas y herramientas de documentación
├── src/
│   ├── app/
│   │   ├── (sitio)/            sitio público
│   │   ├── panel/              panel del sitio y documentación interna
│   │   ├── picking/            Facturación, Bodega, Ruta, Reportes y Configuración
│   │   └── api/                rutas de la API: SSE, descargas y exportaciones
│   ├── modulos/<modulo>/       lógica de negocio de cada módulo
│   ├── componentes/ui/         componentes de shadcn/ui con el design system
│   ├── lib/                    cliente de Prisma, Better Auth y sesión
│   └── proxy.ts                primera barrera de acceso
├── prisma/
│   ├── schema.prisma           esquema de la base de datos
│   ├── migrations/             migraciones
│   └── seed.ts                 semilla con datos de ejemplo
├── .env.example                variables de entorno de ejemplo, sin valores reales
├── package.json y package-lock.json
└── README.md
```

Tabla: Responsabilidad de cada carpeta {#tab:carpetas}

| Carpeta | Responsabilidad |
|---|---|
| `specs/` | Especificación vigente del proyecto: alcance, requerimientos, reglas de negocio, modelo de datos, arquitectura, decisiones y pendientes. Es la referencia para cualquier cambio |
| `entregable-1/`, `entregable-2/` | Documentos de cada entrega, el código fuente de sus diagramas y el prototipo de simulación aprobado |
| `src/app/` | Rutas y pantallas, una carpeta por área. Solo contiene presentación: no tiene reglas de negocio |
| `src/modulos/<modulo>/` | Un módulo por dominio. Cada uno tiene `servicio.ts` (reglas de negocio), `esquemas.ts` (validaciones con Zod), `acciones.ts` (acciones del servidor que verifican permisos y llaman al servicio) y sus pruebas `*.test.ts` |
| `src/componentes/ui/` | Componentes de interfaz reutilizables |
| `src/lib/` | Conexión a la base de datos, configuración de Better Auth y lectura de la sesión |
| `prisma/` | Esquema, migraciones y semilla de la base de datos |

Los módulos de `src/modulos/` son los de la {{tab:componentes}}: de dominio (`contenido`, `solicitudes`, `documentos`, `camiones`, `odoo`, `envios`, `bodega`, `ruta`, `reportes` y `conversion`) y transversales (`permisos`, `usuarios`, `bitacora` y `tiempo-real`).

## Lo que no se sube al repositorio

Por privacidad y seguridad (RNF-10), el repositorio no contiene credenciales, claves, datos reales de producción ni datos personales. El archivo `.gitignore` excluye, entre otros:

- las variables de entorno (`.env*`, salvo `.env.example`);
- las dependencias y archivos generados (`node_modules/`, `.next/`);
- la documentación del curso, las actas y los archivos de la empresa (`docs/`, `docs_incovsa/`);
- los documentos entregables en Word y PDF;
- el prototipo de simulación armado, que contiene datos reales de la empresa.
