// Correcciones de la auditoría del 22/10 y del 26/10 en configuración, producción y CI (JG-25).
// Cada prueba lleva el hallazgo que habría detectado. Leen los archivos como texto, sin dependencias.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

/** Pasos de un flujo: { nombre, cuerpo } en orden. Los pasos van con `- name:` o `- uses:`. */
function pasos(flujo) {
  return flujo
    .split(/\n(?= {6}- )/)
    .slice(1)
    .map((cuerpo) => ({ nombre: cuerpo.match(/name:\s*"?([^"\n]+)"?/)?.[1] ?? "", cuerpo }));
}

/** Contenido de los bloques `run: |` de un flujo, sin el resto del YAML. */
function bloquesRun(flujo) {
  const bloques = [];
  const lineas = flujo.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const inicio = lineas[i].match(/^( *)run: \|/);
    if (!inicio) continue;
    const sangria = inicio[1].length;
    const cuerpo = [];
    for (i++; i < lineas.length; i++) {
      const linea = lineas[i];
      if (linea.trim() && linea.search(/\S/) <= sangria) {
        i--;
        break;
      }
      cuerpo.push(linea);
    }
    bloques.push(cuerpo.join("\n"));
  }
  return bloques;
}

test("H-27: .env.example tiene todas las variables de JG-02 (paso 14) y ningún valor real", () => {
  const ejemplo = leer(".env.example");
  const variables = Object.fromEntries(
    ejemplo
      .split("\n")
      .filter((l) => /^[A-Z0-9_]+=/.test(l))
      .map((l) => {
        const [nombre, ...valor] = l.split("=");
        return [nombre, valor.join("=").replace(/^"|"$/g, "")];
      }),
  );
  const esperadas = [
    "DATABASE_URL",
    "DATABASE_URL_PRUEBAS",
    "BETTER_AUTH_SECRET_SITIO",
    "BETTER_AUTH_SECRET_PICKING",
    "BETTER_AUTH_URL",
    "SESION_DIAS",
    "CLAVE_DEMO",
    "ALMACENAMIENTO",
    "R2_CUENTA",
    "R2_LLAVE",
    "R2_SECRETO",
    "R2_BUCKET_IMAGENES",
    "URL_IMAGENES",
    "URL_ODOO",
    "TIEMPO_REAL_CONSULTA_MS",
  ];
  for (const nombre of esperadas) assert.ok(nombre in variables, `falta ${nombre}`);
  assert.equal(variables.SESION_DIAS, "7");
  assert.equal(variables.ALMACENAMIENTO, "disco");
  assert.equal(variables.TIEMPO_REAL_CONSULTA_MS, "5000");
  // Valores de ejemplo: vacíos, de marcador («cambie-est…», USUARIO:CONTRASENA) o de la computadora local.
  for (const nombre of ["R2_CUENTA", "R2_LLAVE", "R2_SECRETO", "R2_BUCKET_IMAGENES", "URL_IMAGENES", "URL_ODOO"])
    assert.equal(variables[nombre], "", nombre);
  for (const nombre of ["BETTER_AUTH_SECRET_SITIO", "BETTER_AUTH_SECRET_PICKING", "CLAVE_DEMO"])
    assert.match(variables[nombre], /^cambie-est/, nombre);
  for (const nombre of ["DATABASE_URL", "DATABASE_URL_PRUEBAS"])
    assert.match(variables[nombre], /^postgresql:\/\/USUARIO:CONTRASENA@localhost:5432\//, nombre);
  assert.equal(variables.BETTER_AUTH_URL, "http://localhost:3000");
  // Ningún .env queda en el repositorio: solo las plantillas.
  const rastreados = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter((ruta) => /(^|\/)\.env/.test(ruta));
  assert.deepEqual(rastreados.sort(), [".env.example", ".env.produccion.example"]);
});

test("H-27: los scripts de npm tienen los nombres de AGENTS.md", () => {
  const scripts = Object.keys(JSON.parse(leer("package.json")).scripts);
  const comandos = leer("AGENTS.md").split("## Comandos")[1].split("\n## ")[0];
  const nombrados = new Set([...comandos.matchAll(/npm run ([a-z0-9:-]+)/g)].map((m) => m[1]));
  if (/`npm test`/.test(comandos)) nombrados.add("test");
  for (const nombre of [
    "dev",
    "build",
    "formato",
    "lint",
    "tipos",
    "test",
    "e2e",
    "verificar",
    "db:aplicar",
    "db:semilla",
    "semilla:demo",
    "db:reiniciar",
    "db:migrar",
    "crear-admin",
  ])
    assert.ok(nombrados.has(nombre), `AGENTS.md no nombra ${nombre}`);
  for (const nombre of nombrados) assert.ok(scripts.includes(nombre), `package.json no tiene el script ${nombre}`);
});

test("H-28: la CI falla si schema.prisma y las migraciones no coinciden", () => {
  const ci = leer(".github/workflows/ci.yml");
  const lista = pasos(ci.split("\n  pruebas:")[1].split("\n  compilacion:")[0]);
  const migrar = lista.findIndex((p) => p.cuerpo.includes("npm run db:aplicar"));
  const comparar = lista.findIndex((p) =>
    /prisma migrate diff --from-config-datasource --to-schema prisma\/schema\.prisma --exit-code/.test(p.cuerpo),
  );
  const probar = lista.findIndex((p) => /run: npm test\b/.test(p.cuerpo));
  assert.ok(migrar >= 0 && comparar > migrar && probar > comparar, "comparar después de migrar y antes de npm test");
  assert.doesNotMatch(lista[comparar].cuerpo, /continue-on-error|\|\| true/);
});

test("H-46, H-48: la imagen de producción comprueba a través de Caddy todas las cabeceras y una sola HSTS", () => {
  const flujo = leer(".github/workflows/produccion-imagen.yml");
  for (const ruta of ["next.config.ts", "src/lib/cabeceras.ts", "src/proxy.ts", "src/app/api/tiempo-real/**"])
    assert.match(flujo, new RegExp(`\\n      - ${ruta.replace(/[.*/]/g, "\\$&")}\\n`), `paths sin ${ruta}`);
  const cabeceras = pasos(flujo).find((p) => /cabeceras de seguridad/i.test(p.nombre));
  assert.ok(cabeceras, "falta el paso de las cabeceras");
  for (const texto of [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options: nosniff",
    "referrer-policy: strict-origin-when-cross-origin",
    "frame-ancestors 'none'",
  ])
    assert.ok(cabeceras.cuerpo.toLowerCase().includes(texto), `no comprueba ${texto}`);
  assert.match(cabeceras.cuerpo, /-ne 1/, "debe exigir exactamente una HSTS");
  // Next.js envía HSTS en producción (JG-11); Caddy no la repite.
  assert.doesNotMatch(leer("Caddyfile"), /Strict-Transport-Security/i);
});

test("H-47: la imagen de producción exige el primer evento de /api/tiempo-real a través de Caddy", () => {
  const sse = pasos(leer(".github/workflows/produccion-imagen.yml")).find((p) => /tiempo real/i.test(p.nombre));
  assert.ok(sse, "falta el paso de tiempo real");
  assert.match(sse.cuerpo, /sign-in\/username/);
  assert.match(sse.cuerpo, /\/api\/tiempo-real\?sede=/);
  assert.match(sse.cuerpo, /--max-time [1-9]\b/);
  assert.match(sse.cuerpo, /: conectado/);
  assert.match(sse.cuerpo, /text\/event-stream/);
});

test("H-49: Compose usa la etiqueta produccion que publica CE-06, nunca latest", () => {
  const compose = leer("docker-compose.yml");
  assert.match(compose, /image: \$\{IMAGEN_APP:-ghcr\.io\/jordin-garcia\/proyecto_incovsa:produccion\}/);
  assert.doesNotMatch(compose, /:latest/);
});

test("H-50: el límite de 27 MB de Caddy está registrado en specs/16 y specs/18", () => {
  assert.match(leer("Caddyfile"), /max_size 27MB/);
  assert.match(leer("specs/16-arquitectura-y-tecnologia.md"), /27 MB[^\n]*Caddy|Caddy[^\n]*27 MB/);
  assert.match(leer("specs/18-historial-de-decisiones.md"), /27 MB/);
});

test("H-51: el código de la imagen es de root y el proceso no puede reescribirlo", () => {
  const dockerfile = leer("Dockerfile");
  const final = dockerfile.split("AS ejecucion")[1];
  assert.doesNotMatch(final, /--chown=nextjs/);
  assert.match(final, /\.next\/cache/);
  assert.match(final, /USER nextjs/);
  const paso = pasos(leer(".github/workflows/produccion-imagen.yml")).find((p) => /solo lectura/i.test(p.nombre));
  assert.ok(paso, "falta el paso que lo comprueba");
  assert.match(paso.cuerpo, /server\.js/);
  assert.match(paso.cuerpo, /node_modules/);
});

test("H-52, H-53, H-54: el despliegue no interpola contextos en el shell, sin rama de prueba y con poda para organizaciones", () => {
  const flujo = leer(".github/workflows/despliegue.yml");
  for (const bloque of bloquesRun(flujo)) assert.doesNotMatch(bloque, /\$\{\{/, bloque.slice(0, 200));
  assert.doesNotMatch(flujo, /ce-06-prueba/);
  assert.match(flujo, /branches: \[main\]/);
  assert.match(flujo, /\/orgs\//);
  assert.match(flujo, /Organization/);
});

test("H-55: la verificación de respaldos usa también el modo docker compose exec del VPS", () => {
  const flujo = leer(".github/workflows/produccion-respaldo.yml");
  assert.match(flujo, /\n      - docker-compose\.yml\n/);
  const compose = pasos(flujo).filter((p) => /docker compose/i.test(p.nombre));
  assert.ok(compose.length >= 2, "faltan los pasos del modo docker compose");
  for (const paso of compose.filter((p) => /respald|restaur/i.test(p.nombre)))
    assert.match(paso.cuerpo, /USAR_DOCKER_RUN: "0"/, paso.nombre);
  assert.ok(compose.some((p) => p.cuerpo.includes("./scripts/respaldo.sh")));
  assert.ok(compose.some((p) => p.cuerpo.includes("./scripts/restaurar.sh")));
});

test("D-05: evidencia/CE-07 explica cómo rehacer el .env y rclone del VPS, sin secretos", () => {
  const nota = leer("evidencia/CE-07/README.md");
  assert.match(nota, /## Rehacer el `\.env` y `rclone` del VPS/);
  assert.match(nota, /\.env\.produccion\.example/);
  assert.match(nota, /rclone config/);
  assert.match(nota, /Anexo J/);
  assert.doesNotMatch(nota, /BETTER_AUTH_SECRET_\w+=\S/);
});

test("H-82: el Resultado de JG-08 y specs/16 describen el agrupamiento de Dependabot", () => {
  const tarea = leer("plan/tareas/JG-08-integracion-continua-y-bot.md");
  assert.doesNotMatch(tarea, /### Correcciones de la auditoría \(2026-10-24\)/);
  assert.doesNotMatch(tarea, /siguen abiertas para revisión las versiones mayores #117, #119, #120/);
  assert.match(tarea, /### Correcciones de la auditoría \(2026-10-26\)/);
  const dependencias = leer("specs/16-arquitectura-y-tecnologia.md").match(/- \*\*Dependencias al día\*\*[^\n]+/)[0];
  assert.match(dependencias, /menores y (los )?parches/);
  assert.match(dependencias, /versión mayor/);
});
