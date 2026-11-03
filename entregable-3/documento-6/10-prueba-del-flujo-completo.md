# Prueba del flujo completo de picking y despacho

Los lineamientos exigen una prueba integral del flujo:

> pedido facturado → conversión de kg a unidades → generación del picking → preparación → actualización de inventario → carga → despacho → actualización de estado → reporte

La prueba debe demostrar que el flujo funciona según las reglas reales de INCOVSA.

## Cómo se hizo

La prueba integral es `pruebas-e2e/flujo/flujo-completo.spec.ts` (tarea JG-14):

- Recorre el flujo completo en un navegador real con Playwright, con el servidor de producción (el mismo de la imagen de Docker que se despliega) y PostgreSQL 18.
- Se ejecuta en teléfono, tableta y escritorio.
- En cada paso comprueba la pantalla y, además, lo que quedó guardado en la base de datos.
- Usa la copia anonimizada del archivo de Odoo que entregó INCOVSA y cuatro usuarios de demostración, cada uno con el perfil que hace ese paso en la empresa:
    - facturador (ejemplo.03);
    - Bodega (ejemplo.05);
    - piloto (ejemplo.06);
    - Gerencia (ejemplo.01).
- GitHub Actions la ejecuta **todos los días a las 06:00** y en cada cambio que toca el flujo. Si falla, avisa en el tablero del plan.

## Pasos y resultados

Tabla: Pasos de la prueba integral del flujo {#tab:flujo-pasos}

| Paso del lineamiento | Qué hace la prueba | Qué comprueba | Resultado |
|---|---|---|---|
| Pedido facturado | El facturador carga el archivo de Odoo en Facturación | El resumen dice 33 pedidos cargados y 46 no cargados por traer el Peso de Conversión en 0 (RN-50); en la base quedan 33 | Aprobado |
| Carga (armado del envío) | Mueve con el teclado 3 pedidos de clientes distintos a «Envío por camión», con el Camión 1, el piloto ejemplo.06, la fecha de hoy y la hora «1430»; y otro pedido a «Cliente recoge en bodega» | La confirmación dice «Se crea la Ruta 1 de hoy…» y después crea el Pedido 1 (RN-52). En la base, la ruta queda En Preparación, con su número, su historial, sus líneas, sus 3 entregas y su registro en la bitácora, todo en una sola transacción (RNF-06) | Aprobado |
| Conversión de kg a unidades y generación del picking | Bodega abre la Ruta 1 y el Pedido 1 | Muestra «Programada dd/mm/aaaa · 14:30». Para una línea con lote, los kg y el texto «N unidades + R kg» coinciden con una conversión calculada aparte en gramos enteros (RN-01) | Aprobado |
| Preparación | Bodega pulsa «Marcar todo» | El avance dice «N de N» y «Todo listo…», y se habilita el botón de despacho | Aprobado |
| Despacho y actualización de estado | Bodega pulsa «Ruta Despachada» y «Pedido Despachado» | La ruta pasa a En Ruta y el pedido a Despachado; el historial y el aviso coinciden; salen de Bodega (RN-11) | Aprobado |
| Entrega | El piloto reordena con el teclado el primer y el segundo cliente y pulsa «Ruta Entregada» | El recorrido queda guardado en el orden del piloto; la ruta queda Entregada, con el historial En Preparación → En Ruta → Entregado (RN-29) | Aprobado |
| Reporte | Gerencia abre Reportes | Despacho diario: los indicadores (kg, unidades, kg sueltos, «1 rutas · 1 pedidos», rutas entregadas) y el pie de la tabla coinciden con la suma calculada. Rutas realizadas: la Ruta 1 con su camión, su piloto y su recorrido. Bitácora: las 6 operaciones en orden (carga, envío de la ruta, envío del pedido, 2 cambios de estado y cierre), en la pantalla y en la base | Aprobado |
| Actualización de inventario | No aplica | El sistema no lleva inventario; la exclusión la aprobó el docente el 16/10/2026 (P-58, sección 11) | No aplica |

Al terminar, la prueba borra los envíos y pedidos que creó; la bitácora se conserva.

## Resultado

- **Ejecución del 03/11/2026 sobre `develop`** (41698054254, *commit* 37a5c44): **3 de 3 aprobadas**, una por tamaño de pantalla, en 39.6 s, sin repeticiones (EV-03).
- Las ejecuciones diarias del 31/10 al 03/11/2026 también fueron exitosas.
- La primera ejecución, en el PR #142 de JG-14, también pasó 3 de 3 (40624973151).

Las capturas de cada paso, en los tres tamaños de pantalla, están en el Anexo G (EV-09).

La prueba demuestra que el flujo funciona según las reglas reales de INCOVSA:

- el archivo real de Odoo, anonimizado;
- los Pesos de Conversión que trae ese archivo;
- la numeración diaria por sede;
- los estados de la ruta y del pedido;
- los nombres de los botones que pidió la empresa.

**Aprobado**, con la excepción del inventario, que no aplica.
