import { execFileSync, spawnSync } from "node:child_process";

// En PR, Stryker recibe archivos, no líneas: se muta por completo cada archivo cambiado del alcance.
const base = process.env.BASE_MUTACION;
let archivos;
if (base) {
  if (base.startsWith("-")) throw new Error("Referencia base inválida.");
  archivos = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "-z", `${base}...HEAD`], {
    encoding: "utf8",
  })
    .split("\0")
    .filter(
      (ruta) => /^src\/modulos\/(conversion|permisos|envios|bodega)\/.*\.ts$/.test(ruta) && !ruta.endsWith(".test.ts"),
    );
  if (!archivos.length) {
    console.log("Mutación: no cambiaron archivos del alcance; la ejecución completa se hace cada noche.");
    process.exit(0);
  }
}
const resultado = spawnSync(
  process.execPath,
  ["node_modules/@stryker-mutator/core/bin/stryker.js", "run", ...(archivos ? ["--mutate", archivos.join(",")] : [])],
  { stdio: "inherit", env: process.env },
);
if (resultado.error) throw resultado.error;
process.exitCode = resultado.status ?? 1;
