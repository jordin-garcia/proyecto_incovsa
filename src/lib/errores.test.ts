import { redirect } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorNegocio, MENSAJE_ERROR_GENERAL, aResultadoDeError } from "./errores";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorNegocio", () => {
  it("specs/16: lleva el mensaje para el usuario y se distingue de los demás errores", () => {
    const error = new ErrorNegocio("La ruta ya fue enviada a Bodega.");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorNegocio);
    expect(error.name).toBe("ErrorNegocio");
    expect(error.message).toBe("La ruta ya fue enviada a Bodega.");
  });
});

describe("aResultadoDeError", () => {
  it("specs/16: un ErrorNegocio devuelve su mensaje al usuario", () => {
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(aResultadoDeError(new ErrorNegocio("El camión no tiene capacidad."))).toEqual({
      ok: false,
      error: "El camión no tiene capacidad.",
    });
    expect(registro).not.toHaveBeenCalled();
  });

  it("specs/16 (Cabeceras y transporte): un error inesperado no revela su mensaje técnico", () => {
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});
    const tecnico = new Error('relation "usuario" does not exist at postgresql://incovsa:clave@localhost/incovsa');
    const resultado = aResultadoDeError(tecnico);
    expect(resultado).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
    expect(JSON.stringify(resultado)).not.toContain("postgresql");
    expect(JSON.stringify(resultado)).not.toContain("usuario");
    // El detalle queda solo en el registro del servidor: tipo y ubicación, sin el mensaje (V16.3.4, JG-26).
    expect(registro).toHaveBeenCalledTimes(1);
    const linea = JSON.parse(registro.mock.calls[0]![0] as string);
    expect(linea).toMatchObject({ nivel: "error", evento: "error_inesperado", tipo: "Error" });
    expect(linea.ubicacion.length).toBeGreaterThan(0);
    expect(registro.mock.calls[0]![0]).not.toContain("postgresql");
  });

  it("ASVS V16.2.1: el error inesperado lleva la fecha, la operación, el sistema y el usuario, sin datos personales", async () => {
    const { fijarContextoRegistro } = await import("./registro");
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});
    async function operacion() {
      await Promise.resolve();
      fijarContextoRegistro({ sistema: "picking", usuarioId: "id-usuario-1", operacion: "pk.bodega" });
      await Promise.resolve();
      try {
        throw Object.assign(new Error("Juan Pérez, clave Secreta-1"), { code: "P2002" });
      } catch (error) {
        return aResultadoDeError(error);
      }
    }
    expect(await operacion()).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
    const texto = registro.mock.calls[0]![0] as string;
    expect(JSON.parse(texto)).toMatchObject({
      nivel: "error",
      evento: "error_inesperado",
      sistema: "picking",
      usuarioId: "id-usuario-1",
      operacion: "pk.bodega",
      codigo: "P2002",
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    expect(texto).not.toContain("Juan");
    expect(texto).not.toContain("Secreta");
  });

  it("ASVS V16.2.1: el contexto de una operación no pasa a otra que corre al mismo tiempo", async () => {
    const { fijarContextoRegistro } = await import("./registro");
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});
    // Como en las acciones: exigirPermiso se llama después de leer la sesión (`await obtenerSesion(...)`).
    const conContexto = async () => {
      await Promise.resolve();
      fijarContextoRegistro({ usuarioId: "con-contexto" });
      await Promise.resolve();
    };
    const sinContexto = async () => {
      await Promise.resolve();
      aResultadoDeError(new Error("x"));
    };
    await Promise.all([conContexto(), sinContexto()]);
    expect(JSON.parse(registro.mock.calls[0]![0] as string).usuarioId).toBeUndefined();
  });

  it("specs/16 (Cabeceras y transporte): lo que no es un Error tampoco se revela", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(aResultadoDeError("texto suelto")).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
    expect(aResultadoDeError({ message: "objeto" })).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
    expect(aResultadoDeError(undefined)).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
  });

  it("specs/16: un error que solo imita el nombre de ErrorNegocio no revela su mensaje", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const imitacion = Object.assign(new Error("detalle interno"), { name: "ErrorNegocio" });
    expect(aResultadoDeError(imitacion)).toEqual({ ok: false, error: MENSAJE_ERROR_GENERAL });
  });

  it("vuelve a lanzar las redirecciones de Next.js en lugar de convertirlas en error", () => {
    let lanzado: unknown;
    try {
      redirect("/acceso");
    } catch (e) {
      lanzado = e;
    }
    expect(() => aResultadoDeError(lanzado)).toThrow();
  });

  it("el mensaje general está en español y no menciona detalles técnicos", () => {
    expect(MENSAJE_ERROR_GENERAL).toBe("No se pudo completar la operación. Inténtelo de nuevo.");
  });
});
