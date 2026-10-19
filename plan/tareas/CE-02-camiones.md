---
id: CE-02
titulo: "Configuración: camiones"
persona: carlos
responsable: Carlos Hugo Escobar
hito: E2
prioridad: P1
estado: hecha
depende_de: [CE-01, JG-07]
programada: 2026-10-18
requisitos: [RF-SL-04, RN-17, CU-13]
pantallas: [picking.js › selSedes, configuracion (pestaña Camiones)]
---

# CE-02 · Configuración: camiones

**Responsable:** Carlos Hugo Escobar · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** CE-01, JG-07

## Objetivo
La pestaña **Camiones** del módulo de Configuración: ver, crear, editar y eliminar (de forma lógica) los camiones de las sedes del usuario. Los camiones alimentan la lista y el control de peso de "Envío por camión" en Facturación.

## Contexto que debes leer
- `specs/11-picking-configuracion.md` §"Acceso" y §"Camiones" **completos**
- `specs/04`: RF-SL-04; `specs/12`: RN-17; `specs/16`: decisión 2 (eliminación lógica); `specs/19`: P-01
- `specs/14` (CAMION)
- Prototipo: `#/picking/configuracion?cuenta=ejemplo.01` (pestaña Camiones); `picking.js` › `configuracion()` y `selSedes()`
- `## Resultado` de JG-05 y JG-07

## Qué hacer
1. `src/modulos/camiones/`: listar los camiones activos de las sedes del usuario; crear y editar (identificación, capacidad máxima en kg mayor que cero con 3 decimales como máximo, y sede entre las del usuario); **eliminar de forma lógica** (`eliminado_en`), con confirmación. Permiso `pk.cfg.camiones` (Gerencia y Soporte siempre). Bitácora "Creación de camión", "Edición de camión" y "Eliminación de camión" (los nombres del prototipo).
2. `/picking/configuracion` con las pestañas del prototipo (Camiones y, para Gerencia y Soporte, Usuarios, que hace CE-03), con la cuenta de cada una y el botón "Nuevo camión". La ventana del camión igual al prototipo, con la identificación pendiente de INCOVSA (P-01) como un campo de texto normal (sin la nota amarilla del prototipo).
3. Exponer `camionesActivosDeSede(sede)` para Facturación (JC-04).

## Archivos que creas o modificas
- `src/modulos/camiones/**` (crear)
- `src/app/picking/configuracion/**`, `src/componentes/picking/configuracion/**` (crear)
- `pruebas-e2e/picking/camiones.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SL-04:** se crean, editan y eliminan camiones; uno eliminado desaparece de la lista y de Facturación, y sus rutas, reportes y bitácora se conservan.
2. **RN-17:** un usuario con solo Quetzaltenango solo ve y crea camiones de Quetzaltenango, aunque modifique la petición.
3. Una capacidad de 0, negativa o no numérica se rechaza.
4. Sin `pk.cfg.camiones` (y sin ser Gerencia o Soporte), las acciones se rechazan en el servidor.
5. Cada cambio queda en la bitácora.
6. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- Integración con permisos y sedes (criterios 1 a 5)
- `pruebas-e2e/picking/camiones.spec.ts` (criterios 1 y 6)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/camiones.spec.ts
```

## Fuera de alcance
- Usuarios (CE-03 y CE-04).

## Resultado

La pestaña Camiones de `/picking/configuracion` crea, edita y elimina camiones de las sedes del usuario. Eliminar escribe `eliminadoEn`. La fila, las rutas y la bitácora se quedan. Si el camión está elegido en «Envío por camión» de Facturación, no se elimina. `eliminarCamion` avisa con el texto del prototipo y la lista trae `elegidoEnFacturacion` para el diálogo «No se puede eliminar».

`camionesActivosDeSede(sedeId)` está en `src/modulos/camiones/servicio.ts`. Devuelve los camiones activos de esa sede, del id más bajo al más alto. Cada uno trae `id`, `identificacion`, `capacidadKg` y `sedeId`. `capacidadKg` es texto con tres decimales, por ejemplo `3400.000`. La función no revisa la sesión. Quien la llama ya tiene que haber autorizado la sede.

**JC-04.** Facturación puede reemplazar la consulta de camiones de `src/modulos/envios/opciones.ts` por `camionesActivosDeSede`. El nombre del desplegable es `identificacion`. La capacidad del medidor es `capacidadKg`.

Las acciones `crearCamionAccion`, `editarCamionAccion` y `eliminarCamionAccion` exigen sesión de picking y el permiso `pk.cfg.camiones`. La sede elegida pasa por `exigirPermiso`. La bitácora usa las operaciones "Creación de camión", "Edición de camión" y "Eliminación de camión". `detalle.resumen` guarda el texto del prototipo.

Gerencia y Soporte ven la pestaña Usuarios con la cuenta de usuarios del picking. El alta, la edición y la baja de esas cuentas quedan en CE-03.

Verificación local, el 19/10/2026.

- `npm run verificar` pasó. Formato, lint, tipos y 249 pruebas.
- `npm run build` pasó. La ruta `/picking/configuracion` queda dinámica.
- `npm run e2e -- pruebas-e2e/picking/camiones.spec.ts` pasó. 9 pruebas, en 390, 768 y 1440 px, con color-contrast activo y sin violaciones serias de axe.
