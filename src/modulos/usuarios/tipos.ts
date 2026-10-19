import type { SistemaCuenta } from "@/lib/cuentas";

/** Pestaña que administra la cuenta. CE-04 reutiliza el mismo modelo para el sitio. */
export type SistemaPestana = "sitio" | "picking";

/** Vista de lista y formulario. La contraseña no sale de esta frontera. */
export type UsuarioVisible = {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  correo: string | null;
  sistema: SistemaCuenta;
  activo: boolean;
  accesoTotal: boolean;
  sedesIds: number[];
  sedesNombres: string[];
  permisosCodigos: string[];
};

export type PermisoCatalogo = {
  codigo: string;
  modulo: string;
  descripcion: string;
};

export type SedeCatalogo = {
  id: number;
  nombre: string;
};
