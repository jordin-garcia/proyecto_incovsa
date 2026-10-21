# Ejecución en desarrollo

Arranque la aplicación en su computadora después de instalar dependencias, escribir `.env` y aplicar las migraciones. No levante `docker compose` para este modo.

```
npm run dev
```

El script es `next dev`. Abra http://localhost:3000. `BETTER_AUTH_URL` del ejemplo ya usa esa dirección.

Para entrar con una cuenta de demostración, use un usuario `ejemplo.01` a `ejemplo.10` y la contraseña de `CLAVE_DEMO`. Esas cuentas existen solo si ya ejecutó `npm run semilla:demo`.

Para crear la cuenta de Gerencia o de Soporte que usará el equipo, siga el apartado Primer administrador con `npm run crear-admin` en esta misma terminal. Hágalo después de `npm run db:aplicar`.

Detenga el servidor con Ctrl+C. El próximo `npm run dev` vuelve a leer `.env`.

`npm test` no usa este servidor. Levanta sus propias consultas contra `DATABASE_URL_PRUEBAS`. Fuera de CI, `npm run e2e` reutiliza un servidor que ya responda en http://localhost:3000. Si no hay servidor, arranca `npm run dev`. Así está en `playwright.config.ts`.
