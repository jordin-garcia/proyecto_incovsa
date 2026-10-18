import { expect, it } from "vitest";
import { prisma } from "./prisma";

it("RN-57: cada conexión usa UTC y devuelve la hora real aunque PostgreSQL tenga otra zona por omisión", async () => {
  const [fila] = await prisma.$queryRaw<
    { zona: string; ahora: Date }[]
  >`SELECT current_setting('TimeZone') AS zona, now() AS ahora`;
  expect(fila.zona).toBe("UTC");
  expect(Math.abs(fila.ahora.getTime() - Date.now())).toBeLessThan(60_000);
});
