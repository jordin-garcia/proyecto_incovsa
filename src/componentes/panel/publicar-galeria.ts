import type { ImagenBorrador } from "./CampoGaleria";
import type { Resultado } from "@/lib/errores";
export async function publicarGaleria(
  tipo: "industrias" | "catalogo" | "noticias",
  datos: object,
  imagenes: ImagenBorrador[],
) {
  const formulario = new FormData();
  let indice = 0;
  const referencias = imagenes.map((imagen) => {
    if (typeof imagen === "string") return imagen;
    formulario.append("imagenes", imagen);
    return indice++;
  });
  formulario.set("datos", JSON.stringify({ ...datos, imagenes: referencias }));
  const respuesta = await fetch(`/panel/${tipo}/publicar`, { method: "POST", body: formulario });
  return (await respuesta.json()) as Resultado<{ id: number }>;
}
