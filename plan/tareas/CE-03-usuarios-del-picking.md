---
id: CE-03
titulo: "Configuración: usuarios del picking"
persona: carlos
responsable: Carlos Hugo Escobar
hito: E2
prioridad: P1
estado: pendiente
depende_de: [CE-02]
programada: 2026-10-18
requisitos: [RF-SL-03, RF-SL-48, RF-SL-56, RF-SL-57, RF-SL-66, RN-17, RN-18, RN-38, RN-46, RN-47, RN-54, CU-12]
pantallas: [panel.js › casillasPermisos, cambiosAcceso, formUsuario, eliminarUsuario, restablecerClave, resumenPermisos; picking.js › configuracion (pestaña Usuarios)]
---

# CE-03 · Configuración: usuarios del picking

**Responsable:** Carlos Hugo Escobar · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** CE-02

## Objetivo
La administración de los **usuarios del picking** en Configuración, solo para Gerencia y Soporte: crear con contraseña, editar el rol (texto libre), las **sedes** y los **permisos** con casillas, restablecer la contraseña y eliminar de forma lógica. El módulo `usuarios` se escribe para servir también a los usuarios del sitio (CE-04).

## Contexto que debes leer
- `specs/03-roles-y-accesos.md` **completo**
- `specs/11` §"Usuarios del picking"; `specs/12`: RN-17, RN-18, RN-38, RN-46, RN-47, RN-54
- `specs/14` §"Acceso" (USUARIO con el sistema `sitio`, `picking` o `ambos`; USUARIO_PERMISO; USUARIO_SEDE)
- `specs/16`: decisiones 2, 7, 8, 22, 24, 26 y 36
- Prototipo: `#/picking/configuracion?cuenta=ejemplo.01` (pestaña Usuarios); `panel.js` › `casillasPermisos()`, `cambiosAcceso()`, `formUsuario()`, `eliminarUsuario()`, `restablecerClave()` y `resumenPermisos()`
- `## Resultado` de JG-06 (`revocarSesiones`, la clave de acceso interna) y JG-07

## Qué hacer
1. `src/modulos/usuarios/` (para los dos sistemas): listar, crear, editar, eliminar y restablecer la contraseña, **solo** para Gerencia y Soporte (no es un permiso asignable).
   - **Crear:** nombre completo, nombre de usuario, contraseña dos veces (mínimo 8 caracteres, decisión 24), rol (texto libre), correo opcional, y en el picking las sedes y los permisos del picking con casillas. Si el rol es Gerencia o Soporte (con `normalizarRol`), la cuenta es del sistema `ambos` y tiene acceso total (las casillas no se piden, como el prototipo).
   - **Nombre de usuario (RN-54, decisión 22):** único dentro de su sistema; puede repetir el de una cuenta del otro sistema; no puede repetir el de una cuenta de Gerencia o Soporte (`ambos`). Las ventanas no muestran una nota con esta regla (CAM-86).
   - **Editar:** todo menos la contraseña; los cambios de permisos y sedes se registran con el detalle de `cambiosAcceso()`.
   - **Restablecer la contraseña** (RF-SL-48): Gerencia o Soporte escriben una nueva dos veces; se cierran todas las sesiones del usuario (`revocarSesiones`, decisión 36).
   - **Eliminar** (RF-SL-57): lógica, con confirmación; el usuario no puede iniciar sesión, su nombre queda reservado, se cierran sus sesiones y se conservan sus registros.
   - Bitácora: "Creación de usuario", "Edición de usuario", "Restablecimiento de contraseña" y "Eliminación de usuario" (los nombres del prototipo), sin contraseñas en el detalle.
2. Pestaña **Usuarios** de `/picking/configuracion` igual al prototipo: tabla con nombre, usuario, rol, sedes, resumen de permisos (`resumenPermisos()`, "Acceso total" para Gerencia y Soporte), estado y acciones; ventanas de nuevo usuario, editar, restablecer y eliminar.
3. Componentes compartidos con CE-04 en `src/componentes/usuarios/` (formulario, casillas de permisos y sedes, tabla).

## Archivos que creas o modificas
- `src/modulos/usuarios/**` (crear)
- `src/app/picking/configuracion/**` (modificar), `src/componentes/usuarios/**` (crear)
- `pruebas-e2e/picking/usuarios.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-03 / RF-SL-56:** Gerencia crea un usuario del picking con rol "Bodega", la sede Quetzaltenango y `pk.bodega`; ese usuario entra y solo ve Bodega de Quetzaltenango.
2. **RN-54** (CP-46): se puede crear `ejemplo.08` en el picking aunque exista en el sitio; no se puede crear `ejemplo.01` en el picking (es de Gerencia, `ambos`); no se repite un nombre dentro del picking.
3. **RF-SL-48 / decisión 36** (CP-48): restablecer la contraseña rechaza una de menos de 8 caracteres o dos distintas; la nueva funciona y las sesiones abiertas del usuario se cierran.
4. **RF-SL-57** (CP-49): un usuario eliminado no puede iniciar sesión, su nombre no se puede volver a usar en el picking y sus registros siguen en la bitácora y en los reportes.
5. **RN-46:** un usuario con rol "piloto " aparece en la lista de pilotos de Facturación de sus sedes.
6. Solo Gerencia y Soporte ven la pestaña y ejecutan las acciones; para cualquier otro, el servidor las rechaza.
7. Ninguna contraseña aparece en la bitácora, en los registros ni en las respuestas.
8. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración del módulo `usuarios` (criterios 1 a 7)
- `pruebas-e2e/picking/usuarios.spec.ts` (criterios 1 y 8)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/usuarios.spec.ts
```

## Fuera de alcance
- Los usuarios del sitio en el panel (CE-04).
