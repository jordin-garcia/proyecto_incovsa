@AGENTS.md

## Solo para Claude Code

- Para la revisión en contexto limpio del protocolo (paso B9), usa el subagente `revisor` (`.claude/agents/revisor.md`) en lugar de abrir otra sesión.
- Para implementar una tarea de principio a fin sin supervisión, el usuario puede usar el **modo auto** (no el modo sin permisos) y:
  `/goal La tarea <ID> está integrada en develop: su PR está mergeado, el archivo de la tarea dice "estado: hecha" y todos los comandos de su sección Verificación pasaron`
- Usa subagentes para investigar el código y así no llenar el contexto principal.
- Al compactar, conserva el ID de la tarea en curso, los archivos modificados, los comandos de verificación y el número del PR.
