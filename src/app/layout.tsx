import type { Metadata } from "next";
import { Figtree, JetBrains_Mono, Poppins } from "next/font/google";
import { ProveedorMensajes } from "@/componentes/comunes/Mensajes";
import "./globals.css";

// El nonce CSP se genera por petición; la hidratación no puede usar HTML prerenderizado.
export const dynamic = "force-dynamic";

const titulos = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--fuente-poppins",
  display: "swap",
});
const interfaz = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--fuente-figtree",
  display: "swap",
});
const cifras = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fuente-mono",
  display: "swap",
});

// Título de cada página: "<página> · INCOVSA", como en el prototipo (inicio.js).
export const metadata: Metadata = {
  title: { default: "INCOVSA", template: "%s · INCOVSA" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${titulos.variable} ${interfaz.variable} ${cifras.variable}`}>
      <body>
        <ProveedorMensajes>{children}</ProveedorMensajes>
      </body>
    </html>
  );
}
