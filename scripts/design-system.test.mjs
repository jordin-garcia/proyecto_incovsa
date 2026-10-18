import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const leer = (archivo) => readFileSync(archivo, "utf8");
const fuentes = (carpeta) =>
  readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "generated") return [];
    const archivo = path.join(carpeta, e.name);
    return e.isDirectory()
      ? fuentes(archivo)
      : /\.(css|tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name)
        ? [archivo]
        : [];
  });

test("RNF-01: colores, fuentes, radios y sombras solo se definen en los tokens", () => {
  const css = leer("src/app/globals.css");
  assert.match(css, /--color-\*:\s*initial/);
  const fueraDelTema = css.replace(/@theme[^{}]*\{[^}]*\}/gs, "").replace(/:root\s*\{[^}]*\}/gs, "");
  for (const [archivo, texto] of [
    ["globals.css", fueraDelTema],
    ...fuentes("src")
      .filter((a) => !a.endsWith("globals.css"))
      .map((a) => [a, leer(a)]),
  ]) {
    assert.doesNotMatch(texto, /#[\da-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|oklch)\(/, archivo);
    assert.doesNotMatch(
      texto,
      /(?:border-radius|box-shadow|font-family)\s*:\s*(?!var\(|inherit|none|0[;}])[^\s]/,
      archivo,
    );
    assert.doesNotMatch(
      texto,
      /(?:bg|text|border|ring|shadow)-(?:red|green|gray|slate|blue|zinc|neutral|amber)-\d/,
      archivo,
    );
  }
});

test("RNF-01: shadcn usa las rutas y el tema del proyecto sin bibliotecas de íconos o animación", () => {
  const configuracion = JSON.parse(leer("components.json"));
  assert.equal(configuracion.tailwind.css, "src/app/globals.css");
  assert.equal(configuracion.tailwind.config, "");
  assert.equal(configuracion.tailwind.cssVariables, true);
  assert.equal(configuracion.aliases.ui, "@/componentes/ui");
  const paquetes = JSON.parse(leer("package.json"));
  for (const nombre of ["lucide-react", "tw-animate-css"]) assert.equal(paquetes.dependencies[nombre], undefined);
});

test("RNF-01: todos los íconos del prototipo, incluidas las nueve industrias, son SVG de React", () => {
  const original = leer("entregable-1/prototipos/simulacion/src/base.js").split("const IC = {")[1].split("\n};")[0];
  const nombres = [...original.matchAll(/^\s+(\w+):/gm)].map((m) => m[1]);
  const iconos = leer("src/componentes/comunes/iconos.tsx");
  for (const nombre of nombres) assert.match(iconos, new RegExp(`\\b${nombre}:`));
  assert.match(iconos, /aria-hidden="true"/);
  assert.doesNotMatch(iconos, /dangerouslySetInnerHTML/);
});
