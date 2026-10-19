"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/componentes/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/componentes/ui/dialog";
import { Input } from "@/componentes/ui/input";
import { useMensajes } from "@/componentes/comunes/Mensajes";
import { esquemaRestablecerClave, type EntradaRestablecerClave } from "@/modulos/usuarios/esquemas";
import { restablecerClaveAccion } from "@/modulos/usuarios/acciones";
import type { UsuarioVisible } from "@/modulos/usuarios/tipos";

type Valores = { id: string; clave: string; confirmarClave: string };

export function DialogoClave({ usuario, alCerrar }: { usuario: UsuarioVisible; alCerrar: () => void }) {
  const router = useRouter();
  const mensaje = useMensajes();
  const formulario = useForm<Valores, unknown, EntradaRestablecerClave>({
    resolver: zodResolver(esquemaRestablecerClave),
    mode: "onBlur",
    defaultValues: { id: usuario.id, clave: "", confirmarClave: "" },
  });
  const errores = formulario.formState.errors;
  const ocupado = formulario.formState.isSubmitting;

  return (
    <form
      onSubmit={formulario.handleSubmit(async (valores) => {
        const resultado = await restablecerClaveAccion(valores);
        if (!resultado.ok) {
          mensaje(resultado.error, "error");
          return;
        }
        mensaje("Contraseña restablecida.");
        alCerrar();
        router.refresh();
      })}
    >
      <div className="modal-cab">
        <DialogTitle>Restablecer contraseña</DialogTitle>
      </div>
      <div className="modal-cuerpo">
        <DialogDescription className="confirmacion-texto">
          Escriba la nueva contraseña de <b>{usuario.nombre}</b> (<span className="mono">{usuario.usuario}</span>) y
          entréguesela a la persona. No se envía nada por correo.
        </DialogDescription>
        <div className="rejilla r2" style={{ marginTop: 14 }}>
          <label className="campo">
            <span>Nueva contraseña</span>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Al menos 8 caracteres"
              aria-invalid={!!errores.clave}
              {...formulario.register("clave")}
            />
            {errores.clave && <small className="msg-error">{errores.clave.message}</small>}
          </label>
          <label className="campo">
            <span>Repita la contraseña</span>
            <Input
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errores.confirmarClave}
              {...formulario.register("confirmarClave")}
            />
            {errores.confirmarClave && <small className="msg-error">{errores.confirmarClave.message}</small>}
          </label>
        </div>
      </div>
      <div className="modal-pie">
        <DialogClose asChild>
          <Button variant="secundario" disabled={ocupado}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={ocupado}>
          Restablecer
        </Button>
      </div>
    </form>
  );
}
