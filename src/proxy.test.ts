import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const estado = vi.hoisted(() => ({ leer: vi.fn() }));
vi.mock("@/lib/sesion", () => ({ leerSesion: estado.leer }));
import { proxy } from "./proxy";

it("RNF-04: una cookie de otro sistema no permite pasar la primera barrera", async () => {
  estado.leer.mockClear();
  for (const ruta of ["/panel/documentos", "/picking/bodega"]) {
    const respuesta = await proxy(new NextRequest(`http://localhost:3000${ruta}`));
    expect(respuesta.headers.get("location")).toBe("http://localhost:3000/acceso");
  }
  expect(estado.leer).not.toHaveBeenCalled();
});
it("RNF-04: revalida la cookie real y reenvía las cookies renovadas al navegador", async () => {
  const cabeceras = new Headers();
  cabeceras.append("set-cookie", "incovsa-picking.session_token=renovada; Path=/; HttpOnly; SameSite=Lax");
  estado.leer.mockResolvedValue({ sesion: { sistema: "picking" }, cabeceras });
  const peticion = new NextRequest("http://localhost:3000/picking/bodega", {
    headers: { cookie: "incovsa-picking.session_token=firmada", "x-incovsa-ruta": "/panel/usuarios" },
  });
  const respuesta = await proxy(peticion);
  expect(estado.leer).toHaveBeenCalledWith("picking", peticion.headers);
  expect(respuesta.headers.getSetCookie()).toEqual(cabeceras.getSetCookie());
  estado.leer.mockResolvedValue({ sesion: null, cabeceras: new Headers() });
  expect((await proxy(peticion)).headers.get("location")).toBe("http://localhost:3000/acceso");
});
