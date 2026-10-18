// Ayudantes de las pruebas de integración contra la base de pruebas (JG-03).
import type { PrismaClient } from "../src/generated/prisma/client";
import { prisma as clienteDePruebas } from "../src/lib/prisma";
import { sembrarDatosEditables } from "../prisma/semillas/base";

/**
 * Deja la base de pruebas como recién sembrada: vacía las tablas que llenan las pruebas y vuelve a cargar la semilla
 * base. Se conservan las sedes, los permisos, los estados, los países, los departamentos y los municipios, que la
 * aplicación nunca cambia; las opciones de envío y el contenido del sitio se vuelven a crear con sus valores
 * iniciales. Los identificadores vuelven a empezar en 1. Úsese en `beforeEach`.
 *
 * Es un solo bloque, en una transacción: DELETE de hijos a padres (más rápido que TRUNCATE con tablas pequeñas) y el
 * reinicio de las secuencias. La bitácora no admite DELETE (RN-39): su disparador se desactiva solo dentro del bloque.
 */
export async function limpiarTablasDeNegocio(prisma: PrismaClient = clienteDePruebas): Promise<void> {
  await prisma.$executeRaw`DO $$
    DECLARE secuencia text;
    BEGIN
      ALTER TABLE "bitacora" DISABLE TRIGGER "bitacora_sin_cambios";
      DELETE FROM "bitacora";
      ALTER TABLE "bitacora" ENABLE TRIGGER "bitacora_sin_cambios";
      DELETE FROM "historial_estado";
      DELETE FROM "entrega_ruta";
      DELETE FROM "linea_preparacion";
      DELETE FROM "detalle_pedido_facturado";
      DELETE FROM "pedido_facturado";
      DELETE FROM "envio";
      DELETE FROM "opcion_envio";
      DELETE FROM "camion";
      DELETE FROM "producto_industria";
      DELETE FROM "imagen";
      DELETE FROM "producto_sitio";
      DELETE FROM "noticia";
      DELETE FROM "industria";
      DELETE FROM "producto_documentado";
      DELETE FROM "solicitud_contacto";
      DELETE FROM "informacion_contacto";
      DELETE FROM "contenido_institucional";
      DELETE FROM "valor";
      DELETE FROM "configuracion_sitio";
      DELETE FROM "cuenta";
      DELETE FROM "sesion";
      DELETE FROM "verificacion";
      DELETE FROM "usuario_permiso";
      DELETE FROM "usuario_sede";
      DELETE FROM "usuario";
      FOREACH secuencia IN ARRAY ARRAY[
        'bitacora', 'historial_estado', 'entrega_ruta', 'linea_preparacion', 'detalle_pedido_facturado',
        'pedido_facturado', 'envio', 'opcion_envio', 'camion', 'imagen', 'producto_sitio', 'noticia', 'industria',
        'producto_documentado', 'solicitud_contacto', 'informacion_contacto', 'contenido_institucional', 'valor'
      ] LOOP
        EXECUTE format('ALTER SEQUENCE %I RESTART', secuencia || '_id_seq');
      END LOOP;
    END $$`;
  await sembrarDatosEditables(prisma);
}
