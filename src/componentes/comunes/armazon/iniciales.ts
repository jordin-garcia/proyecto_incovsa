/** Misma regla que iniciales() del prototipo aprobado. */
export function iniciales(nombre: string): string {
  return (
    nombre
      .split(/\s+/)
      .filter((palabra) => /[A-Za-zÁÉÍÓÚÑ]/.test(palabra[0] ?? ""))
      .slice(0, 2)
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase() || "U"
  );
}
