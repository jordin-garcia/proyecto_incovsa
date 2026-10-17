import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen de producción autocontenida para Docker (specs/16, "Despliegue").
  output: "standalone",
  experimental: {
    serverActions: {
      // El archivo de Odoo puede pesar hasta 2 MB (specs/16, decisión 58).
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
