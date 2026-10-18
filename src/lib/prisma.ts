import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/** Crea un cliente de Prisma con el adaptador de PostgreSQL (Prisma 7). Lo usan `prisma`, las semillas y las pruebas. */
export function crearClientePrisma(urlBaseDatos: string | undefined): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: urlBaseDatos }) });
}

// Un solo cliente por proceso. En desarrollo, la recarga de Next.js vuelve a evaluar los módulos: el cliente se
// guarda en globalThis para no abrir conexiones nuevas en cada recarga. No se conecta hasta la primera consulta,
// así que `next build` no necesita DATABASE_URL.
const global = globalThis as unknown as { prismaIncovsa?: PrismaClient };

/** Cliente único de Prisma, conectado a DATABASE_URL. En `npm test`, DATABASE_URL es DATABASE_URL_PRUEBAS. */
export const prisma: PrismaClient = global.prismaIncovsa ?? crearClientePrisma(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") global.prismaIncovsa = prisma;
