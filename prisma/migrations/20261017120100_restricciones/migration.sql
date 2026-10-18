-- Restricciones que Prisma no declara en el esquema (JG-03). Prisma no las compara: `migrate diff` no las ve.

-- Cantidades y Peso de Conversión mayores que cero (RN-50, decisión 1)
ALTER TABLE "detalle_pedido_facturado"
  ADD CONSTRAINT "detalle_pedido_facturado_peso_conversion_kg_positivo" CHECK ("peso_conversion_kg" > 0),
  ADD CONSTRAINT "detalle_pedido_facturado_cantidad_kg_positiva" CHECK ("cantidad_kg" > 0);

ALTER TABLE "linea_preparacion"
  ADD CONSTRAINT "linea_preparacion_peso_conversion_kg_positivo" CHECK ("peso_conversion_kg" > 0),
  ADD CONSTRAINT "linea_preparacion_cantidad_kg_positiva" CHECK ("cantidad_kg" > 0);

ALTER TABLE "entrega_ruta"
  ADD CONSTRAINT "entrega_ruta_total_kg_positivo" CHECK ("total_kg" > 0);

-- Capacidad del camión mayor que cero
ALTER TABLE "camion"
  ADD CONSTRAINT "camion_capacidad_kg_positiva" CHECK ("capacidad_kg" > 0);

-- Posición de las imágenes y de los valores de 1 a 5 (RN-56, RF-SW-29)
ALTER TABLE "imagen"
  ADD CONSTRAINT "imagen_posicion_1_a_5" CHECK ("posicion" BETWEEN 1 AND 5);

ALTER TABLE "valor"
  ADD CONSTRAINT "valor_posicion_1_a_5" CHECK ("posicion" BETWEEN 1 AND 5);

-- Sistema de la cuenta (decisión 26) y tipo del envío
ALTER TABLE "usuario"
  ADD CONSTRAINT "usuario_sistema_valido" CHECK ("sistema" IN ('sitio', 'picking', 'ambos'));

ALTER TABLE "envio"
  ADD CONSTRAINT "envio_tipo_valido" CHECK ("tipo" IN ('ruta', 'pedido'));

-- La bitácora no se edita ni se borra (RN-39, decisión 5)
CREATE FUNCTION "bitacora_rechazar_cambios"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'La bitácora no se edita ni se borra (RN-39): % rechazado', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER "bitacora_sin_cambios"
  BEFORE UPDATE OR DELETE ON "bitacora"
  FOR EACH ROW EXECUTE FUNCTION "bitacora_rechazar_cambios"();

CREATE TRIGGER "bitacora_sin_vaciar"
  BEFORE TRUNCATE ON "bitacora"
  FOR EACH STATEMENT EXECUTE FUNCTION "bitacora_rechazar_cambios"();
