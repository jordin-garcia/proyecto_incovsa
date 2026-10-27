# Bitácora de Carlos Hugo Escobar

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-18 · CE-01 · Herramientas obligatorias del agente (Cursor) — bloqueada
- Hecho: En Cursor Cloud Agent se instalaron/verificaron Node 24.22.0, npm 11.19.1, PostgreSQL 18.6, Git (identidad Hugo Escobar / chescobarg@correo.url.edu.gt), Context7 (docs Server Actions Next.js v16.2.9) y Playwright (captura Inicio · INCOVSA). MCP del proyecto y context7 personal configurados. `verificar-entorno` queda en ❌ solo por `gh api user` (token App `cursor[bot]` → 403).
- Decisiones: marcar CE-01 como `bloqueada` (no `hecha`) hasta tener sesión `carloshugoeg`; no se modificó ningún archivo protegido del repo.
- Pendiente o aviso para otros:
  - **Carlos:** en la Mac, `gh auth login` como `carloshugoeg` + `gh auth setup-git`, o aportar PAT/`GH_TOKEN`; luego reabrir conversación para cerrar CE-01 como hecha.
  - **Jordin:** el criterio 2 de las tareas XX-01 (`gh api user`) es incompatible con el token de Cursor Cloud Agent (`cursor[bot]`); conviene decidir si Cloud Agents usan PAT de la persona o si el script acepta GraphQL `viewer.login` / acceso al repo.
  - **Todos:** hasta CE-01 hecha, B0 impide el resto de tareas de Carlos.

## 2026-10-18 · CE-01 · Herramientas obligatorias del agente (Cursor)
- Hecho: En la Mac de Carlos (Cursor local) se instaló Node 24.22.0 (`brew install node@24` + PATH), se configuró Git (`autocrlf=false`, `pull.rebase=true`, email `chescobarg@correo.url.edu.gt`), se confirmó `gh` como `carloshugoeg`, PostgreSQL 18.6, Context7 (Server Actions Next.js v16.2.9), Playwright (captura Inicio · INCOVSA) y MCP del proyecto + context7 personal. `verificar-entorno` → «El equipo tiene todo lo necesario.» CE-01 pasa a `hecha` y se quita el `bloqueo`.
- Decisiones: el entorno válido es Cursor local en la Mac (decisión coordinador 18/10 + specs/16 decisión 70); Context7 sin clave API; no se tocó ningún archivo protegido del repo.
- Pendiente o aviso para otros:
  - **Todos:** B0 de Carlos ya está cumplido; CE-02 sigue esperando JG-07.
  - **Jordin:** confirmado en Mac que el criterio 2 (`gh api user` → cuenta personal) es incompatible con el token App de Cursor Cloud Agent; las tareas CE se hacen en Cursor local.

## 2026-10-19 · CE-02 · Configuración: camiones
- Hecho: la pestaña Camiones de `/picking/configuracion` lista, crea, edita y elimina de forma lógica los camiones de las sedes del usuario. Permiso `pk.cfg.camiones`. Bitácora "Creación de camión", "Edición de camión" y "Eliminación de camión". `camionesActivosDeSede(sedeId)` queda lista para Facturación. La pestaña Usuarios, solo para Gerencia y Soporte, muestra la cuenta y no el CRUD. Corrección B8: un camión elegido en «Envío por camión» no se elimina y la pantalla abre «No se puede eliminar». El formulario valida en `onBlur`. El contraste de las pestañas inactivas se corrigió en `src/app/picking/configuracion/configuracion.css` con `--g600`. No se tocó `globals.css`.
- Decisiones: la identificación es un texto normal, sin la nota amarilla de P-01. La capacidad se lee como el prototipo (comas de miles) y rechaza cero, negativos, texto y más de tres decimales. La pantalla no usa la sede de la cookie. Usa todas las sedes de `sedesDelUsuario`.
- Pendiente o aviso para otros:
  - **JC-04:** Facturación puede dejar de consultar `camion` en `src/modulos/envios/opciones.ts` y usar `camionesActivosDeSede` de `src/modulos/camiones/servicio.ts`. El nombre del desplegable es `identificacion` y la capacidad es `capacidadKg` con tres decimales. La función no autoriza. La sede ya tiene que estar autorizada.
  - **CE-03:** la pestaña Usuarios ya existe, con los encabezados del prototipo y la cuenta de usuarios del picking. El botón "Nuevo usuario" y el CRUD no están.
  - **Jordin:** las pestañas globales siguen en g500 y fallan axe si se activa color-contrast fuera de Configuración.

## 2026-10-19 · CE-03 · Configuración: usuarios del picking
- Hecho: pestaña Usuarios en `/picking/configuracion` con alta, edición, restablecimiento de contraseña y eliminación lógica. Módulo `src/modulos/usuarios/` (esquemas, servicio, acciones, pruebas) y componentes en `src/componentes/usuarios/` reutilizables por CE-04. E2E en 390/768/1440 con axe. Solo Gerencia y Soporte (`esAccesoTotal`).
- Decisiones: usuario de solo lectura al editar; RN-54 en servicio (rechaza nombres de `ambos`); contraste de ayuda del modal con `--g600`; se eliminó `contarUsuariosDelPicking` de camiones.
- Pendiente o aviso para otros:
  - **CE-04:** reutilizar `listarUsuarios("sitio")`, `listarPermisos("sitio")` y los componentes de `src/componentes/usuarios/` en el panel del sitio.
  - **Todos:** no hay permiso `pk.usuarios`; la administración de cuentas es solo Gerencia/Soporte.

## 2026-10-19 · CE-04 · Panel: usuarios del sitio
- Hecho: `/panel/usuarios` con alta, edición, restablecimiento y eliminación lógica para el sistema `sitio`. Componentes compartidos con `sistema="sitio"`. Acciones `*SitioAccion`. E2E 390/768/1440 con axe. Solo Gerencia y Soporte.
- Decisiones: esquemas de sitio sin sede; al degradar `ambos` desde el sitio se vacían sedes; textos en `textos.ts`.
- Pendiente o aviso para otros:
  - **Todos:** no hay permiso `sit.usuarios`; la sección del panel sigue abierta solo con `esAccesoTotal`.

## 2026-10-19 · CE-05 · Producción con Docker Compose y Caddy
- Hecho: Dockerfile de Node 24 (standalone, usuario sin privilegios, `prisma migrate deploy` y luego un solo `node server.js`), Compose con Caddy, la aplicación y PostgreSQL 18 sin puerto publicado, Caddyfile con HSTS, `X-Real-IP` y SSE sin búfer, `.env.produccion.example` y el flujo `produccion-imagen`.
- Decisiones: el límite del cuerpo en Caddy es 6 MB (margen sobre imágenes de 5 MB y multipart); Next sigue en 3 MB. El volumen de Postgres 18 es `/var/lib/postgresql`. La imagen final conserva `node_modules` de `npm ci` porque `prisma` y `tsx` son devDependencies. Las demás cabeceras de RNF-16 quedan en JG-11.
- Pendiente o aviso para otros:
  - **Jordin (JG-11):** las cabeceras CSP, nosniff, Referrer-Policy y frame-ancestors siguen en `next.config.ts`. Caddy ya manda HSTS. Conviene comprobarlas a través de Caddy cuando JG-11 cierre.
  - **Jordin (JG-10):** el flush SSE está en el Caddyfile; la prueba de punta a punta queda para cuando exista SSE.
  - **Jordin:** `.gitignore` admite `!.env.produccion.example` (mínimo, fuera de la lista de archivos de la tarea).
  - **CE-06:** el despliegue automático no está en este PR. La imagen de referencia es `ghcr.io/jordin-garcia/proyecto_incovsa:latest`.

## 2026-10-20 · CE-05 · Correcciones: límite Caddy y prueba de X-Real-IP
- Hecho: `max_size 27MB` en el Caddyfile (tope de galería 5×5 MB + multipart). El flujo `produccion-imagen` comprueba que 7 MB no recibe 413 y que un intento de acceso fallido a través de Caddy no registra una `X-Real-IP` falsificada en la bitácora.
- Decisiones: el control exacto del tamaño de cada imagen sigue en la aplicación; Caddy solo deja pasar el cuerpo completo de la ruta.
- Pendiente o aviso para otros:
  - **CE-06:** el arranque sigue corriendo `prisma migrate deploy` en cada start; conviene moverlo al despliegue si un fallo de migración deja el contenedor reiniciando.
  - **CE-08:** confirmar `includeSubDomains` en HSTS con INCOVSA y el IPv6 de la red de Compose.

## 2026-10-20 · CE-05 · Correcciones: prueba de cuerpo de galería en CI
- Hecho: se retiró la aserción de 28 MB → 413 en `produccion-imagen`. Sin sesión la ruta responde 403 sin leer el cuerpo y Caddy puede devolver ese 403 antes de aplicar `max_size`. Queda la prueba de 7 MB sin 413.
- Decisiones: ninguna nueva sobre el límite 27 MB.
- Pendiente o aviso para otros: ninguno.

## 2026-10-20 · CE-06 · Despliegue automático desde main con GitHub Actions y GHCR
- Hecho: `.github/workflows/despliegue.yml` — paquete prod `ghcr.io/<repo>` solo en `main` sin `modo_prueba`; cualquier otra ref usa `<repo>-prueba`. `provenance`/`sbom` off; poda ≤ 5 etiquetadas; SSH solo desde `main`; rollback con `etiqueta` vía `env`. Evidencia en `evidencia/CE-06/` (run 39480353926: 6→5 en `-prueba`).
- Decisiones: carpeta remota `~/incovsa` (CE-08); rollback anula ENTRYPOINT; sin secretos VPS el flujo termina tras GHCR.
- Pendiente o aviso para otros:
  - **CE-08:** secretos `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH`, `VPS_KNOWN_HOSTS` en environment `produccion`; carpeta `~/incovsa`; fijar `IMAGEN_APP` en el `.env` (este flujo no publica `:latest`).
  - **JG-19:** primer despliegue real al integrar en `main`; `gh run watch` sobre este flujo.

## 2026-10-20 · CE-07 · Respaldos automáticos y prueba de restauración
- Hecho: `scripts/respaldo.sh` genera el volcado con `pg_dump -Fc` y lo sube con rclone. Conserva 7 diarios y 4 semanales. `scripts/restaurar.sh` restaura en una base nueva y solo reemplaza la de producción si `CONFIRMAR_SOBRESCRITURA` es exactamente `SOBRESCRIBIR PRODUCCION`. El flujo `produccion-respaldo` compara las filas de cada tabla. La nota para el Documento 5 está en `evidencia/CE-07/README.md`.
- Decisiones: la retención y la confirmación viven en `scripts/lib-respaldo.mjs`, y los shell lo llaman. En el VPS se usa `docker compose exec`. En la CI, `USAR_DOCKER_RUN=1` contra el alias `postgres`. El remoto de la CI es local hasta que exista R2 (P-94). No hay cifrado propio (decisión 34).
- Pendiente o aviso para otros:
  - **Jordin:** CE-07 agregó `scripts/lib-respaldo.mjs` y `scripts/respaldo.test.mjs` (regla de retención/confirmación y sus pruebas). `convenciones.md` §2 deja `scripts/**` en tu zona salvo `respaldo.sh`; aquí son soporte directo de ese script.
  - **CE-08:** instalar en el VPS Node 24 y rclone en el `PATH` del usuario de Docker, configurar el remoto del bucket privado y el cron `15 2 * * * cd "$HOME/incovsa" && set -a && . ./.env && set +a && ./scripts/respaldo.sh` (misma carpeta `~/incovsa` del despliegue CE-06). `RCLONE_DEST` sale de `.env`. La contraseña no se imprime.
  - **CE-11:** el apartado de respaldo y restauración del Documento 5 puede partir de `evidencia/CE-07/README.md`. La prueba contra R2 queda para cuando CE-08 tenga la cuenta.

## 2026-10-20 · CE-08 · Preparación del VPS, del dominio y de Cloudflare R2 — bloqueada
- Hecho: guía y scripts en `evidencia/CE-08/` (`preparar-vps.sh`, `verificar-vps.sh`, `pasos-hugo.md`, `bloqueo.md`). Comentario `IMAGEN_APP` en `.env.produccion.example`. Tarea en `estado: bloqueada` con campo `bloqueo` (P-10, P-93, P-94). Comprobado: no hay environment GitHub `produccion` ni secretos `VPS_*`; el agente recibe 403 al intentar crearlos.
- Decisiones: no se marca hecha sin evidencia real de SSH/UFW/HTTPS/R2/despliegue. Los scripts viven en `evidencia/CE-08/` (no en `scripts/`, zona de Jordin salvo respaldo/restaurar). Secretos solo los escribe Carlos en el gestor, el VPS y GitHub (decisión 70).
- Pendiente o aviso para otros:
  - **Jordin:** CE-08 bloqueada por P-10 / P-93 / P-94. Pedir al Ing. William IP del VPS, DNS de `incovsa.com` y correo INCOVSA para Cloudflare a más tardar 28/10 (decisión 73). Si el DNS no pasa a Cloudflare, avisar también a Daniela (decisión 32).
  - **Daniela:** si INCOVSA no mueve el DNS a Cloudflare, las imágenes no irán por `imagenes.incovsa.com` y hace falta la ruta propia (decisión 32).
  - **Carlos:** en la Mac, con `gh` como `carloshugoeg`, crear `environment: produccion` y los secretos `VPS_*` cuando exista el VPS; seguir `evidencia/CE-08/pasos-hugo.md`.

## 2026-10-20 · CE-08 · Correcciones revision-claude
- Hecho: CORRECCIÓN 2 y 3 en `preparar-vps.sh` / `verificar-vps.sh` (SSH `00-incovsa.conf`, aborto sin llave, UFW 22/tcp, verificador solo root, solo puertos 22/80/443, `PermitRootLogin no`). CORRECCIÓN 1: se mantiene `evidencia/CE-08/` por la asignación del coordinador del proyecto («Prefer evidence under evidencia/CE-08/»); queda anotada en `## Resultado` y en el PR.
- Decisiones: sin grupo sudo en el usuario de despliegue (opcional del bot); docker basta.
- Pendiente o aviso para otros: ninguno nuevo; siguen P-10 / P-93 / P-94.

## 2026-10-27 · CE-13 · Correcciones de la auditoría del 26/10 en el sitio y el panel
- Hecho: H-56 a H-63 y H-65. La bitácora de noticias guarda el título y la de solicitudes los textos del prototipo. La galería compartida mide como `campoGaleria`. El formulario de Contacto recorta los topes en español y valida al salir solo correo y teléfono. El mapa inválido avisa con el texto del prototipo. El comentario de la bandeja admite 2000 caracteres. La evidencia de `pruebas-e2e` se escribe solo con `EVIDENCIA=1`, mediante `pruebas-e2e/comunes/evidencia.ts`.
- Decisiones: H-60 usa `maxLength` y el mensaje «El … admite hasta N caracteres.» (reversible). H-62 quita «Indique un correo válido.» y no lo registra en `specs/` (reversible). H-63 no migra comentarios ya guardados. `plan/convenciones.md` ya decía D-08 y es archivo protegido: no se editó. La rama del agente es `cursor/ce-13-correcciones-auditoria-0917`.
- Pendiente o aviso para otros:
  - **Daniela:** toqué `src/componentes/sitio/FormularioContacto.tsx`, `src/componentes/panel/contenido.module.css`, `noticias.module.css`, `EditorContacto.tsx`, `BandejaSolicitudes.tsx`, y las pruebas `pruebas-e2e/sitio/{contacto,noticias,nosotros}.spec.ts` y `pruebas-e2e/panel/{solicitudes,contenido,industrias-y-catalogo,documentos}.spec.ts`. Las aserciones siguen; solo se salta la escritura sin `EVIDENCIA=1`, salvo el aviso del mapa en `contacto.spec.ts`, que ahora espera el aviso y no el texto bajo el campo.
  - **José Daniel:** toqué `pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts` para usar la ayuda de evidencia. `info.attach` no cambia.
  - **Josué:** revisé `pruebas-e2e/picking/tablero.spec.ts`, `pruebas-e2e/picking/bodega-tiempo-real.spec.ts` y `pruebas-e2e/picking/flujo/tiempo-real.spec.ts`. Solo escriben en `test-results/` o `info.outputPath`, así que no los edité. JM-09 sigue siendo quien toca el tablero.
  - **Jordin:** toqué `pruebas-e2e/panel/auditoria-jg24.spec.ts`, `pruebas-e2e/acceso/auditoria-jg24.spec.ts`, `pruebas-e2e/picking/auditoria-jg24.spec.ts`, `specs/05-sitio-web.md` y `specs/18-historial-de-decisiones.md`. No edité `plan/convenciones.md`.
