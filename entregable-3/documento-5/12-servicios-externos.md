# Servicios externos

La aplicación no guarda credenciales de estos servicios en el repositorio. No hay cuenta de correo. Las solicitudes de contacto se guardan en la base, y Gerencia o Soporte restablecen las contraseñas.

## Archivo de Odoo

No hay API de Odoo. El facturador exporta un `.xlsx` y lo carga en Facturación. El servidor lo lee con SheetJS 0.20.3. Rechaza un archivo de más de 2 MB o que no sea un libro `.xlsx` de verdad.

`URL_ODOO` solo abre un enlace en el acceso personal. Déjela vacía. INCOVSA no ha definido esa dirección. El dato sigue en P-06.

## Enlaces de Google Drive

Los PDF técnicos están en el Drive de la empresa. La base guarda el enlace, no el archivo. Al cargar un documento interno, acepte solo direcciones `https` de `drive.google.com` o de `docs.google.com`. El sistema arma la vista previa y la descarga con el identificador de ese enlace. No pegue otra dirección.

Este repositorio no tiene un comando para copiar el Drive. El respaldo de esos archivos lo hace la cuenta de Google de INCOVSA.

## Cloudflare

Hacen falta dos usos, los dos en el plan gratuito previsto por la especificación.

- DNS de `incovsa.com`, para poder conectar `imagenes.incovsa.com` al bucket de imágenes.
- R2, con el bucket de imágenes y el bucket privado de respaldos.

La cuenta se crea a nombre de INCOVSA, con un correo de la empresa, y se invita al equipo. El apartado Almacenamiento dice qué variables reciben esos datos.

TODO(CE-11): No hay cuenta de Cloudflare (P-94) ni cambio de DNS (P-93). No escriba tokens, identificadores de zona ni llaves en este manual ni en el repositorio.

GitHub es el otro servicio externo. El repositorio, Actions y GHCR ya se usan en los apartados Obtención del código y Despliegue. El token de un `docker login` no se documenta aquí.
