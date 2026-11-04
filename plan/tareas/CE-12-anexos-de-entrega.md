---
id: CE-12
titulo: Anexos I y J, evidencia de entrega e inventario de servicios y accesos
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: hecha
depende_de: [CE-07]
programada: 2026-11-03
requisitos: [RNF-10]
pantallas: []
---

# CE-12 · Anexos I y J, evidencia de entrega e inventario de servicios y accesos

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** CE-07

> **Replanificación del 02/11 (JG-32, `specs/16` decisión 90):** esta tarea ya no espera a JG-17 ni al despliegue. Documenta el sistema tal como está en `develop` y se integra a más tardar el **martes 03/11 a las 18:00**, para que Jordin arme la entrega del 04/11 (JG-30). Nada de esta versión 1.0 depende de la reunión con el Ing. William: lo que salga de ella se agrega en la versión 1.1 del 12/11.

## Objetivo
Preparar la versión 1.0 de los anexos para la entrega académica del 04/11 y la **transferencia de accesos** a INCOVSA del 12/11 (specs/16, decisión 90): el Anexo J (inventario de servicios y accesos, **sin credenciales**) y el Anexo I (evidencia de entrega).

## Contexto que debes leer
- `specs/17` (anexos I y J: las credenciales se entregan por un medio seguro y separado)
- `specs/16` §"Cuentas de los servicios" y decisión 33; `specs/19`: P-03 y P-94

## Qué hacer
1. `entregable-3/anexos/anexo-j-servicios-y-accesos.md`: cada servicio (VPS, dominio y DNS en Cloudflare, R2, GitHub y GHCR, Google Drive de INCOVSA, cuentas de administrador del sistema), quién es el dueño de la cuenta, para qué se usa, cómo se accede y quién recibe la credencial. **Ninguna contraseña, llave ni token** en el archivo. Los servicios que INCOVSA todavía no entrega (VPS, DNS, R2 y la cuenta de GitHub; P-10, P-93 y P-94) quedan como «pendiente de entrega por INCOVSA»; CE-15 los completa.
2. Procedimiento de entrega de las credenciales por un medio seguro y separado (por ejemplo, en persona o con un gestor de contraseñas), que define Jordin con INCOVSA. **Pregúntale a Jordin el medio**: no se asume. Si todavía no está acordado con INCOVSA, queda como pendiente en la versión 1.0: no se espera a la reunión del 03/11.
3. Transferencia del repositorio a la cuenta u organización de INCOVSA (decisión 33, P-94): los pasos, para hacerlos el 12/11 con el coordinador, después de quitar `docs/Reuniones/` del repositorio (CE-15).
4. `entregable-3/anexos/anexo-i-evidencia-de-entrega.md`: el formato del acta de entrega (qué se entrega, fecha, quién recibe), para firmar el 12/11.

## Archivos que creas o modificas
- `entregable-3/anexos/**` (crear)

## Criterios de aceptación
1. El Anexo J cubre todos los servicios y no contiene ningún secreto.
2. El procedimiento de entrega de credenciales y de transferencia del repositorio está listo para el 12/11.
3. El formato del Anexo I está listo para firmarse.

## Resultado

**Terminada por el coordinador** (protocolo §E4) el 03/11/2026, desde el borrador de Carlos del 21/10 (PR #97), en `jordin/CE-12-anexos-de-entrega`. Versión 1.0 de los dos anexos, para la entrega académica del 04/11.

- **`entregable-3/anexos/anexo-j-servicios-y-accesos.md`:** resumen de todos los servicios (VPS, dominio y DNS en Cloudflare, los dos buckets de R2, GitHub con el entorno `produccion`, GHCR, Google Drive de INCOVSA y la primera cuenta de administrador) con dueño, uso, acceso, quién recibe y estado, y una ficha por servicio. Odoo y el correo constan como servicios sin credencial. Lo que INCOVSA no ha dado dice «pendiente de entrega por INCOVSA» (P-03, P-08, P-10, P-92, P-93 y P-94). No tiene ningún valor: solo nombres de variables y secretos.
- **Entrega de las credenciales: en persona** (decisión de Jordin del 03/11, registrada en `specs/16` «Cuentas de los servicios» y en `specs/18`). Se entrega la copia de respaldo del `.env` del VPS y de la configuración de `rclone`: quien recibe crea su propia llave SSH en una computadora de INCOVSA, la agrega como root desde la consola del proveedor y copia los dos archivos con `scp`. No se entregan la llave SSH del despliegue (vive solo en `VPS_LLAVE_SSH`) ni la contraseña del primer administrador (la escribe esa persona).
- **Transferencia del repositorio:** 16 pasos (antes, durante y después), contrastados con la documentación de GitHub: quitar `docs/Reuniones/` (CE-15), revisar el plan del destino, comprobar el entorno `produccion`, volver a publicar la imagen en GHCR bajo el dueño nuevo, cambiar la imagen por defecto de `docker-compose.yml` o `IMAGEN_APP`, y actualizar los remotos.
- **`entregable-3/anexos/anexo-i-evidencia-de-entrega.md`:** acta de la entrega final a INCOVSA del 12/11, lista para imprimirse y firmarse: datos, quién entrega (README §15), quién recibe, casillas de lo que se entrega (sistema, repositorio, documentos con su versión, anexos, capacitación y accesos sin valores), lo que no se entrega y la conformidad.
- Cambios respecto del borrador: las fechas pasan del 04/11 al 12/11 (decisión 90); el repositorio ya no se describe como privado (hoy es público); la contraseña del administrador ya no se entrega por el medio, porque el Documento 5 dice que esa persona la escribe.

**Cómo usarlo (CE-15, versión 1.1):** cambie cada «pendiente de entrega por INCOVSA» por el dato real, sin valores secretos; anote en «Entrega de las credenciales» quién recibe (P-03) y el medio de guarda que eligió INCOVSA; agregue al inicio del Anexo I la constancia de la entrega académica del 04/11 (JG-30); y quite `docs/Reuniones/` antes de la transferencia. **JG-30:** los dos anexos van con los anexos A a J en el orden de `specs/17`.
