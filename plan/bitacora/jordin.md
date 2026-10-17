# Bitácora de Jordin García

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JG-01 · Herramientas obligatorias del agente (Claude Code y Codex)
- Hecho: entorno verificado en ✅ (Node 24.13.0, npm 11.6.2, Git 2.52.0, gh 2.98.0, PostgreSQL 18.6). GitHub CLI, Context7, Playwright, next-devtools y shadcn registrados y conectados en Claude Code 2.1.267 y Codex 0.157.1. Context7 con clave personal en Codex y como plugin en Claude Code.
- Decisiones: los servidores de `.mcp.json` se aprobaron en `.claude/settings.local.json` (personal). Se aplicó la configuración global de Git de `plan/instalacion.md` §3.
- Pendiente o aviso para otros:
**Todos:** en Claude Code, los servidores de `.mcp.json` quedan "Pending approval" hasta aprobarlos con `/mcp`. En Codex, revisen con `codex mcp list` que el proyecto esté marcado como confiable, porque sin eso no aparecen los servidores del proyecto.
