"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/componentes/ui/button";
import { Dialog, DialogContent } from "@/componentes/ui/dialog";
import { EncabezadoModulo } from "@/componentes/comunes/EncabezadoModulo";
import { Icono } from "@/componentes/comunes/iconos";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { DialogoClave } from "@/componentes/usuarios/DialogoClave";
import { FormularioUsuario } from "@/componentes/usuarios/FormularioUsuario";
import { TablaUsuarios } from "@/componentes/usuarios/TablaUsuarios";
import { ErrorNegocio } from "@/lib/errores";
import { eliminarUsuarioSitioAccion } from "@/modulos/usuarios/acciones";
import type { PermisoCatalogo, UsuarioVisible } from "@/modulos/usuarios/tipos";

export function UsuariosSitioCliente({
  usuarios,
  permisos,
  usuarioActualId,
}: {
  usuarios: readonly UsuarioVisible[];
  permisos: readonly PermisoCatalogo[];
  usuarioActualId: string;
}) {
  const router = useRouter();
  const mensaje = useMensajes();
  const [usuarioEdicion, setUsuarioEdicion] = useState<UsuarioVisible | null | false>(false);
  const [claveDe, setClaveDe] = useState<UsuarioVisible | null>(null);

  async function quitarUsuario(id: string) {
    const resultado = await eliminarUsuarioSitioAccion({ id });
    if (!resultado.ok) throw new ErrorNegocio(resultado.error);
    mensaje("Usuario eliminado.");
    router.refresh();
  }

  return (
    <>
      <EncabezadoModulo
        eyebrow="Gerencia y Soporte"
        titulo="Usuarios del sitio"
        instruccion="Rol de texto libre y permisos del sitio. Gerencia y Soporte entran también al picking."
        acciones={
          <Button onClick={() => setUsuarioEdicion(null)}>
            <Icono nombre="mas" /> Nuevo usuario
          </Button>
        }
      />
      <section className="tarjeta">
        <div className="lista-usuarios">
          <TablaUsuarios
            sistema="sitio"
            usuarios={usuarios}
            usuarioActualId={usuarioActualId}
            alEditar={setUsuarioEdicion}
            alRestablecer={setClaveDe}
            alEliminar={quitarUsuario}
          />
        </div>
      </section>
      <Dialog
        open={usuarioEdicion !== false}
        onOpenChange={(abierta) => {
          if (!abierta) setUsuarioEdicion(false);
        }}
      >
        <DialogContent grande aria-describedby={undefined}>
          {usuarioEdicion !== false && (
            <FormularioUsuario
              sistema="sitio"
              usuario={usuarioEdicion}
              permisos={permisos}
              alCerrar={() => setUsuarioEdicion(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={claveDe !== null}
        onOpenChange={(abierta) => {
          if (!abierta) setClaveDe(null);
        }}
      >
        <DialogContent>
          {claveDe && <DialogoClave sistema="sitio" usuario={claveDe} alCerrar={() => setClaveDe(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
