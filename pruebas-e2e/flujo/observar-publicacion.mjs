// Solo el fixture de JG-10 precarga este observador. No se incorpora al despliegue ni expone rutas de diagnóstico.
import { subscribe, unsubscribe } from "node:diagnostics_channel";

const canal = "incovsa.tiempo-real.cambio";
const observar = (publicacion) => {
  if (process.connected) process.send({ tipo: canal, ...publicacion }, () => {});
};
subscribe(canal, observar);
process.once("disconnect", () => unsubscribe(canal, observar));
