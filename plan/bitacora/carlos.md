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

## 2026-10-19 · CE-03 · Configuración: usuarios del picking
- Hecho: Gerencia y Soporte crean, editan, restablecen y eliminan usuarios del picking desde Configuración. El módulo `usuarios` también acepta el sistema `sitio` para CE-04. La contraseña no sale en la bitácora ni en la respuesta, y restablecer o eliminar cierra las sesiones.
- Decisiones: la página de Configuración nace aquí, con la pestaña Camiones en solo lectura hasta CE-02. El nombre de usuario se normaliza en minúsculas y el rol se recorta, como el prototipo.
- Pendiente o aviso para otros:
  - **CE-02:** la pestaña Camiones de `/picking/configuracion` lista los camiones activos y no tiene alta, edición ni baja. Esas acciones son tuyas; el archivo de la página va a chocar con este PR.
  - **CE-04:** usa `AdministracionUsuarios` y las acciones de `@/modulos/usuarios/acciones` con `sistema: "sitio"`. El servicio ya ignora las sedes del sitio.
