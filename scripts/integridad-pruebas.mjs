// RNF-16, decisión 66: analizar sintaxis evita confundir ejemplos o comentarios con pruebas ejecutables.
import ts from "typescript";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const esPrueba = (archivo) =>
  /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(archivo) || /^pruebas\/.*\.[cm]?[jt]sx?$/.test(archivo);
const arbol = (texto, archivo) => ts.createSourceFile(archivo, texto, ts.ScriptTarget.Latest, true);

function cadena(expresion) {
  if (ts.isIdentifier(expresion)) return [expresion.text];
  if (ts.isPropertyAccessExpression(expresion)) return [...cadena(expresion.expression), expresion.name.text];
  if (ts.isElementAccessExpression(expresion) && ts.isStringLiteralLike(expresion.argumentExpression)) {
    return [...cadena(expresion.expression), expresion.argumentExpression.text];
  }
  if (ts.isCallExpression(expresion) || ts.isTaggedTemplateExpression(expresion)) {
    return cadena(ts.isCallExpression(expresion) ? expresion.expression : expresion.tag);
  }
  return [];
}

export function analizarPruebas(texto, archivo) {
  const fuente = arbol(texto, archivo);
  const nombres = new Map(
    ["test", "it", "describe", "suite", "comprobarRechazosDeAccion"].map((nombre) => [nombre, nombre]),
  );
  for (const sentencia of fuente.statements) {
    if (!ts.isImportDeclaration(sentencia)) continue;
    const clausula = sentencia.importClause;
    if (clausula?.name && sentencia.moduleSpecifier.text === "node:test") nombres.set(clausula.name.text, "test");
    if (clausula?.namedBindings && ts.isNamedImports(clausula.namedBindings)) {
      for (const elemento of clausula.namedBindings.elements) {
        const original = (elemento.propertyName ?? elemento.name).text;
        if (["test", "it", "describe", "suite", "comprobarRechazosDeAccion"].includes(original))
          nombres.set(elemento.name.text, original);
      }
    }
  }
  const prohibidas = [];
  const declaraciones = [];
  function recoger(nodo) {
    if (ts.isVariableDeclaration(nodo) && ts.isIdentifier(nodo.name) && nodo.initializer) declaraciones.push(nodo);
    ts.forEachChild(nodo, recoger);
  }
  recoger(fuente);
  function ambito(nodo) {
    for (let padre = nodo.parent; padre; padre = padre.parent) {
      if (ts.isBlock(padre) || ts.isSourceFile(padre)) return padre;
    }
    return fuente;
  }
  function desenvolver(nodo) {
    while (
      nodo &&
      (ts.isAsExpression(nodo) ||
        ts.isSatisfiesExpression(nodo) ||
        ts.isParenthesizedExpression(nodo) ||
        ts.isNonNullExpression(nodo))
    )
      nodo = nodo.expression;
    return nodo;
  }
  function resolver(nodo, vistos = new Set()) {
    nodo = desenvolver(nodo);
    if (!nodo || !ts.isIdentifier(nodo)) return nodo;
    const declaracion = declaraciones
      .filter(
        (d) => d.name.text === nodo.text && d.pos < nodo.pos && ambito(d).pos <= nodo.pos && ambito(d).end >= nodo.end,
      )
      .sort((a, b) => ambito(a).end - ambito(a).pos - (ambito(b).end - ambito(b).pos) || b.pos - a.pos)[0];
    if (!declaracion || vistos.has(declaracion)) return nodo;
    vistos.add(declaracion);
    return resolver(declaracion.initializer, vistos);
  }
  function longitud(nodo) {
    nodo = resolver(nodo);
    if (!nodo) return null;
    if (ts.isArrayLiteralExpression(nodo)) {
      let total = 0;
      for (const elemento of nodo.elements) {
        const valor = ts.isSpreadElement(elemento) ? longitud(elemento.expression) : 1;
        if (valor === null) return null;
        total += valor;
      }
      return total;
    }
    if (ts.isCallExpression(nodo) && ts.isPropertyAccessExpression(nodo.expression)) {
      if (
        ["entries", "keys", "values"].includes(nodo.expression.name.text) &&
        nodo.expression.expression.getText(fuente) === "Object"
      ) {
        const objeto = resolver(nodo.arguments[0]);
        if (objeto && ts.isObjectLiteralExpression(objeto)) return objeto.properties.length;
      }
      if (nodo.expression.name.text === "map") return longitud(nodo.expression.expression);
    }
    return null;
  }
  let cantidad = 0;
  function visitar(nodo, multiplicador = 1) {
    if (ts.isForOfStatement(nodo)) {
      visitar(nodo.statement, multiplicador * (longitud(nodo.expression) ?? 1));
      return;
    }
    if (ts.isCallExpression(nodo)) {
      if (ts.isPropertyAccessExpression(nodo.expression) && nodo.expression.name.text === "forEach") {
        const funcion = nodo.arguments[0];
        if (funcion && (ts.isArrowFunction(funcion) || ts.isFunctionExpression(funcion))) {
          visitar(funcion.body, multiplicador * (longitud(nodo.expression.expression) ?? 1));
          return;
        }
      }
      const partes = cadena(nodo.expression);
      const raiz = nombres.get(partes[0]);
      if (raiz === "comprobarRechazosDeAccion") cantidad += 3 * multiplicador;
      const esTest = !!raiz || partes[1] === "test";
      if (esTest) {
        if (partes.some((parte) => ["skip", "only", "todo", "skipIf", "runIf"].includes(parte))) {
          prohibidas.push(
            `prueba omitida o exclusiva en línea ${fuente.getLineAndCharacterOfPosition(nodo.getStart()).line + 1}`,
          );
        }
        // Node:test también permite omitir o seleccionar mediante el objeto de opciones.
        for (const argumento of nodo.arguments) {
          if (!ts.isObjectLiteralExpression(argumento)) continue;
          for (const propiedad of argumento.properties) {
            if (
              ts.isPropertyAssignment(propiedad) &&
              ["skip", "only", "todo"].includes(propiedad.name.getText(fuente).replace(/["']/g, "")) &&
              propiedad.initializer.kind !== ts.SyntaxKind.FalseKeyword
            ) {
              prohibidas.push("prueba omitida o exclusiva mediante opciones");
            }
          }
        }
        const nombre = nodo.arguments[0];
        if (
          (["test", "it"].includes(raiz) || partes[1] === "test") &&
          nombre &&
          (ts.isStringLiteralLike(nombre) || ts.isTemplateExpression(nombre)) &&
          !["use", "setTimeout", "step", "describe"].some((parte) => partes.includes(parte))
        ) {
          let casos = 1;
          const fabrica = nodo.expression;
          if (ts.isCallExpression(fabrica) && ["each", "for"].includes(cadena(fabrica.expression).at(-1)))
            casos = longitud(fabrica.arguments[0]) ?? 1;
          cantidad += casos * multiplicador;
        }
      }
    }
    ts.forEachChild(nodo, (hijo) => visitar(hijo, multiplicador));
  }
  visitar(fuente);
  return { cantidad, prohibidas };
}

function umbrales(texto, archivo) {
  const encontrados = new Map();
  function visitar(nodo, ruta = []) {
    if (ts.isPropertyAssignment(nodo)) {
      ruta = [...ruta, nodo.name.getText().replace(/["']/g, "")];
      if (ruta.includes("thresholds")) {
        if (ts.isNumericLiteral(nodo.initializer)) encontrados.set(ruta.join("."), Number(nodo.initializer.text));
        else if (!ts.isObjectLiteralExpression(nodo.initializer)) encontrados.set(ruta.join("."), null);
      }
    }
    ts.forEachChild(nodo, (hijo) => visitar(hijo, ruta));
  }
  visitar(arbol(texto, archivo));
  return encontrados;
}

export function comprobarIntegridad({ base, cabeza = "HEAD", carpeta = process.cwd() }) {
  const git = (...args) => execFileSync("git", args, { cwd: carpeta, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  // No se interpretan las referencias como opciones o comandos del shell.
  for (const referencia of [base, cabeza]) {
    if (!referencia || referencia.startsWith("-")) throw new Error("Referencia de Git inválida.");
    git("rev-parse", "--verify", `${referencia}^{commit}`);
  }
  const listar = (ref) => git("ls-tree", "-r", "--name-only", "-z", ref).split("\0").filter(Boolean);
  const antes = new Set(listar(base));
  const despues = new Set(listar(cabeza));
  const leer = (ref, archivo) => git("show", `${ref}:${archivo}`);
  const errores = [];
  for (const archivo of new Set([...antes, ...despues])) {
    if (esPrueba(archivo)) {
      if (!despues.has(archivo)) {
        errores.push(`${archivo}: archivo de pruebas borrado.`);
        continue;
      }
      const nueva = analizarPruebas(leer(cabeza, archivo), archivo);
      const anterior = antes.has(archivo)
        ? analizarPruebas(leer(base, archivo), archivo)
        : { cantidad: 0, prohibidas: [] };
      if (nueva.cantidad < anterior.cantidad)
        errores.push(`${archivo}: se redujo el número de pruebas (${anterior.cantidad} → ${nueva.cantidad}).`);
      errores.push(...nueva.prohibidas.map((error) => `${archivo}: ${error}.`));
    }
    if (/(?:config\.[cm]?[jt]s|\.json)$/.test(archivo) && antes.has(archivo)) {
      const anteriores = umbrales(leer(base, archivo), archivo);
      const nuevos = despues.has(archivo) ? umbrales(leer(cabeza, archivo), archivo) : new Map();
      for (const [clave, valor] of anteriores) {
        if (!nuevos.has(clave) || nuevos.get(clave) === null || (valor !== null && nuevos.get(clave) < valor))
          errores.push(`${archivo}: se bajó o quitó el umbral ${clave}.`);
      }
    }
  }
  return errores;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const errores = comprobarIntegridad({ base: process.argv[2], cabeza: process.argv[3] ?? "HEAD" });
    if (errores.length) {
      console.error(errores.join("\n"));
      process.exitCode = 1;
    } else console.log("Integridad de las pruebas y umbrales: correcta.");
  } catch (error) {
    console.error(`No se pudo comprobar la integridad: ${error.message}`);
    process.exitCode = 1;
  }
}
