# Primer administrador

Cree la primera cuenta de Gerencia o de Soporte con el comando del repositorio. No pase la contraseña como argumento. No la escriba en un archivo. La semilla de demostración no crea esta cuenta.

En desarrollo, desde la raíz, con la base ya migrada y con `.env` cargado por el propio script:

```
npm run crear-admin
```

El script es `tsx scripts/crear-admin.ts`. Exige una terminal interactiva. Si no hay TTY, termina con `Ejecute crear-admin en una terminal interactiva.`

Escriba las respuestas en este orden. Las dos contraseñas no se muestran y no quedan en el historial de la terminal.

```
Nombre completo:
Nombre de usuario:
Rol (Gerencia o Soporte):
Contraseña (mínimo 8 caracteres):
Repita la contraseña:
```

El rol tiene que ser exactamente `Gerencia` o `Soporte`. El nombre admite de 1 a 150 caracteres. El usuario admite de 1 a 60 y se guarda en minúsculas. La contraseña admite de 8 a 128 caracteres y tiene que coincidir las dos veces. La cuenta queda en el sistema `ambos`, así que entra al sitio y al picking.

Si todo sale bien, la última línea es `Cuenta administradora creada para los dos sistemas.`

Si los datos no sirven, el usuario ya existe o la base no responde, el comando imprime solo esto y termina con código 1. No imprime la contraseña ni el error interno.

```
No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.
```

En el VPS, ejecute el mismo comando dentro del contenedor `app`, desde `~/incovsa`. No agregue `-T`. Sin TTY el script se niega. El flujo `produccion-imagen` usa esta forma.

```
docker compose exec app npm run crear-admin
```

Hágalo después de que las migraciones hayan corrido. El contenedor ya tiene `NODE_ENV=production`. No ejecute `npm run semilla:demo` ahí.

INCOVSA todavía no ha dicho quién es esa persona. El dato es P-08. Pregunte a Jordin antes del 2 de noviembre de 2026. No invente un usuario de la empresa.
