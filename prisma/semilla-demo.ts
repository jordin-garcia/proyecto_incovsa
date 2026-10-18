// `npm run semilla:demo`: datos de demostración, solo en desarrollo (prisma/semillas/demo.ts). Necesita la semilla
// base y la variable CLAVE_DEMO. Se puede ejecutar las veces que haga falta.
import { crearClientePrisma } from "../src/lib/prisma";
import { ErrorSemillaDemo, sembrarDemo } from "./semillas/demo";

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno
}

if (process.env.NODE_ENV === "production") {
  console.error("La semilla de demostración no se ejecuta en producción (specs/16, decisión 79).");
  process.exit(1);
}

async function principal(): Promise<void> {
  const prisma = crearClientePrisma(process.env.DATABASE_URL);
  try {
    await sembrarDemo(prisma, { claveDemo: process.env.CLAVE_DEMO });
    console.log("Datos de demostración cargados: cuentas ejemplo.01 a ejemplo.11, 3 camiones y 28 productos públicos.");
  } catch (error) {
    console.error(error instanceof ErrorSemillaDemo ? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void principal();
