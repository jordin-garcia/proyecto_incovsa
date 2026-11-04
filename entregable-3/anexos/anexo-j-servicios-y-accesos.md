# Anexo J. Inventario de servicios y accesos

Tabla: Control de versiones del Anexo J

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 03/11/2026 | Inventario para la entrega académica del 04/11, con los servicios que INCOVSA todavía no entrega marcados como pendientes | Carlos Hugo Escobar Gómez y Héctor Jordin Adolfo García Coyoy |

Este anexo lista cada servicio que usa el sistema: quién es el dueño de la cuenta, para qué se usa, cómo se accede y quién recibe la credencial. También trae el procedimiento para entregar las credenciales y los pasos para transferir el repositorio a INCOVSA.

**Este anexo no contiene contraseñas, llaves, tokens, identificadores de cuenta ni direcciones IP** (RNF-10). Solo nombra las variables y los secretos. Los valores se entregan en persona, como dice «Entrega de las credenciales».

## Estado al 03/11/2026

- INCOVSA todavía no entrega el VPS (P-10), el DNS de incovsa.com (P-93) ni el correo de la empresa para crear las cuentas de Cloudflare y del VPS, ni la cuenta u organización de GitHub que recibe el repositorio (P-94). Esos datos dicen **«pendiente de entrega por INCOVSA»**.
- El sistema no está desplegado. El despliegue (JG-19), la entrega de accesos y la transferencia del repositorio se hacen antes de la entrega final a INCOVSA del **jueves 12/11/2026** (`specs/16`, decisión 90).
- La versión 1.1 de este anexo (CE-15) cambia cada pendiente por el dato real que ya se tenga.

## Resumen

Tabla: Resumen de los servicios

| Servicio | Dueño de la cuenta | Para qué se usa | Cómo se accede | Quién recibe la credencial | Estado |
|---|---|---|---|---|---|
| VPS | INCOVSA | Servidor de producción de incovsa.com | Panel del proveedor y SSH con llave | La cuenta es de INCOVSA. Los secretos del servidor, la persona de P-03 | Pendiente de entrega por INCOVSA (P-10) |
| Dominio y DNS en Cloudflare | INCOVSA | DNS de incovsa.com y del subdominio `imagenes.incovsa.com` | Panel de Cloudflare | La cuenta es de INCOVSA | Pendiente de entrega por INCOVSA (P-93 y P-94) |
| R2, bucket de imágenes | INCOVSA, en la misma cuenta de Cloudflare | Imágenes del sitio | Panel de Cloudflare. La aplicación, con una llave limitada a ese bucket | La persona de P-03 | Pendiente de entrega por INCOVSA (P-94) |
| R2, bucket privado de respaldos | INCOVSA, en la misma cuenta de Cloudflare | Respaldos diarios de PostgreSQL | Panel de Cloudflare. El VPS, con `rclone` y una llave limitada a ese bucket | La persona de P-03 | Pendiente de entrega por INCOVSA (P-94) |
| GitHub: repositorio, Actions y entorno `produccion` | Hoy, la cuenta `jordin-garcia`. Después de la transferencia, INCOVSA | Código, integración continua y despliegue automático | GitHub, con la cuenta dueña | Se transfiere el repositorio, no una contraseña | Repositorio en uso. Cuenta de destino pendiente (P-94) |
| GHCR (registro de imágenes de Docker) | El dueño del repositorio | Imágenes de producción de la aplicación | Lo usa el flujo de despliegue con el token de cada corrida | Nadie: no hay credencial que entregar | Sin imágenes de producción todavía |
| Google Drive de INCOVSA | INCOVSA | Documentos técnicos (FT, HS y COA) | Enlaces que el sistema muestra según los permisos | La cuenta es de INCOVSA | Cuenta o carpeta pendiente (P-92) |
| Cuentas de administrador del sistema | La persona que indique INCOVSA | Primera cuenta de Gerencia o Soporte del sitio y del picking | `incovsa.com/acceso` | Nadie: la persona escribe su propia contraseña | Pendiente: persona (P-08) y despliegue (JG-19) |

El sistema no usa más servicios con credenciales. **Odoo** solo aparece como un enlace (`URL_ODOO`) y como el archivo `.xlsx` que exporta el facturador: no hay conexión ni credencial de Odoo. **No hay cuenta de correo**: el sistema no envía correos (`specs/16`, «Servicios externos»).

## VPS

Tabla: Ficha del VPS

| Campo | Dato |
|---|---|
| Dueño | INCOVSA. La cuenta del proveedor se crea a nombre de la empresa, con un correo de la empresa, y se invita al equipo (decisión 33). Proveedor y correo: **pendiente de entrega por INCOVSA** (P-10 y P-94). |
| Uso | Servidor de producción de incovsa.com. Docker Compose corre Caddy, la aplicación y PostgreSQL 18. Características pedidas: Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM, 80 GB SSD, dirección IP fija y SSH con llave (decisión 28). |
| Acceso | SSH solo con llave, con el usuario de despliegue (`despliegue`, apartado Despliegue del Documento 5). El ingreso de root por SSH queda prohibido: root entra solo por la consola del proveedor, con la cuenta de INCOVSA. La dirección del servidor no se anota aquí. |
| Quién recibe | La cuenta del proveedor ya es de INCOVSA. Los secretos que se guardan en el servidor los recibe la persona de P-03 (ver «Entrega de las credenciales»). |
| Estado | **Pendiente de entrega por INCOVSA** (P-10). |

## Dominio y DNS en Cloudflare

Tabla: Ficha del dominio y del DNS en Cloudflare

| Campo | Dato |
|---|---|
| Dueño | INCOVSA, en su cuenta de Cloudflare (decisión 33). El registrador del dominio y quién administra hoy el DNS: **pendiente de entrega por INCOVSA** (P-93). |
| Uso | DNS de incovsa.com en el plan gratuito de Cloudflare: incovsa.com apunta al VPS y `imagenes.incovsa.com` al bucket de imágenes (decisión 32). Si el DNS no pudiera pasar a Cloudflare, la aplicación serviría las imágenes desde una ruta propia. |
| Acceso | Panel de Cloudflare, con la cuenta de INCOVSA. |
| Quién recibe | La cuenta es de INCOVSA. No hay una credencial del equipo que entregar. |
| Estado | **Pendiente de entrega por INCOVSA** (P-93 y P-94). |

## R2, bucket de imágenes

Tabla: Ficha del bucket de imágenes de R2

| Campo | Dato |
|---|---|
| Dueño | INCOVSA, en la misma cuenta de Cloudflare. |
| Uso | Imágenes del sitio. La base de datos solo guarda su dirección. En producción se sirven desde `imagenes.incovsa.com`; la dirección gratuita `r2.dev` no se usa (`specs/16`, «Almacenamiento»). Nombre de ejemplo: `incovsa-imagenes`. |
| Acceso | Panel de Cloudflare para el dueño de la cuenta. La aplicación usa una llave limitada a ese bucket, en las variables `R2_CUENTA`, `R2_LLAVE` y `R2_SECRETO` del `.env` del VPS (apartado Almacenamiento del Documento 5). |
| Quién recibe | La persona de P-03 recibe la copia de la llave junto con el `.env` (ver «Entrega de las credenciales»). |
| Estado | **Pendiente de entrega por INCOVSA** (P-94). El bucket no existe. |

## R2, bucket privado de respaldos

Tabla: Ficha del bucket privado de respaldos de R2

| Campo | Dato |
|---|---|
| Dueño | INCOVSA, en la misma cuenta de Cloudflare. |
| Uso | Respaldos de PostgreSQL. Cada noche, una tarea de `cron` del VPS ejecuta `pg_dump` dentro del contenedor de PostgreSQL y sube el archivo con `rclone`. Se conservan 7 diarios y 4 semanales (decisión 34, `specs/16` «Respaldos»). Es un bucket privado, distinto del de las imágenes. Nombre de ejemplo: `incovsa-respaldos`. |
| Acceso | Panel de Cloudflare para el dueño de la cuenta. En el VPS, el remoto `r2` de `rclone`, con una llave limitada a ese bucket, guardada en la configuración de `rclone` del usuario de despliegue, no en el `.env` (apartado Respaldo del Documento 5). |
| Quién recibe | La persona de P-03 recibe la copia de la configuración de `rclone` (ver «Entrega de las credenciales»). |
| Estado | **Pendiente de entrega por INCOVSA** (P-94). El bucket no existe y la tarea de `cron` no está instalada. |

## GitHub: repositorio, Actions y entorno `produccion`

Tabla: Ficha de GitHub

| Campo | Dato |
|---|---|
| Dueño | Hoy, la cuenta de GitHub Student del coordinador: el repositorio es `jordin-garcia/proyecto_incovsa`. Se transfiere a una cuenta u organización de INCOVSA (decisión 33) a más tardar el 12/11 (decisión 90). Nombre de la cuenta u organización: **pendiente de entrega por INCOVSA** (P-94). |
| Uso | Código, integración continua con GitHub Actions y despliegue automático: un *push* a `main` publica la imagen en GHCR y entra al VPS por SSH (apartado Despliegue del Documento 5). Hoy el repositorio es público (decisión 90). |
| Acceso | GitHub, con la cuenta dueña. El paso de SSH lee los secretos del entorno `produccion`: `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` y `VPS_KNOWN_HOSTS`. GitHub no deja leer esos valores, solo reemplazarlos. El entorno se crea en el despliegue (JG-19). |
| Quién recibe | No se entrega una contraseña: el repositorio cambia de dueño con la transferencia (ver «Transferencia del repositorio»). La contraseña de GitHub del coordinador nunca se entrega. |
| Estado | El repositorio existe. El entorno `produccion` no existe todavía. La transferencia no se ha hecho. |

## GHCR

Tabla: Ficha de GHCR

| Campo | Dato |
|---|---|
| Dueño | La cuenta dueña del repositorio. El flujo publica en `ghcr.io/` seguido del nombre del repositorio, así que después de la transferencia publica bajo el dueño nuevo. |
| Uso | Registro privado de las imágenes de producción, con la etiqueta del *commit* y la etiqueta `produccion`. El flujo conserva las últimas 5. Con GitHub Student hay 2 GB; después de la transferencia, el límite depende del plan de INCOVSA (`specs/16`, «Despliegue»). |
| Acceso | El flujo de despliegue entra con el token de cada corrida, que no queda en el VPS. |
| Quién recibe | Nadie: no hay credencial propia que entregar. |
| Estado | Todavía no hay imágenes de producción: el primer despliegue es JG-19. |

## Google Drive de INCOVSA

Tabla: Ficha del Google Drive de INCOVSA

| Campo | Dato |
|---|---|
| Dueño | INCOVSA. Cuenta o carpeta: **pendiente de entrega por INCOVSA** (P-92). |
| Uso | Documentos técnicos del sitio (ficha técnica, hoja de seguridad y certificado de análisis). El sistema guarda solo el enlace y muestra la vista previa y la descarga según los permisos. Acepta solo enlaces `https` de `drive.google.com` y `docs.google.com` (apartado Configuración de servicios externos del Documento 5). |
| Acceso | Quien tiene permiso abre el enlace desde la documentación interna. La protección dentro de Drive la pone INCOVSA al compartir cada archivo (solo cuentas de la empresa y sin descarga para quien solo puede ver, P-92). |
| Quién recibe | La cuenta es de INCOVSA. El sistema no guarda ninguna credencial de Drive. |
| Estado | **Pendiente de entrega por INCOVSA** (P-92). |

El Drive del equipo, donde se guardan los `.docx` y los `.pdf` de los documentos, es otro servicio y no forma parte de la entrega de accesos.

## Cuentas de administrador del sistema

Tabla: Ficha de las cuentas de administrador del sistema

| Campo | Dato |
|---|---|
| Dueño | La persona que indique INCOVSA: **pendiente de entrega por INCOVSA** (P-08). |
| Uso | Primera cuenta de Gerencia o de Soporte. Entra al sitio y al picking. Las demás cuentas las crea ese administrador desde el sistema. |
| Acceso | `https://incovsa.com/acceso`, cuando el sistema esté desplegado. La cuenta se crea en el VPS con `docker compose exec app npm run crear-admin` (apartado Creación del primer administrador del Documento 5). Si olvida la contraseña, otra cuenta de Gerencia o Soporte le escribe una nueva desde la administración de usuarios: no hay recuperación por correo. |
| Quién recibe | Nadie: la cuenta se crea con esa persona presente y ella misma escribe su contraseña. La contraseña no se anota en ningún lugar del equipo. |
| Estado | Pendiente: persona (P-08) y despliegue (JG-19). |

Las cuentas de la semilla de demostración son solo para desarrollo (decisión 79) y no existen en producción.

## Entrega de las credenciales

**Medio: en persona.** Lo decidió el coordinador el 03/11/2026. No se envían por correo, chat, el repositorio, el Drive del equipo ni ningún otro medio digital del equipo, y ninguna computadora ni cuenta del equipo conserva una copia (decisión 70).

**Qué se entrega.** La copia de respaldo de los secretos del servidor (`specs/16`, «Respaldos»):

- el archivo `.env` de `~/incovsa` en el VPS, con `POSTGRES_PASSWORD`, `DATABASE_URL`, `BETTER_AUTH_SECRET_SITIO`, `BETTER_AUTH_SECRET_PICKING`, `R2_CUENTA`, `R2_LLAVE` y `R2_SECRETO`;
- la configuración de `rclone` del usuario de despliegue, con la llave de R2 de los respaldos.

**Qué no se entrega.**

- La llave privada SSH del usuario de despliegue: vive solo en el secreto `VPS_LLAVE_SSH` y se borra de la computadora de quien despliega al cargarla (apartado Despliegue del Documento 5, Paso 7). Si INCOVSA necesita otra, se crea una nueva («Preparar el servidor», Paso 1), su llave pública se agrega al usuario de despliegue desde la consola del proveedor y el secreto se reemplaza (Paso 7).
- La contraseña del primer administrador: la escribe esa persona (ver «Cuentas de administrador del sistema»).
- Las contraseñas de las cuentas de Cloudflare, del VPS y de Google: ya son de INCOVSA.
- La contraseña de GitHub del coordinador: el repositorio se transfiere.

**Quién recibe:** la persona de INCOVSA que indique la empresa: **pendiente de entrega por INCOVSA** (P-03). **Dónde la guarda INCOVSA:** lo elige INCOVSA; la versión 1.1 (CE-15) lo anota sin escribir ningún valor.

**Pasos, a más tardar el 12/11, con el coordinador:**

1. Si la persona que recibe (P-03) no está nombrada, deténgase: no entregue nada.
2. Confirme que las cuentas del VPS y de Cloudflare están a nombre de INCOVSA, con un correo de la empresa (decisión 33).
3. En una reunión presencial, en una computadora de INCOVSA, quien recibe crea su propio par de llaves SSH, con el comando de «Preparar el servidor», Paso 1, del apartado Despliegue del Documento 5, y con un nombre de archivo propio. La llave privada queda solo en esa computadora.
4. Quien recibe entra como root por la consola del proveedor del VPS, con la cuenta de INCOVSA (root no entra por SSH), y agrega la línea de su llave pública `.pub` al final de `/home/despliegue/.ssh/authorized_keys`.
5. Desde la computadora de INCOVSA, quien recibe copia por SSH, con `scp` y su llave nueva, los dos archivos del usuario de despliegue a su medio de guarda: `/home/despliegue/incovsa/.env` y `/home/despliegue/.config/rclone/rclone.conf` (apartado Respaldo del Documento 5, «Rehacer el `.env` y rclone»). El coordinador acompaña y no conserva copia.
6. Quien recibe comprueba que la copia tiene cada secreto de la lista de «Qué se entrega».
7. Si un servicio todavía no existe, no hay credencial de ese servicio que entregar: anótelo en «Lo que no se entrega» del Anexo I. No invente una credencial de reemplazo.
8. No copie ningún valor al repositorio, a este anexo ni al Anexo I: el acta registra solo los nombres de lo que se entregó.
9. Lo entregado se anota en «Accesos» del Anexo I, que se firma en la entrega final del 12/11.
10. Después de la entrega, INCOVSA decide si retira las invitaciones del equipo a sus cuentas.

## Transferencia del repositorio

Los pasos los hace el coordinador con la cuenta `jordin-garcia`, a más tardar el 12/11 (decisiones 33 y 90). Siguen la página «Transferring a repository» de la documentación de GitHub (<https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository>).

**Antes de transferir:**

1. Si INCOVSA no ha dado el nombre de la cuenta u organización de destino (P-94), deténgase: no elija un destino.
2. Confirme que CE-15 ya quitó `docs/Reuniones/` del repositorio (decisión 90). Esa carpeta sigue en el historial de git, como aceptó el coordinador.
3. Confirme que el destino existe en GitHub.com y que no tiene un repositorio con el mismo nombre ni una bifurcación del mismo repositorio.
4. Si el destino es una organización, confirme que el coordinador puede crear repositorios en ella.
5. Revise el plan de la cuenta de destino. Si el repositorio es privado y el destino es una cuenta gratuita, GitHub quita las reglas de protección de las ramas (`develop` y `main` dejan de exigir las verificaciones) y el límite de GHCR baja. Confírmelo con INCOVSA antes de seguir.

**Transferir:**

6. Abra el repositorio, elija **Settings** y, al final de la página, en **Danger Zone**, elija **Transfer**.
7. En **New owner**, escriba o elija el destino. Conserve el nombre `proyecto_incovsa`, salvo que INCOVSA pida otro.
8. Lea el aviso de GitHub sobre las funciones que dependen del plan.
9. Escriba el nombre del repositorio donde GitHub lo pide y confirme con **I understand, transfer this repository**.
10. Si el destino es una cuenta personal, su dueño tiene un día para aceptar la transferencia por correo; si no la acepta, la invitación caduca.

**Después de transferir:**

11. GitHub conserva los secretos, los *webhooks* y las llaves de despliegue, y deja al dueño anterior como colaborador. Su documentación no menciona los entornos: compruebe que el entorno `produccion` y sus cuatro secretos siguen en **Settings → Environments**. Si faltan, vuelva a crearlos con el Paso 7 del apartado Despliegue del Documento 5, con la dirección nueva del repositorio en lugar de `jordin-garcia/proyecto_incovsa`.
12. Las imágenes ya publicadas se quedan en `ghcr.io/jordin-garcia/proyecto_incovsa` y el repositorio transferido pierde el acceso a ellas (página «About permissions for GitHub Packages», <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages>). Antes del siguiente despliegue, publique otra vez la imagen de producción con un *push* a `main` o con el flujo Despliegue: el flujo ya publica bajo el dueño nuevo. Ese *push* también despliega. Después de la transferencia no se puede volver a una imagen publicada antes de ella: queda en el paquete del dueño anterior.
13. Cambie la imagen por defecto `ghcr.io/jordin-garcia/proyecto_incovsa:produccion` de `docker-compose.yml` por la del dueño nuevo, en un PR, o fije `IMAGEN_APP` en el `.env` del VPS. Si `IMAGEN_APP` ya está fijada en el `.env` (por ejemplo, después de volver a una imagen anterior), cámbiela también.
14. En el VPS y en cada copia local, cambie el remoto con `git remote set-url origin` y la dirección nueva. Si el repositorio es privado, el VPS necesita una llave de despliegue o un token de solo lectura para descargarlo (apartado Despliegue del Documento 5).
15. Las direcciones viejas redirigen a la nueva mientras nadie cree un repositorio con el mismo nombre en `jordin-garcia`. No lo haga.
16. Anote en el Anexo I el destino y la fecha de la transferencia.
