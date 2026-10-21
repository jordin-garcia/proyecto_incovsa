# Dominio y HTTPS

El `Caddyfile` atiende el valor de `DOMINIO`. Si esa variable falta, atiende `incovsa.com`. No declara `imagenes.incovsa.com`. Ese nombre apunta al bucket de imágenes, no a Caddy.

Agrega la cabecera `Strict-Transport-Security` con el valor `max-age=31536000; includeSubDomains`. Limita el cuerpo a `27MB`. Caddy mide `MB` en base 10. Reenvía a `app:3000`, escribe `X-Real-IP` con la dirección del cliente y pone `flush_interval -1` para enviar enseguida los avisos en tiempo real.

Las acciones del servidor siguen en 3 MB. `next.config.ts` fija `bodySizeLimit` en `3mb`. El tope de 27 MB cubre `POST /api/imagenes/publicar`, hasta 5 imágenes de 5 MB más el multipart.

Con un nombre de host en el sitio, Caddy 2 pide el certificado y redirige el puerto 80 al 443. El `Caddyfile` no escribe esa redirección en una línea propia. CE-05 lo comprobó con `DOMINIO=localhost` y buscó la cabecera HSTS en la respuesta HTTPS.

Para validar el archivo sin arrancar el sitio:

```
docker run --rm -e DOMINIO=incovsa.com -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2 caddy validate --config /etc/caddy/Caddyfile
```

Cuando el DNS apunte al VPS, compruebe el sitio público sin `-k`.

```
curl -fsSI https://incovsa.com/
```

La respuesta tiene que traer `strict-transport-security`. El flujo de despliegue usa `curl -fsS`, sin mostrar cabeceras, y falla si el sitio no responde.

TODO(CE-11): El DNS de incovsa.com no se ha pasado a Cloudflare (P-93). No hay certificado real ni registro de imagenes.incovsa.com. Si INCOVSA no puede mover el DNS, avise a Jordin y a Daniela. La decisión 32 prevé servir las imágenes desde una ruta de la aplicación. El código actual no implementa ese modo en producción. `ALMACENAMIENTO=disco` lanza `El almacenamiento local no está disponible en producción.`
