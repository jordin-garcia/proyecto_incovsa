# Verificación de JG-10 · avance del 20/10/2026

**La tarea sigue pendiente: no está integrada ni cumple todavía la definición de terminado.**

## Entorno

Windows, Node.js 24.13.0, npm 11.19.0, PostgreSQL 18.6. `node scripts/verificar-entorno.mjs` terminó con «El equipo tiene todo lo necesario». Git y GitHub CLI identifican a `jordin-garcia`. Se consultaron Context7 (Next.js 16, React 19, Vitest 5, Playwright, Zod 4 y EventSource), shadcn y next-devtools. Playwright abrió el prototipo de Bodega y tomó capturas en los tres tamaños.

Las pruebas usan un PostgreSQL desechable en `127.0.0.1:55440`, con bases distintas `incovsa_jg10` e `incovsa_jg10_pruebas`. No se leyeron ni modificaron archivos `.env`, datos o credenciales de INCOVSA. Las variables se proporcionaron al proceso con un lanzador temporal fuera del repositorio.

## Resultados obtenidos

| Comprobación | Resultado |
|---|---|
| `npm ci` | 687 paquetes instalados, cliente Prisma generado, 0 vulnerabilidades |
| `npm run db:aplicar` | Dos migraciones aplicadas desde cero en la base desechable de desarrollo |
| `npm run db:semilla` y `npm run semilla:demo` | Semilla base y datos de demostración cargados |
| Fase roja del transporte | Ocho pruebas fallaron por ausencia del canal y la conexión SSE; la suite de ruta falló porque el endpoint aún no existía. Las dos pruebas existentes de consulta periódica pasaron. Se usó una configuración temporal para aislar estas pruebas de transporte mientras acababa `npm ci` |
| `npm test -- src/modulos/tiempo-real` | **4 archivos y 16 pruebas aprobadas** contra la configuración normal del proyecto; 110,98 s |
| Formato, lint y tipos | Aprobados dentro de la pasada posterior de `npm run verificar` |
| `node scripts/tareas.mjs --validar` | Plan válido: 63 tareas |
| `git diff --check` | Sin errores |
| Revisión independiente de código y pruebas | Sin hallazgos de corrección ni opcionales; pendiente revisar cierre y evidencia final |

La primera pasada detectó un cierre doble al cancelar el lector SSE. Se corrigió distinguiendo la cancelación del cierre por aborto; las pruebas de cancelación y de revocación pasan. Se corrigió también una observación de lint sobre la declaración del temporizador, sin cambiar el comportamiento.

## Verificaciones que no han pasado o están pendientes

- **`npm run verificar` completo no aprobado.** Con el servidor detenido, la batería registró fallos en pruebas existentes de usuarios (8/11), lectura de Odoo (1/40), Bodega (2/8) y opciones de envío (2/12), con duraciones de 5 a 14 segundos por caso. Se detuvo la pasada por presión de memoria y vencimientos de tiempo. No se modificaron esas pruebas, sus tiempos ni sus aserciones.
- **E2E de JG-10 no aprobado.** La primera ejecución detectó que importar Prisma directamente en Playwright no funciona con el cliente generado ESM; se corrigió el ayudante para invocar `tsx` en un subproceso, como las pruebas existentes. La segunda ejecución agotó los 30 segundos durante el inicio de sesión, antes de ejercer SSE. Una comprobación manual independiente de inicio de sesión también agotó 30 segundos durante la compilación inicial.
- **`npm run build` y todos los E2E siguen pendientes.** No hay evidencia de sincronización real en menos de dos segundos, reconexión en navegador, accesibilidad completa ni capturas de aplicación. Las aserciones de latencia conservan el límite de 1999 ms.
- **next-devtools:** descubrió el servidor Next.js 16.4.2 en el puerto 3000. `get_errors` informó que aún no había una sesión de navegador de la aplicación conectada: falta obtener una comprobación final de errores tras el recorrido.

El equipo informó entre 15 MB y 101 MB de memoria física disponible de aproximadamente 8 GB durante la verificación. Se redujo la ejecución E2E a un trabajador y se cerraron el servidor de desarrollo y las pestañas de prueba; persistieron los vencimientos en pruebas previas a JG-10. Se solicitó al usuario liberar memoria antes de repetir las verificaciones.

## Para retomar

1. Retomar la rama `jordin/JG-10-tiempo-real-sse` con memoria disponible y las bases desechables iniciadas, o preparar otras bases locales nuevas con sus semillas.
2. Ejecutar `npm run verificar`, `npm run build`, el E2E de JG-10 y `npm run e2e -- --workers=1`, sin debilitar controles.
3. Recorrer Bodega, Facturación y Ruta con Playwright, comprobar errores con next-devtools y completar las capturas de aplicación conectada/desconectada.
4. Completar revisión independiente del cierre, `estado: hecha`, `## Resultado` y bitácora solo cuando todo pase.
5. Validar el cierre, abrir el PR con toda la evidencia y esperar todas las verificaciones obligatorias hasta integrarlo en `develop`.
