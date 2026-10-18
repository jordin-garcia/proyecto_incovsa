// Pruebas de los recursos gráficos extraídos del prototipo (JG-04, criterio 5; specs/16, decisión 77).
// Se ejecutan con: node --test "scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  IMAGENES_CATALOGO,
  MARCA,
  archivosDeRecursos,
  bytesWebp,
  leerRecursos,
} from "./extraer-recursos-prototipo.mjs";

const RAIZ = new URL("../", import.meta.url);
const PROTOTIPO = new URL("entregable-1/prototipos/prototipo-simulacion-incovsa.html", RAIZ);
const recursos = leerRecursos(readFileSync(PROTOTIPO, "utf8"));
const archivos = archivosDeRecursos(recursos);

test("JG-04: se extraen los 5 archivos de public/marca y las 28 imágenes del catálogo de prueba", () => {
  assert.deepEqual(
    archivos.map(([ruta]) => ruta),
    [
      "public/marca/incovsa-quimicos.webp",
      "public/marca/incovsa-quimicos-blanco.webp",
      "public/marca/inquiserca.webp",
      "public/marca/foto-equipo.webp",
      "public/marca/foto-reunion.webp",
      ...Array.from(
        { length: IMAGENES_CATALOGO },
        (_, i) => `pruebas/fixtures/catalogo/${String(i + 1).padStart(2, "0")}.webp`,
      ),
    ],
  );
});

test("JG-04: cada imagen subida existe y es idéntica a la del prototipo (se ve igual y no pesa más)", () => {
  for (const [ruta, bytes] of archivos) {
    const archivo = new URL(ruta, RAIZ);
    assert.ok(existsSync(archivo), `${ruta} no existe`);
    const subido = readFileSync(archivo);
    assert.ok(subido.equals(bytes), `${ruta} no coincide con el prototipo`);
    assert.equal(subido.toString("latin1", 8, 12), "WEBP", `${ruta} no es WebP`);
  }
});

test("JG-04: el catálogo sigue el orden de window.RECURSOS.catalogo", () => {
  const catalogo = archivos.filter(([ruta]) => ruta.startsWith("pruebas/fixtures/catalogo/"));
  recursos.catalogo.forEach((uri, i) => assert.ok(catalogo[i][1].equals(bytesWebp(uri, `catalogo[${i}]`))));
  for (const [clave, archivo] of MARCA) {
    const [, bytes] = archivos.find(([ruta]) => ruta === `public/marca/${archivo}`);
    assert.ok(bytes.equals(bytesWebp(recursos[clave], clave)), clave);
  }
});

test("JG-04: leerRecursos no se confunde con las llaves y los ; dentro de los textos", () => {
  const html = '<script>window.RECURSOS={"a":"x}{;\\"]","b":["data:image/webp;base64,AA=="]};window.DATOS={}</script>';
  assert.deepEqual(leerRecursos(html), { a: 'x}{;"]', b: ["data:image/webp;base64,AA=="] });
  assert.throws(() => leerRecursos("<script></script>"), /window.RECURSOS/);
});

test("JG-04: bytesWebp rechaza lo que no es WebP", () => {
  assert.throws(() => bytesWebp("data:image/png;base64,iVBORw0KGgo=", "x"), /no es una imagen WebP/);
  assert.throws(() => bytesWebp("data:image/webp;base64,iVBORw0KGgo=", "x"), /no es un archivo WebP válido/);
});
