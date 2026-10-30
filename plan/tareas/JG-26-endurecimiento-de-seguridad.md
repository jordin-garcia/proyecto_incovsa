---
id: JG-26
titulo: Endurecimiento de cookies, cabeceras, sesiones, contraseñas y registros
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
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
5. **Sesiones:**
   - al iniciar sesión, se cierra la sesión anterior del mismo sistema en ese navegador (V7.2.4);
   - al cerrar sesión, la página se recarga por completo para que no quede contenido autenticado en la memoria del navegador, y se envía `Clear-Site-Data: "cache"` (V14.3.1). **No** se borran las cookies del otro sistema (una sesión por sistema, `specs/03`).
6. **Registros del servidor (V16.2.1 y V16.3.2 a V16.3.4):**
   - los errores inesperados y los rechazos de autorización (`ErrorAcceso`) se registran en el registro del servidor (no en la bitácora de Reportes) con la fecha, la operación, el sistema y el identificador del usuario, sin datos personales ni secretos;
   - la ruta `api/auth` registra sus errores;
   - las rutas multipart del panel registran sus rechazos por origen.
7. **Imagen de producción (V15.2.3):** la imagen final solo lleva las dependencias de producción, más `prisma` y `tsx`, que se ejecutan en producción (`migrate deploy` y `crear-admin`). No lleva `prisma/semilla-demo.ts` ni los scripts que no se usan en producción. Si hace falta, mover `prisma` y `tsx` a `dependencies` en `package.json` y `package-lock.json`, sin cambiar sus versiones.
8. **Base de datos (DM-14):**
   - columna `ip` (`VarChar(45)`, opcional) en `solicitud_contacto`, con un índice por `ip` y `creado_en`, y su migración;
   - actualizar `specs/14`.

## Archivos que creas o modificas
- `src/lib/**` (configuraciones de Better Auth, cabeceras, sesión, errores, contraseñas), `src/proxy.ts`, `next.config.ts`, `src/app/acceso/**`, `src/app/api/auth/**`, `src/modulos/permisos/**` (modificar)
- `src/modulos/usuarios/servicio.ts` (solo la llamada a la función común; de Carlos, §E1), `src/app/panel/*/publicar/route.ts` (solo el registro del rechazo; de Daniela, §E1)
- `Dockerfile` (de Carlos, §E1), `package.json`, `package-lock.json`
- `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `prisma/semilla-demo.ts`, `scripts/administrador.ts`, `specs/14-modelo-de-datos.md`
- Pruebas: `src/**/*.test.ts` afectadas, `pruebas-e2e/seguridad/cabeceras.spec.ts`, `pruebas-e2e/acceso/**`, `pruebas-e2e/picking/reportes-exportacion.spec.ts` y las ayudas de las pruebas que crean cookies

## Criterios de aceptación
1. **RNF-04 (R-P01):** con dos sedes, al elegir la segunda en Reportes y exportar a Excel y PDF, el archivo trae los datos y el nombre de la segunda sede.
2. **RNF-16:** en producción, todas las cookies propias llevan `__Host-`; la CSP tiene `base-uri 'none'` y `object-src 'none'`; el nonce es de 128 bits; no hay `X-Powered-By`; hay `Permissions-Policy` y `Cross-Origin-Opener-Policy`. Los mapas y Drive siguen funcionando.
3. **RNF-03 (V11.4.2):** las contraseñas nuevas se cifran con los parámetros nuevos, las anteriores siguen sirviendo, y `crear-admin`, el inicio de sesión y el restablecimiento usan la misma función.
4. **RF-SL-01 (V7.2.4):** después de volver a iniciar sesión en el mismo navegador, la sesión anterior ya no sirve. La del otro sistema sigue abierta.
5. **V14.3.1:** después de cerrar sesión, volver atrás en el navegador no muestra contenido autenticado.
6. **V16.3.2:** un rechazo por permiso o por sede deja una línea en el registro del servidor con la operación, el sistema y el usuario.
7. **V15.2.3:** la imagen de producción no contiene `vitest`, `@playwright/test` ni `prisma/semilla-demo.ts`, y `migrate deploy` y `crear-admin` siguen funcionando (`produccion-imagen.yml`).
8. La migración aplica sobre una base vacía y sobre una con datos, y la CI que compara el esquema con las migraciones pasa.

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
- Avisa en tu bitácora a Carlos (`Dockerfile`, `usuarios/servicio.ts`) y a Daniela (rutas multipart, columna `ip` para DM-14).
