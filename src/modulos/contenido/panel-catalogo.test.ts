import { beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import type { SesionActual } from "@/lib/sesion";
import { limpiarTablasDeNegocio } from "../../../pruebas/bd";
import { leerCatalogoSitio } from "./catalogo";
import { leerCatalogoPanel, leerIndustriasPanel } from "./servicio-catalogo";
import { leerImagenLocal } from "@/modulos/almacenamiento/servicio";
const estado = vi.hoisted(() => ({ sesion: null as SesionActual | null }));
vi.mock("@/lib/sesion", () => ({ obtenerSesion: async () => estado.sesion }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { publicarIndustria, publicarProducto, eliminarProducto } from "./acciones-catalogo";
import { recibirGaleria } from "./multipart-catalogo";
import { esquemaProductoPanel } from "./esquemas-catalogo";
const sesion: SesionActual = {
  sistema: "sitio",
  usuario: { id: "catalogo-prueba", usuario: "catalogo", nombre: "Prueba", rol: "Editor" },
  permisos: ["sit.catalogo", "sit.industrias"],
  sedes: [],
};
function formulario(datos: unknown) {
  const f = new FormData();
  f.set("datos", JSON.stringify(datos));
  return f;
}
const producto = {
  nombre: "Producto de prueba",
  descripcion: "Descripción",
  presentacion: "Saco",
  paisesOrigen: "México",
  industrias: [] as number[],
  imagenes: [] as (string | number)[],
};

it("RN-56 / H-08: el sexto elemento único falla por el límite y cinco referencias distintas sí son válidas", () => {
  const imagenes = Array.from({ length: 6 }, (_, i) => `/api/imagenes/demo/${i + 1}.webp`);
  expect(esquemaProductoPanel.safeParse({ ...producto, imagenes: imagenes.slice(0, 5) }).success).toBe(true);
  const resultado = esquemaProductoPanel.safeParse({ ...producto, imagenes });
  expect(resultado.success).toBe(false);
  if (resultado.success) throw new Error("Se aceptó una sexta imagen");
  expect(resultado.error.issues).toEqual([
    expect.objectContaining({ code: "too_big", path: ["imagenes"], maximum: 5 }),
  ]);
});
beforeEach(async () => {
  await limpiarTablasDeNegocio();
  await prisma.usuario.create({
    data: {
      id: sesion.usuario.id,
      name: "Prueba",
      username: "catalogo.prueba",
      displayUsername: "catalogo.prueba",
      email: "catalogo@prueba.invalid",
      sistema: "sitio",
      rol: "Editor",
    },
  });
  estado.sesion = sesion;
});
it("RF-SW-25: todas las acciones rechazan sin sesión, sin permiso y otro sistema antes de validar", async () => {
  for (const actual of [null, { ...sesion, permisos: [] }, { ...sesion, sistema: "picking" as const }]) {
    estado.sesion = actual;
    for (const resultado of [
      await publicarProducto(formulario({})),
      await publicarIndustria(formulario({})),
      await eliminarProducto(1),
    ])
      expect(resultado).toEqual({ ok: false, error: "No tiene permisos para acceder a este módulo." });
  }
  expect(await prisma.bitacora.count()).toBe(0);
});
it("RF-SW-23 / RN-39: crea, edita y elimina relaciones públicas y registra cada operación", async () => {
  const industrias = await prisma.industria.findMany({ take: 2, orderBy: { orden: "asc" } });
  const creado = await publicarProducto(formulario({ ...producto, industrias: industrias.map((i) => i.id) }));
  expect(creado.ok).toBe(true);
  if (!creado.ok) throw new Error("No creado");
  const id = creado.datos.id;
  expect((await leerCatalogoSitio()).productos.find((p) => p.id === id)?.industrias.map((i) => i.id)).toEqual(
    industrias.map((i) => i.id),
  );
  expect(
    (await publicarProducto(formulario({ ...producto, id, nombre: "Editado", industrias: [industrias[1]!.id] }))).ok,
  ).toBe(true);
  expect((await leerCatalogoSitio()).productos.find((p) => p.id === id)?.nombre).toBe("Editado");
  expect((await eliminarProducto(id)).ok).toBe(true);
  expect(await prisma.productoSitio.findUnique({ where: { id } })).toBeNull();
  expect((await prisma.bitacora.findMany({ orderBy: { id: "asc" } })).map((b) => b.operacion)).toEqual([
    "Creación de producto público",
    "Edición de producto público",
    "Eliminación de producto público",
  ]);
});
it("RF-SW-07 / RN-56: publica descripción y galería de industria y limpia la imagen retirada", async () => {
  const industria = await prisma.industria.findFirstOrThrow();
  const png = await sharp({ create: { width: 10, height: 10, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  const f = formulario({ id: industria.id, descripcion: "Descripción publicada", imagenes: [0] });
  f.append("imagenes", new File([new Uint8Array(png)], "imagen.png"));
  expect((await publicarIndustria(f)).ok).toBe(true);
  const publicada = (await leerCatalogoSitio()).industrias.find((i) => i.id === industria.id)!;
  expect(publicada.descripcion).toBe("Descripción publicada");
  expect(publicada.imagenes).toHaveLength(1);
  expect((await publicarIndustria(formulario({ id: industria.id, descripcion: "Sin imagen", imagenes: [] }))).ok).toBe(
    true,
  );
  expect(await leerImagenLocal(publicada.imagenes[0]!.replace("/api/imagenes/", ""))).toBeNull();
  expect((await prisma.bitacora.findFirstOrThrow()).operacion).toBe("Cambio de contenido del sitio");
});
it("RN-56 / RNF-05: rechaza sexta imagen, referencias ajenas, índices duplicados, industria inexistente y nombre vacío", async () => {
  for (const datos of [
    { ...producto, nombre: " " },
    { ...producto, imagenes: Array.from({ length: 6 }, (_, i) => `/api/imagenes/demo/${i + 1}.webp`) },
    { ...producto, imagenes: ["https://ajena.invalid/a.webp"] },
    { ...producto, imagenes: [0, 0] },
    { ...producto, industrias: [2147483647] },
  ])
    expect((await publicarProducto(formulario(datos))).ok).toBe(false);
  expect(await prisma.bitacora.count()).toBe(0);
});

it("RNF-05 / H-05: multipart usa el origen público configurado detrás del proxy y rechaza un origen ajeno", async () => {
  vi.stubEnv("BETTER_AUTH_URL", "https://incovsa.test");
  try {
    const industria = await prisma.industria.findFirstOrThrow();
    for (const [tipo, datos] of [
      ["industria", { id: industria.id, descripcion: "Detrás del proxy", imagenes: [] }],
      ["producto", producto],
    ] as const) {
      for (const origin of ["http://localhost:3000", "https://ajeno.invalid"]) {
        expect(
          (
            await recibirGaleria(
              new Request("http://localhost:3000/publicar", {
                method: "POST",
                headers: { origin },
                body: formulario(datos),
              }),
              tipo,
            )
          ).status,
        ).toBe(403);
      }
      const respuesta = await recibirGaleria(
        new Request("http://localhost:3000/publicar", {
          method: "POST",
          headers: { origin: "https://incovsa.test" },
          body: formulario(datos),
        }),
        tipo,
      );
      expect(respuesta.status).toBe(200);
      expect(await respuesta.json()).toMatchObject({ ok: true });
    }
  } finally {
    vi.unstubAllEnvs();
  }
});
it("RF-SW-23: eliminar producto borra físicamente su galería", async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 4, background: "transparent" } })
    .png()
    .toBuffer();
  const f = formulario({ ...producto, imagenes: [0] });
  f.append("imagenes", new File([new Uint8Array(png)], "imagen.png"));
  const creado = await publicarProducto(f);
  expect(creado.ok).toBe(true);
  if (!creado.ok) throw new Error("No creado");
  const imagen = await prisma.imagen.findFirstOrThrow({ where: { productoSitioId: creado.datos.id } });
  expect((await eliminarProducto(creado.datos.id)).ok).toBe(true);
  expect(await leerImagenLocal(imagen.url.replace("/api/imagenes/", ""))).toBeNull();
});

it("RF-SW-25: los permisos de industrias y catálogo son independientes y protegen también las lecturas", async () => {
  await expect(leerCatalogoPanel({ ...sesion, permisos: ["sit.industrias"] })).rejects.toThrow("No tiene permisos");
  await expect(leerIndustriasPanel({ ...sesion, permisos: ["sit.catalogo"] })).rejects.toThrow("No tiene permisos");
  expect((await leerIndustriasPanel(sesion)).length).toBe(9);
  expect((await leerCatalogoPanel(sesion)).industrias).toHaveLength(9);
});

it("RN-56 / RNF-05: reordena cinco imágenes propias y no cambia el registro al conservar una imagen ajena", async () => {
  const p = await prisma.productoSitio.create({ data: { nombre: "Original" } });
  const urls = Array.from({ length: 5 }, (_, i) => `/api/imagenes/demo/0${i + 1}.webp`);
  await prisma.imagen.createMany({
    data: urls.map((url, i) => ({ area: "producto", productoSitioId: p.id, posicion: i + 1, url })),
  });
  expect((await publicarProducto(formulario({ ...producto, id: p.id, imagenes: [...urls].reverse() }))).ok).toBe(true);
  expect(
    (await prisma.imagen.findMany({ where: { productoSitioId: p.id }, orderBy: { posicion: "asc" } })).map(
      (i) => i.url,
    ),
  ).toEqual([...urls].reverse());
  expect(
    (
      await publicarProducto(
        formulario({ ...producto, id: p.id, nombre: "No guardar", imagenes: ["/api/imagenes/demo/ajena.webp"] }),
      )
    ).ok,
  ).toBe(false);
  expect((await prisma.productoSitio.findUniqueOrThrow({ where: { id: p.id } })).nombre).toBe(producto.nombre);
  expect(await prisma.bitacora.count()).toBe(1);
});
