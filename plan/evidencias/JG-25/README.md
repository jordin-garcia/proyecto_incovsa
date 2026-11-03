# JG-25 · Correcciones de la auditoría del 22/10 en configuración, producción y CI

Estado: verificada el 28/10/2026 en el equipo del coordinador (Windows) y en GitHub Actions.

## Cobertura

| Hallazgo | Corrección | Comprobación |
| --- | --- | --- |
| H-27 | — (ya se cumplía) | `scripts/auditoria-jg25.test.mjs`: variables de `.env.example`, ningún `.env` en el repositorio y scripts de `AGENTS.md` |
| H-28 | Paso «El esquema coincide con las migraciones» en `ci.yml` | `scripts/auditoria-jg25.test.mjs` y el PR de prueba #145 (ver abajo) |
| H-36 | `crear-admin` con `normalizarRol` y mensajes propios | `scripts/administrador.test.ts` |
| H-37 | Claves de ejemplo rechazadas en producción | `src/lib/auth-configuracion.test.ts` |
| H-40 | El veredicto solo acepta comentarios que citan una ejecución de `revision-claude.yml` | Casos «H-40» de `scripts/veredicto-revision.test.mjs` |
| H-41 | — (ya se cumplía) | «RF-SL-04 (H-41)» de `src/modulos/camiones/servicio.test.ts` (con `consultarOpciones`) |
| H-42, D-03 | Camión elegido sin cambio de sede | «D-03» de `src/modulos/camiones/servicio.test.ts` y captura `d03-camion-elegido-sede-1440.png` |
| H-43 | El piloto eliminado sale de «Envío por camión» y se avisa en tiempo real | «RF-SL-57 (H-43)» de `src/modulos/usuarios/servicio.test.ts` y captura `h43-piloto-eliminado-facturacion-1440.png` |
| H-44 | `exigirAccesoTotal` y regla de Semgrep `incovsa-usuarios-acceso-total` | `src/modulos/permisos/servicio.test.ts` y 5 casos nuevos de `scripts/probar-semgrep.mjs` |
| H-45 | — (ya se cumplía) | «RF-SL-57 (H-45)» de `src/modulos/usuarios/servicio.test.ts` (Rutas y Bitácora de Reportes) |
| D-04 | No se desactiva la propia cuenta | «D-04» de `src/modulos/usuarios/servicio.test.ts` y captura `d04-desactivar-propia-cuenta-1440.png` |
| H-46, H-48 | Cabeceras a través de Caddy con una sola HSTS; Caddy ya no agrega HSTS | Paso «RNF-16» de `produccion-imagen.yml` y `scripts/auditoria-jg25.test.mjs` |
| H-47 | Primer evento de `/api/tiempo-real` a través de Caddy en 5 s | Paso «RNF-13» de `produccion-imagen.yml` |
| H-49 | Imagen por omisión `:produccion` | `scripts/auditoria-jg25.test.mjs` |
| H-50 | 27 MB en `specs/16` (decisión 58) y `specs/18` | `scripts/auditoria-jg25.test.mjs` |
| H-51 | Código de root; el proceso solo escribe en la caché | Paso «El código de la imagen es de solo lectura para el proceso» de `produccion-imagen.yml` |
| H-52, H-53, H-54 | Contextos por `env`, sin la rama de prueba, poda para organizaciones | `scripts/auditoria-jg25.test.mjs` y el despliegue en modo prueba (ver abajo) |
| H-55 | Respaldo y restauración en modo `docker compose exec` | Pasos «RNF-09 … docker compose» de `produccion-respaldo.yml` |
| D-05 | Nota para el Documento 5 | `evidencia/CE-07/README.md` y `scripts/auditoria-jg25.test.mjs` |
| H-82 | Resultado de JG-08 y `specs/16` | `scripts/auditoria-jg25.test.mjs` |
| H-83 | Despliegue en modo prueba con las acciones nuevas | Ver abajo |
| H-84 | Espera en `127.0.0.1`, hasta 90 s, con límite propio | Dos corridas seguidas de `pruebas-e2e/flujo` (ver abajo) |

## H-28: PR de prueba

El PR #145 agregó a `schema.prisma` una columna sin su migración y se cerró sin integrar. El trabajo `pruebas` (run 40812287927) falló en el paso nuevo, con código 2:

```
[*] Changed the `sede` table
  [+] Added column `prueba_jg25`
##[error]Process completed with exit code 2.
```

## H-83: despliegue en modo prueba

`gh workflow run despliegue.yml --ref jordin/JG-25-auditoria-produccion-y-ci -f modo_prueba=true` → run 40812088052, **success**: `publicar-ghcr` publicó, inspeccionó y podó el paquete `proyecto_incovsa-prueba` con login v4.6.0, setup-buildx v4.4.1 y build-push v7.4.0, ya con los contextos por `env` y la poda por `ambito` de esta tarea. `desplegar-vps` se omitió, como corresponde al modo prueba.

## H-53: rama `ce-06-prueba`

Ya no existía en el remoto el 28/10 (`gh api repos/jordin-garcia/proyecto_incovsa/branches` no la lista): no hubo nada que borrar. Se quitó su disparador de `despliegue.yml`.

## H-84: `pruebas-e2e/flujo` dos veces seguidas

Después de `npm run build`, con 1 worker y sin reintentos (`--retries=0`), en una base nueva:

- `e2e-flujo-seguridad-1.txt`: `flujo` y `seguridad`, 24 pasaron (3.1 min).
- `e2e-flujo-2.txt`: `flujo` otra vez, 12 pasaron (2.9 min).

## Semgrep

Semgrep 1.182.0 (la versión de la CI) en Docker: los 36 casos de `scripts/probar-semgrep.mjs` pasan y `semgrep scan --error --strict --config .semgrep/seguridad.yml --config p/typescript --config p/nextjs src` da 0 hallazgos.

## Verificación en la aplicación (B7)

Con `npm run dev` sobre una base nueva y una cuenta de Gerencia creada con `crearAdministrador`, en Playwright:

- Configuración › Usuarios: quitar «Cuenta activa» a la propia cuenta y guardar muestra «No puede desactivar su propia cuenta.» (`d04-desactivar-propia-cuenta-1440.png`).
- Con «Camión 1» elegido en «Envío por camión» de Quetzaltenango, cambiarlo a Guatemala muestra «Camión 1 está elegido en «Envío por camión» de Facturación.» (`d03-camion-elegido-sede-1440.png`).
- Con «Usuario de ejemplo 07» elegido como piloto, eliminarlo deja el camión elegido y el piloto en «Elija el piloto», y ya no aparece en la lista (`h43-piloto-eliminado-facturacion-1440.png`).
- La consola solo registró el 404 de `/favicon.ico`, que no depende de esta tarea.

## Batería de navegador

Por partes, con 1 worker, en una base nueva (`incovsa_jg25_e2e`), después de `npm run build`:

| Parte | Resultado |
| --- | --- |
| `flujo` + `seguridad` | 24 pasaron |
| `flujo` (segunda corrida) | 12 pasaron |
| `acceso` | 54 pasaron |
| `comunes` | 51 pasaron |
| `panel` | 82 pasaron, 2 fallaron por falta de memoria del equipo (`ECONNRESET` y `Target crashed`) |
| `panel`, repetición de esas 2 | 2 pasaron |
| `sitio` | 60 pasaron |
| `picking`, teléfono | 50 pasaron |
| `picking`, tableta | 50 pasaron |
| `picking`, escritorio y TV | 61 pasaron |

Las salidas están en los archivos `e2e-*.txt` de esta carpeta. Los dos fallos de `panel` ocurrieron cuando el equipo (8 GB) se quedó sin memoria y Claude Code detuvo el proceso; repetidos con memoria libre, pasaron sin cambios en el código.

## Verificaciones conocidas en Windows

`node --test scripts/respaldo.test.mjs` falla 3 de 4 pruebas en Windows también en `develop` (ejecutan los scripts de bash del VPS); en la CI de Linux pasan.
