#!/usr/bin/env node
// Verificación obligatoria `revision-claude` (JG-08, specs/16 decisión 60). Adaptado del de shapi. Lee los
// comentarios del PR y busca la revisión más reciente del bot para el commit:
//   - "VEREDICTO: LISTO" sin hallazgos de corrección → el check pasa;
//   - "VEREDICTO: CORREGIR" (o hallazgos de corrección) → falla; solo el coordinador puede integrar con --admin;
//   - ninguna revisión completa de ese commit y de la tarea del título (cuota agotada, caída del servicio o tiempo
//     agotado) → falla hasta reintentarla.
// Una revisión completa de un commit no se repite con rerun, reabriendo el PR ni editándolo: solo se revisa otra vez
// si cambia la tarea del título. Un commit nuevo (aunque sea vacío) sí produce otra revisión; eso queda en el
// historial del PR y lo revisa la auditoría del coordinador.
// Solo cuenta el comentario que publicó una ejecución del flujo revision-claude (auditoría del 22/10, H-40): cualquier
// flujo con `pull-requests: write` publica como github-actions[bot]. La segunda línea del comentario cita la ejecución
// ("Commit revisado: <sha> · Ejecución: <id>"), y el comentario vale solo si esa ejecución es de revision-claude.yml
// para ese commit y se publicó después de que empezara. Un flujo nuevo tendría que tocar `.github/**`, que además
// protege archivos-protegidos.
// Uso en la CI (<ejecuciones.jsonl>: un {id, creado} por línea, las ejecuciones de revision-claude.yml del commit):
//   node scripts/veredicto-revision.mjs --decidir <comentarios.jsonl> <sha> <id> --ejecuciones <ejecuciones.jsonl>
//       → imprime true o false
//   node scripts/veredicto-revision.mjs <comentarios.jsonl> <sha> <id> --ejecuciones <ejecuciones.jsonl>
//       → veredicto; sale con 0 o 1
// En la CI, además, escribe `estado=aprobada|corregir|sin_revision` en $GITHUB_OUTPUT: con él, revision-claude.yml
// deja la revisión formal (aprobar o solicitar cambios).
import { readFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BOT = "github-actions[bot]";
const MARCA = "🤖 Revisión automática con Claude";
// Las palabras clave pueden venir con formato Markdown: **CORRECCIÓN**, ### OPCIONAL, > VEREDICTO… El prefijo no
// acepta saltos de línea: si los aceptara, el encabezado empezaría en la línea vacía anterior y la propia línea
// "CORRECCIÓN (…)" contaría como un hallazgo.
const PREFIJO = String.raw`^[ \t>*#_\-]*`;
// Un encabezado de sección no se puede confundir con el texto libre ("Corrección de auditoría…", "Opcionalmente…"):
//   - en MAYÚSCULAS (el formato de revision.md), después de la palabra viene "(", ":", un guion o el fin de la línea;
//   - con mayúscula inicial ("Corrección"), solo "(", ":" o el fin de la línea. "Opcional", solo si ocupa toda la
//     línea ("**Opcional (no bloquea):**"), para que un hallazgo como "- Opcional: el campo X…" o "- Opcional (según
//     RF-3) debe ser obligatorio." no cierre la sección de corrección.
const CIERRE_MAYUSCULAS = String.raw`\**[ \t]*(?:[(:—–\-]|$)`;
function encabezado(mayusculas, inicial, cierreInicial) {
  return PREFIJO + String.raw`(?:${mayusculas}${CIERRE_MAYUSCULAS}|${inicial}\**[ \t]*(?:${cierreInicial}|$))`;
}
const PALABRA_CORRECCION = String.raw`(?:CORRECCI[ÓO]N(?:ES)?|Correcci[óo]n(?:es)?)`;
const RE_CORRECCION = new RegExp(
  encabezado(String.raw`CORRECCI[ÓO]N(?:ES)?`, String.raw`Correcci[óo]n(?:es)?`, "[(:]"),
  "m",
);
const RE_CORRECCION_MAYUSCULAS = new RegExp(PREFIJO + String.raw`CORRECCI[ÓO]N(?:ES)?` + CIERRE_MAYUSCULAS, "m");
const RE_OPCIONAL = new RegExp(
  encabezado(String.raw`OPCIONAL(?:ES)?`, String.raw`Opcional(?:es)?`, String.raw`(?:\([^)\n]*\))?[ \t]*:?\**[ \t]*$`),
  "m",
);
// El veredicto también se acepta como "Veredicto:" o "**Veredicto:** LISTO"; LISTO y CORREGIR van en mayúsculas.
const RE_VEREDICTO = new RegExp(
  PREFIJO + String.raw`(?:VEREDICTO|Veredicto)\**[ \t]*:[ \t]*\**[ \t]*(LISTO|CORREGIR)`,
  "m",
);
// Se quita de la línea del encabezado su descripción ("(obligatorio corregir):", "— obligatorio corregir"); lo que
// quede después también es un hallazgo.
const RE_RESTO_CABECERA = new RegExp(
  PREFIJO +
    PALABRA_CORRECCION +
    String.raw`\**[ \t]*(?:[—–\-][ \t]*)?(?:\([^)]*\)|obligatorio corregir)?[ \t]*[—–\-]?[ \t]*:?\**`,
);
const RE_NINGUNO = /^\(?(?:ningun[oa]|no hay(?: hallazgos)?)\.?\)?\.?$/i;
// Otra sección que la revisión agrega por su cuenta ("Comprobado:", "### Lo que comprobé"): un título de Markdown, o
// una línea corta que no es un elemento de lista y termina en ":". Solo se usa después de un "Ninguno" (PR #30), y
// nunca si menciona la corrección: un segundo encabezado de corrección no oculta sus hallazgos.
const RE_TITULO_MARKDOWN = /^[ \t>]*#{1,6}[ \t]+\S/;
// Se revisa sobre la línea original, admitiendo negritas delante ("**- Nota:**"): "* " sigue siendo una viñeta.
const RE_ELEMENTO_LISTA = /^[ \t>]*(?:\*\*|__)?[ \t]*(?:[-+*•][ \t]|\d+[.)][ \t]|[a-zA-Z][.)][ \t])/;
const RE_LINEA_CON_DOS_PUNTOS = /^\S[^:\n]{0,60}:$/u;
const RE_MENCIONA_CORRECCION = /correcci[óo]n/i;
const RE_SEPARADOR = /^-{3,}$/;

function esOtraSeccion(linea, limpia) {
  if (RE_MENCIONA_CORRECCION.test(limpia)) return false;
  return RE_TITULO_MARKDOWN.test(linea) || (!RE_ELEMENTO_LISTA.test(linea) && RE_LINEA_CON_DOS_PUNTOS.test(limpia));
}

/** Convierte la salida de `gh api --paginate --jq '.[] | {usuario, body, fecha, editado}'` (un JSON por línea) en un arreglo. */
export function leerComentarios(texto) {
  return texto
    .split(/\r?\n/)
    .filter((linea) => linea.trim())
    .map((linea) => JSON.parse(linea));
}

/**
 * La sección de corrección es el primer encabezado en MAYÚSCULAS (el formato de revision.md) antes del primer
 * veredicto; solo si no hay ninguno se usa el primero con mayúscula inicial. Así, un "Corrección (…)" del texto libre
 * no reemplaza a la sección real, y un segundo encabezado no oculta los hallazgos del primero. El veredicto es el
 * primero después de la sección (las notas posteriores no cuentan). Sin una sección de corrección reconocida no se
 * sabe si hay hallazgos: la revisión cuenta como incompleta.
 */
function analizar(cuerpo) {
  const primero = cuerpo.search(RE_CORRECCION);
  if (primero < 0) return null;
  const primerVeredicto = cuerpo.slice(primero).search(RE_VEREDICTO);
  const hasta = primerVeredicto < 0 ? cuerpo.length : primero + primerVeredicto;
  const mayusculas = cuerpo.slice(0, hasta).search(RE_CORRECCION_MAYUSCULAS);
  const inicio = mayusculas >= 0 ? mayusculas : primero;
  const resto = cuerpo.slice(inicio);
  const veredicto = resto.match(RE_VEREDICTO);
  if (!veredicto) return null;
  // La sección de corrección llega hasta OPCIONAL o hasta el veredicto, lo que venga primero.
  const fin = [resto.slice(1).search(RE_OPCIONAL), resto.slice(1).search(RE_VEREDICTO)]
    .filter((i) => i >= 0)
    .map((i) => i + 1);
  const [cabecera, ...siguientes] = resto.slice(0, fin.length ? Math.min(...fin) : undefined).split(/\r?\n/);
  const lineas = [cabecera.replace(RE_RESTO_CABECERA, ""), ...siguientes];
  // Cualquier contenido que no sea "Ninguno" es un hallazgo, venga numerado o con viñetas. Se ignoran las líneas
  // vacías y las cercas de código.
  const limpias = lineas.map((l) => l.replace(/[*_`>]/g, "").trim());
  // Si la sección empieza con "Ninguno", una sección que la revisión agregue después (lo que comprobó) no son
  // hallazgos. Con cualquier otro comienzo todo cuenta, para que un hallazgo nunca quede oculto bajo un título.
  const primera = limpias.findIndex((t) => t !== "");
  let relevantes = limpias;
  if (primera >= 0 && RE_NINGUNO.test(limpias[primera])) {
    const otraSeccion = lineas.findIndex((l, i) => i > primera && esOtraSeccion(l, limpias[i]));
    if (otraSeccion >= 0) relevantes = limpias.slice(0, otraSeccion);
  }
  // Una línea separadora ("---") no es un hallazgo.
  const correcciones = relevantes.some((texto) => texto !== "" && !RE_NINGUNO.test(texto) && !RE_SEPARADOR.test(texto));
  return {
    veredicto: veredicto[1].toUpperCase(),
    correcciones,
    tarea: cuerpo.match(/REVISI[ÓO]N\s+([A-Z]{2}-\d{2,})/)?.[1] ?? "",
  };
}

/**
 * ¿El comentario es una revisión de este commit? El SHA tiene que estar en la línea "Commit revisado". Con la lista de
 * ejecuciones de revision-claude (la CI siempre la pasa), además debe citar una de ellas y ser posterior a su inicio.
 */
function esRevisionDe(c, sha, ejecuciones) {
  const linea = c.body?.match(new RegExp(String.raw`commit revisado:?\s*${sha}\b[^\n]*`, "i"))?.[0];
  if (c.usuario !== BOT || !c.body?.trimStart().startsWith(MARCA) || !linea) return false;
  if (!ejecuciones) return true;
  const citada = linea.match(/Ejecuci[óo]n:?\s*(\d+)\b/)?.[1];
  const ejecucion = ejecuciones.find((e) => String(e.id) === citada);
  return Boolean(ejecucion) && String(c.fecha) >= String(ejecucion.creado);
}

/**
 * Revisiones completas (con veredicto) del bot para el commit, de la más antigua a la más reciente. Una revisión
 * editada después de publicarse queda marcada como alterada: quien tiene permiso de escritura puede editar
 * comentarios ajenos, y así podría cambiar CORREGIR por LISTO.
 */
function revisionesCompletas(comentarios, sha, ejecuciones) {
  return comentarios
    .filter((c) => esRevisionDe(c, sha, ejecuciones))
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
    .map((c) => {
      const analisis = analizar(c.body);
      return analisis && { ...analisis, alterada: Boolean(c.editado) };
    })
    .filter(Boolean);
}

/** ¿Hace falta revisar este commit? Solo si no tiene una revisión completa o si cambió la tarea del título. */
export function decidirRevision(comentarios, sha, tarea, ejecuciones) {
  const ultima = revisionesCompletas(comentarios, sha, ejecuciones).at(-1);
  if (ultima?.alterada) return false;
  return !ultima || ultima.tarea !== (tarea ?? "");
}

export function evaluarVeredicto(comentarios, sha, tarea = "", ejecuciones) {
  const ultima = revisionesCompletas(comentarios, sha, ejecuciones).at(-1);
  // Una revisión de otra tarea (el título cambió después) no cuenta: la del título actual no se completó.
  if (!ultima || (!ultima.alterada && ultima.tarea !== tarea)) {
    return {
      estado: "sin_revision",
      mensaje:
        `No hay una revisión completa de Claude para el commit ${sha}: pudo agotarse la cuota, fallar el servicio ` +
        "o pasarse el tiempo. Vuelve a ejecutarla con `gh run rerun <id del run> --failed` o con un commit nuevo.",
    };
  }
  if (ultima.alterada) {
    return {
      estado: "corregir",
      mensaje:
        `El comentario de la revisión del commit ${sha} se editó después de publicarse, así que su veredicto no ` +
        "cuenta. Solo el coordinador puede integrar este PR, con `gh pr merge <n> --admin --squash`, o se revisa de " +
        "nuevo con un commit nuevo.",
    };
  }
  if (ultima.veredicto === "LISTO" && !ultima.correcciones) {
    return { estado: "aprobada", mensaje: `La revisión de Claude del commit ${sha} no tiene hallazgos de corrección.` };
  }
  return {
    estado: "corregir",
    mensaje:
      `La revisión de Claude del commit ${sha} tiene hallazgos de corrección (ver el comentario en el PR): corrígelos y ` +
      "haz push; volver a ejecutarla sobre el mismo commit no la repite. Si es un falso positivo, solo el coordinador " +
      "puede integrar con `gh pr merge <n> --admin --squash`.",
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const decidir = args[0] === "--decidir";
  const opcion = args.indexOf("--ejecuciones");
  const archivoEjecuciones = opcion >= 0 ? args[opcion + 1] : undefined;
  const posicionales = opcion >= 0 ? [...args.slice(0, opcion), ...args.slice(opcion + 2)] : args;
  const [archivo, sha, tarea = ""] = decidir ? posicionales.slice(1) : posicionales;
  if (!archivo || !archivoEjecuciones || !/^[0-9a-f]{40}$/.test(sha ?? "")) {
    console.error(
      "Uso: node scripts/veredicto-revision.mjs [--decidir] <comentarios.jsonl> <sha de 40 caracteres> [id] " +
        "--ejecuciones <ejecuciones.jsonl>",
    );
    process.exit(2);
  }
  const comentarios = leerComentarios(readFileSync(archivo, "utf8"));
  // Las ejecuciones de revision-claude.yml del commit, también un JSON por línea.
  const ejecuciones = leerComentarios(readFileSync(archivoEjecuciones, "utf8"));
  if (decidir) {
    console.log(String(decidirRevision(comentarios, sha, tarea, ejecuciones)));
    process.exit(0);
  }
  const resultado = evaluarVeredicto(comentarios, sha, tarea, ejecuciones);
  console.log(resultado.mensaje);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `estado=${resultado.estado}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Revisión con Claude: ${resultado.estado}\n\n${resultado.mensaje}\n`,
    );
  }
  process.exit(resultado.estado === "aprobada" ? 0 : 1);
}
