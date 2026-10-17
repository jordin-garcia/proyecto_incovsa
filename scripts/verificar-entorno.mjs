#!/usr/bin/env node
// Verifica que el equipo de un integrante tenga lo necesario para trabajar en el proyecto (plan/instalacion.md).
// Solo requiere Node y no usa dependencias. Termina con código 1 si falta algo obligatorio.
//
// Uso: node scripts/verificar-entorno.mjs

import { execFileSync } from "node:child_process";

const resultados = [];
const ejecutar = (cmd, args) =>
  execFileSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  }).trim();

function revisar(nombre, obligatorio, prueba, ayuda) {
  try {
    const detalle = prueba();
    resultados.push({ ok: true, nombre, detalle });
  } catch (e) {
    resultados.push({ ok: false, obligatorio, nombre, detalle: e.message.split("\n")[0], ayuda });
  }
}

revisar(
  "Node.js 24",
  true,
  () => {
    const v = process.versions.node;
    if (Number(v.split(".")[0]) !== 24) throw new Error(`Se encontró Node ${v}; el proyecto usa Node 24 LTS`);
    return v;
  },
  "Instale Node.js 24 LTS (plan/instalacion.md §2)",
);

revisar("npm", true, () => ejecutar("npm", ["--version"]), "npm viene con Node.js");
revisar("Git", true, () => ejecutar("git", ["--version"]), "Instale Git (plan/instalacion.md §2)");
revisar(
  "GitHub CLI",
  true,
  () => ejecutar("gh", ["--version"]).split("\n")[0],
  "Instale GitHub CLI (plan/instalacion.md §2)",
);
revisar(
  "GitHub CLI con sesión iniciada",
  true,
  () => ejecutar("gh", ["api", "user", "--jq", ".login"]),
  "Ejecute gh auth login y gh auth setup-git (plan/instalacion.md §3)",
);
revisar(
  "Acceso al repositorio",
  true,
  () => ejecutar("gh", ["repo", "view", "jordin-garcia/proyecto_incovsa", "--json", "name", "--jq", ".name"]),
  "Acepte la invitación al repositorio en https://github.com/notifications",
);
revisar(
  "PostgreSQL 18 (psql)",
  true,
  () => {
    const v = ejecutar("psql", ["--version"]);
    if (!/\b18\./.test(v)) throw new Error(`Se encontró ${v}; el proyecto usa PostgreSQL 18`);
    return v;
  },
  "Instale PostgreSQL 18 y agregue su carpeta bin al PATH (plan/instalacion.md §2)",
);
revisar(
  "Fin de línea de Git (core.autocrlf=false)",
  false,
  () => {
    let v;
    try {
      v = ejecutar("git", ["config", "--global", "core.autocrlf"]);
    } catch {
      throw new Error("no está configurado");
    }
    if (v !== "false") throw new Error(`core.autocrlf=${v}`);
    return v;
  },
  "git config --global core.autocrlf false",
);

for (const r of resultados) {
  const icono = r.ok ? "✅" : r.obligatorio ? "❌" : "⚠️";
  console.log(`${icono} ${r.nombre}: ${r.detalle}${r.ok ? "" : `\n   → ${r.ayuda}`}`);
}
const faltan = resultados.filter((r) => !r.ok && r.obligatorio);
console.log(
  faltan.length ? `\nFaltan ${faltan.length} requisito(s) obligatorio(s).` : "\nEl equipo tiene todo lo necesario.",
);
process.exit(faltan.length ? 1 : 0);
