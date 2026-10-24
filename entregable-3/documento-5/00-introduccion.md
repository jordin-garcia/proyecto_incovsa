# Introducción {-}

Este manual explica cómo instalar, desplegar y mantener el sitio y el sistema de picking de INCOVSA. Los comandos son los del repositorio. Sígalos en el orden de los apartados si parte de un equipo nuevo.

El borrador 0.1, del 21/10/2026, sale de CE-05, CE-06 y CE-07. Con él puede dejar el sistema corriendo en una computadora de desarrollo. El despliegue en internet todavía no se puede completar.

TODO(CE-11): No hay VPS (P-10), el DNS de incovsa.com no se ha movido (P-93) y no hay cuenta de Cloudflare R2 (P-94). CE-08 está bloqueada. El primer despliegue real es JG-19, el 2 de noviembre de 2026. La restauración de producción de CE-10 no está hecha.

Los únicos nombres de sitio de este manual son `incovsa.com` e `imagenes.incovsa.com`. No hay direcciones IP, contraseñas ni llaves reales. Los valores de ejemplo salen de `.env.example` y de `.env.produccion.example`. Cámbielos en su equipo y no los suba al repositorio.

La rama por defecto del repositorio es `develop`. La imagen de producción se publica solo cuando el coordinador integra en `main`.
