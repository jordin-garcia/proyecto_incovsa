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
