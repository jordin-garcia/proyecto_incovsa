# Bloqueo CE-08 — 2026-10-20

## Motivo

No hay acceso al VPS, al DNS de `incovsa.com` ni a las cuentas de Cloudflare R2. Los pendientes P-10, P-93 y P-94 de `specs/19` siguen abiertos. La decisión 73 pedía esos accesos a más tardar el 28/10; hoy 20/10 todavía no existen en este entorno.

## Comprobaciones del agente (sin secretos)

| Comprobación | Resultado |
|---|---|
| Variables `VPS_*` / `R2_*` en el entorno del agente | Ausentes |
| `~/.ssh` con llave al VPS | Sin llaves de producción |
| `.env` de producción en el repo | No existe (correcto; decisión 70) |
| Environment GitHub `produccion` | `total_count: 0` (no creado) |
| Crear environment con el token del agente | `403 Resource not accessible by integration` |
| Listar secretos del environment | `404` (no hay environment) |

## Quién desbloquea

1. **Ing. William / INCOVSA:** VPS (P-10), DNS (P-93), correo y cuentas Cloudflare/VPS (P-94).
2. **Carlos (`carloshugoeg`)** en la Mac: crear `environment: produccion`, cargar los cuatro secretos, ejecutar `preparar-vps.sh` / cron / prueba R2 con las credenciales (nunca las pega en el chat ni en el repo).
3. **Jordin + Daniela:** si el DNS no puede pasar a Cloudflare, activar el plan B de la decisión 32 (imágenes por ruta propia).

## Qué no se marca hecha

Ningún criterio de aceptación de CE-08. No hay HTTPS real, no hay objeto en `imagenes.incovsa.com`, no hay respaldo contra R2 ni SSH de despliegue verificado.
