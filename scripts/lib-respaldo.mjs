import { readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CONFIRMACION_SOBRESCRITURA = "SOBRESCRIBIR PRODUCCION";

export const TIPOS = {
  diario: { carpeta: "diarios", limite: 7 },
  semanal: { carpeta: "semanales", limite: 4 },
};

const NOMBRE_VOLCADO = /^[0-9]{8}\.dump$/;

export function listarParaRetener(nombres, limite) {
  const cantidad = Number(limite);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error("límite inválido");
  }
  const validos = [
    ...new Set(nombres.map((nombre) => String(nombre).trim()).filter((nombre) => NOMBRE_VOLCADO.test(nombre))),
  ];
  validos.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return {
    conservar: validos.slice(0, cantidad),
    borrar: validos.slice(cantidad),
  };
}

export function exigeConfirmacionSobrescritura(dbOrigen, dbDest, confirmacion) {
  if (typeof dbOrigen !== "string" || typeof dbDest !== "string" || dbOrigen === "" || dbDest === "") {
    throw new Error("nombres de base vacíos");
  }
  if (dbDest !== dbOrigen) return false;
  return confirmacion !== CONFIRMACION_SOBRESCRITURA;
}

export function esDomingoUtc(fecha) {
  if (!/^[0-9]{8}$/.test(fecha)) throw new Error("fecha inválida");
  const anio = Number(fecha.slice(0, 4));
  const mes = Number(fecha.slice(4, 6));
  const dia = Number(fecha.slice(6, 8));
  const instante = new Date(Date.UTC(anio, mes - 1, dia));
  if (instante.getUTCFullYear() !== anio || instante.getUTCMonth() !== mes - 1 || instante.getUTCDate() !== dia) {
    throw new Error("fecha inválida");
  }
  return instante.getUTCDay() === 0;
}

export function debeSubirSemanal(fecha, forzar) {
  if (forzar === 1 || forzar === "1") return true;
  return esDomingoUtc(fecha);
}

function esPrincipal() {
  if (!process.argv[1]) return false;
  try {
    return pathToFileURL(realpathSync(resolve(process.argv[1]))).href === import.meta.url;
  } catch {
    return false;
  }
}

function main() {
  const [comando, primero, segundo, tercero = ""] = process.argv.slice(2);
  if (comando === "carpeta") {
    const tipo = TIPOS[primero];
    if (!tipo) {
      console.error("tipo de respaldo desconocido");
      process.exit(2);
    }
    console.log(tipo.carpeta);
    return;
  }
  if (comando === "retener") {
    const tipo = TIPOS[primero];
    if (!tipo) {
      console.error("tipo de respaldo desconocido");
      process.exit(2);
    }
    const { borrar } = listarParaRetener(readFileSync(0, "utf8").split(/\r?\n/), tipo.limite);
    if (borrar.length > 0) console.log(borrar.join("\n"));
    return;
  }
  if (comando === "plan-semanal") {
    try {
      console.log(debeSubirSemanal(primero, segundo) ? "1" : "0");
    } catch {
      console.error("FECHA debe ser YYYYMMDD");
      process.exit(2);
    }
    return;
  }
  if (comando === "confirmar") {
    try {
      if (exigeConfirmacionSobrescritura(primero, segundo, tercero)) process.exit(3);
    } catch {
      process.exit(2);
    }
    return;
  }
  console.error("uso: lib-respaldo.mjs carpeta|retener|plan-semanal|confirmar");
  process.exit(2);
}

if (esPrincipal()) main();
