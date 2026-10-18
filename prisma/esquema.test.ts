// Pruebas de integración del esquema, las migraciones y las semillas (JG-03), contra la base de pruebas.
import { readFileSync } from "node:fs";
import { verifyPassword } from "better-auth/crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { limpiarTablasDeNegocio } from "../pruebas/bd";
import { listaPaises, sembrarBase } from "./semillas/base";
import { CUENTAS_DEMO, PRODUCTOS_DEMO, sembrarDemo } from "./semillas/demo";

const CLAVE_DEMO = "clave-de-prueba-123";

beforeEach(async () => {
  await limpiarTablasDeNegocio();
});

/** Mensaje y causa de un error de Prisma o del adaptador, para buscar en ellos la restricción que lo rechazó. */
async function errorDe(promesa: Promise<unknown>): Promise<string> {
  try {
    await promesa;
  } catch (error) {
    const partes = [String(error)];
    let causa: unknown = error;
    while (causa && typeof causa === "object") {
      partes.push(JSON.stringify(causa, Object.getOwnPropertyNames(causa)));
      causa = (causa as { cause?: unknown }).cause;
    }
    return partes.join("\n");
  }
  throw new Error("La base aceptó una operación que debía rechazar.");
}

let contador = 0;
async function crearUsuario(datos: Partial<Prisma.UsuarioUncheckedCreateInput> = {}) {
  const n = ++contador;
  return prisma.usuario.create({
    data: {
      id: `prueba-${n}`,
      name: `Usuario de prueba ${n}`,
      email: `picking.prueba.${n}@incovsa.invalid`,
      username: `picking.prueba.${n}`,
      displayUsername: `prueba.${n}`,
      sistema: "picking",
      rol: "Facturador",
      ...datos,
    },
  });
}

async function sedeXE() {
  return prisma.sede.findUniqueOrThrow({ where: { prefijoOdoo: "XE" } });
}

async function crearEnvio(datos: Partial<Prisma.EnvioUncheckedCreateInput> = {}) {
  const sede = await sedeXE();
  const estado = await prisma.estadoEnvio.findUniqueOrThrow({ where: { nombre: "En Preparación" } });
  const usuario = await crearUsuario();
  return prisma.envio.create({
    data: {
      sedeId: sede.id,
      tipo: "ruta",
      numero: 1,
      fechaEnvio: new Date("2026-10-17"),
      programadoPara: new Date("2026-10-17T14:00:00Z"),
      estadoId: estado.id,
      enviadoPorId: usuario.id,
      ...datos,
    },
  });
}

async function crearPedidoFacturado() {
  const sede = await sedeXE();
  const usuario = await crearUsuario();
  return prisma.pedidoFacturado.create({
    data: {
      sedeId: sede.id,
      numeroOdoo: "03539",
      referencia: "XE-IN/SALIDA/03539",
      cliente: "Cliente de prueba",
      sector: "Sector de prueba",
      posicion: 1,
      cargadoPorId: usuario.id,
    },
  });
}

// ------------------------------------------------------------------ Criterio 2: el diccionario de datos

type ColumnaDiccionario = {
  tabla: string;
  columna: string;
  tipo: string;
  longitud: string;
  pk: boolean;
  fk: string;
  nulo: boolean;
};

function leerDiccionario() {
  const texto = readFileSync("entregable-2/documento-2/02b-diccionario-de-datos.md", "utf8");
  const columnas: ColumnaDiccionario[] = [];
  const unicidades: { tabla: string; columnas: string[] }[] = [];
  for (const bloque of texto.split(/^### Tabla /m).slice(1)) {
    const tabla = bloque.slice(0, bloque.indexOf("\n")).trim();
    for (const linea of bloque.split("\n")) {
      if (linea.startsWith("| `")) {
        const [campo, tipo, longitud, pk, fk, nulo] = linea
          .split("|")
          .slice(1)
          .map((c) => c.trim());
        for (const columna of campo
          .replaceAll("`", "")
          .split(",")
          .map((c) => c.trim())) {
          columnas.push({ tabla, columna, tipo, longitud, pk: pk === "Sí", fk, nulo: nulo === "Sí" });
        }
      }
      if (linea.startsWith("Restricciones de unicidad:")) {
        for (const grupo of linea.matchAll(/`([^`]+)`/g)) {
          unicidades.push({ tabla, columnas: grupo[1].split(",").map((c) => c.trim()) });
        }
      }
    }
  }
  return { columnas, unicidades };
}

const TIPOS: Record<string, string> = {
  integer: "integer",
  bigint: "bigint",
  smallint: "smallint",
  text: "text",
  boolean: "boolean",
  jsonb: "jsonb",
  date: "date",
  time: "time without time zone",
  timestamptz: "timestamp with time zone",
  varchar: "character varying",
  char: "character",
  decimal: "numeric",
};

/** Donde specs/14 manda sobre el diccionario. */
const NULOS_DE_SPECS_14: Record<string, string> = {
  "detalle_pedido_facturado.lote": "lote vacío como texto vacío, no nulo (decisión 42)",
  "linea_preparacion.lote": "lote vacío como texto vacío, no nulo (decisión 42)",
};

describe("esquema de la base de datos", () => {
  it("las tablas, columnas, tipos, nulos, claves e índices únicos son los del diccionario", async () => {
    const { columnas, unicidades } = leerDiccionario();
    expect(columnas.length).toBeGreaterThan(200);

    const reales = await prisma.$queryRaw<
      {
        table_name: string;
        column_name: string;
        data_type: string;
        character_maximum_length: number | null;
        numeric_precision: number | null;
        numeric_scale: number | null;
        is_nullable: string;
      }[]
    >`SELECT table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, is_nullable
      FROM information_schema.columns WHERE table_schema = 'public'`;
    const porNombre = new Map(reales.map((c) => [`${c.table_name}.${c.column_name}`, c]));

    const claves = await prisma.$queryRaw<
      { tabla: string; columna: string; tipo: string; referencia: string | null }[]
    >`
      SELECT cl.relname::text AS tabla, a.attname::text AS columna, c.contype::text AS tipo, cf.relname::text AS referencia
      FROM pg_constraint c
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
      LEFT JOIN pg_class cf ON cf.oid = c.confrelid
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
      WHERE n.nspname = 'public' AND c.contype IN ('p', 'f')`;
    const pk = new Set(claves.filter((c) => c.tipo === "p").map((c) => `${c.tabla}.${c.columna}`));
    const fk = new Map(claves.filter((c) => c.tipo === "f").map((c) => [`${c.tabla}.${c.columna}`, c.referencia]));

    const diferencias: string[] = [];
    for (const d of columnas) {
      const nombre = `${d.tabla}.${d.columna}`;
      const real = porNombre.get(nombre);
      if (!real) {
        diferencias.push(`${nombre}: no existe`);
        continue;
      }
      if (real.data_type !== TIPOS[d.tipo])
        diferencias.push(`${nombre}: tipo ${real.data_type}, se esperaba ${d.tipo}`);
      if (d.tipo === "varchar" || d.tipo === "char") {
        if (real.character_maximum_length !== Number(d.longitud)) {
          diferencias.push(`${nombre}: longitud ${real.character_maximum_length}, se esperaba ${d.longitud}`);
        }
      }
      if (d.tipo === "decimal" && `${real.numeric_precision},${real.numeric_scale}` !== d.longitud) {
        diferencias.push(
          `${nombre}: decimal(${real.numeric_precision},${real.numeric_scale}), se esperaba ${d.longitud}`,
        );
      }
      const nulo = NULOS_DE_SPECS_14[nombre] ? false : d.nulo;
      if ((real.is_nullable === "YES") !== nulo)
        diferencias.push(`${nombre}: nulo ${real.is_nullable}, se esperaba ${d.nulo}`);
      if (pk.has(nombre) !== d.pk) diferencias.push(`${nombre}: clave primaria ${pk.has(nombre)}, se esperaba ${d.pk}`);
      if ((fk.get(nombre) ?? "") !== d.fk)
        diferencias.push(`${nombre}: FK ${fk.get(nombre)}, se esperaba ${d.fk || "ninguna"}`);
    }

    const indices = await prisma.$queryRaw<{ tabla: string; unico: boolean; parcial: boolean; columnas: string[] }[]>`
      SELECT t.relname::text AS tabla, ix.indisunique AS unico, ix.indpred IS NOT NULL AS parcial,
        array_agg(a.attname::text ORDER BY a.attname) AS columnas
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (ix.indkey)
      WHERE n.nspname = 'public'
      GROUP BY t.relname, i.relname, ix.indisunique, ix.indpred`;
    for (const u of unicidades) {
      // La unicidad de `imagen` usa índices parciales: se prueba aparte, con datos.
      if (u.tabla === "imagen") continue;
      const buscadas = [...u.columnas].sort().join(",");
      const existe = indices.some(
        (i) => i.tabla === u.tabla && i.unico && !i.parcial && i.columnas.join(",") === buscadas,
      );
      if (!existe) diferencias.push(`${u.tabla}: falta la unicidad (${u.columnas.join(", ")})`);
    }

    // Decisión 4: el número de Odoo tiene índice, pero no es único
    const numeroOdoo = indices.filter((i) => i.tabla === "pedido_facturado" && i.columnas.join(",") === "numero_odoo");
    if (numeroOdoo.length !== 1 || numeroOdoo[0].unico)
      diferencias.push("pedido_facturado.numero_odoo: índice no único");

    expect(diferencias).toEqual([]);
  });

  it("RN-52: rechaza dos envíos con la misma sede, tipo, fecha y número", async () => {
    const primero = await crearEnvio();
    const error = await errorDe(crearEnvio({ numero: primero.numero }));
    expect(error).toMatch(/P2002|envio_sede_id_tipo_fecha_envio_numero_key/);
    // Otro número, otro tipo u otra fecha sí se aceptan
    await expect(crearEnvio({ numero: 2 })).resolves.toBeDefined();
    await expect(crearEnvio({ tipo: "pedido" })).resolves.toBeDefined();
    await expect(crearEnvio({ fechaEnvio: new Date("2026-10-18") })).resolves.toBeDefined();
  });

  it("RN-51: rechaza dos líneas de preparación iguales del mismo envío, también con el lote vacío", async () => {
    const envio = await crearEnvio();
    const linea = {
      envioId: envio.id,
      producto: "SODA CAUSTICA (CHI-SAC/0025KG)",
      pesoConversionKg: "25",
      cantidadKg: "100",
      posicion: 1,
    };

    // Sin lote: se guarda como texto vacío (decisión 42)
    const sinLote = await prisma.lineaPreparacion.create({ data: linea });
    expect(sinLote.lote).toBe("");
    expect(await errorDe(prisma.lineaPreparacion.create({ data: linea }))).toMatch(
      /P2002|linea_preparacion_envio_id_producto_lote/,
    );
    expect(await errorDe(prisma.lineaPreparacion.create({ data: { ...linea, lote: "" } }))).toMatch(
      /P2002|linea_preparacion_envio_id_producto_lote/,
    );

    await prisma.lineaPreparacion.create({ data: { ...linea, lote: "A-001" } });
    expect(await errorDe(prisma.lineaPreparacion.create({ data: { ...linea, lote: "A-001" } }))).toMatch(
      /P2002|linea_preparacion_envio_id_producto_lote/,
    );

    // Otro Peso de Conversión es otra línea
    await expect(prisma.lineaPreparacion.create({ data: { ...linea, pesoConversionKg: "50" } })).resolves.toBeDefined();
  });

  it("RN-50: rechaza cantidades y Pesos de Conversión menores o iguales a cero", async () => {
    const pedido = await crearPedidoFacturado();
    const detalle = {
      pedidoFacturadoId: pedido.id,
      producto: "SODA ASH (CHI-SAC/0025KG)",
      pesoConversionKg: "25",
      cantidadKg: "50",
      orden: 1,
    };
    for (const valor of ["0", "-1"]) {
      expect(await errorDe(prisma.detallePedidoFacturado.create({ data: { ...detalle, cantidadKg: valor } }))).toMatch(
        /detalle_pedido_facturado_cantidad_kg_positiva/,
      );
      expect(
        await errorDe(prisma.detallePedidoFacturado.create({ data: { ...detalle, pesoConversionKg: valor } })),
      ).toMatch(/detalle_pedido_facturado_peso_conversion_kg_positivo/);
    }
    const creado = await prisma.detallePedidoFacturado.create({ data: { ...detalle, cantidadKg: "0.001" } });
    expect(creado.cantidadKg.toString()).toBe("0.001");
    expect(creado.lote).toBe("");

    const envio = await crearEnvio();
    const linea = {
      envioId: envio.id,
      producto: "SODA ASH (CHI-SAC/0025KG)",
      pesoConversionKg: "25",
      cantidadKg: "50",
      posicion: 1,
    };
    expect(await errorDe(prisma.lineaPreparacion.create({ data: { ...linea, cantidadKg: "0" } }))).toMatch(
      /linea_preparacion_cantidad_kg_positiva/,
    );
    expect(await errorDe(prisma.lineaPreparacion.create({ data: { ...linea, pesoConversionKg: "0" } }))).toMatch(
      /linea_preparacion_peso_conversion_kg_positivo/,
    );

    const entrega = { envioId: envio.id, cliente: "Cliente de prueba", sector: "Sector", totalKg: "0", orden: 1 };
    expect(await errorDe(prisma.entregaRuta.create({ data: entrega }))).toMatch(/entrega_ruta_total_kg_positivo/);
  });

  it("rechaza capacidades de camión menores o iguales a cero", async () => {
    const sede = await sedeXE();
    for (const capacidadKg of ["0", "-3400"]) {
      expect(
        await errorDe(prisma.camion.create({ data: { identificacion: "Camión X", capacidadKg, sedeId: sede.id } })),
      ).toMatch(/camion_capacidad_kg_positiva/);
    }
    await expect(
      prisma.camion.create({ data: { identificacion: "Camión X", capacidadKg: "3400", sedeId: sede.id } }),
    ).resolves.toBeDefined();
  });

  it("RN-56: rechaza imágenes y valores con posición fuera de 1 a 5, y dos imágenes en la misma posición", async () => {
    for (const posicion of [0, 6]) {
      expect(
        await errorDe(prisma.imagen.create({ data: { area: "portada", posicion, url: "/api/imagenes/x.webp" } })),
      ).toMatch(/imagen_posicion_1_a_5/);
    }
    expect(await errorDe(prisma.valor.create({ data: { posicion: 6 } }))).toMatch(/valor_posicion_1_a_5/);

    // La unicidad del diccionario (área, dueño, posición), con los dueños vacíos de la portada
    await prisma.imagen.create({ data: { area: "portada", posicion: 1, url: "/api/imagenes/a.webp" } });
    expect(
      await errorDe(prisma.imagen.create({ data: { area: "portada", posicion: 1, url: "/api/imagenes/b.webp" } })),
    ).toMatch(/P2002|imagen_area_posicion_key/);
    await expect(
      prisma.imagen.create({ data: { area: "mision", posicion: 1, url: "/api/imagenes/c.webp" } }),
    ).resolves.toBeDefined();

    // Y con un dueño: dos productos distintos pueden usar la posición 1, el mismo producto no
    const [a, b] = await Promise.all([
      prisma.productoSitio.create({ data: { nombre: "Producto A" } }),
      prisma.productoSitio.create({ data: { nombre: "Producto B" } }),
    ]);
    await prisma.imagen.create({
      data: { area: "producto", productoSitioId: a.id, posicion: 1, url: "/api/imagenes/d.webp" },
    });
    await prisma.imagen.create({
      data: { area: "producto", productoSitioId: b.id, posicion: 1, url: "/api/imagenes/e.webp" },
    });
    expect(
      await errorDe(
        prisma.imagen.create({
          data: { area: "producto", productoSitioId: a.id, posicion: 1, url: "/api/imagenes/f.webp" },
        }),
      ),
    ).toMatch(/P2002|imagen_producto_sitio_posicion_key/);
  });

  it("decisión 26: rechaza un sistema distinto de sitio, picking o ambos", async () => {
    expect(await errorDe(crearUsuario({ sistema: "panel" }))).toMatch(/usuario_sistema_valido/);
    for (const sistema of ["sitio", "picking", "ambos"]) await expect(crearUsuario({ sistema })).resolves.toBeDefined();
  });

  it("rechaza un tipo de envío distinto de ruta o pedido", async () => {
    expect(await errorDe(crearEnvio({ tipo: "camion" }))).toMatch(/envio_tipo_valido/);
  });

  it("RN-54: el nombre de usuario es único por sistema", async () => {
    await crearUsuario({ displayUsername: "maria.argueta", sistema: "picking", username: "picking.maria.argueta" });
    await expect(
      crearUsuario({ displayUsername: "maria.argueta", sistema: "sitio", username: "sitio.maria.argueta" }),
    ).resolves.toBeDefined();
    expect(await errorDe(crearUsuario({ displayUsername: "maria.argueta", sistema: "picking" }))).toMatch(
      /P2002|usuario_display_username_sistema_key/,
    );
  });

  it("decisión 4: el número de Odoo se puede repetir", async () => {
    await crearPedidoFacturado();
    await expect(crearPedidoFacturado()).resolves.toBeDefined();
  });

  it("RN-39: UPDATE, DELETE y TRUNCATE sobre la bitácora fallan con el error del disparador", async () => {
    const registro = await prisma.bitacora.create({
      data: { sistema: "picking", operacion: "Prueba", detalle: { a: 1 } },
    });
    expect(
      await errorDe(prisma.bitacora.update({ where: { id: registro.id }, data: { operacion: "Cambiada" } })),
    ).toMatch(/La bitácora no se edita ni se borra \(RN-39\): UPDATE/);
    expect(await errorDe(prisma.bitacora.delete({ where: { id: registro.id } }))).toMatch(
      /La bitácora no se edita ni se borra \(RN-39\): DELETE/,
    );
    expect(await errorDe(prisma.$executeRaw`TRUNCATE TABLE "bitacora"`)).toMatch(
      /La bitácora no se edita ni se borra \(RN-39\): TRUNCATE/,
    );
    expect(await prisma.bitacora.count()).toBe(1);
  });

  it("RN-57: al insertar un registro sin creado_en, la base pone la fecha y hora actuales", async () => {
    const [fila] = await prisma.$queryRaw<{ creado_en: Date; actualizado_en: Date; ahora: Date }[]>`
      INSERT INTO "camion" ("identificacion", "capacidad_kg", "sede_id")
      VALUES ('Camión de prueba', 1000, (SELECT "id" FROM "sede" WHERE "prefijo_odoo" = 'XE'))
      RETURNING "creado_en", "actualizado_en", now()::timestamptz(3) AS ahora`;
    expect(fila.creado_en.getTime()).toBe(fila.ahora.getTime());
    expect(fila.actualizado_en.getTime()).toBe(fila.ahora.getTime());
    expect(Math.abs(fila.creado_en.getTime() - Date.now())).toBeLessThan(60_000);
  });

  it("los hijos que dice el diccionario se borran en cascada; los demás impiden borrar al padre", async () => {
    const pedido = await crearPedidoFacturado();
    await prisma.detallePedidoFacturado.create({
      data: { pedidoFacturadoId: pedido.id, producto: "X", pesoConversionKg: "25", cantidadKg: "25", orden: 1 },
    });
    await prisma.pedidoFacturado.delete({ where: { id: pedido.id } });
    expect(await prisma.detallePedidoFacturado.count()).toBe(0);

    const producto = await prisma.productoSitio.create({ data: { nombre: "Producto" } });
    const industria = await prisma.industria.findFirstOrThrow();
    await prisma.productoIndustria.create({ data: { productoSitioId: producto.id, industriaId: industria.id } });
    expect(await errorDe(prisma.industria.delete({ where: { id: industria.id } }))).toMatch(
      /P2003|foreign key|producto_industria/i,
    );
  });
});

// ------------------------------------------------------------------ Semillas

describe("semillas", () => {
  it("la semilla base se puede ejecutar dos veces sin duplicar nada", async () => {
    await sembrarBase(prisma);
    await sembrarBase(prisma);
    const conteos = {
      sedes: await prisma.sede.count(),
      permisos: await prisma.permiso.count(),
      estados: await prisma.estadoEnvio.count(),
      opcionesEnvio: await prisma.opcionEnvio.count(),
      industrias: await prisma.industria.count(),
      departamentos: await prisma.departamento.count(),
      municipios: await prisma.municipio.count(),
      paises: await prisma.pais.count(),
      contenidos: await prisma.contenidoInstitucional.count(),
      valores: await prisma.valor.count(),
      configuraciones: await prisma.configuracionSitio.count(),
      informacionContacto: await prisma.informacionContacto.count(),
    };
    expect(conteos).toEqual({
      sedes: 3,
      permisos: 16,
      estados: 4,
      opcionesEnvio: 6,
      industrias: 9,
      departamentos: 22,
      municipios: 340,
      paises: listaPaises().length,
      contenidos: 3,
      valores: 5,
      configuraciones: 1,
      informacionContacto: 2,
    });
  });

  it("la semilla base carga los datos de specs/03, specs/05 y specs/13", async () => {
    const sedes = await prisma.sede.findMany({ orderBy: { id: "asc" } });
    expect(sedes.map((s) => [s.prefijoOdoo, s.nombre, s.tieneOficina])).toEqual([
      ["XE", "Quetzaltenango", true],
      ["GT", "Guatemala", true],
      ["ESC", "Escuintla", false],
    ]);
    const opciones = await prisma.opcionEnvio.findMany({ include: { sede: true } });
    expect(opciones.map((o) => `${o.sede.prefijoOdoo}.${o.tipo}`).sort()).toEqual([
      "ESC.camion",
      "ESC.recoge",
      "GT.camion",
      "GT.recoge",
      "XE.camion",
      "XE.recoge",
    ]);
    expect((await prisma.estadoEnvio.findMany({ orderBy: { id: "asc" } })).map((e) => e.nombre)).toEqual([
      "En Preparación",
      "Despachado",
      "En Ruta",
      "Entregado",
    ]);
    expect((await prisma.permiso.findMany()).map((p) => p.codigo).sort()).toEqual(
      [
        "sit.contenido",
        "sit.industrias",
        "sit.catalogo",
        "sit.noticias",
        "sit.contacto",
        "sit.sol.ver",
        "sit.sol.gestionar",
        "sit.doc.ver",
        "sit.doc.descargar",
        "sit.doc.gestionar",
        "pk.facturacion",
        "pk.bodega",
        "pk.ruta.propias",
        "pk.ruta.todas",
        "pk.reportes",
        "pk.cfg.camiones",
      ].sort(),
    );
    expect((await prisma.industria.findMany({ orderBy: { orden: "asc" } })).map((i) => i.nombre)).toEqual([
      "Cuero",
      "Textil",
      "Cerería",
      "Hulera",
      "Medicamentos",
      "Limpieza",
      "Alimentación animal",
      "Tratamiento de agua",
      "Lavandería",
    ]);
    const contenido = Object.fromEntries(
      (await prisma.contenidoInstitucional.findMany()).map((c) => [c.seccion, c.texto]),
    );
    expect(contenido.mision).toMatch(/^Ser el aliado estratégico .* grupos de interés\.$/);
    expect(contenido.vision).toMatch(/^Ser referentes .* administración responsable y transparente .* largo plazo\.$/);
    expect(contenido.historia).toBe("");
    expect(await prisma.configuracionSitio.findUniqueOrThrow({ where: { id: 1 } })).toMatchObject({
      logotipoIncovsaUrl: null,
      logotipoInquisercaUrl: null,
    });
    expect((await prisma.valor.findMany()).every((v) => v.imagenUrl === null)).toBe(true);
    const contactos = await prisma.informacionContacto.findMany({ include: { sede: true } });
    for (const c of contactos) {
      expect(c.mapaUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
      expect([c.direccion, c.telefono, c.correo, c.whatsapp, c.horario]).toEqual(["", "", "", "", null]);
    }
    expect(contactos.map((c) => c.sede.prefijoOdoo).sort()).toEqual(["GT", "XE"]);
    expect(await prisma.pais.findUniqueOrThrow({ where: { codigo: "GT" } })).toMatchObject({ nombre: "Guatemala" });
    expect(await prisma.pais.findUniqueOrThrow({ where: { codigo: "MX" } })).toMatchObject({ nombre: "México" });
  });

  it("la semilla base no sobrescribe el contenido que INCOVSA editó", async () => {
    await prisma.contenidoInstitucional.update({ where: { seccion: "historia" }, data: { texto: "Historia editada" } });
    await sembrarBase(prisma);
    expect((await prisma.contenidoInstitucional.findUniqueOrThrow({ where: { seccion: "historia" } })).texto).toBe(
      "Historia editada",
    );
  });

  it("la semilla de demostración se detiene si CLAVE_DEMO falta o tiene menos de 8 caracteres", async () => {
    await expect(sembrarDemo(prisma, { claveDemo: undefined })).rejects.toThrow(/CLAVE_DEMO/);
    await expect(sembrarDemo(prisma, { claveDemo: "1234567" })).rejects.toThrow(/menos de 8 caracteres/);
    expect(await prisma.usuario.count()).toBe(0);
  });

  it("la semilla de demostración se puede ejecutar dos veces sin duplicar nada", { timeout: 60_000 }, async () => {
    await sembrarDemo(prisma, { claveDemo: CLAVE_DEMO });
    await sembrarDemo(prisma, { claveDemo: CLAVE_DEMO });
    const industriasPorProducto = PRODUCTOS_DEMO.reduce((total, [, industrias]) => total + industrias.length, 0);
    expect({
      usuarios: await prisma.usuario.count(),
      credenciales: await prisma.cuenta.count(),
      camiones: await prisma.camion.count(),
      productos: await prisma.productoSitio.count(),
      imagenes: await prisma.imagen.count(),
      productoIndustria: await prisma.productoIndustria.count(),
    }).toEqual({
      usuarios: 11,
      credenciales: 11,
      camiones: 3,
      productos: 28,
      imagenes: 28,
      productoIndustria: industriasPorProducto,
    });

    const camiones = await prisma.camion.findMany({ include: { sede: true }, orderBy: { id: "asc" } });
    expect(camiones.map((c) => [c.identificacion, c.capacidadKg.toString(), c.sede.prefijoOdoo])).toEqual([
      ["Camión 1", "3400", "XE"],
      ["Camión 2", "3400", "XE"],
      ["Camión 3", "6000", "XE"],
    ]);
    const imagen = await prisma.imagen.findFirstOrThrow({
      where: { url: "/api/imagenes/demo/01.webp" },
      include: { productoSitio: true },
    });
    expect(imagen).toMatchObject({ area: "producto", posicion: 1 });
    expect(imagen.productoSitio).toMatchObject({
      nombre: "Ácido Acético",
      descripcion: null,
      presentacion: null,
      paisesOrigen: null,
    });
    const xe = await prisma.informacionContacto.findFirstOrThrow({ where: { sede: { prefijoOdoo: "XE" } } });
    expect(xe).toMatchObject({ telefono: "7926-7951", correo: "facturacion@incovsa.com", whatsapp: "4073-0766" });
    expect(xe.mapaUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/embed/);
  });

  it(
    "RN-54: después de la semilla de demostración, ejemplo.03 tiene dos cuentas y ejemplo.01 y ejemplo.02 son de ambos sistemas",
    { timeout: 60_000 },
    async () => {
      await sembrarDemo(prisma, { claveDemo: CLAVE_DEMO });

      const ejemplo03 = await prisma.usuario.findMany({
        where: { displayUsername: "ejemplo.03" },
        orderBy: { sistema: "asc" },
      });
      expect(ejemplo03.map((u) => [u.sistema, u.username, u.name])).toEqual([
        ["picking", "picking.ejemplo.03", "Usuario de ejemplo 03"],
        ["sitio", "sitio.ejemplo.03", "Usuario de ejemplo 03"],
      ]);
      for (const usuario of ["ejemplo.01", "ejemplo.02"]) {
        const cuenta = await prisma.usuario.findMany({ where: { displayUsername: usuario } });
        expect(cuenta.map((u) => [u.sistema, u.username])).toEqual([["ambos", `ambos.${usuario}`]]);
      }

      // Permisos y sedes de base.js › semilla()
      const facturador = await prisma.usuario.findUniqueOrThrow({
        where: { username: "picking.ejemplo.03" },
        include: { permisos: { include: { permiso: true } }, sedes: { include: { sede: true } } },
      });
      expect(facturador.rol).toBe("Facturador");
      expect(facturador.permisos.map((p) => p.permiso.codigo)).toEqual(["pk.facturacion"]);
      expect(facturador.sedes.map((s) => s.sede.prefijoOdoo)).toEqual(["XE"]);
      const administrativo = await prisma.usuario.findUniqueOrThrow({
        where: { username: "sitio.ejemplo.08" },
        include: { permisos: true },
      });
      expect(administrativo.permisos).toHaveLength(10);
      expect(administrativo.correo).toBe("ejemplo08@correo.com");
      expect(CUENTAS_DEMO).toHaveLength(11);

      // La contraseña es la de CLAVE_DEMO, cifrada con la función de Better Auth
      const credencial = await prisma.cuenta.findFirstOrThrow({ where: { usuario: { username: "ambos.ejemplo.01" } } });
      expect(credencial.providerId).toBe("credential");
      expect(credencial.password).not.toContain(CLAVE_DEMO);
      expect(await verifyPassword({ hash: credencial.password!, password: CLAVE_DEMO })).toBe(true);
    },
  );
});

// ------------------------------------------------------------------ Criterio 10

describe("base de pruebas", () => {
  it("npm test usa DATABASE_URL_PRUEBAS, nunca la base de desarrollo", async () => {
    const urlPruebas = process.env.DATABASE_URL_PRUEBAS;
    expect(urlPruebas).toBeTruthy();
    expect(process.env.DATABASE_URL).toBe(urlPruebas);
    const [{ base }] = await prisma.$queryRaw<{ base: string }[]>`SELECT current_database()::text AS base`;
    expect(base).toBe(new URL(urlPruebas!).pathname.slice(1));
  });
});
