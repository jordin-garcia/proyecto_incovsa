# Verificación de JG-10 · 21/10/2026

Verificación retomada después del reinicio del equipo. El primer avance del 20/10 quedó guardado sin declarar la tarea terminada.

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
| Pruebas de `src/modulos/tiempo-real` | **4 archivos y 18 pruebas aprobadas**, incluidas las regresiones de pérdida de red y orden del instante de publicación |
| `npm run verificar` | Formato, lint, tipos y **33 archivos / 302 pruebas aprobados**; repetición final Vitest 209,81 s |
| `npm run build` | Repetición final aprobada: compilación 9,7 s y TypeScript 12,3 s; standalone con `/api/tiempo-real` dinámica en Node.js |
| `npm run e2e -- pruebas-e2e/flujo/tiempo-real.spec.ts --workers=1` | **9 pruebas aprobadas** en teléfono, tableta y escritorio contra producción, con el instante real de publicación; 1,7 min |
| `npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1` | **3 pruebas aprobadas**; teléfono 22,5 s, tableta 21,5 s, escritorio 26,3 s, manteniendo los 30 s por flujo |
| `npm run e2e -- --workers=1` | **204 pruebas aprobadas**, sin fallos ni omisiones; 21,1 min. Carga de Facturación: 17,8 s / 16,9 s / 21,3 s en teléfono/tableta/escritorio |
| `node scripts/tareas.mjs --validar` | Plan válido: 63 tareas |
| `git diff --check` | Sin errores |
| Recorrido manual y next-devtools | Bodega, Facturación y Ruta conectan SSE; capturas revisadas en 390/768/1440; `configErrors: []`, `sessionErrors: []` |
| Revisión independiente | **LISTO**, incluidos código, capturas, mediciones y cierre B9; corregidas la medición de latencia, una carrera al preparar activos y la referencia ARIA de Facturación |

La primera pasada detectó un cierre doble al cancelar el lector SSE. Se corrigió distinguiendo la cancelación del cierre por aborto; las pruebas de cancelación y de revocación pasan. Se corrigió también una observación de lint sobre la declaración del temporizador, sin cambiar el comportamiento.

## Diagnóstico y correcciones

- La primera ejecución E2E detectó que importar Prisma directamente desde Playwright no funciona con el cliente generado ESM. El ayudante invoca `tsx` en un subproceso, como las pruebas existentes.
- Chromium puede mantener abierto un flujo SSE al simular pérdida de red. El cliente ahora escucha `offline` y `online`, además de los errores del transporte. La prueba de regresión falló antes del cambio y pasó después; los E2E verifican el indicador y la reconexión real.
- El servidor de desarrollo mostró latencia variable durante la actualización RSC. RNF-13 se comprueba sobre el artefacto standalone de producción, como el despliegue de Docker. Ambos navegadores y las peticiones de seguridad usan el mismo servidor y sede. El fixture prepara los activos, usa un puerto por trabajador y cierra su proceso al terminar. En Windows copia también las DLL de sharp que omite el trazado standalone; Docker ya copia `node_modules` completo.
- La revisión detectó que empezar a contar después de recibir la respuesta POST podía ocultar parte de la latencia. Una medición provisional desde el clic incluyó también la ejecución previa de la mutación (una traza registró 1354 ms solo en su POST). La medición final usa el instante real de entrada en `avisarCambio`, antes de notificar: un canal nativo de diagnóstico, inactivo si no hay observadores, lo entrega al fixture por IPC. No añade campos al SSE ni rutas HTTP. El listener se arma antes del clic y exige el aviso de esa sede en su propio servidor. El plazo absoluto de **1999 ms** no se reinicia al recibir IPC ni la respuesta; se observa el DOM cada frame con el presupuesto restante y se comprueba el total transcurrido. Las métricas quedan adjuntas a Playwright. No se aumentó ningún límite ni se omitió ninguna aserción.
- La preparación de activos tiene bloqueo y una segunda comprobación del marcador después de adquirirlo, para evitar sobrescribir archivos cuando otro trabajador ya empezó a servirlos.
- La prueba de acceso simultáneo de los dos sistemas pulsaba «Ingresar» antes de hidratar la segunda pantalla. Se agregó la misma espera `data-hidratado` que ya usa el proyecto; se conservan todas sus aserciones y tiempos.
- En el formulario de contenido se detectó la misma falta de precondición al editar Misión; su prueba ahora espera la hidratación antes de escribir el borrador, manteniendo la comprobación de persistencia y todos sus límites.
- El recorrido con pedidos detectó que dnd-kit generaba referencias `aria-describedby` distintas en SSR y en el navegador. Se fijó un ID estable por sede en el contexto de Facturación. Una regresión que comprueba las referencias ARIA después de recargar falló antes del cambio y pasó después; el flujo también exige ausencia de avisos de hidratación. El arrastre, la persistencia, el envío a Bodega y axe pasaron en la comprobación dirigida de teléfono (43,4 s).
- La primera pasada completa terminó con 201 aprobadas, una fallida y dos omisiones existentes. El único fallo fue el límite de 30 s de `facturacion-carga`: concentraba el flujo y las capturas/auditorías de tres tamaños en un solo caso de escritorio. Ahora cada proyecto ejecuta el flujo completo en su tamaño y emulación reales. Conserva todas las aserciones y las 15 capturas, aumenta de siete a nueve auditorías axe y mantiene el límite de 30 s. Un fixture con tiempo propio de preparación serializa los datos con el mismo bloqueo de Facturación y limpia solo los pedidos nuevos del importador de demostración, incluso si falla el flujo; cerrar su conexión libera el bloqueo. Las tres ejecuciones dirigidas pasaron.

## Medición real de RNF-13

La última pasada completa registró estas latencias desde `avisarCambio` hasta el DOM remoto, sin recarga. Los nueve avisos SSE cumplen el plazo estricto de 1999 ms. La consulta de respaldo cumple los 10 s de observación de dos intervalos de 5 s. Valores y procedencia en [latencias.json](latencias.json), extraídos de los adjuntos de Playwright sin duplicarlos.

| Tamaño | Marcar | Desmarcar | Tras reconectar | Respaldo sin SSE |
|---|---:|---:|---:|---:|
| 1440 | 781 ms | 808 ms | 1017 ms | 4782 ms |
| 768 | 699 ms | 1831 ms | 612 ms | 4944 ms |
| 390 | 568 ms | 701 ms | 515 ms | 4951 ms |

El 20/10 el equipo tenía entre 15 y 101 MB libres de aproximadamente 8 GB y un consumo anómalo del núcleo de Windows. Tras el reinicio volvió a tener alrededor de 2 GB libres y la batería general pasó. No se ampliaron tiempos ni se rebajaron umbrales para resolver la falta de memoria.

La pasada general iniciada de madrugada quedó interrumpida al apagarse el entorno. Al retomar el 21/10 por la tarde se recuperó automáticamente el PostgreSQL desechable y se limpiaron con su ayudante los dos envíos residuales de pruebas. Una primera pasada en frío agotó la espera de redirección de RN-54 con la operación aún pendiente. Se mantuvieron sus aserciones y límites: se levantó el servidor de desarrollo de forma independiente, se precompilaron todas sus rutas con `get_compilation_issues` (`issues: []`) y se recorrieron las rutas protegidas del sitio y del picking antes de repetir toda la suite reutilizando ese servidor listo. El recorrido posterior devolvió `configErrors: []` y `sessionErrors: []`, sin errores de consola en las rutas del picking.

## Cierre local

La repetición final de `npm run verificar` y `npm run build` pasó después de redistribuir la prueba de Facturación. La batería E2E completa está aprobada. Se restauraron únicamente las capturas de otras tareas que sus pruebas regeneraron; no se incorporan a este cambio.

La revisión final consta en [revision.md](revision.md). Las verificaciones obligatorias de GitHub, incluida `revision-claude`, y la integración se consultan en el PR de JG-10.
