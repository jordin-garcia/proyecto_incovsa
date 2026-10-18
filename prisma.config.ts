// Configuración de la CLI de Prisma 7 (JG-03).
import { defineConfig } from "prisma/config";

// Node 24 lee el .env sin dependencias. Si no existe (CI, producción), se usan las variables del entorno.
try {
  process.loadEnvFile();
} catch {
  // Sin .env
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` (postinstall) no se conecta: no exige la variable. Migrar sin ella falla con un mensaje claro.
    url: process.env.DATABASE_URL ?? "",
  },
});
