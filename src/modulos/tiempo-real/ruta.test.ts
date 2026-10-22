import { beforeEach, expect, it, vi } from "vitest";
import type { SesionActual } from "@/lib/sesion";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
import { GET } from "@/app/api/tiempo-real/route";
import { avisarCambio } from "./servidor";

const sesion: SesionActual = {
  sistema: "picking",
  usuario: { id: "prueba", nombre: "Prueba", usuario: "prueba", rol: "Bodega" },
  permisos: ["pk.bodega"],
  sedes: [{ id: 1, nombre: "Quetzaltenango", prefijoOdoo: "XE" }],
};
beforeEach(() => {
  estado.sesion = sesion;
});
const solicitar = (consulta = "sede=1&modulo=bodega") =>
  GET(new Request(`http://localhost:3000/api/tiempo-real?${consulta}`));

it("RNF-04: rechaza sin sesión, con sesión del sitio o sin permiso del módulo", async () => {
  for (const entrada of [null, { ...sesion, sistema: "sitio" as const }, { ...sesion, permisos: [] }]) {
    estado.sesion = entrada;
    expect((await solicitar()).status).toBe(403);
  }
  estado.sesion = sesion;
  expect((await solicitar("sede=1&modulo=facturacion")).status).toBe(403);
});

it("RN-17: cambiar la sede en la URL no autoriza recibir avisos ajenos", async () => {
  for (const sede of [2, 999999]) {
    const respuesta = await solicitar(`sede=${sede}&modulo=bodega`);
    expect(respuesta.status).toBe(403);
    expect(await respuesta.json()).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
  }
});

it("RNF-04: valida sede y módulo con Zod antes de abrir el flujo", async () => {
  for (const consulta of [
    "",
    "sede=0&modulo=bodega",
    "sede=1.5&modulo=bodega",
    "sede=x&modulo=bodega",
    "sede=1&modulo=otro",
  ]) {
    expect((await solicitar(consulta)).status).toBe(400);
  }
});

it("RNF-13: abre SSE sin caché ni búfer para una sede autorizada", async () => {
  const respuesta = await solicitar();
  expect(respuesta.status).toBe(200);
  expect(respuesta.headers.get("content-type")).toContain("text/event-stream");
  expect(respuesta.headers.get("cache-control")).toContain("no-store");
  expect(respuesta.headers.get("x-accel-buffering")).toBe("no");
  await respuesta.body!.cancel();
});

it("RNF-04 / RN-46: Ruta admite el permiso de rutas propias y Tablero exige Bodega", async () => {
  estado.sesion = { ...sesion, permisos: ["pk.ruta.propias"], usuario: { ...sesion.usuario, rol: "Piloto" } };
  const respuesta = await solicitar("sede=1&modulo=ruta");
  expect(respuesta.status).toBe(200);
  await respuesta.body!.cancel();
  expect((await solicitar("sede=1&modulo=tablero")).status).toBe(403);
});

it("RNF-04 / RN-17: una conexión abierta deja de recibir avisos al revocar su sesión o su sede", async () => {
  for (const revocada of [null, { ...sesion, permisos: [] }, { ...sesion, sedes: [] }]) {
    estado.sesion = sesion;
    const respuesta = await solicitar();
    const lector = respuesta.body!.getReader();
    await lector.read();
    estado.sesion = revocada;
    avisarCambio(1);
    expect((await lector.read()).done).toBe(true);
  }
});
