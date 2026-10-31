---
id: JG-26
titulo: Endurecimiento de cookies, cabeceras, sesiones, contraseñas y registros
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-15]
programada: 2026-10-30
requisitos: [RNF-03, RNF-04, RNF-16, RF-SL-01]
pantallas: []
---

# JG-26 · Endurecimiento de cookies, cabeceras, sesiones, contraseñas y registros

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** JG-15

## Objetivo
Corregir las brechas de la revisión de seguridad (JG-15) que están en el código del coordinador. La de severidad media es **R-P01**: la cookie de la sede solo se envía bajo `/picking`, así que la exportación de reportes (`/api/reportes/exportar`) usa siempre la primera sede del usuario, aunque en pantalla se vea otra. También se agrega la columna de la IP de las solicitudes de Contacto, que necesita DM-14.

## Contexto que debes leer
- `plan/seguridad/asvs-nivel-2.md`: hallazgo R-P01 y filas V3.3.1, V3.3.3, V3.4.3, V7.2.4, V11.4.2, V11.5.1, V14.3.1, V15.2.3, V16.2.1 y V16.3.2 a V16.3.4
- `plan/seguridad/zap-2026-10-29.md`: alertas 10037, 10063 y 90004
- `specs/16` "Seguridad" y decisiones 29, 36 y 66; `specs/03` › "Sesiones" (una sesión por sistema en el mismo navegador)
- `specs/05` › "Contacto" (límite de envíos, 29/10)
- Documentación de Better Auth 1.7 (Context7): `advanced.cookiePrefix`, `useSecureCookies`, `emailAndPassword.password.hash` y `verify`

## Qué hacer
1. **Sede (R-P01):** la cookie de la sede se envía en todo el sitio (`path: "/"`), para que la exportación use la sede que se ve en pantalla. Agregar la prueba que lo habría detectado: exportar con la segunda sede elegida desde la pantalla.
2. **Cookies con prefijo (V3.3.1 y V3.3.3):** en producción, las cookies de sesión de los dos sistemas, la de la sede y la del acceso personal llevan el prefijo `__Host-` (`Secure`, `path=/`, sin `Domain`). Actualizar `proxy.ts`. En desarrollo y en las pruebas, por HTTP, se conservan los nombres sin prefijo.
3. **CSP y cabeceras:**
   - `base-uri 'none'` y `object-src 'none'` (V3.4.3), con su prueba en `pruebas-e2e/seguridad/cabeceras.spec.ts`;
   - nonce con 16 bytes de `crypto.getRandomValues` (V11.5.1);
   - `poweredByHeader: false` (ZAP 10037);
   - `Permissions-Policy` que no permita cámara, micrófono, ubicación ni pagos (ZAP 10063);
   - `Cross-Origin-Opener-Policy: same-origin` (ZAP 90004). Comprobar que siguen funcionando los mapas de Google y la vista previa de Drive.
4. **scrypt (V11.4.2):**
   - una función común para cifrar y verificar contraseñas, con parámetros que cumplan el mínimo de OWASP (por ejemplo, N=2^14, r=8, p=5), en `src/lib/`;
   - configurarla en las dos configuraciones de Better Auth y usarla en `src/modulos/usuarios/servicio.ts`, `scripts/administrador.ts` y las semillas;
   - `verify` sigue aceptando las contraseñas cifradas con el formato anterior.
   - **Para CE-14:** exportar de `src/app/acceso/servicio.ts` una función que, dentro del mismo bloqueo transaccional del inicio de sesión, revise si el usuario está bloqueado por RNF-15, verifique su contraseña y, si falla, registre el intento fallido (y el bloqueo, si corresponde) en la bitácora. Con un bloqueo vigente devuelve «incorrecta» aunque la contraseña sea correcta.
5. **Sesiones:**
   - al iniciar sesión, se cierra la sesión anterior del mismo sistema en ese navegador (V7.2.4);
   - al cerrar sesión, la página se recarga por completo para que no quede contenido autenticado en la memoria del navegador, y se envía `Clear-Site-Data: "cache"` (V14.3.1). **No** se borran las cookies del otro sistema (una sesión por sistema, `specs/03`).
6. **Registros del servidor (V16.2.1 y V16.3.2 a V16.3.4):**
   - los errores inesperados y los rechazos de autorización (`ErrorAcceso`) se registran en el registro del servidor (no en la bitácora de Reportes) con la fecha, la operación, el sistema y el identificador del usuario, sin datos personales ni secretos;
   - la ruta `api/auth` registra sus errores;
   - las rutas multipart del panel registran sus rechazos por origen.
7. **Imagen de producción (V15.2.3):** la imagen final solo lleva las dependencias de producción, más `prisma` y `tsx`, que se ejecutan en producción (`migrate deploy` y `crear-admin`). No lleva `prisma/semilla-demo.ts` ni los scripts que no se usan en producción. Si hace falta, mover `prisma` y `tsx` a `dependencies` en `package.json` y `package-lock.json`, sin cambiar sus versiones.
8. **Registro de la decisión:** precisar en `specs/16` ("Seguridad") y en `specs/18` las cookies `__Host-`, la CSP, los parámetros de scrypt, `Permissions-Policy`, COOP y los registros del servidor.
9. **Informe:** cambiar a "Cumple" las filas de `plan/seguridad/asvs-nivel-2.md` que corrige esta tarea, con su evidencia, y marcar R-P01 como corregido. Lo mismo en `plan/seguridad/zap-2026-10-29.md` para las alertas 10037, 10063 y 90004, después de repetir ZAP.
10. **Base de datos (DM-14):**
   - columna `ip` (`VarChar(45)`, opcional) en `solicitud_contacto`, con un índice por `ip` y `creado_en`, y su migración;
   - actualizar `specs/14`.

## Archivos que creas o modificas
- `src/lib/**` (configuraciones de Better Auth, cabeceras, sesión, errores, contraseñas), `src/proxy.ts`, `next.config.ts`, `src/app/acceso/**`, `src/app/api/auth/**`, `src/modulos/permisos/**` (modificar)
- `src/modulos/usuarios/servicio.ts` (solo la llamada a la función común; de Carlos, §E1), `src/app/panel/*/publicar/route.ts` (solo el registro del rechazo; de Daniela, §E1)
- `Dockerfile` (de Carlos, §E1), `package.json`, `package-lock.json`
- `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `prisma/semilla-demo.ts`, `scripts/administrador.ts`, `specs/14-modelo-de-datos.md`, `specs/16-arquitectura-y-tecnologia.md`, `specs/18-historial-de-decisiones.md`
- `.github/workflows/produccion-imagen.yml` (de Carlos, §E1: comprobar el criterio 7)
- `plan/seguridad/asvs-nivel-2.md` y `plan/seguridad/zap-2026-10-29.md` (solo las filas que corrige)
- Pruebas: `src/**/*.test.ts` afectadas, `pruebas-e2e/seguridad/cabeceras.spec.ts`, `pruebas-e2e/acceso/**`, `pruebas-e2e/picking/reportes-exportacion.spec.ts` y las ayudas de las pruebas que crean cookies

## Criterios de aceptación
1. **RNF-04 (R-P01):** con dos sedes, al elegir la segunda en Reportes y exportar a Excel y PDF, el archivo trae los datos y el nombre de la segunda sede.
2. **RNF-16:** en producción, todas las cookies propias llevan `__Host-`; la CSP tiene `base-uri 'none'` y `object-src 'none'`; el nonce es de 128 bits; no hay `X-Powered-By`; hay `Permissions-Policy` y `Cross-Origin-Opener-Policy`. Los mapas y Drive siguen funcionando.
3. **RNF-03 (V11.4.2):** las contraseñas nuevas se cifran con los parámetros nuevos, las anteriores siguen sirviendo, y `crear-admin`, el inicio de sesión y el restablecimiento usan la misma función.
4. **RF-SL-01 (V7.2.4):** después de volver a iniciar sesión en el mismo navegador, la sesión anterior ya no sirve. La del otro sistema sigue abierta.
5. **V14.3.1:** después de cerrar sesión, volver atrás en el navegador no muestra contenido autenticado.
6. **V16.3.2:** un rechazo por permiso o por sede deja una línea en el registro del servidor con la operación, el sistema y el usuario.
7. **V15.2.3:** la imagen de producción no contiene `vitest`, `@playwright/test` ni `prisma/semilla-demo.ts`, y `migrate deploy` y `crear-admin` siguen funcionando (`produccion-imagen.yml`).
8. **RNF-15:** la función de reautenticación rechaza la contraseña correcta mientras el usuario está bloqueado, y cada fallo cuenta en el límite y queda en la bitácora.
9. La migración aplica sobre una base vacía y sobre una con datos, y la CI que compara el esquema con las migraciones pasa.

## Pruebas obligatorias
- Vitest y Playwright, con nombres que empiecen por el requisito (`RNF-04:`, `RNF-16:`, `RNF-03:`, `RF-SL-01:`) o por el código de ASVS (`ASVS V14.3.1:`).

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e
gh workflow run zap.yml --ref develop
```

## Fuera de alcance
- Los riesgos aceptados de JG-27.

## Notas
- Las cookies con `__Host-` exigen HTTPS. Comprueba que WebKit (JG-16) sigue iniciando sesión en local.
- Avisa en tu bitácora a Carlos (`Dockerfile`, `usuarios/servicio.ts`, `produccion-imagen.yml` y la función de reautenticación para CE-14), a Daniela (rutas multipart y columna `ip` para DM-14) y a José Daniel (`pruebas-e2e/picking/reportes-exportacion.spec.ts`).

## Resultado

Se corrigieron las brechas de la revisión de seguridad que estaban en el código del coordinador. En `plan/seguridad/asvs-nivel-2.md` pasan a "Cumple" 12 filas (V3.3.1, V3.3.3, V3.4.3, V7.2.4, V11.4.2, V11.5.1, V14.3.1, V15.2.3, V16.2.1, V16.3.2, V16.3.3 y V16.3.4) y R-P01 queda corregido: el total pasa de 112 a 124 requisitos que cumplen. Las decisiones quedaron en `specs/16` ("Seguridad") y `specs/18`.

### Qué se hizo
- **Sede (R-P01):** la cookie de la sede se guarda con `path=/`, así que `/api/reportes/exportar` usa la sede que se ve en pantalla. Prueba de extremo a extremo «RNF-04 (R-P01)» en `pruebas-e2e/picking/reportes-exportacion.spec.ts`: elige Guatemala y exporta Excel y PDF con su nombre y sin los datos de Quetzaltenango.
- **Cookies `__Host-`:** en producción, las de sesión de los dos sistemas, la de la sede y la del acceso personal se llaman `__Host-…`, con `Secure`, `path=/` y sin `Domain`. En desarrollo y en las pruebas, por HTTP, no llevan prefijo. Better Auth usa `useSecureCookies: false` (solo sabía anteponer `__Secure-`) y un nombre propio para cada una de sus cuatro cookies.
- **Cabeceras:** `base-uri 'none'`, nonce de 16 bytes de `crypto.getRandomValues`, `poweredByHeader: false`, `Permissions-Policy` y `Cross-Origin-Opener-Policy: same-origin`. Los mapas de Google y la vista previa de Drive siguen funcionando (prueba existente de `cabeceras.spec.ts`).
- **scrypt:** `src/lib/contrasenas.ts`, con N=2^14, r=8, p=5 escritos en el hash. Lo usan las dos configuraciones de Better Auth, `usuarios/servicio.ts`, `scripts/administrador.ts` y `prisma/semillas/demo.ts`. Las contraseñas anteriores siguen sirviendo.
- **Sesiones:** volver a iniciar sesión cierra la sesión anterior de ese sistema en ese navegador. Cerrar sesión llama a la ruta `sign-out`, que responde con `Clear-Site-Data: "cache"`, y recarga la página completa; una página restaurada con Atrás se vuelve a pedir. La sesión del otro sistema sigue abierta. `leerSesion` ya no reenvía el `Set-Cookie` con que Better Auth borra una cookie de sesión inválida: si otra pestaña tenía en curso una petición con la sesión anterior, esa respuesta borraba la cookie de la sesión recién iniciada (lo encontró la prueba RN-17 de `permisos.spec.ts`).
- **Registro del servidor:** líneas JSON para los rechazos de autorización, por origen y de entradas, la cookie de sede ajena y los errores inesperados (también en `api/auth`), con fecha, evento, sistema, usuario y operación, sin datos personales ni el mensaje del error.
- **Imagen de producción:** etapa `dependencias-produccion` con `npm prune --omit=dev`; `prisma` y `tsx` pasan a `dependencies` con las mismas versiones; la imagen solo copia `crear-admin`, el esquema, las migraciones y la semilla base. `produccion-imagen.yml` lo comprueba, junto con las cabeceras nuevas y la cookie `__Host-` a través de Caddy.
- **Base de datos:** migración `20261031034121_solicitud_contacto_ip`: columna `ip` (`VarChar(45)`, opcional) en `solicitud_contacto` y el índice `solicitud_contacto_ip_creado_en_idx`. Se aplicó sobre una base vacía y sobre la base local con datos.

### Decisiones tomadas
- **Contexto del registro:** `exigirPermiso` y `exigirAccesoTotal` fijan con `AsyncLocalStorage.enterWith` el sistema, el usuario y la operación (el código del permiso) para el resto de la operación, y `aResultadoDeError` los agrega a su línea. Así no hubo que cambiar las acciones de cada módulo. `src/lib/errores.ts` no importa módulos de Node, porque lo usan componentes del navegador: `src/lib/registro.ts` le entrega el contexto al cargarse.
- **Sin el mensaje del error:** el registro guarda el tipo, el código (por ejemplo, `P2002`) y las primeras líneas de la pila, no el mensaje, porque los errores de Prisma y de validación pueden traer datos escritos por el usuario o la cadena de conexión.
- **La reautenticación no reinicia el conteo:** un acierto no borra los fallos anteriores; solo los reinicia un inicio de sesión correcto, como en RNF-15.
- **Todo `ErrorAcceso` se registra:** el constructor escribe la línea (motivo `regla_de_acceso`) para los rechazos que los servicios y las rutas lanzan directamente; `rechazarAcceso` registra el suyo con el motivo exacto y crea el error sin repetirlo.
- **Las páginas «Sin acceso»** no registran nada: solo deciden qué mostrar y no leen datos; cada operación vuelve a exigir el permiso y ese rechazo sí queda registrado.
- **Hash alterado:** solo se aceptan N entre 2^14 y 2^17, r entre 8 y 16 y un costo N·r·p no menor que el actual, para que un hash modificado no pida 4 GB de memoria ni parámetros débiles.
- **Parámetros de scrypt:** de las equivalencias de OWASP, N=2^14, r=8, p=5 es la más rápida en este equipo (unos 255 ms por contraseña, frente a 480 ms de N=2^17). Por eso la semilla de demostración cifra sus 11 cuentas en paralelo, cada una con su sal.

### Cómo usar lo que se creó
- **Cookies propias nuevas:** usa `nombreCookie("incovsa-…")` y `atributosCookie(maxAge?)` de `src/lib/cookies.ts`. No escribas los nombres a mano: en producción llevan `__Host-`. En las pruebas con el servidor de producción, `cookieDeSede` de `pruebas-e2e/comunes/cookies.ts` crea la cookie de la sede con el nombre correcto.
- **Contraseñas:** `cifrarContrasena(clave)` y `verificarContrasena({ hash, password })` de `src/lib/contrasenas.ts`. No uses `hashPassword` de `better-auth/crypto`.
- **Reautenticación (CE-14):** `reautenticar(sesion, clave, cabeceras)` de `src/app/acceso/servicio.ts` devuelve `true` o `false`. Abre su propia transacción, toma el bloqueo del inicio de sesión, devuelve `false` con un bloqueo vigente de RNF-15 aunque la contraseña sea correcta, y registra cada fallo (y el bloqueo, si corresponde) en la bitácora. Llámala antes de cambiar nada y responde «Su contraseña no es correcta.» si devuelve `false`.
- **Registro del servidor:** `registrarEnServidor("aviso" | "error", evento, datos)` de `src/lib/registro.ts`, solo con identificadores y códigos. Para un rechazo de autorización propio, `rechazarAcceso(motivo, datos?)` de `src/modulos/permisos/servicio.ts`, que registra y lanza `ErrorAcceso`.
- **Origen:** `esMismoOrigen(peticion)` de `src/lib/origen.ts` para las rutas de la API que cambian datos.
- **IP de Contacto (DM-14):** la columna es `ip` en Prisma (`SolicitudContacto.ip`), opcional, con el índice `@@index([ip, creadoEn])` para contar las solicitudes de los últimos 60 minutos.

### Evidencia
- `npm run verificar`: todas las pruebas de Vitest aprobadas (`plan/evidencias/JG-26/verificar.txt`); `npm run build` correcto.
- ZAP repetido en la rama ([41172622744](https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/41172622744)): aprobado, y ya no aparecen las alertas 10037, 10063 ni la de COOP (90004). Detalle en `plan/seguridad/zap-2026-10-29.md`.
- Batería completa de `pruebas-e2e/` con Chromium, por partes y con un proceso, con el código final y en una base local nueva (salidas en `plan/evidencias/JG-26/`): 518 pruebas aprobadas. Hubo que repetir tres cosas, y pasaron:
  - la parte de acceso en escritorio: con el equipo lento, tres pruebas pasaron de 30 s y la corrida se cortó por su límite de tiempo (final de `e2e-acceso-telefono-tableta.txt`); repetida aparte, pasó (`e2e-acceso-escritorio.txt`);
  - «RN-54 / RF-SW-30» de `acceso-personal.spec.ts`, un fallo conocido de este equipo que también ocurre en `develop` (la página de inicio tardó más de 5 s en quitar `?sesion=cerrada`): 3 de 3 al repetirla (`e2e-acceso-escritorio-rn54.txt`);
  - «RNF-17 / CP-52» de `rendimiento-galerias.spec.ts` en el teléfono, por el ruido de la medición de tiempo ya anotado en `specs/18` (437 ms contra un tope de 435,6 ms) (`e2e-sitio-telefono-galerias.txt`).
