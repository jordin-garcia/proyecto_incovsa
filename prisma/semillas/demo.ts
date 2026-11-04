// Semilla de demostración (JG-03): solo desarrollo (specs/16, decisión 79; plan/convenciones.md §5). Cuentas
// "Usuario de ejemplo NN", camiones "Camión 1" a "Camión 3" y los productos públicos de prueba, de `base.js` ›
// `semilla()`. Nunca datos reales de clientes ni del archivo de Odoo. Es idempotente.
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { generateId } from "better-auth";
import { cifrarContrasena } from "../../src/lib/contrasenas";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { claveAccesoInterna, correoInterno, type SistemaCuenta } from "../../src/lib/cuentas";
import { PERMISOS } from "./base";

const PERMISOS_SITIO = PERMISOS.filter((p) => p.sistema === "sitio").map((p) => p.codigo);

type CuentaDemo = {
  numero: string;
  usuario: string;
  sistema: SistemaCuenta;
  rol: string;
  permisos: readonly string[];
  sedes: readonly string[];
  correo?: string;
};

/** Las 11 cuentas de `base.js` › `semilla()`. `ejemplo.03` existe en los dos sistemas (RN-54). */
export const CUENTAS_DEMO: CuentaDemo[] = [
  { numero: "01", usuario: "ejemplo.01", sistema: "ambos", rol: "Gerencia", permisos: [], sedes: [] },
  { numero: "02", usuario: "ejemplo.02", sistema: "ambos", rol: "Soporte", permisos: [], sedes: [] },
  {
    numero: "03",
    usuario: "ejemplo.03",
    sistema: "picking",
    rol: "Facturador",
    permisos: ["pk.facturacion"],
    sedes: ["XE"],
  },
  {
    numero: "04",
    usuario: "ejemplo.04",
    sistema: "picking",
    rol: "Facturador",
    permisos: ["pk.facturacion"],
    sedes: ["XE"],
  },
  { numero: "05", usuario: "ejemplo.05", sistema: "picking", rol: "Bodega", permisos: ["pk.bodega"], sedes: ["XE"] },
  {
    numero: "06",
    usuario: "ejemplo.06",
    sistema: "picking",
    rol: "Piloto",
    permisos: ["pk.ruta.propias"],
    sedes: ["XE"],
  },
  {
    numero: "07",
    usuario: "ejemplo.07",
    sistema: "picking",
    rol: "Piloto",
    permisos: ["pk.ruta.propias"],
    sedes: ["XE"],
  },
  {
    numero: "08",
    usuario: "ejemplo.08",
    sistema: "sitio",
    rol: "Administrativo",
    permisos: PERMISOS_SITIO,
    sedes: [],
    correo: "ejemplo08@correo.com",
  },
  {
    numero: "09",
    usuario: "ejemplo.09",
    sistema: "sitio",
    rol: "Operativo",
    permisos: ["sit.doc.ver", "sit.doc.descargar"],
    sedes: [],
  },
  { numero: "10", usuario: "ejemplo.10", sistema: "sitio", rol: "Vista general", permisos: ["sit.doc.ver"], sedes: [] },
  // La cuenta 11 del prototipo es la de ejemplo.03 en el sitio: mismo nombre y nombre de usuario.
  { numero: "03", usuario: "ejemplo.03", sistema: "sitio", rol: "Facturador", permisos: ["sit.doc.ver"], sedes: [] },
];

export const CAMIONES_DEMO = [
  { identificacion: "Camión 1", capacidadKg: "3400" },
  { identificacion: "Camión 2", capacidadKg: "3400" },
  { identificacion: "Camión 3", capacidadKg: "6000" },
] as const;

/** Los 28 productos públicos de `base.js` › `PRODUCTOS_PUB_BASE`, en el orden de sus imágenes `NN.webp`. */
export const PRODUCTOS_DEMO: [string, string[]][] = [
  ["Ácido Acético", ["Textil", "Hulera", "Limpieza", "Alimentación animal"]],
  ["Ácido Fórmico", ["Cuero", "Hulera"]],
  ["Ácido Oxálico", ["Medicamentos"]],
  ["Ácido Sulfúrico", ["Cuero", "Hulera", "Tratamiento de agua"]],
  ["Alguicida", []],
  ["Bicarbonato de Sodio", ["Medicamentos", "Alimentación animal"]],
  ["Blanqueador", []],
  ["Clarificante", []],
  ["Enzima Ácida INCO-EAL", []],
  ["Enzima Ácida INCO-EAL", []],
  ["Enzima Neutra INCO-ENL", []],
  ["Afirmador / Fijador Textil", []],
  ["Hidrosulfito de Sodio", ["Lavandería"]],
  ["Hidrosulfito de Sodio", ["Lavandería"]],
  [
    "Hipoclorito de Calcio en Tableta",
    ["Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  [
    "Hipoclorito de Calcio Granular",
    ["Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  ["Metabisulfito", ["Lavandería"]],
  ["Negro Sulfuroso High Quality", ["Textil"]],
  ["Peróxido de Hidrógeno", []],
  [
    "Soda Cáustica",
    ["Textil", "Hulera", "Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  ["Soda Ash", ["Cuero", "Textil", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"]],
  [
    "Soda Cáustica",
    ["Textil", "Hulera", "Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  [
    "Soda Cáustica",
    ["Textil", "Hulera", "Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  [
    "Soda Cáustica (POL)",
    ["Textil", "Hulera", "Medicamentos", "Limpieza", "Alimentación animal", "Tratamiento de agua", "Lavandería"],
  ],
  ["Sulfato de Aluminio", ["Tratamiento de agua"]],
  ["Sulfato de Sodio", ["Textil"]],
  ["Sulfuro de Sodio", ["Cuero", "Textil"]],
  ["Tricloro Granular y Polvo", ["Tratamiento de agua"]],
];

/** Dirección, teléfono, correo y WhatsApp de `base.js` › `semilla()` › `contacto`. */
export const CONTACTO_DEMO = {
  XE: {
    direccion: "7a Avenida 1-29 Zona 1, Cantón Llanos de Urbina, Cantel, Quetzaltenango",
    telefono: "7926-7951",
    correo: "facturacion@incovsa.com",
    whatsapp: "4073-0766",
  },
  GT: {
    direccion: '8a Calle "A" 27-70 zona 4, Mixco, Finca El Naranjo, Guatemala',
    telefono: "2436-0936 · 2436-0937",
    correo: "recepciongt@incovsa.com",
    whatsapp: "4073-2260",
  },
} as const;

export class ErrorSemillaDemo extends Error {}

/** Valida CLAVE_DEMO: las cuentas de ejemplo no se crean con una contraseña corta o vacía. */
export function validarClaveDemo(clave: string | undefined): string {
  if (!clave || clave.length < 8) {
    throw new ErrorSemillaDemo(
      "Falta la variable CLAVE_DEMO o tiene menos de 8 caracteres. Escríbala en su .env (vea .env.example) y vuelva a ejecutar `npm run semilla:demo`.",
    );
  }
  return clave;
}

type OpcionesDemo = {
  claveDemo: string | undefined;
  /** Carpeta raíz del repositorio: de ahí se leen las imágenes de prueba y se escribe almacenamiento-local/. */
  raiz?: string;
};

export async function sembrarDemo(prisma: PrismaClient, opciones: OpcionesDemo): Promise<void> {
  const claveDemo = validarClaveDemo(opciones.claveDemo);
  const raiz = opciones.raiz ?? process.cwd();

  const sedes = new Map((await prisma.sede.findMany()).map((s) => [s.prefijoOdoo, s.id]));
  const permisos = new Map((await prisma.permiso.findMany()).map((p) => [p.codigo, p.id]));
  const industrias = new Map((await prisma.industria.findMany()).map((i) => [i.nombre, i.id]));
  if (!sedes.has("XE") || permisos.size === 0 || industrias.size === 0) {
    throw new ErrorSemillaDemo("Falta la semilla base: ejecute primero `npm run db:semilla`.");
  }

  // scrypt es costoso a propósito (JG-26): las contraseñas, cada una con su sal, se cifran en paralelo.
  const contrasenas = await Promise.all(CUENTAS_DEMO.map(() => cifrarContrasena(claveDemo)));
  for (const [indice, cuenta] of CUENTAS_DEMO.entries())
    await sembrarCuenta(prisma, cuenta, contrasenas[indice]!, sedes, permisos);

  const quetzaltenango = sedes.get("XE")!;
  for (const camion of CAMIONES_DEMO) {
    const existe = await prisma.camion.findFirst({
      where: { identificacion: camion.identificacion, sedeId: quetzaltenango, eliminadoEn: null },
    });
    if (!existe) await prisma.camion.create({ data: { ...camion, sedeId: quetzaltenango } });
  }

  await sembrarProductos(prisma, raiz, industrias);

  for (const [prefijo, contacto] of Object.entries(CONTACTO_DEMO)) {
    await prisma.informacionContacto.update({ where: { sedeId: sedes.get(prefijo)! }, data: contacto });
  }
}

async function sembrarCuenta(
  prisma: PrismaClient,
  cuenta: CuentaDemo,
  password: string,
  sedes: Map<string, number>,
  permisos: Map<string, number>,
): Promise<void> {
  const clave = claveAccesoInterna(cuenta.sistema, cuenta.usuario);
  const datos = {
    name: `Usuario de ejemplo ${cuenta.numero}`,
    displayUsername: cuenta.usuario,
    sistema: cuenta.sistema,
    rol: cuenta.rol,
    correo: cuenta.correo ?? null,
    activo: true,
    eliminadoEn: null,
  };
  const usuario = await prisma.usuario.upsert({
    where: { username: clave },
    create: { id: generateId(), email: correoInterno(clave), username: clave, ...datos },
    update: datos,
  });

  // Contraseña cifrada con la función común de scrypt (RNF-03, JG-26). Se actualiza si CLAVE_DEMO cambió.
  const credencial = await prisma.cuenta.findFirst({ where: { userId: usuario.id, providerId: "credential" } });
  if (credencial) {
    await prisma.cuenta.update({ where: { id: credencial.id }, data: { password } });
  } else {
    await prisma.cuenta.create({
      data: { id: generateId(), accountId: usuario.id, providerId: "credential", userId: usuario.id, password },
    });
  }

  await prisma.usuarioPermiso.createMany({
    data: cuenta.permisos.map((codigo) => ({ usuarioId: usuario.id, permisoId: permisos.get(codigo)! })),
    skipDuplicates: true,
  });
  await prisma.usuarioSede.createMany({
    data: cuenta.sedes.map((prefijo) => ({ usuarioId: usuario.id, sedeId: sedes.get(prefijo)! })),
    skipDuplicates: true,
  });
}

/** Cada producto con su imagen `NN.webp` de JG-04, copiada al almacenamiento en disco (plan/convenciones.md §4.3). */
async function sembrarProductos(prisma: PrismaClient, raiz: string, industrias: Map<string, number>): Promise<void> {
  const origen = path.join(raiz, "pruebas", "fixtures", "catalogo");
  const destino = path.join(raiz, "almacenamiento-local", "imagenes", "demo");
  await mkdir(destino, { recursive: true });

  for (const [indice, [nombre, deIndustrias]] of PRODUCTOS_DEMO.entries()) {
    const archivo = `${String(indice + 1).padStart(2, "0")}.webp`;
    await copyFile(path.join(origen, archivo), path.join(destino, archivo));
    const url = `/api/imagenes/demo/${archivo}`;

    // Varios productos tienen el mismo nombre: cada uno se reconoce por su imagen.
    if (await prisma.imagen.findFirst({ where: { url } })) continue;
    await prisma.productoSitio.create({
      data: {
        nombre,
        industrias: { create: deIndustrias.map((n) => ({ industriaId: industrias.get(n)! })) },
        imagenes: { create: { area: "producto", posicion: 1, url } },
      },
    });
  }
}
