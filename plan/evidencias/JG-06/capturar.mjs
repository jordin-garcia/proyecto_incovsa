// Ejecutar con la aplicación sembrada en 3000 y el prototipo aprobado en 4173.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const destino = fileURLToPath(new URL("./", import.meta.url));
await mkdir(destino, { recursive: true });
const navegador = await chromium.launch();
try {
  for (const [ancho, alto] of [[390, 844], [768, 1024], [1440, 900]]) {
    for (const tipo of ["aplicacion", "prototipo"]) {
      const contexto = await navegador.newContext({ viewport: { width: ancho, height: alto } });
      const pagina = await contexto.newPage();
      if (tipo === "aplicacion") await pagina.setExtraHTTPHeaders({ "X-Real-IP": "198.19.0.1" });
      const captura = async nombre => {
        await pagina.mouse.move(0, 0);
        await pagina.evaluate(() => document.fonts.ready);
        await pagina.screenshot({ path: `${destino}${tipo}-${nombre}-${ancho}.png`, fullPage: true, animations: "disabled" });
        if (await pagina.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Desborde: ${tipo} ${nombre} ${ancho}`);
      };
      if (tipo === "aplicacion") {
        await pagina.goto("http://localhost:3000/acceso");
        await pagina.locator('.acc-lay[data-hidratado="true"]').waitFor();
        await captura("usuario");
        await pagina.getByLabel("Usuario", { exact: true }).fill("ejemplo.03");
        await pagina.getByRole("button", { name: "Continuar" }).click();
        await pagina.getByRole("heading", { name: "¿A dónde desea ingresar?" }).waitFor();
        await captura("sistemas");
        await pagina.getByRole("button", { name: /^Odoo/ }).click();
        await pagina.getByRole("dialog").waitFor();
        await captura("odoo");
        await pagina.getByRole("button", { name: "Entendido" }).click();
        for (const [sistema, titulo] of [["sitio", "Administración del sitio"], ["picking", "Sistema de picking"]]) {
          await pagina.getByRole("link", { name: new RegExp(titulo) }).click();
          await pagina.locator('.acc-lay[data-hidratado="true"]').waitFor();
          await pagina.getByRole("heading", { name: titulo, level: 2 }).waitFor();
          await captura(sistema);
          if (sistema === "picking") {
            await pagina.getByRole("button", { name: "¿Olvidó su contraseña?" }).click();
            await pagina.getByRole("dialog").waitFor();
            await captura("recuperacion");
            await pagina.getByRole("button", { name: "Entendido" }).click();
            await pagina.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
            await pagina.getByRole("button", { name: "Ingresar" }).click();
            await pagina.getByRole("alert").filter({ hasText: "Usuario o contraseña incorrectos" }).waitFor();
            await captura("error");
          } else {
            await pagina.getByRole("link", { name: "Elegir otro sistema" }).click();
            await pagina.getByRole("heading", { name: "¿A dónde desea ingresar?" }).waitFor();
          }
        }
      } else {
        await pagina.goto("http://127.0.0.1:4173/#/acceso");
        await pagina.getByRole("heading", { name: "¿Quién es usted?" }).waitFor();
        await captura("usuario");
        await pagina.getByLabel("Usuario", { exact: true }).fill("ejemplo.03");
        await pagina.getByRole("button", { name: "Continuar" }).click();
        await pagina.getByRole("heading", { name: "¿A dónde desea ingresar?" }).waitFor();
        await captura("sistemas");
        await pagina.getByRole("button", { name: /^Odoo/ }).click();
        await pagina.locator(".modal").waitFor();
        await captura("odoo");
        await pagina.getByRole("button", { name: "Entendido" }).click();
        for (const [sistema, titulo] of [["sitio", "Administración del sitio"], ["picking", "Sistema de picking"]]) {
          await pagina.getByRole("link", { name: new RegExp(titulo) }).click();
          await pagina.getByRole("heading", { name: titulo, level: 2 }).waitFor();
          await captura(sistema);
          if (sistema === "picking") {
            await pagina.getByRole("button", { name: "¿Olvidó su contraseña?" }).click();
            await pagina.locator(".modal").waitFor();
            await captura("recuperacion");
            await pagina.getByRole("button", { name: "Entendido" }).click();
            await pagina.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
            await pagina.getByRole("button", { name: "Ingresar" }).click();
            await pagina.getByText("Usuario o contraseña incorrectos.", { exact: true }).waitFor();
            await captura("error");
          } else {
            await pagina.getByRole("link", { name: "Elegir otro sistema" }).click();
            await pagina.getByRole("heading", { name: "¿A dónde desea ingresar?" }).waitFor();
          }
        }
      }
      await contexto.close();
    }
    console.log(`Comparación capturada: ${ancho} px`);
  }
} finally {
  await navegador.close();
}
