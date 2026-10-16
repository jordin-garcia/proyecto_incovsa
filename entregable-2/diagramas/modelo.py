# -*- coding: utf-8 -*-
"""Modelo físico de la base de datos (PostgreSQL 18, esquema de Prisma 7), diseñado a partir de
specs/14-modelo-de-datos.md y de las decisiones técnicas de specs/16. Es la fuente única del
diccionario de datos del Documento 2 (herramientas/generar_diccionario.py) y de los diagramas
entidad-relación (figura-9 y figura-10).

Cada campo: (nombre, tipo, longitud, PK, FK (tabla referenciada o ''), permite nulo, descripción).
"""

def C(nombre, tipo, lon='', pk=False, fk='', nulo=False, desc=''):
    return (nombre, tipo, lon, pk, fk, nulo, desc)

CREADO = C('creado_en', 'timestamptz', '', desc='Fecha y hora exactas en que se guardó el registro. Valor por omisión now() (RN-57)')
ACTUALIZADO = C('actualizado_en', 'timestamptz', '', desc='Fecha y hora de la última modificación (@updatedAt de Prisma)')

TABLAS = {
    # ------------------------------------------------------------------ acceso
    'sede': ('Acceso', 'Sedes de la empresa: Quetzaltenango, Guatemala y Escuintla.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('nombre', 'varchar', '40', desc='Nombre de la sede. Único'),
        C('prefijo_odoo', 'varchar', '5', desc='Prefijo de la Referencia de Odoo: XE, GT o ESC. Único (RN-36)'),
        C('tiene_oficina', 'boolean', '', desc='Si la sede se muestra en el sitio público (Quetzaltenango y Guatemala)'),
        CREADO]),
    'usuario': ('Acceso', 'Cuentas de los dos sistemas. Es la tabla user de Better Auth con los campos propios del proyecto. Una persona puede tener una cuenta en cada sistema con el mismo nombre de usuario (RN-54).', [
        C('id', 'text', '', True, desc='Identificador que genera Better Auth'),
        C('name', 'text', '', desc='Nombre completo'),
        C('email', 'text', '', desc='Correo interno que exige Better Auth (único), armado con la clave de acceso. No se muestra ni se usa para enviar correos (decisión técnica 26)'),
        C('email_verified', 'boolean', '', desc='Campo de Better Auth. Siempre falso: no se verifican correos'),
        C('image', 'text', '', nulo=True, desc='Campo de Better Auth. No se usa'),
        C('username', 'text', '', desc='Clave de acceso interna: sistema + "." + nombre de usuario (por ejemplo, picking.maria.argueta). Única (plugin username de Better Auth)'),
        C('display_username', 'text', '', desc='Nombre de usuario que escribe la persona. Único junto con el sistema'),
        C('sistema', 'varchar', '10', desc='sitio, picking o ambos (solo Gerencia y Soporte)'),
        C('rol', 'varchar', '60', desc='Rol en texto libre (RN-38)'),
        C('correo', 'varchar', '120', nulo=True, desc='Correo de contacto, opcional'),
        C('activo', 'boolean', '', desc='Si la cuenta puede iniciar sesión'),
        C('eliminado_en', 'timestamptz', '', nulo=True, desc='Fecha de eliminación lógica (RF-SL-57)'),
        C('created_at', 'timestamptz', '', desc='Fecha de creación (Better Auth)'),
        C('updated_at', 'timestamptz', '', desc='Fecha de modificación (Better Auth)')]),
    'cuenta': ('Acceso', 'Credenciales de cada usuario (tabla account de Better Auth). Guarda el hash scrypt de la contraseña.', [
        C('id', 'text', '', True, desc='Identificador'),
        C('account_id', 'text', '', desc='Identificador de la cuenta en el proveedor (el id del usuario)'),
        C('provider_id', 'text', '', desc='Siempre "credential": usuario y contraseña'),
        C('user_id', 'text', '', fk='usuario', desc='Usuario dueño de la credencial. Se borra en cascada'),
        C('password', 'text', '', nulo=True, desc='Hash scrypt de la contraseña (RNF-03). Nunca la contraseña en claro'),
        C('access_token, refresh_token, id_token, scope', 'text', '', nulo=True, desc='Campos de Better Auth para proveedores externos. No se usan'),
        C('access_token_expires_at, refresh_token_expires_at', 'timestamptz', '', nulo=True, desc='Campos de Better Auth. No se usan'),
        C('created_at', 'timestamptz', '', desc='Fecha de creación'),
        C('updated_at', 'timestamptz', '', desc='Fecha de modificación')]),
    'sesion': ('Acceso', 'Sesiones abiertas (tabla session de Better Auth). La cookie del navegador solo guarda el token.', [
        C('id', 'text', '', True, desc='Identificador'),
        C('token', 'text', '', desc='Token de la sesión. Único'),
        C('expires_at', 'timestamptz', '', desc='Vencimiento de la sesión (P-07)'),
        C('ip_address', 'text', '', nulo=True, desc='Dirección IP desde la que se abrió'),
        C('user_agent', 'text', '', nulo=True, desc='Navegador desde el que se abrió'),
        C('user_id', 'text', '', fk='usuario', desc='Usuario de la sesión. Se borra en cascada'),
        C('created_at', 'timestamptz', '', desc='Fecha de creación'),
        C('updated_at', 'timestamptz', '', desc='Fecha de modificación')]),
    'verificacion': ('Acceso', 'Tabla verification de Better Auth. La crea la librería; el sistema no la usa porque no hay recuperación por correo.', [
        C('id', 'text', '', True, desc='Identificador'),
        C('identifier', 'text', '', desc='Identificador de la verificación'),
        C('value', 'text', '', desc='Valor de la verificación'),
        C('expires_at', 'timestamptz', '', desc='Vencimiento'),
        C('created_at', 'timestamptz', '', desc='Fecha de creación'),
        C('updated_at', 'timestamptz', '', desc='Fecha de modificación')]),
    'permiso': ('Acceso', 'Catálogo de permisos por módulo y acción (specs/03). Lo carga la semilla.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('codigo', 'varchar', '40', desc='Código único, por ejemplo pk.facturacion'),
        C('sistema', 'varchar', '10', desc='sitio o picking'),
        C('modulo', 'varchar', '60', desc='Módulo al que da acceso'),
        C('descripcion', 'varchar', '200', desc='Acción que permite'),
        CREADO]),
    'usuario_permiso': ('Acceso', 'Permisos marcados a cada usuario (N:M).', [
        C('usuario_id', 'text', '', True, 'usuario', desc='Usuario'),
        C('permiso_id', 'integer', '', True, 'permiso', desc='Permiso'),
        CREADO]),
    'usuario_sede': ('Acceso', 'Sedes a las que tiene acceso cada usuario del picking (N:M, RN-17).', [
        C('usuario_id', 'text', '', True, 'usuario', desc='Usuario'),
        C('sede_id', 'integer', '', True, 'sede', desc='Sede'),
        CREADO]),
    'bitacora': ('Acceso', 'Registro de las operaciones de los dos sistemas (RN-39). No se edita ni se borra.', [
        C('id', 'bigint', '', True, desc='Identificador'),
        C('sistema', 'varchar', '10', desc='sitio o picking'),
        C('operacion', 'varchar', '80', desc='Por ejemplo, "Inicio de sesión" o "Envío de ruta a bodega"'),
        C('entidad', 'varchar', '40', nulo=True, desc='Tabla afectada'),
        C('registro_id', 'varchar', '40', nulo=True, desc='Identificador del registro afectado'),
        C('detalle', 'jsonb', '', desc='Datos de la operación'),
        C('usuario_id', 'text', '', fk='usuario', nulo=True, desc='Quién la hizo. Vacío en un intento con un usuario que no existe'),
        C('usuario_escrito', 'varchar', '60', nulo=True, desc='Nombre de usuario escrito, en inicios de sesión e intentos fallidos'),
        C('ip', 'varchar', '45', nulo=True, desc='Dirección IP, en inicios de sesión e intentos'),
        CREADO]),
    # ------------------------------------------------------------------ picking
    'camion': ('Picking', 'Camiones de cada sede (specs/11).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('identificacion', 'varchar', '40', desc='Identificación del camión (P-01)'),
        C('capacidad_kg', 'decimal', '12,3', desc='Capacidad máxima en kg. Mayor que cero'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede a la que pertenece'),
        C('eliminado_en', 'timestamptz', '', nulo=True, desc='Fecha de eliminación lógica'),
        CREADO, ACTUALIZADO]),
    'opcion_envio': ('Picking', 'Las dos opciones de envío de cada sede: "Envío por camión" y "Cliente recoge en bodega" (RN-48). Guardan lo que el facturador eligió antes de enviar.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede'),
        C('tipo', 'varchar', '10', desc='camion o recoge. Único junto con la sede'),
        C('camion_id', 'integer', '', fk='camion', nulo=True, desc='Camión elegido (solo en la de camión)'),
        C('piloto_id', 'text', '', fk='usuario', nulo=True, desc='Piloto elegido: usuario con rol "Piloto" de la sede (RN-46)'),
        C('fecha_programada', 'date', '', nulo=True, desc='Fecha programada de envío o despacho (RN-53)'),
        C('hora_programada', 'time', '', nulo=True, desc='Hora programada de envío o despacho (RN-53)'),
        CREADO, ACTUALIZADO]),
    'pedido_facturado': ('Picking', 'Cada referencia de Odoo cargada desde el archivo .xlsx, de un solo cliente, con sus datos tal como vienen (RN-35).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede de la bodega del archivo'),
        C('numero_odoo', 'varchar', '20', desc='Tercer segmento de la Referencia, con sus ceros. No es único; tiene índice (decisión técnica 4)'),
        C('referencia', 'varchar', '40', desc='Referencia completa, por ejemplo XE-IN/SALIDA/03539'),
        C('cliente', 'varchar', '200', desc='Columna Contacto, tal como viene'),
        C('sector', 'varchar', '200', desc='Columna Contacto/Ciudad, tal como viene'),
        C('opcion_envio_id', 'integer', '', fk='opcion_envio', nulo=True, desc='Opción de envío donde está. Vacía: está en el tablero'),
        C('envio_id', 'integer', '', fk='envio', nulo=True, desc='Ruta o pedido con que se envió a Bodega'),
        C('posicion', 'integer', '', desc='Orden en el tablero o en la opción de envío (RF-SL-71)'),
        C('cargado_por', 'text', '', fk='usuario', desc='Usuario que cargó el archivo'),
        CREADO]),
    'detalle_pedido_facturado': ('Picking', 'Líneas de cada pedido facturado, tal como vienen en el archivo.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('pedido_facturado_id', 'integer', '', fk='pedido_facturado', desc='Pedido facturado. Se borra en cascada'),
        C('producto', 'varchar', '200', desc='Columna Movimientos de stock/Producto'),
        C('lote', 'varchar', '40', nulo=True, desc='Columna Movimientos de stock/Números de serie'),
        C('peso_conversion_kg', 'decimal', '12,3', desc='Columna Movimientos de stock/Producto/Peso. Mayor que cero (RN-50)'),
        C('cantidad_kg', 'decimal', '12,3', desc='Columna Movimientos de stock/Cantidad hecha. Mayor que cero'),
        C('orden', 'integer', '', desc='Orden de la línea en el archivo'),
        CREADO]),
    'estado_envio': ('Picking', 'Estados de las rutas y los pedidos (RN-11). Los carga la semilla.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('nombre', 'varchar', '30', desc='En Preparación, Despachado, En Ruta o Entregado. Único')]),
    'envio': ('Picking', 'Lo que el facturador envía a Bodega desde una opción: una ruta (camión) o un pedido (cliente recoge).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede'),
        C('tipo', 'varchar', '10', desc='ruta o pedido'),
        C('numero', 'integer', '', desc='Número del día. Único junto con sede, tipo y fecha de envío (RN-52)'),
        C('fecha_envio', 'date', '', desc='Fecha de envío a Bodega, en la hora de Guatemala'),
        C('programado_para', 'timestamp', '', desc='Fecha y hora programadas de envío o despacho (RN-53)'),
        C('estado_id', 'integer', '', fk='estado_envio', desc='Estado actual'),
        C('enviado_por', 'text', '', fk='usuario', desc='Facturador que lo envió'),
        C('camion_id', 'integer', '', fk='camion', nulo=True, desc='Camión (solo ruta)'),
        C('piloto_id', 'text', '', fk='usuario', nulo=True, desc='Piloto (solo ruta)'),
        C('posicion_cola', 'integer', '', nulo=True, desc='Posición actual en la cola de Bodega (decisión técnica 11)'),
        CREADO, ACTUALIZADO]),
    'linea_preparacion': ('Picking', 'Filas de Bodega: producto, lote y Peso de Conversión, con la suma de los clientes (RN-51).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('envio_id', 'integer', '', fk='envio', desc='Ruta o pedido. Se borra en cascada'),
        C('producto', 'varchar', '200', desc='Nombre del producto'),
        C('lote', 'varchar', '40', nulo=True, desc='Lote'),
        C('peso_conversion_kg', 'decimal', '12,3', desc='Peso de Conversión con que se convierte (RN-33)'),
        C('cantidad_kg', 'decimal', '12,3', desc='Suma en kg de las líneas iguales'),
        C('marcado', 'boolean', '', desc='Si ya se sacó de la bodega. No guarda quién marcó (RN-20)'),
        C('posicion', 'integer', '', desc='Orden actual de la fila (RN-28)'),
        CREADO, ACTUALIZADO]),
    'historial_estado': ('Picking', 'Cada cambio de estado de una ruta o un pedido, con fecha, hora y usuario.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('envio_id', 'integer', '', fk='envio', desc='Ruta o pedido'),
        C('estado_id', 'integer', '', fk='estado_envio', desc='Estado al que pasó'),
        C('usuario_id', 'text', '', fk='usuario', desc='Quién hizo el cambio'),
        CREADO]),
    'entrega_ruta': ('Picking', 'Clientes de una ruta, uno por fila (RN-49), y su orden: el actual antes de entregar y el recorrido al entregar (RN-29).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('envio_id', 'integer', '', fk='envio', desc='Ruta. Se borra en cascada'),
        C('cliente', 'varchar', '200', desc='Nombre del cliente'),
        C('sector', 'varchar', '200', desc='Sector del cliente'),
        C('total_kg', 'decimal', '12,3', desc='Suma en kg de ese cliente en la ruta'),
        C('orden', 'integer', '', desc='Orden en la ruta; al entregar, el recorrido'),
        CREADO, ACTUALIZADO]),
    # ------------------------------------------------------------------ sitio
    'configuracion_sitio': ('Sitio', 'Un solo registro con los logotipos del sitio (specs/05).', [
        C('id', 'integer', '', True, desc='Siempre 1'),
        C('logotipo_incovsa_url', 'text', '', nulo=True, desc='Logotipo subido. Vacío: el recibido de la empresa'),
        C('logotipo_inquiserca_url', 'text', '', nulo=True, desc='Logotipo de Inquiserca (recibido el 13/10)'),
        ACTUALIZADO]),
    'contenido_institucional': ('Sitio', 'Textos de misión, visión e historia.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('seccion', 'varchar', '20', desc='mision, vision o historia. Única'),
        C('texto', 'text', '', desc='Texto que se publica'),
        CREADO, ACTUALIZADO]),
    'valor': ('Sitio', 'Las 5 imágenes de los valores, una por valor y sin texto (RF-SW-29).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('posicion', 'smallint', '', desc='1 a 5. Única'),
        C('imagen_url', 'text', '', nulo=True, desc='Imagen en Cloudflare R2. Vacía hasta que se sube'),
        ACTUALIZADO]),
    'industria': ('Sitio', 'Las 9 industrias atendidas.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('nombre', 'varchar', '60', desc='Nombre. Único'),
        C('descripcion', 'text', '', desc='Descripción'),
        C('orden', 'smallint', '', desc='Orden en el sitio'),
        CREADO, ACTUALIZADO]),
    'producto_sitio': ('Sitio', 'Productos del catálogo informativo. No tienen relación con el picking.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('nombre', 'varchar', '150', desc='Nombre'),
        C('descripcion', 'text', '', nulo=True, desc='Descripción'),
        C('presentacion', 'varchar', '150', nulo=True, desc='Presentación'),
        C('paises_origen', 'varchar', '200', nulo=True, desc='Países de origen, en texto'),
        CREADO, ACTUALIZADO]),
    'producto_industria': ('Sitio', 'Industrias de cada producto público (N:M).', [
        C('producto_sitio_id', 'integer', '', True, 'producto_sitio', desc='Producto público'),
        C('industria_id', 'integer', '', True, 'industria', desc='Industria')]),
    'noticia': ('Sitio', 'Noticias del sitio. Toda noticia guardada se publica; para quitarla del sitio se elimina (15/10/2026).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('titulo', 'varchar', '200', desc='Título'),
        C('texto', 'text', '', desc='Texto'),
        C('fecha_publicacion', 'timestamptz', '', desc='Fecha de publicación'),
        C('autor_id', 'text', '', fk='usuario', desc='Usuario que la creó'),
        CREADO, ACTUALIZADO]),
    'imagen': ('Sitio', 'Imágenes de las galerías de hasta 5 (RN-56). Cada imagen es de un área y, según el área, de una industria, un producto o una noticia.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('area', 'varchar', '20', desc='portada, mision, vision, historia, industria, producto o noticia'),
        C('industria_id', 'integer', '', fk='industria', nulo=True, desc='Industria (área industria). Se borra en cascada'),
        C('producto_sitio_id', 'integer', '', fk='producto_sitio', nulo=True, desc='Producto público (área producto). Se borra en cascada'),
        C('noticia_id', 'integer', '', fk='noticia', nulo=True, desc='Noticia (área noticia). Se borra en cascada'),
        C('posicion', 'smallint', '', desc='1 a 5: orden de rotación'),
        C('url', 'text', '', desc='Dirección de la imagen en Cloudflare R2'),
        CREADO]),
    'producto_documentado': ('Sitio', 'Documentación interna: un producto con los enlaces de Google Drive de su FT, HS y COA (RN-55).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('producto', 'varchar', '150', desc='Nombre del producto, escrito'),
        C('pais_id', 'integer', '', fk='pais', desc='País de origen'),
        C('lote', 'varchar', '40', desc='Lote, letras y números. Obligatorio (RN-41)'),
        C('enlace_ft', 'text', '', nulo=True, desc='Enlace de Google Drive de la ficha técnica'),
        C('enlace_hs', 'text', '', nulo=True, desc='Enlace de Google Drive de la hoja de seguridad'),
        C('enlace_coa', 'text', '', nulo=True, desc='Enlace de Google Drive del certificado de análisis'),
        C('creado_por', 'text', '', fk='usuario', desc='Usuario que lo creó'),
        CREADO, ACTUALIZADO]),
    'solicitud_contacto': ('Sitio', 'Mensajes del formulario de contacto. Solo se guardan en el sistema (RF-SW-06).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('folio', 'varchar', '20', desc='Folio que se le da a la persona. Único'),
        C('motivo', 'varchar', '10', desc='solicitud, queja o reclamo'),
        C('nombre', 'varchar', '150', desc='Nombre completo'),
        C('empresa', 'varchar', '150', nulo=True, desc='Empresa'),
        C('correo', 'varchar', '150', desc='Correo, con estructura válida'),
        C('telefono_codigo', 'varchar', '6', nulo=True, desc='Código de país del teléfono, por ejemplo +502'),
        C('telefono', 'varchar', '20', nulo=True, desc='Teléfono, validado para el país'),
        C('pais_id', 'integer', '', fk='pais', desc='País. Obligatorio'),
        C('departamento_id', 'integer', '', fk='departamento', nulo=True, desc='Obligatorio si el país es Guatemala'),
        C('municipio_id', 'integer', '', fk='municipio', nulo=True, desc='Obligatorio si el país es Guatemala'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede a la que se dirige (Quetzaltenango o Guatemala)'),
        C('mensaje', 'text', '', desc='Mensaje'),
        C('leida', 'boolean', '', desc='Si ya se abrió en la bandeja'),
        C('estado', 'varchar', '12', nulo=True, desc='Vacío, asignado, en_proceso o solucionado (RN-42)'),
        C('responsable_id', 'text', '', fk='usuario', nulo=True, desc='Usuario del sitio responsable'),
        C('comentario', 'text', '', nulo=True, desc='Comentario del responsable'),
        CREADO, ACTUALIZADO]),
    'informacion_contacto': ('Sitio', 'Datos de contacto de las sedes con oficina.', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('sede_id', 'integer', '', fk='sede', desc='Sede. Única'),
        C('direccion', 'varchar', '250', desc='Dirección'),
        C('telefono', 'varchar', '60', desc='Teléfonos'),
        C('correo', 'varchar', '120', desc='Correo de la sede'),
        C('whatsapp', 'varchar', '30', desc='WhatsApp'),
        C('horario', 'varchar', '120', nulo=True, desc='Horario (P-22)'),
        C('mapa_url', 'text', '', desc='Dirección del mapa insertado de Google Maps'),
        ACTUALIZADO]),
    'pais': ('Sitio', 'Lista de todos los países (código ISO de dos letras).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('codigo', 'char', '2', desc='Código ISO 3166-1. Único'),
        C('nombre', 'varchar', '80', desc='Nombre en español')]),
    'departamento': ('Sitio', 'Los 22 departamentos de Guatemala (INE).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('nombre', 'varchar', '40', desc='Nombre')]),
    'municipio': ('Sitio', 'Los 340 municipios de Guatemala (INE).', [
        C('id', 'integer', '', True, desc='Identificador'),
        C('departamento_id', 'integer', '', fk='departamento', desc='Departamento'),
        C('nombre', 'varchar', '60', desc='Nombre')]),
}

# Restricciones de unicidad y de verificación (CHECK) además de las claves primarias
UNICAS = [
    ('sede', 'nombre'), ('sede', 'prefijo_odoo'), ('usuario', 'email'), ('usuario', 'username'),
    ('usuario', 'display_username, sistema'), ('sesion', 'token'), ('permiso', 'codigo'),
    ('opcion_envio', 'sede_id, tipo'), ('estado_envio', 'nombre'), ('envio', 'sede_id, tipo, fecha_envio, numero'),
    ('linea_preparacion', 'envio_id, producto, lote, peso_conversion_kg'), ('contenido_institucional', 'seccion'),
    ('valor', 'posicion'), ('industria', 'nombre'), ('imagen', 'area, industria_id, producto_sitio_id, noticia_id, posicion'),
    ('producto_documentado', 'producto, pais_id, lote'), ('solicitud_contacto', 'folio'), ('informacion_contacto', 'sede_id'),
    ('pais', 'codigo'),
]
