---
id: JG-03
titulo: Esquema completo de la base de datos, migración inicial y semillas
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
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

## Resultado

El esquema completo de los dos sistemas está en `prisma/schema.prisma` (32 tablas), con dos migraciones: `20261017120000_inicial` (tablas, claves e índices) y `20261017120100_restricciones` (SQL propio: los CHECK y los disparadores de la bitácora). Las semillas base y de demostración son idempotentes, y `npm test` usa una base de pruebas propia, que prepara solo.

### Modelos de Prisma

| Grupo | Modelo (`prisma.<modelo>`) → tabla |
|---|---|
| Acceso | `Sede` → `sede`, `Usuario` → `usuario`, `Cuenta` → `cuenta`, `Sesion` → `sesion`, `Verificacion` → `verificacion`, `Permiso` → `permiso`, `UsuarioPermiso` → `usuario_permiso`, `UsuarioSede` → `usuario_sede`, `Bitacora` → `bitacora` |
| Picking | `Camion`, `OpcionEnvio`, `PedidoFacturado`, `DetallePedidoFacturado`, `EstadoEnvio`, `Envio`, `LineaPreparacion`, `HistorialEstado`, `EntregaRuta` (tablas en `snake_case`) |
| Sitio | `ConfiguracionSitio`, `ContenidoInstitucional`, `Valor`, `Industria`, `ProductoSitio`, `ProductoIndustria`, `Noticia`, `Imagen`, `ProductoDocumentado`, `SolicitudContacto`, `InformacionContacto`, `Pais`, `Departamento`, `Municipio` |

- Los campos van en `camelCase` con `@map` a las columnas del diccionario: `pesoConversionKg`, `cantidadKg`, `creadoEn`, `actualizadoEn`, `eliminadoEn`. Las claves foráneas que en el diccionario no terminan en `_id` llevan el sufijo `Id` en Prisma, y su relación conserva el nombre: `cargadoPorId` / `cargadoPor` (`cargado_por`), `enviadoPorId` / `enviadoPor` (`enviado_por`) y `creadoPorId` / `creadoPor` (`creado_por`).
- Las tablas de Better Auth conservan los nombres de campo de Better Auth: `name`, `email`, `emailVerified`, `image`, `username`, `displayUsername`, `createdAt` y `updatedAt`, mapeados a `email_verified`, `display_username`, `created_at`, etc. Además están los campos del proyecto: `sistema`, `rol`, `correo`, `activo` y `eliminadoEn`. En JG-06 se configuran con `user: { modelName: "usuario" }`, `account: { modelName: "cuenta" }`, `session: { modelName: "sesion" }` y `verification: { modelName: "verificacion" }`. Los campos del proyecto van en `additionalFields`.
- Cantidades y Peso de Conversión: `Decimal` (`@db.Decimal(12, 3)`). Fechas: `timestamptz(3)`. `fecha_envio` y `fecha_programada` son `date`, y `hora_programada` es `time(0)`.

### Cómo usarlo

- **Cliente:** `import { prisma } from "@/lib/prisma"` es el cliente único, con el adaptador `@prisma/adapter-pg` sobre `DATABASE_URL`. Se conecta en la primera consulta, así que `next build` no necesita la variable. Para otra base: `crearClientePrisma(url)`. Los tipos se importan de `@/generated/prisma/client` (por ejemplo, `Prisma`, `type Envio`). El cliente se genera en `src/generated/prisma/` (ignorado por Git) con `npx prisma generate`, que corre solo en el `postinstall` de `npm ci`.
- **Comandos:** `npm run db:aplicar` (migraciones), `npm run db:semilla` (semilla base), `npm run semilla:demo` (cuentas, camiones y productos de ejemplo; exige `CLAVE_DEMO` de 8 caracteres o más) y `npm run db:reiniciar` (borra la base local y vuelve a migrar; después hay que volver a ejecutar las dos semillas). `npm run db:migrar` es solo del coordinador. Con un agente de IA, Prisma pide la confirmación expresa de la persona antes de `db:reiniciar`.
- **Cuentas de demostración:** `ejemplo.01` (Gerencia) y `ejemplo.02` (Soporte) con el sistema `ambos`; `ejemplo.03` a `ejemplo.07` en el picking (Quetzaltenango); `ejemplo.08` a `ejemplo.10` en el sitio; y `ejemplo.03` también en el sitio. Son las 11 cuentas del prototipo: la 11 del prototipo es `ejemplo.03` del sitio, así que no existe un `ejemplo.11`. La contraseña es `CLAVE_DEMO`, cifrada con `hashPassword` de `better-auth/crypto`. La clave de acceso interna es `<sistema>.<usuario>` (`picking.ejemplo.03`) y el correo interno, `<clave>@incovsa.invalid`. Los dos los arman `claveAccesoInterna` y `correoInterno` de `@/lib/cuentas`, y JG-06 y CE-03 deben usar esas mismas funciones.
- **Pruebas de integración:** `npm test` exige `DATABASE_URL_PRUEBAS`, una base distinta de `DATABASE_URL` (salvo en la CI). Antes de las pruebas aplica las migraciones y carga la semilla base (`pruebas/configuracion-vitest.ts`), y dentro de las pruebas `DATABASE_URL` apunta a la base de pruebas. Los archivos se ejecutan uno tras otro (`fileParallelism: false`) porque comparten la base. Plantilla:
  ```ts
  import { beforeEach, it, expect } from "vitest";
  import { prisma } from "@/lib/prisma";
  import { limpiarTablasDeNegocio } from "../../../pruebas/bd";

  beforeEach(async () => {
    await limpiarTablasDeNegocio(); // base recién sembrada, identificadores desde 1
  });
  ```
  `limpiarTablasDeNegocio()` vacía todas las tablas que llenan las pruebas (usuarios, bitácora, camiones, envíos, contenido del sitio…) y vuelve a crear las opciones de envío y el contenido inicial del sitio. Conserva las sedes, los permisos, los estados, los países, los departamentos y los municipios. Tarda unos 100 ms.
- **Errores de la base:** una unicidad rechazada llega como `Prisma.PrismaClientKnownRequestError` con `code: "P2002"`. Un CHECK o el disparador de la bitácora llegan como error del adaptador, con el nombre de la restricción en el mensaje (por ejemplo, `camion_capacidad_kg_positiva`).
- **Galerías (DM-04):** la posición de `imagen` es única en su galería y va de 1 a 5, y la base no permite diferir la comprobación. Para reordenar una galería, borra sus imágenes y vuelve a insertarlas con las posiciones nuevas, en una transacción; un UPDATE que intercambia dos posiciones falla.

### Decisiones tomadas

- **Donde manda `specs/14` sobre el diccionario:** el lote de `detalle_pedido_facturado` y `linea_preparacion` es `NOT NULL DEFAULT ''` (decisión 42), y `pedido_facturado` tiene `actualizado_en`, porque se modifica. La "acción" del permiso es su `descripcion`, como en `specs/03`. La prueba `JG-03 criterio 2` lee el diccionario y compara cada tabla, columna, tipo, longitud, nulo, PK, FK, `ON DELETE` y unicidad con la base real; las únicas excepciones son esas dos columnas de lote.
- **Unicidad de `imagen`** (área, dueño y posición): se declara con cuatro índices únicos parciales (vista previa `partialIndexes` de Prisma 7.4+). En PostgreSQL, una restricción única con columnas nulas no impide repetidos.
- **Claves foráneas:** en cascada solo las que dice el diccionario (`cuenta`, `sesion`, `detalle_pedido_facturado`, `linea_preparacion`, `entrega_ruta` e `imagen`). Todas las demás, incluidas las opcionales, son `ON DELETE RESTRICT`.
- **CHECK** (migración de restricciones): cantidades, Pesos de Conversión y `entrega_ruta.total_kg` > 0; capacidad del camión > 0; posición de `imagen` y `valor` de 1 a 5; `usuario.sistema` en (`sitio`, `picking`, `ambos`); `envio.tipo` en (`ruta`, `pedido`). Disparadores `bitacora_sin_cambios` (UPDATE y DELETE) y `bitacora_sin_vaciar` (TRUNCATE), con el mensaje "La bitácora no se edita ni se borra (RN-39)".
- **`actualizado_en`** lleva `@default(now())` además de `@updatedAt`, para que un INSERT con SQL propio también funcione.
- **Semilla base:** usa `createMany({ skipDuplicates })`, que crea solo lo que falta y nunca sobrescribe el contenido que INCOVSA edita. Los países son los 245 de `libphonenumber-js`, con su nombre de `Intl.DisplayNames(["es"])`. Los departamentos y municipios salen de `prisma/datos/guatemala.json`, una copia del archivo del prototipo, para que la semilla no dependa de `entregable-1/`. El logotipo de Inquiserca se siembra con `/marca/inquiserca.webp`, porque `specs/05` dice que "viene cargado"; vacío significa quitado. El de INCOVSA vacío significa el recibido.
- **Semilla de demostración:** cada producto se reconoce por su imagen `/api/imagenes/demo/NN.webp`, porque hay nombres repetidos ("Soda Cáustica" tres veces). Al repetirla se actualizan la contraseña (si cambió `CLAVE_DEMO`) y los datos de las cuentas y del contacto. Se niega a correr con `NODE_ENV=production`.
- **`prisma.config.ts`** lee el `.env` con `process.loadEnvFile()` de Node 24, sin agregar `dotenv`.
- **Verificación local:** se hizo con un PostgreSQL 18.6 desechable en Docker (puerto 55432). `prisma migrate diff --from-migrations` necesita una base *shadow* configurada, así que el criterio 1 se comprobó con `migrate diff --from-config-datasource --to-schema` sobre una base recién migrada desde cero: no hay diferencias.

### Archivos principales

`prisma/schema.prisma`, `prisma/migrations/**`, `prisma.config.ts`, `prisma/semillas/base.ts`, `prisma/semillas/demo.ts`, `prisma/seed.ts`, `prisma/semilla-demo.ts`, `prisma/datos/guatemala.json`, `prisma/esquema.test.ts` (21 pruebas), `src/lib/prisma.ts`, `src/lib/cuentas.ts` (con su prueba), `pruebas/bd.ts`, `pruebas/configuracion-vitest.ts`, `vitest.config.mts`, `package.json` (scripts `db:*`, `semilla:demo` y `postinstall`), `.gitignore`, `.prettierignore` y `eslint.config.mjs` (ignoran `src/generated/`), y las precisiones en `specs/14` y `specs/18`.
