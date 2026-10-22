import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const VENDOR = "file:vendor/xlsx-0.20.3.tgz";
const HUELLA_XLSX = "sha512-oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA==";

export function validarCadena(lock) {
  if (!lock.packages || typeof lock.packages !== "object") return ["Falta packages en el archivo de bloqueo."];
  const errores = [];
  for (const [nombre, paquete] of Object.entries(lock.packages)) {
    if (nombre === "") continue;
    // Los paquetes incluidos en un tarball npm no tienen URL/huella propias. Su ancestro debe declarar
    // el bundle y superar íntegramente la misma validación; una marca inBundle aislada nunca autoriza.
    if (paquete.inBundle && !paquete.resolved && !paquete.link) {
      let permitidoPorBundle = false;
      let padre = nombre;
      while (padre.includes("/node_modules/")) {
        padre = padre.slice(0, padre.lastIndexOf("/node_modules/"));
        const contenedor = lock.packages[padre];
        if (!contenedor || contenedor.inBundle) continue;
        if (
          (contenedor.bundleDependencies === true || contenedor.bundleDependencies?.length) &&
          validarCadena({ packages: { [padre]: contenedor } }).length === 0
        ) {
          permitidoPorBundle = true;
        }
        break;
      }
      if (permitidoPorBundle) continue;
    }
    let permitido = false;
    if (paquete.resolved === VENDOR && nombre === "node_modules/xlsx" && paquete.integrity === HUELLA_XLSX)
      permitido = true;
    else {
      try {
        const url = new URL(paquete.resolved);
        permitido =
          url.origin === "https://registry.npmjs.org" && !url.username && !url.password && !url.search && !url.hash;
      } catch {
        /* Un origen local o ausente no es el registro oficial. */
      }
    }
    if (!permitido || paquete.link) errores.push(`${nombre}: origen de dependencia no permitido.`);
    if (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(paquete.integrity ?? ""))
      errores.push(`${nombre}: falta integridad SHA-512 completa.`);
  }
  return errores;
}

function avisarCambios() {
  const base = process.env.BASE_DEPENDENCIAS;
  if (!base) return;
  if (!/^[0-9a-f]{40}$/.test(base)) throw new Error("La base de dependencias debe ser un SHA de Git.");
  const anterior = JSON.parse(execFileSync("git", ["show", `${base}:package.json`], { encoding: "utf8" }));
  const actual = JSON.parse(readFileSync("package.json", "utf8"));
  const cambios = [];
  for (const seccion of ["dependencies", "devDependencies", "overrides"]) {
    for (const nombre of new Set([...Object.keys(anterior[seccion] ?? {}), ...Object.keys(actual[seccion] ?? {})])) {
      const antes = JSON.stringify(anterior[seccion]?.[nombre] ?? null);
      const despues = JSON.stringify(actual[seccion]?.[nombre] ?? null);
      if (antes !== despues) cambios.push(`- ${seccion}: ${JSON.stringify(nombre)}: ${antes} → ${despues}`);
    }
  }
  // El lockfile puede cambiar dependencias transitivas sin cambiar el manifiesto.
  const lockAntes = JSON.parse(execFileSync("git", ["show", `${base}:package-lock.json`], { encoding: "utf8" }));
  const lockAhora = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const transitivas = new Set([...Object.keys(lockAntes.packages), ...Object.keys(lockAhora.packages)]);
  let total = 0;
  for (const nombre of transitivas)
    if (nombre && JSON.stringify(lockAntes.packages[nombre]) !== JSON.stringify(lockAhora.packages[nombre])) total++;
  if (!cambios.length && !total) return;
  const cuerpo = `<!-- incovsa-dependencias -->\n@jordin-garcia: este PR cambia dependencias (RNF-16).\n\n${cambios.join("\n")}\n\nEntradas modificadas del archivo de bloqueo: ${total}. lockfile-lint y OSV-Scanner deben aprobar antes de integrar.`;
  console.log(cuerpo);
  if (!process.env.PR) return;
  const carpeta = mkdtempSync(join(tmpdir(), "incovsa-aviso-"));
  try {
    const archivo = join(carpeta, "aviso.md");
    writeFileSync(archivo, cuerpo);
    execFileSync("gh", ["pr", "comment", process.env.PR, "--body-file", archivo], { stdio: "inherit" });
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errores = validarCadena(JSON.parse(readFileSync("package-lock.json", "utf8")));
  if (errores.length) {
    console.error(errores.join("\n"));
    process.exitCode = 1;
  } else if (process.argv.includes("--solo-origenes")) {
    console.log("Orígenes e integridad SHA-512 del archivo de bloqueo: correctos.");
  } else {
    const resultado = spawnSync(
      process.execPath,
      [
        "node_modules/lockfile-lint/bin/lockfile-lint.js",
        "--path",
        "package-lock.json",
        "--allowed-hosts",
        "npm",
        "--allowed-urls",
        VENDOR,
        "--allowed-schemes",
        "https:",
        "file:",
        "--validate-integrity",
      ],
      { stdio: "inherit" },
    );
    if (resultado.error) throw resultado.error;
    if (resultado.status !== 0) process.exitCode = resultado.status ?? 1;
    else avisarCambios();
  }
}
