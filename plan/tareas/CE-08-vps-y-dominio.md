---
id: CE-08
titulo: Preparación del VPS, del dominio y de Cloudflare R2
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: pendiente
depende_de: [CE-06, CE-07]
programada: 2026-10-28
requisitos: [RNF-09, RNF-10, RNF-12]
pantallas: []
---

# CE-08 · Preparación del VPS, del dominio y de Cloudflare R2

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 28/10 · **Depende de:** CE-06, CE-07

## Objetivo
Dejar el VPS de INCOVSA, el DNS de `incovsa.com` en Cloudflare y los buckets de R2 listos y seguros para el primer despliegue del 02/11 (specs/16, decisiones 28, 32 a 34 y 73).

## Contexto que debes leer
- `specs/16` §"Despliegue" completo y decisiones 28 a 34 y 73
- `specs/19`: P-10 (VPS), P-93 (DNS), P-94 (cuentas de servicios)
- `## Resultado` de CE-05, CE-06 y CE-07

## Qué hacer
**Esta tarea depende de accesos que da INCOVSA** (P-10, P-93 y P-94). El agente no tiene esas credenciales: guía a Carlos paso a paso y él escribe las contraseñas y llaves. Si el 28/10 no hay acceso al VPS o al DNS, marca la tarea como **bloqueada** con el motivo (protocolo §C) y avisa a Jordin.
1. **VPS (Ubuntu Server 24.04 LTS):** actualizaciones automáticas de seguridad; acceso SSH solo con llave, sin contraseña y sin `root`; un usuario de despliegue; cortafuegos que solo abre los puertos 22, 80 y 443; Docker y el complemento Compose oficiales; la carpeta de la aplicación con `docker-compose.yml`, `Caddyfile` y el `.env` de producción (lo llena Carlos con los secretos; nunca pasan por el agente ni por el repositorio).
2. **DNS en Cloudflare (P-93):** `incovsa.com` apuntando al VPS; `imagenes.incovsa.com` conectado al bucket de imágenes de R2. Si INCOVSA no puede pasar el DNS a Cloudflare, la aplicación sirve las imágenes desde una ruta propia (decisión 32): avisa a Jordin y a Daniela.
3. **Cloudflare R2 (P-94):** bucket de imágenes (público solo por `imagenes.incovsa.com`) y bucket de respaldos (privado), cada uno con su credencial limitada.
4. **GitHub:** los secretos del `environment: produccion` (`VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH`, `VPS_KNOWN_HOSTS`) que usa CE-06.
5. Instalar el `cron` de los respaldos (CE-07) y correr una vez el respaldo y la restauración contra R2.
6. Probar el despliegue (CE-06) con la imagen de `develop` en un nombre de host temporal o con el sitio cerrado, y dejarlo listo para el 02/11.

## Archivos que creas o modificas
- Ninguno de código; si hace falta ajustar `docker-compose.yml`, `Caddyfile` o `despliegue.yml`, en este mismo PR.

## Criterios de aceptación
1. El VPS acepta solo SSH con llave; el cortafuegos solo abre 22, 80 y 443.
2. Caddy obtiene el certificado de `incovsa.com` y la aplicación responde por HTTPS.
3. Una imagen subida desde el panel en producción se sirve desde `imagenes.incovsa.com`.
4. El respaldo nocturno corre y una restauración contra R2 queda documentada.
5. El flujo de despliegue llega al VPS por SSH.

## Fuera de alcance
- El primer despliegue oficial (JG-19, 02/11).

## Notas
- Las credenciales de producción nunca se guardan en el equipo de Carlos fuera del gestor de contraseñas, ni en ningún archivo del repositorio (decisión 70). El inventario de servicios y accesos va en el Anexo J (CE-12), sin las credenciales.
