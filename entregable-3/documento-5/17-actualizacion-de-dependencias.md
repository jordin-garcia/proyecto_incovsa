# Actualización de dependencias

Las dependencias de Node.js están fijadas en `package-lock.json`. Se actualizan en el repositorio, nunca en el servidor.

## Dependabot y npm audit

Dependabot abre *pull requests* hacia `develop` una vez por semana, en la zona `America/Guatemala`, para npm y para GitHub Actions. Las versiones menores y los parches llegan juntos en un solo *pull request* por ecosistema, y cada versión mayor en el suyo. Se ignoran las versiones mayores de `typescript` y de `@types/node`.

Esos *pull requests* no se integran solos: siempre fallan las verificaciones del título, de los archivos protegidos y del bot de revisión, porque los abre `dependabot[bot]`. El coordinador los revisa, comprueba que pasen las demás verificaciones (pruebas, compilación y seguridad) y los integra él mismo. Toda dependencia nueva o actualizada es una decisión suya. Los parches de seguridad de Next.js, Better Auth y Prisma se aplican en cuanto salen (RNF-16).

Después de que cambie `package-lock.json`, ejecute en su equipo:

```
npm ci
npm run verificar
npm run build
```

La integración continua corre `npm audit --audit-level=high` en cada *pull request*. Puede repetirlo en su equipo:

```
npm audit --audit-level=high
```

El flujo Seguridad (`seguridad.yml`) revisa además la cadena de suministro con OSV-Scanner y `scripts/cadena-suministro.mjs`, busca secretos con gitleaks, analiza el código con Semgrep y revisa los flujos con actionlint.

Las excepciones de OSV-Scanner están en `osv-scanner.toml`, cada una con su fecha de vencimiento (`ignoreUntil`) y su razón. Al vencer, la verificación vuelve a fallar hasta que se actualice el paquete o el coordinador renueve la excepción con su justificación. La única excepción vigente, GHSA-g3hv-75wg-m249 (minimatch, solo en herramientas de desarrollo), vence el 15/11/2026.

Mantenga Next.js en la línea 16, en 16.4.2 o posterior, y Prisma en la línea 7. No pase Prisma a la etiqueta `latest` del registro de npm: esa etiqueta ha apuntado a una versión preliminar de Prisma 8.

## SheetJS

`npm audit` y Dependabot no vigilan SheetJS. El paquete está en `vendor/xlsx-0.20.3.tgz` y `package.json` lo nombra `file:vendor/xlsx-0.20.3.tgz`. La versión del registro de npm no se usa.

En cada entrega, abra https://cdn.sheetjs.com/advisories y revise a mano los avisos de seguridad. Si hace falta otra versión, el coordinador sustituye el archivo de `vendor/`, actualiza la ruta `file:` en `package.json`, regenera `package-lock.json` con `npm install` y actualiza `VENDOR` y `HUELLA_XLSX` en `scripts/cadena-suministro.mjs` con la ruta y la huella nuevas; si no, falla la verificación de la cadena de suministro. Los demás integrantes solo ejecutan `npm ci`. No ejecute `npm install xlsx`. No descargue el paquete desde una dirección web en `package.json`: el repositorio lo guarda en `vendor/` porque npm 12 bloquea por defecto las dependencias tomadas de una dirección web (decisión 85 de la especificación).

## Imágenes de Docker

`docker-compose.yml` usa `caddy:2` y `postgres:18`. Esas etiquetas reciben las correcciones de su línea. Para descargarlas en el VPS:

```
cd "$HOME/incovsa"
docker compose pull caddy postgres
docker compose up -d caddy postgres
```

No cambie `postgres:18` por otra versión principal sin un respaldo y una restauración de prueba: una versión principal nueva de PostgreSQL no lee los datos de la anterior sin migrarlos.

> **Pendiente de producción (versión 1.1).** Estos comandos del VPS se ejecutan cuando el servidor exista (P-10).
