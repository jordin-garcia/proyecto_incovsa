import type { SistemaPestana } from "@/modulos/usuarios/tipos";

/** Textos y columnas que cambian entre las dos administraciones. */
export const TEXTOS_USUARIO = {
  picking: {
    nuevo: "Nuevo usuario del picking",
    editar: "Editar usuario del picking",
    permisos: "Permisos del sistema de picking",
    columnaPermisos: "Permisos del picking",
    chipOtro: "+ sitio",
    muestraSedes: true,
    muestraCorreo: false,
    notaPiloto: true,
  },
  sitio: {
    nuevo: "Nuevo usuario del sitio",
    editar: "Editar usuario del sitio",
    permisos: "Permisos del sitio web",
    columnaPermisos: "Permisos del sitio",
    chipOtro: "+ picking",
    muestraSedes: false,
    muestraCorreo: true,
    notaPiloto: false,
  },
} as const satisfies Record<
  SistemaPestana,
  {
    nuevo: string;
    editar: string;
    permisos: string;
    columnaPermisos: string;
    chipOtro: string;
    muestraSedes: boolean;
    muestraCorreo: boolean;
    notaPiloto: boolean;
  }
>;
