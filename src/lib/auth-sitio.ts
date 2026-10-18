import { crearAuth } from "./auth-configuracion";

// Inicialización diferida: la compilación no necesita secretos ni conexión a la base.
export const authSitio = () => crearAuth("sitio");
