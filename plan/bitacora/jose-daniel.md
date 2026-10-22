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

## 2026-10-21 · JC-05 · Dos facturadores a la vez y tiempo real (avance pendiente de cierre)
- Hecho: estado esperado obligatorio (ubicación, posición y modificación) en movimientos, eliminación, cancelación y envío; transacciones con bloqueo compartido por sede; confirmaciones conservan los pedidos vistos; SSE del armazón y aplicación aplazada durante arrastre, edición y guardados pendientes. Ocho pruebas nuevas de integración; E2E con dos facturadores y tres tamaños. `npm run verificar` pasa con 310 pruebas; compilación y E2E propios pasan; latencias de 51, 63 y 58 ms. Revisión independiente LISTO.
- Decisiones: José Daniel confirmó con Jordin el aviso registrado en specs/06 y specs/18. No se agregaron dependencias, esquema ni migraciones. Se usaron bases y cuentas de prueba desechables. La tarea sigue pendiente y sin PR de cierre, en `jose-daniel/JC-05-facturacion-simultanea`.
- Pendiente o aviso para otros:
  - **Carlos:** la batería completa confirmó fallos de contraste al medir las altas de usuarios durante su animación en `pruebas-e2e/panel/usuarios.spec.ts` y `pruebas-e2e/picking/usuarios.spec.ts`. Se propuso esperar `getAnimations()` antes de axe, igual que en las pruebas comunes. José Daniel autorizó explícitamente esos dos ajustes en esta conversación el 21/10/2026. Se aplicó únicamente la espera de animaciones, conservando todas las aserciones; la verificación final está en curso. Evidencia y continuación en `pruebas-e2e/picking/evidencias/jc-05/README.md`.
