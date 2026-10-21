# Variables de entorno

Copie el ejemplo y edite solo su copia. El desarrollo usa `.env` en la raíz del repositorio. El VPS usa otro `.env`, armado desde el ejemplo de producción. Ninguno de los dos se sube a Git.

En macOS o Linux:

```
cp .env.example .env
```

En Windows, con PowerShell:

```
Copy-Item .env.example .env
```

En el VPS, cuando exista, el archivo de partida es otro.

```
cp .env.produccion.example .env
```

Cambie cada valor de ejemplo antes de arrancar. Genere las dos claves de sesión con este comando y pegue cada resultado en una variable distinta. El comentario de `.env.example` pide al menos 32 caracteres.

```
openssl rand -base64 32
```

La tabla siguiente repite todos los nombres de `.env.example` y de `.env.produccion.example`. La columna de desarrollo y la de producción muestran el valor de ejemplo de cada archivo, no un secreto real. Si una variable no está en un archivo, la celda dice que no está.

Tabla: Variables de los archivos de ejemplo {#tab:variables}

| Variable | Ejemplo en `.env.example` | Ejemplo en `.env.produccion.example` |
|---|---|---|
| `POSTGRES_USER` | No está en ese archivo | `incovsa` |
| `POSTGRES_PASSWORD` | No está en ese archivo | `cambie-esta-clave` |
| `POSTGRES_DB` | No está en ese archivo | `incovsa` |
| `DATABASE_URL` | `postgresql://USUARIO:CONTRASENA@localhost:5432/incovsa` | `postgresql://incovsa:cambie-esta-clave@postgres:5432/incovsa` |
| `DATABASE_URL_PRUEBAS` | `postgresql://USUARIO:CONTRASENA@localhost:5432/incovsa_pruebas` | No está en ese archivo |
| `BETTER_AUTH_SECRET_SITIO` | `cambie-esto-por-una-clave-aleatoria-de-32-caracteres` | El mismo texto de ejemplo |
| `BETTER_AUTH_SECRET_PICKING` | `cambie-esto-por-otra-clave-aleatoria-de-32-caracteres` | El mismo texto de ejemplo |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://incovsa.com` |
| `SESION_DIAS` | `7` | `7` |
| `CLAVE_DEMO` | `cambie-esta-clave` | No está en ese archivo |
| `ALMACENAMIENTO` | `disco` | `r2` |
| `R2_CUENTA` | vacío, `""` | `ejemplo-de-cuenta` |
| `R2_LLAVE` | vacío, `""` | `ejemplo-de-llave` |
| `R2_SECRETO` | vacío, `""` | `ejemplo-de-secreto` |
| `R2_BUCKET_IMAGENES` | vacío, `""` | `incovsa-imagenes` |
| `URL_IMAGENES` | vacío, `""` | `https://imagenes.incovsa.com` |
| `RCLONE_DEST` | No está en ese archivo | `r2:incovsa-respaldos` |
| `IMAGEN_APP` | No está en ese archivo | Comentada. El ejemplo es `ghcr.io/jordin-garcia/proyecto_incovsa:produccion` |
| `URL_ODOO` | vacío, `""` | Vacía |
| `TIEMPO_REAL_CONSULTA_MS` | `5000` | `5000` |
| `DOMINIO` | No está en ese archivo | `incovsa.com` |

`DATABASE_URL` de desarrollo apunta a su PostgreSQL local. Sustituya `USUARIO` y `CONTRASENA` por los de ese servidor. `DATABASE_URL_PRUEBAS` tiene que ser otra base. `npm test` vacía la base de pruebas.

`CLAVE_DEMO` es la contraseña de las cuentas `ejemplo.01` a `ejemplo.10`. Mínimo 8 caracteres. No la ponga en el `.env` de producción. `npm run semilla:demo` se niega si `NODE_ENV` es `production`.

`ALMACENAMIENTO=disco` guarda archivos en `almacenamiento-local/`. Úselo en desarrollo. En producción el código rechaza ese modo. `URL_IMAGENES` no lleva barra al final. `URL_ODOO` se deja vacía hasta que INCOVSA defina la dirección. Ese dato es P-06.

`RCLONE_DEST` es el remoto de rclone, no una llave. Las llaves de R2 del respaldo viven en la configuración de rclone del usuario de despliegue, no en `.env`.

`docker-compose.yml` también lee `CADDYFILE`. Si no la define, usa `./Caddyfile`. No está en los archivos de ejemplo.

TODO(CE-11): `ejemplo-de-cuenta`, `ejemplo-de-llave`, `ejemplo-de-secreto`, `incovsa-imagenes` y `r2:incovsa-respaldos` son textos del ejemplo. No hay cuenta R2 (P-94). El código de `src/modulos/almacenamiento/servicio.ts` exige que `R2_CUENTA` tenga 32 caracteres hexadecimales. El ejemplo no cumple ese formato y no debe usarse tal cual.
