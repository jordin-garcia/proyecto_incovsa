---
id: CE-12
titulo: Anexos I y J, evidencia de entrega e inventario de servicios y accesos
persona: carlos
responsable: Carlos Hugo Escobar
hito: entrega
prioridad: P1
estado: pendiente
depende_de: [CE-10]
programada: 2026-11-03
requisitos: [RNF-10]
pantallas: []
---

# CE-12 · Anexos I y J, evidencia de entrega e inventario de servicios y accesos

**Responsable:** Carlos Hugo Escobar · **Hito:** entrega · **Prioridad:** P1 · **Programada:** mar 03/11 · **Depende de:** CE-10

## Objetivo
Preparar la **transferencia de accesos** a INCOVSA del 04/11 (specs/16, decisión 73): el Anexo J (inventario de servicios y accesos, **sin credenciales**) y el Anexo I (evidencia de entrega).

## Contexto que debes leer
- `specs/17` (anexos I y J: las credenciales se entregan por un medio seguro y separado)
- `specs/16` §"Cuentas de los servicios" y decisión 33; `specs/19`: P-03 y P-94

## Qué hacer
1. `entregable-3/anexos/anexo-j-servicios-y-accesos.md`: cada servicio (VPS, dominio y DNS en Cloudflare, R2, GitHub y GHCR, Google Drive de INCOVSA, cuentas de administrador del sistema), quién es el dueño de la cuenta, para qué se usa, cómo se accede y quién recibe la credencial. **Ninguna contraseña, llave ni token** en el archivo.
2. Procedimiento de entrega de las credenciales por un medio seguro y separado (por ejemplo, en persona o con un gestor de contraseñas), que define Jordin con INCOVSA. **Pregúntale a Jordin el medio**: no se asume.
3. Transferencia del repositorio a la cuenta u organización de INCOVSA (decisión 33, P-94): los pasos, para hacerlos el 04/11 con el coordinador.
4. `entregable-3/anexos/anexo-i-evidencia-de-entrega.md`: el formato del acta de entrega (qué se entrega, fecha, quién recibe), para firmar el 04/11.

## Archivos que creas o modificas
- `entregable-3/anexos/**` (crear)

## Criterios de aceptación
1. El Anexo J cubre todos los servicios y no contiene ningún secreto.
2. El procedimiento de entrega de credenciales y de transferencia del repositorio está listo para el 04/11.
3. El formato del Anexo I está listo para firmarse.
