# Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA

> **README preliminar (Entregable No. 2, 14/10/2026).** Las secciones marcadas como *pendiente* se completan junto con el código. La especificación vigente del proyecto está en [`specs/`](specs/README.md) y es la fuente de verdad para el equipo y para los agentes de IA.

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
- Reportes: despacho por producto, rutas realizadas y bitácora, con filtros por periodo.
- Configuración: camiones y usuarios.
- Acceso por permisos asignados a cada usuario y por sede.

## 4. Arquitectura resumida

Monolito modular en capas, con renderizado en el servidor: presentación (Next.js), primera barrera (`proxy.ts`), autenticación y verificación de permisos en cada operación del servidor, lógica de negocio por módulo de dominio (`src/modulos/`), acceso a datos (Prisma) y PostgreSQL. Imágenes en Cloudflare R2; los documentos técnicos están en el Google Drive de la empresa y el sistema guarda sus enlaces. Detalle en [`specs/16-arquitectura-y-tecnologia.md`](specs/16-arquitectura-y-tecnologia.md) y en el Documento 2.

## 5. Tecnologías

Node.js 24 LTS · TypeScript · Next.js 16 · React 19 · PostgreSQL 18 · Prisma 7 · Better Auth 1.7 · Zod · Tailwind CSS y shadcn/ui · SheetJS 0.20.3 · Cloudflare R2 · Vitest.

## 6. Requisitos

- Node.js 24 LTS.
- PostgreSQL 18.
- Git.
- *Pendiente:* cuenta de Cloudflare R2 para producción. El sistema no envía correos.

## 7. Instalación

*Pendiente: se completa con el código.*

## 8. Configuración

*Pendiente: se completa con el código.*

## 9. Variables de entorno

*Pendiente: se documentan en `.env.example`, con valores de ejemplo. Nunca se suben credenciales reales al repositorio.*

## 10. Base de datos

*Pendiente: creación de la base de datos, migraciones de Prisma (`npx prisma migrate deploy`) y semilla con datos de ejemplo (`npx prisma db seed`). Los pedidos llegan en el archivo de Odoo; no hay carga de catálogos.*

## 11. Ejecución

*Pendiente: se completa con el código.*

## 12. Pruebas

Pruebas automatizadas con Vitest. Son obligatorias las de la conversión de kilogramos a unidades, la lectura del archivo de Odoo y la verificación de permisos y sedes. Los casos de prueba iniciales están en el Anexo F del Documento 2. *Pendiente: comando para ejecutarlas.*

## 13. Despliegue

*Pendiente: se completa en el Entregable No. 3, cuando INCOVSA defina el hosting.*

## 14. Estructura del proyecto

```
specs/            especificación vigente (fuente de verdad)
entregable-1/     Documento 1, diagramas y prototipos (incluido el prototipo de simulación aprobado)
entregable-2/     Documento 2, diagramas y herramientas de documentación
src/app/          rutas y pantallas: sitio, panel, picking y API
src/modulos/      lógica de negocio por módulo de dominio
src/componentes/  componentes de interfaz
src/lib/          Prisma, Better Auth y sesión
prisma/           esquema, migraciones y semilla
```

Las carpetas `src/` y `prisma/` se crean con el código.

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
- Todo entra a `develop` por pull request; nadie sube cambios directamente a `main` ni a `develop`.
- Mantener las dependencias al día: Dependabot, `npm audit` y revisión manual de los avisos de SheetJS (<https://cdn.sheetjs.com/advisories>), que no está en el registro de npm.
- No subir credenciales, datos personales ni datos reales de la empresa.
