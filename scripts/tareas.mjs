#!/usr/bin/env node
// Lista y valida las tareas del plan de desarrollo (plan/tareas/*.md).
// Funciona igual en Windows y macOS; solo requiere Node 24 y no usa dependencias.
// Adaptado del script del repositorio shapi del coordinador (specs/16, decisión 60).
//
// Uso:
//   node scripts/tareas.mjs                          resumen de todo el equipo
//   node scripts/tareas.mjs --persona josue          tareas de una persona (disponibles, en espera, bloqueadas, hechas)
//   node scripts/tareas.mjs --siguiente josue        solo el ID de la siguiente tarea disponible (la de fecha más cercana)
//   node scripts/tareas.mjs --hoy [josue]            qué le toca hoy a cada persona (o a una), qué tiene atrasado y qué sigue
//   node scripts/tareas.mjs --calendario             el calendario por día, en Markdown (el de plan/calendario.md)
//   node scripts/tareas.mjs --calendario --escribir  reescribe ese calendario en plan/calendario.md
//   node scripts/tareas.mjs --ver JM-03              verifica si una tarea se puede empezar
//   node scripts/tareas.mjs --validar                valida el formato de todas las tareas (se usa en la CI)
//   node scripts/tareas.mjs --json                   todas las tareas con su situación, en JSON (para el tablero)
//   node scripts/tareas.mjs --validar-titulo         valida el título de un PR (argumento o variable TITULO_PR)
//   node scripts/tareas.mjs --validar-cierre         valida que el PR cierre su tarea (argumento o variable TITULO_PR)
//
// Personas válidas: jordin, carlos, daniela, josue, jose-daniel

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(RAIZ, "plan", "tareas");
const CALENDARIO = join(RAIZ, "plan", "calendario.md");
// Rama de integración (specs/16): los PR de las tareas van a develop.
const RAMA_BASE = "develop";

export const PERSONAS = {
  jordin: { nombre: "Jordin García", corto: "Jordin", prefijo: "JG", github: "jordin-garcia" },
  carlos: { nombre: "Carlos Hugo Escobar", corto: "Carlos", prefijo: "CE", github: "carloshugoeg" },
  daniela: { nombre: "Daniela Marín", corto: "Daniela", prefijo: "DM", github: "InAlexa" },
  josue: { nombre: "Josué Menéndez", corto: "Josué", prefijo: "JM", github: "Josh-JM" },
  "jose-daniel": { nombre: "José Daniel Cifuentes", corto: "José Daniel", prefijo: "JC", github: "JDaniC" },
};
const ESTADOS = ["pendiente", "hecha", "bloqueada"];
// E2: avance del Entregable 2 (se presenta el 19/10). E3: desarrollo completo (02/11). entrega: documentos,
// capacitación y presentación del Entregable 3 (04/11).
export const HITOS = ["E2", "E3", "entrega"];
const PRIORIDADES = ["P1", "P2", "P3"];
const ORDEN_HITO = { E2: 1, E3: 2, entrega: 3 };
const CAMPOS = ["id", "titulo", "persona", "responsable", "hito", "prioridad", "estado", "depende_de"];
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2026-10-17" → "sáb 17 oct". Se calcula en UTC para que el día de la semana no dependa de la zona horaria.
export function fechaCorta(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}`;
}

function parsearFrontmatter(texto, archivo) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`${archivo}: falta el bloque --- de metadatos al inicio`);
  const datos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    if (!linea.trim() || linea.trim().startsWith("#")) continue;
    const i = linea.indexOf(":");
    if (i < 0) throw new Error(`${archivo}: línea de metadatos inválida: "${linea}"`);
    const clave = linea.slice(0, i).trim();
    let valor = linea.slice(i + 1).trim();
    if (valor.startsWith("[") && valor.endsWith("]")) {
      valor = valor
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      valor = valor.replace(/^["']|["']$/g, "");
    }
    datos[clave] = valor;
  }
  return datos;
}

export function cargar() {
  const archivos = readdirSync(DIR).filter((a) => a.endsWith(".md") && !a.startsWith("_") && a !== "README.md");
  const tareas = [];
  const errores = [];
  for (const archivo of archivos) {
    try {
      const t = parsearFrontmatter(readFileSync(join(DIR, archivo), "utf8"), archivo);
      t.archivo = `plan/tareas/${archivo}`;
      tareas.push(t);
    } catch (e) {
      errores.push(e.message);
    }
  }
  return { tareas, errores };
}

export function validar(tareas, erroresIniciales = []) {
  const errores = [...erroresIniciales];
  const ids = new Map();
  for (const t of tareas) {
    for (const c of CAMPOS) if (t[c] === undefined) errores.push(`${t.archivo}: falta el campo "${c}"`);
    if (ids.has(t.id)) errores.push(`${t.archivo}: ID duplicado ${t.id} (también en ${ids.get(t.id)})`);
    ids.set(t.id, t.archivo);
    const p = PERSONAS[t.persona];
    if (!p) errores.push(`${t.archivo}: persona "${t.persona}" no válida (${Object.keys(PERSONAS).join(", ")})`);
    else if (!String(t.id).startsWith(p.prefijo + "-") && t.reasignada !== "si")
      errores.push(
        `${t.archivo}: el ID ${t.id} no coincide con el prefijo ${p.prefijo} de ${t.persona} (si se reasignó, agregue reasignada: si)`,
      );
    if (!t.archivo.includes(`/${t.id}-`))
      errores.push(`${t.archivo}: el nombre del archivo debe empezar con "${t.id}-"`);
    if (!ESTADOS.includes(t.estado))
      errores.push(`${t.archivo}: estado "${t.estado}" no válido (${ESTADOS.join(", ")})`);
    if (!HITOS.includes(String(t.hito))) errores.push(`${t.archivo}: hito "${t.hito}" no válido (${HITOS.join(", ")})`);
    if (!PRIORIDADES.includes(t.prioridad))
      errores.push(`${t.archivo}: prioridad "${t.prioridad}" no válida (${PRIORIDADES.join(", ")})`);
    if (!Array.isArray(t.depende_de))
      errores.push(`${t.archivo}: depende_de debe ser una lista, por ejemplo [JG-02, JM-02] o []`);
    if (t.estado === "bloqueada" && !t.bloqueo)
      errores.push(`${t.archivo}: una tarea bloqueada debe explicar el motivo en el campo "bloqueo"`);
    if (t.no_antes_de && !FORMATO_FECHA.test(t.no_antes_de))
      errores.push(`${t.archivo}: no_antes_de debe tener el formato AAAA-MM-DD`);
    if (t.programada !== undefined && !FORMATO_FECHA.test(t.programada))
      errores.push(`${t.archivo}: programada debe tener el formato AAAA-MM-DD`);
    else if (t.programada === undefined && t.estado !== "hecha")
      errores.push(
        `${t.archivo}: falta el campo "programada" (el día del calendario en que se hace la tarea, AAAA-MM-DD)`,
      );
    else if (t.programada && t.no_antes_de && t.programada < t.no_antes_de)
      errores.push(`${t.archivo}: programada (${t.programada}) es antes de no_antes_de (${t.no_antes_de})`);
  }
  const porId = Object.fromEntries(tareas.map((t) => [t.id, t]));
  for (const t of tareas) {
    for (const d of t.depende_de || []) {
      if (!ids.has(d)) errores.push(`${t.archivo}: depende de ${d}, que no existe`);
      if (d === t.id) errores.push(`${t.archivo}: depende de sí misma`);
      // Con el calendario apretado del proyecto, una tarea puede programarse el mismo día que su dependencia
      // (se hace después de ella), pero nunca antes.
      const dep = porId[d];
      if (dep && dep.estado !== "hecha" && t.programada && dep.programada && t.programada < dep.programada) {
        errores.push(
          `${t.archivo}: programada (${t.programada}) no puede ser antes de la de su dependencia ${d} (${dep.programada})`,
        );
      }
    }
  }
  // detectar ciclos
  const visitando = new Set(),
    listo = new Set();
  const dfs = (id, camino) => {
    if (listo.has(id) || !porId[id]) return;
    if (visitando.has(id)) {
      errores.push(`Dependencia circular: ${[...camino, id].join(" → ")}`);
      return;
    }
    visitando.add(id);
    for (const d of porId[id].depende_de || []) dfs(d, [...camino, id]);
    visitando.delete(id);
    listo.add(id);
  };
  for (const t of tareas) dfs(t.id, []);
  return errores;
}

export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function clasificar(tareas) {
  const porId = Object.fromEntries(tareas.map((t) => [t.id, t]));
  const fecha = hoy();
  for (const t of tareas) {
    const faltan = (t.depende_de || []).filter((d) => porId[d]?.estado !== "hecha");
    t.faltan = faltan;
    t.esperaFecha = t.no_antes_de && t.no_antes_de > fecha;
    t.atrasada = t.estado !== "hecha" && Boolean(t.programada) && t.programada < fecha;
    if (t.estado === "hecha") t.situacion = "hecha";
    else if (t.estado === "bloqueada") t.situacion = "bloqueada";
    else if (faltan.length || t.esperaFecha) t.situacion = "en_espera";
    else t.situacion = "disponible";
  }
  // Primero la fecha del calendario; dentro del mismo día, el orden del hito, la prioridad y el número de la tarea.
  const orden = (a, b) =>
    (a.programada ?? "9999").localeCompare(b.programada ?? "9999") ||
    ORDEN_HITO[a.hito] - ORDEN_HITO[b.hito] ||
    a.prioridad.localeCompare(b.prioridad) ||
    a.id.localeCompare(b.id, undefined, { numeric: true });
  return tareas.sort(orden);
}

function cuando(t) {
  if (!t.programada || t.estado === "hecha") return "";
  return t.atrasada
    ? ` · ⏰ atrasada (programada: ${fechaCorta(t.programada)})`
    : ` · programada: ${fechaCorta(t.programada)}`;
}

function linea(t, porId) {
  const base = `  ${t.id.padEnd(6)} [${String(t.hito).padEnd(7)} ${t.prioridad}] ${t.titulo}${cuando(t)}`;
  if (t.situacion === "en_espera") {
    const motivos = [];
    if (t.faltan.length)
      motivos.push(
        "espera a " + t.faltan.map((d) => `${d} (${PERSONAS[porId[d]?.persona]?.nombre ?? "?"})`).join(", "),
      );
    if (t.esperaFecha) motivos.push(`no antes del ${t.no_antes_de}`);
    return `${base}\n         ↳ ${motivos.join("; ")}`;
  }
  if (t.situacion === "bloqueada") return `${base}\n         ↳ BLOQUEADA: ${t.bloqueo}`;
  return base;
}

function mostrarPersona(persona, tareas) {
  const p = PERSONAS[persona];
  if (!p) {
    console.error(`Persona desconocida "${persona}". Use: ${Object.keys(PERSONAS).join(", ")}`);
    process.exit(2);
  }
  const porId = Object.fromEntries(tareas.map((t) => [t.id, t]));
  const mias = tareas.filter((t) => t.persona === persona);
  const grupos = { disponible: [], en_espera: [], bloqueada: [], hecha: [] };
  for (const t of mias) grupos[t.situacion].push(t);
  console.log(`\nTareas de ${p.nombre} (${persona}) — ${grupos.hecha.length}/${mias.length} hechas\n`);
  console.log(`DISPONIBLES AHORA (en este orden):`);
  console.log(grupos.disponible.length ? grupos.disponible.map((t) => linea(t, porId)).join("\n") : "  (ninguna)");
  console.log(`\nEN ESPERA (dependencias o fecha):`);
  console.log(grupos.en_espera.length ? grupos.en_espera.map((t) => linea(t, porId)).join("\n") : "  (ninguna)");
  if (grupos.bloqueada.length) {
    console.log(`\nBLOQUEADAS:`);
    console.log(grupos.bloqueada.map((t) => linea(t, porId)).join("\n"));
  }
  console.log(`\nHECHAS:`);
  console.log(grupos.hecha.length ? grupos.hecha.map((t) => `  ${t.id} ${t.titulo}`).join("\n") : "  (ninguna)");
  if (grupos.disponible[0])
    console.log(`\nSiguiente recomendada: ${grupos.disponible[0].id} → ${grupos.disponible[0].archivo}`);
}

// Tareas pendientes de otras personas que esperan a t: "Josué Menéndez (JM-03), Daniela Marín (DM-04)".
export function laEsperan(t, tareas) {
  const porPersona = new Map();
  for (const x of tareas) {
    if (x.estado === "hecha" || x.persona === t.persona || !(x.depende_de || []).includes(t.id)) continue;
    porPersona.set(x.persona, [...(porPersona.get(x.persona) ?? []), x.id]);
  }
  return [...porPersona].map(([p, ids]) => `${PERSONAS[p]?.nombre ?? p} (${ids.join(", ")})`).join(", ");
}

// Lo programado para hoy, lo atrasado y la siguiente tarea después de hoy de cada persona, con quién la espera.
export function resumenHoy(tareas, persona, fecha) {
  return Object.entries(PERSONAS)
    .filter(([clave]) => !persona || clave === persona)
    .map(([clave, p]) => {
      const pendientes = tareas.filter((t) => t.persona === clave && t.estado !== "hecha" && t.programada);
      const conEspera = (t) => ({ tarea: t, laEsperan: laEsperan(t, tareas) });
      return {
        persona: clave,
        nombre: p.nombre,
        deHoy: pendientes.filter((t) => t.programada === fecha).map(conEspera),
        atrasadas: pendientes.filter((t) => t.atrasada).map(conEspera),
        proxima: pendientes.find((t) => t.programada > fecha) ?? null,
      };
    });
}

function mostrarHoy(tareas, persona) {
  if (persona && !PERSONAS[persona]) {
    console.error(`Persona desconocida "${persona}". Use: ${Object.keys(PERSONAS).join(", ")}`);
    process.exit(2);
  }
  const fecha = hoy();
  const porId = Object.fromEntries(tareas.map((t) => [t.id, t]));
  const describir = ({ tarea, laEsperan: esperan }) =>
    linea(tarea, porId) + (esperan ? `\n         ↳ la esperan: ${esperan}` : "");
  console.log(`\nCalendario de hoy, ${fechaCorta(fecha)} (${fecha})`);
  for (const { nombre, deHoy, atrasadas, proxima } of resumenHoy(tareas, persona, fecha)) {
    console.log(`\n${nombre}`);
    console.log(`  HOY:${deHoy.length ? "" : " nada programado"}`);
    for (const t of deHoy) console.log(describir(t));
    if (atrasadas.length) {
      console.log(`  ATRASADAS:`);
      for (const t of atrasadas) console.log(describir(t));
    }
    console.log(
      `  DESPUÉS: ${proxima ? `${proxima.id} (${proxima.titulo}), el ${fechaCorta(proxima.programada)}` : "nada programado"}`,
    );
  }
}

const INICIO_CALENDARIO =
  "<!-- calendario:inicio (lo genera node scripts/tareas.mjs --calendario --escribir; no lo edites a mano) -->";
const FIN_CALENDARIO = "<!-- calendario:fin -->";

// Tabla Markdown con una fila por día programado y una columna por persona.
export function tablaCalendario(tareas) {
  const claves = Object.keys(PERSONAS);
  const dias = [...new Set(tareas.filter((t) => t.programada).map((t) => t.programada))].sort();
  const lineas = [
    `| Día | ${claves.map((c) => PERSONAS[c].corto).join(" | ")} |`,
    `|---|${claves.map(() => "---").join("|")}|`,
  ];
  for (const dia of dias) {
    const celdas = claves.map(
      (c) =>
        tareas
          .filter((t) => t.programada === dia && t.persona === c)
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
          .map((t) => `**${t.id}** ${t.titulo}`)
          .join("<br>") || "—",
    );
    const corta = fechaCorta(dia);
    lineas.push(`| ${corta[0].toUpperCase()}${corta.slice(1)} | ${celdas.join(" | ")} |`);
  }
  return lineas.join("\n");
}

// Devuelve el texto de calendario.md con el bloque generado reemplazado, o null si faltan las marcas.
export function reemplazarCalendario(texto, tabla) {
  const i = texto.indexOf(INICIO_CALENDARIO);
  const f = i < 0 ? -1 : texto.indexOf(FIN_CALENDARIO, i);
  if (i < 0 || f < i) return null;
  const salto = texto.includes("\r\n") ? "\r\n" : "\n";
  return texto.slice(0, i) + [INICIO_CALENDARIO, "", ...tabla.split("\n"), "", ""].join(salto) + texto.slice(f);
}

function resumen(tareas) {
  console.log(`\nResumen del plan (${hoy()})\n`);
  for (const [clave, p] of Object.entries(PERSONAS)) {
    const mias = tareas.filter((t) => t.persona === clave);
    const cuenta = (s) => mias.filter((t) => t.situacion === s).length;
    console.log(
      `  ${p.nombre.padEnd(22)} hechas ${String(cuenta("hecha")).padStart(2)}/${String(mias.length).padEnd(3)} disponibles ${cuenta("disponible")}  en espera ${cuenta("en_espera")}  bloqueadas ${cuenta("bloqueada")}`,
    );
  }
  for (const h of HITOS) {
    const del = tareas.filter((t) => String(t.hito) === h);
    const hechas = del.filter((t) => t.estado === "hecha").length;
    console.log(`\n  Hito ${h}: ${hechas}/${del.length} hechas`);
    for (const t of del.filter((x) => x.estado !== "hecha"))
      console.log(
        `    ${t.id.padEnd(6)} ${t.prioridad} ${PERSONAS[t.persona]?.nombre.padEnd(22)} ${t.situacion.padEnd(10)} ${t.titulo}`,
      );
  }
  console.log(
    `\nPara ver las tareas de una persona: node scripts/tareas.mjs --persona <${Object.keys(PERSONAS).join("|")}>`,
  );
}

// Título de un PR: "[<ID>] <título>", con el ID de una tarea que existe (plan/protocolo.md §B11).
// El bot de revisión toma el ID del título: sin él, no revisa criterios ni alcance.
export const FORMATO_TITULO = /^\[([A-Z]{2}-\d{2,})\] +\S/;

export function validarTituloPr(titulo, ids) {
  const coincidencia = FORMATO_TITULO.exec(titulo ?? "");
  if (!coincidencia) {
    return [
      `El título "${(titulo ?? "").trim()}" no sigue el formato "[<ID>] <título>", por ejemplo "[JM-03] Bodega: preparación de rutas y pedidos".`,
    ];
  }
  if (!ids.includes(coincidencia[1])) {
    return [`La tarea ${coincidencia[1]} del título no existe en plan/tareas/.`];
  }
  return [];
}

// Cierre de la tarea en el PR (plan/protocolo.md B10):
//   - "[<ID>] Bloqueada: …" (§C): la tarea queda con estado: bloqueada (validar() exige además el campo bloqueo).
//   - "[<ID>] Plan de la auditoría …" (§E2): solo integra el plan de la auditoría; no cierra ninguna tarea.
//   - Cualquier otro: la tarea queda con estado: hecha y tiene "## Resultado". En una corrección de auditoría (§E3) de
//     una tarea que ya estaba hecha en develop, además, la subsección "### Correcciones de la auditoría (AAAA-MM-DD)".
//   - Todos agregan una entrada en una bitácora. Si no se conocen los archivos del PR (archivos = null), eso no se revisa.
export function validarCierrePr(titulo, tarea, textoTarea, archivos, estadoAnterior = null, enLaCi = false) {
  const id = FORMATO_TITULO.exec(titulo ?? "")?.[1];
  if (!id || !tarea) return [];
  const resto = titulo.replace(/^\[[^\]]+\] +/, "");
  if (/^Plan de la auditoría\b/.test(resto)) return [];
  const errores = [];
  if (/^Bloqueada:/.test(resto)) {
    if (tarea.estado !== "bloqueada")
      errores.push(
        `${tarea.archivo}: un PR "Bloqueada:" deja la tarea con "estado: bloqueada" y el campo "bloqueo" (protocolo §C).`,
      );
  } else {
    if (tarea.estado !== "hecha")
      errores.push(`${tarea.archivo}: el PR debe cerrar la tarea con "estado: hecha" (protocolo B10).`);
    if (!/^## Resultado[ \t]*\r?$/m.test(textoTarea))
      errores.push(`${tarea.archivo}: falta la sección "## Resultado" al final (protocolo B10).`);
    if (
      /^Correcciones de la auditoría\b/.test(resto) &&
      estadoAnterior === "hecha" &&
      !/^### Correcciones de la auditoría \(\d{4}-\d{2}-\d{2}\)/m.test(textoTarea)
    ) {
      errores.push(
        `${tarea.archivo}: falta la subsección "### Correcciones de la auditoría (AAAA-MM-DD)" dentro de "## Resultado" (protocolo §E3).`,
      );
    }
  }
  if (enLaCi && archivos === null) {
    errores.push(
      "No se pudo leer el diff del PR en la CI (¿falta fetch-depth: 2 en actions/checkout?): no se puede comprobar el cierre.",
    );
  }
  if (archivos && !archivos.some((a) => /^plan\/bitacora\/[^/]+\.md$/.test(a))) {
    errores.push(`El PR no agrega ninguna entrada en plan/bitacora/<persona>.md (protocolo B10).`);
  }
  return errores;
}

const gitPorDefecto = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

// Contra qué se compara el PR. En la CI de un pull_request, actions/checkout deja el commit de prueba de la
// integración, cuyo primer padre es la punta actual de develop (hace falta fetch-depth: 2). En local se compara
// contra origin/develop; los cambios sin commit no cuentan. Lanza un error si no hay contra qué comparar.
export function baseDelPr(entorno = process.env, git = gitPorDefecto) {
  if (entorno.GITHUB_EVENT_NAME === "pull_request") {
    git(["rev-parse", "--verify", "--quiet", "HEAD^2"]);
    return { base: "HEAD^1", rango: ["HEAD^1", "HEAD"] };
  }
  git(["rev-parse", "--verify", "--quiet", `origin/${RAMA_BASE}`]);
  return { base: `origin/${RAMA_BASE}`, rango: [`origin/${RAMA_BASE}...HEAD`] };
}

// Los archivos que cambia el PR, o null si no se sabe. Con --no-renames, un archivo movido aparece con su ruta de
// origen y con la de destino.
export function archivosDelPr(git = gitPorDefecto, entorno = process.env) {
  try {
    const { rango } = baseDelPr(entorno, git);
    return git(["diff", "--name-only", "--no-renames", ...rango])
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return null;
  }
}

// El estado de la tarea en develop, o null si la tarea no existía ahí (la crea el PR) o no se sabe.
export function estadoEnBase(archivo, git = gitPorDefecto, entorno = process.env) {
  try {
    const { base } = baseDelPr(entorno, git);
    return /^estado:\s*(\S+)/m.exec(git(["show", `${base}:${archivo}`]))?.[1] ?? null;
  } catch {
    return null;
  }
}

// Forma pública de una tarea (--json).
export function aJson(t) {
  return {
    id: t.id,
    titulo: t.titulo,
    persona: t.persona,
    github: PERSONAS[t.persona]?.github ?? null,
    hito: String(t.hito),
    prioridad: t.prioridad,
    estado: t.estado,
    depende_de: t.depende_de,
    situacion: t.situacion,
    faltan: t.faltan,
    no_antes_de: t.no_antes_de || null,
    programada: t.programada || null,
    bloqueo: t.bloqueo || null,
  };
}

// Solo se ejecuta como programa, no cuando otro script lo importa.
const esPrincipal =
  import.meta.main ??
  (process.argv[1] && pathToFileURL(realpathSync(resolve(process.argv[1]))).href === import.meta.url);

if (esPrincipal) {
  const args = process.argv.slice(2);
  const { tareas, errores: erroresCarga } = cargar();
  const errores = validar(tareas, erroresCarga);

  if (args[0] === "--validar") {
    const actual = readFileSync(CALENDARIO, "utf8");
    const esperado = reemplazarCalendario(actual, tablaCalendario(tareas));
    if (esperado === null) errores.push("plan/calendario.md: faltan las marcas del calendario por día");
    else if (esperado !== actual)
      errores.push(
        "plan/calendario.md: el calendario por día no coincide con las fechas programadas de las tareas (corra node scripts/tareas.mjs --calendario --escribir)",
      );
    if (errores.length) {
      console.error("El plan tiene errores:\n- " + errores.join("\n- "));
      process.exit(1);
    }
    console.log(`Plan válido: ${tareas.length} tareas.`);
    process.exit(0);
  }
  if (args[0] === "--validar-titulo") {
    const titulo = args[1] ?? process.env.TITULO_PR;
    const erroresTitulo = validarTituloPr(
      titulo,
      tareas.map((t) => t.id),
    );
    if (erroresTitulo.length) {
      console.error(
        `${erroresTitulo.join("\n")}\nCorrija el título del PR: la verificación «titulo» se vuelve a ejecutar sola al editarlo.`,
      );
      process.exit(1);
    }
    console.log(`Título válido: ${titulo}`);
    process.exit(0);
  }
  if (args[0] === "--validar-cierre") {
    const titulo = args[1] ?? process.env.TITULO_PR;
    const tarea = tareas.find((t) => t.id === FORMATO_TITULO.exec(titulo ?? "")?.[1]);
    const texto = tarea ? readFileSync(join(RAIZ, tarea.archivo), "utf8") : "";
    const erroresCierre = validarCierrePr(
      titulo,
      tarea,
      texto,
      archivosDelPr(),
      tarea ? estadoEnBase(tarea.archivo) : null,
      process.env.GITHUB_EVENT_NAME === "pull_request",
    );
    if (erroresCierre.length) {
      console.error(
        `El PR no cierra su tarea:\n- ${erroresCierre.join("\n- ")}\nCorríjalo y haga push: la verificación «titulo» se vuelve a ejecutar sola.`,
      );
      process.exit(1);
    }
    console.log(
      tarea ? `Cierre válido: ${tarea.id} (${tarea.estado}).` : "Sin tarea en el título: lo rechaza --validar-titulo.",
    );
    process.exit(0);
  }
  if (errores.length)
    console.error("Advertencia, el plan tiene errores de formato (corra --validar):\n- " + errores.join("\n- ") + "\n");

  clasificar(tareas);

  if (args[0] === "--json") console.log(JSON.stringify(tareas.map(aJson), null, 2));
  else if (args[0] === "--persona" && args[1]) mostrarPersona(args[1], tareas);
  else if (args[0] === "--hoy") mostrarHoy(tareas, args[1]);
  else if (args[0] === "--calendario") {
    const tabla = tablaCalendario(tareas);
    if (args[1] === "--escribir") {
      const nuevo = reemplazarCalendario(readFileSync(CALENDARIO, "utf8"), tabla);
      if (nuevo === null) {
        console.error("plan/calendario.md no tiene las marcas del calendario por día.");
        process.exit(1);
      }
      writeFileSync(CALENDARIO, nuevo);
      console.log("Calendario por día actualizado en plan/calendario.md.");
    } else console.log(tabla);
  } else if (args[0] === "--siguiente" && args[1]) {
    const t = tareas.find((x) => x.persona === args[1] && x.situacion === "disponible");
    console.log(t ? t.id : "NINGUNA");
  } else if (args[0] === "--ver" && args[1]) {
    const t = tareas.find((x) => x.id === args[1]);
    if (!t) {
      console.error(`No existe la tarea ${args[1]}`);
      process.exit(2);
    }
    const porId = Object.fromEntries(tareas.map((x) => [x.id, x]));
    console.log(linea(t, porId));
    console.log(`  Archivo: ${t.archivo}`);
    console.log(`  Situación: ${t.situacion}${t.situacion === "disponible" ? " (se puede empezar)" : ""}`);
    process.exit(t.situacion === "disponible" ? 0 : 1);
  } else resumen(tareas);
}
