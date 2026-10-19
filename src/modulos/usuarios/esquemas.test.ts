import { describe, expect, it } from "vitest";
import {
  MENSAJE_CLAVE_CORTA,
  MENSAJE_CLAVE_DISTINTA,
  MENSAJE_NOMBRE_USUARIO,
  MENSAJE_ROL,
  MENSAJE_SEDE,
  esquemaCrearUsuarioPicking,
  esquemaEditarUsuarioPicking,
  esquemaRestablecerClave,
} from "./esquemas";

const base = {
  nombre: "Ana López",
  usuario: "Ana.Lopez",
  rol: "Bodega",
  correo: "",
  sedesIds: [1],
  permisosCodigos: ["pk.bodega"],
};

describe("esquema de usuario del picking", () => {
  it("RF-SL-48: rechaza una contraseña corta o dos distintas y acepta el mínimo", () => {
    const corta = esquemaCrearUsuarioPicking.safeParse({ ...base, clave: "abc", confirmarClave: "abc" });
    expect(corta.success).toBe(false);
    if (!corta.success) expect(corta.error.issues.map((issue) => issue.message)).toContain(MENSAJE_CLAVE_CORTA);

    const distinta = esquemaCrearUsuarioPicking.safeParse({
      ...base,
      clave: "Clave-buena-1",
      confirmarClave: "Clave-buena-2",
    });
    expect(distinta.success).toBe(false);
    if (!distinta.success)
      expect(distinta.error.issues.map((issue) => issue.message)).toContain(MENSAJE_CLAVE_DISTINTA);

    const vacia = esquemaRestablecerClave.safeParse({ id: "u1", clave: "", confirmarClave: "" });
    expect(vacia.success).toBe(false);
    if (!vacia.success) expect(vacia.error.issues[0]?.message).toBe(MENSAJE_CLAVE_CORTA);

    const creada = esquemaCrearUsuarioPicking.parse({
      ...base,
      correo: "",
      clave: "12345678",
      confirmarClave: "12345678",
    });
    expect(creada).toMatchObject({ usuario: "ana.lopez", clave: "12345678", correo: null });
    expect(esquemaCrearUsuarioPicking.parse(creada)).toMatchObject({ correo: null, usuario: "ana.lopez" });
  });

  it("RF-SL-03: nombre, usuario y rol son obligatorios, y sin acceso total hace falta una sede", () => {
    const sinNombre = esquemaCrearUsuarioPicking.safeParse({
      ...base,
      nombre: "   ",
      clave: "12345678",
      confirmarClave: "12345678",
    });
    expect(sinNombre.success).toBe(false);
    if (!sinNombre.success) expect(sinNombre.error.issues[0]?.message).toBe(MENSAJE_NOMBRE_USUARIO);

    const sinRol = esquemaCrearUsuarioPicking.safeParse({
      ...base,
      rol: "  ",
      clave: "12345678",
      confirmarClave: "12345678",
    });
    expect(sinRol.success).toBe(false);
    if (!sinRol.success) expect(sinRol.error.issues[0]?.message).toBe(MENSAJE_ROL);

    const sinSede = esquemaCrearUsuarioPicking.safeParse({
      ...base,
      sedesIds: [],
      clave: "12345678",
      confirmarClave: "12345678",
    });
    expect(sinSede.success).toBe(false);
    if (!sinSede.success) expect(sinSede.error.issues.map((issue) => issue.message)).toContain(MENSAJE_SEDE);

    expect(
      esquemaCrearUsuarioPicking.parse({
        ...base,
        rol: " Gerencia ",
        sedesIds: [],
        clave: "12345678",
        confirmarClave: "12345678",
      }).rol,
    ).toBe("Gerencia");
  });

  it("RF-SL-56: editar no pide contraseña y conserva el rol recortado", () => {
    const editada = esquemaEditarUsuarioPicking.parse({
      id: "u1",
      nombre: " Ana ",
      rol: " piloto ",
      correo: "  ",
      sedesIds: ["2"],
      permisosCodigos: ["pk.ruta.propias"],
      activo: true,
    });
    expect(editada).toEqual({
      id: "u1",
      nombre: "Ana",
      rol: "piloto",
      correo: null,
      sedesIds: [2],
      permisosCodigos: ["pk.ruta.propias"],
      activo: true,
    });
    expect(esquemaEditarUsuarioPicking.parse(editada)).toEqual(editada);
  });
});
