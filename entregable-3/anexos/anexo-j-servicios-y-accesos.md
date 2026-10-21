# Anexo J. Inventario de servicios y accesos

Este anexo lista los servicios de la entrega del 4 de noviembre de 2026. No contiene contraseñas, llaves, tokens ni direcciones IP. RNF-10 deja esas credenciales fuera del repositorio.

Las secciones de cada servicio son de consulta. Las dos últimas secciones son los pasos de ese día.

CE-08 está bloqueada. P-10, P-93 y P-94 no están entregados. Al redactar este anexo, INCOVSA no ha entregado el VPS, el DNS de incovsa.com en Cloudflare ni los buckets de R2.

## VPS

| Campo | Hecho |
|---|---|
| Dueño | INCOVSA. La decisión 33 pide crear la cuenta a nombre de la empresa, con un correo de la empresa, e invitar al equipo. El repositorio no trae ese correo ni el nombre del proveedor. |
| Uso | Servidor de producción de incovsa.com. Docker Compose corre Caddy, la aplicación y PostgreSQL 18. La decisión 28 pide Ubuntu Server 24.04 LTS, 2 vCPU, 4 GB de RAM, 80 GB SSD, dirección IP fija y SSH con llave. |
| Acceso | SSH con llave. La decisión 28 no nombra al usuario del sistema. La lista `evidencia/CE-08/pasos-hugo.md` usa el usuario `despliegue`. Esa cuenta no existe mientras P-10 siga abierto. La dirección IP no se anota aquí. |
| Receptor | La persona de P-03. El pendiente está en Entregar las credenciales. |
| Estado | No entregado. El Ing. William Ambrossio se comprometió a contratarlo. La decisión 73 pidió el acceso a más tardar el 28 de octubre de 2026. |

TODO(CE-12): correo de INCOVSA para la cuenta del VPS y la cuenta de Cloudflare.

TODO(CE-12): proveedor del VPS.

## Dominio y DNS en Cloudflare

| Campo | Hecho |
|---|---|
| Dueño | La cuenta de Cloudflare de INCOVSA, decisión 33. El correo es el pendiente de la sección VPS. El repositorio no nombra al registrador del dominio. P-93 no dice quién administra hoy el DNS. |
| Uso | DNS de incovsa.com en el plan gratuito de Cloudflare. El plan hace que incovsa.com resuelva al VPS y que `imagenes.incovsa.com` muestre el bucket de imágenes. La decisión 32 lo fija. Ese DNS no está entregado. Si INCOVSA no puede pasarlo a Cloudflare, la aplicación sirve las imágenes desde una ruta propia. |
| Acceso | Panel de la cuenta de Cloudflare de INCOVSA. Esa cuenta no existe mientras P-94 siga abierto. |
| Receptor | La persona de P-03. El pendiente está en Entregar las credenciales. |
| Estado | No entregado. P-93 sigue abierto. CE-08 está bloqueada. |

TODO(CE-12): registrador del dominio incovsa.com.

TODO(CE-12): quién administra el DNS de incovsa.com y si puede pasar a Cloudflare.

## R2, bucket de imágenes

| Campo | Hecho |
|---|---|
| Dueño | La cuenta de Cloudflare de INCOVSA. El correo es el pendiente de la sección VPS. |
| Uso | Imágenes del sitio. La base de datos guarda solo la dirección. En producción el sitio las muestra desde `imagenes.incovsa.com`. La dirección gratuita `r2.dev` queda fuera de producción. La lista `evidencia/CE-08/pasos-hugo.md` llama al bucket `incovsa-imagenes`. La lectura pública de ese bucket usa solo `imagenes.incovsa.com`. |
| Acceso | Panel de Cloudflare, con una credencial limitada a ese bucket. El valor no está en el repositorio. El bucket no está creado. |
| Receptor | La persona de P-03. El pendiente está en Entregar las credenciales. |
| Estado | No entregado. P-94 sigue abierto. |

## R2, bucket privado de respaldos

| Campo | Hecho |
|---|---|
| Dueño | La misma cuenta de Cloudflare de INCOVSA. |
| Uso | Respaldos de PostgreSQL. El bucket es privado y es distinto del bucket de imágenes. La lista `evidencia/CE-08/pasos-hugo.md` lo llama `incovsa-respaldos`. La decisión 34 programa cada noche, en el VPS, una tarea cron que ejecuta `pg_dump` y sube el archivo con `rclone`. El script conserva 7 diarios y 4 semanales. La credencial de R2 del VPS entra solo a ese bucket. Esa tarea no está instalada. CE-08 está bloqueada. |
| Acceso | Panel de Cloudflare para el dueño de la cuenta. En el VPS, `rclone` con una credencial limitada a `incovsa-respaldos`. El repositorio tiene `scripts/respaldo.sh` y `scripts/restaurar.sh`. La prueba de integración continua usa un destino local de `rclone` mientras no exista la cuenta de R2. |
| Receptor | La persona de P-03. El pendiente está en Entregar las credenciales. |
| Estado | El bucket no está creado. P-94 sigue abierto. CE-07 dejó los scripts. CE-08, que instala el cron en el VPS, está bloqueada. |

## GitHub y GHCR

| Campo | Hecho |
|---|---|
| Dueño | Hoy el repositorio `jordin-garcia/proyecto_incovsa` está en la cuenta de GitHub del coordinador. El login `jordin-garcia` está en la decisión 76. Esa cuenta es de GitHub Student e incluye GitHub Pro. El 4 de noviembre de 2026 la decisión 33 lo transfiere a una cuenta u organización de INCOVSA. La decisión no escribe el nombre. |
| Uso | Repositorio privado, GitHub Actions y el registro privado GHCR. En un push a `main`, `.github/workflows/despliegue.yml` publica la imagen de producción en `ghcr.io`, bajo el dueño del repositorio. La imagen lleva la etiqueta del commit y la etiqueta `produccion`. El flujo conserva las últimas 5 imágenes de ese paquete. El cupo actual de GHCR es 2 GB. Tras la transferencia, el cupo depende del plan de la cuenta de INCOVSA. |
| Acceso | GitHub, con la cuenta dueña. El paso de SSH al VPS lee el environment `produccion`. Los nombres de los secretos son `VPS_HOST`, `VPS_USUARIO`, `VPS_LLAVE_SSH` y `VPS_KNOWN_HOSTS`. Los valores no están en el repositorio. CE-08 registra que ese environment todavía no existe. |
| Receptor | La persona de P-03, sobre la cuenta u organización cuyo nombre falta. |
| Estado | El repositorio existe. La transferencia no se ha hecho. Este anexo no la ejecuta. |

El nombre de destino está marcado en Transferir el repositorio.

## Google Drive de INCOVSA

| Campo | Hecho |
|---|---|
| Dueño | INCOVSA. El repositorio no nombra la cuenta ni la carpeta. |
| Uso | Documentos técnicos del sitio. Ahí están la ficha técnica, la hoja de seguridad y el certificado de análisis. El sistema guarda el enlace. El PDF permanece en Drive. El sistema muestra la vista previa y la descarga según el permiso. Acepta solo enlaces `https://drive.google.com` y `https://docs.google.com`. |
| Acceso | Quien tiene permiso abre el enlace desde la documentación interna. La protección dentro de Drive la define INCOVSA al compartir el archivo. P-92 sigue abierto. El Drive del equipo, donde están los `.docx` y los `.pdf` fuera del repositorio, es otro servicio. |
| Receptor | La persona de P-03. La cuenta sigue en INCOVSA. El repositorio no guarda una contraseña de ese Drive. |
| Estado | P-92 sigue abierto. |

TODO(CE-12): cuenta o carpeta de Google Drive de INCOVSA para los documentos técnicos, y cómo se comparte cada archivo.

## Cuentas de administrador del sistema

| Campo | Hecho |
|---|---|
| Dueño | La persona que indique INCOVSA. P-08 no la nombra. |
| Uso | `npm run crear-admin` pide en la terminal el nombre completo, el nombre de usuario, el rol y la contraseña. El rol es Gerencia o Soporte. Cada ejecución crea una cuenta. El sistema de esa cuenta es `ambos`, y entra al sitio y al picking. La contraseña no queda en el repositorio ni en la semilla. En producción el comando corre dentro del contenedor de la aplicación. JG-19 lo ejecuta. Si P-08 no está resuelto, JG-19 se detiene y pregunta a Jordin. |
| Acceso | La ruta de la aplicación es `/acceso`, en `incovsa.com`, cuando el sistema esté en marcha. Gerencia o Soporte escriben una contraseña nueva desde la administración de usuarios. No hay recuperación por correo. La semilla de demostración no es esta cuenta. La decisión 79 la deja para desarrollo. |
| Receptor | La persona de P-08 usa la cuenta. La entrega del 4 de noviembre de 2026 pone la contraseña en manos de la persona de P-03. Ninguna de las dos está nombrada. |
| Estado | JG-19 está pendiente. La cuenta de producción no existe al redactar este anexo. |

TODO(CE-12): persona y nombre de usuario del administrador inicial.

## Entregar las credenciales

La decisión 73 fija la entrega de accesos el 4 de noviembre de 2026. La capacitación es el 3 de noviembre de 2026.

Ese día el coordinador Héctor Jordin Adolfo García Coyoy transfiere el repositorio. La contraparte prevista es el Ing. William Ambrossio. La decisión 73 pide al Ing. William el acceso al VPS y al DNS. El README lo registra como contraparte. La decisión no nombra a otras personas.

TODO(CE-12): persona de INCOVSA que recibe las credenciales.

TODO(CE-12): preguntar a Jordin el medio.

El medio lo define Jordin con INCOVSA. Este anexo no lo elige.

1. Si la línea del medio sigue abierta, pregunte a Jordin antes de entregar credenciales.
2. Cuando las cuentas existan, confirme que la cuenta del VPS y la cuenta de Cloudflare están a nombre de INCOVSA y que el equipo está invitado. La decisión 33 lo pide. El dueño de esas cuentas es INCOVSA.
3. Entregue por ese medio la contraseña de cada cuenta creada con `npm run crear-admin`. El comando no la guarda. Si JG-19 no creó la cuenta, no hay contraseña que entregar.
4. Si ya existe la credencial de R2, déjela en el VPS. Si ya existe la llave SSH de `despliegue`, déjela en el secreto `VPS_LLAVE_SSH` del environment `produccion`. La decisión 70 deja las credenciales de producción en el VPS y en los secretos de GitHub Actions. No las copie a este anexo ni al medio.
5. No copie al repositorio, a este anexo ni al Anexo I las contraseñas, las llaves privadas, los tokens, la dirección IP, el archivo de entorno del VPS ni los valores del environment `produccion`.
6. No entregue la contraseña de GitHub del coordinador. El repositorio cambia de dueño por la transferencia de la sección siguiente.
7. Si un servicio sigue sin entregar, anótelo en el Anexo I. No invente una credencial de reemplazo. Al redactar este anexo faltan P-10, P-93 y P-94.
8. Quien recibe firma el Anexo I el mismo día.

## Transferir el repositorio

No transfiera el repositorio al redactar este anexo. Los pasos corren el 4 de noviembre de 2026, con el coordinador.

La decisión 33 manda transferirlo ese día a una cuenta u organización de INCOVSA. P-94 pide el nombre. La decisión 33 no lo escribe.

TODO(CE-12): nombre de la cuenta u organización de GitHub de INCOVSA.

El repositorio actual es `jordin-garcia/proyecto_incovsa`. El dueño actual es la cuenta `jordin-garcia`. Esa cuenta es de GitHub Student.

En la transferencia, la imagen de GHCR permanece en la cuenta que la publicó. GitHub quita el vínculo con el repositorio. Los flujos de GitHub Actions del repositorio transferido pierden el acceso a esa imagen. GitHub describe ese efecto en la página About permissions for GitHub Packages, en https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages.

Los pasos de la pantalla están en la página Transferring a repository, en https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository.

1. Si el pendiente del nombre sigue abierto, deténgase y no elija una cuenta de destino.
2. Confirme que la cuenta o la organización de destino ya existe en GitHub.com.
3. Confirme que el destino no tiene un repositorio con el mismo nombre.
4. Si el destino es una organización, confirme que el coordinador puede crear repositorios en ella.
5. Abra el repositorio con la cuenta `jordin-garcia`.
6. Elija **Settings**.
7. Al final de la página, en la zona **Danger Zone**, elija **Transfer**.
8. En el campo **New owner**, indique el nombre del pendiente. Conserve el nombre del repositorio. Cámbielo solo si INCOVSA pide otro nombre y el coordinador es dueño de la organización de destino.
9. Lea el aviso de GitHub sobre funciones que dependen del plan. Specs/16 dicen que, tras la transferencia, el cupo de GHCR depende del plan de INCOVSA. La cuenta actual es GitHub Student, que incluye GitHub Pro, y por eso `develop` y `main` pueden exigir las revisiones. Si el plan de destino no incluye eso, el coordinador confirma las reglas antes de seguir.
10. Escriba el nombre del repositorio donde GitHub lo pide y confirme con **I understand, transfer this repository**.
11. Si el destino es una cuenta personal, el dueño nuevo tiene un día para aceptar la transferencia. Si no acepta, la invitación caduca.
12. No copie los secretos, los webhooks ni las llaves de despliegue. GitHub los deja en el repositorio transferido. El dueño anterior queda como colaborador.
13. Si ya hay imágenes en `ghcr.io/jordin-garcia/proyecto_incovsa`, publique de nuevo la imagen de producción bajo el dueño nuevo antes del siguiente despliegue al VPS.
14. Actualice el remoto de cada clon local a la dirección nueva.
15. Si alguien crea un repositorio en la dirección vieja, GitHub borra la redirección.
16. Anote en el Anexo I el nombre del destino y si la transferencia terminó.
