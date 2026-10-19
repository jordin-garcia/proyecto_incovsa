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
