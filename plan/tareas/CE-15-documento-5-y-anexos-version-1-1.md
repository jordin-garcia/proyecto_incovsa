---
id: CE-15
titulo: Versión 1.1 del Documento 5 y de los anexos I y J, con producción y transferencia
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [CE-11, CE-12]
programada: 2026-11-11
requisitos: [RNF-09, RNF-10]
pantallas: []
---

# CE-15 · Versión 1.1 del Documento 5 y de los anexos I y J, con producción y transferencia

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mié 11/11 · **Depende de:** CE-11, CE-12

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** la versión 1.0 del Documento 5 y de los anexos I y J se entregó el 04/11 sin producción. Esta tarea los completa para la entrega a INCOVSA del **12/11**, con lo que se haya acordado en la reunión con el Ing. William.

## Objetivo
Completar el Documento 5 y los anexos I y J con los datos reales de producción y de los accesos, y dejar lista la transferencia del repositorio a INCOVSA.

## Contexto que debes leer
- `## Resultado` de CE-11 y CE-12, y de CE-08, JG-19 y CE-10 si ya están hechas
- `specs/16` decisiones 32, 33, 90 y 91; `specs/19`: P-03, P-94 y P-99; P-06 ya está resuelto (`specs/03`): en el Documento 5 (apartados 4 y 12), `URL_ODOO` deja de estar «pendiente», sin escribir la dirección

## Qué hacer
1. **Documento 5:** si CE-10 ya está hecha, reemplazar lo que la versión 1.0 dejó para completarse al desplegar (IP, dominio, certificado, R2, verificación de producción) con los datos y la evidencia reales de CE-08 y CE-10, sin credenciales. Si no hay producción, esos datos siguen como pendientes del despliegue en el VPS de Hostinger. Subir la versión del documento y su tabla de control de versiones.
2. **Anexo J:** cambiar cada «pendiente de entrega por INCOVSA» por el dato real que ya se tenga, y agregar el medio de entrega de las credenciales acordado con INCOVSA.
3. **Anexo I:** agregar la constancia de la entrega académica del 04/11 (JG-30) y dejar listo el acta de entrega a INCOVSA del 12/11.
4. **Quitar `docs/Reuniones/` del repositorio** antes de la transferencia (decisión de Jordin del 02/11, JG-32) y volver a ignorar `docs/` en `.gitignore`. Esa carpeta tiene fotos y capturas de las reuniones: sale de la versión actual, pero sigue en el historial de git, como aceptó Jordin.
5. Dejar los pasos de la transferencia del repositorio a la cuenta u organización de INCOVSA (decisión 33, P-94), para que Jordin los haga el 12/11.
6. **Cambios futuros que decide INCOVSA (decisión 91, P-99).** En el Documento 5, los pasos para: (a) **cambiarse a otro VPS**: preparar el servidor nuevo como en CE-08, restaurar el último respaldo, copiar el `.env` y la configuración de `rclone`, cambiar los secretos `VPS_*` y la variable de la dirección del `environment: produccion` de GitHub (CE-08) y comprobarlo con CE-10; (b) **publicar el sistema en incovsa.com**: los registros DNS que apuntan al VPS sin tocar los del correo de Microsoft 365, y los cambios de `DOMINIO` y `BETTER_AUTH_URL`; (c) **pasar las imágenes de `r2.dev` a un dominio propio** en Cloudflare (requiere que el DNS del dominio esté en Cloudflare), cambiar `URL_IMAGENES` y actualizar las direcciones de las imágenes guardadas en la base de datos. Los datos reales de producción del paso 1 (de CE-08 y CE-10) llevan el nombre de Hostinger, no `incovsa.com`. **(06/11, CE-08)** El sistema está en `incovsa.tech` y las imágenes en `imagenes.incovsa.tech`, con el DNS en Cloudflare; el caso (c) ya está hecho, y en (b) también cambian `URL_IMAGENES` y las direcciones guardadas si las imágenes pasan a `imagenes.incovsa.com`.
7. **Anexo J:** las cuentas de Hostinger, Cloudflare y Google Drive y el correo de soporte con el que se crearon (sin escribir la dirección del correo), y cómo se le entregan a INCOVSA el 12/11. Incluye el dominio `incovsa.tech`, registrado en la cuenta de Hostinger hasta el 07/11/2027.
8. **Lo que cambió CE-08 en el Documento 5** (ver su `## Resultado`): la dirección `incovsa.tech` y el CNAME en «DNS only» (apartado Dominio y HTTPS); `imagenes.incovsa.tech` y `r2.dev` desactivado (Almacenamiento); Node 24 y rclone oficial en `~/.local/bin`, con la línea `PATH=` del `cron` (Respaldo); y que el primer despliegue ya arranca Caddy solo, sin los pasos a mano de «El primer despliegue» ni la nota del apartado Diagnóstico.

## Archivos que creas o modificas
- `entregable-3/documento-5/**`, `entregable-3/anexos/anexo-i-evidencia-de-entrega.md`, `entregable-3/anexos/anexo-j-servicios-y-accesos.md`
- `docs/Reuniones/**` (quitar), `.gitignore`

## Criterios de aceptación
1. Si CE-10 está hecha, el Documento 5 ya no tiene datos «para completarse al desplegar»; en todo caso, no contiene secretos.
2. El Anexo J cubre todos los servicios con sus datos reales y ningún secreto.
3. El Documento 5 tiene los tres procedimientos del paso 6 (otro VPS, incovsa.com e imágenes en un dominio propio).
4. `docs/Reuniones/` ya no está en `develop` y `docs/` vuelve a estar en `.gitignore`.
5. Los pasos de la transferencia del repositorio están listos para el 12/11.

## Verificación
```
python entregable-2/herramientas/armar_documento.py entregable-3/documento-5
git ls-files docs
```
El segundo comando no debe mostrar nada.

## Fuera de alcance
- La transferencia misma, que hace Jordin el 12/11.

## Notas
- No depende de CE-10 a propósito: si el VPS de Hostinger no está desplegado antes del 11/11, esta tarea igual quita `docs/Reuniones/` y prepara el acta del 12/11; los datos de producción siguen como pendientes y se explica en la presentación (JG-31).
