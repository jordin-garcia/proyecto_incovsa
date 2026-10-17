---
id: JG-03
titulo: Esquema completo de la base de datos, migración inicial y semillas
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JG-02, JG-04]
programada: 2026-10-17
requisitos: [RN-52, RN-57, RNF-06, RNF-18]
pantallas: []
---

# JG-03 · Esquema completo de la base de datos, migración inicial y semillas

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-02, JG-04

## Objetivo
Crear **de una sola vez** el esquema completo de Prisma (todas las tablas de los dos sistemas), la migración inicial, la base de pruebas para Vitest y las dos semillas (base y de demostración). Así nadie más toca el esquema en paralelo (specs/16, decisión 65).

## Contexto que debes leer
- `specs/14-modelo-de-datos.md` **completo**
- `entregable-2/documento-2/02b-diccionario-de-datos.md` **completo**: tablas, campos, tipos, longitudes, nulos, unicidad. Es el esquema diseñado; manda `specs/14` si difieren
- `entregable-2/documento-2/02-modelado-y-datos.md` §"Reglas de integridad"
- `specs/16`: decisiones 1 a 6, 18, 19, 22, 26, 35, 41, 42, 45 y 79; "Estructura de carpetas"
- `specs/13-datos-maestros.md` ("Carga inicial" y "Datos personales") y `plan/convenciones.md` §5 y §6
- `specs/03-roles-y-accesos.md` (catálogo de permisos) y `specs/05-sitio-web.md` (misión, visión, industrias, mapas)
- Prototipo: `entregable-1/prototipos/simulacion/src/base.js` › `PERMISOS`, `INDUSTRIAS`, `PRODUCTOS_PUB_BASE`, `MAPAS` y `semilla()` (cuentas de ejemplo, camiones y contacto)
- Context7: Prisma 7 (`prisma.config.ts`, adaptador `@prisma/adapter-pg`, `@@map`, `@db.Decimal(12, 3)`, `@db.Timestamptz`, migraciones con SQL propio y semillas) y Better Auth 1.7 (esquema de Prisma y nombres de modelos personalizados)

## Qué hacer
1. `prisma/schema.prisma` con **todas** las tablas del diccionario, en `snake_case` con `@@map` y `@map`, y modelos en `PascalCase` en español:
   - **Acceso:** `sede`, `usuario`, `cuenta`, `sesion`, `verificacion` (las cuatro de Better Auth, con los campos propios del proyecto y los nombres que exige Better Auth mapeados), `permiso`, `usuario_permiso`, `usuario_sede`, `bitacora`.
   - **Picking:** `camion`, `opcion_envio`, `pedido_facturado`, `detalle_pedido_facturado`, `estado_envio`, `envio`, `linea_preparacion`, `historial_estado`, `entrega_ruta`.
   - **Sitio:** `configuracion_sitio`, `contenido_institucional`, `valor`, `industria`, `producto_sitio`, `producto_industria`, `noticia`, `imagen`, `producto_documentado`, `solicitud_contacto`, `informacion_contacto`, `pais`, `departamento`, `municipio`.
2. Reglas del esquema:
   - cantidades y Peso de Conversión `Decimal(12,3)`; fechas `timestamptz`; `creado_en` con `@default(now())` en todas las tablas y `actualizado_en` con `@updatedAt` en las que se modifican (decisión 19);
   - **lote** `NOT NULL DEFAULT ''` en `detalle_pedido_facturado` y `linea_preparacion` (decisión 42);
   - unicidades: (`display_username`, `sistema`) en `usuario`, `username` y `email` de Better Auth; (`sede_id`, `tipo`) en `opcion_envio`; (`sede_id`, `tipo`, `fecha_envio`, `numero`) en `envio` (decisión 18); (`envio_id`, `producto`, `lote`, `peso_conversion_kg`) en `linea_preparacion`; (`nombre`, `pais_id`, `lote`) en `producto_documentado`; `folio` en `solicitud_contacto`; las del diccionario;
   - `numero_odoo` **sin** unicidad, con índice (decisión 4);
   - en una migración con SQL propio: CHECK de cantidades y Peso de Conversión > 0, capacidad del camión > 0, posición de `imagen` y de `valor` de 1 a 5, `sistema` en (`sitio`, `picking`, `ambos`), `tipo` del envío en (`ruta`, `pedido`); y un **disparador que rechaza UPDATE, DELETE y TRUNCATE sobre `bitacora`** (decisión 5: no se edita ni se borra);
   - eliminación lógica (`eliminado_en`) en `usuario` y `camion` (decisión 2); borrado en cascada solo en las tablas hijas que dice el diccionario.
3. `prisma.config.ts` (Prisma 7) y `src/lib/prisma.ts` (cliente único con `@prisma/adapter-pg`).
4. Scripts de `npm`: `db:migrar` (`prisma migrate dev`, solo el coordinador), `db:aplicar` (`prisma migrate deploy`), `db:reiniciar` (`prisma migrate reset --force` sobre la base local), `db:semilla` (semilla base) y `semilla:demo`.
5. **Semilla base** (`prisma/seed.ts`, idempotente; specs/13 y `plan/convenciones.md` §5):
   - sedes: `XE` Quetzaltenango (con oficina), `GT` Guatemala (con oficina), `ESC` Escuintla (sin oficina);
   - los 16 permisos de `specs/03` con los códigos del prototipo (`sit.contenido` … `pk.cfg.camiones`, `base.js` › `PERMISOS`);
   - los 4 estados (En Preparación, Despachado, En Ruta, Entregado); las 2 opciones de envío de cada sede (`camion` y `recoge`);
   - los países con su nombre en español (`libphonenumber-js` › `getCountries()` y `Intl.DisplayNames(['es'], { type: 'region' })`; decisión 45), y los 22 departamentos y sus municipios de `entregable-1/prototipos/simulacion/datos/guatemala.json`;
   - las 9 industrias en el orden de `specs/05`, con la descripción de `base.js` › `INDUSTRIAS`;
   - `contenido_institucional`: misión y visión con los textos exactos de `specs/05`, historia vacía; `configuracion_sitio` sin logotipos subidos; los 5 `valor` sin imagen;
   - `informacion_contacto` de Quetzaltenango y Guatemala solo con el mapa de `specs/05` (lo demás vacío: lo carga INCOVSA desde el panel).
6. **Semilla de demostración** (`prisma/semilla-demo.ts`, solo desarrollo, idempotente):
   - las 11 cuentas de ejemplo de `base.js` › `semilla()` ("Usuario de ejemplo 01" a "11", usuarios `ejemplo.01` a `ejemplo.11`, con su sistema, rol, permisos y sedes; `ejemplo.03` existe en los dos sistemas), con la contraseña de la variable `CLAVE_DEMO`, cifrada con la función de Better Auth (scrypt). Si `CLAVE_DEMO` no existe o tiene menos de 8 caracteres, la semilla se detiene con un mensaje claro;
   - Camión 1 (3,400 kg), Camión 2 (3,400 kg) y Camión 3 (6,000 kg) en Quetzaltenango;
   - los 28 productos públicos de `base.js` › `PRODUCTOS_PUB_BASE` (nombre e industrias; descripción, presentación y países de origen vacíos), cada uno con su imagen de `pruebas/fixtures/catalogo/NN.webp` (JG-04), copiada a `almacenamiento-local/imagenes/demo/` y registrada en `imagen` con la dirección `/api/imagenes/demo/NN.webp` (el formato del almacenamiento en disco de `plan/convenciones.md` §4.4);
   - la dirección, el teléfono, el correo y el WhatsApp de las dos sedes de `base.js` › `semilla()` › `contacto`.
   - Nunca nombres reales de clientes ni datos del archivo de Odoo.
7. **Base de pruebas:** configuración de Vitest que, antes de las pruebas, aplica las migraciones a `DATABASE_URL_PRUEBAS` y carga la semilla base; y un ayudante `pruebas/bd.ts` con `limpiarTablasDeNegocio()` (vacía las tablas que llenan las pruebas, sin tocar la semilla base) para usar en `beforeEach`.

## Archivos que creas o modificas
- `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `prisma/semilla-demo.ts`, `prisma.config.ts` (crear)
- `src/lib/prisma.ts` (crear)
- `pruebas/bd.ts`, `pruebas/configuracion-vitest.ts` (crear) y `vitest.config.ts` (modificar)
- `package.json` (scripts `db:*` y `semilla:demo`)
- `src/lib/esquema.test.ts` o `prisma/esquema.test.ts` (crear)

## Criterios de aceptación
1. `npm run db:reiniciar` sobre una base vacía crea todo el esquema, y `npx prisma migrate diff` no encuentra diferencias entre el esquema y las migraciones.
2. Todas las tablas, columnas, tipos, nulos e índices del diccionario existen con los nombres del diccionario. Las de `specs/14` que el diccionario no tenga se agregan; si hay contradicción, manda `specs/14` y se anota en el `## Resultado`.
3. **RN-52:** la base rechaza dos envíos con la misma sede, tipo, fecha y número.
4. **RN-51 / decisión 42:** la base rechaza dos líneas de preparación iguales del mismo envío **también cuando el lote está vacío**.
5. La base rechaza cantidades, Peso de Conversión y capacidades ≤ 0, una imagen o un valor con posición 6 y un `sistema` distinto de `sitio`, `picking` o `ambos`.
6. **RN-39:** UPDATE, DELETE o TRUNCATE sobre `bitacora` fallan con un error del disparador.
7. **RN-57:** al insertar un registro sin `creado_en`, la base pone la fecha y hora actuales.
8. Las dos semillas se pueden ejecutar dos veces seguidas sin duplicar nada. La semilla base deja exactamente 3 sedes, 16 permisos, 4 estados, 6 opciones de envío, 9 industrias y 22 departamentos.
9. Después de `npm run semilla:demo`, `ejemplo.03` existe como dos cuentas (sitio y picking) y `ejemplo.01` y `ejemplo.02` tienen el sistema `ambos`.
10. `npm test` usa `DATABASE_URL_PRUEBAS`, nunca la base de desarrollo.

## Pruebas obligatorias
- Integración contra la base de pruebas de los criterios 3 a 9 (`it("RN-52: …")`, etc.)

## Verificación
```
npm run db:reiniciar
npm run db:semilla && npm run db:semilla
npm run semilla:demo && npm run semilla:demo
npm run verificar
npm run build
```

## Fuera de alcance
- Lógica de negocio y pantallas de cualquier módulo.
- La configuración de Better Auth (JG-06): aquí solo sus tablas.
- El contenido oficial del sitio (DM-12).

## Notas
- Los demás integrantes aplican las migraciones con `npm run db:aplicar`. Si después alguien necesita un cambio del esquema, lo pide al coordinador (protocolo §C).
- En el `## Resultado`, deja el nombre de cada modelo de Prisma y cómo usar `pruebas/bd.ts` en las pruebas de integración.
- Los productos de cada industria son los productos públicos con esa industria (P-97, specs/05): el esquema no necesita una lista aparte.
