# Evidencia de JC-04

Capturas de aplicación y prototipo aprobado, con el archivo anonimizado de Odoo, en 390 × 844, 768 × 1024 y 1440 × 900. Se usan cuentas y datos de demostración; el correlativo puede diferir porque cada entorno conserva su propio historial del día.

| Estado | Teléfono | Tableta | Escritorio |
| --- | --- | --- | --- |
| Opción vacía | [Aplicación](aplicacion-vacio-390.png) · [Prototipo](prototipo-vacio-390.png) | [Aplicación](aplicacion-vacio-768.png) · [Prototipo](prototipo-vacio-768.png) | [Aplicación](aplicacion-vacio-1440.png) · [Prototipo](prototipo-vacio-1440.png) |
| Datos, campos guardados y sobrepeso | [Aplicación](aplicacion-sobrepeso-390.png) · [Prototipo](prototipo-sobrepeso-390.png) | [Aplicación](aplicacion-sobrepeso-768.png) · [Prototipo](prototipo-sobrepeso-768.png) | [Aplicación](aplicacion-sobrepeso-1440.png) · [Prototipo](prototipo-sobrepeso-1440.png) |
| Fecha inválida | [Aplicación](aplicacion-fecha-invalida-390.png) · [Prototipo](prototipo-fecha-invalida-390.png) | [Aplicación](aplicacion-fecha-invalida-768.png) · [Prototipo](prototipo-fecha-invalida-768.png) | [Aplicación](aplicacion-fecha-invalida-1440.png) · [Prototipo](prototipo-fecha-invalida-1440.png) |
| Confirmación de cancelación | [Aplicación](aplicacion-cancelar-390.png) · [Prototipo](prototipo-cancelar-390.png) | [Aplicación](aplicacion-cancelar-768.png) · [Prototipo](prototipo-cancelar-768.png) | [Aplicación](aplicacion-cancelar-1440.png) · [Prototipo](prototipo-cancelar-1440.png) |
| Confirmación de envío | [Aplicación](aplicacion-confirmacion-390.png) · [Prototipo](prototipo-confirmacion-390.png) | [Aplicación](aplicacion-confirmacion-768.png) · [Prototipo](prototipo-confirmacion-768.png) | [Aplicación](aplicacion-confirmacion-1440.png) · [Prototipo](prototipo-confirmacion-1440.png) |
| Envío creado y opción vacía | [Aplicación](aplicacion-enviado-390.png) · [Prototipo](prototipo-enviado-390.png) | [Aplicación](aplicacion-enviado-768.png) · [Prototipo](prototipo-enviado-768.png) | [Aplicación](aplicacion-enviado-1440.png) · [Prototipo](prototipo-enviado-1440.png) |

La comparación cubre textos, orden, campos, estados, colores y acciones. Se usan `CampoFecha`, `CampoHora`, `Medidor` y `VentanaConfirmacion` del design system. La aplicación muestra el mensaje del formato esperado junto a la fecha inválida según specs/06; el prototipo lo presenta como ayuda del campo. No incluye el botón de demostración del prototipo.

La prueba `pruebas-e2e/picking/facturacion-envio.spec.ts` recorre los tres tamaños sin omitir proyectos. Verifica selección y arrastre múltiple, mouse, toque corto y pulsación larga real, teclado, reordenamiento persistente, movimiento entre opciones y regreso al tablero, rechazo de soltar fuera de una zona, campos obligatorios y persistencia, alerta de sobrepeso sin bloqueo y creación del envío. Incluye axe sin desactivar reglas. Sus tres proyectos se coordinan con un bloqueo propio de prueba y cada uno limpia únicamente el envío que creó.
