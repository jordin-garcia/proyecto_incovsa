import { randomUUID } from "node:crypto";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/lib/prisma";
import { claveAccesoInterna, correoInterno } from "../src/lib/cuentas";
import { registrarBitacora } from "../src/modulos/bitacora/servicio";

const esquema = z
  .object({
    nombre: z.string().trim().min(1).max(150),
    usuario: z.string().trim().min(1).max(60).toLowerCase(),
    rol: z.enum(["Gerencia", "Soporte"]),
    clave: z.string().min(8).max(128),
    confirmarClave: z.string(),
  })
  .refine((d) => d.clave === d.confirmarClave, { message: "Las contraseñas no coinciden.", path: ["confirmarClave"] });

export async function crearAdministrador(entrada: unknown) {
  const datos = esquema.parse(entrada);
  const password = await hashPassword(datos.clave);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${"crear-admin:" + datos.usuario}, 0))`;
    if (await tx.usuario.findFirst({ where: { displayUsername: { equals: datos.usuario, mode: "insensitive" } } }))
      throw new Error("El nombre de usuario ya está reservado.");
    const id = randomUUID();
    const username = claveAccesoInterna("ambos", datos.usuario);
    await tx.usuario.create({
      data: {
        id,
        name: datos.nombre,
        username,
        displayUsername: datos.usuario,
        email: correoInterno(username),
        sistema: "ambos",
        rol: datos.rol,
        cuentas: { create: { id: randomUUID(), accountId: id, providerId: "credential", password } },
      },
    });
    await registrarBitacora(tx, {
      sistema: "sitio",
      operacion: "Creación de usuario",
      entidad: "usuario",
      registroId: id,
      usuarioId: id,
      detalle: { origen: "crear-admin" },
    });
    return { id };
  });
}
