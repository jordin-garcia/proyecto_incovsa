# Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA

> **README preliminar (Entregable No. 2, 12/10/2026).** Las secciones marcadas como *pendiente* se completan junto con el código. La especificación vigente del proyecto está en [`specs/`](specs/README.md) y es la fuente de verdad para el equipo y para los agentes de IA.

## 1. Nombre del proyecto

Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA.

Proyecto del curso Programación Web de la Universidad Rafael Landívar, Campus San Alberto Hurtado S.J. de Quetzaltenango, para Industria del Cuero Covadonga S. A. (INCOVSA).

## 2. Descripción

Una sola aplicación web con dos componentes:

- **Sitio web corporativo e institucional autoadministrable:** sitio público, panel para administrar el contenido sin tocar el código y área protegida de documentación interna (fichas técnicas, hojas de seguridad y certificados de análisis).
- **Sistema de control logístico de bodega (picking):** apoya lo que pasa después de la facturación en Odoo. Lee los pedidos facturados desde el archivo .xlsx que exporta Odoo, convierte los kilogramos facturados en unidades físicas según el Peso de Conversión de cada producto y acompaña la preparación, la carga, el despacho y la entrega.

El sistema no lleva control de inventario: el inventario lo lleva Odoo.

## 3. Funcionalidades principales

- Sitio público: Inicio, Quiénes somos, Industrias, Productos (catálogo informativo), Noticias y Contacto.
- Panel del sitio: contenido institucional, industrias, catálogo, noticias, información de contacto, bandeja de solicitudes, documentos internos y usuarios.
- Facturación: carga del archivo de Odoo, tablero de pedidos facturados y armado de envíos por camión o para que el cliente recoja en bodega, con control de peso.
- Bodega: tablero de preparación en tiempo real, con la conversión de kilogramos a unidades, marcado de líneas, prioridad y despacho.
- Ruta: rutas del piloto y registro de la entrega.
- Reportes: despacho por producto, rutas realizadas y bitácora, con filtros por periodo.
- Configuración: productos y su Peso de Conversión, clientes, sectores, camiones y usuarios.
- Acceso por permisos asignados a cada usuario y por sede.

## 4. Arquitectura resumida

Monolito modular en capas, con renderizado en el servidor: presentación (Next.js), primera barrera (`proxy.ts`), autenticación y verificación de permisos en cada operación del servidor, lógica de negocio por módulo de dominio (`src/modulos/`), acceso a datos (Prisma) y PostgreSQL. Imágenes en Cloudflare R2 y PDF internos en el servidor, fuera de la carpeta pública. Detalle en [`specs/16-arquitectura-y-tecnologia.md`](specs/16-arquitectura-y-tecnologia.md) y en el Documento 2.

## 5. Tecnologías

Node.js 24 LTS · TypeScript · Next.js 16 · React 19 · PostgreSQL 18 · Prisma 7 · Better Auth 1.7 · Zod · Tailwind CSS y shadcn/ui · SheetJS 0.20.3 · Nodemailer · Cloudflare R2 · Vitest.

## 6. Requisitos

- Node.js 24 LTS.
- PostgreSQL 18.
- Git.
- *Pendiente:* cuentas de servicios (Cloudflare R2 y SMTP de la empresa) para producción.

## 7. Instalación

*Pendiente: se completa con el código.*

## 8. Configuración

*Pendiente: se completa con el código.*

## 9. Variables de entorno

*Pendiente: se documentan en `.env.example`, con valores de ejemplo. Nunca se suben credenciales reales al repositorio.*

## 10. Base de datos

*Pendiente: creación de la base de datos, migraciones de Prisma y semilla con datos de ejemplo. Los datos reales se cargan con un script que lee el Excel maestro desde fuera del repositorio.*

## 11. Ejecución

*Pendiente: se completa con el código.*

## 12. Pruebas

Pruebas automatizadas con Vitest. Son obligatorias las de la conversión de kilogramos a unidades, la lectura del archivo de Odoo y la verificación de permisos y sedes. *Pendiente: comando para ejecutarlas.*

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
scripts/          carga inicial de datos maestros
```

Las carpetas `src/`, `prisma/` y `scripts/` se crean con el código.

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
