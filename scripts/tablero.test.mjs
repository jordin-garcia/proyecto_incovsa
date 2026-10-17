// Pruebas del tablero del plan y sus avisos por correo (JG-08, specs/16 decisiones 71 y 87). Adaptadas de shapi.
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { generar, leerEstado } from "./tablero.mjs";
import { aJson, cargar, clasificar } from "./tareas.mjs";

const GITHUB = { jordin: "jordin-garcia", carlos: "carloshugoeg", daniela: "InAlexa", josue: "Josh-JM", "jose-daniel": "JDaniC" };
const EQUIPO = "@jordin-garcia @carloshugoeg @InAlexa @Josh-JM @JDaniC";

// Tarea con la forma de `tareas.mjs --json`.
function tarea(id, persona, situacion, extra = {}) {
  return {
    id,
    titulo: `Título ${id}`,
    persona,
    github: GITHUB[persona],
    hito: "E2",
    prioridad: "P1",
    estado: situacion === "hecha" || situacion === "bloqueada" ? situacion : "pendiente",
    depende_de: [],
    situacion,
    faltan: [],
    no_antes_de: null,
    programada: null,
    bloqueo: null,
    ...extra,
  };
}

// JG-08 disponible; JG-02 espera a JG-08; JM-02 y JC-02 esperan a JG-02; DM-01 disponible.
function planInicial() {
  return [
    tarea("JG-01", "jordin", "hecha"),
    tarea("JG-08", "jordin", "disponible", { depende_de: ["JG-01"] }),
    tarea("JG-02", "jordin", "en_espera", { depende_de: ["JG-01", "JG-08"], faltan: ["JG-08"] }),
    tarea("JM-02", "josue", "en_espera", { depende_de: ["JG-02"], faltan: ["JG-02"] }),
    tarea("JC-02", "jose-daniel", "en_espera", { depende_de: ["JG-02"], faltan: ["JG-02"] }),
    tarea("DM-01", "daniela", "disponible"),
  ];
}

// planInicial() después de integrar JG-08 y luego JG-02.
function conJG08() {
  const plan = planInicial();
  plan[1] = tarea("JG-08", "jordin", "hecha", { depende_de: ["JG-01"] });
  plan[2] = tarea("JG-02", "jordin", "disponible", { depende_de: ["JG-01", "JG-08"] });
  return plan;
}
function conJG02() {
  const plan = conJG08();
  plan[2] = tarea("JG-02", "jordin", "hecha", { depende_de: ["JG-01", "JG-08"] });
  plan[3] = tarea("JM-02", "josue", "disponible", { depende_de: ["JG-02"] });
  plan[4] = tarea("JC-02", "jose-daniel", "disponible", { depende_de: ["JG-02"] });
  return plan;
}

test("decisión 71: la primera ejecución crea el tablero y no menciona a nadie", () => {
  const { cuerpo, avisos } = generar(planInicial(), "", "2026-10-17", 7);
  assert.equal(avisos, "");
  assert.doesNotMatch(cuerpo, /@/);
  assert.match(cuerpo, /^# Tablero del plan/);
  assert.match(cuerpo, /integración a `develop`/);
  assert.match(cuerpo, /## Josué Menéndez \(Josh-JM\) · 0\/1 hechas/);
  assert.match(cuerpo, /- JM-02 · P1 · Título JM-02 — espera a JG-02 \(Jordin García\)/);
  assert.match(cuerpo, /\| E2 \| 1 \| 6 \| 17 % \|/);
  assert.match(cuerpo, /\| E3 \| 0 \| 0 \| 0 % \|/);
  assert.match(cuerpo, /\| entrega \| 0 \| 0 \| 0 % \|/);
});

test("decisión 71: un cuerpo sin estado (issue recién creado) cuenta como primera ejecución", () => {
  assert.equal(generar(planInicial(), "Generando el tablero…", "2026-10-17", 9).avisos, "");
});

test("decisión 71: el cuerpo conserva el estado en un comentario HTML y muestra las bloqueadas", () => {
  const plan = [...planInicial(), tarea("CE-03", "carlos", "bloqueada", { bloqueo: "falta la cuenta de Cloudflare" })];
  const { cuerpo: primera } = generar(plan, "", "2026-10-17", 7);
  const { cuerpo } = generar(plan, primera, "2026-10-17", 7);
  assert.match(cuerpo, /<!-- estado-tablero: \{.*\} -->\n$/);
  assert.deepEqual(leerEstado(cuerpo), {
    disponibles: ["DM-01", "JG-08"],
    hechas: ["JG-01"],
    bloqueadas: ["CE-03"],
    recordatorio: "2026-10-17",
  });
  assert.match(cuerpo, /\*\*Bloqueadas\*\*\n- CE-03 · P1 · Título CE-03 — falta la cuenta de Cloudflare/);
});

test("decisión 87: al integrar una tarea se menciona a todo el equipo con quién la hizo y lo que se desbloqueó", () => {
  const { cuerpo: anterior } = generar(planInicial(), "", "2026-10-17", 6);
  const { avisos } = generar(conJG08(), anterior, "2026-10-17", 6);
  assert.equal(
    avisos,
    [
      "**Novedades del plan** (2026-10-17)",
      "",
      EQUIPO,
      "",
      "- ✅ **JG-08** (Título JG-08), de Jordin García, quedó integrada. Queda disponible: **JG-02** (Título JG-02), de Jordin García.",
      "",
    ].join("\n"),
  );
});

test("decisión 87: si la tarea integrada desbloquea varias, se nombran todas con su dueño", () => {
  const { cuerpo: anterior } = generar(conJG08(), "", "2026-10-18", 6);
  const { avisos } = generar(conJG02(), anterior, "2026-10-18", 6);
  assert.match(avisos, new RegExp(`^\\*\\*Novedades del plan\\*\\* \\(2026-10-18\\)\\n\\n${EQUIPO}\\n`));
  assert.match(
    avisos,
    /- ✅ \*\*JG-02\*\* \(Título JG-02\), de Jordin García, quedó integrada\. Quedan disponibles: \*\*JM-02\*\* \(Título JM-02\), de Josué Menéndez, y \*\*JC-02\*\* \(Título JC-02\), de José Daniel Cifuentes\./,
  );
});

test("decisión 87: una tarea integrada que no desbloquea nada también menciona a todo el equipo", () => {
  const { cuerpo: anterior } = generar(planInicial(), "", "2026-10-17", 6);
  const plan = planInicial();
  plan[5] = tarea("DM-01", "daniela", "hecha");
  const { avisos } = generar(plan, anterior, "2026-10-17", 6);
  assert.match(avisos, new RegExp(EQUIPO));
  assert.match(avisos, /- ✅ \*\*DM-01\*\* \(Título DM-01\), de Daniela Marín, quedó integrada\. No deja tareas nuevas disponibles\./);
});

test("decisión 87: una tarea desbloqueada por dos integraciones a la vez aparece en las dos", () => {
  const antes = [
    tarea("JG-04", "jordin", "disponible"),
    tarea("JG-02", "jordin", "disponible"),
    tarea("JG-05", "jordin", "en_espera", { depende_de: ["JG-02", "JG-04"], faltan: ["JG-02", "JG-04"] }),
  ];
  const { cuerpo: anterior } = generar(antes, "", "2026-10-17", 6);
  const despues = [
    tarea("JG-04", "jordin", "hecha"),
    tarea("JG-02", "jordin", "hecha"),
    tarea("JG-05", "jordin", "disponible", { depende_de: ["JG-02", "JG-04"] }),
  ];
  const { avisos } = generar(despues, anterior, "2026-10-17", 6);
  assert.match(avisos, /- ✅ \*\*JG-02\*\* .* Queda disponible: \*\*JG-05\*\*/);
  assert.match(avisos, /- ✅ \*\*JG-04\*\* .* Queda disponible: \*\*JG-05\*\*/);
});

test("decisión 87: una tarea que se bloquea menciona al coordinador con el dueño y el motivo", () => {
  const { cuerpo: anterior } = generar(planInicial(), "", "2026-10-17", 6);
  const plan = planInicial();
  plan[5] = tarea("DM-01", "daniela", "bloqueada", { bloqueo: "falta la cuenta de ChatGPT." });
  const { avisos } = generar(plan, anterior, "2026-10-17", 6);
  assert.equal(
    avisos,
    "**Novedades del plan** (2026-10-17)\n\n**Jordin García**\n- @jordin-garcia: la tarea DM-01 (Título DM-01), de Daniela Marín, quedó bloqueada: falta la cuenta de ChatGPT.\n",
  );
});

test("decisión 71: una tarea que sale de bloqueada avisa a su dueño", () => {
  const antes = [tarea("CE-02", "carlos", "bloqueada", { bloqueo: "falta algo" })];
  const { cuerpo: anterior } = generar(antes, "", "2026-10-18", 6);
  const { avisos } = generar([tarea("CE-02", "carlos", "disponible")], anterior, "2026-10-18", 6);
  assert.match(avisos, /\*\*Carlos Hugo Escobar\*\*\n- @carloshugoeg: tu tarea CE-02 \(Título CE-02\) ya no está bloqueada y está disponible\./);
  assert.doesNotMatch(avisos, /@JDaniC/);
});

test("decisión 71: una tarea que llega a su fecha avisa a su dueño", () => {
  const antes = [tarea("JG-19", "jordin", "en_espera", { no_antes_de: "2026-11-02" })];
  const { cuerpo: anterior } = generar(antes, "", "2026-11-01", 6);
  const { avisos } = generar([tarea("JG-19", "jordin", "disponible", { no_antes_de: "2026-11-02" })], anterior, "2026-11-02", 6);
  assert.match(avisos, /- @jordin-garcia: tu tarea JG-19 \(Título JG-19\) ya está disponible: llegó su fecha \(2026-11-02\)\./);
});

test("decisión 71: dos ejecuciones seguidas sin cambios no repiten avisos", () => {
  const { cuerpo: primera } = generar(planInicial(), "", "2026-10-17", 6);
  const segunda = generar(conJG08(), primera, "2026-10-17", 6);
  assert.notEqual(segunda.avisos, "");
  const tercera = generar(conJG08(), segunda.cuerpo, "2026-10-17", 6);
  assert.equal(tercera.avisos, "");
  assert.equal(tercera.cuerpo, segunda.cuerpo);
});

test("decisión 71: tareas.mjs --json trae los campos que usa el tablero", () => {
  const { tareas } = cargar();
  clasificar(tareas);
  const json = tareas.map(aJson);
  assert.ok(json.length > 0);
  for (const t of json) {
    assert.deepEqual(Object.keys(t).sort(), [
      "bloqueo", "depende_de", "estado", "faltan", "github", "hito", "id",
      "no_antes_de", "persona", "prioridad", "programada", "situacion", "titulo",
    ]);
    if (t.estado !== "hecha") assert.match(t.programada ?? "", /^\d{4}-\d{2}-\d{2}$/, t.id);
    assert.ok(["disponible", "en_espera", "bloqueada", "hecha"].includes(t.situacion), t.id);
    assert.ok(Array.isArray(t.faltan) && Array.isArray(t.depende_de), t.id);
    assert.ok(t.github, t.id);
  }
});

// --- Recordatorio diario de las 07:00 (decisión 87) ---

// Domingo 18 oct: JG-07 atrasada (del sábado) y la esperan CE-02 y JM-03; DM-02 toca hoy; CE-01 ya está hecha;
// José Daniel tiene su tarea hasta el martes.
function planDelDia() {
  return [
    tarea("JG-07", "jordin", "disponible", { programada: "2026-10-17" }),
    tarea("CE-01", "carlos", "hecha", { programada: "2026-10-17" }),
    tarea("DM-02", "daniela", "disponible", { programada: "2026-10-18" }),
    tarea("CE-02", "carlos", "en_espera", { programada: "2026-10-19", depende_de: ["JG-07"], faltan: ["JG-07"] }),
    tarea("JM-03", "josue", "en_espera", { programada: "2026-10-19", depende_de: ["JG-07", "DM-02"], faltan: ["JG-07", "DM-02"] }),
    tarea("JC-03", "jose-daniel", "disponible", { programada: "2026-10-20" }),
  ];
}

test("decisión 87: el recordatorio menciona a cada persona con sus tareas del día y las atrasadas", () => {
  const { cuerpo: anterior } = generar(planDelDia(), "", "2026-10-17", 6);
  const { avisos } = generar(planDelDia(), anterior, "2026-10-18", 7);
  assert.equal(
    avisos,
    [
      "**Tareas del día** (dom 18 oct)",
      "",
      "**Jordin García**",
      "- @jordin-garcia: ⏰ **JG-07** (Título JG-07) está atrasada: estaba programada para el sáb 17 oct. La esperan: Carlos Hugo Escobar (CE-02), Josué Menéndez (JM-03).",
      "",
      "**Daniela Marín**",
      "- @InAlexa: hoy te toca **DM-02** (Título DM-02). La esperan: Josué Menéndez (JM-03).",
      "",
    ].join("\n"),
  );
  assert.doesNotMatch(avisos, /carloshugoeg|JDaniC|Josh-JM/);
});

test("decisión 87: el recordatorio dice qué falta si la tarea del día todavía no se puede empezar", () => {
  const plan = [
    tarea("JG-07", "jordin", "disponible", { programada: "2026-10-19" }),
    tarea("CE-02", "carlos", "en_espera", { programada: "2026-10-19", depende_de: ["JG-07"], faltan: ["JG-07"] }),
    tarea("JC-03", "jose-daniel", "bloqueada", { programada: "2026-10-19", bloqueo: "falta el archivo de Odoo." }),
  ];
  const { cuerpo: anterior } = generar(plan, "", "2026-10-19", 6);
  const { avisos } = generar(plan, anterior, "2026-10-19", 8);
  assert.match(avisos, /- @carloshugoeg: hoy te toca \*\*CE-02\*\* \(Título CE-02\)\. Todavía espera a JG-07 \(Jordin García\)\./);
  assert.match(avisos, /- @JDaniC: hoy te toca \*\*JC-03\*\* \(Título JC-03\)\. Está bloqueada: falta el archivo de Odoo\./);
});

test("decisión 87: el recordatorio sale una vez al día, desde las 07:00", () => {
  const { cuerpo: madrugada } = generar(planDelDia(), "", "2026-10-18", 6);
  assert.equal(leerEstado(madrugada).recordatorio, null);
  const primera = generar(planDelDia(), madrugada, "2026-10-18", 7);
  assert.match(primera.avisos, /\*\*Tareas del día\*\*/);
  assert.equal(leerEstado(primera.cuerpo).recordatorio, "2026-10-18");
  const segunda = generar(planDelDia(), primera.cuerpo, "2026-10-18", 15);
  assert.equal(segunda.avisos, "");
  const manana = generar(planDelDia(), segunda.cuerpo, "2026-10-19", 7);
  assert.match(manana.avisos, /\*\*Tareas del día\*\* \(lun 19 oct\)/);
});

test("decisión 87: la ejecución manual con forzarRecordatorio lo publica aunque ya haya salido hoy", () => {
  const { cuerpo: madrugada } = generar(planDelDia(), "", "2026-10-18", 6);
  const primera = generar(planDelDia(), madrugada, "2026-10-18", 7);
  const forzada = generar(planDelDia(), primera.cuerpo, "2026-10-18", 15, { forzarRecordatorio: true });
  assert.match(forzada.avisos, /^\*\*Tareas del día\*\* \(dom 18 oct\)/);
  assert.match(forzada.avisos, /@jordin-garcia/);
  // Sin estado anterior (primera ejecución) no menciona a nadie, ni siquiera forzado.
  assert.equal(generar(planDelDia(), "", "2026-10-18", 15, { forzarRecordatorio: true }).avisos, "");
});

test("decisión 87: antes de las 07:00 no hay recordatorio, pero sí novedades", () => {
  const { cuerpo: anterior } = generar(planInicial(), "", "2026-10-18", 5);
  const { avisos } = generar(conJG08(), anterior, "2026-10-18", 6);
  assert.doesNotMatch(avisos, /Tareas del día/);
  assert.match(avisos, /^\*\*Novedades del plan\*\*/);
});

test("decisión 87: si nadie tiene nada programado no se comenta, y el día cuenta como avisado", () => {
  const plan = [tarea("JG-19", "jordin", "en_espera", { programada: "2026-11-02", no_antes_de: "2026-11-02" })];
  const { cuerpo: anterior } = generar(plan, "", "2026-10-18", 6);
  const { cuerpo, avisos } = generar(plan, anterior, "2026-10-18", 7);
  assert.equal(avisos, "");
  assert.equal(leerEstado(cuerpo).recordatorio, "2026-10-18");
});

test("decisión 87: el recordatorio y las novedades van en un solo comentario, primero el recordatorio", () => {
  const antes = [tarea("JG-08", "jordin", "disponible", { programada: "2026-10-17" }), tarea("JG-02", "jordin", "en_espera", { programada: "2026-10-18", depende_de: ["JG-08"], faltan: ["JG-08"] })];
  const { cuerpo: anterior } = generar(antes, "", "2026-10-17", 6);
  const despues = [tarea("JG-08", "jordin", "hecha", { programada: "2026-10-17" }), tarea("JG-02", "jordin", "disponible", { programada: "2026-10-18", depende_de: ["JG-08"] })];
  const { avisos } = generar(despues, anterior, "2026-10-18", 7);
  assert.equal(
    avisos,
    [
      "**Tareas del día** (dom 18 oct)",
      "",
      "**Jordin García**",
      "- @jordin-garcia: hoy te toca **JG-02** (Título JG-02).",
      "",
      "**Novedades del plan** (2026-10-18)",
      "",
      EQUIPO,
      "",
      "- ✅ **JG-08** (Título JG-08), de Jordin García, quedó integrada. Queda disponible: **JG-02** (Título JG-02), de Jordin García.",
      "",
    ].join("\n"),
  );
});

test("decisión 71: el cuerpo muestra lo de hoy por persona y la fecha programada de cada tarea, sin menciones", () => {
  const { cuerpo } = generar(planDelDia(), "", "2026-10-18", 7);
  assert.doesNotMatch(cuerpo, /@/);
  assert.match(
    cuerpo,
    /## Hoy \(dom 18 oct\)\n\n- Jordin García: ⏰ JG-07 \(atrasada\)\n- Carlos Hugo Escobar: nada programado\n- Daniela Marín: DM-02\n- Josué Menéndez: nada programado\n- José Daniel Cifuentes: nada programado\n/,
  );
  assert.match(cuerpo, /- JG-07 · P1 · ⏰ atrasada \(sáb 17 oct\) · Título JG-07\n/);
  assert.match(cuerpo, /- JM-03 · P1 · lun 19 oct · Título JM-03 — espera a JG-07 \(Jordin García\), DM-02 \(Daniela Marín\)/);
});
