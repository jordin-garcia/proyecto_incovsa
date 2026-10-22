# JC-05 · Dos facturadores en la misma sede

Verificación del 21/10/2026, con datos y bases locales desechables. Cuentas `ejemplo.03` y `ejemplo.04`, en contextos de navegador independientes. No se usaron datos de INCOVSA.

## Cobertura

- Movimiento simultáneo del mismo pedido: uno se guarda; el otro recibe el aviso confirmado y actualiza su pantalla.
- Reordenamiento con posiciones antiguas, eliminación obsoleta y pedido que sale y regresa a la misma posición.
- Cancelación con pedidos agregados posteriormente y envío obsoleto después de reutilizar una opción.
- Envío mientras el segundo facturador ordena: un único envío, sin cambiar los pedidos confirmados.
- Entradas sin el estado del navegador rechazadas por Zod y permisos/sedes conservados.
- Actualización remota en menos de 2 segundos desde `avisarCambio` hasta el DOM, con el artefacto de producción.
- Conservación del arrastre y de borradores incompletos de fecha y hora. Al terminar se aplica el último contenido recibido.
- Axe sin violaciones serias ni críticas en los tres tamaños.

## Capturas comparativas

Se conservaron textos, orden, estados y tokens del prototipo. Las diferencias de componentes accesibles ya existían en JC-04; el botón «Demostración» es exclusivo del prototipo. Se esperó a terminar la transición del menú antes de capturar.

| Tamaño | Aplicación | Prototipo |
| --- | --- | --- |
| 390 px | [Aplicación](aplicacion-390.png) | [Prototipo](prototipo-390.png) |
| 768 px | [Aplicación](aplicacion-768.png) | [Prototipo](prototipo-768.png) |
| 1440 px | [Aplicación](aplicacion-1440.png) | [Prototipo](prototipo-1440.png) |

| Estado | Teléfono | Tableta | Escritorio |
| --- | --- | --- | --- |
| Conflicto de movimiento | [Captura](conflicto-telefono.png) | [Captura](conflicto-tableta.png) | [Captura](conflicto-escritorio.png) |
| Después del envío | [Captura](final-telefono.png) | [Captura](final-tableta.png) | [Captura](final-escritorio.png) |

## Verificación

- Fase roja: ocho pruebas de concurrencia fallaron antes de implementar las comprobaciones, por permitir operaciones obsoletas o usar el aviso anterior.
- `npm ci`: instalación y generación de Prisma aprobadas, 0 vulnerabilidades.
- Migraciones y semillas: aplicadas a bases desechables; sin cambios de esquema ni dependencias.
- `npm run verificar`: formato, lint, tipos y **310 pruebas en 34 archivos**, aprobados.
- `npm run build`: compilación de producción aprobada.
- E2E dirigido de JC-05: **3 aprobados**, en teléfono, tableta y escritorio.
- Batería completa en secuencia (`npm run e2e -- --workers=1`): **201 aprobados y 6 fallidos**. Los seis fallos son los mismos dos casos de accesibilidad de altas de usuarios, repetidos en los tres tamaños; falta autorización para ajustar los archivos ajenos. JC-05 pasó en los tres tamaños, con fecha y hora.
- `node scripts/tareas.mjs --validar`: 63 tareas válidas.
- Next.js, `get_errors`: `configErrors: []`, `sessionErrors: []`.
- [Revisión independiente](revision.md): LISTO, sin hallazgos de corrección.

La primera batería completa, con dos trabajadores, detectó comprobaciones transitorias ajenas a Facturación (título de Ruta y contraste durante la apertura de altas de usuarios). También detectó una precondición incompleta en el nuevo E2E: antes de cronometrar, el navegador que actúa debe haber aplicado su movimiento anterior. Se agregó esa espera explícita, sin cambiar el límite de latencia, las aserciones ni las verificaciones de accesibilidad. La repetición en secuencia confirmó los fallos de las altas de usuarios. No se modificaron esos archivos; se preparó un ajuste que espera la animación, pendiente de autorización según protocolo §C.

## Latencias de JC-05

Desde la publicación hasta el DOM del otro facturador, con el artefacto de producción:

- Teléfono: [51 ms](latencia-telefono.json).
- Tableta: [63 ms](latencia-tableta.json).
- Escritorio: [58 ms](latencia-escritorio.json).

Todos conservan el límite de menos de 2000 ms. El transporte es el del armazón; no hay una conexión adicional en Facturación.

## Continuación pendiente

La tarea conserva `estado: pendiente` y no se abrió un PR de cierre ni se integró. Espera autorización de José Daniel para añadir únicamente la espera de `elemento.getAnimations().map(animacion => animacion.finished)` antes de axe en `pruebas-e2e/panel/usuarios.spec.ts` y `pruebas-e2e/picking/usuarios.spec.ts` (propiedad de Carlos). El cambio propuesto está en `/tmp/jc05-esperas-usuarios.patch`; todas las aserciones se conservan.

Tras obtener autorización: aplicar el ajuste, registrar la excepción en la tarea y bitácora, volver a verificar los casos afectados y la batería completa, completar la revisión del cierre, marcar hecha y abrir/integrar el PR por el procedimiento habitual.
