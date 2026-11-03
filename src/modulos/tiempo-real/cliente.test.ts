import { afterEach, expect, it, vi } from "vitest";
const refrescar = vi.fn();
let limpiar: (() => void) | undefined;
vi.mock("react", () => ({
  useEffect: (efecto: () => () => void) => {
    limpiar = efecto();
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refrescar }), usePathname: () => "/picking/bodega" }));
import { useCambiosDeSede } from "./cliente";
afterEach(() => {
  limpiar?.();
  limpiar = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("RNF-13: refresca cada 5000 ms visible, se detiene oculta y libera el intervalo", () => {
  vi.useFakeTimers();
  const documento = { visibilityState: "visible" };
  vi.stubGlobal("document", documento);
  useCambiosDeSede(1);
  vi.advanceTimersByTime(4999);
  expect(refrescar).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(refrescar).toHaveBeenCalledTimes(1);
  documento.visibilityState = "hidden";
  vi.advanceTimersByTime(10000);
  expect(refrescar).toHaveBeenCalledTimes(1);
  documento.visibilityState = "visible";
  vi.advanceTimersByTime(5000);
  expect(refrescar).toHaveBeenCalledTimes(2);
  limpiar?.();
  vi.advanceTimersByTime(5000);
  expect(refrescar).toHaveBeenCalledTimes(2);
});

it("RNF-13 / RN-17: null pausa las consultas durante un cambio de sede", () => {
  vi.useFakeTimers();
  vi.stubGlobal("document", { visibilityState: "visible" });
  useCambiosDeSede(null);
  vi.advanceTimersByTime(10000);
  expect(refrescar).not.toHaveBeenCalled();
  useCambiosDeSede(2);
  vi.advanceTimersByTime(5000);
  expect(refrescar).toHaveBeenCalledTimes(1);
});
