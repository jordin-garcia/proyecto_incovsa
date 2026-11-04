# Introducción {-}

Este manual explica cómo instalar, desplegar y mantener el sitio web institucional y el sistema de control logístico de bodega (picking) de INCOVSA, para que un tercero pueda volver a poner el sistema en funcionamiento. Los comandos son los del repositorio, tal como está en la rama `develop` el 03/11/2026. Si parte de un equipo nuevo, siga los apartados en orden.

Con este manual puede dejar el sistema funcionando en una computadora de desarrollo, construir la imagen de producción y probarla con Docker Compose en un equipo local. El despliegue en el servidor de INCOVSA se describe completo, como procedimiento. Algunos datos solo existen cuando INCOVSA entrega los accesos: la dirección del servidor, el DNS de `incovsa.com`, los buckets de Cloudflare R2 y las cuentas de los servicios (P-10, P-93 y P-94 de la especificación). Esos datos aparecen marcados como **Pendiente de producción** y se completan en la versión 1.1 de este manual, después del primer despliegue.

Los únicos nombres de sitio de este manual son `incovsa.com` e `imagenes.incovsa.com`. No hay direcciones IP, contraseñas ni llaves reales. Los valores de ejemplo salen de `.env.example` y de `.env.produccion.example`. Cámbielos en su equipo y no los suba al repositorio.

La rama por defecto del repositorio es `develop`. La rama `main` queda solo para las versiones y el despliegue: cada integración en `main` publica la imagen de producción y la despliega en el servidor.
