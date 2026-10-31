import type { NextConfig } from "next";
import { cabecerasDeSeguridad, crearCsp } from "./src/lib/cabeceras";

const nextConfig: NextConfig = {
  // Imagen de producción autocontenida para Docker (specs/16, "Despliegue").
  output: "standalone",
  // ZAP 10037 (JG-26): sin X-Powered-By, que revela la tecnología.
  poweredByHeader: false,
  async headers() {
    const produccion = process.env.NODE_ENV === "production";
    return [
      {
        source: "/:path*",
        headers: [
          ...cabecerasDeSeguridad(produccion),
          { key: "Content-Security-Policy", value: crearCsp({ produccion, urlImagenes: process.env.URL_IMAGENES }) },
        ],
      },
    ];
  },
  // `next dev` no escribe sus instrucciones en AGENTS.md, que es un archivo protegido (plan/convenciones.md §3).
  agentRules: false,
  // El indicador flotante de desarrollo cubre controles del prototipo en teléfono.
  // Los errores siguen disponibles en next-devtools y en la superposición de errores.
  devIndicators: false,
  // Next.js 16 registra los argumentos de las acciones en desarrollo: nunca registrar contraseñas (RNF-03).
  logging: { serverFunctions: false },
  experimental: {
    serverActions: {
      // El archivo de Odoo puede pesar hasta 2 MB (specs/16, decisión 58).
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
