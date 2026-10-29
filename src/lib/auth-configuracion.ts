import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import type { Sistema } from "@/app/acceso/esquemas";

// Solo desarrollo: claves efímeras por sistema, conservadas durante las recargas. Producción exige las variables.
const globalAuth = globalThis as typeof globalThis & { clavesAuthDesarrollo?: Record<Sistema, string> };
function secreto(sistema: Sistema) {
  const a = process.env.BETTER_AUTH_SECRET_SITIO;
  const b = process.env.BETTER_AUTH_SECRET_PICKING;
  if (a && b && a === b) throw new Error("Las claves de firma de los dos sistemas deben ser distintas.");
  const valor = sistema === "sitio" ? a : b;
  const produccion = process.env.NODE_ENV === "production";
  // Los valores de .env.example y .env.produccion.example («cambie-esto-por…») pasan de 32 caracteres (RNF-10).
  if (produccion && valor && /^cambie-est/i.test(valor))
    throw new Error("La clave de autenticación es la de ejemplo: cámbiela.");
  if (valor && valor.length >= 32) return valor;
  if (produccion) throw new Error("Falta una clave de autenticación de al menos 32 caracteres.");
  globalAuth.clavesAuthDesarrollo ??= {
    sitio: randomBytes(48).toString("base64"),
    picking: randomBytes(48).toString("base64"),
  };
  return globalAuth.clavesAuthDesarrollo[sistema];
}

/** La instancia transaccional usa el MISMO cliente que la operación y la bitácora (decisión 5). */
export function crearAuth(sistema: Sistema, cliente: Prisma.TransactionClient = prisma) {
  const dias = Number(process.env.SESION_DIAS ?? 7);
  if (!Number.isSafeInteger(dias) || dias < 1) throw new Error("SESION_DIAS debe ser un entero positivo.");
  return betterAuth({
    appName: "INCOVSA",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    basePath: `/api/auth/${sistema}`,
    secret: secreto(sistema),
    database: prismaAdapter(cliente, { provider: "postgresql" }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 8 },
    user: {
      modelName: "usuario",
      additionalFields: {
        sistema: { type: "string", required: true, input: false },
        rol: { type: "string", required: true, input: false },
        correo: { type: "string", required: false, input: false },
        activo: { type: "boolean", defaultValue: true, input: false },
        eliminadoEn: { type: "date", required: false, input: false },
      },
    },
    account: { modelName: "cuenta" },
    verification: { modelName: "verificacion" },
    session: {
      modelName: "sesion",
      expiresIn: dias * 86400,
      updateAge: 86400,
      cookieCache: { enabled: false },
    },
    advanced: {
      cookiePrefix: `incovsa-${sistema}`,
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      ipAddress: { ipAddressHeaders: ["x-real-ip"] },
    },
    // El control persistente RNF-15 vive en el servicio; nunca se expone directamente el handler de Better Auth.
    rateLimit: { enabled: false },
    plugins: [username({ maxUsernameLength: 80, usernameValidator: () => true })],
    databaseHooks: {
      session: {
        create: {
          before: async (sesion) => {
            const u = await cliente.usuario.findUnique({ where: { id: sesion.userId } });
            if (!u?.activo || u.eliminadoEn || ![sistema, "ambos"].includes(u.sistema)) return false;
            return { data: sesion };
          },
        },
      },
    },
  });
}
