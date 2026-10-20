# Evidencia CE-06 — Despliegue automático

## Qué hay aquí

| Archivo | Contenido |
|---|---|
| `validar-plan.txt` | `node scripts/tareas.mjs --validar` |
| `flujos-test.txt` | `node --test scripts/flujos.test.mjs` (incluye SHA y permisos del nuevo flujo) |
| `verificar.txt` | `npm run verificar` |
| `validar-cierre.txt` | `node scripts/tareas.mjs --validar-cierre "[CE-06] …"` |
| `workflow-run.txt` | Salida de `gh workflow run` / `gh run watch` (tras existir el flujo en la rama por defecto) |

## Criterios

1. `modo_prueba=true` publica en GHCR sin SSH.
2. El paso de poda deja ≤ 5 versiones.
3. `workflow_dispatch` con `etiqueta` vuelve atrás sin migraciones.
4. Los secretos no se imprimen (van por stdin/env enmascarado).
