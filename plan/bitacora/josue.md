# Bitácora de Josué Menéndez

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JM-01 · Herramientas obligatorias del agente (Codex)
- Hecho: Se verificó el entorno base en Windows (Node.js 24.21.0, npm 11.19.0, Git 2.55.0 con core.autocrlf false, GitHub CLI 2.102.0 autenticado con Josh-JM, PostgreSQL 18.6). Se instaló Codex CLI globalmente y se configuraron los servidores MCP obligatorios (Context7, Playwright, next-devtools y shadcn) en ~/.codex/config.toml y ~/.gemini/config/mcp_config.json. Se comprobó la consulta a Context7 con Server Actions de Next.js 16 y la ejecución de Playwright abriendo el prototipo local en http://127.0.0.1:4173/ y capturando la página de inicio.
- Decisiones: Se mantiene la configuración para Codex en Windows y Antigravity en paralelo conforme a las decisiones 84 y 86 de specs/16. Context7 opera inicialmente con acceso sin token hasta que se configure opcionalmente clave de API.
- Pendiente o aviso para otros: **JM-02:** Desbloqueada la siguiente tarea para la conversión de kilogramos a unidades.
