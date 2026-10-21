# Almacenamiento

En desarrollo deje `ALMACENAMIENTO=disco`. La aplicación escribe WebP en `almacenamiento-local/imagenes/` y guarda en la base una ruta `/api/imagenes/` seguida del nombre. No cree un bucket para desarrollar.

En producción deje `ALMACENAMIENTO=r2`. La aplicación vuelve a codificar la imagen con `sharp`, la sube al bucket de `R2_BUCKET_IMAGENES` y guarda la dirección `URL_IMAGENES` más el nombre `.webp`. El cliente S3 usa la región `auto` y el extremo `https://` seguido de `R2_CUENTA` y de `.r2.cloudflarestorage.com`. Ese extremo está en `src/modulos/almacenamiento/servicio.ts`. No es un nombre público del sitio.

Acepta JPG, PNG y WebP, comprobados por el contenido. El máximo es 5 MB. El ancho máximo guardado es 2000 px. No acepte SVG ni GIF.

El bucket de imágenes se publica solo por `imagenes.incovsa.com`. No use la dirección `r2.dev`. El bucket de respaldos es otro, privado, y no sirve imágenes. Su nombre de ejemplo en `RCLONE_DEST` es `incovsa-respaldos`.

Cree cada credencial limitada a un solo bucket. La de la aplicación usa `R2_LLAVE` y `R2_SECRETO`. La del respaldo va en el archivo de configuración de rclone del usuario de despliegue, no en `.env`.

TODO(CE-11): No hay buckets reales hasta P-94. `incovsa-imagenes` e `incovsa-respaldos` son nombres del ejemplo. No los dé por creados. No hay identificador de cuenta, llave ni secreto.

Si una subida falla en desarrollo, lea el apartado Diagnóstico. El mensaje `La imagen debe pesar hasta 5 MB.` y el mensaje `Seleccione una imagen JPG, PNG o WebP válida.` salen de ese módulo.
