-- JG-26: IP de cada solicitud de Contacto para el límite de envíos por IP (specs/05, P-98; DM-14).
-- La columna es opcional: las solicitudes anteriores no tienen IP.

-- AlterTable
ALTER TABLE "solicitud_contacto" ADD COLUMN     "ip" VARCHAR(45);

-- CreateIndex
CREATE INDEX "solicitud_contacto_ip_creado_en_idx" ON "solicitud_contacto"("ip", "creado_en");
