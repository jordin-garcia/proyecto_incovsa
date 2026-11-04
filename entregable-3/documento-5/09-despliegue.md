# Despliegue

El sitio de producción corre en un VPS con Docker Compose. Hay tres servicios. `caddy` publica los puertos 80 y 443. `app` escucha el puerto 3000 solo en la red interna. `postgres` no publica puerto. Los tres reinician con `unless-stopped`. Los registros de Docker rotan a 10 MB, con 5 archivos, en formato `json-file`. `caddy` arranca solo cuando `app` está sana.

> **Pendiente de producción (versión 1.1).** INCOVSA todavía no entrega el VPS, el DNS ni las cuentas (P-10, P-93 y P-94), así que este procedimiento no se ha ejecutado en el servidor real. El primer despliegue lo hace el coordinador al integrar `develop` en `main`, en cuanto existan los accesos. Mientras tanto, el apartado «Probar Compose sin VPS» repite el despliegue en una computadora con Docker.

## Preparar el servidor

Todo este apartado se hace en una sola sesión de root, porque al final `preparar-vps.sh` prohíbe el ingreso de root por SSH y el usuario de despliegue no tiene `sudo`. Después, root solo entra por la consola del proveedor del VPS.

**Paso 1.** En la computadora de quien despliega, cree un par de llaves dedicado para el usuario de despliegue. La llave pública es la que recibe el servidor; la privada se carga después en GitHub.

```
ssh-keygen -t ed25519 -f incovsa-despliegue -C despliegue-incovsa
```

**Paso 2.** Copie `evidencia/CE-08/preparar-vps.sh` y `evidencia/CE-08/verificar-vps.sh` al servidor, entre como root y ejecute el primero. Acepta tres variables: `USUARIO_DESPLIEGUE` (por defecto `despliegue`), `PUBKEY_DESPLIEGUE` (el contenido de `incovsa-despliegue.pub`; obligatoria si root no tiene llaves autorizadas) y `DIR_APP` (por defecto `/home/` seguido del usuario y de `/incovsa`).

```
USUARIO_DESPLIEGUE=despliegue PUBKEY_DESPLIEGUE='ssh-ed25519 AAAA... despliegue-incovsa' bash preparar-vps.sh
```

El script activa `unattended-upgrades` sin reinicio automático, deja SSH solo con llave y sin ingreso de root, abre en UFW únicamente los puertos 22, 80 y 443, instala fail2ban y Docker, pone al usuario de despliegue en el grupo `docker` y crea su carpeta `~/incovsa` vacía. Si las llaves del usuario de despliegue quedan vacías, se detiene antes de tocar SSH, para no dejar el servidor sin acceso. No cierre la sesión de root todavía.

**Paso 3.** Como root, instale Git, Node.js 24 y rclone de forma que los encuentre cualquier usuario. Node.js se instala desde el binario oficial en `/usr/local`; sustituya `24.X.Y` por la versión 24 más reciente que liste https://nodejs.org/dist/latest-v24.x/. El apt de Ubuntu 24.04 trae una versión de Node.js más vieja y no sirve.

```
apt-get install -y git
curl -fsSLO https://nodejs.org/dist/latest-v24.x/node-v24.X.Y-linux-x64.tar.xz
tar -xJf node-v24.X.Y-linux-x64.tar.xz -C /usr/local --strip-components=1
curl -fsSL https://rclone.org/install.sh | bash
```

## La carpeta de la aplicación

**Paso 4.** Desde la misma sesión de root, pase al usuario de despliegue, compruebe las herramientas y clone el repositorio en la carpeta que creó el script:

```
su - despliegue
command -v node rclone docker git
git clone https://github.com/jordin-garcia/proyecto_incovsa.git ~/incovsa
cd ~/incovsa
cp .env.produccion.example .env
chmod 600 .env
```

`command -v` tiene que mostrar las cuatro rutas. Si el repositorio es privado (por ejemplo, después de transferirlo a INCOVSA), el VPS necesita una llave de despliegue de solo lectura o un token de solo lectura para clonarlo.

Escriba en `.env` los valores reales (apartado Variables de entorno). Ningún secreto puede quedar con el valor de ejemplo. `IMAGEN_APP` puede quedar comentada: sin ella, Compose usa la etiqueta `produccion`, que el flujo de despliegue mueve a cada imagen nueva.

Configure el remoto `r2` de rclone y la línea de cron de los respaldos (apartado Respaldo). Después vuelva a root con `exit`.

**Paso 5.** Como root, compruebe el servidor completo:

```
bash verificar-vps.sh
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

`verificar-vps.sh` revisa SSH, UFW, Docker, la carpeta, `docker-compose.yml`, `Caddyfile` y que `.env` tenga permisos 600; si lo ejecuta antes del Paso 4, marca como fallo esos tres archivos. Anote la huella que imprime `ssh-keygen -lf`: sirve para comprobar `VPS_KNOWN_HOSTS`. Ahora sí puede cerrar la sesión de root.

## Secretos de GitHub

**Paso 6.** En la computadora de quien despliega, obtenga la línea de la llave del servidor y compare su huella con la anotada:

```
ssh-keyscan -t ed25519 DIRECCION_DEL_VPS > known_hosts_vps
ssh-keygen -lf known_hosts_vps
```

**Paso 7.** Cree el entorno `produccion` del repositorio y sus cuatro secretos. Necesita permisos de administrador del repositorio.

```
gh api -X PUT repos/jordin-garcia/proyecto_incovsa/environments/produccion
gh secret set VPS_HOST --env produccion
gh secret set VPS_USUARIO --env produccion
gh secret set VPS_LLAVE_SSH --env produccion < incovsa-despliegue
gh secret set VPS_KNOWN_HOSTS --env produccion < known_hosts_vps
```

`gh secret set` pide el valor sin mostrarlo. `VPS_HOST` es la dirección del servidor y `VPS_USUARIO` el usuario de despliegue. Después de cargarla, borre la llave privada `incovsa-despliegue` de la computadora: ninguna computadora del equipo guarda credenciales de producción (decisión 70 de la especificación).

## Lo que hace el flujo automático

El archivo `.github/workflows/despliegue.yml` se llama Despliegue. Un *push* a `main` hace lo siguiente.

1. Compila la imagen y la sube a `ghcr.io/jordin-garcia/proyecto_incovsa` con la etiqueta del *commit* y con la etiqueta `produccion`.
2. Borra las imágenes etiquetadas que sobran en ese paquete y deja como máximo 5.
3. Si existen los secretos del entorno `produccion`, entra por SSH al VPS.

Sin los secretos, el flujo imprime `Faltan secretos del VPS (CE-08). Se omite el SSH; GHCR ya publicó la imagen.` y termina bien después de publicar.

Con los secretos, el flujo entra a `~/incovsa` y se autentica en GHCR con el token de la corrida, que va por `--password-stdin` y no queda en el servidor. Después ejecuta estas acciones, con `ETIQUETA` igual al SHA del *commit* que acaba de publicar:

```
export IMAGEN_APP="ghcr.io/jordin-garcia/proyecto_incovsa:ETIQUETA"
docker compose up -d postgres --wait
docker compose pull app
docker compose run --rm --no-deps --entrypoint ./node_modules/.bin/prisma app migrate deploy
docker compose up -d app
docker logout ghcr.io
```

`IMAGEN_APP` solo vale durante esa sesión SSH. Un `docker compose up` que usted ejecute después a mano usa el valor del `.env` o, si está comentado, la etiqueta `produccion`.

Al final, el flujo comprueba el sitio hasta 24 veces, con una espera de 5 segundos:

```
curl -fsS --max-time 15 https://incovsa.com/ -o /dev/null
```

El *push* solo dispara el flujo en `main`. Una ejecución a mano (`workflow_dispatch`) desde otra rama, o desde `main` con `modo_prueba` en verdadero, publica solo en el paquete `proyecto_incovsa-prueba`. Ese paquete no usa la etiqueta `produccion` y el flujo no entra por SSH.

## El primer despliegue

Antes del primer despliegue, el registro DNS de `incovsa.com` ya tiene que apuntar al VPS (apartado Dominio y HTTPS); si no, Caddy no puede emitir el certificado. El flujo solo levanta `postgres` y `app`. La primera vez, `caddy` todavía no está corriendo y la comprobación final del flujo falla. Después de esa primera corrida, entre con el usuario de despliegue y complete estos pasos en `~/incovsa`:

**Paso 1.** Arranque Caddy sin tocar los otros dos servicios:

```
docker compose up -d --no-deps caddy
```

**Paso 2.** Cargue la semilla base (apartado Configuración de la base de datos):

```
docker compose exec app npm run db:semilla
```

**Paso 3.** Cree el primer administrador (apartado Creación del primer administrador):

```
docker compose exec app npm run crear-admin
```

**Paso 4.** Vuelva a ejecutar la corrida del flujo para que la comprobación final quede en verde:

```
gh run list --workflow despliegue.yml --branch main --limit 1
gh run rerun ID_DE_LA_CORRIDA --failed
```

El primer comando muestra el número de la corrida que reemplaza a `ID_DE_LA_CORRIDA`.

Desde el segundo despliegue, `caddy` ya está corriendo y el flujo termina solo.

## Volver a una imagen anterior

En `main`, ejecute el flujo con una etiqueta que todavía exista en GHCR. No aplica migraciones: el flujo cambia el `ENTRYPOINT` de `app` a `node server.js` para ese arranque.

```
gh workflow run despliegue.yml --ref main -f etiqueta=ETIQUETA
gh run watch
```

Use el SHA completo, de 40 caracteres, y fije también `IMAGEN_APP` en el `.env` del VPS, como explica el apartado Actualización del sistema. `etiqueta` admite de 1 a 128 caracteres. El primero es letra, número o guion bajo. El resto puede ser letra, número, guion bajo, punto o guion.

Para publicar sin entrar al VPS, deje `etiqueta` vacía y pase la otra entrada:

```
gh workflow run despliegue.yml --ref main -f modo_prueba=true
```

## Probar Compose sin VPS

En una computadora con Docker puede levantar el mismo `docker-compose.yml` con la imagen construida en el apartado Compilación. Use un `.env` de prueba, nunca el de INCOVSA. Como Compose lee el `.env` de la raíz del repositorio, guarde antes una copia de su `.env` de desarrollo con `cp .env .env.desarrollo`, o haga la prueba en otra copia del repositorio. Es el mismo que usa el flujo `produccion-imagen`, con las dos claves de autenticación generadas en el momento. Cree el `.env` de prueba con estas líneas:

```
POSTGRES_USER=incovsa
POSTGRES_PASSWORD=incovsa_ci_local
POSTGRES_DB=incovsa
DATABASE_URL=postgresql://incovsa:incovsa_ci_local@postgres:5432/incovsa
BETTER_AUTH_URL=https://localhost
SESION_DIAS=7
ALMACENAMIENTO=disco
DOMINIO=localhost
```

Y agregue las dos claves, distintas entre sí:

```
echo "BETTER_AUTH_SECRET_SITIO=$(openssl rand -hex 32)" >> .env
echo "BETTER_AUTH_SECRET_PICKING=$(openssl rand -hex 32)" >> .env
```

Con ese `.env` en la raíz del repositorio:

```
IMAGEN_APP=incovsa-app:ci docker compose up -d
IMAGEN_APP=incovsa-app:ci docker compose exec app npm run db:semilla
curl -kfsS --resolve localhost:443:127.0.0.1 https://localhost/ -o /dev/null
```

`-k` hace falta porque el certificado de `localhost` lo emite Caddy para la prueba y no es el de `incovsa.com`. No use `-k` contra `https://incovsa.com`. Con `ALMACENAMIENTO=disco` el sitio arranca, pero la aplicación rechaza las imágenes, porque corre con `NODE_ENV=production`: la prueba comprueba el arranque, HTTPS y la base, no la subida de imágenes.

Al terminar, borre el entorno de prueba y su `.env`, y recupere el de desarrollo:

```
IMAGEN_APP=incovsa-app:ci docker compose down -v
mv .env.desarrollo .env
```
