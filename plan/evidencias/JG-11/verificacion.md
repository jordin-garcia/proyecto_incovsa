# Verificación de JG-11

## Entorno

Windows nativo, Node.js 24.13.0 y npm 11.19.0. PostgreSQL 18 desechable en `127.0.0.1:55441`, con bases distintas para la aplicación, las pruebas ordinarias y la mutación. Las variables se proporcionan desde un lanzador temporal fuera del repositorio. No se leyeron ni modificaron secretos ni archivos `.env`.

Context7 se consultó para Next.js, TypeScript, Playwright, Semgrep, Stryker, Vitest, gitleaks, OSV-Scanner y actionlint. Como Context7 no encontró lockfile-lint, se consultó su documentación oficial. Los binarios de los controles se verificaron por SHA-256.

## Resultados durante la implementación

- Fase roja: faltaban el módulo de cabeceras, el comprobador de integridad, el de cadena de suministro y los workflows. Las regresiones de generadores de pruebas también fallaron antes de corregir el conteo.
- Cabeceras: seis pruebas unitarias aprobadas. La batería general de Vitest aprobó 34 archivos y 308 pruebas.
- Compilación: Next.js 16.4.2 standalone aprobada; las páginas se renderizan por petición para aplicar el nonce. next-devtools devolvió `issues: []`, `configErrors: []` y `sessionErrors: []`.
- Semgrep: 76 reglas sobre 162 archivos, sin hallazgos. Los casos sintéticos del escáner comprueban funciones, flechas, exportaciones indirectas y APIs prohibidas.
- gitleaks: historial completo aprobado. Los siete falsos positivos iniciales eran textos de reemplazo, valores ficticios exactos de CI y una referencia simbólica a variables; las excepciones combinan archivo y valor o línea exactos.
- Cadena de suministro: lockfile-lint aprobado. OSV y npm audit sin vulnerabilidades después de fijar `qs` 6.16.1 bajo `typed-rest-client`.
- Navegador: primera pasada completa, 213 aprobadas de 216. Fallaron tres casos de teléfono por esperas de navegación/captura mientras corría la mutación; repetidos sin esa carga, los tres pasaron. Las doce pruebas de cabeceras pasaron en la batería completa. Falta la repetición final de la batería completa.

## Diagnóstico de mutación

La primera corrida de diagnóstico de conversión produjo 176 supervivientes, 29 sin cobertura y ningún mutante detectado: **es inválida y no se usa como línea base**. El informe decía que se habían ejecutado cero pruebas por mutante. La reproducción independiente confirmó que Stryker 10 construye el filtro del nombre con espacios, mientras Vitest 5 usa ` > ` entre suites. El filtro omitía todas las pruebas en suites anidadas.

El adaptador local usa el factory público del runner, conserva los ID y la cobertura y traduce el filtro al `task.fullTestName` real. Rechaza una corrida completada sin pruebas ejecutadas. Su regresión utiliza Stryker y Vitest reales sobre un módulo mínimo; no simula sus resultados. El informe de diagnóstico no sustituye la ejecución completa requerida para fijar el umbral.

Los archivos temporales y el caché de mutación se aíslan del servidor de Next.js; no se ignoran mutantes, no se omiten pruebas y no se rebajan límites para conseguir un resultado.

## Cierre pendiente

Este archivo es un registro de avance. Quedan pendientes la línea base completa válida de mutación, la repetición final de verificaciones, los PR negativos, la revisión final, la exigencia de los checks en ambas ramas y la integración.
