# Actualización del sistema

Actualice la aplicación del servidor solo a través de GitHub. No compile ni cambie el código a mano en el VPS: el servidor no ejecuta `docker build`.

## Publicar una versión nueva

Los cambios entran a `develop` por *pull request*. Cuando el coordinador integra `develop` en `main`, el flujo Despliegue compila la imagen, la publica en GHCR y, si existen los secretos del entorno `produccion`, aplica las migraciones y reinicia `app` en el VPS. El apartado Despliegue describe cada paso. No hace falta entrar al servidor.

Antes de integrar en `main` una versión que cambia el esquema de la base, haga un respaldo manual con el apartado Respaldo.

Siga el flujo hasta que termine:

```
gh run list --workflow despliegue.yml --branch main --limit 1
gh run watch
```

La última acción del flujo comprueba que `https://incovsa.com/` responda. Si el flujo termina en rojo, lea el apartado Diagnóstico de errores comunes.

> **Pendiente de producción (versión 1.1).** El primer despliegue todavía no ocurre: depende de que INCOVSA entregue el VPS, el DNS y las cuentas (P-10, P-93 y P-94) y de la tarea JG-19.

## Volver a una versión anterior

Si la versión nueva falla, vuelva a la imagen anterior con su etiqueta, sin aplicar migraciones.

```
gh workflow run despliegue.yml --ref main -f etiqueta=ETIQUETA
gh run watch
```

Sustituya `ETIQUETA` por el SHA de un *commit* de `main` cuya imagen siga en GHCR. El flujo conserva como máximo 5 imágenes.

No edite una migración ya aplicada para deshacer un cambio de esquema. Si hay que corregir la base, el coordinador agrega otra migración.

## El sistema operativo del VPS

`preparar-vps.sh` deja activadas las actualizaciones automáticas de seguridad de Ubuntu (`unattended-upgrades`), sin reinicio automático. Esas actualizaciones son del sistema operativo, no de la aplicación. Si el servidor pide reiniciar, hágalo fuera del horario de bodega. Los tres servicios vuelven solos, porque usan `restart: unless-stopped`.
