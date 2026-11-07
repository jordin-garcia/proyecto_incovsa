---
id: CE-08
titulo: Preparación del VPS, del dominio y de Cloudflare R2
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: hecha
depende_de: [CE-06, CE-07]
programada: 2026-11-06
requisitos: [RNF-09, RNF-10, RNF-12]
pantallas: []
---

# CE-08 · Preparación del VPS, del dominio y de Cloudflare R2

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 06/11 · **Depende de:** CE-06, CE-07

> **06/11: replanteada con la decisión 91** (`specs/16`). INCOVSA no entregó los accesos: el VPS es uno de **Hostinger, plan KVM 2**, que contrata Jordin con un correo de soporte para INCOVSA, igual que la cuenta de Cloudflare. El sistema se publica con el **nombre que Hostinger le da al VPS** (`srvXXXX.hstgr.cloud`), no en `incovsa.com`, y las imágenes se sirven desde la dirección **`r2.dev`** del bucket. Esta tarea la hace el coordinador (protocolo §E), que tiene los accesos.

> **06/11: precisada al implementarla.** Jordin decidió publicar en **`incovsa.tech`**, el dominio que Hostinger incluyó con el VPS, con su DNS en Cloudflare y las imágenes en **`imagenes.incovsa.tech`**. Donde los pasos y criterios dicen «nombre de Hostinger» o `r2.dev`, vale `incovsa.tech` e `imagenes.incovsa.tech` (`specs/16`, decisión 91; `specs/18`).

## Objetivo
Dejar el VPS de Hostinger y los buckets de R2 listos y seguros para el primer despliegue (JG-19; specs/16, decisiones 28, 31 a 34 y 91).

## Contexto que debes leer
- `specs/16` §"Despliegue" completo y decisiones 28 a 34 y 91
- `specs/03` (enlace de Odoo) y `specs/19`: P-94 y P-99
- `## Resultado` de CE-05, CE-06 y CE-07, y el trabajo previo de esta tarea (al final)

## Qué hacer
**Esta tarea depende de cuentas que no tiene el agente.** Jordin contrata el VPS y crea las cuentas; el agente lo guía paso a paso y Jordin escribe las contraseñas y llaves, que nunca pasan por el agente ni por el repositorio (decisión 70). Si el VPS o la cuenta de Cloudflare todavía no existen, detente y pídeselos a Jordin.
1. **VPS de Hostinger (Ubuntu Server 24.04 LTS):** comprobar que el plan cumple la decisión 28 y anotar el nombre del VPS (`srvXXXX.hstgr.cloud`). Con `evidencia/CE-08/preparar-vps.sh`: actualizaciones automáticas de seguridad; acceso SSH solo con llave, sin contraseña y sin `root`; un usuario de despliegue; cortafuegos que solo abre los puertos 22, 80 y 443 (también el cortafuegos del panel de Hostinger, si está activo); Docker y el complemento Compose oficiales; la carpeta de la aplicación con `docker-compose.yml`, `Caddyfile` y el `.env` de producción, con `DOMINIO` y `BETTER_AUTH_URL` en el nombre de Hostinger y `URL_ODOO` con la dirección de Odoo que Jordin recibió el 06/11 (P-06; la escribe él, no va en el repositorio).
2. **Sin DNS de incovsa.com:** no se toca (decisión 91). Los pasos de DNS de `evidencia/CE-08/pasos-hugo.md` ya no aplican.
3. **Cloudflare R2:** bucket de imágenes, público **solo** por su dirección `r2.dev`, con `URL_IMAGENES` en esa dirección; y bucket de respaldos, privado y sin dirección pública. Cada uno con su credencial limitada a ese bucket.
4. **GitHub:** el `environment: produccion` y sus secretos (`VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH`, `VPS_KNOWN_HOSTS`) que usa CE-06, más una variable con el nombre de Hostinger del VPS (por ejemplo `DOMINIO`). Los crea Jordin, que es el dueño del repositorio.
5. **`despliegue.yml`:** el paso «Comprobar https://incovsa.com» consulta esa dirección fija y fallaría (incovsa.com no apunta al VPS). Cambiarlo para que tome la dirección de la variable del paso 4, con su nombre y su prueba en `scripts/flujos.test.mjs` si la hay.
6. Instalar el `cron` de los respaldos (CE-07) y correr una vez el respaldo y la restauración contra R2.
7. Probar el despliegue (CE-06) con la imagen de `develop`, hasta que la comprobación final pase, y dejarlo listo para JG-19.
8. Actualizar `evidencia/CE-08/` con la evidencia real, sin credenciales ni la IP del VPS (el repositorio es público).

## Archivos que creas o modificas
- `evidencia/CE-08/**`. Si hace falta ajustar `docker-compose.yml`, `Caddyfile` o `despliegue.yml`, en este mismo PR.

## Criterios de aceptación
1. El VPS acepta solo SSH con llave; el cortafuegos solo abre 22, 80 y 443.
2. Caddy obtiene el certificado del nombre de Hostinger del VPS y la aplicación responde por HTTPS. La evidencia dice qué emisor dio el certificado (`hstgr.cloud` lo comparten todos los clientes de Hostinger).
3. Una imagen subida desde el panel en producción se guarda en R2, se sirve desde la dirección `r2.dev` del bucket y se ve en el sitio público (la política de seguridad de contenido la permite).
4. El respaldo nocturno corre y una restauración contra R2 queda documentada.
5. El flujo de despliegue llega al VPS por SSH y su comprobación final pasa con el nombre de Hostinger, sin ninguna dirección fija de incovsa.com.

## Verificación
```
sudo bash evidencia/CE-08/verificar-vps.sh        # en el VPS
curl -sI https://<nombre del VPS en Hostinger>
curl -sI <URL_IMAGENES>/<clave de una imagen subida desde el panel>
gh run list --workflow despliegue.yml --limit 3
```

## Fuera de alcance
- El primer despliegue oficial (JG-19).
- Publicar el sistema en `incovsa.com` o las imágenes en un dominio propio (P-99; los pasos los escribe CE-15 en el Documento 5).

## Notas
- Las credenciales de producción nunca se guardan fuera del gestor de contraseñas de quien las crea, ni en ningún archivo del repositorio (decisión 70). El inventario de servicios y accesos va en el Anexo J (CE-12), sin las credenciales.

## Trabajo previo (20/10, Carlos)

La tarea estuvo bloqueada del 20/10 al 06/11 por falta de los accesos de INCOVSA (P-10, P-93 y P-94). Lo que quedó en el repositorio:

- `evidencia/CE-08/README.md` — mapa de pendientes y orden de trabajo.
- `evidencia/CE-08/pasos-hugo.md` — checklist de Carlos (VPS, R2, DNS, secretos GitHub, cron CE-07, prueba de despliegue).
- `evidencia/CE-08/preparar-vps.sh` — endurecimiento idempotente (Ubuntu 24.04, unattended-upgrades, SSH solo llave, sin root login, usuario de despliegue, UFW 22/80/443, Docker + Compose, `~/incovsa`).
- `evidencia/CE-08/verificar-vps.sh` — comprueba el criterio 1 y la carpeta de la app en el VPS.
- `evidencia/CE-08/bloqueo.md` — evidencia del bloqueo (environment `produccion` ausente; `403` al crearlo con el token del agente).
- `.env.produccion.example` — comentario `IMAGEN_APP` alineado con CE-06 (prod no usa `:latest`).

**Excepción de alcance (§C).** El protocolo pide un PR de bloqueo solo con la tarea y la bitácora. La asignación del coordinador del proyecto pidió dejar guía y scripts en `evidencia/CE-08/` y el comentario `IMAGEN_APP` en este mismo PR. Tras la CORRECCIÓN de `revision-claude` (2026-10-20): drop-in SSH `00-incovsa.conf` (gana a cloud-init), aborto si no hay llave antes de tocar SSH, UFW solo `22/80/443`, `verificar-vps.sh` como root y sin aceptar login root.

## Resultado

Lo hizo el coordinador (protocolo §E) el 06/11/2026. La evidencia completa de los cinco criterios está en `evidencia/CE-08/README.md`.

**Qué quedó listo**
- **VPS:** Hostinger KVM 2, Ubuntu 24.04.5, `srv2136614.hstgr.cloud`. Endurecido con `evidencia/CE-08/preparar-vps.sh`: SSH solo con llave y sin root, usuario `despliegue` (grupo `docker`, sin `sudo`), UFW con 22, 80 y 443, Docker y Compose oficiales, Node.js 24. rclone 1.76 oficial con `evidencia/CE-08/instalar-rclone.sh`, en `~/.local/bin` de `despliegue`.
- **Dirección:** `https://incovsa.tech`, certificado de Let's Encrypt emitido por Caddy. DNS de `incovsa.tech` en la cuenta de Cloudflare de soporte: CNAME al nombre del VPS, en «DNS only».
- **R2:** `incovsa-imagenes`, servido solo por `https://imagenes.incovsa.tech` (`r2.dev` desactivado), e `incovsa-respaldos`, privado. Un token por bucket.
- **Aplicación:** `~/incovsa` con `docker-compose.yml`, `Caddyfile`, `.env` (modo 600, escrito por Jordin, con `URL_ODOO`) y `scripts/` de respaldo. Corre la imagen de `develop` 437cddb (`proyecto_incovsa-prueba:evidencia-poda-5`), con la semilla base y un administrador que creó Jordin.
- **Respaldos:** `cron` de `despliegue` a las 02:15 UTC (20:15 en Guatemala), con `PATH=` que pone `~/.local/bin` primero. Respaldo y restauración probados contra R2.
- **GitHub:** `environment: produccion` con `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` y `VPS_KNOWN_HOSTS`, y la variable `DOMINIO=incovsa.tech`.

**Decisiones**
- `incovsa.tech` en lugar del nombre de Hostinger y de `r2.dev` (decisión de Jordin, `specs/16` decisión 91 y `specs/18`).
- **Corrección de `despliegue.yml` (CE-06):** el script del paso SSH llega por la entrada estándar y `docker compose run` se lo comía: el flujo migraba y no reiniciaba la aplicación. La migración corre ahora con `-T` y `</dev/null`, y el flujo arranca `app` y `caddy` (antes, Caddy no arrancaba en un VPS nuevo). La comprobación final se llama «Comprobar la dirección de producción» y usa `vars.DOMINIO`. Pruebas en `scripts/flujos.test.mjs`.
- rclone oficial en lugar del de Ubuntu (error 501 con R2). Sin `unzip` ni root, se descomprime con `python3 -m zipfile`.
- El VPS no guarda credenciales de GHCR: la prueba usó un `docker login` temporal y terminó con `docker logout`.

**Cómo usarlo**
- **JG-19:** al integrar en `main`, el flujo entra por SSH como `despliegue`, migra, arranca `app` y `caddy` y comprueba `https://incovsa.tech`. No hace falta arrancar Caddy a mano. La base ya tiene la semilla base y un administrador de prueba.
- **Entrar al VPS:** `ssh despliegue@srv2136614.hstgr.cloud` con una llave autorizada. Root solo entra por la consola de Hostinger, también para correr `verificar-vps.sh`.
- **Comandos en el VPS por SSH:** si se manda un script por la entrada estándar (`ssh … 'bash -s' < script`), cada `docker compose run` o `exec` debe llevar `-T` y `</dev/null`, o se come el resto del script.
- **CE-10 y DM-12:** la dirección es `https://incovsa.tech`.
- **CE-15:** el paso 8 de su tarea lista lo que cambió en el Documento 5.
