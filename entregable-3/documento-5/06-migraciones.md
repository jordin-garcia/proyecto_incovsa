# Migraciones

Aplique las migraciones que ya están en `prisma/migrations`. No cree migraciones nuevas si no es el coordinador.

En su computadora, con `.env` ya escrito:

```
npm run db:aplicar
```

El script es `prisma migrate deploy`. Aplica, en orden, las migraciones que faltan en la tabla `_prisma_migrations`. No genera archivos nuevos. Si el comando termina con código 0, la base quedó al día.

El mismo comando corre solo en dos momentos de producción. El `ENTRYPOINT` de la imagen, `/app/entrada.sh`, ejecuta `./node_modules/.bin/prisma migrate deploy` y después `exec node server.js`. El flujo de despliegue, cuando no es un regreso a una imagen anterior, también lo corre en un contenedor de un solo uso.

```
docker compose run --rm --no-deps --entrypoint ./node_modules/.bin/prisma app migrate deploy
```

Ejecute esa línea desde `~/incovsa`, con el `.env` de producción y con `IMAGEN_APP` apuntando a la imagen que va a arrancar. El apartado Despliegue la pone en su sitio. Hoy no hay VPS donde correrla.

Solo el coordinador crea una migración. El script no agrega banderas propias.

```
npm run db:migrar
```

Ese script es `prisma migrate dev`. Revise el SQL generado antes de subirlo. No edite una migración que ya se aplicó en otra base. Si el cambio ya salió del equipo del coordinador, haga otra migración.

Antes de aplicar migraciones en producción, respalde la base con el apartado Respaldo. El primer despliegue real todavía no ocurre.
