---
id: JC-05
titulo: "Facturación: dos facturadores a la vez y tiempo real"
persona: jose-daniel
responsable: José Daniel Cifuentes
hito: E3
prioridad: P1
estado: pendiente
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
