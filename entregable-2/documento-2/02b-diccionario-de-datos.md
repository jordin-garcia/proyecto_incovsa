\horizontal

# Diccionario de datos

El diccionario documenta cada tabla del esquema de base de datos diseñado para PostgreSQL 18, que se crea con las migraciones de Prisma 7. Las tablas `usuario`, `cuenta`, `sesion` y `verificacion` son las que exige Better Auth, con los campos propios del proyecto agregados a `usuario`. Los tipos son los de PostgreSQL: `varchar(n)` es texto de hasta *n* caracteres, `decimal(12,3)` guarda cantidades con tres decimales exactos y `timestamptz` guarda fecha y hora en UTC.

En cada tabla, la columna PK marca la clave primaria; la columna FK, la tabla a la que apunta la clave foránea, y «Nulo», si el campo puede quedar vacío. Todas las tablas que el equipo diseñó guardan la fecha y hora exactas de creación de cada registro (RN-57).

## Tablas de acceso

### Tabla sede

**Propósito:** Sedes de la empresa: Quetzaltenango, Guatemala y Escuintla.

Tabla: Diccionario de la tabla sede {#tab:dic-sede}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `nombre` | varchar | 40 |  |  | No | Nombre de la sede. Único |
| `prefijo_odoo` | varchar | 5 |  |  | No | Prefijo de la Referencia de Odoo: XE, GT o ESC. Único (RN-36) |
| `tiene_oficina` | boolean | — |  |  | No | Si la sede se muestra en el sitio público (Quetzaltenango y Guatemala) |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

Restricciones de unicidad: `nombre`; `prefijo_odoo`.

### Tabla usuario

**Propósito:** Cuentas de los dos sistemas. Es la tabla user de Better Auth con los campos propios del proyecto. Una persona puede tener una cuenta en cada sistema con el mismo nombre de usuario (RN-54).

Tabla: Diccionario de la tabla usuario {#tab:dic-usuario}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | text | — | Sí |  | No | Identificador que genera Better Auth |
| `name` | text | — |  |  | No | Nombre completo |
| `email` | text | — |  |  | No | Correo interno que exige Better Auth (único), armado con la clave de acceso. No se muestra ni se usa para enviar correos (decisión técnica 26) |
| `email_verified` | boolean | — |  |  | No | Campo de Better Auth. Siempre falso: no se verifican correos |
| `image` | text | — |  |  | Sí | Campo de Better Auth. No se usa |
| `username` | text | — |  |  | No | Clave de acceso interna: sistema + "." + nombre de usuario (por ejemplo, picking.maria.argueta). Única (plugin username de Better Auth) |
| `display_username` | text | — |  |  | No | Nombre de usuario que escribe la persona. Único junto con el sistema |
| `sistema` | varchar | 10 |  |  | No | sitio, picking o ambos (solo Gerencia y Soporte) |
| `rol` | varchar | 60 |  |  | No | Rol en texto libre (RN-38) |
| `correo` | varchar | 120 |  |  | Sí | Correo de contacto, opcional |
| `activo` | boolean | — |  |  | No | Si la cuenta puede iniciar sesión |
| `eliminado_en` | timestamptz | — |  |  | Sí | Fecha de eliminación lógica (RF-SL-57) |
| `created_at` | timestamptz | — |  |  | No | Fecha de creación (Better Auth) |
| `updated_at` | timestamptz | — |  |  | No | Fecha de modificación (Better Auth) |

Restricciones de unicidad: `email`; `username`; `display_username, sistema`.

### Tabla cuenta

**Propósito:** Credenciales de cada usuario (tabla account de Better Auth). Guarda el hash scrypt de la contraseña.

Tabla: Diccionario de la tabla cuenta {#tab:dic-cuenta}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | text | — | Sí |  | No | Identificador |
| `account_id` | text | — |  |  | No | Identificador de la cuenta en el proveedor (el id del usuario) |
| `provider_id` | text | — |  |  | No | Siempre "credential": usuario y contraseña |
| `user_id` | text | — |  | usuario | No | Usuario dueño de la credencial. Se borra en cascada |
| `password` | text | — |  |  | Sí | Hash scrypt de la contraseña (RNF-03). Nunca la contraseña en claro |
| `access_token, refresh_token, id_token, scope` | text | — |  |  | Sí | Campos de Better Auth para proveedores externos. No se usan |
| `access_token_expires_at, refresh_token_expires_at` | timestamptz | — |  |  | Sí | Campos de Better Auth. No se usan |
| `created_at` | timestamptz | — |  |  | No | Fecha de creación |
| `updated_at` | timestamptz | — |  |  | No | Fecha de modificación |

### Tabla sesion

**Propósito:** Sesiones abiertas (tabla session de Better Auth). La cookie del navegador solo guarda el token.

Tabla: Diccionario de la tabla sesion {#tab:dic-sesion}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | text | — | Sí |  | No | Identificador |
| `token` | text | — |  |  | No | Token de la sesión. Único |
| `expires_at` | timestamptz | — |  |  | No | Vencimiento de la sesión (P-07) |
| `ip_address` | text | — |  |  | Sí | Dirección IP desde la que se abrió |
| `user_agent` | text | — |  |  | Sí | Navegador desde el que se abrió |
| `user_id` | text | — |  | usuario | No | Usuario de la sesión. Se borra en cascada |
| `created_at` | timestamptz | — |  |  | No | Fecha de creación |
| `updated_at` | timestamptz | — |  |  | No | Fecha de modificación |

Restricciones de unicidad: `token`.

### Tabla verificacion

**Propósito:** Tabla verification de Better Auth. La crea la librería; el sistema no la usa porque no hay recuperación por correo.

Tabla: Diccionario de la tabla verificacion {#tab:dic-verificacion}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | text | — | Sí |  | No | Identificador |
| `identifier` | text | — |  |  | No | Identificador de la verificación |
| `value` | text | — |  |  | No | Valor de la verificación |
| `expires_at` | timestamptz | — |  |  | No | Vencimiento |
| `created_at` | timestamptz | — |  |  | No | Fecha de creación |
| `updated_at` | timestamptz | — |  |  | No | Fecha de modificación |

### Tabla permiso

**Propósito:** Catálogo de permisos por módulo y acción (specs/03). Lo carga la semilla.

Tabla: Diccionario de la tabla permiso {#tab:dic-permiso}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `codigo` | varchar | 40 |  |  | No | Código único, por ejemplo pk.facturacion |
| `sistema` | varchar | 10 |  |  | No | sitio o picking |
| `modulo` | varchar | 60 |  |  | No | Módulo al que da acceso |
| `descripcion` | varchar | 200 |  |  | No | Acción que permite |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

Restricciones de unicidad: `codigo`.

### Tabla usuario_permiso

**Propósito:** Permisos marcados a cada usuario (N:M).

Tabla: Diccionario de la tabla usuario_permiso {#tab:dic-usuario-permiso}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `usuario_id` | text | — | Sí | usuario | No | Usuario |
| `permiso_id` | integer | — | Sí | permiso | No | Permiso |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

### Tabla usuario_sede

**Propósito:** Sedes a las que tiene acceso cada usuario del picking (N:M, RN-17).

Tabla: Diccionario de la tabla usuario_sede {#tab:dic-usuario-sede}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `usuario_id` | text | — | Sí | usuario | No | Usuario |
| `sede_id` | integer | — | Sí | sede | No | Sede |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

### Tabla bitacora

**Propósito:** Registro de las operaciones de los dos sistemas (RN-39). No se edita ni se borra.

Tabla: Diccionario de la tabla bitacora {#tab:dic-bitacora}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | bigint | — | Sí |  | No | Identificador |
| `sistema` | varchar | 10 |  |  | No | sitio o picking |
| `operacion` | varchar | 80 |  |  | No | Por ejemplo, "Inicio de sesión" o "Envío de ruta a bodega" |
| `entidad` | varchar | 40 |  |  | Sí | Tabla afectada |
| `registro_id` | varchar | 40 |  |  | Sí | Identificador del registro afectado |
| `detalle` | jsonb | — |  |  | No | Datos de la operación |
| `usuario_id` | text | — |  | usuario | Sí | Quién la hizo. Vacío en un intento con un usuario que no existe |
| `usuario_escrito` | varchar | 60 |  |  | Sí | Nombre de usuario escrito, en inicios de sesión e intentos fallidos |
| `ip` | varchar | 45 |  |  | Sí | Dirección IP, en inicios de sesión e intentos |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

## Tablas del sistema de picking

### Tabla camion

**Propósito:** Camiones de cada sede (specs/11).

Tabla: Diccionario de la tabla camion {#tab:dic-camion}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `identificacion` | varchar | 40 |  |  | No | Identificación del camión (P-01) |
| `capacidad_kg` | decimal | 12,3 |  |  | No | Capacidad máxima en kg. Mayor que cero |
| `sede_id` | integer | — |  | sede | No | Sede a la que pertenece |
| `eliminado_en` | timestamptz | — |  |  | Sí | Fecha de eliminación lógica |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

### Tabla opcion_envio

**Propósito:** Las dos opciones de envío de cada sede: "Envío por camión" y "Cliente recoge en bodega" (RN-48). Guardan lo que el facturador eligió antes de enviar.

Tabla: Diccionario de la tabla opcion_envio {#tab:dic-opcion-envio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `sede_id` | integer | — |  | sede | No | Sede |
| `tipo` | varchar | 10 |  |  | No | camion o recoge. Único junto con la sede |
| `camion_id` | integer | — |  | camion | Sí | Camión elegido (solo en la de camión) |
| `piloto_id` | text | — |  | usuario | Sí | Piloto elegido: usuario con rol "Piloto" de la sede (RN-46) |
| `fecha_programada` | date | — |  |  | Sí | Fecha programada de envío o despacho (RN-53) |
| `hora_programada` | time | — |  |  | Sí | Hora programada de envío o despacho (RN-53) |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `sede_id, tipo`.

### Tabla pedido_facturado

**Propósito:** Cada referencia de Odoo cargada desde el archivo .xlsx, de un solo cliente, con sus datos tal como vienen (RN-35).

Tabla: Diccionario de la tabla pedido_facturado {#tab:dic-pedido-facturado}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `sede_id` | integer | — |  | sede | No | Sede de la bodega del archivo |
| `numero_odoo` | varchar | 20 |  |  | No | Tercer segmento de la Referencia, con sus ceros. No es único; tiene índice (decisión técnica 4) |
| `referencia` | varchar | 40 |  |  | No | Referencia completa, por ejemplo XE-IN/SALIDA/03539 |
| `cliente` | varchar | 200 |  |  | No | Columna Contacto, tal como viene |
| `sector` | varchar | 200 |  |  | No | Columna Contacto/Ciudad, tal como viene |
| `opcion_envio_id` | integer | — |  | opcion_envio | Sí | Opción de envío donde está. Vacía: está en el tablero |
| `envio_id` | integer | — |  | envio | Sí | Ruta o pedido con que se envió a Bodega |
| `posicion` | integer | — |  |  | No | Orden en el tablero o en la opción de envío (RF-SL-71) |
| `cargado_por` | text | — |  | usuario | No | Usuario que cargó el archivo |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

### Tabla detalle_pedido_facturado

**Propósito:** Líneas de cada pedido facturado, tal como vienen en el archivo.

Tabla: Diccionario de la tabla detalle_pedido_facturado {#tab:dic-detalle-pedido-facturado}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `pedido_facturado_id` | integer | — |  | pedido_facturado | No | Pedido facturado. Se borra en cascada |
| `producto` | varchar | 200 |  |  | No | Columna Movimientos de stock/Producto |
| `lote` | varchar | 40 |  |  | Sí | Columna Movimientos de stock/Números de serie |
| `peso_conversion_kg` | decimal | 12,3 |  |  | No | Columna Movimientos de stock/Producto/Peso. Mayor que cero (RN-50) |
| `cantidad_kg` | decimal | 12,3 |  |  | No | Columna Movimientos de stock/Cantidad hecha. Mayor que cero |
| `orden` | integer | — |  |  | No | Orden de la línea en el archivo |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

### Tabla estado_envio

**Propósito:** Estados de las rutas y los pedidos (RN-11). Los carga la semilla.

Tabla: Diccionario de la tabla estado_envio {#tab:dic-estado-envio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `nombre` | varchar | 30 |  |  | No | En Preparación, Despachado, En Ruta o Entregado. Único |

Restricciones de unicidad: `nombre`.

### Tabla envio

**Propósito:** Lo que el facturador envía a Bodega desde una opción: una ruta (camión) o un pedido (cliente recoge).

Tabla: Diccionario de la tabla envio {#tab:dic-envio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `sede_id` | integer | — |  | sede | No | Sede |
| `tipo` | varchar | 10 |  |  | No | ruta o pedido |
| `numero` | integer | — |  |  | No | Número del día. Único junto con sede, tipo y fecha de envío (RN-52) |
| `fecha_envio` | date | — |  |  | No | Fecha de envío a Bodega, en la hora de Guatemala |
| `programado_para` | timestamp | — |  |  | No | Fecha y hora programadas de envío o despacho (RN-53) |
| `estado_id` | integer | — |  | estado_envio | No | Estado actual |
| `enviado_por` | text | — |  | usuario | No | Facturador que lo envió |
| `camion_id` | integer | — |  | camion | Sí | Camión (solo ruta) |
| `piloto_id` | text | — |  | usuario | Sí | Piloto (solo ruta) |
| `posicion_cola` | integer | — |  |  | Sí | Posición actual en la cola de Bodega (decisión técnica 11) |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `sede_id, tipo, fecha_envio, numero`.

### Tabla linea_preparacion

**Propósito:** Filas de Bodega: producto, lote y Peso de Conversión, con la suma de los clientes (RN-51).

Tabla: Diccionario de la tabla linea_preparacion {#tab:dic-linea-preparacion}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `envio_id` | integer | — |  | envio | No | Ruta o pedido. Se borra en cascada |
| `producto` | varchar | 200 |  |  | No | Nombre del producto |
| `lote` | varchar | 40 |  |  | Sí | Lote |
| `peso_conversion_kg` | decimal | 12,3 |  |  | No | Peso de Conversión con que se convierte (RN-33) |
| `cantidad_kg` | decimal | 12,3 |  |  | No | Suma en kg de las líneas iguales |
| `marcado` | boolean | — |  |  | No | Si ya se sacó de la bodega. No guarda quién marcó (RN-20) |
| `posicion` | integer | — |  |  | No | Orden actual de la fila (RN-28) |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `envio_id, producto, lote, peso_conversion_kg`.

### Tabla historial_estado

**Propósito:** Cada cambio de estado de una ruta o un pedido, con fecha, hora y usuario.

Tabla: Diccionario de la tabla historial_estado {#tab:dic-historial-estado}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `envio_id` | integer | — |  | envio | No | Ruta o pedido |
| `estado_id` | integer | — |  | estado_envio | No | Estado al que pasó |
| `usuario_id` | text | — |  | usuario | No | Quién hizo el cambio |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

### Tabla entrega_ruta

**Propósito:** Clientes de una ruta, uno por fila (RN-49), y su orden: el actual antes de entregar y el recorrido al entregar (RN-29).

Tabla: Diccionario de la tabla entrega_ruta {#tab:dic-entrega-ruta}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `envio_id` | integer | — |  | envio | No | Ruta. Se borra en cascada |
| `cliente` | varchar | 200 |  |  | No | Nombre del cliente |
| `sector` | varchar | 200 |  |  | No | Sector del cliente |
| `total_kg` | decimal | 12,3 |  |  | No | Suma en kg de ese cliente en la ruta |
| `orden` | integer | — |  |  | No | Orden en la ruta; al entregar, el recorrido |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

## Tablas del sitio web

### Tabla configuracion_sitio

**Propósito:** Un solo registro con los logotipos del sitio (specs/05).

Tabla: Diccionario de la tabla configuracion_sitio {#tab:dic-configuracion-sitio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Siempre 1 |
| `logotipo_incovsa_url` | text | — |  |  | Sí | Logotipo subido. Vacío: el recibido de la empresa |
| `logotipo_inquiserca_url` | text | — |  |  | Sí | Logotipo de Inquiserca (recibido el 13/10) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

### Tabla contenido_institucional

**Propósito:** Textos de misión, visión e historia.

Tabla: Diccionario de la tabla contenido_institucional {#tab:dic-contenido-institucional}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `seccion` | varchar | 20 |  |  | No | mision, vision o historia. Única |
| `texto` | text | — |  |  | No | Texto que se publica |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `seccion`.

### Tabla valor

**Propósito:** Las 5 imágenes de los valores, una por valor y sin texto (RF-SW-29).

Tabla: Diccionario de la tabla valor {#tab:dic-valor}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `posicion` | smallint | — |  |  | No | 1 a 5. Única |
| `imagen_url` | text | — |  |  | Sí | Imagen en Cloudflare R2. Vacía hasta que se sube |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `posicion`.

### Tabla industria

**Propósito:** Las 9 industrias atendidas.

Tabla: Diccionario de la tabla industria {#tab:dic-industria}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `nombre` | varchar | 60 |  |  | No | Nombre. Único |
| `descripcion` | text | — |  |  | No | Descripción |
| `orden` | smallint | — |  |  | No | Orden en el sitio |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `nombre`.

### Tabla producto_sitio

**Propósito:** Productos del catálogo informativo. No tienen relación con el picking.

Tabla: Diccionario de la tabla producto_sitio {#tab:dic-producto-sitio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `nombre` | varchar | 150 |  |  | No | Nombre |
| `descripcion` | text | — |  |  | Sí | Descripción |
| `presentacion` | varchar | 150 |  |  | Sí | Presentación |
| `paises_origen` | varchar | 200 |  |  | Sí | Países de origen, en texto |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

### Tabla producto_industria

**Propósito:** Industrias de cada producto público (N:M).

Tabla: Diccionario de la tabla producto_industria {#tab:dic-producto-industria}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `producto_sitio_id` | integer | — | Sí | producto_sitio | No | Producto público |
| `industria_id` | integer | — | Sí | industria | No | Industria |

### Tabla noticia

**Propósito:** Noticias del sitio. Toda noticia guardada se publica; para quitarla del sitio se elimina (15/10/2026).

Tabla: Diccionario de la tabla noticia {#tab:dic-noticia}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `titulo` | varchar | 200 |  |  | No | Título |
| `texto` | text | — |  |  | No | Texto |
| `fecha_publicacion` | timestamptz | — |  |  | No | Fecha de publicación |
| `autor_id` | text | — |  | usuario | No | Usuario que la creó |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

### Tabla imagen

**Propósito:** Imágenes de las galerías de hasta 5 (RN-56). Cada imagen es de un área y, según el área, de una industria, un producto o una noticia.

Tabla: Diccionario de la tabla imagen {#tab:dic-imagen}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `area` | varchar | 20 |  |  | No | portada, mision, vision, historia, industria, producto o noticia |
| `industria_id` | integer | — |  | industria | Sí | Industria (área industria). Se borra en cascada |
| `producto_sitio_id` | integer | — |  | producto_sitio | Sí | Producto público (área producto). Se borra en cascada |
| `noticia_id` | integer | — |  | noticia | Sí | Noticia (área noticia). Se borra en cascada |
| `posicion` | smallint | — |  |  | No | 1 a 5: orden de rotación |
| `url` | text | — |  |  | No | Dirección de la imagen en Cloudflare R2 |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |

Restricciones de unicidad: `area, industria_id, producto_sitio_id, noticia_id, posicion`.

### Tabla producto_documentado

**Propósito:** Documentación interna: un producto con los enlaces de Google Drive de su FT, HS y COA (RN-55).

Tabla: Diccionario de la tabla producto_documentado {#tab:dic-producto-documentado}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `producto` | varchar | 150 |  |  | No | Nombre del producto, escrito |
| `pais_id` | integer | — |  | pais | No | País de origen |
| `lote` | varchar | 40 |  |  | No | Lote, letras y números. Obligatorio (RN-41) |
| `enlace_ft` | text | — |  |  | Sí | Enlace de Google Drive de la ficha técnica |
| `enlace_hs` | text | — |  |  | Sí | Enlace de Google Drive de la hoja de seguridad |
| `enlace_coa` | text | — |  |  | Sí | Enlace de Google Drive del certificado de análisis |
| `creado_por` | text | — |  | usuario | No | Usuario que lo creó |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `producto, pais_id, lote`.

### Tabla solicitud_contacto

**Propósito:** Mensajes del formulario de contacto. Solo se guardan en el sistema (RF-SW-06).

Tabla: Diccionario de la tabla solicitud_contacto {#tab:dic-solicitud-contacto}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `folio` | varchar | 20 |  |  | No | Folio que se le da a la persona. Único |
| `motivo` | varchar | 10 |  |  | No | solicitud, queja o reclamo |
| `nombre` | varchar | 150 |  |  | No | Nombre completo |
| `empresa` | varchar | 150 |  |  | Sí | Empresa |
| `correo` | varchar | 150 |  |  | No | Correo, con estructura válida |
| `telefono_codigo` | varchar | 6 |  |  | Sí | Código de país del teléfono, por ejemplo +502 |
| `telefono` | varchar | 20 |  |  | Sí | Teléfono, validado para el país |
| `pais_id` | integer | — |  | pais | No | País. Obligatorio |
| `departamento_id` | integer | — |  | departamento | Sí | Obligatorio si el país es Guatemala |
| `municipio_id` | integer | — |  | municipio | Sí | Obligatorio si el país es Guatemala |
| `sede_id` | integer | — |  | sede | No | Sede a la que se dirige (Quetzaltenango o Guatemala) |
| `mensaje` | text | — |  |  | No | Mensaje |
| `leida` | boolean | — |  |  | No | Si ya se abrió en la bandeja |
| `estado` | varchar | 12 |  |  | Sí | Vacío, asignado, en_proceso o solucionado (RN-42) |
| `responsable_id` | text | — |  | usuario | Sí | Usuario del sitio responsable |
| `comentario` | text | — |  |  | Sí | Comentario del responsable |
| `creado_en` | timestamptz | — |  |  | No | Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57) |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `folio`.

### Tabla informacion_contacto

**Propósito:** Datos de contacto de las sedes con oficina.

Tabla: Diccionario de la tabla informacion_contacto {#tab:dic-informacion-contacto}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `sede_id` | integer | — |  | sede | No | Sede. Única |
| `direccion` | varchar | 250 |  |  | No | Dirección |
| `telefono` | varchar | 60 |  |  | No | Teléfonos |
| `correo` | varchar | 120 |  |  | No | Correo de la sede |
| `whatsapp` | varchar | 30 |  |  | No | WhatsApp |
| `horario` | varchar | 120 |  |  | Sí | Horario (P-22) |
| `mapa_url` | text | — |  |  | No | Dirección del mapa insertado de Google Maps |
| `actualizado_en` | timestamptz | — |  |  | No | Fecha y hora de la última modificación (@updatedAt de Prisma) |

Restricciones de unicidad: `sede_id`.

### Tabla pais

**Propósito:** Lista de todos los países (código ISO de dos letras).

Tabla: Diccionario de la tabla pais {#tab:dic-pais}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `codigo` | char | 2 |  |  | No | Código ISO 3166-1. Único |
| `nombre` | varchar | 80 |  |  | No | Nombre en español |

Restricciones de unicidad: `codigo`.

### Tabla departamento

**Propósito:** Los 22 departamentos de Guatemala (INE).

Tabla: Diccionario de la tabla departamento {#tab:dic-departamento}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `nombre` | varchar | 40 |  |  | No | Nombre |

### Tabla municipio

**Propósito:** Los 340 municipios de Guatemala (INE).

Tabla: Diccionario de la tabla municipio {#tab:dic-municipio}

| Campo | Tipo | Longitud | PK | FK | Nulo | Descripción |
|---|---|---|---|---|---|---|
| `id` | integer | — | Sí |  | No | Identificador |
| `departamento_id` | integer | — |  | departamento | No | Departamento |
| `nombre` | varchar | 60 |  |  | No | Nombre |

\vertical
