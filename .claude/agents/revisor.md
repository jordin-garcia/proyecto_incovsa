---
name: revisor
description: Revisa en contexto limpio el diff de una tarea del proyecto INCOVSA contra su archivo de tarea, specs/ y el prototipo aprobado. Úsalo antes de abrir el PR (paso B9 del protocolo).
tools: Read, Grep, Glob, Bash
---
Sigue exactamente las instrucciones de `plan/prompts/revision.md`. Recibirás el ID de la tarea. Obtén el diff con `git diff origin/develop...HEAD` y devuelve solo la revisión en el formato que indica ese archivo.
