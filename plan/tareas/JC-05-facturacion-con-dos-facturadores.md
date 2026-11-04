---
id: JC-05
titulo: "Facturación: dos facturadores a la vez y tiempo real"
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: hecha
depende_de: [JC-04, JG-10]
programada: 2026-10-21
requisitos: [RF-SL-67, RN-48, RNF-13]
pantallas: [picking.js › montarFacturacion]
---

# JC-05 · Facturación: dos facturadores a la vez y tiempo real

**Responsable:** José Daniel Cifuentes · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mié 21/10 · **Depende de:** JC-04, JG-10

## Objetivo
Que dos facturadores de la misma sede puedan trabajar al mismo tiempo sin pisarse: el servidor valida cada movimiento contra el estado guardado y Facturación recibe el mismo aviso en tiempo real que Bodega (specs/16, decisión 39; specs/06).

## Contexto que debes leer
- `specs/06` §"Lado izquierdo" (punto "Dos facturadores en la misma sede")
- `specs/16`: decisiones 39, 40 y 41
- `## Resultado` de JC-03, JC-04 y JG-10

## Qué hacer
1. Cada acción que mueve, ordena, elimina, cancela o envía pedidos facturados comprueba que estén donde el navegador cree que están (en el tablero o en la opción, con su posición). Si otro facturador ya los movió, envió o eliminó, rechaza el cambio con un mensaje emergente de error y la pantalla se actualiza. **El texto de ese mensaje no está en el prototipo ni en `specs/`:** propón uno y pídele a la persona que lo confirme con Jordin antes de integrar (protocolo §C); regístralo en `specs/06` y en `specs/18`.
2. Todas esas acciones llaman a `avisarCambio(sede)` después de guardar, y la pantalla de Facturación usa `useCambiosDeSede(sede)`.
3. Mientras se arrastra o se escribe la fecha o la hora, el refresco no interrumpe al usuario (se aplica al soltar o al salir del campo).

## Archivos que creas o modificas
- `src/modulos/envios/**`, `src/app/picking/facturacion/**`, `src/componentes/picking/facturacion/**` (modificar)
- `pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts` (crear)
- `pruebas-e2e/panel/usuarios.spec.ts` y `pruebas-e2e/picking/usuarios.spec.ts` (solo esperar el final de la animación antes de axe; autorización explícita de José Daniel en esta conversación, 21/10/2026)
- `pruebas-e2e/picking/evidencias/jc-05/**` (capturas y evidencia)

## Criterios de aceptación
1. **Decisión 39:** si `ejemplo.03` y `ejemplo.04` intentan mover el mismo pedido facturado, solo vale el primero; el segundo recibe el aviso y su pantalla se actualiza.
2. **RNF-13:** lo que un facturador hace aparece en la pantalla del otro en menos de 2 segundos.
3. Si uno envía una opción mientras el otro la está ordenando, el segundo no puede enviar nada duplicado.

## Pruebas obligatorias
- Integración de la validación contra el estado guardado (criterios 1 y 3)
- `pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts` con dos contextos de navegador (criterio 2)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts
```

## Fuera de alcance
- El servidor SSE (JG-10).

## Resultado

Implementado y verificado el 21/10/2026.

- Las operaciones de mover, ordenar, eliminar, cancelar y enviar comparan el estado que vio el facturador (ubicación, posición y fecha de modificación) con el guardado, bajo el bloqueo transaccional compartido de la sede. Una operación obsoleta se rechaza antes de escribir o registrar bitácora. Se conserva el bloqueo `FOR UPDATE` al enviar y el resultado `null` para el doble clic sobre una opción vacía.
- El aviso de conflicto fue confirmado por José Daniel con Jordin en esta conversación y quedó registrado en `specs/06` y `specs/18`.
- Las acciones publican con `avisarCambio(sedeId)` después de confirmar. El armazón ya mantiene `useCambiosDeSede`; no se abre otra suscripción. Facturación conserva la vista durante el arrastre, la edición de fecha/hora y sus guardados pendientes, y aplica los datos recibidos al terminar.
- Las confirmaciones conservan los pedidos que la persona vio al abrirlas. No pueden eliminar, cancelar ni enviar un conjunto incorporado posteriormente por otro facturador.

### Cómo usar lo creado

`consultarTableroFacturacion` y los pedidos de `consultarOpciones` devuelven `posicion` y `actualizadoEn` (texto ISO). `estadoDePedidos(pedidos)` desde `src/modulos/envios/estado-pedidos.ts` obtiene el estado mínimo para las acciones:

- Movimiento: añadir `estadoOrigen` y `estadoDestino`, con todos los pedidos de ambas zonas en orden visible.
- Cancelar o enviar: añadir `estadoEsperado`, con los pedidos de la opción al abrir la confirmación.
- Eliminar: añadir `estadoEsperado`, con los pedidos seleccionados en el orden del tablero.

Los estados son obligatorios y se validan con Zod. El contrato completo está en `src/modulos/envios/README.md`. Los envíos, sus líneas, entregas e historial conservan las interfaces de JC-04 para Bodega, Ruta y Reportes.

### Verificación y alcance autorizado

`npm run verificar`: formato, lint, tipos y **310 pruebas en 34 archivos**, aprobados. `npm run build`: aprobado. E2E de dos facturadores en los tres tamaños, incluyendo borradores de fecha/hora, aviso, arrastre y envío, aprobados dentro de la batería completa: **207 pruebas**, con axe y sin omisiones. Latencias, capturas comparativas y revisión independiente LISTO: `pruebas-e2e/picking/evidencias/jc-05/README.md`.

José Daniel autorizó explícitamente en esta conversación (21/10/2026) añadir únicamente la espera del final de la animación antes de axe en `pruebas-e2e/panel/usuarios.spec.ts` y `pruebas-e2e/picking/usuarios.spec.ts`, archivos de Carlos. Se conservan todas las aserciones y reglas de accesibilidad. Los seis casos afectados pasaron tras el ajuste y en la batería completa. No se agregaron dependencias ni cambios de esquema o migraciones.
