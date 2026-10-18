const estados = {
  PREP: { texto: "En Preparación", clase: "estado-prep" },
  DESP: { texto: "Despachado", clase: "estado-desp" },
  RUTA: { texto: "En Ruta", clase: "estado-ruta" },
  ENTR: { texto: "Entregado", clase: "estado-entr" },
} as const;

export function ChipEstado({ estado }: { estado: keyof typeof estados }) {
  return (
    <span className={`chip ${estados[estado].clase}`}>
      <span className="punto" aria-hidden="true" />
      {estados[estado].texto}
    </span>
  );
}
