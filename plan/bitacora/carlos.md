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
- Hecho: `max_size 27MB` en el Caddyfile (tope de galería 5×5 MB + multipart). El flujo `produccion-imagen` comprueba que 7 MB no recibe 413, que 28 MB sí, y que un intento de acceso fallido a través de Caddy no registra una `X-Real-IP` falsificada en la bitácora.
- Decisiones: el control exacto del tamaño de cada imagen sigue en la aplicación; Caddy solo deja pasar el cuerpo completo de la ruta.
- Pendiente o aviso para otros:
  - **CE-06:** el arranque sigue corriendo `prisma migrate deploy` en cada start; conviene moverlo al despliegue si un fallo de migración deja el contenedor reiniciando.
  - **CE-08:** confirmar `includeSubDomains` en HSTS con INCOVSA y el IPv6 de la red de Compose.
