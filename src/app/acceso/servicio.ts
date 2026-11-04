import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { crearAuth } from "@/lib/auth-configuracion";
import { obtenerIp } from "@/lib/ip";
import { registrarBitacora } from "@/modulos/bitacora/servicio";
import { esAccesoTotal } from "@/lib/roles";
import { claveAccesoInterna } from "@/lib/cuentas";
import type { SesionActual } from "@/lib/sesion";
import { MENSAJE_ERROR_GENERAL } from "@/lib/errores";
import { verificarContrasena } from "@/lib/contrasenas";
import { registrarEnServidor } from "@/lib/registro";
import { esquemaIngreso, esquemaSistema, esquemaUsuario, type Sistema } from "./esquemas";

export const ERROR_CREDENCIALES = "Usuario o contraseña incorrectos.";
export const ERROR_ACCESO =
  "No tiene permisos para acceder a los sistemas de INCOVSA. Si cree que es un error, comuníquese con Gerencia o con Soporte.";
const FALLOS = ["Intento de acceso fallido", "Intento fallido de inicio de sesión"];
const QUINCE_MINUTOS = 15 * 60_000;

// Bloqueos transaccionales por IP y por cuenta. Serializan también solicitudes simultáneas de distintos procesos.
async function bloquear(tx: Prisma.TransactionClient, ip: string, usuario?: string) {
  for (const clave of [`acceso:ip:${ip}`, ...(usuario ? [`acceso:usuario:${usuario}`] : [])].sort()) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}, 0))`;
  }
}
async function bloqueoVigente(tx: Prisma.TransactionClient, ip: string, usuario?: string) {
  return !!(await tx.bitacora.findFirst({
    where: {
      creadoEn: { gt: new Date(Date.now() - QUINCE_MINUTOS) },
      OR: [
        { operacion: "Bloqueo de IP", ip },
        ...(usuario ? [{ operacion: "Bloqueo de usuario", usuarioEscrito: usuario }] : []),
      ],
    },
    select: { id: true },
  }));
}
async function registrarFallo(
  tx: Prisma.TransactionClient,
  sistema: Sistema,
  usuario: string,
  ip: string,
  usuarioId: string | null,
  pasoUsuario: boolean,
) {
  const nombreSistema = sistema === "picking" ? "Sistema de picking" : "Sitio web";
  const datos = { sistema, usuarioEscrito: usuario, ip, usuarioId };
  const detalle = {
    resumen: pasoUsuario
      ? "Acceso personal · el usuario no existe en ningún sistema"
      : `${nombreSistema} · contraseña incorrecta`,
  };
  await registrarBitacora(tx, { ...datos, detalle, operacion: pasoUsuario ? FALLOS[0]! : FALLOS[1]! });
  const ultimoBloqueoIp = await tx.bitacora.findFirst({
    where: { operacion: "Bloqueo de IP", ip },
    orderBy: { id: "desc" },
  });
  const desdeIp = new Date(
    Math.max(Date.now() - QUINCE_MINUTOS, (ultimoBloqueoIp?.creadoEn.getTime() ?? 0) + QUINCE_MINUTOS),
  );
  const fallosIp = await tx.bitacora.count({ where: { ip, operacion: { in: FALLOS }, creadoEn: { gte: desdeIp } } });
  if (fallosIp >= 20)
    await registrarBitacora(tx, {
      ...datos,
      operacion: "Bloqueo de IP",
      detalle: { resumen: `Acceso personal · Bloqueo de IP · ${ip}` },
    });
  if (pasoUsuario) return;
  const reinicio = await tx.bitacora.findFirst({
    where: { usuarioEscrito: usuario, operacion: { in: ["Inicio de sesión", "Bloqueo de usuario"] } },
    orderBy: { id: "desc" },
  });
  const fallosUsuario = await tx.bitacora.count({
    where: { usuarioEscrito: usuario, operacion: FALLOS[1], ...(reinicio ? { id: { gt: reinicio.id } } : {}) },
  });
  if (fallosUsuario >= 5)
    await registrarBitacora(tx, {
      ...datos,
      operacion: "Bloqueo de usuario",
      detalle: { resumen: `${nombreSistema} · Bloqueo de usuario · ${usuario}` },
    });
}

/** V16.3.3 (JG-26): la pantalla ya valida lo mismo; solo se registra la operación, nunca lo escrito. */
function entradaRechazada(operacion: string) {
  registrarEnServidor("aviso", "entrada_rechazada", { operacion });
}

export async function consultarSistemas(entrada: unknown, cabeceras: Headers) {
  const datos = esquemaUsuario.safeParse(entrada);
  if (!datos.success) {
    entradaRechazada("acceso.consultar_usuario");
    return { ok: false as const, error: datos.error.issues[0]?.message ?? ERROR_ACCESO };
  }
  const ip = obtenerIp(cabeceras);
  return prisma.$transaction(
    async (tx) => {
      await bloquear(tx, ip);
      if (await bloqueoVigente(tx, ip)) return { ok: false as const, error: ERROR_ACCESO };
      const cuentas = await tx.usuario.findMany({
        where: {
          displayUsername: { equals: datos.data.usuario, mode: "insensitive" },
          activo: true,
          eliminadoEn: null,
        },
        select: { sistema: true },
      });
      const sitio = cuentas.some((c) => ["sitio", "ambos"].includes(c.sistema));
      const picking = cuentas.some((c) => ["picking", "ambos"].includes(c.sistema));
      if (!sitio && !picking) {
        await registrarFallo(tx, "sitio", datos.data.usuario, ip, null, true);
        return { ok: false as const, error: ERROR_ACCESO };
      }
      return { ok: true as const, datos: { sitio, picking } };
    },
    { timeout: 15000, maxWait: 15000 },
  );
}

/** Consulta del paso de contraseña: un GET nunca registra ni acumula intentos fallidos. */
export async function consultarSistemasSoloLectura(entrada: unknown, cabeceras: Headers) {
  const datos = esquemaUsuario.safeParse(entrada);
  if (!datos.success) return { ok: false as const, error: ERROR_ACCESO };
  if (await bloqueoVigente(prisma, obtenerIp(cabeceras))) return { ok: false as const, error: ERROR_ACCESO };
  const cuentas = await prisma.usuario.findMany({
    where: { displayUsername: { equals: datos.data.usuario, mode: "insensitive" }, activo: true, eliminadoEn: null },
    select: { sistema: true },
  });
  const sitio = cuentas.some((c) => ["sitio", "ambos"].includes(c.sistema));
  const picking = cuentas.some((c) => ["picking", "ambos"].includes(c.sistema));
  return sitio || picking
    ? { ok: true as const, datos: { sitio, picking } }
    : { ok: false as const, error: ERROR_ACCESO };
}

export function destinoInicial(sesion: Pick<SesionActual, "sistema" | "usuario" | "permisos">): string {
  const tiene = (p: string) => esAccesoTotal(sesion.usuario.rol) || sesion.permisos.includes(p);
  if (sesion.sistema === "sitio") {
    if (["sit.contenido", "sit.industrias", "sit.catalogo", "sit.noticias", "sit.contacto", "sit.sol.ver"].some(tiene))
      return "/panel";
    return "/panel/documentos";
  }
  return (
    "/picking/" +
    ((
      [
        ["facturacion", ["pk.facturacion"]],
        ["bodega", ["pk.bodega"]],
        ["ruta", ["pk.ruta.propias", "pk.ruta.todas"]],
        ["reportes", ["pk.reportes"]],
        ["configuracion", ["pk.cfg.camiones"]],
      ] as const
    ).find(([, permisos]) => permisos.some(tiene))?.[0] ?? "facturacion")
  );
}

export async function iniciarSesion(entrada: unknown, cabeceras: Headers) {
  const datos = esquemaIngreso.safeParse(entrada);
  if (!datos.success) {
    entradaRechazada("acceso.iniciar_sesion");
    return { ok: false as const, error: ERROR_CREDENCIALES };
  }
  const { sistema, usuario, clave } = datos.data;
  const ip = obtenerIp(cabeceras);
  return prisma.$transaction(
    async (tx) => {
      await bloquear(tx, ip, usuario);
      if (await bloqueoVigente(tx, ip, usuario)) return { ok: false as const, error: ERROR_CREDENCIALES };
      const u = await tx.usuario.findFirst({
        where: {
          displayUsername: { equals: usuario, mode: "insensitive" },
          sistema: { in: [sistema, "ambos"] },
          activo: true,
          eliminadoEn: null,
        },
        include: { permisos: { include: { permiso: true } } },
      });
      const auth = crearAuth(sistema, tx);
      // V7.2.4 (JG-26): la sesión que este navegador ya tenía en este sistema (cookie firmada y vigente). Se cierra si el
      // nuevo inicio de sesión es correcto. La del otro sistema no se toca (una sesión por sistema, specs/03).
      const anterior = await auth.api.getSession({ headers: cabeceras, query: { disableRefresh: true } });
      // Incluso sin cuenta, Better Auth verifica un hash ficticio para evitar diferencias de tiempo evidentes.
      const h = new Headers(cabeceras);
      h.set("x-real-ip", ip);
      h.delete("x-forwarded-for");
      const respuesta = await auth.api.signInUsername({
        body: {
          username: u ? claveAccesoInterna(u.sistema as Sistema | "ambos", usuario) : `inexistente.${randomUUID()}`,
          password: clave,
        },
        headers: h,
        asResponse: true,
      });
      if (!respuesta.ok || !u) {
        if (respuesta.status >= 500) throw new Error(MENSAJE_ERROR_GENERAL);
        await registrarFallo(tx, sistema, usuario, ip, u?.id ?? null, false);
        return { ok: false as const, error: ERROR_CREDENCIALES };
      }
      if (anterior) await tx.sesion.deleteMany({ where: { id: anterior.session.id } });
      await registrarBitacora(tx, {
        sistema,
        operacion: "Inicio de sesión",
        entidad: "usuario",
        registroId: u.id,
        usuarioId: u.id,
        usuarioEscrito: usuario,
        ip,
        detalle: { resumen: `${sistema === "picking" ? "Sistema de picking" : "Sitio web"} · ${usuario}` },
      });
      return {
        ok: true as const,
        cabeceras: respuesta.headers,
        destino: destinoInicial({
          sistema,
          usuario: { id: u.id, nombre: u.name, usuario: u.displayUsername, rol: u.rol },
          permisos: u.permisos.map((p) => p.permiso.codigo),
        }),
      };
    },
    { timeout: 30000, maxWait: 30000 },
  );
}

/**
 * Reautenticación (CE-14, V7.5.1): confirma la contraseña del usuario de la sesión antes de una operación sensible.
 * Toma el mismo bloqueo transaccional que el inicio de sesión. Con un bloqueo vigente de RNF-15 (del usuario o de la
 * IP) devuelve `false` aunque la contraseña sea correcta. Cada contraseña incorrecta cuenta en el límite de intentos
 * y queda en la bitácora como un intento fallido de inicio de sesión, con el bloqueo si corresponde. Un acierto no
 * reinicia el conteo: solo lo reinicia un inicio de sesión correcto.
 * Abre su propia transacción, para que el intento fallido quede guardado aunque la operación que la llama no siga.
 */
export async function reautenticar(sesion: SesionActual, clave: unknown, cabeceras: Headers): Promise<boolean> {
  const entrada = esquemaIngreso.shape.clave.safeParse(clave);
  const ip = obtenerIp(cabeceras);
  const usuario = sesion.usuario.usuario.trim().toLowerCase();
  return prisma.$transaction(
    async (tx) => {
      await bloquear(tx, ip, usuario);
      if (await bloqueoVigente(tx, ip, usuario)) return false;
      const cuenta = await tx.cuenta.findFirst({
        where: { userId: sesion.usuario.id, providerId: "credential" },
        select: { password: true },
      });
      const correcta =
        entrada.success &&
        !!cuenta?.password &&
        (await verificarContrasena({ hash: cuenta.password, password: entrada.data }));
      if (!correcta) await registrarFallo(tx, sesion.sistema, usuario, ip, sesion.usuario.id, false);
      return correcta;
    },
    { timeout: 30000, maxWait: 30000 },
  );
}

export async function cerrarSesion(sistema: Sistema, cabeceras: Headers) {
  esquemaSistema.parse(sistema);
  return crearAuth(sistema).api.signOut({ headers: cabeceras, asResponse: true });
}
