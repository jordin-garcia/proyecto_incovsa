# Base de datos

Cree dos bases en el PostgreSQL 18 de su computadora. `incovsa` es la de desarrollo. `incovsa_pruebas` es la de `npm test`. No cree estas bases dentro de Docker.

Si instaló PostgreSQL en Windows, pida la contraseña del usuario `postgres`.

```
psql -U postgres -c "CREATE DATABASE incovsa;"
psql -U postgres -c "CREATE DATABASE incovsa_pruebas;"
```

En macOS con Homebrew, el usuario es el suyo.

```
psql postgres -c "CREATE DATABASE incovsa;"
psql postgres -c "CREATE DATABASE incovsa_pruebas;"
```

Escriba ese usuario y esa contraseña en `DATABASE_URL` y en `DATABASE_URL_PRUEBAS`. Las dos URL tienen que nombrar bases distintas. Luego aplique el esquema y cargue los datos de partida.

```
npm run db:aplicar
npm run db:semilla
```

`npm run db:aplicar` ejecuta `prisma migrate deploy`. `npm run db:semilla` ejecuta `tsx prisma/seed.ts`. Al terminar, imprime `Semilla base cargada.` Puede ejecutarlo de nuevo. La semilla base no duplica filas.

Si quiere los datos de demostración del prototipo, defina `CLAVE_DEMO` y ejecute el segundo comando. No lo use en producción.

```
npm run semilla:demo
```

La línea de éxito es esta. `ejemplo.03` existe en el sitio y en el picking. No hay un usuario `ejemplo.11`.

```
Datos de demostración cargados: 11 cuentas de ejemplo (ejemplo.01 a ejemplo.10, y ejemplo.03 también en el sitio), 3 camiones y 28 productos públicos.
```

Los pedidos no salen de la semilla. Llegan en el archivo `.xlsx` que el facturador exporta de Odoo. No hay carga de catálogos.

Para borrar su base local de desarrollo y volver a crearla, ejecute el reinicio. `--force` ya va en el script. El comando usa `DATABASE_URL`, no la base de pruebas. No lo ejecute contra producción.

```
npm run db:reiniciar
```

Ese script es `prisma migrate reset --force`. Borra la base de `DATABASE_URL` y vuelve a aplicar las migraciones. Después ejecute otra vez `npm run db:semilla` y, si quiere la demostración, `npm run semilla:demo`.

En el VPS la base la crea el contenedor `postgres` con `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. El puerto 5432 no se publica hacia afuera. El volumen es `postgres-datos`, montado en `/var/lib/postgresql`. No cree `incovsa_pruebas` en el VPS.
