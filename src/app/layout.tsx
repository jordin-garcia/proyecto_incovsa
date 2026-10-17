import type { Metadata } from "next";
import "./globals.css";

// Título de cada página: "<página> · INCOVSA", como en el prototipo (inicio.js).
export const metadata: Metadata = {
  title: { default: "INCOVSA", template: "%s · INCOVSA" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
