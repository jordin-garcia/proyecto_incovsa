---
id: JM-08
titulo: "Bodega: contraste accesible de textos y tarjetas"
persona: josue
responsable: Josué Menéndez
hito: E3
prioridad: P1
estado: hecha
depende_de: [JM-03]
programada: 2026-10-19
requisitos: [RNF-08, RN-38]
pantallas: [picking.js › bodega, tarjetas y Detalle de Ruta]
---

# JM-08 · Bodega: contraste accesible de textos y tarjetas

**Responsable:** Josué Menéndez · **Hito:** E3 · **Prioridad:** P1 · **Programada:** lun 19/10 · **Depende de:** JM-03

## Objetivo

Corregir el contraste insuficiente de los textos de Bodega que detecta la suite completa de accesibilidad. El fallo impide terminar la verificación de DM-02; Daniela eligió esperar la corrección del dueño o del coordinador, conforme al protocolo §C.

## Contexto que debes leer

- `specs/15-requerimientos-no-funcionales.md`: RNF-08.
- `specs/16-arquitectura-y-tecnologia.md`: decisiones 53, 54 y 74.
- `plan/convenciones.md` §6 y §7; `## Resultado` de JM-03 y JG-05.
- Prototipo: `picking.js`, Bodega y Detalle de Ruta.
- `pruebas-e2e/acceso/permisos.spec.ts`, prueba `RN-38: ejemplo.05 en picking solo ve sus módulos`.

## Qué hacer

1. Reproducir el fallo con la aplicación y la semilla de demostración. La suite completa carga las variables locales por sus preparadores; no mostrar ni registrar credenciales.
2. Corregir los textos pequeños y etiquetas de Bodega usando únicamente tokens existentes. La prueba aislada señala `BodegaCliente.tsx`, texto «Quetzaltenango · la prioridad y las marcas no quedan en el historial»: `--g500` sobre `--g50` da 4.46:1, inferior al mínimo de 4.5:1. `--g600` es la alternativa existente de JG-05.
3. Comprobar también tarjetas con datos, líneas marcadas y modal. La primera ejecución completa detectó textos `.muted` de `TarjetaEnvio.tsx` sobre fondos claros y la etiqueta de `.ped-num small` con opacidad 0.75 (4.44:1).
4. En la prueba de accesibilidad de Bodega, retirar la exclusión actual de `color-contrast` y verificar el criterio completo con axe, conservando todas las demás comprobaciones.

## Archivos que creas o modificas

- `src/componentes/picking/bodega/BodegaCliente.tsx` (modificar).
- `src/componentes/picking/bodega/TarjetaEnvio.tsx` (modificar).
- `src/componentes/picking/bodega/ModalDetalle.tsx` (modificar si la verificación encuentra el mismo problema).
- `src/app/picking/bodega/bodega.css` (modificar).
- `pruebas-e2e/picking/bodega.spec.ts` (ampliar).

## Criterios de aceptación

1. **RNF-08 / RN-38:** la prueba de permisos de `ejemplo.05` en Bodega pasa en escritorio sin excluir reglas de axe.
2. **RNF-08:** Bodega vacía y con datos, líneas marcadas y Detalle de Ruta no tienen violaciones serias ni críticas de contraste en 390, 768 y 1440 px. La prueba propia ya no desactiva `color-contrast`.
3. **RNF-08:** se conservan textos, distribución y colores del design system, usando los tokens accesibles existentes. No se modifican los estilos globales ni las pruebas de otras personas.

## Pruebas obligatorias

- `pruebas-e2e/picking/bodega.spec.ts`: axe completo y estados del criterio 2.
- Prueba existente de `pruebas-e2e/acceso/permisos.spec.ts`, sin modificarla ni debilitarla.

## Verificación

```text
npm run verificar
npm run build
npm run e2e -- --workers=1
```

## Fuera de alcance

- Sitio público, autenticación, permisos, esquema de base de datos y estilos globales.
- Cambiar colores, tamaños o contenido ajenos al ajuste de contraste.

## Notas

- Reproducción del 19/10/2026 en DM-02: suite completa con un trabajador, 126 aprobadas, 2 omisiones preexistentes de Facturación y 1 fallo de contraste de Bodega. Las 15 pruebas de DM-02 pasaron.
- El fallo persiste de forma aislada al seleccionar los archivos de permisos e Inicio (este último proporciona la carga de variables), con `--project=escritorio --grep "RN-38: ejemplo.05" --workers=1`.
- Tras integrar esta corrección, el coordinador termina DM-02 a partir de la rama de Daniela (protocolo §E4) y repite la suite completa antes de cerrarla.

## Resultado

Lo terminó el coordinador (protocolo §E1), a partir de la reproducción que dejó Daniela en DM-02.

- **Qué se hizo:** la prueba de Bodega ya no desactiva `color-contrast`. Ahora analiza con todas las reglas de axe cuatro estados en cada tamaño: Bodega con datos (una ruta en Quetzaltenango), el pedido que recoge el cliente con una línea «Sin lote» y su Detalle (Gerencia en Guatemala), líneas marcadas, Detalle de Ruta y Bodega vacía (Gerencia en Escuintla, donde las pruebas no crean envíos). El pedido va a otra sede para no coincidir con `RN-38: ejemplo.05 en picking solo ve sus módulos`, que analiza la Bodega de Quetzaltenango sin exclusiones. Antes de medir espera a que terminen las animaciones finitas de entrada.
- **Correcciones**, solo en `src/app/picking/bodega/bodega.css` y con tokens existentes: `--g600` en `.ped-pie .muted`, `tr.lista .muted`, `tr.lista .cod`, `tr.lista .kg`, `.lote.sin`, `.det-env small` y `.det-g-cab .muted` (precedente de JG-05). La etiqueta «RUTA» de `.ped-num` pierde la opacidad 0.75 (de 4.44:1 a 6.55:1). No hizo falta tocar `BodegaCliente.tsx` ni `TarjetaEnvio.tsx`: el texto de la cabecera ya usaba `--g600` desde JC-04 (#81), y por eso `RN-38: ejemplo.05 en picking solo ve sus módulos` ya pasaba en `develop`.
- **Detalle de Ruta en teléfono:** axe completo encontró además `scrollable-region-focusable`: la lista de pedidos facturados y cada tabla se desplazan, pero no podían enfocarse con teclado. En `ModalDetalle.tsx` esas zonas llevan `tabIndex={0}`, `role="region"` y un nombre accesible («Pedidos facturados» y «Productos del pedido <número>»), sin cambios visibles.
- **Decisión del coordinador:** el cuadro lima del pedido que recoge el cliente conserva exactamente los colores del prototipo, con la etiqueta «PEDIDO» en opacidad 0.75 (2.76:1). Es una excepción documentada a RNF-08 en `specs/18` y el único nodo que excluye la prueba (`.exclude(".ped-num.recoge small")`).
- **Apoyo de pruebas:** `pruebas-e2e/picking/preparar-envio.ts` acepta el tipo y la sede como argumentos (`crear <numero> pedido <sede>`). El pedido se crea sin camión ni piloto y con una línea y un detalle sin lote.
- **Cómo usarlo:** cualquier pantalla nueva de Bodega debe pasar `violacionesGraves(page)` de `bodega.spec.ts` sin exclusiones adicionales. Para textos secundarios sobre fondos claros, usa `--g600`, no `--g500`.

