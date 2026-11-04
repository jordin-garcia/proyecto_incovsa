# Mantenimiento preventivo

Haga estas comprobaciones con el usuario de despliegue, desde `~/incovsa`.

## Cada día

Confirme que el respaldo de la noche corrió. El script escribe en el registro del sistema con la etiqueta `incovsa-respaldo`:

```
journalctl -t incovsa-respaldo --since yesterday
```

Tiene que aparecer `respaldo diario AAAAMMDD.dump listo` con la fecha del día (y los domingos también `respaldo semanal AAAAMMDD.dump listo`), seguido de `retención aplicada`. Ninguna línea muestra la contraseña. Si aparece `el respaldo falló con código N` o no hay línea del día, lea el apartado Diagnóstico de errores comunes.

## Cada semana

Vea el estado de los tres servicios.

```
docker compose ps
docker compose logs app
docker compose logs caddy
docker compose logs postgres
```

`docker compose logs` es el destino de la salida estándar. La rotación del archivo de Compose es de 10 MB por archivo y 5 archivos. Si `app` no está sano, `caddy` no arranca, porque depende de la condición `service_healthy`. El chequeo de `app` pide `http://127.0.0.1:3000/`.

Compruebe el sitio cuando el DNS exista.

```
curl -fsSI https://incovsa.com/
```

No publique el puerto de PostgreSQL. `docker compose port postgres 5432` no debe mostrar un puerto del host distinto de vacío o de `:0`. Así lo comprueba el flujo `produccion-imagen`.

## Cada mes

- Ensaye una restauración del respaldo más reciente en una base nueva (apartado Restauración) y bórrela al terminar.
- Revise el uso del disco del VPS con `df -h` y `docker system df`. Si las imágenes viejas ocupan espacio, bórrelas con `docker image prune`, que no toca los volúmenes.
- Revise que el flujo «Respaldo y restauración» de GitHub Actions siga en verde (corre cada lunes).
- Revise las excepciones de `osv-scanner.toml` que estén por vencer (apartado Actualización de dependencias).

## Reglas de operación

El disco de la base es el volumen `postgres-datos`. Si se llena, el contenedor `postgres` deja de aceptar escrituras. Borre respaldos solo por la retención del script. No borre objetos del bucket para liberar espacio sin mirar `diarios/` y `semanales/`.

No cargue la semilla de demostración en producción. No cree cuentas `ejemplo.01` en el VPS. Las cuentas reales las crea Gerencia o Soporte después del primer administrador.

Caddy renueva el certificado solo. No copie certificados a mano dentro del contenedor. Los volúmenes `caddy-datos` y `caddy-config` guardan ese estado.

Antes de cambiar una regla de negocio, lea `specs/` y registre el cambio en `specs/18-historial-de-decisiones.md`. Las reglas viven en `src/modulos/`. Cada operación del servidor verifica sesión, permiso y sede. El esquema de la base solo lo cambia el coordinador.

> **Pendiente de producción (versión 1.1).** Estas comprobaciones se ejecutan por primera vez después del primer despliegue y de la verificación de producción (tarea CE-10).
