# Bitácora de José Daniel Cifuentes

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-18 · JC-01 · Herramientas obligatorias del agente (Codex)
- Hecho: verifiqué Node.js 24.22.0, npm 11.19.1, Git 2.54.0, gh 2.96.0, PostgreSQL 18.6 y Codex CLI 0.163.0-alpha.10.2; GitHub devuelve JDaniC y confirma acceso al repositorio. La pantalla `/mcp` de Codex confirmó conectados playwright (25 herramientas), next-devtools (4), shadcn (7) y context7 (2); el proyecto es confiable. Para resolver fallos de inicio de los tres servidores que descargan con `npx` detrás de la CA TLS de esta red, añadí `NODE_EXTRA_CA_CERTS` a su configuración personal y guardé las raíces macOS en `~/.codex/certs/macOS-roots.pem`, fuera del repositorio. Context7 autenticó por OAuth y devolvió documentación de Server Actions de Next.js 16.0.3. Playwright abrió Inicio, leyó “Inicio · INCOVSA” y guardó la captura temporal `/tmp/JC-01-inicio-playwright.png`.
- Decisiones: mantuve la autenticación OAuth de Context7; no hizo falta clave personal. Codex usa `workspace-write` y confirmaciones `on-request`. `.env` no existe en esta copia y no se leyó. Para npm y los MCP `npx` usé las CA raíz de macOS con `NODE_EXTRA_CA_CERTS`; TLS permaneció habilitado.
- Pendiente o aviso para otros: ninguno.

## 2026-10-18 · JC-02 · Lectura del archivo de Odoo
- Hecho: lector puro del `.xlsx` en `src/modulos/odoo/servicio.ts`, con Zod y tipos en `esquemas.ts`, detección por contenido, límite de 2 MB, primera hoja, reconstrucción de líneas, validación de bodega y rechazo completo de pedidos con cantidades o pesos inválidos. Con el anonimizado devuelve 33 aceptados, 46 rechazados, 1 referencia cancelada y 1 agrupación; con cantidades inválidas acepta 30. Las 40 pruebas propias y las 169 de toda la aplicación pasan, junto con formato, lint, tipos y compilación. Revisión independiente LISTO, sin hallazgos.
- Decisiones: cantidades y pesos como textos decimales exactos de tres posiciones mediante Prisma.Decimal; `numero` y `lote` siguen siendo texto. Los motivos y errores son los del prototipo. Sin consultas ni guardado, sin dependencias ni cambios del esquema. Se utilizaron bases locales desechables y un worktree temporal para conservar intacta `.obsidian/`, que impedía pasar el control de formato en el checkout principal.
- Pendiente o aviso para otros:
**JC-03:** `leerArchivoOdoo(bytes, prefijoOdoo)` devuelve `ResultadoLecturaOdoo`; los prefijos son `XE`, `GT` y `ESC`. Autoriza sesión, permiso y sede antes de llamarlo; guarda sus pedidos en la transacción de carga y usa los motivos del resultado en el resumen. El Resultado de JC-02 documenta los tipos, los tres motivos y los nueve errores de archivo. Las cantidades son textos listos para Decimal(12,3) y para el módulo de conversión.

## 2026-10-18 · JC-03 · Facturación: carga del archivo y tablero de pedidos facturados
- Hecho: implementé las acciones y servicios para cargar y listar pedidos facturados por sede y eliminarlos con bitácora atómica; añadí el tablero responsive, el resumen de Odoo, la selección compacta y la confirmación de eliminación con los datos del prototipo. Verifiqué los casos de autorización y la persistencia entre dos facturadores.
- Decisiones: el archivo se limita a 2 MB según `specs/16`, con límite de 3 MB en el cuerpo de la acción; no se modificaron el esquema ni las dependencias. El panel derecho mantiene sus opciones vacías y pasa a JC-04. La revisión local pidió datos en la confirmación, aserciones de tarjeta y evidencia comparativa; quedó corregido.
- Pendiente o aviso para otros:
**JC-04:** el tablero deja las secciones de camión y cliente recoge vacías, con sus encabezados y zonas de arrastre. Aquí deben añadirse la selección y envío a Bodega, como indica el alcance de JC-04. También debe restaurarse la instrucción completa del prototipo: “Arrastre con el mouse, o con el dedo después de mantenerlo presionado sobre la tarjeta. Dentro de una opción, arrastre para cambiar el orden: con ese orden se envía a Bodega.”

## 2026-10-19 · JC-04 · Facturación: opciones de envío y envío a Bodega
- Hecho: completé las dos opciones de envío, campos persistentes, arrastre múltiple con mouse, toque largo y teclado, orden, sobrepeso informativo, cancelación y creación transaccional de rutas y pedidos con correlativo diario, líneas, entregas, historial y bitácora.
- Decisiones: importes exactos con Decimal/gramos enteros; bloqueo por sede y `FOR UPDATE` de la opción; guardado individual sin refrescar al escribir. Las pruebas de navegador coordinan los tres proyectos y limpian únicamente su propio envío. Sin dependencias ni migraciones. El usuario autorizó dos ajustes mínimos fuera del módulo: espera de animación antes de axe y color del texto de prioridad de Bodega.
- Verificación: 230 pruebas de integración/unitarias, formato, lint, tipos y compilación; JC-04 pasa en los tres tamaños; suite E2E completa: 115 aprobadas y 2 omisiones preexistentes de JC-03. Revisión independiente LISTO. Capturas comparativas en `evidencia/JC-04/`.
- Pendiente o aviso para otros:
**JM-03 / JM-06 / JC-06:** `enviarOpcion` y su acción guardan el envío completo; el Resultado de JC-04 y `src/modulos/envios/README.md` documentan cómo leer `lineas`, `entregas`, `pedidosFacturados` e `historial`, siempre con sede autorizada. `programadoPara` conserva la programación en Guatemala como instante UTC; `fechaEnvio` es una columna de fecha de calendario.
**JC-05:** las mutaciones ya validan el origen de cada pedido y coordinan las opciones por sede; cada acción avisa después del cambio. El guardado de fecha/hora no refresca la pantalla. Falta el alcance de tiempo real entre facturadores que corresponde a JC-05.
**Jordin:** por autorización explícita del usuario, `pruebas-e2e/comunes/componentes.spec.ts` espera la animación del diálogo antes de medir contraste; mantiene todas las reglas de axe. Actualiza tu rama desde `develop`.
**Josué:** por autorización explícita del usuario, solo cambié a `var(--g600)` el color del texto de prioridad en `src/componentes/picking/bodega/BodegaCliente.tsx`; su contraste era 4.46:1 y fallaba el control general de accesibilidad. Actualiza tu rama desde `develop`.

## 2026-10-21 · JC-05 · Dos facturadores a la vez y tiempo real
- Hecho: estado esperado obligatorio (ubicación, posición y modificación) en movimientos, eliminación, cancelación y envío; comprobación bajo el bloqueo transaccional compartido por sede; confirmaciones conservan los pedidos vistos. Facturación usa SSE del armazón y aplica cambios al finalizar arrastre, edición y guardados pendientes. Ocho pruebas nuevas de integración y E2E con dos facturadores en los tres tamaños. `npm run verificar`: 310 pruebas en 34 archivos; compilación y 207 E2E completos aprobados, con axe y sin omisiones. Latencias de 47, 66 y 185 ms. Revisión independiente LISTO.
- Decisiones: José Daniel confirmó con Jordin el aviso registrado en specs/06 y specs/18. Sin dependencias, esquema ni migraciones nuevas. Bases y cuentas de prueba desechables. Contrato de estados y evidencia en `src/modulos/envios/README.md` y `pruebas-e2e/picking/evidencias/jc-05/README.md`.
- Pendiente o aviso para otros:
  - **Carlos:** José Daniel autorizó explícitamente en esta conversación (21/10/2026) esperar el final de la animación antes de axe en `pruebas-e2e/panel/usuarios.spec.ts` y `pruebas-e2e/picking/usuarios.spec.ts`. Se añadieron solo esas esperas; se conservaron todas las aserciones. Los seis casos afectados y la batería completa pasan. Actualiza tu rama desde `develop` después de integrar JC-05.
## 2026-10-22 · JC-06 · Reportes: Despacho, Rutas realizadas y Bitácora con filtros de periodo
- Hecho: añadí las tres pestañas de Reportes con consultas y periodos calculados en Guatemala, conversión de cantidades, rutas realizadas y Bitácora de los dos sistemas. La Bitácora queda aislada por sede. Capturas comparativas para teléfono, tableta y escritorio en `src/modulos/reportes/evidencias/`.
- Decisiones: oculto en las cuentas restringidas los registros de Picking cuyo usuario cambia de sede o tiene relaciones múltiples; los eventos globales del sitio y autenticación siguen visibles. Sin dependencias, esquema ni migraciones. La exportación permanece para JC-07.
- Pendiente o aviso para otros:
**JC-04 / Carlos:** antes de actualizar `develop`, un E2E completo detectó una carrera al importar fixtures en Facturación y dos contrastes en Usuarios de picking. En la verificación final, ya sobre `develop` actualizado y una base nueva, esos casos pasan; no requieren acción en esta rama.
**Daniela (DM-05):** en la suite completa del 22/10, `pruebas-e2e/panel/industrias-y-catalogo.spec.ts:114` falla al no encontrar el producto recién creado en el filtro público, en teléfono, tableta y escritorio. El resto de la suite pasa, incluida JC-06.

## 2026-10-22 · JC-07 · Exportación de los reportes a Excel y PDF
- Hecho: incorporé descargas XLSX/PDF para Despacho diario, Rutas realizadas y Bitácora, con el periodo seleccionado, contenido de la tabla, nombre de archivo, permisos y sede. Las pruebas propias validan las seis descargas en los tres tamaños de pantalla; comparé las pestañas con el prototipo y guardé las capturas en `pruebas-e2e/picking/evidencias/jc-07/`. `npm run verificar` (342 pruebas), `npm run build`, el control de diseño y la E2E propia (3/3) pasan. El bot pidió corregir el total del despacho con resto cero; se ajustó el formato y se añadió el caso automatizado. Revisión independiente en contexto limpio: LISTO, sin hallazgos pendientes.
- Decisiones: usé fuentes PDF locales y el logotipo incrustado para evitar solicitudes externas. Sin dependencias, esquema ni migraciones. Reinicié y sembré únicamente la base local desechable `incovsa_jc06_e2e_limpia`, con autorización del usuario, para la verificación.
- Pendiente o aviso para otros:
**Todos:** la E2E completa local terminó con 244 aprobadas, 12 fallidas y 2 no ejecutadas. La repetición aislada de 33 casos de otras áreas terminó con 27 aprobadas y 6 fallidas: `panel/industrias-y-catalogo.spec.ts:114` (diálogo no se cierra, teléfono y tableta), `acceso/acceso-personal.spec.ts:17` (timeout en tableta), `acceso/acceso-personal.spec.ts:81` (sesiones en tableta y escritorio) y `picking/bodega.spec.ts:218` (credenciales de demostración en escritorio). Las pruebas de JC-07 pasan; se restauraron las capturas ajenas regeneradas por E2E.
