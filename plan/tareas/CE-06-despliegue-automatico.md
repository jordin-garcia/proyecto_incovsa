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

1. **Push a `main`:** compila la imagen (`provenance: false`, `sbom: false` → una versión etiquetada por imagen), la sube a GHCR con la etiqueta del *commit* (SHA) y `produccion`, y poda dejando solo las **últimas 5 versiones etiquetadas**.
2. **Push a `ce-06-prueba` o `workflow_dispatch` con `modo_prueba=true`:** solo GHCR con la etiqueta del SHA (nunca `produccion`); no despliega.
3. **SSH al VPS** (solo desde `main`, `environment: produccion`, secretos `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH`, `VPS_KNOWN_HOSTS`): en `~/incovsa` hace `docker login` a GHCR, levanta `postgres` si hace falta, `docker compose pull app`, `prisma migrate deploy` en un contenedor de un solo uso y `docker compose up -d app`. Comprueba `https://incovsa.com`. Sin secretos (antes de CE-08), omite el SSH.
4. **`workflow_dispatch` con `etiqueta`:** desde `main`, vuelve a esa imagen **sin migraciones** (override Compose → solo `node server.js`).

Permisos mínimos en el flujo (`contents: read`); `packages: write` solo en `publicar-ghcr`. Acciones fijadas por SHA. Imagen `ghcr.io/<owner>/<repo>` en minúsculas.

**Cómo usarlo:** `gh workflow run despliegue.yml -f modo_prueba=true` (desde una ref que ya tenga el archivo) o push a `ce-06-prueba`. Despliegue real al integrar en `main` (JG-19). CE-08: secretos del environment y `IMAGEN_APP` en el `.env` del VPS (este flujo no publica `:latest`).

**Evidencia:** `evidencia/CE-06/` (incl. `workflow-run.txt` cuando el push de prueba a GHCR termina).
