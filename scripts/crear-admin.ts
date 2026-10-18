import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

try {
  process.loadEnvFile();
} catch {
  /* Variables del entorno */
}

async function principal() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error("Ejecute crear-admin en una terminal interactiva.");
  let oculta = false;
  // readline conserva la edición del campo; el destino suprime TODO eco durante las dos contraseñas.
  const salida = new Writable({
    write(chunk, encoding, callback) {
      if (!oculta) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const terminal = createInterface({ input: process.stdin, output: salida, terminal: true, historySize: 0 });
  try {
    const nombre = await terminal.question("Nombre completo: ");
    const usuario = await terminal.question("Nombre de usuario: ");
    const rol = await terminal.question("Rol (Gerencia o Soporte): ");
    const preguntarClave = async (texto: string) => {
      process.stdout.write(texto);
      oculta = true;
      try {
        return await terminal.question("");
      } finally {
        oculta = false;
        process.stdout.write("\n");
      }
    };
    const clave = await preguntarClave("Contraseña (mínimo 8 caracteres): ");
    const confirmarClave = await preguntarClave("Repita la contraseña: ");
    const { crearAdministrador } = await import("./administrador");
    await crearAdministrador({ nombre, usuario, rol, clave, confirmarClave });
    console.log("Cuenta administradora creada para los dos sistemas.");
  } finally {
    terminal.close();
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  }
}

void principal().catch(() => {
  // Nunca imprimir el objeto de error: puede contener entradas de validación o detalles de conexión.
  console.error("No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.");
  process.exitCode = 1;
});
