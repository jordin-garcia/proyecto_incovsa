import { strykerPlugins as oficiales } from "@stryker-mutator/vitest-runner";
import { TestStatus, DryRunStatus } from "@stryker-mutator/api/test-runner";
import { relative } from "node:path";

// Stryker 10 une los nombres de suites con espacios. Vitest 5 filtra por task.fullTestName,
// que usa " > ". La cobertura y los ID permanecen intactos; solo se traduce el filtro de ejecución.
const oficial = oficiales.find((plugin) => plugin.name === "vitest");

export function adaptarRunner(runner) {
  const nombres = new Map();
  const ejecutar = runner.run.bind(runner);
  runner.run = async function (opciones = {}) {
    const testIds = opciones.testIds?.map((id) => {
      if (!nombres.has(id)) throw new Error(`No se pudo traducir la prueba de mutación: ${id}`);
      return nombres.get(id);
    });
    const resultado = await ejecutar({ ...opciones, ...(testIds ? { testIds } : {}) });
    function registrar(tarea) {
      if (tarea.type === "test") {
        const partes = [tarea.name];
        for (let suite = tarea.suite; suite; suite = suite.suite) partes.unshift(suite.name);
        const archivo = relative(process.cwd(), tarea.file.filepath).replaceAll("\\", "/");
        if (typeof tarea.fullTestName !== "string")
          throw new Error("El adaptador de mutación requiere task.fullTestName de Vitest 5.");
        nombres.set(`${archivo}#${partes.join(" ").trim()}`, `${archivo}#${tarea.fullTestName}`);
      }
      for (const hija of tarea.tasks ?? []) registrar(hija);
    }
    for (const archivo of runner.ctx.state.getFiles()) registrar(archivo);
    // No convertir una selección vacía en un falso superviviente.
    if (
      resultado.status === DryRunStatus.Complete &&
      !resultado.tests?.some((prueba) => [TestStatus.Success, TestStatus.Failed].includes(prueba.status))
    ) {
      throw new Error("El filtro de mutación no ejecutó ninguna prueba de Vitest.");
    }
    return resultado;
  };
  return runner;
}

function crear(...argumentos) {
  return adaptarRunner(oficial.factory(...argumentos));
}
crear.inject = oficial.factory.inject;

export const strykerPlugins = [{ kind: oficial.kind, name: "vitest-incovsa", factory: crear }];
