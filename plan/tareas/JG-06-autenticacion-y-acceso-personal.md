---
id: JG-06
titulo: Autenticación, acceso personal, sesiones y bitácora
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
depende_de: [JG-03, JG-05]
programada: 2026-10-17
requisitos: [RF-SW-09, RF-SW-11, RF-SW-30, RF-SL-01, RF-SL-02, RF-SL-36, RN-18, RN-39, RN-47, RN-54, RNF-03, RNF-15, CU-11]
pantallas: [sitio.js › acceso, login, marcaAcceso, destinoInicial]
---

# JG-06 · Autenticación, acceso personal, sesiones y bitácora

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-03, JG-05

## Objetivo
Implementar el inicio de sesión de los dos sistemas con Better Auth (una configuración y una cookie por sistema), el **acceso personal** en tres pasos, el cierre de sesión, la expiración y el cierre forzado de sesiones, el límite de intentos, la **bitácora** y el comando `crear-admin`.

## Contexto que debes leer
- `specs/03-roles-y-accesos.md` §"Acceso personal", §"Seguridad del paso del usuario", §"Cuentas", §"Recuperación de contraseña", §"Sesiones" y §"Bitácora"
- `specs/12-reglas-de-negocio.md`: RN-18, RN-39 (y la sección "Bitácora"), RN-47 y RN-54
- `specs/16`: "Autenticación y sesiones" y decisiones 5, 9, 22 a 26, 29, 35 a 37
- `specs/05-sitio-web.md` §"Textos que se reemplazan" (textos de las pantallas de acceso) y `specs/20` (CAM-46 a CAM-48 y CAM-83)
- `entregable-2/documento-2/05-seguridad.md` §"Autenticación"
- Prototipo: `sitio.js` › `acceso()`, `login()`, `marcaAcceso()` y `destinoInicial()`; `base.js` › `cuentaEn()`, `iniciarSesion()` y `bit()`; pantallas `#/acceso` y `#/acceso/sitio` / `#/acceso/picking`
- `## Resultado` de JG-03 y JG-05
- Context7: Better Auth 1.7 (adaptador de Prisma, plugin `username`, `advanced.cookiePrefix`, `session.expiresIn` y `updateAge`, `modelName` y `fields`, funciones de cifrado de contraseñas) y Next.js 16 (acciones del servidor, `cookies()`, `headers()`, `redirect`)

## Qué hacer
1. **Dos configuraciones de Better Auth** (`src/lib/auth-sitio.ts` y `src/lib/auth-picking.ts`; decisión 35), sobre las mismas tablas (`usuario`, `cuenta`, `sesion`, `verificacion`), con:
   - plugin `username`; la **clave de acceso interna** `<sistema>.<usuario>` (`sitio.`, `picking.` o `ambos.`) y el correo interno derivado (decisión 26);
   - prefijo de cookie distinto por sistema; cookies `HttpOnly`, `Secure` (fuera de desarrollo) y `SameSite=Lax`;
   - expiración de **`SESION_DIAS` días** (7 por omisión), renovada una vez al día con el uso (decisión 36);
   - cada configuración solo acepta las cuentas activas, no eliminadas, de su sistema o del sistema `ambos`.
2. `src/lib/sesion.ts`: `obtenerSesion("sitio" | "picking")` (usuario, rol, permisos y sedes leídos de la base de datos, nunca del navegador) y `revocarSesiones(usuarioId)` (borra todas sus sesiones; la usa CE-03 al eliminar, desactivar o restablecer la contraseña, decisión 36).
3. **Acceso personal** (`src/app/acceso/`), con el diseño de `sitio.js` › `acceso()` y `login()`:
   - **Paso 1, usuario:** una acción del servidor responde solo en qué sistemas tiene cuenta activa el nombre escrito (decisión 23). Si no existe en ninguno: el mensaje del prototipo de que no tiene permisos para acceder, registro en la bitácora ("Intento de acceso fallido", con el nombre escrito y la IP) y cuenta en el límite por IP.
   - **Paso 2, sistema:** Odoo (abre `URL_ODOO` en otra pestaña; si la variable está vacía, P-06, muestra la ventana informativa del prototipo sin la nota de pendiente), Administración del sitio y Sistema de picking, habilitadas solo si hay cuenta en ese sistema.
   - **Paso 3, contraseña:** pantalla de inicio de sesión del sistema elegido, con el texto de "¿Olvidó su contraseña?" de `specs/05` ("Pídale a Gerencia o a Soporte que la restablezcan."). Error de credenciales: solo "Usuario o contraseña incorrectos".
   - El panel izquierdo de las tres pantallas muestra solo el título y su descripción, centrados (CAM-83). El logotipo es un enlace al inicio del sitio.
   - Al entrar, destino como `destinoInicial()`: en el sitio, la primera sección del panel que permiten sus permisos; en el picking, el primer módulo permitido.
4. **Cerrar sesión** cierra solo la sesión de ese sistema y lleva al inicio del sitio (RF-SW-30, decisión 25). No se registra en la bitácora (RN-39).
5. **Límite de intentos (RNF-15, specs/16):** 5 intentos fallidos seguidos del mismo usuario lo bloquean 15 minutos; 20 intentos fallidos desde la misma IP en 15 minutos la bloquean 15 minutos; un inicio correcto reinicia el conteo del usuario. Se cuentan en la base, a partir de la bitácora. Los bloqueos se registran.
6. **IP del usuario:** `src/lib/ip.ts` › `obtenerIp()` lee **solo** la cabecera `X-Real-IP` que pone Caddy en producción (decisión 29; CE-05 la configura); en desarrollo, si no existe, usa `127.0.0.1`.
7. **Bitácora** (`src/modulos/bitacora/`): `registrarBitacora(tx, { sistema, operacion, entidad, registroId, detalle, usuarioId, usuarioEscrito, ip })`, que siempre se llama dentro de la transacción de la operación (decisión 5), y `consultarBitacora({ desde, hasta })` ordenada de la más reciente a la más antigua (la usa JC-06). Registra los inicios de sesión ("Inicio de sesión"), los intentos fallidos ("Intento fallido de inicio de sesión") y los bloqueos.
8. **`npm run crear-admin`** (`scripts/crear-admin.ts`, decisión 37): pide en la terminal el nombre completo, el nombre de usuario, el rol (Gerencia o Soporte) y la contraseña dos veces (mínimo 8 caracteres); crea la cuenta con el sistema `ambos`. Nunca recibe la contraseña como argumento ni la escribe en ningún archivo. Quién es el administrador inicial sigue pendiente (P-08).

## Archivos que creas o modificas
- `src/lib/auth-sitio.ts`, `src/lib/auth-picking.ts`, `src/lib/sesion.ts`, `src/lib/ip.ts` (crear)
- `src/app/api/auth/**` (las rutas de Better Auth de cada sistema) (crear)
- `src/app/acceso/**` (crear)
- `src/modulos/bitacora/**` (crear)
- `scripts/crear-admin.ts` y el script `crear-admin` de `package.json` (crear)
- `pruebas-e2e/acceso/**` (crear)

## Criterios de aceptación
1. **RF-SW-09 / CU-11:** con las cuentas de la semilla de demostración, `ejemplo.03` ve habilitados los dos sistemas; `ejemplo.08` solo la administración del sitio; `ejemplo.05` solo el picking; un nombre inexistente ve el mensaje de que no tiene permisos y no avanza.
2. **RN-54 / decisión 35:** `ejemplo.03` puede tener abiertas al mismo tiempo, en el mismo navegador, la sesión del sitio y la del picking, cada una con su contraseña; cerrar una no cierra la otra.
3. **RN-18:** las cuentas `ejemplo.01` (Gerencia) y `ejemplo.02` (Soporte), del sistema `ambos`, entran a los dos sistemas, cada uno con su propio inicio de sesión.
4. **RF-SW-30:** al cerrar sesión, el navegador queda en `/`.
5. **RNF-15:** la quinta contraseña incorrecta seguida bloquea al usuario 15 minutos aunque la sexta sea correcta; 20 fallos desde la misma IP la bloquean; un inicio correcto reinicia el conteo. El mensaje nunca dice si falló el usuario o la contraseña.
6. **RN-39:** la bitácora registra los inicios de sesión, los intentos fallidos con el nombre escrito y la IP, las consultas de usuarios inexistentes y los bloqueos; no registra los cierres de sesión.
7. **Decisión 36:** después de `revocarSesiones(id)`, la sesión de ese usuario deja de ser válida en la siguiente petición. Un usuario eliminado (con `eliminado_en`) no puede iniciar sesión.
8. **RNF-03:** las contraseñas quedan cifradas con scrypt; ninguna aparece en la base, en los registros ni en las respuestas.
9. `npm run crear-admin` crea una cuenta `ambos` que entra a los dos sistemas, y rechaza una contraseña de menos de 8 caracteres o dos contraseñas distintas.
10. Las tres pantallas de acceso coinciden con el prototipo en 390, 768 y 1440 px (capturas en el PR).

## Pruebas obligatorias
- Integración de las acciones del acceso personal, del inicio de sesión y del límite de intentos (criterios 1, 3, 5 a 9)
- `pruebas-e2e/acceso/acceso-personal.spec.ts` (criterios 1, 2, 4 y 10, con axe)

## Verificación
```
npm run db:reiniciar && npm run db:semilla && npm run semilla:demo
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/acceso
```

## Fuera de alcance
- `exigirPermiso`, las sedes y la conexión del armazón con la sesión (JG-07).
- La administración de usuarios (CE-03 y CE-04).
- El tiempo de expiración definitivo (P-07) y el usuario administrador real (P-08).

## Notas
- En el `## Resultado`, explica cómo obtener la sesión en una acción y en una página, cómo llamar a `registrarBitacora` dentro de una transacción y cómo usar `revocarSesiones`.

## Resultado

Implementación verificada en la rama `jordin/JG-06-autenticacion-acceso-personal`, con el reinicio de la base desechable autorizado expresamente por Jordin y ejecutado correctamente junto con las dos semillas.

### Implementación

- Better Auth con una configuración, clave de firma, prefijo de cookie y ruta por sistema; las tablas existentes se comparten. No se agregaron dependencias ni migraciones. Las cuentas inactivas, eliminadas o del otro sistema no pueden iniciar sesión.
- Acceso personal en tres pasos, con los textos y recursos aprobados, ventanas de Odoo y recuperación interna, mostrar contraseña y destinos según permisos. La cookie breve del paso de usuario solo conserva la selección: no autentica ni concede permisos.
- Sesiones en la base, sin caché de cookie ni permisos. La lectura vuelve a consultar cuentas, permisos y sedes; Gerencia y Soporte reciben el catálogo y todas las sedes. `SESION_DIAS` configura la expiración y Better Auth renueva una vez al día.
- Los fallos, inicios y bloqueos quedan en la bitácora. Los bloqueos transaccionales de PostgreSQL serializan intentos por IP y usuario incluso entre procesos. Sesión y bitácora usan el mismo cliente de la transacción. La API solo expone inicio por usuario, consulta mínima de sesión y cierre, y verifica el origen de los POST.
- `npm run crear-admin` pide los datos en una terminal interactiva, sin eco ni historial de las contraseñas, y crea una cuenta `ambos` con scrypt. La validación rechaza claves cortas o distintas y nombres reservados.

### Uso para las siguientes tareas

- **Página o acción:** `const sesion = await obtenerSesion("picking")`, de `@/lib/sesion`. Devuelve `null` o `{ sistema, usuario: { id, nombre, usuario, rol }, permisos: string[], sedes: { id, nombre, prefijoOdoo }[] }`. Una página lee la sesión sin renovar su cookie: los componentes del servidor no pueden escribir cookies.
- **Renovación:** las rutas pueden usar `leerSesion("picking", request.headers)` y reenviar cada `cabeceras.getSetCookie()` a la respuesta. `/api/auth/picking/get-session` ya lo hace y devuelve solo la sesión mínima. JG-07 debe usar este patrón en su primera barrera o integración del armazón para conservar la renovación durante el uso continuado. Las acciones que necesiten renovar pueden llamar `leerSesion` y después `aplicarCookiesAuth(cabeceras)`.
- **Cierre:** `await salir("sitio")`, de `@/app/acceso/acciones`, borra solo la sesión del sistema y redirige a `/`. El botón del armazón de ejemplo ya llama esta acción; el resto de la conexión del armazón corresponde a JG-07.
- **Revocación:** dentro de la transacción de CE-03, `await revocarSesiones(usuarioId, tx)` elimina todas las sesiones del usuario junto con el cambio de cuenta. Sin segundo parámetro, ejecuta una revocación independiente. Es una función interna: la operación llamadora debe autorizarse primero.
- **Bitácora:** dentro de `prisma.$transaction(async tx => { … })`, llamar `await registrarBitacora(tx, { sistema: "picking", operacion: "…", entidad: "…", registroId, detalle: { … }, usuarioId: sesion.usuario.id })`. No pasar contraseñas ni tokens al detalle. Para Reportes: `await consultarBitacora({ desde, hasta })` exige una sesión del picking con `pk.reportes` o acceso total y ordena por fecha e ID descendentes. JG-07 sustituirá su control local `exigirConsultaBitacora` por el control central `exigirPermiso`.
- **Configuración:** usar las variables de `.env.example`. Producción exige claves de firma distintas de al menos 32 caracteres. En desarrollo, si faltan, se generan claves efímeras separadas conservadas durante las recargas; reiniciar el proceso invalida esas sesiones. Los secretos nunca se registran.

### Correcciones y límites de alcance

- `logging.serverFunctions: false` en `next.config.ts`: Next.js 16 registra por omisión los argumentos de las acciones en desarrollo, incluidas contraseñas. Las acciones de autenticación también sanitizan los errores antes de registrarlos.
- Se fijó `options: "-c timezone=UTC"` en el cliente PostgreSQL: el servidor nativo de Windows puede tener `America/Guatemala` por omisión y el adaptador de Prisma reemplaza el desplazamiento de `timestamptz` sin convertir la hora. La prueba existente RN-57 detectó seis horas de diferencia; una prueba nueva exige UTC y comprueba la hora real. La presentación sigue usando `@/lib/fechas`.
- El texto secundario del acceso usa `--g600` sobre `--g50` por RNF-08, igual que la precisión del design system de JG-05. Los colores laterales y el radio de icono agregados al tema son los valores originales del prototipo.
- Los módulos de destino todavía pertenecen a sus tareas: las pruebas verifican las redirecciones a `/panel/documentos` y `/picking/facturacion`; esas páginas aún no existen. No se implementó JG-07.

### Evidencia

- [Comparación visual en los tres tamaños y 42 capturas](../evidencias/JG-06/README.md).
- [Revisión independiente en contexto limpio y correcciones](../evidencias/JG-06/revision.md).
- Pruebas primero: la suite de acceso falló por el servicio ausente; la de consulta de bitácora rechazó la falta de cabeceras explícitas fuera de una petición; la nueva prueba de UTC falló con `America/Guatemala`. No se debilitaron pruebas ni umbrales.
- `crear-admin` probado en terminal real contra una base desechable: se ocultaron ambas contraseñas y se creó la cuenta para los dos sistemas. No se usaron datos ni credenciales de INCOVSA.
- [Verificación local](../evidencias/JG-06/verificacion.md): `npm run verificar` aprobó formato, lint, tipos y 108 pruebas; los scripts aprobaron 109; `npm run build` y las 63 pruebas de `npm run e2e -- --workers=1` pasaron. next-devtools sin errores. El reinicio autorizado de `incovsa_jg06_reinicio` y las dos semillas también pasaron.

### Correcciones de la auditoría (2026-10-22)

H-32 a H-35 y H-38: los intentos fallidos y los bloqueos guardan un resumen legible; el sistema no autorizado regresa al paso 2. La salida muestra «Sesión cerrada.» en Inicio y consume el aviso sin repetirlo al volver. El error de credenciales lleva punto final. Las pruebas comprueban que ninguno de los tres pasos pide la sede y que las sesiones siguen siendo independientes.
