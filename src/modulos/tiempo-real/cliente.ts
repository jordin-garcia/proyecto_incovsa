"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const TIEMPO_REAL_CONSULTA_MS = 5000;
export function useCambiosDeSede(sede: number | null) {
  const router = useRouter();
  useEffect(() => {
    if (sede === null) return;
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, TIEMPO_REAL_CONSULTA_MS);
    return () => clearInterval(intervalo);
  }, [router, sede]);
}
