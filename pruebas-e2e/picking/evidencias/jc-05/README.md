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
- Batería completa en secuencia (`npm run e2e -- --workers=1`): **207 aprobados**, sin fallos ni omisiones, incluyendo los tres casos de JC-05 y los seis de accesibilidad de altas de usuarios.
- `node scripts/tareas.mjs --validar`: 63 tareas válidas.
- Next.js, `get_errors`: `configErrors: []`, `sessionErrors: []`.
- [Revisión independiente](revision.md): LISTO, sin hallazgos de corrección.

Los casos de accesibilidad de altas de usuarios esperan el fin de la animación antes de medir el contraste. José Daniel autorizó explícitamente ese ajuste en los dos archivos de Carlos el 21/10/2026. Los seis casos afectados pasaron por separado y dentro de la batería completa. Se conservaron todas las aserciones y reglas de accesibilidad.

## Latencias de JC-05

Desde la publicación hasta el DOM del otro facturador, con el artefacto de producción:

- Teléfono: [47 ms](latencia-telefono.json).
- Tableta: [66 ms](latencia-tableta.json).
- Escritorio: [185 ms](latencia-escritorio.json).

Todos conservan el límite de menos de 2000 ms. El transporte es el del armazón; no hay una conexión adicional en Facturación.
