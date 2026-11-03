# Registro de carga y control de peso

## Monitoreo de capacidad vehicular y prevención de sobrepeso

### Objetivo
Capacitar a los facturadores y coordinadores de despacho en el control preventivo de la carga asignada a los camiones institucionales, asegurando el cumplimiento de los límites mecánicos de cada vehículo y la normativa vial vigente en el país.

### Requisitos previos
- Disponer de acceso al módulo de Facturación.
- Contar con la flota de camiones de la sede debidamente registrada en el módulo de Configuración.

### El mecanismo de control de peso preventivo

En el modelo logístico de INCOVSA, la prevención de sobrecargas se realiza directamente durante el armado de la ruta en la pantalla de Facturación (véase la {{fig:control-peso-camion}}):

1. **Capacidad máxima nominal:** cada camión registrado en la sede cuenta con un límite de carga útil expresado en kilogramos (por ejemplo, Quetzaltenango dispone habitualmente de dos camiones con capacidad de 3,400 kg y un camión con capacidad de 6,000 kg).
2. **Cálculo automático de la carga:** al seleccionar el vehículo en la lista desplegable de la opción «Envío por camión», el sistema calcula instantáneamente la sumatoria de kilogramos de todos los productos y pedidos incluidos en esa opción de envío.
3. **Barra gráfica de capacidad:** una barra visual dinámica muestra el porcentaje de ocupación del camión en tiempo real, indicando los kilogramos asignados frente a la capacidad total permitida (por ejemplo, `2,185.00 kg / 3,400.00 kg - 64% ocupado`).

![Control de capacidad y monitoreo de peso en la opción Envío por camión](figuras/figura-14-control-peso-camion.png){#fig:control-peso-camion}

### Gestión de alertas por sobrepeso

- **Carga dentro del límite (Estado Normal):** mientras el peso total de los pedidos no sobrepase la capacidad nominal del camión, la barra se mantendrá en tono verde institucional, indicando que el flete es seguro.
- **Detección de sobrepeso (Estado Crítico):** si la sumatoria de pedidos sobrepasa el límite del camión, la barra gráfica cambiará inmediatamente a color rojo intenso y se mostrará una advertencia explícita de sobrepeso señalando el exceso de kilogramos.

### Procedimiento de corrección ante una alerta de sobrepeso

Si el sistema reporta que la ruta seleccionada excede el límite de carga del vehículo:

1. Revise los pedidos asignados a la tarjeta «Envío por camión».
2. Localice los pedidos facturados de mayor peso o aquellos con fecha programada más holgada.
3. Arrastre los pedidos sobrantes de regreso al tablero izquierdo de pedidos facturados, o presione la opción de devolver pedido.
4. Observe cómo la barra de peso recalcula el total acumulado hasta regresar a la zona segura permitida.
5. De forma alternativa, si dispone de un vehículo de mayor porte en la sede (por ejemplo, el camión de 6,000 kg), seleccione ese camión en la lista desplegable para absorber la totalidad de la carga sin dividir la ruta.

### Simplificación aprobada de la carga física (P-45)

Conforme a las aprobaciones emitidas por la contraparte institucional y la docencia del curso (P-45), el sistema **no requiere un paso redundante de confirmación de carga en báscula** por parte del personal de bodega. El control riguroso ejercido en el armado de la ruta garantiza la legalidad de la carga, agilizando el flujo físico en las rampas de despacho.

### Resultado esperado
Los vehículos de transporte parten hacia sus rutas de entrega con cargas balanceadas y seguras, previniendo accidentes mecánicos, multas de transporte pesado y deterioro prematuro de los neumáticos y suspensiones de la flota.

> **Advertencia:** Jamás despache una ruta que mantenga la alerta de sobrepeso activa en color rojo. Distribuya la mercancía en múltiples viajes o asigne un camión con la capacidad técnica requerida.

