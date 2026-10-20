# Evidencia CE-06 — Despliegue automático

## Paquetes GHCR

| Modo | Paquete | Qué hace |
|---|---|---|
| `main` | `ghcr.io/<owner>/<repo>` | Publica `sha` + `produccion`; poda ≤ 5 etiquetadas |
| `ce-06-prueba` / `modo_prueba` | `ghcr.io/<owner>/<repo>-prueba` | Solo prueba; nunca toca el paquete de producción |

## Archivos

| Archivo | Contenido |
|---|---|
| `workflow-run.txt` | `gh run watch` del push a `ce-06-prueba` (poda en `-prueba`) |
| `ghcr-pull.txt` | Listado + `imagetools inspect` de las ≤ 5 que quedan en `-prueba` |
| `validar-plan.txt` / `verificar.txt` / … | Verificación local |

## Criterios

1. Modo prueba publica en `-prueba` sin etiqueta `produccion` ni SSH.
2. La poda del paquete de prueba deja ≤ 5; el paquete de producción no se borra desde modo prueba.
3. `workflow_dispatch` con `etiqueta` (vía `env`, validada) vuelve atrás sin migraciones desde `main`.
4. Los secretos no se imprimen.
