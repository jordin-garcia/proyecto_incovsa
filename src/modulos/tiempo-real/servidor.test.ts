import { afterEach, expect, it, vi } from "vitest";
import { subscribe, unsubscribe } from "node:diagnostics_channel";
import { avisarCambio, suscribirCambios, crearFlujoDeCambios } from "./servidor";

afterEach(() => vi.useRealTimers());

it("RNF-13: permite medir la publicación real antes de notificar, sin agregar datos al flujo SSE", () => {
  let publicacion: unknown;
  let observadoAlNotificar: unknown;
  const observar = (datos: unknown) => {
    publicacion = datos;
  };
  subscribe("incovsa.tiempo-real.cambio", observar);
  const quitar = suscribirCambios(1, () => {
    observadoAlNotificar = publicacion;
  });
  try {
    const inicio = Date.now();
    avisarCambio(1);
    expect(publicacion).toEqual({ sede: 1, instante: expect.any(Number) });
    expect(observadoAlNotificar).toBe(publicacion);
    expect((publicacion as { instante: number }).instante).toBeGreaterThanOrEqual(inicio);
    expect((publicacion as { instante: number }).instante).toBeLessThanOrEqual(Date.now());
  } finally {
    quitar();
    unsubscribe("incovsa.tiempo-real.cambio", observar);
  }
});

it("RNF-13 / RN-17: publica solo a la sede suscrita y permite liberar cada conexión", () => {
  const xela = vi.fn();
  const guatemala = vi.fn();
  const quitarXela = suscribirCambios(1, xela);
  const quitarGuatemala = suscribirCambios(2, guatemala);
  avisarCambio(1);
  expect(xela).toHaveBeenCalledTimes(1);
  expect(guatemala).not.toHaveBeenCalled();
  quitarXela();
  avisarCambio(1);
  expect(xela).toHaveBeenCalledTimes(1);
  avisarCambio(2);
  expect(guatemala).toHaveBeenCalledTimes(1);
  quitarGuatemala();
});

it("RNF-13: un consumidor cerrado no impide los avisos a los demás ni rompe la mutación", () => {
  const quitarRoto = suscribirCambios(1, () => {
    throw new Error("Cerrado");
  });
  const avisar = vi.fn();
  const quitar = suscribirCambios(1, avisar);
  expect(() => avisarCambio(1)).not.toThrow();
  expect(avisar).toHaveBeenCalledTimes(1);
  quitarRoto();
  quitar();
});

it("RNF-13: el flujo emite solo el identificador de sede, latidos cada 25 segundos y se libera al cancelar", async () => {
  vi.useFakeTimers();
  const autorizar = vi.fn(async () => {});
  const abortar = new AbortController();
  const lector = crearFlujoDeCambios(1, abortar.signal, autorizar).getReader();
  const texto = async () => new TextDecoder().decode((await lector.read()).value);
  expect(await texto()).toContain("retry: 5000");
  avisarCambio(2);
  expect(autorizar).not.toHaveBeenCalled();
  avisarCambio(1);
  expect(await texto()).toBe('data: {"sede":1}\n\n');
  await vi.advanceTimersByTimeAsync(25000);
  expect(await texto()).toBe(": latido\n\n");
  abortar.abort();
  expect((await lector.read()).done).toBe(true);
  const cantidad = autorizar.mock.calls.length;
  avisarCambio(1);
  await vi.advanceTimersByTimeAsync(25000);
  expect(autorizar).toHaveBeenCalledTimes(cantidad);
  expect(vi.getTimerCount()).toBe(0);
});

it("RNF-04 / RN-17: revocar sesión o permiso cierra el flujo sin enviar el siguiente aviso", async () => {
  vi.useFakeTimers();
  const autorizar = vi.fn(async () => {
    throw new Error("Acceso revocado");
  });
  const lector = crearFlujoDeCambios(1, new AbortController().signal, autorizar).getReader();
  await lector.read();
  avisarCambio(1);
  expect((await lector.read()).done).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("RNF-13: cancelar el lector o recibir una señal ya cancelada no deja suscripciones ni temporizadores", async () => {
  vi.useFakeTimers();
  const autorizar = vi.fn(async () => {});
  const lector = crearFlujoDeCambios(1, new AbortController().signal, autorizar).getReader();
  await lector.cancel();
  avisarCambio(1);
  expect(autorizar).not.toHaveBeenCalled();
  const abortar = new AbortController();
  abortar.abort();
  const otro = crearFlujoDeCambios(1, abortar.signal, autorizar).getReader();
  expect((await otro.read()).done).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
