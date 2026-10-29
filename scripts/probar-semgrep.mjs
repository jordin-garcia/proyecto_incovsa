import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Reglas con paths reales: se ejecutan desde un repositorio desechable con esa misma estructura.
const carpeta = mkdtempSync(join(tmpdir(), "incovsa-semgrep-"));
const regla = readFileSync(".semgrep/seguridad.yml", "utf8");
// Cuerpo exacto de la recepción pública de Contacto (RF-SW-06), el único que admite incovsa-recepcion-publica.
const cuerpoPublico =
  "export async function enviarSolicitud(entrada: unknown) { try { return { ok: true as const, datos: await crearSolicitud(entrada) }; } catch (error) { return aResultadoDeError(error); } }";
const casos = [
  ['"use server"; export async function insegura() { return 1; }', true],
  ['"use server"; export const insegura = async () => { return 1; };', true],
  ['"use server"; export const insegura = async function() { return 1; };', true],
  ['"use server"; const insegura = async () => 1; export { insegura };', true],
  [
    '"use server"; export async function segura() { exigirPermiso(sesion, "pk.bodega"); } export async function insegura() { return 1; }',
    true,
  ],
  ['"use server"; export async function segura() { exigirPermiso(sesion, "pk.bodega"); return 1; }', false],
  ['"use server"; export const segura = async () => { exigirPermiso(sesion, "pk.bodega"); return 1; };', false],
  ['"use server"; export async function insegura() { return 1; }', true, "src/modulos/prueba/acciones-catalogo.ts"],
  ['/* Módulo */\n"use server"; export async function insegura() { return 1; }', true, "src/modulos/prueba/otro.ts"],
  ["export async function servicio() { return 1; }", false, "src/modulos/prueba/servicio.ts"],
  // RF-SW-06: la recepción pública de Contacto es la única acción sin sesión, y solo en su archivo.
  [
    '"use server"; export async function enviarSolicitud(entrada: unknown) { try { return { ok: true as const, datos: await crearSolicitud(entrada) }; } catch (error) { return aResultadoDeError(error); } }',
    false,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(entrada: unknown) { try { await borrarTodo(); return { ok: true as const, datos: await crearSolicitud(entrada) }; } catch (error) { return aResultadoDeError(error); } }',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(entrada: unknown) { return { ok: true as const, datos: await prisma.solicitudContacto.findMany() }; }',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(e) { return 1; } export async function listarSolicitudes() { return 1; }',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(e) { return 1; } export async function marcar() { exigirPermiso(sesion, "sit.solicitudes"); }',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(e) { return 1; } export const borrar = async () => 1;',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(e) { return 1; } export { borrarSolicitud } from "./servicio";',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    '"use server"; export async function enviarSolicitud(e) { return 1; } export default async function () { return 1; }',
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    `"use server";\nimport { aResultadoDeError } from "@/lib/errores";\nimport { crearSolicitud } from "./servicio";\n${cuerpoPublico}`,
    false,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    `"use server";\nimport { aResultadoDeError } from "@/lib/errores";\nimport { borrarTodo as crearSolicitud } from "./servicio";\n${cuerpoPublico}`,
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  [
    `"use server";\nimport { aResultadoDeError } from "@/lib/errores";\nasync function crearSolicitud(e) { return borrarTodo(e); }\n${cuerpoPublico}`,
    true,
    "src/modulos/solicitudes/recepcion-publica.ts",
  ],
  // H-44: la administración de usuarios exige el acceso total (specs/03), no un permiso ajeno.
  [
    '"use server"; export async function crearUsuarioAccion(e) { return guardar("picking", (sesion) => { exigirAccesoTotal(sesion, "picking"); return crearUsuario(e); }); }',
    false,
    "src/modulos/usuarios/acciones.ts",
  ],
  [
    '"use server"; export async function crearUsuarioAccion(e) { return guardar("picking", (sesion) => { exigirPermiso(sesion, "pk.cfg.camiones"); return crearUsuario(e); }); }',
    true,
    "src/modulos/usuarios/acciones.ts",
  ],
  [
    '"use server"; export async function crearUsuarioAccion(e) { return crearUsuario(e); }',
    true,
    "src/modulos/usuarios/acciones.ts",
  ],
  [
    '"use server"; export async function a(e) { exigirAccesoTotal(sesion, "picking"); return 1; } export const b = async () => { return 1; };',
    true,
    "src/modulos/usuarios/acciones.ts",
  ],
  // Fuera de ese archivo, exigirAccesoTotal no reemplaza a exigirPermiso.
  [
    '"use server"; export async function insegura() { exigirAccesoTotal(sesion, "picking"); return 1; }',
    true,
    "src/modulos/camiones/acciones.ts",
  ],
  ['"use server"; export async function enviarSolicitud(e) { return 1; }', true, "src/modulos/solicitudes/acciones.ts"],
  ['"use server"; export async function insegura() { return 1; }', true, "src/modulos/solicitudes/acciones.ts"],
  ["export async function POST() { return Response.json({}); }", true, "src/app/panel/catalogo/publicar/route.ts"],
  ["export async function GET() { return Response.json({}); }", true, "src/app/api/prueba/route.ts"],
  [
    'export async function GET() { exigirPermiso(sesion, "pk.bodega"); return Response.json({}); }',
    false,
    "src/app/api/prueba/route.ts",
  ],
  ["const contenido = <div dangerouslySetInnerHTML={{ __html: entrada }} />;", true, "src/componentes/prueba.tsx"],
  ["prisma.$queryRawUnsafe(entrada);", true, "src/lib/prueba.ts"],
  ["prisma.$executeRawUnsafe(entrada);", true, "src/lib/prueba.ts"],
  ["eval(entrada);", true, "src/lib/prueba.ts"],
  ["const contenido = <div>{entrada}</div>;", false, "src/componentes/prueba.tsx"],
];
try {
  writeFileSync(join(carpeta, "reglas.yml"), regla);
  for (const [indice, [codigo, debeFallar, ruta = "src/modulos/prueba/acciones.ts"]] of casos.entries()) {
    const destino = join(carpeta, ruta);
    mkdirSync(resolve(destino, ".."), { recursive: true });
    writeFileSync(destino, codigo);
    const resultado = spawnSync(
      "semgrep",
      [
        "scan",
        "--error",
        "--strict",
        "--json",
        "--metrics=off",
        "--disable-version-check",
        "--config",
        "reglas.yml",
        ruta,
      ],
      { cwd: carpeta, encoding: "utf8" },
    );
    const informe = JSON.parse(resultado.stdout || "{}");
    if (informe.errors?.length || resultado.status !== (debeFallar ? 1 : 0) || (debeFallar && !informe.results?.length))
      throw new Error(
        `RNF-04/RNF-05: caso ${indice + 1}: ${resultado.error ?? ""}\n${resultado.stdout}\n${resultado.stderr}`,
      );
    rmSync(destino);
  }
  console.log(`RNF-04/RNF-05: ${casos.length} casos de Semgrep aprobados.`);
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}
