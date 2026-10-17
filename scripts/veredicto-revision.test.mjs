// Pruebas del veredicto de la revisión con Claude (JG-08, verificación obligatoria `revision-claude`). Adaptadas de shapi.
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { decidirRevision, evaluarVeredicto, leerComentarios } from "./veredicto-revision.mjs";

const SHA = "2a8538104b56392157a385811d04449a8cdf6df6";
const OTRO_SHA = "1238c51eb2b8be7c23df68d290fa5315b60d4d3a";
const BOT = "github-actions[bot]";

const revision = (sha, cuerpo, { formato = "linea" } = {}) =>
  (formato === "linea"
    ? `🤖 Revisión automática con Claude\nCommit revisado: ${sha}\n\n`
    : `🤖 Revisión automática con Claude — commit revisado: ${sha}\n\n`) + "```\n" + cuerpo + "\n```";

const LISTO = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\nNinguno\n\nOPCIONAL (no bloquea):\n1. Un detalle.\n\nVEREDICTO: LISTO";
const CORREGIR = "REVISIÓN EM-06\nCORRECCIÓN (obligatorio corregir):\n1. [a.cs:4] Las pruebas no compilan → moverlas.\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: CORREGIR";

const comentario = (body, usuario = BOT, fecha = "2026-09-26T10:00:00Z") => ({ usuario, body, fecha });

test("aprueba cuando la última revisión de ese commit dice LISTO sin correcciones", () => {
  const r = evaluarVeredicto([comentario(revision(SHA, LISTO))], SHA, "EM-03");
  assert.equal(r.estado, "aprobada");
});

test("también reconoce el commit en la línea del título", () => {
  const r = evaluarVeredicto([comentario(revision(SHA, LISTO, { formato: "titulo" }))], SHA, "EM-03");
  assert.equal(r.estado, "aprobada");
});

test("falla cuando la revisión pide corregir", () => {
  const r = evaluarVeredicto([comentario(revision(SHA, CORREGIR))], SHA, "EM-06");
  assert.equal(r.estado, "corregir");
  assert.match(r.mensaje, /--admin/);
});

test("falla si dice LISTO pero enumera hallazgos de corrección", () => {
  const contradictorio = CORREGIR.replace("VEREDICTO: CORREGIR", "VEREDICTO: LISTO");
  assert.equal(evaluarVeredicto([comentario(revision(SHA, contradictorio))], SHA, "EM-06").estado, "corregir");
});

test("usa la revisión más reciente del mismo commit", () => {
  const comentarios = [
    comentario(revision(SHA, CORREGIR), BOT, "2026-09-26T10:00:00Z"),
    comentario(revision(SHA, LISTO), BOT, "2026-09-26T11:00:00Z"),
  ];
  assert.equal(evaluarVeredicto(comentarios, SHA, "EM-03").estado, "aprobada");
  assert.equal(evaluarVeredicto([...comentarios].reverse(), SHA, "EM-03").estado, "aprobada");
});

test("no usa la revisión de otro commit: sin revisión del commit actual, bloquea", () => {
  const r = evaluarVeredicto([comentario(revision(OTRO_SHA, LISTO))], SHA);
  assert.equal(r.estado, "sin_revision");
  assert.match(r.mensaje, /gh run rerun/);
});

test("ignora comentarios que imitan la revisión pero no son del bot", () => {
  const r = evaluarVeredicto([comentario(revision(SHA, LISTO), "MiloDou")], SHA);
  assert.equal(r.estado, "sin_revision");
});

test("ignora comentarios del bot que no son una revisión", () => {
  const r = evaluarVeredicto([comentario(`Otro aviso del bot. Commit revisado: ${SHA}\nVEREDICTO: LISTO`)], SHA);
  assert.equal(r.estado, "sin_revision");
});

test("una revisión sin veredicto cuenta como no completada", () => {
  const incompleta = revision(SHA, "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\nNinguno");
  assert.equal(evaluarVeredicto([comentario(incompleta)], SHA).estado, "sin_revision");
});

test("sin ningún comentario, la revisión no se completó (cuota, caída o tiempo)", () => {
  assert.equal(evaluarVeredicto([], SHA).estado, "sin_revision");
});

test("lee los comentarios en JSON por línea, como los entrega gh api --paginate --jq", () => {
  const texto = [
    JSON.stringify({ usuario: BOT, body: revision(SHA, LISTO), fecha: "2026-09-26T10:00:00Z" }),
    "",
    JSON.stringify({ usuario: "MiloDou", body: "Listo, lo reviso", fecha: "2026-09-26T10:05:00Z" }),
  ].join("\n");
  const comentarios = leerComentarios(texto);
  assert.equal(comentarios.length, 2);
  assert.equal(evaluarVeredicto(comentarios, SHA, "EM-03").estado, "aprobada");
});

test("acepta las palabras clave con formato Markdown sin contar los hallazgos opcionales", () => {
  const markdown = [
    "## REVISIÓN EM-03", "**CORRECCIÓN (obligatorio corregir):**", "Ninguno", "",
    "### OPCIONAL (no bloquea):", "1. Un detalle.", "2. Otro.", "", "**VEREDICTO: LISTO**",
  ].join("\n");
  assert.equal(evaluarVeredicto([comentario(revision(SHA, markdown))], SHA, "EM-03").estado, "aprobada");
  const conHallazgo = markdown.replace("Ninguno", "1. [a.ts:3] Falta la prueba.").replace("LISTO", "CORREGIR");
  assert.equal(evaluarVeredicto([comentario(revision(SHA, conHallazgo))], SHA, "EM-03").estado, "corregir");
});

test("los hallazgos con viñetas también cuentan como corrección", () => {
  const conVinetas = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n- [a.ts:3] Falta la prueba.\n\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, conVinetas))], SHA, "EM-03").estado, "corregir");
  // "Ninguno" en negrita o con punto, y la cerca de código, no son hallazgos.
  const sinHallazgos = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n**Ninguno.**\n```\n\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(`🤖 Revisión automática con Claude\nCommit revisado: ${SHA}\n\n\`\`\`\n${sinHallazgos}`)], SHA, "EM-03").estado, "aprobada");
});

test("la palabra «Corrección» en el texto libre no se confunde con la sección de hallazgos (PR #24)", () => {
  // Estructura real de la revisión del #24: el texto libre empieza con "Corrección de auditoría…" antes de la sección.
  const cuerpo = [
    "REVISIÓN JG-01",
    "Corrección de auditoría (paso 4, H-12 a H-29) hecha por el coordinador.",
    "",
    "Puntos revisados:",
    "- Cada cambio corresponde a un hallazgo.",
    "- Correcciones de la auditoría: la subsección está.",
    "",
    "CORRECCIÓN (obligatorio corregir):",
    "Ninguno",
    "",
    "OPCIONAL (no bloquea):",
    "1. Un detalle.",
    "",
    "VEREDICTO: LISTO",
  ].join("\n");
  const comentarioReal = `🤖 Revisión automática con Claude\nCommit revisado: ${SHA}\n\n${cuerpo}`;
  assert.equal(evaluarVeredicto([comentario(comentarioReal)], SHA, "JG-01").estado, "aprobada");
  const conHallazgo = comentarioReal.replace("CORRECCIÓN (obligatorio corregir):\nNinguno", "CORRECCIÓN (obligatorio corregir):\n1. [a.md:3] Falta algo.");
  assert.equal(evaluarVeredicto([comentario(conHallazgo)], SHA, "JG-01").estado, "corregir");
});

test("con cualquier forma del encabezado, un LISTO con hallazgos sigue fallando", () => {
  for (const encabezado of ["## CORRECCIÓN", "**CORRECCIÓN**", "CORRECCIÓN — obligatorio corregir", "CORRECCIONES:", "CORRECCION (obligatorio corregir):"]) {
    const cuerpo = `REVISIÓN EM-03\n${encabezado}\n1. [a.ts:3] Falta la prueba.\n\nOPCIONAL (no bloquea):\nNinguno\n\nVEREDICTO: LISTO`;
    assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "corregir", encabezado);
  }
  const mismaLinea = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir): 1. [a.ts:3] Falta la prueba.\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, mismaLinea))], SHA, "EM-03").estado, "corregir");
});

test("sin una sección de corrección reconocida, nunca se aprueba", () => {
  const sinSeccion = "REVISIÓN EM-03\nTodo parece bien.\n\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, sinSeccion))], SHA, "EM-03").estado, "sin_revision");
  assert.equal(decidirRevision([comentario(revision(SHA, sinSeccion))], SHA, "EM-03"), true);
});

test("encabezados con mayúscula inicial: con hallazgos y LISTO, falla", () => {
  const cuerpo = "REVISIÓN EM-03\n**Corrección (obligatorio corregir):**\n1. [a.ts:3] Falta la prueba.\n**Opcional (no bloquea):**\nNinguno\n**Veredicto:** LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "corregir");
  const limpio = cuerpo.replace("1. [a.ts:3] Falta la prueba.", "Ninguno");
  assert.equal(evaluarVeredicto([comentario(revision(SHA, limpio))], SHA, "EM-03").estado, "aprobada");
});

test("la descripción después del guion del encabezado no es un hallazgo", () => {
  for (const encabezado of ["CORRECCIÓN — obligatorio corregir", "**CORRECCIÓN** — obligatorio corregir", "CORRECCIÓN - (obligatorio corregir):"]) {
    const cuerpo = `REVISIÓN EM-03\n${encabezado}\nNinguno\n\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: LISTO`;
    assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "aprobada", encabezado);
  }
  for (const vacio of ["(ninguno)", "No hay.", "Ninguna."]) {
    const cuerpo = `REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir): ${vacio}\nVEREDICTO: LISTO`;
    assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "aprobada", vacio);
  }
});

test("un «Corrección (…)» del texto libre no reemplaza a la sección real (se usa la última antes del veredicto)", () => {
  const limpio = "REVISIÓN JG-01\n- Corrección (protocolo §E3): la tarea ya estaba hecha.\n\nCORRECCIÓN (obligatorio corregir):\nNinguno\nOPCIONAL (no bloquea):\n1. x\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, limpio))], SHA, "JG-01").estado, "aprobada");
  const conFalsa = "REVISIÓN JG-01\nCorrección: auditoría paso 4.\nNinguno\nOPCIONAL:\nx\n\nCORRECCIÓN (obligatorio corregir):\n1. [a.ts:3] Falta la prueba.\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, conFalsa))], SHA, "JG-01").estado, "corregir");
});

test("un hallazgo que empieza con «Opcional:» no cierra la sección, y el guion tras el paréntesis se quita", () => {
  const hallazgo = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n- Opcional: el campo X debe ser obligatorio.\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, hallazgo))], SHA, "EM-03").estado, "corregir");
  const guion = "REVISIÓN EM-03\n## CORRECCIÓN (obligatorio corregir) — Ninguno\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, guion))], SHA, "EM-03").estado, "aprobada");
});

test("un segundo encabezado no oculta los hallazgos del primero (se prefiere el primero en MAYÚSCULAS)", () => {
  const H = "1. [a:3] Falta X.";
  for (const cuerpo of [
    `REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n${H}\n- Corrección (H-12)\nVEREDICTO: LISTO`,
    `REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n${H}\nCorrección:\nNinguno\nVEREDICTO: LISTO`,
    `REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n${H}\nCORRECCIÓN (obligatorio corregir):\nNinguno\nVEREDICTO: LISTO`,
  ]) {
    assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "corregir", cuerpo);
  }
});

test("«**Opcional:**» solo en su línea cierra la sección de corrección", () => {
  const limpio = "REVISIÓN EM-03\n**Corrección (obligatorio corregir):**\nNinguno\n**Opcional:**\n1. x\n**Veredicto:** LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, limpio))], SHA, "EM-03").estado, "aprobada");
  const conParentesis = limpio.replace("**Opcional:**", "**Opcional (no bloquea):**");
  assert.equal(evaluarVeredicto([comentario(revision(SHA, conParentesis))], SHA, "EM-03").estado, "aprobada");
  const hallazgo = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\n- Opcional (según RF-3) debe ser obligatorio.\nVEREDICTO: LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, hallazgo))], SHA, "EM-03").estado, "corregir");
});

test("acepta el veredicto con mayúscula inicial y en negrita", () => {
  const cuerpo = "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\nNinguno\n\n**Veredicto:** LISTO";
  assert.equal(evaluarVeredicto([comentario(revision(SHA, cuerpo))], SHA, "EM-03").estado, "aprobada");
});

test("las notas posteriores al veredicto no lo cambian", () => {
  const conNotas = revision(SHA, LISTO) + "\n\nNotas de la revisión: la ronda anterior decía\nVEREDICTO: CORREGIR";
  assert.equal(evaluarVeredicto([comentario(conNotas)], SHA, "EM-03").estado, "aprobada");
});

test("no vuelve a revisar un commit que ya tiene una revisión completa de la misma tarea (rerun o reabrir)", () => {
  assert.equal(decidirRevision([comentario(revision(SHA, CORREGIR))], SHA, "EM-06"), false);
  assert.equal(decidirRevision([comentario(revision(SHA, LISTO))], SHA, "EM-03"), false);
});

test("revisa si el commit no tiene una revisión completa", () => {
  assert.equal(decidirRevision([], SHA, "EM-03"), true);
  assert.equal(decidirRevision([comentario(revision(OTRO_SHA, LISTO))], SHA, "EM-03"), true);
  const incompleta = revision(SHA, "REVISIÓN EM-03\nCORRECCIÓN (obligatorio corregir):\nNinguno");
  assert.equal(decidirRevision([comentario(incompleta)], SHA, "EM-03"), true);
});

test("una revisión editada después de publicarse no cuenta y no se repite", () => {
  const editada = { ...comentario(revision(SHA, CORREGIR.replace("VEREDICTO: CORREGIR", "VEREDICTO: LISTO").replace(/1\. \[a\.cs:4\][^\n]*/, "Ninguno"))), editado: true };
  const r = evaluarVeredicto([editada], SHA);
  assert.equal(r.estado, "corregir");
  assert.match(r.mensaje, /se editó/);
  assert.equal(decidirRevision([editada], SHA, "EM-06"), false);
});

test("el commit tiene que estar en la línea \"Commit revisado\", no citado en otra parte", () => {
  const citaOtro = revision(OTRO_SHA, LISTO) + `\n\nNota: el commit anterior era ${SHA}.`;
  assert.equal(evaluarVeredicto([comentario(citaOtro)], SHA).estado, "sin_revision");
});

test("una revisión de otra tarea no cuenta: si la del título actual no se completó, bloquea", () => {
  // La revisión de EM-03 aprobó, pero el título ahora dice EM-04 y su revisión nueva no llegó.
  assert.equal(evaluarVeredicto([comentario(revision(SHA, LISTO))], SHA, "EM-04").estado, "sin_revision");
  // La revisión reducida (título sin ID) no cuenta cuando el ID ya se corrigió.
  const sinId = revision(SHA, "REVISIÓN (título sin ID)\nCORRECCIÓN (obligatorio corregir):\nNinguno\nVEREDICTO: LISTO");
  assert.equal(evaluarVeredicto([comentario(sinId)], SHA, "EM-03").estado, "sin_revision");
  assert.equal(evaluarVeredicto([comentario(sinId)], SHA, "").estado, "aprobada");
});

test("revisa otra vez el mismo commit solo si cambió la tarea del título", () => {
  const sinId = revision(SHA, "REVISIÓN (título sin ID)\nCORRECCIÓN (obligatorio corregir):\nNinguno\nVEREDICTO: LISTO");
  assert.equal(decidirRevision([comentario(sinId)], SHA, "EM-03"), true);
  assert.equal(decidirRevision([comentario(sinId)], SHA, ""), false);
  assert.equal(decidirRevision([comentario(revision(SHA, CORREGIR))], SHA, "EM-07"), true);
});

test("«Ninguno» seguido de una sección de lo comprobado no cuenta como hallazgo (PR #30)", () => {
  // Estructura real de la revisión del #30: después de "Ninguno" vino "Comprobado:" con viñetas, antes de OPCIONAL.
  const cuerpo = [
    "REVISIÓN JZ-02",
    "CORRECCIÓN (obligatorio corregir):",
    "Ninguno",
    "",
    "Comprobado:",
    "- Criterios de aceptación: CA1 a CA4 tienen pruebas nuevas o reforzadas.",
    "- Alcance: el autor es jordin-garcia (protocolo §E5).",
    "",
    "OPCIONAL (no bloquea):",
    "1. [origenes-demo/envios-xelaju/Program.cs:37] Un peso_kg enorme desborda decimal.",
    "",
    "VEREDICTO: LISTO",
  ].join("\n");
  const comentarioReal = `🤖 Revisión automática con Claude\nCommit revisado: ${SHA}\n\n${cuerpo}`;
  assert.equal(evaluarVeredicto([comentario(comentarioReal)], SHA, "JZ-02").estado, "aprobada");
  for (const titulo of ["### Lo que comprobé", "**Lo que comprobé y está bien:**", "Comprobaciones hechas, sin problemas:", "---\nComprobado:"]) {
    const variante = comentarioReal.replace("Comprobado:", titulo);
    assert.equal(evaluarVeredicto([comentario(variante)], SHA, "JZ-02").estado, "aprobada", titulo);
  }
});

test("una sección posterior no oculta hallazgos: solo se ignora si la corrección empieza con «Ninguno»", () => {
  const base = (correccion) => [
    "REVISIÓN JZ-02",
    "CORRECCIÓN (obligatorio corregir):",
    ...correccion,
    "",
    "Comprobado:",
    "- Todo lo demás está bien.",
    "",
    "OPCIONAL (no bloquea):",
    "Ninguno",
    "",
    "VEREDICTO: LISTO",
  ].join("\n");
  const casos = [
    ["1. [a.cs:3] Falta la prueba."],
    ["El endpoint tiene estos problemas:", "- no valida el cuerpo."],
    ["Ninguno", "1. [a.cs:3] Pero falta la prueba."],
    // Un segundo encabezado de corrección después del "Ninguno" no es "lo comprobado": sus hallazgos cuentan.
    ["Ninguno", "", "### CORRECCIÓN (obligatorio corregir):", "1. [a.cs:3] Falta la prueba."],
    ["Ninguno", "", "Corrección adicional:", "1. [a.cs:3] Falta la prueba."],
    // Una viñeta o una enumeración con letra que termina en ":" es un hallazgo, no un título.
    ["Ninguno", "* Nota:", "1. [a.cs:3] Falta la prueba."],
    ["Ninguno", "**- Nota:**", "1. [a.cs:3] Falta la prueba."],
    ["Ninguno", "a) Falta la prueba de RF-28:", "- en a.cs:3."],
  ];
  for (const correccion of casos) {
    const r = evaluarVeredicto([comentario(revision(SHA, base(correccion)))], SHA, "JZ-02");
    assert.equal(r.estado, "corregir", correccion.join(" / "));
  }
});

// --- JG-08: formato de este proyecto (plan/prompts/revision.md y specs/16, decisión 87) ---

test("decisión 87: la mención al autor antes de REVISIÓN no cambia el veredicto ni la tarea", () => {
  const conMencion = (cuerpo) =>
    `🤖 Revisión automática con Claude\nCommit revisado: ${SHA}\n@Josh-JM: la revisión encontró hallazgos de corrección; corrígelos y haz push.\n\n` +
    "```\n" + cuerpo + "\n```";
  const corregir = "REVISIÓN JM-03\nCORRECCIÓN (obligatorio corregir):\n1. [src/lib/x.ts:4] Falta exigirPermiso → agregarlo.\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: CORREGIR";
  assert.equal(evaluarVeredicto([comentario(conMencion(corregir))], SHA, "JM-03").estado, "corregir");
  assert.equal(decidirRevision([comentario(conMencion(corregir))], SHA, "JM-03"), false);
});

test("RNF-16: con LISTO, el estado «aprobada» es el que deja la revisión formal de aprobación", () => {
  const listo = "REVISIÓN JG-08\nCORRECCIÓN (obligatorio corregir):\nNinguno\nOPCIONAL (no bloquea):\nNinguno\nVEREDICTO: LISTO";
  const r = evaluarVeredicto([comentario(revision(SHA, listo))], SHA, "JG-08");
  assert.equal(r.estado, "aprobada");
  assert.match(r.mensaje, /no tiene hallazgos de corrección/);
});

test("RNF-16: con CORREGIR, el mensaje explica que hay que corregir y hacer push", () => {
  const r = evaluarVeredicto([comentario(revision(SHA, CORREGIR))], SHA, "EM-06");
  assert.equal(r.estado, "corregir");
  assert.match(r.mensaje, /corrígelos y haz push/);
});
