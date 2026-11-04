# Obtención del código

Clone el repositorio con GitHub CLI. La rama por defecto es `develop`. El comando lo deja en esa rama.

```
gh repo clone jordin-garcia/proyecto_incovsa
cd proyecto_incovsa
```

Compruebe el equipo desde la raíz del repositorio. El script no instala nada. Si falta una herramienta obligatoria, termina con código 1 y escribe qué instalar. Si todo está, la última línea es `El equipo tiene todo lo necesario.`

```
node scripts/verificar-entorno.mjs
```

No descargue un ZIP para trabajar. El archivo de bloqueo y los ganchos de Git forman parte del clon.

En producción, el VPS no compila el código: descarga la imagen de GHCR. Aun así, el usuario de despliegue clona el repositorio en `~/incovsa`, porque de ahí salen `docker-compose.yml`, `Caddyfile`, `.env.produccion.example` y los scripts de respaldo y restauración (`scripts/respaldo.sh`, `scripts/restaurar.sh` y `scripts/lib-respaldo.mjs`), que la imagen no trae. El apartado Despliegue dice cómo hacerlo.

> **Pendiente de producción (versión 1.1).** El nombre del repositorio cambia cuando se transfiera a la cuenta u organización de GitHub de INCOVSA (P-94 y decisión 33 de la especificación). Use entonces el nombre nuevo en `gh repo clone`.
