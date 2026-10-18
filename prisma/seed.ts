// `npm run db:semilla`: semilla base (prisma/semillas/base.ts). Se puede ejecutar las veces que haga falta.
import { crearClientePrisma } from "../src/lib/prisma";
import { sembrarBase } from "./semillas/base";

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno
}

async function principal(): Promise<void> {
  const prisma = crearClientePrisma(process.env.DATABASE_URL);
  try {
    await sembrarBase(prisma);
    console.log("Semilla base cargada.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void principal();
