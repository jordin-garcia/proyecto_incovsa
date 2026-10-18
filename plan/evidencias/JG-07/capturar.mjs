// Ejecutar con la aplicación y el prototipo abiertos, y CLAVE_DEMO solo en el entorno local.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

if (!process.env.CLAVE_DEMO) throw new Error("Falta CLAVE_DEMO en el entorno de demostración.");
const carpeta = fileURLToPath(new URL("./capturas/", import.meta.url));
await mkdir(carpeta, { recursive: true });
const navegador = await chromium.launch();
const calentamiento = await navegador.newContext();
for (const ruta of ["/acceso", "/acceso/sitio", "/acceso/picking", "/muestras/panel", "/muestras/picking"]) {
  await calentamiento.request.get(`http://localhost:3000${ruta}`, {
    headers: { cookie: "incovsa-acceso-usuario=ejemplo.03" },
  });
}
await calentamiento.close();
const casos = [
  ["ejemplo.03", "picking", "facturacion"],
  ["ejemplo.03", "sitio", "documentos"],
  ["ejemplo.05", "picking", "bodega"],
  ["ejemplo.06", "picking", "ruta"],
  ["ejemplo.08", "sitio", "contenido"],
  ["ejemplo.09", "sitio", "documentos"],
  ["ejemplo.01", "picking", "facturacion"],
  ["ejemplo.01", "sitio", "contenido"],
  ["ejemplo.03", "picking", "bodega"],
  ["ejemplo.09", "sitio", "usuarios"],
];
try {
  for (const ancho of [390, 768, 1440].filter(
    (valor) => !process.argv[2] || process.argv[2] === "todos" || valor === Number(process.argv[2]),
  )) {
    for (const [usuario, sistema, modulo] of casos.filter(
      ([u, s]) => !process.argv[3] || `${u}-${s}` === process.argv[3],
    )) {
      const contexto = await navegador.newContext({
        viewport: { width: ancho, height: ancho === 390 ? 844 : ancho === 768 ? 1024 : 900 },
      });
      const pagina = await contexto.newPage();
      const acceso = await contexto.request.post(`http://localhost:3000/api/auth/${sistema}/sign-in/username`, {
        headers: { origin: "http://localhost:3000" },
        data: { usuario, clave: process.env.CLAVE_DEMO },
      });
      if (!acceso.ok()) throw new Error(`No se pudo entrar como ${usuario} en ${sistema}`);
      const ruta = `${sistema === "sitio" ? "panel" : "picking"}/${modulo}`;
      const denegada = (usuario === "ejemplo.03" && modulo === "bodega") || modulo === "usuarios";
      for (const origen of ["aplicacion", "prototipo"]) {
        await pagina.goto(
          origen === "aplicacion"
            ? `http://localhost:3000/${ruta}`
            : `http://127.0.0.1:4173/#/${ruta}?cuenta=${usuario}`,
        );
        if (origen === "aplicacion") await pagina.locator('.app[data-hidratado="true"]').waitFor();
        await pagina.evaluate(() => document.fonts.ready);
        const base = `${carpeta}/${usuario}-${sistema}-${modulo}-${ancho}-${origen}`;
        const estilo = denegada ? "" : ".contenido { visibility: hidden !important; }";
        await pagina.screenshot({ path: `${base}.png`, style: estilo, animations: "disabled" });
        if (ancho <= 1024) {
          await pagina.getByRole("button", { name: "Menú", exact: true }).click();
          await pagina.screenshot({ path: `${base}-menu.png`, style: estilo, animations: "disabled" });
        } else {
          await pagina.getByRole("button", { name: "Reducir el menú a íconos" }).click();
          await pagina.screenshot({ path: `${base}-reducido.png`, style: estilo, animations: "disabled" });
        }
      }
      await contexto.close();
      process.stdout.write(`${ancho}: ${usuario} / ${ruta}\n`);
    }
  }
} finally {
  await navegador.close();
}
