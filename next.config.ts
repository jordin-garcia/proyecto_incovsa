import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen de producción autocontenida para Docker (specs/16, "Despliegue").
  output: "standalone",
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
