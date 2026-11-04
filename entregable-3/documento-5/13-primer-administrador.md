# Creación del primer administrador

Cree la primera cuenta de Gerencia o de Soporte con el comando del repositorio. No pase la contraseña como argumento ni la escriba en un archivo. La semilla de demostración no crea esta cuenta. Las demás cuentas las crea después ese administrador desde Configuración, en el picking, o desde Usuarios, en el panel del sitio.

En desarrollo, desde la raíz, con la base ya migrada y la semilla base cargada. El script lee `.env` por su cuenta:

```
npm run crear-admin
```

El script es `tsx scripts/crear-admin.ts` y exige una terminal interactiva. Escriba las respuestas en este orden. Las dos contraseñas no se muestran y no quedan en el historial de la terminal.

```
Nombre completo:
Nombre de usuario:
Rol (Gerencia o Soporte):
Contraseña (mínimo 8 caracteres):
Repita la contraseña:
```

El rol puede escribirse con mayúsculas o minúsculas y con o sin acentos; se guarda como `Gerencia` o `Soporte`. El nombre admite de 1 a 150 caracteres. El usuario admite de 1 a 60 y se guarda en minúsculas. La contraseña admite de 8 a 128 caracteres y tiene que coincidir las dos veces. La cuenta queda en los dos sistemas, así que entra al sitio y al picking.

Si todo sale bien, la última línea es `Cuenta administradora creada para los dos sistemas.`

Si un dato no sirve, el comando imprime el motivo y termina con código 1, sin mostrar la contraseña:

Tabla: Mensajes de crear-admin {#tab:crear-admin}

| Mensaje | Causa |
|---|---|
| `Nombre y usuario son obligatorios.` | El nombre o el usuario quedaron vacíos |
| `El nombre admite hasta 150 caracteres.` | Nombre demasiado largo |
| `El nombre de usuario admite hasta 60 caracteres.` | Usuario demasiado largo |
| `El rol debe ser Gerencia o Soporte.` | Otro rol |
| `La contraseña debe tener al menos 8 caracteres.` | Contraseña corta |
| `La contraseña admite hasta 128 caracteres.` | Contraseña demasiado larga |
| `Las dos contraseñas no coinciden.` | La confirmación es distinta |
| `El nombre de usuario ya está reservado.` | Ya existe ese usuario en cualquiera de los dos sistemas, sin importar las mayúsculas |
| `No se pudo crear la cuenta. Revise los datos, la conexión y que el usuario no exista.` | La base no responde, otro error interno, o el comando se ejecutó sin una terminal interactiva |

En el VPS, ejecute el mismo comando dentro del contenedor `app`, desde `~/incovsa`, después de las migraciones y de la semilla base (apartado Despliegue, «El primer despliegue»). No agregue `-T`: sin terminal interactiva el script no pregunta nada y termina con el mensaje general.

```
docker compose exec app npm run crear-admin
```

El contenedor ya tiene `NODE_ENV=production`. La semilla de demostración no existe en la imagen de producción.

> **Pendiente de producción (versión 1.1).** INCOVSA todavía no ha dicho quién será el administrador inicial (P-08). Cree la cuenta en el VPS con esa persona presente, para que ella misma escriba su contraseña. No invente un usuario de la empresa.
