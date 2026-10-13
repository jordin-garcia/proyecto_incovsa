# Guía para aplicar los cambios de la reunión 4 al prototipo de simulación

**Para:** el agente (Claude) que hará los cambios en una conversación nueva.
**Preparada:** 11/10/2026, al cerrar la incorporación de los cambios a `specs/` (versión 1.1).
**Resultado esperado:** `entregable-1/prototipos/prototipo-simulacion-incovsa.html` regenerado, que se comporta exactamente como describe `specs/`.

---

## 0. Antes de empezar

### 0.1 Reglas de trabajo con Jordin García (coordinador)

- **No asumir nada.** Si algo de esta guía o de `specs/` es ambiguo, se pregunta antes de programar. Toda la información debe ser real; no se inventan nombres, números ni reglas.
- **Sin extras.** Solo se implementa lo que está en `specs/` y en esta guía.
- Trabaja en español. Herramientas gratuitas.
- **No hacer commit ni push** salvo que Jordin lo pida. El HTML armado **nunca** se sube: contiene datos reales (RNF-10). Hoy no está en `.gitignore`; avisar a Jordin si se va a hacer un commit.

### 0.2 Fuente de verdad

`specs/` manda sobre esta guía. Si la guía y `specs/` dicen cosas distintas, vale `specs/` y se avisa a Jordin. Leer **completos** antes de tocar código:

| Archivo | Para qué |
|---|---|
| `specs/20-prototipo-aprobado.md` | Qué partes del prototipo se conservan, el design system y el registro de cambios CAM-01 a CAM-39 |
| `specs/03-roles-y-accesos.md` | Permisos, roles, sedes, pilotos, contraseñas, bitácora |
| `specs/05-sitio-web.md` | Sitio público, panel, documentos, **tabla "Textos que se reemplazan"** |
| `specs/06-picking-facturacion.md` | Nueva Facturación (tablero de pedidos facturados y opciones de envío) |
| `specs/07`, `08`, `10`, `11` | Bodega, Ruta, Reportes, Configuración |
| `specs/12-reglas-de-negocio.md` | RN-01 a RN-49 |
| `specs/13-datos-maestros.md` | Conversión del catálogo, clientes duplicados, estructura del archivo de Odoo |
| `specs/14-modelo-de-datos.md` | Entidades (el estado `S` del prototipo debe reflejarlas) |

### 0.3 Cómo está hecho el prototipo

- El HTML **no se edita a mano**: se genera. El código fuente está en `entregable-1/prototipos/simulacion/src/`:

| Archivo | Contenido |
|---|---|
| `base.js` | Utilidades, íconos, catálogos fijos (`SEDES`, `ROLES_P`, `ROLES_S`, `ACCESO_P`, `MODULOS_P`, `INDUSTRIAS`, `PRODUCTOS_PUB_BASE`), estado compartido `S` (localStorage + BroadcastChannel), operaciones de negocio (`opEnviarPedido`, `opDespachar`, `opEntregar`, `opCompra`…), `semilla()`, sesiones, componentes (`modal`, `toast`, `ordenable`, `autocompletar`), `siluetaCamion()` |
| `sitio.js` | Sitio público (`Sitio.inicio`, `nosotros`, `industrias`, `catalogo`, `producto`, `noticias`, `contacto`, `acceso`, `login`) |
| `panel.js` | `armazon()` (barra lateral de las apps internas) y el panel del sitio (`Panel`) |
| `picking.js` | Módulos del picking (`facturacion`, `bodega`, `rutaMod`, `inventario`, `reportes`, `configuracion`) |
| `tablero.js` | Tablero de Bodega en pantalla completa |
| `inicio.js` | Enrutador, panel "Demostración", arranque |
| `estilos.css` | Design system (no cambiar tokens salvo lo indicado) |
| `plantilla.html` | Plantilla donde se insertan estilos, recursos, datos y código |

- `construir.py` (en `simulacion/`) lee `docs_incovsa/` (fuera del repo), arma `window.RECURSOS` y `window.DATOS` y escribe el HTML. Requiere Python 3 con Pillow, numpy y openpyxl. Se ejecuta desde `entregable-1/prototipos/simulacion/` con `python construir.py`.
- **Subir `VER`** en `base.js` (hoy `3`) al cambiar la forma de `S`, para que el navegador descarte el estado viejo de localStorage.

### 0.4 Orden recomendado

1. `construir.py` (datos y recursos).
2. `base.js` (catálogos, estado, operaciones, semilla, permisos).
3. `panel.js` (armazón con menú colapsable y panel del sitio).
4. `sitio.js`.
5. `picking.js` y `tablero.js`.
6. `inicio.js` (demostración).
7. `estilos.css`.
8. Armar, probar con la lista de la sección 12 y mostrar el resultado a Jordin.

---

## 1. `construir.py`: datos y recursos

### 1.1 Productos del picking (specs/13, RN-15, P-80 resuelto)

Hoy `datos()` entrega `[codigo, unidadMedida, peso2, existenciaXela]`. Debe entregar **solo `[nombre, pesoConversion]`**:

1. Leer la hoja "Base Datos Productos" de `Picking II.xlsm` (columna A = código, columna C = `Peso2`). Saltar el duplicado exacto (`ACIDO ACETICO-GUA-GAR/0030KG-GLACI-8566`).
2. **Excluir** estos 3 códigos (no se cargan): `METABISULFITO DE SODIO II`, `SAL (INVENTARIO II)`, `TRICLORO GRANULAR-TON/0050KG-9127`.
3. **Corregir** estos 6 códigos antes de convertir (agregar el guion que falta):

| Código original | Código corregido |
|---|---|
| `SULFATO DE ALUMINIO TUR-SAC/0025KG-5449` | `SULFATO DE ALUMINIO-TUR-SAC/0025KG-5449` |
| `SULFATO DE ALUMINIO TUR-SAC/0025KG-9232` | `SULFATO DE ALUMINIO-TUR-SAC/0025KG-9232` |
| `SULFURO DE SODIO TUR-SAC/0025KG-9131` | `SULFURO DE SODIO-TUR-SAC/0025KG-9131` |
| `SULFATO DE SODIO CHI-SAC/0050KG-4765` | `SULFATO DE SODIO-CHI-SAC/0050KG-4765` |
| `SULFATO DE SODIO CHI-SAC/0050KG-0823` | `SULFATO DE SODIO-CHI-SAC/0050KG-0823` |
| `SODA CAUSTICA-CHISAC/0025KG-1240` | `SODA CAUSTICA-CHI-SAC/0025KG-1240` |

4. **Convertir al formato de Odoo**: quitar el último segmento (lote); el primer segmento posterior al nombre que sea exactamente 3 letras mayúsculas es el origen; el nombre es lo anterior, y lo demás va entre paréntesis: `NOMBRE (ORIGEN-ENVASE/PRESENTACIÓN[-CALIDAD])`. Ejemplo: `SODA ASH-TUR-SAC/0025KG-5275` → `SODA ASH (TUR-SAC/0025KG)`.
5. Unir los códigos que dan el mismo nombre. El Peso de Conversión es igual en todos, salvo `METANOL (GUA-TON/0055GL)`: usar **164**.
6. **Verificación obligatoria:** deben quedar **339 productos** y ningún nombre con dos pesos distintos. Imprimir el conteo; si no da 339, detenerse y avisar.

No se calculan existencias: quitar toda la lectura de `INVENTARIO INCOVSA.xlsx`.

### 1.2 Clientes y sectores (specs/13, decisión del 11/10)

- Leer "Base Datos Clientes" de `Picking II.xlsm` (columna B = nombre, columna C = sector). **Usar los nombres reales** (decisión de Jordin del 11/10: el HTML no se sube al repositorio). Quitar el comentario "el nombre real no se usa: se anonimiza".
- Duplicados (318 filas, 6 nombres repetidos):
  - **4 duplicados exactos** (mismo nombre y mismo sector, comparando el sector sin mayúsculas, espacios, comas ni puntos; así "sector 1 salcaja" y "Sector 1, Salcaja" son el mismo): se deja **un solo registro**, con el sector del **primer** registro del archivo.
  - **2 nombres con sectores distintos**: se dejan **los dos registros**.
- **Verificación obligatoria:** deben quedar **314 clientes**. Imprimir el conteo.
- Sectores: los textos tal como vienen (sin normalizar), sin repetir.
- Entregar `clientes` como `[[nombre, indiceSector], …]` y `sectores` como lista de textos.

### 1.3 Recursos nuevos

| Clave | Contenido |
|---|---|
| `A.mision` | `MISION.jpg` **completa** (con su texto), en WebP, ancho máximo de unos 1400 px |
| `A.vision` | `VISION.jpg` **completa**, igual |

Se conservan `logo`, `logoBlanco`, `fotoEquipo`, `fotoReunion`, `catalogo` y `pdf`. `logoTrans` y `logoTransBlanco` ya **no** deben usarse en el sitio público (ver 4.1); se pueden dejar de generar si nada los usa.

### 1.4 Librerías externas

Se cargan desde CDN en `plantilla.html`, con **versión exacta** (verificar en la conversación que la URL existe antes de usarla):

| Librería | Uso | URL sugerida |
|---|---|---|
| SheetJS (`xlsx`) | Leer el .xlsx de Odoo en el navegador | `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js` |
| libphonenumber-js | Lista de códigos telefónicos por país y validación del teléfono | `https://cdn.jsdelivr.net/npm/libphonenumber-js@1.11.4/bundle/libphonenumber-min.js` (expone `window.libphonenumber`) |

Nombres de países en español: `Intl.DisplayNames(['es'], { type: 'region' })` con los códigos de país de libphonenumber (`getCountries()`), ordenados alfabéticamente.

**Departamentos y municipios de Guatemala:** los 22 departamentos y sus municipios (340 en total) se toman de una **fuente oficial** (INE o SEGEPLAN de Guatemala). No escribirlos de memoria. Guardar la lista en un archivo de datos dentro de `simulacion/` (por ejemplo `datos/guatemala.json`) que `construir.py` inserte, y verificar que sean 22 y 340. Si no se encuentra una fuente oficial, preguntar a Jordin.

---

## 2. `base.js`: catálogos, estado y reglas

### 2.1 Términos (deben verse así en la interfaz)

| Término | Significado |
|---|---|
| **Pedido facturado** | Una referencia de Odoo, de un solo cliente. Se identifica con su número de Odoo (tercer segmento de la Referencia) |
| **Tablero de pedidos facturados** | Lado izquierdo de Facturación |
| **Opción de envío** | Un camión de la sede o "Cliente recoge en bodega" |
| **Pedido** | Lo que se envía a Bodega desde una opción: uno o varios pedidos facturados, de uno o varios clientes. **Correlativo por sede** |
| **Peso de Conversión** | Antes "Peso2". El texto "Peso2" no debe aparecer en ninguna pantalla |

### 2.2 Quitar

- Todo lo de inventario: `S.exist`, `S.movs`, `TIPOS_MOV`, `ex()`, `sumarEx()`, `mov()`, `faltantes()`, `opCompra`, `opAjuste`, `opTraslado`, `opDevolucion`, `opEditarMov`, el chip "Con devolución" de `chipEstado`, `p.conDev`, `p.devs`, `linea.dev`.
- `skuDe()` y cualquier columna o dato de **SKU** en pantallas.
- La "unidad de medida" (`p.u`).
- `ROLES_P`, `ROLES_S`, `GLOBALES`, `ACCESO_P` tal como están (se reemplazan por permisos, 2.4).
- `S.sitio.contacto.ES` (Escuintla no se muestra en el sitio).

### 2.3 Estado `S` (subir `VER`)

| Clave | Contenido |
|---|---|
| `S.productos` | `{ id, n (nombre), p2 (peso de conversión) }` |
| `S.clientes` | `{ id, n, s (id de sector) }` |
| `S.sectores` | `{ id, n }` |
| `S.camiones` | Igual que hoy (`Camión 1`, `Camión 2` de 3,400 kg; `Camión 3` de 6,000 kg; sede `XE`) |
| `S.facturados` | Pedidos facturados: `{ id, sede, num (número de Odoo, texto con sus ceros), cli (id de cliente o null), nombre, sector (texto), lineas: [{ prod, kg }], opcion (null = en el tablero, o id de opción), fecha }` |
| `S.opciones` | Por sede: `{ [idCamion]: { piloto }, recoge: {} }`. El piloto elegido se guarda |
| `S.pedidos` | Pedido de Bodega: `{ id, sede, corr, tipo ('camion' o 'recoge'), camion, piloto, estado, fecha, facturador, facturados: [ids], lineas: [{ i, fact, cli, nombre, sector, prod, kg, p2 }], prep: [{ prod, kg, p2, listo }], hist }` |
| `S.rutas` | Igual que hoy, con `orden` y `recorrido` por **cliente** (ver 6.3) |
| `S.usuarios` | `{ id, nombre, usuario, sistema ('sitio', 'picking' o 'ambos'), rol (texto libre), permisos: [códigos], sedes: ['XE', …], activo, correo, clave }` |
| `S.bitacora`, `S.orden`, `S.corr` | Igual; `S.corr` sin `mov`, `tras`, `dev` |
| `S.sitio` | Ver sección 4 |

El tablero y las opciones **viven en `S`** (que simula la base de datos), así que sobreviven a cerrar sesión y se ven desde otra pestaña.

### 2.4 Permisos (specs/03)

Definir el catálogo de permisos con código, sistema, módulo y acción, exactamente como la tabla "Catálogo de permisos" de `specs/03-roles-y-accesos.md`. Sugerencia de códigos:

| Código | Permiso |
|---|---|
| `sit.contenido` | Editar historia, misión, visión, valores e imágenes |
| `sit.industrias` | Editar descripción e imagen de cada industria |
| `sit.catalogo` | Crear, editar y eliminar productos públicos |
| `sit.noticias` | Crear, editar, publicar y ocultar noticias |
| `sit.contacto` | Editar los datos de las sedes |
| `sit.sol.ver` | Ver la bandeja de solicitudes |
| `sit.sol.gestionar` | Gestionar solicitudes |
| `sit.doc.ver` | Ver documentos en el navegador |
| `sit.doc.descargar` | Descargar documentos |
| `sit.doc.gestionar` | Subir, reemplazar y eliminar documentos |
| `pk.facturacion` | Cargar el archivo de Odoo y enviar pedidos a bodega |
| `pk.bodega` | Preparar, priorizar y despachar pedidos (incluye el tablero) |
| `pk.ruta.propias` | Ejecutar las rutas asignadas |
| `pk.ruta.todas` | Ver todas las rutas |
| `pk.reportes` | Consultar y exportar reportes, incluida la bitácora |
| `pk.cfg.productos` | Administrar productos y su Peso de Conversión |
| `pk.cfg.clientes` | Administrar clientes y sectores |
| `pk.cfg.camiones` | Administrar camiones |

- `esTotal(u)`: el rol es "Gerencia" o "Soporte" (comparar sin distinguir mayúsculas ni espacios). Tienen **todos** los permisos de los dos sistemas y **todas** las sedes.
- `tiene(u, codigo)` reemplaza a `puede(u, modulo)`.
- `esPiloto(u)`: el rol es "Piloto" (misma comparación).
- La administración de usuarios **no** es un permiso: solo Gerencia y Soporte.
- `sedeTrabajo(u)`: si el usuario tiene más de una sede (o es total), usa el selector de sede de la barra superior (como hoy hacen los globales); si tiene una sola, esa.

### 2.5 Operaciones nuevas o cambiadas

| Operación | Regla |
|---|---|
| `opCargarArchivo(filas, sede, uid)` | Crea pedidos facturados en el tablero (ver 6.1). Bitácora "Carga de archivo de Odoo" |
| `opAsignar(idFact, opcion)` | Mueve un pedido facturado a una opción, a otra opción o al tablero (`null`) |
| `opEliminarFacturado(id)` / `opVaciarTablero(sede)` | Elimina uno o todos los del tablero. Bitácora |
| `opCorregirSector(idFact, idSector)` | Cambia el sector del pedido facturado; si tiene cliente en la base, **también** `cliente.s`. Bitácora "Corrección de sector" |
| `opCancelarOpcion(sede, opcion, uid)` | Regresa al tablero los pedidos facturados de la opción. Bitácora "Cancelación de opción de envío" |
| `opEnviarOpcion(sede, opcion, uid)` | Crea **un pedido** (correlativo por sede) con todos los pedidos facturados de la opción; líneas con el Peso de Conversión vigente; `prep` sumando por producto entre todos los clientes; estado En Preparación; si es camión crea la ruta (correlativo por sede, fecha, camión, piloto). Requiere al menos un pedido facturado y, en camión, piloto. Los pedidos facturados enviados salen de la pantalla. Bitácora "Envío de pedido a bodega" |
| `opDespachar`, `opEntregar`, `opMarcar`, `opOrden*` | Igual que hoy |
| Inicio de sesión | Registrar en la bitácora "Inicio de sesión" (sitio o picking). El cierre de sesión **no** se registra |

No se registran en la bitácora el marcado, la prioridad de Bodega ni el orden de Ruta antes de entregar.

### 2.6 `semilla()`

- Productos, clientes y sectores desde `window.DATOS` (sección 1).
- Usuarios de ejemplo (nombres "Usuario de ejemplo NN", contraseña `demo`), con rol en texto y permisos:

| Usuario | Sistema | Rol | Permisos | Sedes |
|---|---|---|---|---|
| ejemplo.01 | ambos | Gerencia | (todos) | (todas) |
| ejemplo.02 | ambos | Soporte | (todos) | (todas) |
| ejemplo.03 | picking | Facturador | `pk.facturacion` | XE |
| ejemplo.04 | picking | Facturador | `pk.facturacion` | XE |
| ejemplo.05 | picking | Bodega | `pk.bodega` | XE |
| ejemplo.06 | picking | Piloto | `pk.ruta.propias` | XE |
| ejemplo.07 | picking | Piloto | `pk.ruta.propias` | XE |
| ejemplo.08 | sitio | Administrativo | todos los `sit.*` | — |
| ejemplo.09 | sitio | Operativo | `sit.doc.ver`, `sit.doc.descargar` | — |
| ejemplo.10 | sitio | Vista general | `sit.doc.ver` | — |

- **Pedidos de ejemplo** (Bodega, Ruta y Reportes no deben arrancar vacíos): reconstruir los 6 pedidos de ejemplo de hoy con el modelo nuevo. Cada uno se arma con pedidos facturados de ejemplo (uno por cliente) enviados con `opEnviarOpcion`. Usar clientes reales de la base, productos con su **nombre nuevo** (convertir los códigos del arreglo `lote` actual con la regla de 1.1) y números de Odoo claramente de ejemplo, que **no** existan en el archivo real (por ejemplo `90001`, `90002`, …). Mantener los mismos estados finales que hoy (uno entregado, dos despachados, uno a medio marcar).
- **El tablero de pedidos facturados arranca vacío**: se llena cargando el archivo real `Data Odo Para Picking.xlsx`.
- Documentos de ejemplo (los 3 PDF de soda cáustica): producto "Soda Cáustica", país "México"; el COA con lote `4139`; FT y HS sin lote.

---

## 3. `panel.js`: armazón y panel del sitio

### 3.1 Menú lateral reducido a íconos (RF-SL-60, RF-SW-26)

En `armazon()`, agregar un botón en la barra lateral para **reducir el menú a íconos** y volver a expandirlo. Aplica al **panel del sitio y al picking** (los dos usan `armazon`). Reducido: solo íconos de navegación, logotipo reducido, sin textos ni contadores visibles (con `title` en cada enlace). No se pidió recordar la preferencia: no guardarla.

### 3.2 Secciones del panel

`SECCIONES` se filtran por **permisos** (`tiene`), no por rol. "Usuarios del sitio" solo para Gerencia y Soporte.

| Sección | Cambios |
|---|---|
| Resumen | Quitar referencias a P-xx resueltos. Mantener el resto |
| Contenido institucional | Misión y visión: **subir la imagen** (la de la empresa por defecto). Historia y valores: texto + **imagen opcional**. Nuevo bloque **"Logotipo de Inquiserca"** para subirlo. Quitar "Logotipo «Transformamos»" de las imágenes del sitio |
| Industrias | Agregar **subir imagen por industria** (hoy solo hay descripción) |
| Catálogo | Formulario: **nombre, descripción, presentación, países de origen** (los cuatro de texto), **imagen** (subir o **arrastrar** desde la computadora) e industrias. Botón **eliminar** producto (con confirmación). Quitar la nota de P-17 sobre los 7 campos |
| Noticias | Formulario: **fotografía** (subir o arrastrar), **título** y **texto**. Se conservan fecha y publicar/ocultar |
| Información de contacto | Solo **Quetzaltenango** y **Guatemala**. Campos: dirección, teléfono, correo, WhatsApp, horario y **mapa (URL del mapa de Google Maps)**. Los WhatsApp son distintos por sede y se quedan como están |
| Solicitudes | Ver 3.3 |
| Documentación interna | Ver 3.4 |
| Usuarios del sitio | Ver 3.5 |

**Imágenes subidas:** como la simulación guarda todo en localStorage, reducir cada imagen en el navegador (canvas, máximo ~900 px de lado, WebP o JPEG calidad ~0.8) y guardarla como data URL en `S.sitio`. Capturar el error de cuota de localStorage y avisar con un `toast`.

### 3.3 Solicitudes (RF-SW-20, RN-42)

- Pestañas o filtro por **motivo**: Solicitud, Queja, Reclamo (y Todas).
- En el detalle de cada solicitud:
  - **Responsable:** lista de los **usuarios del sitio**.
  - **Comentario:** un solo campo de texto del responsable, con botón guardar.
  - **Estado:** tres botones **Asignado**, **En proceso**, **Solucionado**. Una solicitud nueva no tiene estado (los tres desmarcados). Se puede marcar cualquiera, sin orden. Se muestra uno a la vez.
- Ver la bandeja requiere `sit.sol.ver`; cambiar responsable, comentario y estado requiere `sit.sol.gestionar`.
- No hay aviso por correo. Quitar la nota de P-13.
- Mostrar en el detalle los campos nuevos del formulario: código de país y teléfono, país, departamento y municipio.

### 3.4 Documentación interna (RF-SW-14, RF-SW-21, RN-41)

- **Subir documento:** tipo (FT, HS, COA); **nombre del producto escrito** (un solo producto, texto libre); **país de origen** (lista de todos los países, la misma del formulario de contacto); **lote** (letras y números; **obligatorio solo en COA**); PDF.
- Quitar la selección de productos públicos con casillas.
- **Búsqueda** por lote, nombre del producto y país de origen; se conserva el filtro por tipo.
- Columnas de la tabla: Documento, Tipo, Producto, País de origen, Lote, Cargado, Acciones.
- Acciones según permisos: ver (`sit.doc.ver`), descargar (`sit.doc.descargar`), reemplazar y eliminar (`sit.doc.gestionar`).

### 3.5 Usuarios del sitio

Formulario: nombre completo, usuario, **rol (texto libre)**, **permisos del sitio con casillas** (agrupados por módulo), correo opcional, activo. Botones: editar, **eliminar** (con confirmación) y **restablecer contraseña** (Gerencia o Soporte asignan una temporal; ya **no** hay envío por correo). Gerencia y Soporte también aparecen aquí (cuentas de los dos sistemas).

---

## 4. `sitio.js`: sitio público

### 4.1 Reglas generales

- **Logotipo "Transformamos INCOVSA" fuera del sitio público.** Donde hoy se usa `A.logoTrans`/`A.logoTransBlanco` (pie, banda de misión y visión de Inicio, bloque "INCOVSA e Inquiserca" de Quiénes somos), usar el **logotipo de la cabecera**: `A.logoBlanco` sobre fondo oscuro, `A.logo` sobre fondo claro.
- **Pie de página** solo en Inicio, Quiénes somos, Noticias y Contacto. **Sin pie** en Industrias, Productos (catálogo) y el **detalle de producto**. En el pie, quitar la leyenda "Prototipo para validación…" solo si Jordin lo pide (es herramienta de demostración; se conserva).
- **Escuintla no se muestra** en ninguna parte del sitio público.
- **Presentación dinámica:** animación de aparición y desaparición **al desplazarse** (IntersectionObserver que agrega y quita una clase con transición de opacidad y desplazamiento). Se aplica a **todas las imágenes de Inicio** y a las imágenes de misión y visión de Quiénes somos. Respetar `prefers-reduced-motion`.

### 4.2 Textos que se reemplazan (aprobados por Jordin)

| Dónde | Texto actual | Texto nuevo |
|---|---|---|
| Inicio, párrafo de la portada | "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal desde Quetzaltenango, Guatemala y Escuintla." | "Compra, venta y distribución de productos químicos para nueve industrias del país. Más de treinta años abasteciendo al sector industrial y artesanal, con presencia en todo el territorio." |
| Inicio, cifras | "3 · sedes con bodega de distribución" | **Se mantiene igual** |
| Inicio, título de Presencia | "Tres sedes de distribución" | "Visítenos" |
| Inicio, texto de Presencia | "Cada sede tiene su propia bodega e inventario." | "Ubique nuestras oficinas en el mapa: será un gusto atenderle en persona." |
| Quiénes somos, encabezado | "… Atiende nueve industrias, tiene presencia en todo el país y opera tres bodegas de distribución." | "… Atiende nueve industrias y lleva sus productos a clientes de todo el país." |
| Contacto, título | "Estamos en tres sedes del país" | "Cuéntenos cómo podemos ayudarle" (el texto de abajo se mantiene) |
| Acceso personal, botón del picking | "Facturación, bodega, ruta, inventario, reportes y configuración." | "Facturación, bodega, ruta, reportes y configuración." |
| Acceso personal, texto lateral | "Lo que ve y hace cada persona depende de su rol, y la sede sale de su propia cuenta." / "Gerencia usa la misma cuenta en los dos sistemas. Las demás personas tienen una cuenta para cada sistema, con un solo rol en cada uno." | "Lo que ve y hace cada persona depende de sus permisos." / "Gerencia y Soporte usan la misma cuenta en los dos sistemas. Las demás personas tienen una cuenta para cada sistema." |
| Inicio de sesión del picking, texto lateral | "Control logístico de bodega: del pedido facturado a la entrega, con existencias por sede." | "Control logístico de bodega: del pedido facturado a la entrega." |
| Inicio de sesión, "Roles de este sistema" | Lista de roles fijos | "Gerencia: acceso total a los dos sistemas. Soporte: el mismo acceso, para mantenimiento. Los demás usuarios entran según los permisos que les asignan Gerencia o Soporte." |
| Inicio de sesión, ayuda | "Use el usuario que le asignó Soporte IT" / "… Gerencia" | "Use el usuario que le asignaron Gerencia o Soporte." |
| "¿Olvidó su contraseña?" | Por correo, o Gerencia / Soporte IT | "Pídale a Gerencia o a Soporte que la restablezcan." |

> Los textos nuevos del párrafo de la portada, de Quiénes somos y de las pantallas de acceso los propuso el agente y Jordin no los revisó uno por uno. Mostrárselos al terminar.

### 4.3 Inicio

1. Portada: igual, con el párrafo nuevo. Las cuatro cifras igual.
2. Industrias atendidas: igual.
3. **Quitar** la sección "Catálogo informativo" (rejilla de destacados y botón "Ver los N productos"). No quitar nada más.
4. **Misión y visión:** reemplazar la banda con tarjetas de texto por las **imágenes `A.mision` y `A.vision`**, **cada una centrada, una debajo de la otra**, con animación al desplazarse. Texto alternativo: la transcripción de `specs/05`.
5. **Presencia:** título "Visítenos", texto nuevo, y **dos tarjetas** (Quetzaltenango y Guatemala) con dirección, teléfono, correo y WhatsApp (los datos actuales) y el **mapa insertado** de cada sede (`iframe` con los `src` de `specs/05-sitio-web.md`, `allowfullscreen`, `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"`, ancho al 100 % de la tarjeta y alto proporcionado). El `src` del mapa sale de `S.sitio.contacto[sede].mapa`.
6. Llamado final "¿Necesita un producto…?": igual.

### 4.4 Quiénes somos

- **Banner principal** (el encabezado de la página) con una **transición dinámica** que alterna el logotipo de INCOVSA (`A.logoBlanco`) y el de **Inquiserca** (`S.sitio.logoInquiserca`, que se sube desde el panel). Si no hay logotipo de Inquiserca, se muestra solo el de INCOVSA, sin transición.
- Encabezado con el texto nuevo (4.2).
- Historia: texto (o la nota de pendiente P-19) y, si se subió, su imagen.
- **Misión y visión:** las imágenes, **misión arriba y visión abajo** (no lado a lado), **centradas**, a media pantalla y del tamaño en que se vean mejor; con animación al desplazarse. Se quitan las tarjetas de texto. La nota de P-20 se conserva, porque sigue pendiente.
- Valores: texto (o tarjetas de pendiente) y, si se subió, su imagen.
- Bloque "INCOVSA e Inquiserca": cambiar `A.logoTrans` por `A.logo`.

### 4.5 Industrias

- Quitar el **mosaico** de fotos de productos.
- Mostrar: descripción, **una imagen de la industria** (si no hay, un espacio con el ícono de la industria) y la lista de productos en texto (como hoy).
- Sin pie de página.

### 4.6 Catálogo y detalle de producto

- Catálogo: igual (búsqueda aprobada); tarjetas con nombre, países de origen y presentación cuando existan. Sin pie de página.
- Detalle: imagen, nombre, industrias, **descripción, presentación y países de origen**. **Quitar** "Tipo de producto", "Humedad", "Manejo", "Almacenamiento" y "Restricciones de uso", y **quitar el bloque "Documentación técnica"** (el detalle ya no muestra documentos). Sin pie de página.
- **"Productos Recomendados"** (antes "Otros productos de las mismas industrias"): **siempre visible**. Hasta 4 productos: primero los que comparten industria con el producto; si faltan, completar con otros del catálogo; nunca el mismo producto.

### 4.7 Noticias

Tarjetas con **fotografía**, fecha, **título** y **texto** (o un extracto del texto). Quitar la nota de P-23 sobre los campos; dejar solo "falta el contenido inicial" si se muestra alguna nota.

### 4.8 Contacto

- Título nuevo (4.2). A la derecha, tarjetas solo de Quetzaltenango y Guatemala.
- Formulario:

| Campo | Regla |
|---|---|
| Tipo de mensaje | Solicitud, queja o reclamo. Obligatorio |
| Nombre completo | Obligatorio |
| Empresa | Opcional |
| Correo | Obligatorio, estructura válida |
| Teléfono | Opcional. **Selector de código de país** (con libphonenumber) + número. Si se escribe, se valida con `isValidPhoneNumber` |
| País | Lista de todos los países, opcional |
| Departamento | Lista de departamentos de Guatemala, opcional. **Solo aparece si el país es Guatemala** |
| Municipio | Lista de municipios del departamento elegido, opcional. **Solo aparece si el país es Guatemala** |
| Sede | Obligatorio. **Solo Quetzaltenango y Guatemala** |
| Mensaje | Obligatorio |

- Quitar la nota de P-22 sobre los campos; dejar solo que faltan el correo que recibe las solicitudes y los horarios.

---

## 5. `picking.js` y `tablero.js`: módulos del picking

### 5.1 General

- `MODULOS_P`: **Facturación, Bodega, Ruta, Reportes, Configuración**. Quitar Inventario y su función completa.
- La navegación muestra los módulos según `tiene()`. El enlace "Tablero TV" pasa a llamarse **"Tablero"**.
- Selector de sede en la barra superior para usuarios con más de una sede o con acceso total.
- Reemplazar "Soporte IT" por "Soporte" en todos los textos.

### 5.2 Facturación (specs/06; es el cambio más grande)

**Pantalla:** título y texto de cabecera nuevos acordes al flujo (cargar archivo → tablero → opciones → enviar). Arriba, el botón **"Cargar archivo .xlsx"** (input de archivo con `accept=".xlsx"`).

**Lectura del archivo** (SheetJS, primera hoja):

1. Fila 1 = encabezados. Ubicar las columnas por **nombre de encabezado**: `Referencia`, `Contacto`, `Contacto/Ciudad`, `Estado`, `Movimientos de stock/Producto`, `Movimientos de stock/Cantidad hecha`.
2. Recorrer de arriba hacia abajo. Fila de agrupación (texto en Referencia, sin Contacto ni Producto, por ejemplo "agosto 2026 (80)"): ignorar. Fila con Referencia: empieza un pedido facturado. Fila sin Referencia ni Contacto: otra línea del pedido facturado anterior.
3. Cargar **solo** las referencias con `Estado` = "Hecho".
4. Número = tercer segmento de la Referencia, conservando los ceros (`03539`). Sede = primer segmento: `XE` → Quetzaltenango, `GT` → Guatemala, `ESC` → Escuintla. Si la sede del archivo no es la sede de trabajo, avisar y no cargar (cada archivo es de una sola bodega). No validar referencias repetidas.
5. **No** usar la columna `Movimientos de stock/Producto/Peso`.

**Validación de productos:** buscar cada nombre de producto en `S.productos` comparando sin mayúsculas, espacios ni puntos. Los que no existan se muestran en una ventana: "Estos productos no están en el catálogo. ¿Desea agregarlos?". Por cada uno, el facturador puede **agregarlo** escribiendo **solo el Peso de Conversión** (el nombre es el del archivo), o no agregarlo. Los pedidos facturados que contengan un producto **no agregado no se cargan** (avisar cuáles). Con el archivo real deben aparecer 7 productos faltantes en 11 líneas.

**Validación de clientes:** buscar `Contacto` en `S.clientes` (sin mayúsculas ni espacios extra).

| Caso | Resultado |
|---|---|
| Existe una vez | Nombre y sector **de la base** |
| Existe dos veces con sectores distintos | Nombre de la base y **sector de `Contacto/Ciudad`** |
| No existe | Preguntar "¿Desea guardar este cliente?". **Sí:** pedir nombre (precargado con `Contacto`) y sector (lista de sectores existentes **o** "Agregar sector nuevo"); se guarda en la base. **No:** usar `Contacto` y `Contacto/Ciudad` tal como vienen |

Con el archivo real, 23 de 52 contactos no existen. Para no abrir 23 ventanas seguidas, mostrar una sola ventana con la lista de clientes nuevos, cada uno con sus opciones (guardar con sector / no guardar).

**Tablero de pedidos facturados (izquierda):**
- Una tarjeta por pedido facturado con **solo**: número de pedido, nombre del cliente, sector del cliente y total en kg.
- En la tarjeta se puede **corregir el sector** (lista de sectores; la corrección se guarda en el cliente de la base si existe).
- Botón para **eliminar** cada tarjeta y botón **"Eliminar todos"** (con confirmación).
- Se guarda en `S` (persiste al cerrar sesión).

**Opciones de envío (derecha):** una tarjeta por cada camión de la sede y una de "Cliente recoge en bodega".
- Camión: identificación, capacidad, **selector de piloto** (usuarios con rol "Piloto" y acceso a la sede), lista compacta de pedidos facturados asignados (número y cliente), **medidor** de peso (total / capacidad, el del prototipo) y **alerta de sobrepeso** cuando el total **excede** la capacidad (no bloquea).
- Recoge en bodega: lista de pedidos facturados y total en kg.
- Cada opción con sus botones **"Enviar Pedido a Bodega"** (ventana de confirmación como la actual, indicando el correlativo y, si es camión, el número de ruta) y **"Cancelar"** (los pedidos facturados regresan al tablero).
- Lo asignado se guarda en `S`.

**Arrastrar** (reutilizar la mecánica de `ordenable` con pointer events, para mouse y dedo): del tablero a una opción, entre opciones y de una opción al tablero. Resaltar la zona de destino al pasar por encima.

**Disposición:** en escritorio, dos columnas (tablero a la izquierda, opciones a la derecha). En teléfono, una columna (el arrastre debe seguir funcionando con el dedo).

### 5.3 Bodega y tablero

- Bodega: un pedido por tarjeta, como hoy. Número = **correlativo**. Tabla **sin columna SKU**: Producto (nombre), Cantidad (kg), Unidades, Listo. La cantidad suma el producto entre todos los clientes del pedido.
- Tablero (`tablero.js`):
  - Cambiar los botones "TV" y "Tableta" por **"Modo claro"** y **"Modo oscuro"** (guardar la elección por pantalla, como hoy; `?tema=claro|oscuro`).
  - **Modo claro** = el tema actual "tableta" (`.tb[data-tema="tableta"]`), sin cambios de colores.
  - **Modo oscuro** = el tema actual "tv" pero en **escala de negros y grises**: reemplazar los verdes de `.tb` (fondo, superficies, bordes, acentos, gradientes radiales verdes, color de "listo" y del anillo de avance) por grises. Ejemplo de tokens: fondo `#0F0F10`, superficie `#1A1A1C`, superficie 2 `#242427`, borde `rgba(255,255,255,.12)`, texto `#F2F2F2`, texto suave `#A6A6A6`, acento `#E0E0E0`, listo `#CFCFCF` con fondo `rgba(255,255,255,.10)`. La silueta del camión (`siluetaCamion`) en modo oscuro también en grises.
  - Quitar el SKU de las líneas (`.prod small` muestra solo el nombre o nada).
  - Ajustar `Demo` (inicio.js) para abrir el tablero en `?tema=oscuro` y `?tema=claro`.

### 5.4 Ruta

- Piloto (rol "Piloto"): solo sus rutas. Usuarios con `pk.ruta.todas` o acceso total: todas las rutas de sus sedes.
- La ruta corresponde a **un pedido** (correlativo).
- Tabla: Cliente, Sector, Total (kg). **Una fila por cliente**: si un cliente tiene varios pedidos facturados en el pedido, se suman en una sola fila. Clave del cliente: id de la base si existe; si no, nombre + sector del pedido facturado.
- Quitar el chip y el contador de devoluciones.

### 5.5 Reportes

- Filtro de periodo: **Diario, Semanal (lunes a domingo), Mensual, Anual, Rango** (fecha de inicio y fecha final, ambas incluidas). Al abrir, el día de hoy. Aplica a **Despacho** y a **Rutas realizadas**.
- Despacho: sin columna SKU; columna Producto = nombre. Nombre de la pestaña acorde al periodo. Exportar Excel y PDF como hoy.
- Rutas realizadas: filtrada por el periodo (fecha de la ruta); columna Pedido = correlativo.
- **Bitácora:** se conserva la pestaña (con inicios de sesión).
- Quitar la nota de P-05 ("propuesta del equipo"); el título deja de decir "propuesta".

### 5.6 Configuración

- Productos: tabla con **Nombre** y **Peso de Conversión (kg)**. Sin SKU, sin unidad de medida, sin existencias por sede. Formulario: **solo nombre y Peso de Conversión**. Eliminar: bloqueado solo si el producto aparece en pedidos o pedidos facturados (nota de P-42 se conserva). Quitar las notas de P-44 y P-30.
- Clientes: igual (nombre y sector). Quitar la nota de anonimización (ahora son nombres reales) y la de P-25.
- Sectores y camiones: igual.
- **Usuarios del picking:** nombre completo, usuario, **rol (texto libre)**, **sedes con casillas**, **permisos del picking con casillas** (agrupados por módulo), correo opcional, activo. Botones: editar, **eliminar** (con confirmación), restablecer contraseña. Gerencia y Soporte aparecen aquí también. Quitar las notas de roles fijos ("Una cuenta de Gerencia queda habilitada…" se cambia por "Las cuentas de Gerencia y Soporte sirven en los dos sistemas").

---

## 6. Detalles de datos que deben cuadrar

### 6.1 Archivo real de prueba

`docs_incovsa/PROYECTO PICKING/Data Odo Para Picking.xlsx` (hoja `Sheet1`, 16 columnas). Al cargarlo en Quetzaltenango con el catálogo de 339 productos, el prototipo debe mostrar:

| Comprobación | Esperado |
|---|---|
| Referencias leídas | 80 (79 "Hecho" + 1 "Cancelado", que no se carga) |
| Productos faltantes | 7 productos en 11 líneas |
| Clientes que no existen en la base | 23 de 52 |
| Pedidos facturados en el tablero | 79 menos los que contengan productos que el facturador no agregue |

### 6.2 Pedidos y conversión

- Cada línea del pedido guarda el Peso de Conversión vigente; si después cambia en Configuración, el pedido no cambia (RN-33).
- La conversión sigue la RN-01 (`convertir()` en milésimas de kg). El selector de P-26 del panel Demostración se conserva.

---

## 7. `inicio.js`: panel "Demostración"

- Cuentas: las de 2.6, con su rol escrito.
- Botones de tiempo real: "Tablero oscuro", "Tablero claro", "Facturación".
- Recorrido sugerido, nuevo: 1) sitio público (Inicio con mapas, catálogo, contacto); 2) Facturador: cargar `Data Odo Para Picking.xlsx`, agregar productos y clientes faltantes, arrastrar pedidos facturados a camiones y a recoge en bodega, enviar; 3) Bodega en el tablero; 4) Piloto; 5) Gerencia o Soporte: reportes por periodo, bitácora, configuración y usuarios con permisos; 6) Administrativo: solicitudes y documentos.
- El contador de abajo: pedidos, pedidos facturados en el tablero y registros de bitácora (sin movimientos).
- Quitar la nota de P-26 solo si Jordin lo indica (sigue pendiente).

---

## 8. Notas de pendientes (P-xx) en pantalla

Las notas amarillas solo deben mostrar pendientes que **sigan abiertos** en `specs/19-pendientes.md`. Quitar las de pendientes resueltos (entre otros P-05, P-13, P-22 en lo relativo a Escuintla y a los campos, P-23 en lo relativo a los campos, P-25, P-30, P-44, P-50 y todas las de P-51 a P-87). Conservar, donde correspondan: P-01, P-02, P-06, P-08, P-17, P-18, P-19, P-20, P-21, P-22 (correo y horarios), P-23 (contenido inicial), P-26, P-27, P-41, P-42, P-69.

---

## 9. `estilos.css`

- Estilos del menú lateral reducido (`.app` con una clase que cambie la columna de 264 px a unos 76 px; ocultar textos, contadores, `.lado-sis` y `.quien`).
- Tablero en modo oscuro gris (5.3).
- Nuevas piezas: tablero de pedidos facturados y opciones de envío de Facturación (zonas de soltar resaltadas), imágenes de misión y visión centradas, tarjetas de Presencia con mapa (`.sede-rejilla` pasa a 2 columnas), banner con transición de logotipos, animación de aparición al desplazarse, campo de subir o arrastrar imagen, botones de estado de solicitudes.
- Reutilizar los tokens existentes (`--v*`, `--g*`, `--lima*`, radios y sombras). No inventar colores fuera de los grises del modo oscuro.
- Revisar en 390 px de ancho (teléfono) y en escritorio.

---

## 10. Lo que NO se cambia

- El design system (colores, tipografías Poppins / Figtree / JetBrains Mono, radios, sombras, íconos).
- La estructura de navegación del sitio (Inicio, Quiénes somos, Industrias, Productos, Noticias, Contacto).
- La búsqueda del catálogo.
- El tiempo real entre pestañas (localStorage + BroadcastChannel).
- Las cifras de la portada.
- Los WhatsApp de Quetzaltenango (4073-0766) y Guatemala (4073-2260), distintos por sede.
- El panel "Demostración", las cuentas `demo` y la leyenda de prototipo (son herramientas de presentación).

---

## 11. Armar

Desde `entregable-1/prototipos/simulacion/`:

```
python construir.py
```

Debe imprimir 339 productos y 314 clientes. El resultado es `entregable-1/prototipos/prototipo-simulacion-incovsa.html`.

---

## 12. Lista de comprobación final

Probar en el navegador (si hay herramientas de navegador disponibles, usarlas con `file://`; abrir dos pestañas para el tiempo real) y marcar cada punto:

**Sitio**
- [ ] Ningún "Transformamos INCOVSA" en páginas públicas.
- [ ] Pie solo en Inicio, Quiénes somos, Noticias y Contacto.
- [ ] Inicio sin "Catálogo informativo"; misión y visión como imágenes centradas, una debajo de la otra, con animación al desplazarse; Presencia "Visítenos" con dos tarjetas y dos mapas; sin Escuintla.
- [ ] Quiénes somos: banner con logotipo de INCOVSA (y transición si se sube el de Inquiserca), misión arriba y visión abajo centradas.
- [ ] Industrias sin mosaico, con espacio de imagen por industria.
- [ ] Detalle de producto sin los cinco campos eliminados ni documentos; "Productos Recomendados" siempre visible (probar con un producto sin industrias).
- [ ] Contacto: título nuevo; teléfono con código de país y validación; departamento y municipio solo con Guatemala; sede solo Quetzaltenango y Guatemala.
- [ ] Textos de la tabla 4.2 aplicados.

**Panel**
- [ ] Menú reducible a íconos.
- [ ] Imágenes: misión, visión, historia, valores, logotipo de Inquiserca, industrias, productos (subir y arrastrar), noticias.
- [ ] Solicitudes por motivo, responsable, comentario y estados sin estado inicial.
- [ ] Documentos: producto escrito, país de lista, lote con letras (obligatorio solo en COA), búsqueda por lote, nombre y país.
- [ ] Usuarios del sitio con rol libre, permisos por casillas, eliminar y restablecer contraseña.

**Picking**
- [ ] Sin módulo de Inventario, sin SKU, sin "Peso2", sin "Unidad medida", sin existencias.
- [ ] Facturación con el archivo real: cifras de 6.1; ventanas de productos y clientes faltantes; tablero con tarjetas resumidas; corregir sector; eliminar uno y todos; arrastrar en los tres sentidos; medidor y alerta de sobrepeso; enviar y cancelar por opción; el tablero sigue igual al cerrar sesión y volver a entrar.
- [ ] El pedido enviado aparece en Bodega con correlativo y productos sumados entre clientes.
- [ ] Tablero en modo claro y en modo oscuro gris.
- [ ] Ruta con una fila por cliente.
- [ ] Reportes con los cinco periodos (semana de lunes a domingo) en Despacho y Rutas; bitácora con inicios de sesión.
- [ ] Configuración: productos con nombre y Peso de Conversión; usuarios con rol libre, sedes y permisos; eliminar.
- [ ] Menú reducible a íconos.
- [ ] Los usuarios de ejemplo solo ven lo que permiten sus permisos y sedes.

Al terminar, informar a Jordin qué se probó, qué no se pudo probar y las decisiones que se tomaron sin estar en `specs/`, y recordarle que el HTML no debe subirse al repositorio.
