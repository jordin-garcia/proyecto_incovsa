// Contexto del registro del servidor (ASVS V16.2.1, JG-26). Solo servidor.
// `exigirPermiso` y `exigirAccesoTotal` son síncronas y se llaman dentro de cada operación: al fijar ahí el contexto
// con `enterWith`, el resto de la operación (incluido su catch con `aResultadoDeError`) lo hereda, y las demás
// peticiones no lo ven, porque cada una corre en su propio contexto asíncrono.
import { AsyncLocalStorage } from "node:async_hooks";
import { configurarContextoRegistro, registrarEnServidor, type ContextoRegistro } from "./errores";

const almacen = new AsyncLocalStorage<ContextoRegistro>();
configurarContextoRegistro(() => almacen.getStore());

/** Fija el sistema, el usuario y la operación de lo que queda de la operación en curso. */
export function fijarContextoRegistro(contexto: ContextoRegistro) {
  almacen.enterWith({ ...almacen.getStore(), ...contexto });
}

export { registrarEnServidor };
