# Convenciones del proyecto

Reglas técnicas que todo agente cumple en todas las tareas. Complementan `specs/16-arquitectura-y-tecnologia.md`, que manda si algo se contradice.

---

## 1. Estructura del código

```
src/
├── app/
│   ├── (sitio)/                 sitio público: Inicio, nosotros, industrias, productos, noticias, contacto
│   ├── acceso/                  acceso personal (usuario → sistema → contraseña) y los dos inicios de sesión
│   ├── panel/                   panel del sitio: resumen, contenido, industrias, catalogo, noticias, contacto,
│   │                            solicitudes, documentos, usuarios
│   ├── picking/                 facturacion, bodega, tablero, ruta, reportes, configuracion
│   └── api/                     tiempo-real (SSE), reportes/exportar, imagenes (solo desarrollo)
├── modulos/<modulo>/            lógica de negocio: servicio.ts, esquemas.ts (Zod), acciones.ts (acciones del
│                                servidor) y sus pruebas *.test.ts
├── componentes/
│   ├── ui/                      componentes de shadcn/ui con los tokens del design system
│   ├── comunes/                 componentes propios compartidos (ventana de confirmación, avisos, tabla,
│   │                            chips de estado, campo de fecha y hora, galería, íconos, encabezado de módulo)
│   └── <area>/                  componentes de un área: sitio, panel, picking
├── lib/                         cliente de Prisma, las dos configuraciones de Better Auth, sesión, fechas,
│                                errores y utilidades transversales
└── proxy.ts                     primera barrera: redirige a quien no tiene sesión (no es control de acceso)
prisma/                          schema.prisma, migrations/, seed.ts (base) y semilla-demo.ts
pruebas-e2e/                     pruebas de Playwright, una carpeta por área (sitio, panel, picking, flujo)
scripts/                         tareas.mjs, verificar-entorno.mjs, servir-prototipo.mjs, crear-admin.ts,
                                 respaldo.sh, anonimizar-odoo.mjs y los scripts de la CI
vendor/                          xlsx-0.20.3.tgz (SheetJS, instalado desde el repositorio; specs/16)
pruebas/fixtures/                datos de prueba: archivo de Odoo anonimizado y archivos inválidos
```

Módulos de `src/modulos/` (specs/16): de dominio `contenido`, `solicitudes`, `documentos`, `almacenamiento`, `camiones`, `odoo`, `envios`, `bodega`, `ruta`, `reportes`, `conversion`; transversales `permisos`, `usuarios`, `bitacora`, `tiempo-real`.

---

## 2. Propiedad de carpetas

Cada persona trabaja **solo** en sus carpetas y en las que su tarea nombra en "Archivos que creas o modificas". El coordinador puede tocar todo (`plan/protocolo.md` §E).

| Ruta | Dueño |
|---|---|
| `src/app/(sitio)/**`, `src/componentes/sitio/**`, `src/app/panel/**` (salvo `panel/usuarios`), `src/componentes/panel/**` | Daniela (`daniela`) |
| `src/modulos/contenido/**`, `src/modulos/solicitudes/**`, `src/modulos/documentos/**`, `src/modulos/almacenamiento/**`, `src/app/api/imagenes/**` | Daniela |
| `src/app/picking/facturacion/**`, `src/app/picking/reportes/**`, `src/app/api/reportes/**`, `src/componentes/picking/facturacion/**`, `src/componentes/picking/reportes/**` | José Daniel (`jose-daniel`) |
| `src/modulos/odoo/**`, `src/modulos/envios/**`, `src/modulos/reportes/**` | José Daniel |
| `src/app/picking/bodega/**`, `src/app/picking/tablero/**`, `src/app/picking/ruta/**`, `src/componentes/picking/bodega/**`, `src/componentes/picking/ruta/**` | Josué (`josue`) |
| `src/modulos/conversion/**`, `src/modulos/bodega/**`, `src/modulos/ruta/**` | Josué |
| `src/app/picking/configuracion/**`, `src/app/panel/usuarios/**`, `src/componentes/usuarios/**`, `src/componentes/picking/configuracion/**`, `src/modulos/camiones/**`, `src/modulos/usuarios/**` | Carlos (`carlos`) |
| `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.dockerignore`, `.env.produccion.example`, `scripts/respaldo.sh`, `scripts/restaurar.sh`, `.github/workflows/despliegue.yml`, `.github/workflows/produccion-*.yml` | Carlos |
| `src/lib/**`, `src/proxy.ts`, `src/app/acceso/**`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/panel/layout.tsx`, `src/app/picking/layout.tsx`, `src/componentes/ui/**`, `src/componentes/comunes/**` | Jordin (`jordin`) |
| `src/modulos/permisos/**`, `src/modulos/bitacora/**`, `src/modulos/tiempo-real/**`, `src/app/api/tiempo-real/**` | Jordin |
| `prisma/**`, `pruebas/**`, `pruebas-e2e/flujo/**`, `pruebas-e2e/comunes/**`, `pruebas-e2e/acceso/**`, `pruebas-e2e/seguridad/**`, `public/**`, `scripts/**` (salvo `respaldo.sh`), `vendor/**`, `plan/**` (salvo las tareas y bitácoras de cada persona) | Jordin |
| `pruebas-e2e/<area>/**` | El dueño de las pantallas del área probada |
| `entregable-*/**` | El responsable de cada documento (`specs/17`); el prototipo, Jordin |

Si una tarea necesita algo de una carpeta ajena (por ejemplo, un componente común que no existe), **no lo crea**: sigue `plan/protocolo.md` §C.

---

## 3. Archivos protegidos y archivos calientes

**Protegidos: solo los modifica el coordinador** (specs/16; desde JG-08 lo hace cumplir la verificación obligatoria `archivos-protegidos`):
- `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `.codex/**`, `.cursor/**`, `.agents/**`, `.mcp.json`, `.github/**` (salvo `.github/workflows/despliegue.yml` y `.github/workflows/produccion-*.yml`, que también puede modificar Carlos);
- `prisma/schema.prisma` y `prisma/migrations/**` (specs/16, decisión 65);
- `package.json`, `package-lock.json`, `.npmrc`, `vendor/**`;
- `plan/protocolo.md`, `plan/convenciones.md`, `plan/prompts/**`, `scripts/tareas.mjs` y los scripts de la CI;
- `specs/16-arquitectura-y-tecnologia.md` y `specs/19-pendientes.md`.

Si tu tarea necesita cambiar uno (por ejemplo, una columna o una dependencia), detente y pídeselo al coordinador (protocolo §C). Él lo resuelve en un PR propio, y tu tarea espera o sigue con lo demás.

**Calientes: los tocan varias personas, con cuidado:**
- `plan/tareas/<tu tarea>.md` y `plan/bitacora/<tu clave>.md`: solo los tuyos, salvo el coordinador.
- `plan/calendario.md`: solo lo reescribe `node scripts/tareas.mjs --calendario --escribir`; nunca a mano.
- `specs/**` (salvo los protegidos): si tu tarea precisa un comportamiento, agrega la precisión en el archivo del módulo y una línea en `specs/18-historial-de-decisiones.md`. Si hay conflicto al actualizar tu rama, conserva los dos cambios.

---

## 4. Cómo se escribe el código

### 4.1 Capas

- **Pantallas (`src/app/**`)**: solo presentación. Leen datos con funciones del servicio del módulo (en componentes del servidor) y cambian datos con acciones del servidor del módulo. **Nunca** tienen reglas de negocio ni consultas de Prisma.
- **Acciones (`src/modulos/<m>/acciones.ts`)**, con `"use server"`. Cada acción, en este orden:
  1. obtiene la sesión del sistema que corresponde y llama a `exigirPermiso(sesion, "<código del permiso>", sede)` (JG-07). Si falla, no revela qué datos existen;
  2. valida la entrada con el esquema Zod de `esquemas.ts`;
  3. llama al servicio;
  4. devuelve un resultado mínimo y tipado (`{ ok: true, datos }` o `{ ok: false, error }`), nunca filas crudas de la base;
  5. si cambió datos que otras pantallas muestran en tiempo real, llama a `avisarCambio(sede)` (JG-07; con SSE desde JG-10).
- **Servicios (`servicio.ts`)**: las reglas de negocio. Reciben datos ya validados y el usuario de la sesión, usan Prisma, abren las **transacciones** (`prisma.$transaction`) y escriben la **bitácora en la misma transacción** con `registrarBitacora(tx, …)` (JG-06, RN-39, specs/16 decisión 5). Se prueban solos.
- **Esquemas (`esquemas.ts`)**: Zod 4. El mismo esquema valida el formulario en el navegador (React Hook Form con su resolvedor de Zod) y la acción en el servidor.

### 4.2 Reglas que no se negocian

- El servidor **nunca confía** en lo que manda el navegador sobre el usuario: la sede, los permisos y el rol salen de la sesión y de la base de datos.
- Gerencia y Soporte tienen acceso total por su rol (specs/16, decisión 7); los roles se comparan con la función `normalizarRol` de `src/lib` (sin mayúsculas, acentos ni espacios al inicio o al final, decisión 8).
- **Cantidades en kg y Peso de Conversión:** `Decimal(12,3)` en la base. La conversión (RN-01) solo con `src/modulos/conversion` (gramos enteros). Nunca `Number` con decimales para calcular.
- **Fechas:** en la base, UTC (`timestamptz`). Días, semanas (de lunes a domingo), numeración diaria y rangos se calculan en `America/Guatemala` con las funciones de `src/lib/fechas.ts` (JG-02). En pantalla, fechas `dd/mm/aaaa` y horas `HH:MM` de 24 horas.
- **Textos de los usuarios y del archivo de Odoo**: siempre escapados. Prohibido `dangerouslySetInnerHTML`.
- **Errores:** las reglas de negocio lanzan `ErrorNegocio` (de `src/lib/errores.ts`, JG-02) con un mensaje en español para el usuario. Los errores inesperados muestran un mensaje general y el detalle solo va al registro del servidor.
- **Textos de la interfaz:** los del prototipo, palabra por palabra, salvo donde `specs/` los cambia. Los botones de estados se escriben como en `specs/`: "Ruta Despachada", "Pedido Despachado", "Ruta Entregada".
- **Nombres:** en español y con el glosario (`specs/02-glosario.md`): `pedidoFacturado`, `opcionEnvio`, `envio`, `lineaPreparacion`, `entregaRuta`, `pesoConversionKg`, `cantidadKg`.
- **Bitácora:** los nombres de las operaciones son los del prototipo (búscalos con `grep -rn "bit(" entregable-1/prototipos/simulacion/src`) y los de `specs/10` y `specs/12`. Lo que no se registra está en RN-39.
- **Accesibilidad (RNF-08):** etiquetas en todos los campos, texto alternativo en las imágenes, foco visible, navegación con teclado y contraste del design system.

### 4.3 Almacenamiento de imágenes (decisiones 44 y 78)

- Todo pasa por `src/modulos/almacenamiento` (DM-04): `guardarImagen(bytes)` valida el formato por su contenido, la vuelve a codificar con `sharp` y devuelve la **dirección pública** que se guarda en la tabla `imagen`.
- Con `ALMACENAMIENTO=disco` (desarrollo y GitHub Actions), los archivos van a `almacenamiento-local/imagenes/<clave>` (en `.gitignore`) y la dirección es `/api/imagenes/<clave>`, que sirve `src/app/api/imagenes/` solo fuera de producción.
- Con `ALMACENAMIENTO=r2` (producción), los archivos van al bucket de imágenes de R2 y la dirección es `<URL_IMAGENES>/<clave>`.
- La semilla de demostración usa la clave `demo/NN.webp`.

### 4.4 Formato

- TypeScript estricto. ESLint y Prettier con la configuración de JG-02; no se cambian por tarea.
- Componentes en `PascalCase.tsx`; funciones y variables en `camelCase`; archivos de módulo en minúsculas.

---

## 5. Base de datos y migraciones

- **Solo el coordinador** modifica `prisma/schema.prisma` y crea migraciones (`npm run db:migrar`). El esquema se crea **completo** en JG-03, a partir de `specs/14-modelo-de-datos.md` y del diccionario del Documento 2 v0.4 (`entregable-2/documento-2/02b-diccionario-de-datos.md`), con las decisiones de `specs/16`. Así nadie lo toca en paralelo.
- Si una tarea necesita un cambio del esquema, el agente se detiene y lo pide al coordinador con el cambio exacto (protocolo §C).
- Cada persona aplica las migraciones en su base local con `npm run db:aplicar` y carga los datos con `npm run db:semilla` y `npm run semilla:demo`. Con un conflicto de historial de migraciones en local: `npm run db:reiniciar`.
- Las migraciones aplicadas nunca se editan.
- **Semillas:** `prisma/seed.ts` lleva solo datos base no personales (sedes, permisos, estados, opciones de envío, países, departamentos y municipios, industrias, misión y visión, mapas de las sedes). `prisma/semilla-demo.ts` lleva los datos de desarrollo: las cuentas "Usuario de ejemplo NN" del prototipo, los camiones "Camión 1" a "Camión 3" y los productos públicos de prueba. **Nunca** datos reales de clientes.

---

## 6. Pruebas

- **Vitest**, junto al código (`*.test.ts`), contra una base PostgreSQL de **pruebas real** (`incovsa_pruebas`, variable `DATABASE_URL_PRUEBAS`). Nada de simular Prisma.
- Cada criterio de aceptación tiene al menos una prueba. El nombre empieza con el código que cubre: `it("RN-51: agrupa por producto, lote y Peso de Conversión", …)`.
- Primero las pruebas, y se confirma que fallan por la razón esperada (fase roja). Nunca se debilitan, se omiten ni se borran.
- Cada acción del servidor nueva tiene una prueba que confirma que rechaza a un usuario sin sesión, sin el permiso o de otra sede.
- **Playwright** en `pruebas-e2e/<area>/`, con localizadores por rol y texto visible. Proyectos: `telefono` (390 × 844), `tableta` (768 × 1024), `escritorio` (1440 × 900) y `tv` (1920 × 1080, solo el tablero). Accesibilidad con `@axe-core/playwright`, sin violaciones serias ni críticas.
- Los datos de prueba del archivo de Odoo están en `pruebas/fixtures/` (JG-04). El archivo real de INCOVSA nunca se sube.

---

## 7. Pantallas: fidelidad al prototipo

El criterio es el de specs/16 (decisión 74): **mismos textos, estructura, orden, estados y colores del design system**; no se exige coincidencia píxel por píxel, porque el prototipo tiene otros datos.

Para cada pantalla de la tarea:
1. Levanta el prototipo con `node scripts/servir-prototipo.mjs` y ábrelo con Playwright. Entra con el botón **"Demostración"** del prototipo (cuentas de ejemplo con la contraseña `demo`), o directo con `?cuenta=` en la ruta: por ejemplo `http://127.0.0.1:4173/#/picking/facturacion?cuenta=ejemplo.03` o `#/panel/contenido?cuenta=ejemplo.08`. Las cuentas son las de `base.js` › `semilla()`: `ejemplo.01` Gerencia, `ejemplo.02` Soporte, `ejemplo.03` y `ejemplo.04` facturadores, `ejemplo.05` Bodega, `ejemplo.06` y `ejemplo.07` pilotos, `ejemplo.08` administrativo del sitio, `ejemplo.09` y `ejemplo.10` documentación interna. Para volver a los datos iniciales: "Demostración" → reiniciar.
2. Lee la función del prototipo que dibuja esa pantalla (la tarea dice cuál, por ejemplo `picking.js` › `facturacion()`), sus estilos en `estilos.css` y los textos exactos.
3. Implementa con los componentes de `src/componentes/` y **solo** los tokens del design system (JG-05). No se agregan colores, tamaños, sombras ni fuentes nuevos.
4. Compara lado a lado la aplicación y el prototipo en 390 px, 768 px y 1440 px (y 1920 px en el tablero): textos, orden, datos mostrados, estados (vacío, cargando, error, con datos), mensajes, ventanas de confirmación, avisos e interacción.
5. Pega las capturas de los dos en el PR.
6. **En diseño manda el prototipo** (`specs/16`, decisión 89): si `specs/` describe cómo se ve una pantalla de otra forma (disposición, estructura visual, tamaños, colores, tipografía, espaciado o estilos), sigue el prototipo y corrige `specs/`. Donde `specs/` cambia los textos, los datos o el comportamiento, manda `specs/`. Anótalo en "Decisiones tomadas" del PR.

Lo que el prototipo tiene y la aplicación **no** (botón "Demostración", notas amarillas P-xx, leyenda "Prototipo para validación", `localStorage`) está en `specs/20-prototipo-aprobado.md`.

---

## 8. Git y pull requests

- Rama: `<clave>/<ID>-<descripcion-corta>` desde `develop` actualizado (ejemplo: `josue/JM-03-bodega-preparacion`).
- *Commits* pequeños, en español: `feat(bodega): marcado de filas (JM-03)`. Prefijos: `feat`, `fix`, `docs`, `db`, `test`, `chore`.
- Título del PR: `[<ID>] <título de la tarea>`. Cuerpo: `.github/pull_request_template.md`.
- Integración **squash** en `develop`, automática cuando pasan todas las verificaciones obligatorias, incluida la del bot de Claude (`revision-claude`). No hace falta aprobación humana (specs/16, decisión 60).
- `develop` se integra en `main` **solo el lunes 02/11/2026**, por el coordinador, y eso despliega a producción.

---

## 9. Seguridad: lista mínima de cada PR

- `exigirPermiso` en cada acción del servidor, ruta de la API y lectura de datos internos; nunca solo `proxy.ts` ni ocultar botones.
- Zod en toda entrada, incluidos los archivos (.xlsx de hasta 2 MB; imágenes JPG, PNG o WebP de hasta 5 MB validadas por su contenido).
- Ninguna consulta SQL armada con textos; `$queryRaw` solo con plantilla.
- Ningún secreto en el código, en los registros ni en las respuestas.
- Enlaces de la documentación interna: solo `https://drive.google.com` o `https://docs.google.com`, y el sistema arma la vista previa y la descarga (specs/16, decisión 21).
- Versiones mínimas de las dependencias de specs/16, decisión 59.
