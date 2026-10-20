# Evidencia CE-06 — Despliegue automático

## Qué hay aquí

| Archivo | Contenido |
|---|---|
| `validar-plan.txt` | `node scripts/tareas.mjs --validar` |
| `flujos-test.txt` | `node --test scripts/flujos.test.mjs` |
| `verificar.txt` | `npm run verificar` |
| `validar-cierre.txt` | `node scripts/tareas.mjs --validar-cierre "[CE-06] …"` |
| `workflow-run.txt` | Salida de `gh run watch` / publicación en GHCR (rama `ce-06-prueba`) |
| `ghcr-pull.txt` | `docker pull` / `imagetools inspect` de las imágenes etiquetadas que quedan |

## Criterios

1. Push a `ce-06-prueba` (modo prueba) publica en GHCR sin etiqueta `produccion` ni SSH.
2. La poda cuenta solo versiones con etiqueta y deja ≤ 5.
3. `workflow_dispatch` con `etiqueta` vuelve atrás sin migraciones (solo desde `main`).
4. Los secretos no se imprimen.
