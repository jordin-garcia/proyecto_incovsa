# Configuración de servicios externos

La aplicación no guarda credenciales de estos servicios en el repositorio. No hay cuenta de correo. Las solicitudes de contacto se guardan en la base, y Gerencia o Soporte restablecen las contraseñas.

## Archivo de Odoo

No hay API de Odoo. El facturador exporta un `.xlsx` y lo carga en Facturación. El servidor lo lee con SheetJS 0.20.3 y rechaza:

- un archivo de más de 2 MB: «El archivo pesa más de 2 MB. No se cargó.»;
- un archivo que no es un libro `.xlsx` de verdad: «El archivo debe ser .xlsx, exportado de Odoo.»;
- un libro que no se puede leer, o cuyo contenido comprimido tiene más de 100 partes o pasa de 50 MB al descomprimirse: «No se pudo leer el archivo. Verifique que sea el .xlsx exportado de Odoo.».

Esos límites protegen al servidor de archivos comprimidos maliciosos. Un archivo normal exportado de Odoo no se acerca a ellos.

`URL_ODOO` solo muestra un enlace a Odoo en el acceso personal. Déjela vacía mientras INCOVSA no defina esa dirección (P-06).

## Enlaces de Google Drive

Los PDF técnicos están en el Drive de la empresa. La base guarda el enlace, no el archivo. Al cargar un documento interno, acepte solo direcciones `https` de `drive.google.com` o de `docs.google.com`. El sistema arma la vista previa y la descarga con el identificador de ese enlace. Con otra dirección, el panel muestra «El enlace debe ser de Google Drive (https://drive.google.com/…).»

Este repositorio no tiene un comando para copiar el Drive. El respaldo de esos archivos lo hace la cuenta de Google de INCOVSA.

## Cloudflare

Hacen falta dos usos, los dos en el plan gratuito previsto por la especificación.

- DNS de `incovsa.com`, para poder conectar `imagenes.incovsa.com` al bucket de imágenes.
- R2, con el bucket de imágenes y el bucket privado de respaldos.

La cuenta se crea a nombre de INCOVSA, con un correo de la empresa, y se invita al equipo. El apartado Almacenamiento dice qué variables reciben esos datos.

> **Pendiente de producción (versión 1.1).** No hay cuenta de Cloudflare (P-94) ni cambio de DNS (P-93). No escriba tokens, identificadores de zona ni llaves en este manual ni en el repositorio.

GitHub es el otro servicio externo. El repositorio, Actions y GHCR ya se usan en los apartados Obtención del código y Despliegue. El token de un `docker login` no se documenta aquí.
