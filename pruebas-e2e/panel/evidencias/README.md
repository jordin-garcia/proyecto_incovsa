# DM-04 · Evidencia de cierre (20/10/2026)

Se incorporó `develop` con DM-02 y se completaron las comprobaciones de publicación del panel hacia Inicio, cabecera y pie. Se conservaron sus lecturas públicas al resolver el conflicto de `src/modulos/contenido/servicio.ts`. La usuaria autorizó verificar la eliminación de Inquiserca en la base y en el contrato público; su comprobación visual en Quiénes somos corresponde a DM-06, que todavía no tiene pantalla.

## Verificación

- `npm ci`: 687 paquetes instalados; auditoría sin vulnerabilidades. Sin cambios de dependencias.
- `npm run db:aplicar`: dos migraciones existentes; ninguna pendiente.
- `node scripts/tareas.mjs --validar`: plan válido, 63 tareas.
- `npm run verificar`: formato, lint y tipos correctos; 30 archivos y **279 pruebas aprobadas**.
- `npm run build`: compilación de producción correcta, incluidas `/panel/contenido`, `/panel/resumen` y las rutas de imágenes.
- `npm run e2e -- pruebas-e2e/panel/contenido.spec.ts --workers=1`: **21 pruebas propias** en 390, 768 y 1440 px. Cubren axe sin infracciones serias/críticas, permisos, borradores, arrastre vacío, carga real de 5 MB, publicación y eliminación física, misión con texto e imagen ordenados en Inicio para un visitante sin sesión y el logotipo subido en cabecera y pie. El archivo carga la configuración local sin mostrar sus valores.
- `npm run e2e -- --workers=1 --retries=2`: **179 aprobadas directamente, 2 intermitentes aprobadas al reintentar y 2 omitidas por condiciones preexistentes de Facturación**, sin fallos definitivos. DM-04 no agrega omisiones. Las 21 pruebas propias pasan también dentro de esta ejecución completa.
- `node scripts/archivos-protegidos.mjs InAlexa`: sin archivos protegidos no permitidos. El cambio local preexistente de `.codex/config.toml` permanece fuera de los commits.
- En el avance del 19/10 se detectó un contraste insuficiente de Bodega. Ya quedó corregido por el coordinador en `develop`; la captura `incidencia-contraste-bodega.png` se conserva únicamente como evidencia histórica. DM-04 no cambia código ni pruebas de Bodega.
- La repetición sin reintentos dio 178 aprobadas, 2 omisiones y 3 fallos en `picking/usuarios.spec.ts:116`, al medir contraste durante la aparición del modal. La comprobación aislada pasó sin modificarla. Se repitió la batería con los dos reintentos que ya contempla la configuración de CI, sin modificar código, pruebas ni estilos del picking.
- Context7 consultado para sharp, file-type, S3, Zod, Next.js, Prisma, React, React Hook Form y Playwright. shadcn confirmó el registro `@shadcn`; next-devtools reconoció el servidor en el puerto 3000 y confirmó ausencia de errores en las consultas realizadas.

## Pruebas primero y revisión independiente

Las suites de almacenamiento y acciones fallaron inicialmente porque sus módulos no existían. Se implementaron después las operaciones. Las pruebas de navegador permitieron corregir la representación inicial de los textos y la asociación explícita de sus etiquetas.

La revisión independiente siguió `plan/prompts/revision.md`. Encontró que un arrastre sin archivos podía publicar una eliminación en un campo individual. Se corrigió el retorno temprano y se añadió la comprobación de que la imagen se conserva y no se envía publicación. La revisión de cierre no dejó hallazgos de corrección: [veredicto LISTO](revision.md). La nueva comprobación de Inquiserca falló primero porque faltaba su dirección en el contrato público y pasó después de añadirla.

## Comparación visual

| Pantalla | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Contenido, aplicación | [Captura](aplicacion-contenido-390.png) | [Captura](aplicacion-contenido-768.png) | [Captura](aplicacion-contenido-1440.png) |
| Contenido, prototipo | [Captura](prototipo-contenido-390.png) | [Captura](prototipo-contenido-768.png) | [Captura](prototipo-contenido-1440.png) |
| Resumen, aplicación | [Captura](aplicacion-resumen-390.png) | [Captura](aplicacion-resumen-768.png) | [Captura](aplicacion-resumen-1440.png) |
| Resumen, prototipo | [Captura](prototipo-resumen-390.png) | [Captura](prototipo-resumen-768.png) | [Captura](prototipo-resumen-1440.png) |
| Misión publicada en Inicio | [Captura](publicacion-inicio-390.png) | [Captura](publicacion-inicio-768.png) | [Captura](publicacion-inicio-1440.png) |
| Logotipo publicado en el sitio | [Captura](logotipo-publico-390.png) | [Captura](logotipo-publico-768.png) | [Captura](logotipo-publico-1440.png) |

Se conservan bloques, orden, textos funcionales, estados, galerías y colores del sistema de diseño. Las capturas del panel usan misión y visión aprobadas, historia y galerías vacías y logotipos originales. La preparación de `datos.ts` guarda y restaura las filas anteriores incluso al fallar una prueba, usa el mismo candado que DM-02 y elimina únicamente los archivos nuevos locales. No reinicia la base. Se excluyen las notas P-xx y el botón Demostración conforme a `specs/20`. El resumen usa `/panel/resumen` y se conserva la redirección de `/panel`, según la precisión de JG-07 en `specs/05`.

La revisión del PR detectó etiquetas que cambiaban al elegir un borrador, capturas con datos de pruebas anteriores y la falta del recuadro de los iconos del resumen. Se separó el estado publicado del borrador, se aislaron los datos y se reprodujeron los recuadros de 44 × 44 px del prototipo. Las nuevas comprobaciones fallaron primero por la etiqueta y el ancho del icono y pasaron después de corregirlos. Se repitió la revisión independiente sin hallazgos pendientes.

## Uso y límites

- `guardarImagen(bytes)` devuelve una dirección pública del disco o de R2; `borrarImagen(direccion)` elimina únicamente claves del almacenamiento y conserva los originales de `/marca/`.
- `publicarContenido(FormData)` autoriza `sit.contenido`, valida el bloque y las imágenes, escribe contenido y bitácora en la misma transacción y revalida el sitio. Las referencias existentes deben pertenecer al bloque; las nuevas se recodifican antes de guardarlas.
- El formulario usa `/api/imagenes/publicar`, con comprobación de origen, sesión, permiso y límite del cuerpo, para admitir imágenes de 5 MB sin modificar el límite de 3 MB de las acciones del servidor. No se agregaron dependencias, esquemas ni migraciones.
- La ruta GET del disco devuelve 404 en producción. La configuración real de R2 sigue fuera de alcance; no se usaron cuentas ni credenciales externas.
- `leerEstructuraSitio()` conserva la API de DM-02 y añade `logotipoInquiserca: string | null`: al quitarlo desde el panel devuelve `null`; al recuperarlo, `/marca/inquiserca.webp`. DM-06 debe consumir ese dato y comprobar visualmente que con `null` no se muestra ni se alterna el logotipo. Este reparto de verificación fue autorizado expresamente por la usuaria el 20/10/2026.
