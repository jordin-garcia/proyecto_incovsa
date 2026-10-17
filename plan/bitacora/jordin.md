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
- Hecho: entorno verificado en ✅ (Node 24.13.0, npm 11.6.2, Git 2.52.0, gh 2.98.0, PostgreSQL 18.6). GitHub CLI, Context7 y Playwright probados en Claude Code 2.1.267 y en Codex 0.157.1 (extensión de VS Code); next-devtools y shadcn registrados en los dos, con su prueba real en JG-02 y JG-05. Context7 con clave personal en Codex y como plugin en Claude Code.
- Decisiones: los servidores de `.mcp.json` se aprobaron en `.claude/settings.local.json` (personal). Se aplicó la configuración global de Git de `plan/instalacion.md` §3.
- Pendiente o aviso para otros:
**Todos:** en Claude Code, los servidores de `.mcp.json` quedan "Pending approval" hasta aprobarlos con `/mcp`. En Codex, revisen con `codex mcp list` que el proyecto esté marcado como confiable, porque sin eso no aparecen los servidores del proyecto. Las herramientas de Playwright no aparecen en `codex exec` (modo sin interfaz): pruébenlo en la sesión interactiva o en la extensión de VS Code.

## 2026-10-17 · JG-08 · Integración continua, bot de revisión, tablero del plan y protección de ramas
- Hecho: flujos `ci`, `titulo-pr`, `archivos-protegidos`, `revision-claude`, `claude-interactivo` y `tablero-plan`, más Dependabot, con las acciones fijadas por SHA. Scripts `archivos-protegidos`, `veredicto-revision` y `tablero`, con 78 pruebas. Repositorio con integración automática, solo *squash* y Actions autorizado para aprobar. Rulesets de `develop` y `main` con las ocho verificaciones obligatorias. Secreto del bot guardado.
- Decisiones: la revisión formal la deja el flujo a partir del veredicto, no el bot. `archivos-protegidos` ejecuta el script de la rama base. El coordinador puede saltarse las reglas solo al integrar un PR. Los PR de Dependabot los integra el coordinador.
- Pendiente o aviso para otros:
**Todos:** desde ahora cada PR se integra solo con `gh pr merge --auto --squash --delete-branch` cuando pasan las ocho verificaciones, incluida la del bot. El título debe ser `[<ID>] <título>`.
**Todos:** activen los avisos por correo de GitHub (`plan/instalacion.md` §3) y confírmenle a Jordin cuando les llegue el primer aviso del "Tablero del plan".
**JG-02:** anotar en la bitácora el resultado de los criterios 5, 6 y 7 de JG-08: protección de ramas, tablero fijado, aviso de tarea integrada y recordatorio manual.
