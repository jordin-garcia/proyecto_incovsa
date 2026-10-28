---
id: CE-13
titulo: Correcciones de la auditoría del 26/10 en el sitio y el panel
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: hecha
depende_de: [DM-09]
programada: 2026-10-27
requisitos: [RF-SL-36, RN-39, RF-SW-07, RF-SW-23, RF-SW-06, RF-SW-12, RNF-05]
pantallas: [base.js › campoGaleria(), panel.js › noticias(), panel.js › contacto(), panel.js › solicitudes(), sitio.js › contacto()]
---

# CE-13 · Correcciones de la auditoría del 26/10 en el sitio y el panel

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** DM-09

## Objetivo
Corregir los hallazgos del paso 1 de la auditoría del 26/10 (H-56 a H-63 y H-65) en Noticias, Contacto y Solicitudes (DM-07, DM-08 y DM-09) y en la galería de imágenes compartida del panel. También hay que aplicar D-08: las pruebas de navegador guardan la evidencia solo con `EVIDENCIA=1`. Los tres hallazgos de severidad Media de la auditoría están aquí:
- el Detalle «—» de la Bitácora en Noticias (H-56) y en Solicitudes (H-57);
- la galería del panel, distinta del prototipo (H-58).

Jordin asignó este trabajo a Carlos el 26/10 porque Daniela tenía DM-10 y DM-11 atrasadas al decidirlo, y Carlos no tiene nada disponible mientras CE-08 siga bloqueada.

## Contexto que debes leer
- `plan/auditorias/2026-10-26.md`, paso 1 (H-56 a H-65), D-07 y D-08
- `specs/05-sitio-web.md` («Noticias», «Contacto» y bandeja de solicitudes); `specs/10-picking-reportes.md` (pestaña «Bitácora»); `specs/18`, «Decisiones de la auditoría del 26/10»; `plan/convenciones.md` §6 («Evidencia») y §7
- `plan/protocolo.md` §E3: cada hallazgo lleva una prueba que lo habría detectado
- Prototipo:
  - `base.js` › `campoGaleria()` (l. 813) y `estilos.css:991-999` (`.gc-*`);
  - `panel.js` › `noticias()` (l. 351 y 361), `contacto()` (l. 372-380) y `solicitudes()` (l. 416, 417 y 423);
  - `sitio.js` › `contacto()` (validación al salir del campo).
- `## Resultado` de DM-04, DM-05, DM-07, DM-08, DM-09 y JG-24 (la regla de `detalle.resumen` de la Bitácora está en JG-24)

## Qué hacer
1. **H-56 (RF-SL-36, RN-39):** en `src/modulos/contenido/noticias.ts`, crear, editar y eliminar guardan `detalle.resumen` con el título de la noticia, como `bit(..., t)` del prototipo. Una prueba comprueba que Reportes › Bitácora muestra el título y no «—».
2. **H-57 (RF-SL-36, RN-39):** en `src/modulos/solicitudes/bandeja.ts`, `detalle.resumen` lleva los textos del prototipo:
   - «SOL-2026-0001 · En proceso» al cambiar el estado;
   - «SOL-… · *Nombre*» o «SOL-… · sin responsable» al cambiar el responsable;
   - solo el folio en el comentario.

   Con su prueba.
3. **H-58 (RF-SW-07, RF-SW-23):** `CampoGaleria` (`src/componentes/panel/contenido.module.css`) sigue a `campoGaleria` del prototipo:
   - rejilla `repeat(auto-fill, minmax(104px, 1fr))`;
   - miniatura 4:3 con radio de 10 px;
   - número redondo y acciones como `.gc-*`.

   Quita la copia de esas reglas de `noticias.module.css`. Conserva la excepción de contraste del área de subida (`--g600`, `specs/20`). Una prueba mide la galería de Catálogo › Editar producto.
4. **H-59:** `noticias.test.ts` aísla el límite de 5 imágenes con un sexto elemento válido y único, como `panel-catalogo.test.ts` (H-08), y comprueba el error exacto.
5. **H-60:** los campos de Contacto con tope (`.max(150)`, `.max(20)`) tienen `maxLength` o un mensaje en español, nunca el mensaje de Zod en inglés.
6. **H-61:** el formulario de Contacto valida al salir del campo **solo** el correo y el teléfono. Los demás campos se validan al pulsar «Enviar mensaje», como el prototipo.
7. **H-62:** el editor de Información de contacto sigue a `panel.js` › `contacto()`:
   - el mapa inválido se avisa con el mensaje de error del prototipo («El mapa debe ser la dirección del mapa insertado de Google Maps (https://www.google.com/maps/embed?…).»);
   - se quita «Indique un correo válido.», salvo que `specs/05` lo pida.
8. **H-63 (RNF-05):** el comentario del responsable tiene un tope de 2000 caracteres, igual que el mensaje de Contacto, validado en el navegador y en el servidor. Regístralo en `specs/05` y en `specs/18`.
9. **H-65 (D-08):** **toda** prueba de `pruebas-e2e/**` que escribe capturas o archivos dentro del repositorio, fuera de `test-results/`, solo lo hace con `EVIDENCIA=1`. Usa una sola ayuda compartida en `pruebas-e2e/comunes/`. Para encontrarlas, busca `screenshot({ path`, `writeFile` y `evidencias` en `pruebas-e2e/`. Al 26/10 son, al menos:
   - sitio: `noticias.spec.ts`, `contacto.spec.ts` y `nosotros.spec.ts` (DM-06);
   - panel: `solicitudes.spec.ts`, `contenido.spec.ts` (DM-04), `industrias-y-catalogo.spec.ts` (DM-05), `documentos.spec.ts` (DM-10) y `auditoria-jg24.spec.ts`;
   - acceso: `auditoria-jg24.spec.ts`;
   - picking: `auditoria-jg24.spec.ts` y `facturacion-dos-facturadores.spec.ts` (evidencia `jc-05/latencia-*.json`).

   Las capturas que solo se adjuntan al reporte (`info.attach` o `info.outputPath`) no cambian. Sin la variable, una corrida completa de `npm run e2e` deja `git status` limpio. Las aserciones no cambian: solo se salta la escritura del archivo.
10. En el `## Resultado` de DM-04, DM-05, DM-07, DM-08 y DM-09, agrega `### Correcciones de la auditoría (2026-10-26)`. Su estado no cambia.

## Archivos que creas o modificas
- `src/modulos/contenido/noticias.ts`, `noticias.test.ts`; `src/modulos/solicitudes/bandeja.ts`, `esquemas-bandeja.ts`, `esquemas.ts` y sus pruebas
- `src/componentes/panel/contenido.module.css`, `noticias.module.css`, `src/componentes/panel/CampoGaleria.tsx`, `EditorContacto.tsx`; `src/modulos/contenido/esquemas-contacto.ts`
- `src/componentes/sitio/FormularioContacto.tsx`
- `pruebas-e2e/comunes/` (ayuda de evidencia, crear); toda prueba de `pruebas-e2e/**` que escribe evidencia en el repositorio (paso 9); `pruebas-e2e/panel/**` (prueba de la galería)
- `specs/05-sitio-web.md`, `specs/18-historial-de-decisiones.md` (H-63)
- `plan/tareas/DM-04-*.md`, `DM-05-*.md`, `DM-07-*.md`, `DM-08-*.md`, `DM-09-*.md` (solo la sección de correcciones); `plan/bitacora/carlos.md` (con el aviso para Daniela y José Daniel)

## Criterios de aceptación
1. **RF-SL-36 / RN-39 (H-56, H-57):** en Reportes › Bitácora, las operaciones de Noticias muestran el título, y las de Solicitudes, los textos del prototipo; nunca «—».
2. **RF-SW-07 / RF-SW-23 (H-58):** las galerías de Contenido, Industrias, Catálogo y Noticias tienen la rejilla, la miniatura 4:3, el radio y el número redondo del prototipo, medidos con Playwright en 390, 768 y 1440 px.
3. **RF-SW-06 / RNF-05 (H-59 a H-63):** el límite de 5 imágenes de Noticias se prueba aislado. El formulario de Contacto no muestra mensajes en inglés y valida al salir del campo solo el correo y el teléfono. Información de contacto avisa del mapa inválido como el prototipo. El comentario de la bandeja tiene su tope.
4. **D-08 (H-65):** después de `npm run e2e` sin `EVIDENCIA=1`, `git status` no muestra archivos modificados; con `EVIDENCIA=1`, las pruebas siguen escribiendo su evidencia.

## Pruebas obligatorias
- Una prueba por hallazgo (criterios 1 a 4), con el hallazgo o el requisito en el nombre
- La batería completa de navegador (protocolo B7), y `git status` limpio al terminarla

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e
git status --short
```

## Fuera de alcance
- La excepción de contraste de la bandeja (H-64): ya quedó resuelta en JG-13, con D-07 ratificada en `specs/05`, `specs/18` y `specs/20`.
- Los hallazgos de otros pasos (JM-09, JC-09, JG-25).
- DM-10 y DM-11, que siguen siendo de Daniela.

## Notas
- Rama `carlos/CE-13-correcciones-auditoria-sitio-y-panel`. Tarea creada en la convergencia 2 (JG-13), por decisión de Jordin del 26/10.
- Tocas archivos de Daniela (sitio y panel), de José Daniel (`facturacion-dos-facturadores.spec.ts`), y la evidencia de JG-24. Esta tarea te autoriza a hacerlo. En tu bitácora deja el aviso para cada uno, con los archivos que cambiaron.
- En Cursor, trabaja en local, no con el agente en la nube (decisión del coordinador del 18/10; ver tu bitácora).

## Resultado

Cerrada el 27/10/2026. La rama es `cursor/ce-13-correcciones-auditoria-0917`: el entorno del agente exige ese nombre. La nota de la tarea pedía `carlos/CE-13-correcciones-auditoria-sitio-y-panel`.

- **H-56.** Crear, editar y eliminar una noticia guardan `detalle: { resumen }` con el título de ese momento. Reportes › Bitácora muestra el título y no «—».
- **H-57.** El resumen de la solicitud usa «SOL-… · Asignado», «En proceso» o «Solucionado»; «SOL-… · {nombre}» o «SOL-… · sin responsable»; y solo el folio en el comentario.
- **H-58.** La galería compartida usa `repeat(auto-fill, minmax(104px, 1fr))`, miniatura 4:3, radio de 10 px, número redondo y acciones de 28 px. Se quitó la copia de `noticias.module.css`. El área de subida sigue en `--g600`.
- **H-59.** Un sexto elemento válido y único falla solo con `too_big` y máximo 5. Cinco referencias distintas pasan.
- **H-60.** Nombre, empresa y correo llevan `maxLength` 150 y el mensaje «El … admite hasta 150 caracteres.» (el correo: «El correo admite hasta 150 caracteres.»). El teléfono lleva 20 y «El teléfono admite hasta 20 caracteres.». Decisión reversible de plano: tope del navegador y mensaje en español.
- **H-61.** El formulario valida al enviar. Al salir del campo solo se validan el correo y el teléfono.
- **H-62.** El mapa inválido se avisa en el aviso del prototipo, no bajo el campo. El correo del panel **sí se valida** (ver «Terminada por el coordinador»).
- **H-63.** El comentario admite 2000 caracteres en el navegador y en el servidor. Los ya guardados no se reescriben y no hay migración. Quedó en `specs/05` y `specs/18`.
- **H-65.** `pruebas-e2e/comunes/evidencia.ts` escribe capturas y archivos solo con `EVIDENCIA=1`. `info.attach` y lo que ya cae en `test-results/` no cambian. `plan/convenciones.md` ya documentaba D-08 y es archivo protegido: no se editó.

**Ayuda de evidencia.** `capturaEvidencia(page, ruta, opciones)` y `archivoEvidencia(ruta, contenido)` no hacen nada salvo que `process.env.EVIDENCIA === "1"`. La captura se toma en memoria y luego se reemplaza el archivo.

**Contrato de `detalle.resumen`.** Es el texto que muestra la Bitácora. Si no es una cadena, se ve «—».

**Verificación local.** `npm run verificar`: formato, lint, tipos y 431 pruebas en 52 archivos, código 0. `npm run build`: compiló, código 0. `npm run e2e`: 414 pasaron en 12.0 min, código 0. Después, `git status --short` no mostró capturas ni archivos de prueba (solo esta nota, aún sin commit). Con `EVIDENCIA=1 npx playwright test pruebas-e2e/panel/solicitudes.spec.ts --project=escritorio`: 3 pasaron y `git status --short` listó siete PNG reescritos en `pruebas-e2e/panel/evidencias/DM-09/`. Esos PNG se restauraron para no mezclar evidencia regenerada con el cambio.

### Terminada por el coordinador (27/10/2026)

Jordin la terminó a partir de #140 y de su seguimiento #141 (CE-13b), que se cierran (protocolo §E4). La rama es `jordin/CE-13-correcciones-auditoria-sitio-y-panel`.

- **H-62, correo del panel.** Carlos decidió conservar la validación del correo de Información de contacto y Jordin la confirmó el 27/10: puede quedar vacío y, si se escribe, «Indique un correo válido.» al salir del campo, sin guardar; el servidor rechaza el mismo caso. Quedó en `specs/05` («Panel administrativo») y `specs/18`.
- **Pruebas de CE-13b.** Usaban `test.skip`, que `integridad-pruebas` rechaza (#141 nunca pasó por la CI). Ahora corren en todos los tamaños, sin omitirse: guardan el mismo correo fijo, como DM-08, y el caso inválido comprueba que nunca se guarde.
- **Carrera en `sitio/contacto.spec.ts`.** Con D-08, la captura sin `EVIDENCIA=1` ya no espera, y la prueba elegía el país antes de que React tomara el formulario («Departamento» no aparecía). El formulario de Contacto expone `data-hidratado`, como el Catálogo, y las dos pruebas lo esperan.
- **`specs/18`.** Se resolvió el conflicto con JG-14: quedan las dos secciones.
- **Carrera en `sitio/auditoria-ce13.spec.ts` (H-61).** Por la misma causa, React repetía tarde el foco y la salida de los campos y marcaba el correo antes de tiempo (falló en teléfono y tableta). Las dos pruebas esperan `data-hidratado`.
- **Mapa en `panel/auditoria-ce13.spec.ts`.** Información de contacto carga los mapas de Google de las dos sedes, y en teléfono el evento `load` pasaba de 30 s. Como `seguridad/cabeceras.spec.ts`, el archivo responde el mapa en local; la prueba de H-62 tarda unos 3 s.

**Verificación (coordinador).** `npm run verificar`: 433 de 433. `npm run build`: correcto. `integridad-pruebas` contra `develop`: correcta. Batería de navegador por partes, en una base nueva y con 1 worker (`plan/evidencias/CE-13/`): `acceso` 53 de 54 (RN-54 falla también en `develop` en este equipo), `comunes` 51, `flujo` 12 al repetirla (arranque en frío, H-84 de JG-25) y `seguridad`, `panel` 28 + 28 + 28 tras el arreglo del mapa, `sitio` 60 tras el de H-61, y `picking` 47 + 47 + 56. Los dos archivos de `auditoria-ce13` pasan 36 de 36 y 12 de 12 con `--repeat-each=2`.

