# Dominio y HTTPS

## Registros DNS

El DNS de `incovsa.com` se administra en Cloudflare, en el plan gratuito (decisión 32 de la especificación). Hacen falta dos registros:

Tabla: Registros DNS de producción {#tab:dns}

| Nombre | Tipo | Destino |
|---|---|---|
| `incovsa.com` (`@`) | A | La dirección IP fija del VPS |
| `imagenes` | Dominio personalizado de R2 | El bucket de imágenes; el registro lo crea el panel de R2 al conectar el dominio |

El registro de `incovsa.com` queda siempre como «DNS only», sin el proxy de Cloudflare. Caddy obtiene el certificado por los puertos 80 y 443 y termina el HTTPS en el VPS, y escribe en `X-Real-IP` la dirección de quien se conecta. Con el proxy de Cloudflare esa dirección sería la de Cloudflare: el bloqueo de 20 fallos por dirección IP afectaría a todos los usuarios a la vez y la bitácora perdería la dirección real. Activar el proxy exige antes cambiar el `Caddyfile` y `src/lib/ip.ts`, y es una decisión del coordinador.

> **Pendiente de producción (versión 1.1).** El DNS de `incovsa.com` todavía no está en Cloudflare (P-93), así que no hay certificado real ni registro de `imagenes.incovsa.com`. La decisión 32 prevé que, si INCOVSA no puede mover el DNS, la aplicación sirva las imágenes desde una ruta propia; ese modo no está implementado en producción, y `ALMACENAMIENTO=disco` lanza `El almacenamiento local no está disponible en producción.` Si el DNS no se puede mover, avise al coordinador antes del despliegue.

## Caddy

El `Caddyfile` atiende el valor de `DOMINIO`. Si esa variable falta, atiende `incovsa.com`. No declara `imagenes.incovsa.com`, porque ese nombre apunta al bucket de imágenes, no a Caddy. El bloque global `admin off` apaga la API de administración de Caddy.

Caddy limita el cuerpo de las peticiones a `27MB` (en base 10), reenvía a `app:3000`, escribe `X-Real-IP` con la dirección del cliente y pone `flush_interval -1` para enviar enseguida los avisos en tiempo real. El tope de 27 MB cubre `POST /api/imagenes/publicar`: hasta 5 imágenes de 5 MB más el *multipart*. Las acciones del servidor siguen en 3 MB, porque `next.config.ts` fija `bodySizeLimit` en `3mb`.

Caddy no agrega cabeceras de seguridad. La cabecera `Strict-Transport-Security` (`max-age=31536000; includeSubDomains`), la política de seguridad de contenido y las demás cabeceras las envía Next.js en producción (`src/lib/cabeceras.ts`). Si Caddy también las enviara, saldrían repetidas. El flujo `produccion-imagen` comprueba que, a través de Caddy, llegue una sola cabecera HSTS.

Con un nombre de host en el sitio, Caddy 2 pide el certificado, lo renueva solo y redirige el puerto 80 al 443. El `Caddyfile` no escribe esa redirección en una línea propia.

Para validar el archivo sin arrancar el sitio:

```
docker run --rm -e DOMINIO=incovsa.com -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2 caddy validate --config /etc/caddy/Caddyfile
```

## Comprobar HTTPS

Cuando el DNS apunte al VPS, compruebe el sitio público sin `-k`:

```
curl -fsSI https://incovsa.com/
```

La respuesta tiene que traer una sola cabecera `strict-transport-security`. El flujo de despliegue usa `curl -fsS`, sin mostrar cabeceras, y falla si el sitio no responde.
