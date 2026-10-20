# Evidencia CE-05 · Producción con Docker Compose y Caddy

La verificación de esta tarea es el flujo de GitHub Actions `produccion-imagen` (no hay Docker en las computadoras del equipo).

## Qué comprueba el flujo

1. Construcción de la imagen Node 24 (standalone).
2. La imagen no contiene `.env` ni `.env.produccion.example`.
3. Validación del `Caddyfile` real (`caddy validate`) con `X-Real-IP`, `flush_interval -1` y `max_size 27MB`.
4. Compose con Caddy + app + PostgreSQL 18; HTTPS y HSTS vía Caddy (`DOMINIO=localhost`).
5. Cuerpo de 7 MB a través de Caddy sin 413; cuerpo de 28 MB con 413.
6. PostgreSQL sin puerto publicado y sin respuesta en el host.
7. `prisma migrate deploy` y `npm run crear-admin` dentro del contenedor `app`.
8. Intento de acceso fallido con `X-Real-IP` falsificada: la bitácora guarda la IP real del proxy, no `203.0.113.9`.

## Cómo ver la salida

En el PR, trabajo **Imagen de producción** → job `produccion-imagen`.

Pendiente de punta a punta (tareas de Jordin): cabeceras de JG-11 y SSE de JG-10 a través de Caddy.
