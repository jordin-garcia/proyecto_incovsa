import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

// JG-34 (pedido del Ing. William, 06/11): los códigos de reglas y requisitos son internos del equipo. Se permiten en
// los comentarios y en los nombres de las pruebas, pero no en los textos que la aplicación muestra.
const CODIGO = /\b(?:RNF?|RF)-[A-Z0-9]|specs\//;
const RAIZ = join(process.cwd(), "src");

function archivos(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) return entrada.name === "generated" ? [] : archivos(ruta);
    return /\.tsx?$/.test(entrada.name) && !/\.test\.tsx?$/.test(entrada.name) ? [ruta] : [];
  });
}

function textosConCodigo(ruta: string) {
  const fuente = ts.createSourceFile(ruta, readFileSync(ruta, "utf8"), ts.ScriptTarget.Latest, true);
  const hallados: string[] = [];
  const visitar = (nodo: ts.Node) => {
    if (
      (ts.isStringLiteral(nodo) ||
        ts.isNoSubstitutionTemplateLiteral(nodo) ||
        ts.isTemplateHead(nodo) ||
        ts.isTemplateMiddle(nodo) ||
        ts.isTemplateTail(nodo) ||
        ts.isJsxText(nodo)) &&
      CODIGO.test(nodo.text)
    ) {
      const { line } = fuente.getLineAndCharacterOfPosition(nodo.getStart());
      hallados.push(`${relative(process.cwd(), ruta)}:${line + 1}: ${nodo.text.trim()}`);
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(fuente);
  return hallados;
}

it("JG-34: ningún texto de la aplicación lleva códigos de reglas o requisitos ni rutas de specs", () => {
  expect(archivos(RAIZ).flatMap(textosConCodigo)).toEqual([]);
});
