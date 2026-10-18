-- CreateTable
CREATE TABLE "sede" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "prefijo_odoo" VARCHAR(5) NOT NULL,
    "tiene_oficina" BOOLEAN NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "username" TEXT NOT NULL,
    "display_username" TEXT NOT NULL,
    "sistema" VARCHAR(10) NOT NULL,
    "rol" VARCHAR(60) NOT NULL,
    "correo" VARCHAR(120),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "eliminado_en" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "scope" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesion" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificacion" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "sistema" VARCHAR(10) NOT NULL,
    "modulo" VARCHAR(60) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_permiso" (
    "usuario_id" TEXT NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_permiso_pkey" PRIMARY KEY ("usuario_id","permiso_id")
);

-- CreateTable
CREATE TABLE "usuario_sede" (
    "usuario_id" TEXT NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_sede_pkey" PRIMARY KEY ("usuario_id","sede_id")
);

-- CreateTable
CREATE TABLE "bitacora" (
    "id" BIGSERIAL NOT NULL,
    "sistema" VARCHAR(10) NOT NULL,
    "operacion" VARCHAR(80) NOT NULL,
    "entidad" VARCHAR(40),
    "registro_id" VARCHAR(40),
    "detalle" JSONB NOT NULL,
    "usuario_id" TEXT,
    "usuario_escrito" VARCHAR(60),
    "ip" VARCHAR(45),
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camion" (
    "id" SERIAL NOT NULL,
    "identificacion" VARCHAR(40) NOT NULL,
    "capacidad_kg" DECIMAL(12,3) NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "eliminado_en" TIMESTAMPTZ(3),
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "camion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcion_envio" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "camion_id" INTEGER,
    "piloto_id" TEXT,
    "fecha_programada" DATE,
    "hora_programada" TIME(0),
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opcion_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_facturado" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "numero_odoo" VARCHAR(20) NOT NULL,
    "referencia" VARCHAR(40) NOT NULL,
    "cliente" VARCHAR(200) NOT NULL,
    "sector" VARCHAR(200) NOT NULL,
    "opcion_envio_id" INTEGER,
    "envio_id" INTEGER,
    "posicion" INTEGER NOT NULL,
    "cargado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_facturado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_pedido_facturado" (
    "id" SERIAL NOT NULL,
    "pedido_facturado_id" INTEGER NOT NULL,
    "producto" VARCHAR(200) NOT NULL,
    "lote" VARCHAR(40) NOT NULL DEFAULT '',
    "peso_conversion_kg" DECIMAL(12,3) NOT NULL,
    "cantidad_kg" DECIMAL(12,3) NOT NULL,
    "orden" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_pedido_facturado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_envio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha_envio" DATE NOT NULL,
    "programado_para" TIMESTAMPTZ(3) NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "enviado_por" TEXT NOT NULL,
    "camion_id" INTEGER,
    "piloto_id" TEXT,
    "posicion_cola" INTEGER,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linea_preparacion" (
    "id" SERIAL NOT NULL,
    "envio_id" INTEGER NOT NULL,
    "producto" VARCHAR(200) NOT NULL,
    "lote" VARCHAR(40) NOT NULL DEFAULT '',
    "peso_conversion_kg" DECIMAL(12,3) NOT NULL,
    "cantidad_kg" DECIMAL(12,3) NOT NULL,
    "marcado" BOOLEAN NOT NULL DEFAULT false,
    "posicion" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linea_preparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estado" (
    "id" SERIAL NOT NULL,
    "envio_id" INTEGER NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega_ruta" (
    "id" SERIAL NOT NULL,
    "envio_id" INTEGER NOT NULL,
    "cliente" VARCHAR(200) NOT NULL,
    "sector" VARCHAR(200) NOT NULL,
    "total_kg" DECIMAL(12,3) NOT NULL,
    "orden" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrega_ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "logotipo_incovsa_url" TEXT,
    "logotipo_inquiserca_url" TEXT,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenido_institucional" (
    "id" SERIAL NOT NULL,
    "seccion" VARCHAR(20) NOT NULL,
    "texto" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contenido_institucional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valor" (
    "id" SERIAL NOT NULL,
    "posicion" SMALLINT NOT NULL,
    "imagen_url" TEXT,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industria" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" SMALLINT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_sitio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "presentacion" VARCHAR(150),
    "paises_origen" VARCHAR(200),
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_industria" (
    "producto_sitio_id" INTEGER NOT NULL,
    "industria_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_industria_pkey" PRIMARY KEY ("producto_sitio_id","industria_id")
);

-- CreateTable
CREATE TABLE "noticia" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "texto" TEXT NOT NULL,
    "fecha_publicacion" TIMESTAMPTZ(3) NOT NULL,
    "autor_id" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagen" (
    "id" SERIAL NOT NULL,
    "area" VARCHAR(20) NOT NULL,
    "industria_id" INTEGER,
    "producto_sitio_id" INTEGER,
    "noticia_id" INTEGER,
    "posicion" SMALLINT NOT NULL,
    "url" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_documentado" (
    "id" SERIAL NOT NULL,
    "producto" VARCHAR(150) NOT NULL,
    "pais_id" INTEGER NOT NULL,
    "lote" VARCHAR(40) NOT NULL,
    "enlace_ft" TEXT,
    "enlace_hs" TEXT,
    "enlace_coa" TEXT,
    "creado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_documentado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_contacto" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "motivo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "empresa" VARCHAR(150),
    "correo" VARCHAR(150) NOT NULL,
    "telefono_codigo" VARCHAR(6),
    "telefono" VARCHAR(20),
    "pais_id" INTEGER NOT NULL,
    "departamento_id" INTEGER,
    "municipio_id" INTEGER,
    "sede_id" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(12),
    "responsable_id" TEXT,
    "comentario" TEXT,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informacion_contacto" (
    "id" SERIAL NOT NULL,
    "sede_id" INTEGER NOT NULL,
    "direccion" VARCHAR(250) NOT NULL,
    "telefono" VARCHAR(60) NOT NULL,
    "correo" VARCHAR(120) NOT NULL,
    "whatsapp" VARCHAR(30) NOT NULL,
    "horario" VARCHAR(120),
    "mapa_url" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informacion_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pais" (
    "id" SERIAL NOT NULL,
    "codigo" CHAR(2) NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipio" (
    "id" SERIAL NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "creado_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sede_nombre_key" ON "sede"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sede_prefijo_odoo_key" ON "sede"("prefijo_odoo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_username_key" ON "usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_display_username_sistema_key" ON "usuario"("display_username", "sistema");

-- CreateIndex
CREATE INDEX "cuenta_user_id_idx" ON "cuenta"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_token_key" ON "sesion"("token");

-- CreateIndex
CREATE INDEX "sesion_user_id_idx" ON "sesion"("user_id");

-- CreateIndex
CREATE INDEX "verificacion_identifier_idx" ON "verificacion"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "opcion_envio_sede_id_tipo_key" ON "opcion_envio"("sede_id", "tipo");

-- CreateIndex
CREATE INDEX "pedido_facturado_numero_odoo_idx" ON "pedido_facturado"("numero_odoo");

-- CreateIndex
CREATE UNIQUE INDEX "estado_envio_nombre_key" ON "estado_envio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "envio_sede_id_tipo_fecha_envio_numero_key" ON "envio"("sede_id", "tipo", "fecha_envio", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "linea_preparacion_envio_id_producto_lote_peso_conversion_kg_key" ON "linea_preparacion"("envio_id", "producto", "lote", "peso_conversion_kg");

-- CreateIndex
CREATE UNIQUE INDEX "contenido_institucional_seccion_key" ON "contenido_institucional"("seccion");

-- CreateIndex
CREATE UNIQUE INDEX "valor_posicion_key" ON "valor"("posicion");

-- CreateIndex
CREATE UNIQUE INDEX "industria_nombre_key" ON "industria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "imagen_area_posicion_key" ON "imagen"("area", "posicion") WHERE (industria_id IS NULL AND producto_sitio_id IS NULL AND noticia_id IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "imagen_industria_posicion_key" ON "imagen"("industria_id", "posicion") WHERE (industria_id IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "imagen_producto_sitio_posicion_key" ON "imagen"("producto_sitio_id", "posicion") WHERE (producto_sitio_id IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "imagen_noticia_posicion_key" ON "imagen"("noticia_id", "posicion") WHERE (noticia_id IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "producto_documentado_producto_pais_id_lote_key" ON "producto_documentado"("producto", "pais_id", "lote");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_contacto_folio_key" ON "solicitud_contacto"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "informacion_contacto_sede_id_key" ON "informacion_contacto"("sede_id");

-- CreateIndex
CREATE UNIQUE INDEX "pais_codigo_key" ON "pais"("codigo");

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permiso" ADD CONSTRAINT "usuario_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sede" ADD CONSTRAINT "usuario_sede_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sede" ADD CONSTRAINT "usuario_sede_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camion" ADD CONSTRAINT "camion_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion_envio" ADD CONSTRAINT "opcion_envio_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion_envio" ADD CONSTRAINT "opcion_envio_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcion_envio" ADD CONSTRAINT "opcion_envio_piloto_id_fkey" FOREIGN KEY ("piloto_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_facturado" ADD CONSTRAINT "pedido_facturado_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_facturado" ADD CONSTRAINT "pedido_facturado_opcion_envio_id_fkey" FOREIGN KEY ("opcion_envio_id") REFERENCES "opcion_envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_facturado" ADD CONSTRAINT "pedido_facturado_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_facturado" ADD CONSTRAINT "pedido_facturado_cargado_por_fkey" FOREIGN KEY ("cargado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido_facturado" ADD CONSTRAINT "detalle_pedido_facturado_pedido_facturado_id_fkey" FOREIGN KEY ("pedido_facturado_id") REFERENCES "pedido_facturado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estado_envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_enviado_por_fkey" FOREIGN KEY ("enviado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_piloto_id_fkey" FOREIGN KEY ("piloto_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linea_preparacion" ADD CONSTRAINT "linea_preparacion_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estado_envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado" ADD CONSTRAINT "historial_estado_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_ruta" ADD CONSTRAINT "entrega_ruta_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_industria" ADD CONSTRAINT "producto_industria_producto_sitio_id_fkey" FOREIGN KEY ("producto_sitio_id") REFERENCES "producto_sitio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_industria" ADD CONSTRAINT "producto_industria_industria_id_fkey" FOREIGN KEY ("industria_id") REFERENCES "industria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noticia" ADD CONSTRAINT "noticia_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_industria_id_fkey" FOREIGN KEY ("industria_id") REFERENCES "industria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_producto_sitio_id_fkey" FOREIGN KEY ("producto_sitio_id") REFERENCES "producto_sitio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_noticia_id_fkey" FOREIGN KEY ("noticia_id") REFERENCES "noticia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_documentado" ADD CONSTRAINT "producto_documentado_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_documentado" ADD CONSTRAINT "producto_documentado_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_contacto" ADD CONSTRAINT "solicitud_contacto_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_contacto" ADD CONSTRAINT "solicitud_contacto_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_contacto" ADD CONSTRAINT "solicitud_contacto_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_contacto" ADD CONSTRAINT "solicitud_contacto_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_contacto" ADD CONSTRAINT "solicitud_contacto_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informacion_contacto" ADD CONSTRAINT "informacion_contacto_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipio" ADD CONSTRAINT "municipio_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

