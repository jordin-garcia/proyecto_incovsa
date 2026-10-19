# DM-04 · Evidencia del avance (19/10/2026)

La usuaria autorizó implementar el panel y el almacenamiento y esperar a DM-02 antes de integrar DM-04. La tarea conserva `estado: pendiente`: faltan las comprobaciones de publicación en Inicio, cabecera y pie. No se implementó DM-02 en esta conversación.

## Verificación

- `npm ci`: 687 paquetes instalados; auditoría sin vulnerabilidades. Sin cambios de dependencias.
- `npm run db:aplicar`: dos migraciones existentes; ninguna pendiente.
- `node scripts/tareas.mjs --validar`: plan válido, 62 tareas.
- `npm run verificar`: formato, lint y tipos correctos; 21 archivos y 219 pruebas aprobadas.
- `npm run build`: compilación de producción correcta, incluidas `/panel/contenido`, `/panel/resumen` y las rutas de imágenes.
- Playwright con la configuración local cargada en el proceso, sin mostrar sus valores: `node --env-file=.env node_modules/@playwright/test/cli.js test pruebas-e2e/panel/contenido.spec.ts --workers=1`: **12 aprobadas**. Cubre 390, 768 y 1440 px, axe sin infracciones serias/críticas, permisos, borradores, arrastre vacío, carga real de 5 MB, publicación y eliminación física.
- Se ejecutó también toda la suite de extremo a extremo. Se identificó una infracción ajena de contraste en Bodega: `src/componentes/picking/bodega/BodegaCliente.tsx:61`, texto «Quetzaltenango · la prioridad y las marcas no quedan en el historial», `--g500` sobre `--g50`, 4.46:1. Ese archivo no tiene cambios en DM-04. No se debilitó axe ni se modificaron pruebas ajenas.
- Context7 consultado para sharp, file-type, S3, Zod, Next.js, Prisma, React, React Hook Form y Playwright. shadcn confirmó el registro `@shadcn`; next-devtools reconoció el servidor en el puerto 3000 y confirmó ausencia de errores en las consultas realizadas.

## Pruebas primero y revisión independiente

Las suites de almacenamiento y acciones fallaron inicialmente porque sus módulos no existían. Se implementaron después las operaciones. Las pruebas de navegador permitieron corregir la representación inicial de los textos y la asociación explícita de sus etiquetas.

La revisión independiente siguió `plan/prompts/revision.md`. Encontró que un arrastre sin archivos podía publicar una eliminación en un campo individual. Se corrigió el retorno temprano y se añadió la comprobación de que la imagen se conserva y no se envía publicación. La revisión final no dejó hallazgos de corrección para el alcance parcial autorizado.

## Comparación visual

| Pantalla | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Contenido, aplicación | [Captura](aplicacion-contenido-390.png) | [Captura](aplicacion-contenido-768.png) | [Captura](aplicacion-contenido-1440.png) |
| Contenido, prototipo | [Captura](prototipo-contenido-390.png) | [Captura](prototipo-contenido-768.png) | [Captura](prototipo-contenido-1440.png) |
| Resumen, aplicación | [Captura](aplicacion-resumen-390.png) | [Captura](aplicacion-resumen-768.png) | [Captura](aplicacion-resumen-1440.png) |
| Resumen, prototipo | [Captura](prototipo-resumen-390.png) | [Captura](prototipo-resumen-768.png) | [Captura](prototipo-resumen-1440.png) |

Se conservan bloques, orden, textos funcionales, estados, galerías y colores del sistema de diseño. Las imágenes y textos de prueba pueden diferir. Se excluyen las notas P-xx y el botón Demostración conforme a `specs/20`. El resumen usa `/panel/resumen` y se conserva la redirección de `/panel`, según la precisión de JG-07 en `specs/05`.

## Uso y límites

- `guardarImagen(bytes)` devuelve una dirección pública del disco o de R2; `borrarImagen(direccion)` elimina únicamente claves del almacenamiento y conserva los originales de `/marca/`.
- `publicarContenido(FormData)` autoriza `sit.contenido`, valida el bloque y las imágenes, escribe contenido y bitácora en la misma transacción y revalida el sitio. Las referencias existentes deben pertenecer al bloque; las nuevas se recodifican antes de guardarlas.
- El formulario usa `/api/imagenes/publicar`, con comprobación de origen, sesión, permiso y límite del cuerpo, para admitir imágenes de 5 MB sin modificar el límite de 3 MB de las acciones del servidor. No se agregaron dependencias, esquemas ni migraciones.
- La ruta GET del disco devuelve 404 en producción. La configuración real de R2 sigue fuera de alcance; no se usaron cuentas ni credenciales externas.
- Quedan pendientes el cierre, el PR y su integración, las pruebas públicas de los criterios 3 y 5 y resolver la infracción ajena de Bodega antes de afirmar que toda la suite pasa.
