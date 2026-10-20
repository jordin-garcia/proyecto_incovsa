"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icono } from "@/componentes/comunes/iconos";
import { Button } from "@/componentes/ui/button";
import { NAVEGACION } from "./navegacion";

export function Cabecera({ logotipo }: { logotipo: string }) {
  const ruta = usePathname();
  const [menuAbierto, abrirMenu] = useState(false);
  const enlaces = NAVEGACION.map(([href, texto]) => {
    const activa = href === "/" ? ruta === href : ruta.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={activa ? "on" : ""}
        aria-current={activa ? "page" : undefined}
        onClick={() => abrirMenu(false)}
      >
        {texto}
      </Link>
    );
  });
  return (
    <header
      className="sh"
      onKeyDown={(evento) => {
        if (evento.key === "Escape") abrirMenu(false);
      }}
    >
      <div className="wrap sh-in">
        <Link href="/" className="sh-logo" aria-label="INCOVSA Químicos, inicio">
          <Image src={logotipo} alt="INCOVSA Químicos" width={180} height={60} unoptimized loading="eager" />
        </Link>
        <nav className="sh-nav" aria-label="Menú principal">
          {enlaces}
        </nav>
        <Button asChild size="pequeno" className="acceso-personal">
          <Link href="/acceso">
            <Icono nombre="candado" className="ico-s" />
            Acceso personal
          </Link>
        </Button>
        <Button
          variant="fantasma"
          size="icono"
          className="sh-menu"
          aria-label="Abrir menú"
          aria-controls="menu-sitio"
          aria-expanded={menuAbierto}
          onClick={() => abrirMenu(!menuAbierto)}
        >
          <Icono nombre="menu" />
        </Button>
      </div>
      <nav id="menu-sitio" className={`sh-movil ${menuAbierto ? "abierto" : ""}`} aria-label="Menú">
        {enlaces}
      </nav>
    </header>
  );
}
