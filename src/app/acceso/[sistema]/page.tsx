import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { esquemaSistema, esquemaUsuario } from "../esquemas";
import { AccesoPersonal } from "../AccesoPersonal";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ sistema: string }> }): Promise<Metadata> {
  return { title: (await params).sistema === "picking" ? "Sistema de picking" : "Administración del sitio" };
}

export default async function PaginaContrasena({ params }: { params: Promise<{ sistema: string }> }) {
  const sistema = esquemaSistema.safeParse((await params).sistema);
  const usuario = esquemaUsuario.safeParse({ usuario: (await cookies()).get("incovsa-acceso-usuario")?.value });
  if (!sistema.success || !usuario.success) redirect("/acceso");
  return <AccesoPersonal sistema={sistema.data} usuarioInicial={usuario.data.usuario} />;
}
