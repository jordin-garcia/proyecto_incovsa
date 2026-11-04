import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const estado = vi.hoisted(() => ({ leer: vi.fn() }));
vi.mock("@/lib/sesion", () => ({ leerSesion: estado.leer }));
import { proxy } from "./proxy";

it("RNF-04: una cookie de otro sistema no permite pasar la primera barrera", async () => {
  estado.leer.mockClear();
  for (const ruta of ["/panel/documentos", "/picking/bodega"]) {
    const otroSistema = ruta.startsWith("/panel") ? "picking" : "sitio";
    const respuesta = await proxy(
      new NextRequest(`http://localhost:3000${ruta}`, {
        headers: { cookie: `incovsa-${otroSistema}.session_token=sesion-del-otro-sistema` },
      }),
    );
    expect(respuesta.headers.get("location")).toBe("http://localhost:3000/acceso");
  }
  expect(estado.leer).not.toHaveBeenCalled();
});
it("RNF-16 (ASVS V11.5.1): el nonce de la CSP tiene 128 bits aleatorios y cambia en cada respuesta", async () => {
  const nonces = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const respuesta = await proxy(new NextRequest("http://localhost:3000/acceso"));
    const nonce = /'nonce-([^']+)'/.exec(respuesta.headers.get("content-security-policy") ?? "")?.[1] ?? "";
    expect(Buffer.from(nonce, "base64")).toHaveLength(16);
    nonces.add(nonce);
  }
  expect(nonces.size).toBe(20);
});
it("RNF-16: en producción solo cuenta la cookie de sesión con __Host-", async () => {
  vi.stubEnv("NODE_ENV", "production");
  try {
    estado.leer.mockClear();
    const sinPrefijo = await proxy(
      new NextRequest("http://localhost:3000/picking/bodega", {
        headers: { cookie: "incovsa-picking.session_token=x; __Secure-incovsa-picking.session_token=y" },
      }),
    );
    expect(sinPrefijo.headers.get("location")).toBe("http://localhost:3000/acceso");
    expect(estado.leer).not.toHaveBeenCalled();
    estado.leer.mockResolvedValue({ sesion: { sistema: "picking" }, cabeceras: new Headers() });
    await proxy(
      new NextRequest("http://localhost:3000/picking/bodega", {
        headers: { cookie: "__Host-incovsa-picking.session_token=firmada" },
      }),
    );
    expect(estado.leer).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllEnvs();
  }
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
