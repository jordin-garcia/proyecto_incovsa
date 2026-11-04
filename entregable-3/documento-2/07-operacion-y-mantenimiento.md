# Respaldos

`scripts/respaldo.sh` ejecuta pg_dump -Fc dentro de PostgreSQL y sube la copia con rclone a un bucket privado de R2 distinto del de imágenes. Conserva siete diarios y cuatro semanales. El domingo UTC crea la copia semanal; FORZAR_SEMANAL=1 permite comprobarla. La retención está implementada en `scripts/lib-respaldo.mjs`.

La programación diseñada es 15 2 * * * en el VPS, desde la carpeta de Compose, con las variables privadas cargadas y Node 24 y rclone disponibles en PATH. El script registra el resultado en el registro del sistema. El acceso de rclone se limita al bucket de respaldos. No se incorpora cifrado propio; R2 cifra su almacenamiento.

`scripts/restaurar.sh` descarga el objeto RCLONE_ORIGEN y restaura con pg_restore en POSTGRES_DB_DEST. Se elige una base nueva para comprobarla. Si coincide con la base de producción, el script exige la confirmación exacta definida en CONFIRMAR_SOBRESCRITURA; la restauración sobre producción necesita autorización expresa y un respaldo previo. Arrancar una imagen anterior no restaura datos.

El flujo `.github/workflows/produccion-respaldo.yml` comprueba tanto el modo aislado de CI como docker compose exec, compara filas por tabla tras restaurar y verifica la retención. La evidencia existente está en evidencia/CE-07 y plan/evidencias/JG-25. El destino de la prueba es local de rclone; todavía no acredita una copia ni una restauración real en el R2 de INCOVSA. CE-08 debe repetirla cuando reciba los accesos.

Los archivos sin secretos están versionados; el archivo privado del VPS y la configuración de rclone se recuperan desde la plantilla y el medio seguro del Anexo J. Las imágenes están en R2 y los documentos en el Drive de la empresa; sus enlaces sí quedan incluidos en pg_dump. Este procedimiento no afirma que pg_dump respalde los objetos de esos servicios.

# Procedimiento para agregar nuevas funcionalidades

## Secuencia de trabajo

1. Registrar o localizar el requisito en specs y una tarea disponible del responsable. Consultar el protocolo y los avisos. Si hay una dependencia, decisión o archivo protegido nuevo, resolverla antes de implementar.
2. Actualizar develop y crear la rama de esa persona e ID. Aplicar migraciones existentes a una base propia. Consultar Context7 para cada API de librería usada y abrir el prototipo si hay interfaz.
3. Convertir cada criterio de aceptación en una prueba con código RF o RN, ejecutarla y confirmar el fallo esperado. Incluir usuario sin sesión, sin permiso y otra sede cuando la operación accede a información interna.
4. Definir el esquema Zod, servicio, operación autorizada y respuesta mínima. Guardar el cambio y Bitácora en la misma transacción; publicar avisarCambio solo después del commit. El servidor obtiene sesión, rol y sede; no los confía al formulario.
5. Conectar la interfaz mediante páginas, componentes y acciones/API. Conservar los textos y el diseño aprobado. Las cantidades viajan como textos exactos o Decimal; las fechas usan America/Guatemala.
6. Ejecutar npm run verificar y npm run build, las verificaciones de la tarea y los recorridos afectados. Comparar con Playwright en los tres tamaños cuando el cambio es visible. Verificar errores con next-devtools y guardar evidencia propia con EVIDENCIA=1.
7. Pedir una revisión en contexto limpio, corregir sus hallazgos, actualizar documentación, Resultado y bitácora. Abrir un PR hacia develop, activar integración automática y esperar todas las verificaciones, incluida revision-claude. No usar push directo ni omitir pruebas.

## Ejemplo implementado de extremo a extremo JC-07

JC-07 amplió Reportes con las seis descargas: Despacho, Rutas realizadas y Bitácora en XLSX y PDF. Reutilizó las consultas de JC-06 y el periodo seleccionado. No creó tablas, permisos ni dependencias nuevas: SheetJS y pdfmake ya estaban aprobados. Las correcciones de JC-09 y JG-26 completaron sus regresiones y la sede visible.

Tabla: Recorrido real de la extensión de Reportes {#tab:extension}

| Paso | Archivo real | Responsabilidad |
|---|---|---|
| Periodo | `src/modulos/reportes/periodo.ts` | esquemaFiltro y resolverPeriodo validan día, semana, mes, año o rango y producen los límites de Guatemala |
| Lectura | `src/modulos/reportes/servicio.ts` | consultarDespacho, consultarRutas y consultarOperaciones exigen pk.reportes y sede; devuelven datos ya preparados |
| Generación | `src/modulos/reportes/exportacion.ts` | crearExcel produce una hoja XLSX; crearPdf genera el PDF con fuentes y logotipo locales; nombreArchivo compone pestaña, sede y periodo |
| Acceso HTTP | `src/app/api/reportes/exportar/route.ts` | GET valida pestaña, formato y filtro con Zod; obtiene sesión picking y sede de trabajo; llama exigirPermiso antes de consultar |
| Interfaz | `src/componentes/picking/reportes/Reportes.tsx` | Envía el periodo visible, descarga el Blob con el nombre de la respuesta y muestra el aviso general si falla |
| Prueba de servidor | `src/modulos/reportes/exportacion.test.ts` | Verifica datos, nombres, indicadores, PDF, formatos y rechazos |
| Prueba de navegador | `pruebas-e2e/picking/reportes-exportacion.spec.ts` | Descarga las seis combinaciones y comprueba la sede seleccionada, también con acceso a varias sedes |

Para seguir el ejemplo, se empieza por la prueba del resultado descargado y la negativa de autorización; luego se lee esquemaFiltro, las consultas y DatosExportacion. El generador solo recibe datos ya autorizados: nunca un identificador de usuario elegido por el cliente. El GET toma la cookie de sede con path=/ y la revalida; no acepta que un parámetro sustituya la sede de la sesión. Las consultas invalidas responden 400, el acceso rechazado 403 y los errores inesperados 500, con un mensaje general y registro seguro.

crearExcel, crearPdf y nombreArchivo son las tres funciones exportadas del generador. El PDF deshabilita acceso remoto y limita lectura local a las cuatro fuentes permitidas; el logo se convierte e incrusta. No se usa una URL proporcionada por el usuario como recurso del PDF. La descarga declara Content-Disposition, tipo, longitud y Cache-Control private, no-store.

Las regresiones de JC-09 comprueban los cuatro indicadores, totales, periodo y variantes Bold. La de JG-26 cambia a Guatemala en pantalla y comprueba que el archivo no contiene datos de Quetzaltenango. Para verificar la extensión:

```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/reportes-exportacion.spec.ts --workers=1
```

Una función futura sigue esta separación. Si necesita una migración o una dependencia distinta, se solicita al coordinador o se obtiene la decisión correspondiente; el ejemplo no autoriza cambios fuera de una tarea disponible.

# Convenciones de desarrollo

El vocabulario y mensajes están en español según specs/02. Las capas se mantienen separadas: presentación en app y componentes, esquemas y lógica en modulos, y utilidades transversales en lib. Los componentes usan PascalCase; funciones y variables camelCase; TypeScript es estricto y ESLint/Prettier mantienen el formato.

Las ramas siguen <clave>/<ID>-<descripcion>. develop es integración y main contiene versiones y despliegues del coordinador. Un ejemplo de commit es docs(documento-2): actualizar arquitectura (JC-08), y el PR comienza [JC-08]. Nadie hace push directo a main o develop. Solo el coordinador cambia schema.prisma, migraciones y demás archivos protegidos. Las dependencias nuevas se consultan antes.

Los permisos se verifican en cada operación interna; Usuarios usa exigirAccesoTotal. Las reglas puras no necesitan acceder a la sesión por sí mismas, pero su llamador sí autoriza el acceso a los datos. Las mutaciones auditables escriben registrarBitacora en la misma transacción. El marcado, la prioridad y el orden temporal no se agregan a Bitácora (RN-20 y RN-28).

Vitest usa PostgreSQL real de pruebas. Playwright cubre Chromium, Firefox y WebKit, con funciones comunes de navegación, hidratación y arrastre táctil. No se eliminan, omiten ni debilitan pruebas. El código del requisito abre el nombre del caso. La CI ejecuta plan, calidad, pruebas, compilación, dependencias y controles de seguridad, integridad y revisión. Las acciones externas están fijadas por SHA.

Las capturas versionadas solo se regeneran con EVIDENCIA=1. Las claves y datos de empresa no forman parte de fixtures. La definición de terminado incluye criterios con prueba, controles locales y CI aprobados, revisión limpia, documentación y PR integrado. La excepción de la decisión 90 para PR documentales evita la E2E completa local; no permite omitir verificaciones obligatorias de CI.

# Problemas conocidos o limitaciones técnicas

Tabla: Limitaciones y trabajo posterior al corte {#tab:limitaciones}

| Tema | Estado real y efecto | Seguimiento |
|---|---|---|
| Producción | CE-08 bloqueada por accesos VPS, DNS y R2; el diseño y pruebas CI no acreditan despliegue real | P-10, P-93, P-94; primer despliegue JG-19 después del 04/11 |
| Seguridad pendiente | Reautenticación aún no conectada, contraseñas comunes, algunos mensajes de Zod, charset y TRACE | CE-14 después de la entrega académica |
| Riesgos documentales | No hay certificación ASVS completa; clasificación, retención y aceptación de riesgos pendientes | JG-27 |
| Drive | Ver o descargar fuera de la aplicación depende de la compartición del archivo en Drive | P-92; INCOVSA define sus accesos |
| Datos de Odoo | El ejemplo contiene 46 pedidos con peso cero; se rechazan sin inventar equivalencias | P-91; archivo definitivo de INCOVSA |
| Sesiones | Siete días renovables; sin máximo absoluto ni límite global de sesiones por cuenta | P-07 y JG-27 |
| Tiempo real | Canal en memoria requiere un único proceso; no soporta réplicas sin cambiar el transporte | Decisión 10; posible LISTEN/NOTIFY futuro |
| Disponibilidad | Hay topes de tamaño, pero no cuotas globales por usuario de SSE, exportación o imágenes | Revisión JG-15 y JG-27 |
| Compatibilidad | Matriz del 03/11 mantiene incidencias INC-47 e INC-48; ver informe antes de afirmar todos los navegadores sin fallos | Documento 6 y JG-17 |
| Contenido y entrega | Datos oficiales y accesos aún dependen de INCOVSA; la v1.0 permite demostración local | Decisión 90; v1.1 del 12/11 |

El sistema no controla inventario, entradas, salidas, existencias o lotes como catálogo: ese control corresponde a Odoo. No envía correos ni consume una API de Odoo. Esas exclusiones son decisiones de alcance, no funciones incompletas. Los incidentes y resultados completos se conservan en el Documento 6 y plan/pruebas.
