// Cifrado de contraseñas con scrypt (RNF-03; ASVS V11.4.2, JG-26). Solo servidor.
// Una sola función para Better Auth (inicio de sesión de los dos sistemas), la administración de usuarios, crear-admin
// y las semillas. Los parámetros cumplen el mínimo de OWASP para scrypt (N=2^14, r=8, p=5, equivalente a
// N=2^17, r=8, p=1) y quedan escritos en cada hash, así que se pueden subir más adelante sin perder las anteriores.
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

type Parametros = { N: number; r: number; p: number };
export const PARAMETROS_SCRYPT: Parametros = { N: 2 ** 14, r: 8, p: 5 };
/** Formato anterior de Better Auth 1.7 (`sal:clave`, sin parámetros): N=2^14, r=16, p=1. */
const PARAMETROS_ANTERIORES: Parametros = { N: 2 ** 14, r: 16, p: 1 };
const LARGO_CLAVE = 64;
const PREFIJO = "$scrypt$";

function derivar(clave: string, sal: string, { N, r, p }: Parametros): Promise<Buffer> {
  // Como Better Auth: NFKC, para que la misma contraseña escrita con otra composición de Unicode coincida.
  const opciones: ScryptOptions = { N, r, p, maxmem: 256 * N * r };
  return new Promise((resolver, rechazar) =>
    scrypt(clave.normalize("NFKC"), sal, LARGO_CLAVE, opciones, (error, derivada) =>
      error ? rechazar(error) : resolver(derivada),
    ),
  );
}

/** `$scrypt$N=16384,r=8,p=5$<sal hex>$<clave derivada hex>`. */
export async function cifrarContrasena(clave: string): Promise<string> {
  const sal = randomBytes(16).toString("hex");
  const { N, r, p } = PARAMETROS_SCRYPT;
  return `${PREFIJO}N=${N},r=${r},p=${p}$${sal}$${(await derivar(clave, sal, PARAMETROS_SCRYPT)).toString("hex")}`;
}

function leerHash(hash: string): { sal: string; clave: string; parametros: Parametros } | null {
  if (hash.startsWith(PREFIJO)) {
    const [parametros, sal, clave] = hash.slice(PREFIJO.length).split("$");
    const valores = /^N=(\d+),r=(\d+),p=(\d+)$/.exec(parametros ?? "");
    if (!valores || !sal || !clave) return null;
    const [N, r, p] = valores.slice(1).map(Number) as [number, number, number];
    // Un hash alterado no puede pedir un costo menor que el actual ni más de 256 MB de memoria (128·N·r).
    const costoMinimo = PARAMETROS_SCRYPT.N * PARAMETROS_SCRYPT.r * PARAMETROS_SCRYPT.p;
    if (N < 2 ** 14 || N > 2 ** 17 || (N & (N - 1)) !== 0 || r < 8 || r > 16 || p < 1 || p > 16) return null;
    if (N * r * p < costoMinimo) return null;
    return { sal, clave, parametros: { N, r, p } };
  }
  const [sal, clave, sobra] = hash.split(":");
  if (!sal || !clave || sobra !== undefined) return null;
  return { sal, clave, parametros: PARAMETROS_ANTERIORES };
}

/** Acepta el formato nuevo y el anterior de Better Auth. Compara en tiempo constante. */
export async function verificarContrasena({ hash, password }: { hash: string; password: string }): Promise<boolean> {
  const leido = leerHash(hash);
  if (!leido || !/^[0-9a-f]+$/.test(leido.clave) || leido.clave.length !== LARGO_CLAVE * 2) return false;
  const derivada = await derivar(password, leido.sal, leido.parametros);
  return timingSafeEqual(derivada, Buffer.from(leido.clave, "hex"));
}
