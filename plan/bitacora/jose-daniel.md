# Bitácora de José Daniel Cifuentes

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-18 · JC-01 · Herramientas obligatorias del agente (Codex)
- Hecho: verifiqué Node.js 24.22.0, npm 11.19.1, Git 2.54.0, gh 2.96.0, PostgreSQL 18.6 y Codex CLI 0.163.0-alpha.10.2; GitHub devuelve JDaniC y confirma acceso al repositorio. La pantalla `/mcp` de Codex confirmó conectados playwright (25 herramientas), next-devtools (4), shadcn (7) y context7 (2); el proyecto es confiable. Para resolver fallos de inicio de los tres servidores que descargan con `npx` detrás de la CA TLS de esta red, añadí `NODE_EXTRA_CA_CERTS` a su configuración personal y guardé las raíces macOS en `~/.codex/certs/macOS-roots.pem`, fuera del repositorio. Context7 autenticó por OAuth y devolvió documentación de Server Actions de Next.js 16.0.3. Playwright abrió Inicio, leyó “Inicio · INCOVSA” y guardó la captura temporal `/tmp/JC-01-inicio-playwright.png`.
- Decisiones: mantuve la autenticación OAuth de Context7; no hizo falta clave personal. Codex usa `workspace-write` y confirmaciones `on-request`. `.env` no existe en esta copia y no se leyó. Para npm y los MCP `npx` usé las CA raíz de macOS con `NODE_EXTRA_CA_CERTS`; TLS permaneció habilitado.
- Pendiente o aviso para otros: ninguno.
