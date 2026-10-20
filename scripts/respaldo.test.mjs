import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  CONFIRMACION_SOBRESCRITURA,
  debeSubirSemanal,
  exigeConfirmacionSobrescritura,
  listarParaRetener,
  TIPOS,
} from "./lib-respaldo.mjs";

const CLAVE = "secreto-respaldo-CE07";

const diarios = Array.from({ length: 10 }, (_, indice) => `202610${String(indice + 1).padStart(2, "0")}.dump`);
const semanales = [
  "20260906.dump",
  "20260913.dump",
  "20260920.dump",
  "20260927.dump",
  "20261004.dump",
  "20261011.dump",
];

test("RNF-09: la retención conserva 7 diarios y 4 semanales", () => {
  assert.equal(TIPOS.diario.limite, 7);
  assert.equal(TIPOS.diario.carpeta, "diarios");
  assert.equal(TIPOS.semanal.limite, 4);
  assert.equal(TIPOS.semanal.carpeta, "semanales");

  const diariosConRuido = listarParaRetener([...diarios, "notas.txt", "20261001.dump"], 7);
  assert.deepEqual([...diariosConRuido.conservar].sort(), [
    "20261004.dump",
    "20261005.dump",
    "20261006.dump",
    "20261007.dump",
    "20261008.dump",
    "20261009.dump",
    "20261010.dump",
  ]);
  assert.deepEqual([...diariosConRuido.borrar].sort(), ["20261001.dump", "20261002.dump", "20261003.dump"]);

  const semanalesRetenidos = listarParaRetener(semanales, 4);
  assert.deepEqual([...semanalesRetenidos.conservar].sort(), [
    "20260920.dump",
    "20260927.dump",
    "20261004.dump",
    "20261011.dump",
  ]);
  assert.deepEqual([...semanalesRetenidos.borrar].sort(), ["20260906.dump", "20260913.dump"]);
  assert.deepEqual(listarParaRetener(["20261001.dump"], 7).borrar, []);

  const cliDiarios = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "retener", "diario"], {
    input: `${diarios.join("\n")}\nnotas.txt\n`,
    encoding: "utf8",
  });
  assert.equal(cliDiarios.status, 0);
  assert.deepEqual(cliDiarios.stdout.trim().split("\n").sort(), ["20261001.dump", "20261002.dump", "20261003.dump"]);
  assert.equal(cliDiarios.stdout.includes("notas.txt"), false);

  const cliSemanales = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "retener", "semanal"], {
    input: semanales.join("\n"),
    encoding: "utf8",
  });
  assert.equal(cliSemanales.status, 0);
  assert.deepEqual(cliSemanales.stdout.trim().split("\n").sort(), ["20260906.dump", "20260913.dump"]);

  const directorio = mkdtempSync(path.join(tmpdir(), "incovsa-retencion-"));
  try {
    const bin = path.join(directorio, "bin");
    const remoto = path.join(directorio, "remoto");
    mkdirSync(bin);
    mkdirSync(path.join(remoto, "diarios"), { recursive: true });
    mkdirSync(path.join(remoto, "semanales"), { recursive: true });
    for (const nombre of diarios) writeFileSync(path.join(remoto, "diarios", nombre), "x");
    writeFileSync(path.join(remoto, "diarios", "notas.txt"), "x");
    for (const nombre of semanales) writeFileSync(path.join(remoto, "semanales", nombre), "x");
    const rclone = path.join(bin, "rclone");
    writeFileSync(
      rclone,
      `#!/usr/bin/env bash
set -euo pipefail
cmd="$1"
shift
case "$cmd" in
  lsf)
    dir="\${1#local:}"
    if [ ! -d "$dir" ]; then
      echo "directory not found" >&2
      exit 3
    fi
    ls -1 "$dir"
    ;;
  deletefile)
    rm -f "\${1#local:}"
    ;;
  *)
    echo "rclone no usado: $cmd" >&2
    exit 1
    ;;
esac
`,
    );
    chmodSync(rclone, 0o755);
    const corrida = spawnSync("bash", ["scripts/respaldo.sh"], {
      encoding: "utf8",
      env: {
        PATH: `${bin}:${path.dirname(process.execPath)}:/usr/bin:/bin`,
        HOME: directorio,
        POSTGRES_USER: "incovsa",
        POSTGRES_PASSWORD: CLAVE,
        POSTGRES_DB: "incovsa",
        RCLONE_DEST: `local:${remoto}`,
        SOLO_RETENCION: "1",
      },
    });
    assert.equal(corrida.status, 0, `${corrida.stdout}\n${corrida.stderr}`);
    assert.equal(`${corrida.stdout}${corrida.stderr}`.includes(CLAVE), false);
    assert.deepEqual(readdirSync(path.join(remoto, "diarios")).sort(), [
      "20261004.dump",
      "20261005.dump",
      "20261006.dump",
      "20261007.dump",
      "20261008.dump",
      "20261009.dump",
      "20261010.dump",
      "notas.txt",
    ]);
    assert.deepEqual(readdirSync(path.join(remoto, "semanales")).sort(), [
      "20260920.dump",
      "20260927.dump",
      "20261004.dump",
      "20261011.dump",
    ]);
  } finally {
    rmSync(directorio, { recursive: true, force: true });
  }
});

test("RNF-09: la restauración exige confirmación para sobrescribir producción", () => {
  assert.equal(exigeConfirmacionSobrescritura("incovsa", "incovsa", ""), true);
  assert.equal(exigeConfirmacionSobrescritura("incovsa", "incovsa", "sobrescribir produccion"), true);
  assert.equal(exigeConfirmacionSobrescritura("incovsa", "incovsa", `${CONFIRMACION_SOBRESCRITURA} `), true);
  assert.equal(exigeConfirmacionSobrescritura("incovsa", "incovsa", CONFIRMACION_SOBRESCRITURA), false);
  assert.equal(exigeConfirmacionSobrescritura("incovsa", "incovsa_restaurada", ""), false);
  assert.throws(() => exigeConfirmacionSobrescritura("incovsa", "", ""));

  const bloqueado = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "confirmar", "incovsa", "incovsa", "no"], {
    encoding: "utf8",
  });
  assert.equal(bloqueado.status, 3);
  const permitido = spawnSync(
    process.execPath,
    ["scripts/lib-respaldo.mjs", "confirmar", "incovsa", "incovsa", CONFIRMACION_SOBRESCRITURA],
    { encoding: "utf8" },
  );
  assert.equal(permitido.status, 0);
  const baseNueva = spawnSync(
    process.execPath,
    ["scripts/lib-respaldo.mjs", "confirmar", "incovsa", "incovsa_restaurada", ""],
    { encoding: "utf8" },
  );
  assert.equal(baseNueva.status, 0);

  const entorno = (destino, confirmacion) => ({
    PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin`,
    HOME: tmpdir(),
    POSTGRES_USER: "incovsa",
    POSTGRES_PASSWORD: CLAVE,
    POSTGRES_DB: "incovsa",
    POSTGRES_DB_DEST: destino,
    RCLONE_DEST: "local:/tmp/incovsa-respaldo-no-usar",
    RCLONE_ORIGEN: "diarios/20261020.dump",
    ...(confirmacion === undefined ? {} : { CONFIRMAR_SOBRESCRITURA: confirmacion }),
  });

  const sinFrase = spawnSync("bash", ["scripts/restaurar.sh"], {
    encoding: "utf8",
    env: entorno("incovsa", "si"),
  });
  assert.equal(sinFrase.status, 1, `${sinFrase.stdout}\n${sinFrase.stderr}`);
  assert.match(`${sinFrase.stdout}${sinFrase.stderr}`, /SOBRESCRIBIR PRODUCCION/);
  assert.equal(`${sinFrase.stdout}${sinFrase.stderr}`.includes(CLAVE), false);

  const conFrase = spawnSync("bash", ["scripts/restaurar.sh"], {
    encoding: "utf8",
    env: entorno("incovsa", CONFIRMACION_SOBRESCRITURA),
  });
  const textoConFrase = `${conFrase.stdout}${conFrase.stderr}`;
  assert.notEqual(conFrase.status, 0);
  assert.equal(textoConFrase.includes("debe ser exactamente"), false);
  assert.match(textoConFrase, /la restauración falló/);
  assert.equal(textoConFrase.includes(CLAVE), false);

  const destinoNuevo = spawnSync("bash", ["scripts/restaurar.sh"], {
    encoding: "utf8",
    env: entorno("incovsa_restaurada"),
  });
  const textoNuevo = `${destinoNuevo.stdout}${destinoNuevo.stderr}`;
  assert.notEqual(destinoNuevo.status, 0);
  assert.equal(textoNuevo.includes("debe ser exactamente"), false);
  assert.match(textoNuevo, /la restauración falló/);
  assert.equal(textoNuevo.includes(CLAVE), false);
});

test("RNF-09: el semanal se sube el domingo UTC o con FORZAR_SEMANAL", () => {
  assert.equal(debeSubirSemanal("20261018", "0"), true);
  assert.equal(debeSubirSemanal("20261020", "0"), false);
  assert.equal(debeSubirSemanal("20261020", "1"), true);
  assert.equal(debeSubirSemanal("20261020", "true"), false);
  assert.throws(() => debeSubirSemanal("20261340", "0"));

  const domingo = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "plan-semanal", "20261018", "0"], {
    encoding: "utf8",
  });
  assert.equal(domingo.status, 0);
  assert.equal(domingo.stdout.trim(), "1");
  const martes = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "plan-semanal", "20261020", "0"], {
    encoding: "utf8",
  });
  assert.equal(martes.status, 0);
  assert.equal(martes.stdout.trim(), "0");
  const forzado = spawnSync(process.execPath, ["scripts/lib-respaldo.mjs", "plan-semanal", "20261020", "1"], {
    encoding: "utf8",
  });
  assert.equal(forzado.status, 0);
  assert.equal(forzado.stdout.trim(), "1");
});
