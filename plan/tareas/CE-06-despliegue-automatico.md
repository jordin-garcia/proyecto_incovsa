---
id: CE-06
titulo: Despliegue automático desde main con GitHub Actions y GHCR
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: hecha
depende_de: [CE-05]
programada: 2026-10-23
requisitos: [RNF-12]
pantallas: []
---

# CE-06 · Despliegue automático desde main con GitHub Actions y GHCR

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 23/10 · **Depende de:** CE-05

## Objetivo
El flujo que, al integrar en `main`, compila la imagen, la guarda en el registro de GitHub (GHCR) y la despliega en el VPS con sus migraciones, y que permite volver a una versión anterior (specs/16, decisiones 31 y 75).

## Contexto que debes leer
- `specs/16` §"Despliegue" (GHCR con GitHub Pro: 2 GB; se conservan 5 imágenes) y decisiones 31, 47 y 75
- `## Resultado` de CE-05 y JG-08
- Context7: GitHub Actions (`docker/build-push-action`, GHCR con `GITHUB_TOKEN`, `environment` con aprobación), SSH desde Actions

## Qué hacer
1. `.github/workflows/despliegue.yml`, en cada *push* a `main` (solo ocurre por PR del coordinador):
   1. compila la imagen y la sube a GHCR (privada) con la etiqueta del *commit* y `produccion`;
   2. entra al VPS por SSH (secretos `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` y la huella del servidor fijada en `VPS_KNOWN_HOSTS`), descarga la imagen, aplica las migraciones (`prisma migrate deploy` en un contenedor de un solo uso) y reinicia `app` con la imagen nueva;
   3. comprueba que https://incovsa.com responde; si no, lo marca como fallido;
   4. borra de GHCR las imágenes de más, dejando las **últimas 5**.
2. Ejecución manual (`workflow_dispatch`) para **volver a una imagen anterior** por su etiqueta, sin migraciones.
3. Antes de que exista el VPS (P-10), el flujo debe funcionar hasta la subida a GHCR; el paso de SSH se prueba en CE-08.
4. Acciones fijadas por SHA, permisos mínimos y un `environment: produccion` en GitHub con los secretos.

## Archivos que creas o modificas
- `.github/workflows/despliegue.yml` (crear; excepción de archivos protegidos para Carlos)

## Criterios de aceptación
1. Un *push* a una rama de prueba con el flujo en modo de prueba compila y sube la imagen a GHCR.
2. GHCR conserva solo las últimas 5 imágenes.
3. La ejecución manual permite elegir una etiqueta anterior.
4. Ningún secreto aparece en los registros del flujo.

## Verificación
```
gh workflow run despliegue.yml
gh run watch
```

## Fuera de alcance
- Preparar el VPS (CE-08) y el primer despliegue real del 02/11 (JG-19).

## Resultado

El flujo `.github/workflows/despliegue.yml` (`name: Despliegue`) hace esto:

1. **Solo `refs/heads/main` sin `modo_prueba`:** publica en `ghcr.io/<owner>/<repo>` (`<sha>` + `produccion`) y poda ese paquete a ≤ 5 etiquetadas (`provenance`/`sbom` off).
2. **Cualquier otra ref** (incl. `ce-06-prueba`, `workflow_dispatch` en `develop`, o `modo_prueba` en `main`): publica y poda solo en `ghcr.io/<owner>/<repo>-prueba`; nunca toca el paquete de producción. Variantes ligeras para ejercer la poda (>5).
3. **SSH al VPS** (solo desde `main`, `environment: produccion`): `~/incovsa`, `postgres --wait`, migrate en un solo uso, reinicio de `app`, `https://incovsa.com`. Sin secretos (CE-08), omite el SSH.
4. **`workflow_dispatch` con `etiqueta`:** desde `main`, vuelve a `ghcr.io/<repo>:<etiqueta>` sin migraciones (`env` + validación).

**Evidencia:** `evidencia/CE-06/workflow-run.txt` y `ghcr-pull.txt` (run en `ce-06-prueba` → paquete `-prueba`).

### Correcciones de la auditoría (2026-10-22)

Las corrigió el coordinador en JG-25.

- **H-52:** `github.ref` y los demás contextos de GitHub pasan por `env`; ningún script de `despliegue.yml` los interpola. Lo prueba `scripts/auditoria-jg25.test.mjs`.
- **H-53:** se quitó el disparador de la rama `ce-06-prueba`; la rama ya no existía en el remoto el 28/10. Para probar la publicación sin desplegar: `gh workflow run despliegue.yml -f modo_prueba=true`.
- **H-54:** la poda usa `/orgs/` cuando el dueño del repositorio es una organización (`github.event.repository.owner.type`) y `/users/` si no. Así sigue funcionando al transferir el repositorio a INCOVSA (P-94).
- **H-83 (auditoría del 26/10):** `despliegue.yml` corrió en modo prueba con las acciones de Docker nuevas (evidencia en `plan/evidencias/JG-25/README.md`).
