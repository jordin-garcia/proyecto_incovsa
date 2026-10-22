# Verificación de JG-11

## Entorno

Windows nativo, Node.js 24.13.0 y npm 11.19.0. PostgreSQL 18 desechable en `127.0.0.1:55441`, con bases distintas para la aplicación, las pruebas ordinarias y la mutación. Las variables se proporcionan desde un lanzador temporal fuera del repositorio. No se leyeron ni modificaron secretos ni archivos `.env`.

Context7 se consultó para Next.js, TypeScript, Playwright, Semgrep, Stryker, Vitest, gitleaks, OSV-Scanner y actionlint. Como Context7 no encontró lockfile-lint, se consultó su documentación oficial. Los binarios de los controles se verificaron por SHA-256.

## Resultados durante la implementación

- Fase roja: faltaban el módulo de cabeceras, el comprobador de integridad, el de cadena de suministro y los workflows. Las regresiones de generadores de pruebas también fallaron antes de corregir el conteo.
- Cabeceras: seis pruebas unitarias aprobadas. Tras actualizar con `develop` (`76076c3`) y agregar la integración de acciones autorizadas y la espera de hidratación en Reportes, `npm run verificar` aprobó formato, lint, tipos y 338 pruebas en 40 archivos (255,87 s).
- Compilación: Next.js 16.4.2 standalone aprobada; las páginas se renderizan por petición para aplicar el nonce. next-devtools devolvió `issues: []`, `configErrors: []` y `sessionErrors: []`.
- Semgrep: 77 reglas sobre 195 archivos TypeScript, sin hallazgos; 18 casos del escáner real aprobados. Comprueban funciones, flechas, exportaciones indirectas y APIs prohibidas. La revisión de integración detectó que las nuevas acciones de catálogo y los endpoints multipart del panel quedaban fuera del alcance inicial: se agregaron regresiones que fallaron con la regla anterior y se amplió la detección a módulos con la directiva `"use server"` y todos los `src/app/**/route.ts`.
- gitleaks: historial completo aprobado. Los siete falsos positivos iniciales eran textos de reemplazo, valores ficticios exactos de CI y una referencia simbólica a variables; las excepciones combinan archivo y valor o línea exactos.
- Cadena de suministro: lockfile-lint aprobado. OSV y npm audit sin vulnerabilidades después de fijar `qs` 6.16.1 bajo `typed-rest-client`.
- Navegador: primera pasada completa, 213 aprobadas de 216. Fallaron tres casos de teléfono por esperas de navegación/captura mientras corría la mutación; repetidos sin esa carga, los tres pasaron. Las doce pruebas de cabeceras pasaron en la batería completa. Falta la repetición final de la batería completa.

## Verificación después de integrar el avance del equipo

La batería creció a 258 casos con las nuevas pantallas de `develop`. Se ejecutó completa: 252 aprobados en 39,1 minutos. Pasaron los doce casos de seguridad en los tres tamaños. Se observaron seis fallos: título transitorio durante una redirección, dos interacciones iniciales en teléfono y el caso extenso de Reportes agotando sus 30 segundos en los tres tamaños. Los tres primeros pasaron al repetirse; se agregó además una aserción del título antes de axe.

Reportes reúne todos los periodos y tres auditorías de pestañas en un caso. Se separaron los periodos y cada pestaña, conservando cada aserción original, las tres auditorías axe, las capturas completas y los 30 segundos por caso. El caso de Bitácora conserva dentro de su propia ejecución la transición desde Rutas. Se comprobó una segunda causa: cambiar la fecha nativa antes de hidratar el componente pierde el evento. La marca `data-hidratado` sigue el patrón ya usado por `CatalogoCliente`; la prueba falló antes de incorporarla. Es un atributo de diagnóstico sin cambios visuales. Con ambos ajustes pasaron los 15 casos de Reportes en 3,6 minutos; Bitácora tardó 19,5, 18,2 y 19,2 segundos en teléfono, tableta y escritorio, respectivamente, conservando la captura de cientos de filas reales de prueba.

La prueba adicional `acciones-integracion.test.ts` atraviesa las cuatro acciones modificadas contra PostgreSQL real: verifica sus resultados, persistencia, avisos exclusivos de la sede y ausencia de aviso al repetir el envío de una opción vacía. Solo sustituye la obtención del contexto de sesión y sede; no simula Prisma ni los servicios.

Se incorporó después `ed785f9` (JM-04) sin conflictos. Semgrep volvió a aprobar: **77 reglas sobre 196 archivos TypeScript, cero hallazgos**. Los comprobadores aprobaron sus **51 casos**, y actionlint terminó correctamente. Se amplió la integración real de Envíos con carga del archivo anonimizado (33 pedidos y 46 rechazos detallados), eliminación de dos pedidos, persistencia, bitácora y avisos por sede; extensión incorrecta y 2 MB + 1 byte rechazan sin datos ni avisos. Pasaron las dos pruebas del archivo, sin simular Prisma ni los servicios. La batería completa de navegador ahora consta de 276 casos.

La batería completa de 276 casos terminó en 37,5 minutos: 265 aprobados, cinco fallidos y seis pendientes por dependencia de casos fallidos en grupos seriales. Los doce casos de seguridad aprobaron. [navegador-completo.json](navegador-completo.json) conserva las estadísticas y los nombres de los casos afectados. Hubo tres fallos de actualización de Bodega en menos de 2 segundos en desarrollo, uno de persistencia del desmarcado al cerrar inmediatamente el caso y la captura final de carga de Facturación en teléfono agotó sus 30 segundos. La carga de Facturación aprobó en tableta y escritorio en 18,5 y 22,3 segundos.

La revisión independiente confirmó que la nueva respuesta optimista de Bodega permite ver el cambio antes del POST; las pruebas de persistencia ahora esperan ese POST y vuelven a comprobar el desmarcado o el despacho tras recarga. Las pruebas de tiempo real se trasladaron al artefacto de producción de JG-10, con ambas pantallas y el contexto táctil en el mismo proceso y origen; conservan todos los escenarios y los 2 segundos. No se presupone que desarrollo sea la única causa: la repetición en producción debe comprobarlo.

La repetición final aprobó **54 de 54 casos, sin omisiones ni reintentos, en 7,6 minutos**: `bodega-tiempo-real.spec.ts`, `bodega.spec.ts`, `facturacion-carga.spec.ts` y `seguridad/cabeceras.spec.ts`, en teléfono, tableta y escritorio. El marcado remoto en producción tardó 943, 827 y 790 ms; pasaron también los cambios de orden, la reversión ante rechazo, teclado, mouse, touch, persistencia tras recarga, axe, las tres cargas completas y las doce comprobaciones de cabeceras y CSP. Se conservaron todos los límites.

[navegador-final.json](navegador-final.json) registra ambas ejecuciones. Un comprobador combinó sus casos por archivo, título y proyecto y exigió que los 276 casos únicos tuvieran resultado aprobado; fallaría si faltara alguno, apareciera otro inesperado o la repetición tuviera fallos, omisiones o casos inestables. Esta evidencia distingue la batería inicial de sus correcciones; no afirma que los 276 pasaron en una sola ejecución. Las capturas ajenas regeneradas durante las pruebas se restauraron.

La primera verificación general posterior a JM-04 aprobó 345 pruebas, pero las dos integraciones nuevas excedieron sus 5 segundos al sembrar toda la demostración. Su preparación ahora crea solo el usuario real, su permiso y su sede; conserva los servicios, Prisma, avisos, aserciones y límite. Pasaron las dos al repetirse con esa preparación. La revisión independiente confirmó que no se debilitaron las pruebas.

Con la preparación mínima, `npm run verificar` aprobó formato, lint, tipos y **347 pruebas en 40 archivos**, en 257,76 segundos de Vitest, sin otras baterías simultáneas.

La compilación final aprobó: Turbopack compiló en 14,2 segundos, TypeScript terminó en 18 segundos y se generó el artefacto standalone. La repetición de navegador usa ese artefacto actualizado. La primera preparación de las pruebas migradas omitió `x-real-ip` y fue rechazada antes del acceso; se corrigió copiando la misma cabecera de IP local de confianza que emplea el fixture de JG-10 al probar sin Caddy. No se cambió ningún control de autenticación.

El probe final de `/acceso` con Playwright MCP conservó el título y la pantalla esperados. next-devtools devolvió `configErrors: []` y `sessionErrors: []`; la comprobación de compilación también devolvió `issues: []`. La consola mostró el 404 preexistente de la petición automática a `/favicon.ico`, ya documentado en los Resultados de JG-02 y JG-04 porque no se ha entregado ese recurso; no se creó un icono ni se modificó el diseño por esta tarea.

## Protecciones de integración

Se aplicaron y se leyeron de nuevo las reglas de `develop` y `main`: ambas exigen los ocho checks anteriores y los seis nuevos, **14 verificaciones obligatorias** en total, con comprobación estricta de la base y aplicación activa. [protecciones.json](protecciones.json) conserva el resultado. La regla independiente que reserva `main` al coordinador (`25295397`) se comparó antes y después y no cambió.

El primer intento local de mutación acotada abortó durante las pruebas iniciales por el límite de 5 segundos de la integración bajo carga concurrente. No produjo puntaje ni cambia la línea base. Se conserva el límite y se vuelve a comprobar la modalidad acotada en un entorno sin esos procesos concurrentes.

## Diagnóstico de mutación

La primera corrida de diagnóstico de conversión produjo 176 supervivientes, 29 sin cobertura y ningún mutante detectado: **es inválida y no se usa como línea base**. El informe decía que se habían ejecutado cero pruebas por mutante. La reproducción independiente confirmó que Stryker 10 construye el filtro del nombre con espacios, mientras Vitest 5 usa ` > ` entre suites. El filtro omitía todas las pruebas en suites anidadas.

El adaptador local usa el factory público del runner, conserva los ID y la cobertura y traduce el filtro al `task.fullTestName` real. Rechaza una corrida completada sin pruebas ejecutadas. Su regresión utiliza Stryker y Vitest reales sobre un módulo mínimo; no simula sus resultados. El informe de diagnóstico no sustituye la ejecución completa requerida para fijar el umbral.

Los archivos temporales y el caché de mutación se aíslan del servidor de Next.js; no se ignoran mutantes, no se omiten pruebas y no se rebajan límites para conseguir un resultado.

## Primera ejecución completa válida de mutación

La [ejecución 39737245993](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39737245993), sobre `35489875bfd092c01ffabd993fecb5003ffe8036`, terminó correctamente en 82 minutos y 9 segundos. Ejecutó `npm run test:mutacion` sobre los cuatro módulos completos: 15 archivos y 1519 mutantes. La métrica oficial de `mutation-testing-metrics` da **60,634081902245704 %**: 918 detectados, 467 supervivientes, 129 sin cobertura y cinco inválidos. Los 918 detectados tienen pruebas identificadas en `killedBy`; no hay mutantes pendientes, ignorados ni agotamientos de tiempo.

El umbral de `stryker.config.mjs` queda en **60**, al redondear hacia abajo a múltiplo de cinco. Nunca se reduce. [mutacion-base.json](mutacion-base.json) conserva el resumen por archivo y el SHA-256 del informe JSON original (`d3bd928aeb9e5e3a6be6ffc418896c03f397d56bf9a06e9b0caa5ba0f88c0a28`). El informe completo JSON y HTML está en el artefacto `informe-mutacion` de esa ejecución.

La revisión independiente reprodujo los cinco `RuntimeError` con sus reemplazos exactos: todos rompen la construcción de `z.discriminatedUnion` en `envios/esquemas.ts` y Zod lanza `Invalid discriminated union option` antes de registrar pruebas. El esquema original se construye correctamente. Se conserva la clasificación oficial de mutantes inválidos, sin exclusiones manuales. Como mejora opcional del diagnóstico, el adaptador podría conservar ese error de importación en lugar del mensaje genérico que rechaza una ejecución sin pruebas.

## Pruebas negativas en GitHub

Los tres PR temporales están cerrados sin integrar y sus ramas fueron eliminadas:

| PR | Control | Rechazo comprobado |
| --- | --- | --- |
| [#106](https://github.com/jordin-garcia/proyecto_incovsa/pull/106) | [semgrep](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39736289684/job/119682630104) | Dos hallazgos bloqueantes: acción sin `exigirPermiso` y `dangerouslySetInnerHTML`. |
| [#107](https://github.com/jordin-garcia/proyecto_incovsa/pull/107) | [secretos](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39736593452/job/119683619327) | `leaks found: 1`, salida 1, con un valor sintético de alta entropía que nunca fue una credencial real. |
| [#107](https://github.com/jordin-garcia/proyecto_incovsa/pull/107) | [cadena-suministro](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39736593452/job/119683619425) | `node_modules/qs: origen de dependencia no permitido.`, salida 1 antes de `npm ci`. |
| [#108](https://github.com/jordin-garcia/proyecto_incovsa/pull/108) | [integridad-pruebas](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/39736309328/job/119682696250) | Rechazó borrar `src/lib/roles.test.ts` y la prueba exclusiva de la línea 2, salida 1. |

El primer valor sintético secuencial de #107 fue descartado por las reglas predeterminadas de gitleaks como ejemplo; se sustituyó por otro valor sintético de alta entropía y se comprobó el rechazo. No se amplió ninguna excepción. `workflows` detectó además SC2129 en el flujo existente de revisión: se agruparon las tres escrituras consecutivas a `GITHUB_OUTPUT`, conservando sus valores y controles.

## Revisión y cierre local

La revisión en contexto limpio detectó y se corrigieron el conteo de pruebas generadas, el alcance de Semgrep para las nuevas acciones y rutas, la incompatibilidad del filtro de Stryker con los nombres anidados de Vitest y las precondiciones de persistencia de Bodega. Se revisaron también la espera de hidratación y la separación de auditorías de Reportes, conservando todas sus aserciones y límites. La revisión independiente verificó además GitHub en vivo y el SHA-256 del informe de mutación.

Mejora opcional: conservar el error original de importación al diagnosticar un mutante inválido, en lugar del mensaje genérico del adaptador. No cambia la clasificación ni la métrica oficial. La integración queda sujeta a las 14 verificaciones obligatorias del PR; no se omiten ni se sustituyen.
