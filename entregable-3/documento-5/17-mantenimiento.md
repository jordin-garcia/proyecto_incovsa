# Mantenimiento

Haga estas comprobaciones con el usuario de despliegue, desde `~/incovsa`, cuando el VPS exista. Hoy puede ensayar en su computadora solo los comandos de desarrollo.

Cada noche, confirme que el cron del apartado Respaldo corrió. Busque la etiqueta `incovsa-respaldo` en el registro del sistema. La misma línea sale por la salida estándar del script. Tiene que nombrar la fecha, la carpeta `diarios` o `semanales`, y el archivo `.dump`. No tiene que mostrar la contraseña.

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

El disco de la base es el volumen `postgres-datos`. Si se llena, el contenedor `postgres` deja de aceptar escrituras. Borre respaldos solo por la retención del script. No borre objetos del bucket para liberar espacio sin mirar `diarios/` y `semanales/`.

No cargue la semilla de demostración en producción. No cree cuentas `ejemplo.01` en el VPS. Las cuentas reales las crea Gerencia o Soporte después del primer administrador.

Caddy renueva el certificado solo. No copie certificados a mano dentro del contenedor. Los volúmenes `caddy-datos` y `caddy-config` guardan ese estado.

Antes de cambiar una regla de negocio, lea `specs/` y registre el cambio en `specs/18-historial-de-decisiones.md`. Las reglas viven en `src/modulos/`. Cada operación del servidor verifica sesión, permiso y sede. El esquema de la base solo lo cambia el coordinador.

TODO(CE-11): Estas comprobaciones de producción no se han ejecutado. CE-08 sigue bloqueada y CE-10 no ha verificado https://incovsa.com.
