---
id: CE-14
titulo: Reautenticación, contraseñas fáciles de adivinar y mensajes de validación
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-15, JG-26]
programada: 2026-10-31
requisitos: [RF-SL-48, RF-SW-11, RNF-03, RNF-05, RNF-15]
pantallas: []
---

# CE-14 · Reautenticación, contraseñas fáciles de adivinar y mensajes de validación

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 31/10 · **Depende de:** JG-15, JG-26

## Objetivo
Corregir lo que encontró la revisión de seguridad (JG-15) en la administración de usuarios y de camiones y en Caddy:
- **V7.5.1** (media): con una sesión robada de Gerencia o Soporte se puede restablecer la contraseña de otra cuenta de acceso total, o la propia, sin volver a autenticarse.
- **V6.2.4 y V6.2.11**: se aceptan contraseñas comunes o con el nombre de la empresa.
- **R-P03**: se muestran mensajes de Zod en inglés.
- **V4.1.1**: las respuestas de Next.js de tipo `text/x-component` no llevan `charset`.
- **V13.4.4**: el método TRACE se acepta.

## Contexto que debes leer
- `specs/03-roles-y-accesos.md` › "Administración de usuarios" y "Contraseñas fáciles de adivinar" (precisiones del 29/10, JG-15)
- `plan/seguridad/asvs-nivel-2.md`: filas V7.5.1, V6.2.4, V6.2.11, V4.1.1 y V13.4.4, la observación OC-2 y el hallazgo R-P03
- `## Resultado` de JG-26: la función común para cifrar y verificar contraseñas
- `src/modulos/usuarios/` (esquemas, servicio y acciones), `src/componentes/usuarios/DialogoClave.tsx`, `scripts/administrador.ts`, `src/app/acceso/servicio.ts` (límite de intentos, RNF-15), `Caddyfile`

## Qué hacer
1. **Reautenticación al restablecer la contraseña de una cuenta de acceso total:**
   - si la cuenta es de Gerencia o Soporte (incluida la propia), el diálogo «Restablecer contraseña» muestra el campo «Su contraseña», con la ayuda «Para restablecer la contraseña de una cuenta de acceso total, confirme la suya.»;
   - el servidor la verifica con la función de reautenticación que JG-26 exporta de `src/app/acceso/servicio.ts`, antes de cambiar nada. El servidor decide si la pide según la cuenta de destino, nunca según lo que mande el navegador;
   - si es incorrecta, o si quien lo hace está bloqueado por RNF-15 (aunque la escriba bien): «Su contraseña no es correcta.». No cambia nada; la función de JG-26 cuenta el intento fallido y lo deja en la bitácora.
2. **Contraseñas fáciles de adivinar:**
   - crear un módulo con la lista local: las 10 000 contraseñas más comunes de SecLists que tienen 8 o más caracteres. Anota en el archivo la ruta en SecLists, el commit y la licencia MIT;
   - crear la función que la consulta junto con las palabras de la empresa y el nombre de usuario (si tiene 4 o más caracteres), sin distinguir mayúsculas ni acentos;
   - usarla en `mensajeClave` (crear y restablecer) y en `scripts/administrador.ts` (`crear-admin`; autorizado por el coordinador);
   - mensaje: «Esa contraseña es muy fácil de adivinar. Elija otra.».
3. **Mensajes de Zod** (`src/modulos/usuarios/acciones.ts` y `src/modulos/camiones/acciones.ts`, función `leer`): mostrar el mensaje de cada campo que define el esquema, o «Revise los datos del formulario.», nunca el mensaje por omisión de Zod.
4. **`charset` y TRACE:** en el `Caddyfile`, que las respuestas `text/x-component` salgan como `text/x-component; charset=utf-8` (V4.1.1), y que el método TRACE se responda con 405 (V13.4.4, observación OC-2). Comprobar los dos en `produccion-imagen.yml`, que ya pasa por Caddy.
5. **Informe:** cambiar a "Cumple" las filas de `plan/seguridad/asvs-nivel-2.md` que corrige esta tarea (V4.1.1, V6.2.4, V6.2.11, V7.5.1 y V13.4.4), con su evidencia, y marcar R-P03 como corregido.

## Archivos que creas o modificas
- `src/modulos/usuarios/esquemas.ts`, `servicio.ts`, `acciones.ts` y sus pruebas (modificar)
- `src/modulos/usuarios/contrasenas-comunes.ts` y el archivo de la lista (crear)
- `src/componentes/usuarios/DialogoClave.tsx` (modificar)
- `src/modulos/camiones/acciones.ts` y sus pruebas (modificar)
- `scripts/administrador.ts` y `scripts/administrador.test.ts` (modificar; autorizado)
- `Caddyfile`, `.github/workflows/produccion-imagen.yml` (modificar)
- `plan/seguridad/asvs-nivel-2.md` (solo las filas que corrige; autorizado por el coordinador)
- `pruebas-e2e/picking/usuarios.spec.ts` y la prueba de usuarios del panel (modificar)

## Criterios de aceptación
1. **RF-SL-48 / RF-SW-11 (ASVS V7.5.1):** restablecer la contraseña de una cuenta de Gerencia o Soporte sin «Su contraseña», o con una incorrecta, no cambia nada y muestra el mensaje de `specs/03`. Con la correcta, la restablece. El campo no aparece para las demás cuentas.
2. **RNF-15:** cada «Su contraseña» incorrecta cuenta en el límite de intentos de quien lo hace y queda en la bitácora. Si quien lo hace está bloqueado, se rechaza aunque la contraseña sea correcta.
3. **RNF-03 (ASVS V6.2.4 y V6.2.11):** se rechazan una contraseña de la lista, una que contiene «Incovsa» o «Quetzaltenango» y una que contiene el nombre de usuario, al crear, al restablecer y en `crear-admin`, con el mensaje de `specs/03`. Una contraseña que contiene un nombre de usuario de 3 caracteres sí se acepta.
4. **RNF-05:** ningún error de validación de usuarios ni de camiones muestra texto en inglés.
5. **ASVS V4.1.1 y V13.4.4:** a través de Caddy, las respuestas `text/x-component` llevan `charset=utf-8` y una petición TRACE recibe 405.

## Pruebas obligatorias
- Vitest para la reautenticación, la lista y los mensajes; Playwright para el diálogo con axe; la comprobación de Caddy en `produccion-imagen.yml`. Con nombres que empiecen por el requisito.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/usuarios.spec.ts pruebas-e2e/panel --workers=1
```

## Fuera de alcance
- Que el usuario cambie su propia contraseña, MFA o la consulta de contraseñas filtradas (riesgos aceptados, JG-27).
