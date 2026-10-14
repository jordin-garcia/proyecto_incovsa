# Variables de entorno

Esta sección se completa con el archivo `.env.example` del proyecto, junto con el código. Las credenciales reales nunca se escriben en este documento ni en el repositorio (RNF-10): solo viven en variables de entorno del servidor.

# Configuración de desarrollo

Esta sección se completa en el Entregable No. 3, junto con el manual técnico de instalación (Documento 5).

# Configuración de producción

Esta sección se completa en el Entregable No. 3, cuando INCOVSA defina el hosting (P-10).

# Migraciones

Los cambios de estructura de la base de datos se gestionan con **Prisma Migrate**. El esquema completo (tablas, campos, relaciones, índices y restricciones del diccionario de datos) vive en un solo archivo, `prisma/schema.prisma`, y cada cambio se guarda como una migración SQL fechada en `prisma/migrations/`. Las migraciones se suben al repositorio y nunca se editan después de aplicarse.

## Flujo para crear una migración

1. Se modifica `prisma/schema.prisma` en una rama de trabajo (`feature/<modulo>-<descripcion>`).
2. Se genera la migración en la base de datos local de desarrollo con el comando de abajo. Prisma compara el esquema con la base de datos, escribe el archivo SQL en `prisma/migrations/<fecha>_<descripcion>/migration.sql`, lo aplica y vuelve a generar el cliente de Prisma.
3. Se revisa el SQL generado: que no borre columnas con datos sin querer y que respete la eliminación lógica de camiones y usuarios.
4. Se sube la migración en el mismo pull request que el código que la usa. Un pull request se acepta solo si las migraciones corren desde cero (`npx prisma migrate reset` en una base vacía).

```
npx prisma migrate dev --name <descripcion-del-cambio>
```

## Aplicar las migraciones en otro equipo o en producción

Un desarrollador nuevo, o el servidor de producción, aplica todas las migraciones pendientes con:

```
npx prisma migrate deploy
```

Este comando aplica en orden las migraciones que todavía no están registradas en la tabla `_prisma_migrations` y no genera migraciones nuevas. Después se carga la semilla, que solo lleva datos que no son personales ni de producción: sedes, permisos, estados de las rutas y los pedidos, las dos opciones de envío de cada sede, «Usuario de ejemplo NN» y los camiones de Quetzaltenango con sus capacidades:

```
npx prisma db seed
```

## Reglas

- Antes de aplicar una migración en producción se hace un respaldo de la base de datos (sección «Respaldos»).
- Los campos `creado_en` y `actualizado_en` los pone la base de datos o Prisma, nunca la aplicación (RN-57).
- Los datos de producción no se cargan con migraciones: el contenido del sitio lo cargan los usuarios desde el panel, y los pedidos facturados llegan en cada archivo de Odoo.
