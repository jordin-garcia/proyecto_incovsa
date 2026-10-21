# Actualización

Hay dos actualizaciones distintas. La de la aplicación en el VPS y la de las dependencias en el repositorio. No actualice producción a mano con `docker build` en el servidor.

## La aplicación en el VPS

Cada integración en `main` dispara el flujo Despliegue. Eso compila la imagen, la publica y, cuando existan los secretos, aplica las migraciones y reinicia `app`. El primer caso será JG-19, el 2 de noviembre de 2026.

Para volver atrás, use la etiqueta anterior, sin migraciones.

```
gh workflow run despliegue.yml --ref main -f etiqueta=ETIQUETA
gh run watch
```

No edite una migración ya aplicada para deshacer un cambio de esquema. Si hay que corregir la base, el coordinador agrega otra migración.

En el Ubuntu del VPS, `preparar-vps.sh` deja `unattended-upgrades` con reinicio automático desactivado. Esas actualizaciones son del sistema operativo, no de la imagen de la aplicación.

## Dependencias de Node.js

Dependabot abre pull requests hacia `develop` una vez por semana, en la zona `America/Guatemala`, para npm y para GitHub Actions. El coordinador los revisa. Esos pull requests no pasan solos las verificaciones del repositorio. No los integre si no es el coordinador.

Después de cambiar `package-lock.json`, ejecute `npm ci`. La integración continua corre `npm audit --audit-level=high` sin instalar paquetes. Puede repetirlo en su equipo.

```
npm audit --audit-level=high
```

Mantenga Next.js en 16.4.2 o posterior dentro de la línea 16, y Prisma en 7.x. No pase Prisma a la etiqueta `latest` del registro. Esa etiqueta ha apuntado a una versión preliminar de Prisma 8.

## SheetJS

`npm audit` y Dependabot no vigilan SheetJS. El paquete está en `vendor/xlsx-0.20.3.tgz` y `package.json` lo nombra `file:vendor/xlsx-0.20.3.tgz`. La versión del registro de npm no se usa.

En cada entrega, abra https://cdn.sheetjs.com/advisories y haga la revisión manual de los avisos. Si hace falta otra versión, el coordinador sustituye el archivo de `vendor/`, actualiza la ruta `file:` en `package.json` y regenera `package-lock.json` con `npm ci`. No ejecute `npm install xlsx`. No descargue el paquete desde una URL en el `package.json`. La decisión 85 lo guarda en el repositorio porque npm 12 bloquea por defecto las dependencias tomadas de una dirección web.

TODO(CE-11): Esta revisión manual no sustituye el despliegue del 2 de noviembre. La imagen nueva solo llega al VPS cuando JG-19 integre `develop` en `main` y CE-08 deje de estar bloqueada.
