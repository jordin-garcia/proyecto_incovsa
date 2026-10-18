// Preparación global de Vitest (JG-03): antes de las pruebas aplica las migraciones a DATABASE_URL_PRUEBAS y carga la
// semilla base. Las pruebas nunca usan la base de desarrollo (plan/convenciones.md §6).
import { execSync } from "node:child_process";
import { crearClientePrisma } from "../src/lib/prisma";
import { sembrarBase } from "../prisma/semillas/base";

export default async function prepararBaseDePruebas(): Promise<void> {
  const url = process.env.DATABASE_URL_PRUEBAS;
  if (!url) {
    throw new Error(
      "Falta la variable DATABASE_URL_PRUEBAS: `npm test` usa una base de pruebas propia (vea .env.example).",
    );
  }
  // En la CI las dos variables apuntan a la misma base temporal; en un equipo, deben ser bases distintas.
  if (!process.env.CI && url === process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL_PRUEBAS no puede ser la base de desarrollo (DATABASE_URL): las pruebas la vacían.");
  }

  try {
    execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe" });
  } catch (error) {
    const salida = error as { stdout?: Buffer; stderr?: Buffer };
    throw new Error(
      `No se pudieron aplicar las migraciones a la base de pruebas:\n${salida.stdout ?? ""}${salida.stderr ?? ""}`,
    );
  }

  const prisma = crearClientePrisma(url);
  try {
    await sembrarBase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
