import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilidad de shadcn con las dependencias ya aprobadas en JG-02.
export function cn(...clases: ClassValue[]): string {
  return twMerge(clsx(clases));
}
