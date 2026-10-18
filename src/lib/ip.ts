import { isIP } from "node:net";

/** En producción Caddy sobrescribe X-Real-IP; nunca se confía en X-Forwarded-For. */
export function obtenerIp(cabeceras: Headers): string {
  const ip = cabeceras.get("x-real-ip")?.trim();
  if (ip && isIP(ip)) return ip;
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";
  throw new Error("Falta la dirección IP del proxy de confianza.");
}
