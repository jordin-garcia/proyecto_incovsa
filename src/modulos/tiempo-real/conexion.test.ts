import { afterEach, beforeEach, expect, it, vi } from "vitest";
const estado = vi.hoisted(() => ({ limpiezas: [] as (() => void)[], refrescar: vi.fn(), ruta: "/picking/bodega" }));
vi.mock("react", () => ({
  useEffect: (efecto: () => (() => void) | undefined) => {
    const limpiar = efecto();
    if (limpiar) estado.limpiezas.push(limpiar);
  },
  useSyncExternalStore: (_suscribir: unknown, leer: () => boolean) => leer(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: estado.refrescar }),
  usePathname: () => estado.ruta,
}));
import { useCambiosDeSede, useConexionEnVivo } from "./cliente";

class FuentePrueba {
  static fuentes: FuentePrueba[] = [];
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((evento: { data: string }) => void) | null = null;
  close = vi.fn();
  constructor(readonly url: string) {
    FuentePrueba.fuentes.push(this);
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("EventSource", FuentePrueba);
  vi.stubGlobal("document", { visibilityState: "visible", addEventListener: vi.fn(), removeEventListener: vi.fn() });
  estado.ruta = "/picking/bodega";
});
afterEach(() => {
  estado.limpiezas.splice(0).forEach((limpiar) => limpiar());
  FuentePrueba.fuentes = [];
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("RNF-13: comparte una sola conexión y un refresco entre armazón y módulo", () => {
  useCambiosDeSede(1);
  useCambiosDeSede(1);
  expect(FuentePrueba.fuentes).toHaveLength(1);
  const fuente = FuentePrueba.fuentes[0]!;
  expect(fuente.url).toBe("/api/tiempo-real?sede=1&modulo=bodega");
  expect(useConexionEnVivo(1)).toBe(false);
  fuente.onopen!();
  expect(useConexionEnVivo(1)).toBe(true);
  estado.refrescar.mockClear();
  fuente.onmessage!({ data: '{"sede":1}' });
  expect(estado.refrescar).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(10000);
  expect(estado.refrescar).toHaveBeenCalledTimes(1);
  estado.limpiezas.shift()!();
  expect(fuente.close).not.toHaveBeenCalled();
  estado.limpiezas.shift()!();
  expect(fuente.close).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it("RNF-13: apaga En vivo al caer SSE, consulta cada 5 s y reconecta sin refrescos duplicados", () => {
  useCambiosDeSede(1);
  const fuente = FuentePrueba.fuentes[0]!;
  fuente.onopen!();
  estado.refrescar.mockClear();
  fuente.onerror!();
  fuente.onerror!();
  expect(useConexionEnVivo(1)).toBe(false);
  vi.advanceTimersByTime(4999);
  expect(estado.refrescar).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(estado.refrescar).toHaveBeenCalledTimes(1);
  expect(FuentePrueba.fuentes).toHaveLength(2);
  FuentePrueba.fuentes[1]!.onopen!();
  expect(useConexionEnVivo(1)).toBe(true);
  estado.refrescar.mockClear();
  vi.advanceTimersByTime(10000);
  expect(estado.refrescar).not.toHaveBeenCalled();
});

it("RN-17 / RNF-13: cambiar de sede o módulo libera la conexión anterior e ignora eventos tardíos", () => {
  useCambiosDeSede(1);
  const fuente = FuentePrueba.fuentes[0]!;
  const mensajeTardio = fuente.onmessage!;
  estado.limpiezas.shift()!();
  useCambiosDeSede(null);
  estado.ruta = "/picking/facturacion";
  useCambiosDeSede(2);
  expect(fuente.close).toHaveBeenCalledTimes(1);
  expect(FuentePrueba.fuentes[1]!.url).toBe("/api/tiempo-real?sede=2&modulo=facturacion");
  mensajeTardio({ data: '{"sede":1}' });
  expect(estado.refrescar).not.toHaveBeenCalled();
});
