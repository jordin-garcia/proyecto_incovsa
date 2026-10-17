---
id: CE-05
titulo: Producción con Docker Compose y Caddy
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-08]
programada: 2026-10-21
requisitos: [RNF-09, RNF-10, RNF-12, RNF-16]
pantallas: []
---

# CE-05 · Producción con Docker Compose y Caddy

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 21/10 · **Depende de:** JG-08

## Objetivo
Los archivos para correr la aplicación en producción con **Docker Compose**: Caddy (HTTPS), la aplicación y PostgreSQL 18 (specs/16, decisiones 27 a 29), probados en GitHub Actions, porque en las computadoras del equipo no se usa Docker.

## Contexto que debes leer
- `specs/16` §"Despliegue" (Servidor, Ambientes, Producción con Docker Compose, Despliegue) y §"Seguridad" (Cabeceras y transporte, Secretos), decisiones 10, 27 a 30, 58 y 78
- `## Resultado` de JG-02 (variables de `.env.example`, `output: 'standalone'`), JG-06 (`X-Real-IP`) y JG-10 (SSE)
- Context7: Next.js 16 (despliegue *standalone* en Docker), Docker Compose, Caddy 2 (`reverse_proxy`, `header_up`, HSTS, *flush* de SSE), imagen oficial de PostgreSQL 18

## Qué hacer
1. **`Dockerfile`** de varias etapas con Node 24: instala con `npm ci`, compila (`npm run build`), y la imagen final lleva solo la salida *standalone*, los archivos estáticos, `prisma/` y lo necesario para `prisma migrate deploy` y `npm run crear-admin`; corre con un usuario sin privilegios. `.dockerignore` sin `node_modules`, `.next`, `.env*`, `entregable-*`, `docs*` ni `pruebas*`.
2. **`docker-compose.yml`** con tres servicios en una red interna:
   - `caddy` (puertos 80 y 443, volúmenes para sus certificados);
   - `app` (la imagen de GHCR; un solo proceso, decisión 27; variables desde el archivo `.env` del VPS);
   - `postgres` (PostgreSQL 18 con un volumen con nombre; **sin** puerto expuesto fuera de la red interna);
   con comprobaciones de salud, reinicio automático y rotación de los registros de Docker para que no llenen el disco.
3. **`Caddyfile`**: `incovsa.com` con HTTPS automático y HSTS; `reverse_proxy` a `app:3000` con `header_up X-Real-IP {remote_host}` (la única fuente de la IP, decisión 29) y sin almacenar en búfer los eventos SSE; límite del cuerpo de la petición acorde con los 3 MB de la decisión 58 y las imágenes de 5 MB.
4. **`.env.produccion.example`**: las variables de producción (incluidas `ALMACENAMIENTO=r2`, las de R2 y `URL_IMAGENES`), con valores de ejemplo y nunca reales.
5. **Prueba en GitHub Actions** (`.github/workflows/produccion-imagen.yml`, en los PR que cambian estos archivos): construye la imagen, levanta el `docker-compose.yml` con un certificado local de Caddy y comprueba que la aplicación responde por HTTPS a través de Caddy, que las migraciones corren dentro del contenedor y que PostgreSQL no es accesible desde fuera.

## Archivos que creas o modificas
- `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `Caddyfile`, `.env.produccion.example` (crear)
- `.github/workflows/produccion-imagen.yml` (crear; excepción de archivos protegidos para Carlos)

## Criterios de aceptación
1. La imagen se construye en GitHub Actions y la aplicación responde a través de Caddy con HTTPS y las cabeceras de seguridad de JG-11.
2. `prisma migrate deploy` y `npm run crear-admin` funcionan dentro del contenedor de la aplicación.
3. La aplicación ve la IP real del cliente solo por `X-Real-IP`.
4. Los avisos SSE de JG-10 llegan a través de Caddy sin retraso.
5. PostgreSQL no se puede alcanzar desde fuera de la red interna; ningún secreto queda en la imagen.

## Verificación
```
gh pr checks --watch
```

## Fuera de alcance
- El despliegue automático (CE-06), los respaldos (CE-07) y la preparación del VPS (CE-08).
