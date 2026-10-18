---
id: JG-05
titulo: Design system, componentes comunes y estructura del panel y del picking
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: [JG-02, JG-04]
programada: 2026-10-17
requisitos: [RF-SW-08, RF-SW-26, RF-SL-60, RF-SL-61, RF-SL-70, RNF-01, RNF-08]
pantallas: [base.js › ico, toast, modal, confirmar, campoFecha; panel.js › armazon; picking.js › vista, cab; estilos.css]
---

# JG-05 · Design system, componentes comunes y estructura del panel y del picking

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-02, JG-04

## Objetivo
Pasar el design system aprobado del prototipo a Tailwind CSS 4 y shadcn/ui, crear los componentes comunes que usan varios módulos y el **armazón** (barra lateral reducible, barra superior y área de trabajo) del panel del sitio y del sistema de picking. Desde aquí, cada pantalla se arma solo con estos tokens y componentes (`plan/convenciones.md` §7).

## Contexto que debes leer
- `specs/20-prototipo-aprobado.md` §"Design system aprobado" **completo** (tipografía, colores, formas, encabezado de los módulos, campos de fecha y hora)
- `specs/16`, decisiones 51 a 56; `specs/06` §"Campos de fecha y hora" (cómo se escriben la fecha y la hora)
- `specs/04`: RF-SW-26, RF-SL-60, RF-SL-61 (instrucción breve a la par del título en todos los módulos)
- Prototipo:
  - `entregable-1/prototipos/simulacion/src/estilos.css` **completo** (tokens `:root`, botones `.btn*`, `.tarjeta`, `.chip*`, `.aviso*`, `.toast`, `.modal*`, `.tabla*`, `.pestanas`, `.seg`, `.medidor`, `.cab-pag`/`.cab-fx`, barra lateral y barra superior de la aplicación)
  - `base.js` › `IC` e `ico()` (íconos SVG), `toast()`, `modal()`, `confirmar()`, `campoFecha` y `fmt()`
  - `panel.js` › `armazon()` y `montarArmazon()` (barra lateral reducible, usuario, salir)
  - `picking.js` › `vista()` (módulos, selector de sede, indicador "En vivo") y `cab()`; la lógica de la hora en `montarFacturacion()` (`horaValida`, `prog`)
- Context7: Tailwind CSS 4 (`@theme`, `@theme inline`, `--color-*: initial`), shadcn/ui (instalación, `components.json`, temas con variables CSS), `next/font/google`

## Qué hacer
1. **Tokens:** en `src/app/globals.css`, todos los tokens de `estilos.css` en `@theme` de Tailwind 4: colores (`--v950`… `--v50`, `--lima`, `--lima-v`, `--lima-b`, grises `--g900`… `--g50`, estados ámbar, rojo y azul), radios (8, 12, 18 y 26 px), sombras y espaciados. Vaciar la paleta por defecto de Tailwind (`--color-*: initial`) para que solo existan los colores del prototipo. Mapear los tokens semánticos de shadcn (`--primary`, `--background`, etc.) a esos colores.
2. **Tipografías** con `next/font/google`, servidas desde el propio servidor (decisión 51): Poppins (500 a 800) para títulos, Figtree (400 a 800) para interfaz y texto, JetBrains Mono (400 a 700, cifras tabulares) para productos, cantidades y cifras.
3. **shadcn/ui:** `components.json` y los componentes base que se necesiten para reproducir el prototipo (botón, ventana de diálogo, campo de texto, área de texto, lista desplegable, casilla, pestañas, información emergente, mensajes emergentes), con el aspecto exacto de las clases del prototipo. Las dependencias que estos componentes agreguen se instalan aquí.
4. **Íconos:** los SVG de `base.js` › `IC`, como componente `Icono` (`src/componentes/comunes/iconos.tsx`) con su nombre (`<Icono nombre="bodega" />`), con `aria-hidden` (decisión 53). Incluye los íconos de las 9 industrias.
5. **Componentes comunes** (`src/componentes/comunes/`), cada uno igual al del prototipo:
   - `EncabezadoModulo` (eyebrow, título e instrucción breve **a la par** del título, acciones a la derecha; `cab()`);
   - `VentanaConfirmacion` (`confirmar()`), `Aviso` (verde, ámbar, rojo y azul), mensajes emergentes (`toast()`: éxito, aviso y error, 4 s);
   - `ChipEstado` (En Preparación, Despachado, En Ruta, Entregado, con los colores `estado-*`);
   - `Tabla` con el estilo `.tabla`, `Pestanas`, `BotonesSegmentados` (`.seg`), `Medidor` y `Vacio` (estado vacío);
   - `CampoFecha` y `CampoHora` (specs/06 y specs/20): se escriben con el teclado, la fecha `dd/mm/aaaa` (las barras se agregan solas: "20102026" → "20/10/2026"; al salir, "5/1/2027" → "05/01/2027") y la hora `HH:MM` de 24 h ("1330" → "13:30", "9:05" → "09:05"); un botón abre el calendario o el reloj del navegador **debajo** del campo; un valor que no existe no se acepta y el campo se marca en rojo con el formato esperado; vacíos, fondo `--v50` y borde `--v300`; cursor de mano. Devuelven el valor en ISO (`AAAA-MM-DD` y `HH:MM`) con `src/lib/fechas.ts`;
   - `formatoKg(n)` y `formatoNumero(n)` con el mismo formato que `fmt()` del prototipo.
6. **Armazón de la aplicación** (`src/componentes/comunes/armazon/`), presentacional, igual a `panel.js` › `armazon()` y `picking.js` › `vista()`:
   - barra lateral izquierda con logotipo (`public/marca/`, JG-04), nombre del sistema, opciones con ícono (y, opcionalmente, una insignia numérica), y botón para **reducirla a solo íconos** (RF-SW-26, RF-SL-60); la preferencia se recuerda en el navegador;
   - caja del usuario (iniciales, nombre, rol y sede) con el botón **Salir**;
   - barra superior con la miga ("Sistema de picking → Reportes"), el **selector de sede** (solo si el usuario tiene más de una y el módulo lo usa: Facturación, Bodega, Ruta y Reportes) y el indicador **"En vivo"**;
   - en teléfono, la barra lateral se abre con el botón de menú.
7. `src/app/panel/layout.tsx` y `src/app/picking/layout.tsx` que usan el armazón con datos de ejemplo fijos (JG-07 los conecta a la sesión y a los permisos), y una página temporal en `/panel` y en `/picking` para verlo.
8. Pruebas de Playwright de los componentes visibles en esas páginas temporales (armazón reducido y expandido, en teléfono y escritorio) y de `CampoFecha` y `CampoHora`.

## Archivos que creas o modificas
- `src/app/globals.css`, `src/app/layout.tsx` (modificar), `components.json` (crear)
- `src/componentes/ui/**`, `src/componentes/comunes/**` (crear)
- `src/app/panel/layout.tsx`, `src/app/panel/page.tsx`, `src/app/picking/layout.tsx`, `src/app/picking/page.tsx` (crear; las páginas son temporales)
- `pruebas-e2e/comunes/**` (crear)
- `package.json`, `package-lock.json` (solo las dependencias que agreguen los componentes de shadcn)

## Criterios de aceptación
1. Ningún archivo de `src/` usa un color, una fuente, un radio o una sombra que no esté en los tokens; la paleta por defecto de Tailwind no existe.
2. Las tres tipografías se cargan desde el propio servidor (no hay peticiones a Google Fonts) y se aplican como en el prototipo.
3. Comparados con el prototipo en 390, 768 y 1440 px, el armazón del panel y el del picking tienen la misma estructura, colores, tamaños, íconos y comportamiento (reducir y expandir, menú en teléfono). Capturas de los dos en el PR.
4. **RF-SL-70 (formato):** `CampoFecha` convierte "20102026" en "20/10/2026", completa "5/1/2027" a "05/01/2027" al salir, rechaza "31/02/2026" marcándolo en rojo; `CampoHora` convierte "1330" en "13:30" y "9:05" en "09:05" y rechaza "25:90". El calendario y el reloj se abren debajo del campo.
5. El selector de sede solo aparece con más de una sede y en los módulos que la usan.
6. **RNF-08:** las páginas temporales no tienen violaciones de accesibilidad serias ni críticas con axe; todo se puede usar con teclado y tiene foco visible.
7. `npx shadcn@latest mcp` funciona con el `components.json` del proyecto (el servidor MCP de shadcn ya responde).

## Pruebas obligatorias
- `pruebas-e2e/comunes/armazon.spec.ts` (criterios 3, 5 y 6)
- `pruebas-e2e/comunes/campos-fecha-hora.spec.ts` (criterio 4)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/comunes
```

## Fuera de alcance
- La conexión del armazón con la sesión, los permisos y la sede (JG-07).
- La cabecera y el pie del sitio público (DM-02) y las galerías de imágenes (DM-02 y DM-04).
- Las pantallas de cada módulo.

## Notas
- En el `## Resultado`, deja la lista de componentes comunes con un ejemplo de uso de cada uno y la correspondencia entre las clases del prototipo y los componentes (por ejemplo, `.btn.btn-p` → `<Button variant="primario">`). Es lo que leen todas las tareas con pantallas.

## Resultado

El design system está centralizado en `src/app/globals.css`: paleta exclusiva de Tailwind 4 (sin sus colores predeterminados), tokens originales y auxiliares de las clases del prototipo, radios, sombras, espaciado base de 4 px, tipografías y alias semánticos de shadcn. Poppins 500–800, Figtree 400–800 y JetBrains Mono 400–700 se sirven localmente con `next/font/google`. `components.json` configura las rutas españolas y el tema CSS; el MCP de shadcn responde desde el proyecto con `@shadcn`. No se agregaron dependencias.

### Componentes y correspondencia con el prototipo

Los ejemplos interactivos son componentes del cliente. Los imports comunes salen de `@/componentes/comunes/<Nombre>` y las bases de `@/componentes/ui/<nombre>`.

| Prototipo | Componente y ejemplo de uso |
|---|---|
| `.btn.btn-p`, `.btn-s`, `.btn-g`, `.btn-d`, `.btn-lima` | `<Button variant="primario">Guardar</Button>`; variantes `secundario`, `fantasma`, `peligro`, `lima`; `size="pequeno"`, `grande`, `icono`; `asChild` permite un `Link` |
| `.inp`, `.txa`, `.sel`, `.chk` | `<Input aria-label="Buscar" />`, `<Textarea aria-label="Comentario" />`, `<Select value={opcion} onValueChange={cambiar}><SelectTrigger aria-label="Opción de envío"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="camion">Envío por camión</SelectItem></SelectContent></Select>`, `<label><Checkbox checked={marcado} onCheckedChange={cambiar} />Seleccionar todos</label>` |
| `.sel` nativo | `<SelectNativo aria-label="Sede" value={sede} onChange={cambiar}><option value="XE">Quetzaltenango</option></SelectNativo>`; conserva el desplegable del navegador y usa la misma flecha original que `SelectTrigger`, con `--g600` |
| `modal()` / `.modal-*` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` en `ui/dialog`; `grande` en `DialogContent` reproduce `.modal-g` |
| `confirmar()` | `<VentanaConfirmacion titulo="Eliminar pedidos facturados" texto="La eliminación queda en la bitácora." textoConfirmar="Eliminar" variante="peligro" alConfirmar={eliminar}><Button variant="peligro">Eliminar</Button></VentanaConfirmacion>`; admite confirmación asíncrona, evita doble envío, muestra errores y restaura el foco |
| `toast()` | `const mensaje = useMensajes(); mensaje("Usuario guardado.", "exito")`; tipos `exito` (por omisión), `aviso`, `error`; 4000 ms; `ProveedorMensajes` ya está en el layout raíz |
| información emergente | `<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Información</Button></TooltipTrigger><TooltipContent>Seleccione uno o varios pedidos facturados.</TooltipContent></Tooltip></TooltipProvider>` |
| `IC` / `ico()` | `<Icono nombre="bodega" />`; `NombreIcono` limita los nombres a los originales; incluye las nueve industrias; SVG decorativo con `aria-hidden` |
| `cab()` / `.cab-pag.cab-fx` | `<EncabezadoModulo eyebrow="Módulo de reportes" titulo="Reportes y bitácora" instruccion="Despacho, rutas realizadas y bitácora de los dos sistemas, por periodo." acciones={acciones} />` |
| `.aviso-v/a/r/z` | `<Aviso tipo="verde">La fecha y la hora programadas son obligatorias.</Aviso>`; tipos `verde`, `ambar`, `rojo`, `azul` |
| `chipEstado()` / `.estado-*` | `<ChipEstado estado="PREP" />`; `PREP` = En Preparación, `DESP` = Despachado, `RUTA` = En Ruta, `ENTR` = Entregado |
| `.tabla-caja` / `.tabla` | `<Tabla><caption>Rutas y pedidos</caption><thead>…</thead><tbody>…</tbody></Tabla>`; conserva `der`, `cen`, `cod`, `kg` |
| `.pestanas` | `<Pestanas etiqueta="Reportes" valor={pestana} alCambiar={cambiar} opciones={[{ valor: "despacho", texto: "Despacho", contenido: tabla }]} />`; cada opción admite `contador` |
| `.seg` | `<BotonesSegmentados etiqueta="Periodo" valor={periodo} alCambiar={cambiar} opciones={[{ valor: "dia", texto: "Día" }, { valor: "semana", texto: "Semana" }]} />` |
| `.medidor` | `<Medidor etiqueta="Peso total" valor={peso} maximo={capacidad} />`; limita la barra a 0–100 %, conserva los estados lleno y exceso |
| `.vacio` | `<Vacio icono="ruta" titulo="No hay rutas en este periodo" />`; admite texto hijo |
| `campoFecha()` | `<CampoFecha etiqueta="Fecha programada" name="fechaProgramada" valor={fecha} alCambiar={cambiarFecha} />` |
| hora de `montarFacturacion()` | `<CampoHora etiqueta="Hora programada" name="horaProgramada" valor={hora} alCambiar={cambiarHora} />` |
| `fmt()` / `kg()` | `formatoNumero(2500.125)` → `"2,500.125"`; `formatoKg(2500)` → `"2,500 kg"`, en `comunes/formato`; son solo presentación, no conversión ni cálculos de negocio |

`CampoFecha` y `CampoHora` usan `@/lib/fechas`: `valor` y `alCambiar` trabajan con `AAAA-MM-DD` y `HH:MM`, o `""`. Un borrador inválido se conserva para corregirlo, entrega ISO vacío, muestra el formato esperado al salir y bloquea la validación HTML del formulario. Si se proporciona `name`, un campo oculto envía solo el valor ISO. Admiten las propiedades del input como `required` y `disabled`; el consumidor sigue validando la entrada con Zod en el servidor. El selector nativo ocupa la caja completa del campo y por ello se abre debajo, alineado a la izquierda, como en el prototipo.

### Armazón e integración posterior

`@/componentes/comunes/armazon/Armazon` es presentacional. Recibe `sistema` (`sitio` o `picking`), `modulo`, `nombreModulo`, `usuario` (`nombre`, `rol`, `sede`), `opciones` (`href`, `texto`, `icono`, `activa`, `contador` opcional), `sedes` (`id`, `nombre`), `sede`, `alCambiarSede`, `alSalir` e hijos. El selector solo aparece con varias sedes y en `facturacion`, `bodega`, `ruta`, `reportes`. El menú reducido se recuerda con la preferencia visual `incovsa-menu-reducido`; no se guardan datos de negocio en el navegador. En teléfono y tableta el menú mantiene el foco dentro, cierra con Escape o al tocar afuera y devuelve el foco al botón Menú.

Los layouts `/panel` y `/picking` usan `ArmazonEjemplo`, con datos fijos y sin lecturas internas ni operaciones del servidor. Las páginas raíz muestran `MuestraComponentes`, con controles de módulo y sedes solo para probar el armazón. **JG-07 reemplaza ese adaptador** por sesión, permisos, sede en cookie y cierre real de sesión; las tareas de los módulos reemplazan las páginas temporales. Los enlaces del menú ya apuntan a sus rutas definitivas; las pantallas de negocio están fuera de JG-05.

### Decisiones y evidencia

- RNF-08 prevalece sobre el contraste insuficiente del prototipo: la miga, los textos del encabezado de módulo y los encabezados de tabla usan el gris aprobado `--g600` sobre `--g50`, sin agregar colores. Precisión registrada en `specs/20` y `specs/18`.
- Componentes de shadcn adaptados manualmente con `radix-ui`, `clsx` y `tailwind-merge`, ya declarados por JG-02; sin `cn`, `lucide-react` ni librerías de animación adicionales. Los SVG y las animaciones CSS son los originales.
- Al actualizar desde `develop` se incorporó JM-02. `Unidades` ahora usa `.unid` y `.resto` del CSS global y los tokens existentes, con el radio original de 6 px centralizado; conserva su API, textos y cálculos. La prueba general de tokens detectó primero los colores literales y pasa después de la adaptación.
- `devIndicators: false` evita que el botón flotante de Next.js cubra controles en teléfono. No desactiva los errores ni next-devtools. `.playwright-mcp/` se ignora como salida generada.
- Las pruebas y capturas esperan la hidratación antes de tocar controles o de ocultar el cursor, evitando cambios del DOM anteriores a que React esté listo. La comprobación de ancho compara el documento con el viewport configurado, también con el menú abierto.
- [Comparación visual y 33 capturas en los tres tamaños](../evidencias/JG-05/README.md), incluidos los componentes, los errores de fecha/hora y la confirmación. Playwright: 51 pruebas aprobadas en los tres tamaños; next-devtools sin errores de compilación ni de ejecución.
- Verificación final: `npm run verificar` aprobó formato, lint, tipos y 91 pruebas después de incorporar JM-02 (57 antes de actualizar); `npm run build` generó correctamente `/`, `/panel` y `/picking`; los scripts aprobaron 109 pruebas y el plan validó sus 62 tareas. No se cambiaron umbrales ni se omitieron pruebas.
