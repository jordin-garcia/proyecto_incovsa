---
id: CE-04
titulo: "Panel: usuarios del sitio"
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: pendiente
depende_de: [CE-03]
programada: 2026-10-19
requisitos: [RF-SW-11, RF-SW-13, RF-SW-25, RN-18, RN-19, RN-38, RN-47, RN-54, CU-12]
pantallas: [panel.js › usuarios, formUsuario, eliminarUsuario, restablecerClave]
---

# CE-04 · Panel: usuarios del sitio

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** lun 19/10 · **Depende de:** CE-03

## Objetivo
La sección **Usuarios** del panel del sitio, solo para Gerencia y Soporte, con el módulo `usuarios` de CE-03: crear con contraseña, rol, permisos del sitio con casillas, restablecer la contraseña y eliminar.

## Contexto que debes leer
- `specs/03-roles-y-accesos.md` **completo**; `specs/05` §"Panel administrativo" (fila Usuarios)
- `specs/04`: RF-SW-11, RF-SW-13, RF-SW-25
- Prototipo: `#/panel/usuarios?cuenta=ejemplo.01`; `panel.js` › `usuarios()`, `formUsuario()`, `eliminarUsuario()` y `restablecerClave()`
- `## Resultado` de CE-03

## Qué hacer
1. `/panel/usuarios`, igual al prototipo, con los componentes de `src/componentes/usuarios/` y las acciones de `src/modulos/usuarios/` para el sistema `sitio`: permisos del sitio (los 10 `sit.*`) con casillas; sin sedes (los usuarios del sitio no tienen sede).
2. Las mismas reglas que CE-03: contraseña al crear y al restablecer (mínimo 8, dos veces), rol libre, Gerencia y Soporte como `ambos`, RN-54, eliminación lógica, cierre de sesiones y bitácora.
3. "¿Olvidó su contraseña?" de la pantalla de inicio de sesión del sitio dice "Pídale a Gerencia o a Soporte que la restablezcan." (ya lo hace JG-06; comprobarlo).

## Archivos que creas o modificas
- `src/app/panel/usuarios/**` (crear), `src/modulos/usuarios/**` y `src/componentes/usuarios/**` (modificar)
- `pruebas-e2e/panel/usuarios.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-13:** Gerencia crea un usuario del sitio con solo `sit.doc.ver`; ese usuario entra al panel y solo ve la documentación interna, sin opción de descargar.
2. **RN-54:** se puede crear en el sitio un nombre que ya existe en el picking; no uno de Gerencia o Soporte.
3. **RF-SW-11 / RN-47:** el restablecimiento funciona como en CE-03, sin correo.
4. Solo Gerencia y Soporte ven la sección y ejecutan las acciones.
5. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración de las reglas del sitio (criterios 1 a 4)
- `pruebas-e2e/panel/usuarios.spec.ts` (criterios 1 y 5)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/panel/usuarios.spec.ts
```
