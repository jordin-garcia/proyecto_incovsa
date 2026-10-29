import { z } from "zod";
import { getCountries, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
const paises = new Set<string>(getCountries());
export const esquemaSolicitud = z
  .strictObject({
    motivo: z.enum(["solicitud", "queja", "reclamo"]),
    nombre: z.string().trim().min(2, "Indique su nombre.").max(150, "El nombre admite hasta 150 caracteres."),
    empresa: z.string().trim().max(150, "La empresa admite hasta 150 caracteres."),
    correo: z
      .string()
      .trim()
      .max(150, "El correo admite hasta 150 caracteres.")
      .pipe(z.email("Indique un correo con una estructura válida (nombre@dominio.com).")),
    telefonoPais: z.string().refine((c) => paises.has(c), "Elija el código de país."),
    telefono: z.string().trim().max(20, "El teléfono admite hasta 20 caracteres."),
    pais: z.string().refine((c) => paises.has(c), "Elija el país."),
    departamentoId: z.string().regex(/^\d*$/),
    municipioId: z.string().regex(/^\d*$/),
    sedeId: z.string().regex(/^[1-9]\d*$/, "Elija la sede."),
    mensaje: z.string().trim().min(5, "Escriba su mensaje.").max(2000, "El mensaje admite hasta 2000 caracteres."),
  })
  .superRefine((d, ctx) => {
    if (d.pais === "GT") {
      if (!d.departamentoId)
        ctx.addIssue({ code: "custom", path: ["departamentoId"], message: "Elija el departamento." });
      if (!d.municipioId) ctx.addIssue({ code: "custom", path: ["municipioId"], message: "Elija el municipio." });
    }
    if (d.telefono && paises.has(d.telefonoPais) && !isValidPhoneNumber(d.telefono, d.telefonoPais as CountryCode))
      ctx.addIssue({
        code: "custom",
        path: ["telefono"],
        message: `El teléfono no es válido para ${new Intl.DisplayNames(["es"], { type: "region" }).of(d.telefonoPais)}.`,
      });
  });
export type Solicitud = z.output<typeof esquemaSolicitud>;
