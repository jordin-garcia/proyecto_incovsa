# Comparación visual de JM-03 · Bodega

Referencia: `entregable-1/prototipos/simulacion/src/picking.js` (`renderBodega`, `renderDetalleRutaModal`, `marcarFilaBodega`, `despacharEnvio`, `ordenarPorPeso`) y `estilos.css` (`.tarjeta.ped`, `.ped-cab`, `.ped-num`, `.ped-meta`, `.ped-avance`, `.ped-herr`, `.ped-tabla`, `.modal`). Tamaños: teléfono 390 × 844, tableta 768 × 1024 y escritorio 1440 × 900.

## Pantallas por dispositivo

Se comparan visualmente las capturas tomadas de forma automatizada por `capturar.mjs` para verificar fidelidad al prototipo: estructura, orden de columnas, textos, insignias, botones, avance de preparación y tablas de pedidos facturados.

| Pantalla | Aplicación (390 / 768 / 1440) | Prototipo (390 / 768 / 1440) |
|---|---|---|
| Tablero de Bodega (cola de preparación) | [390](capturas/aplicacion-bodega-390.png) · [768](capturas/aplicacion-bodega-768.png) · [1440](capturas/aplicacion-bodega-1440.png) | [390](capturas/prototipo-bodega-390.png) · [768](capturas/prototipo-bodega-768.png) · [1440](capturas/prototipo-bodega-1440.png) |
| Modal Detalle de Ruta | [390](capturas/aplicacion-bodega-modal-390.png) · [768](capturas/aplicacion-bodega-modal-768.png) · [1440](capturas/aplicacion-bodega-modal-1440.png) | [390](capturas/prototipo-bodega-modal-390.png) · [768](capturas/prototipo-bodega-modal-768.png) · [1440](capturas/prototipo-bodega-modal-1440.png) |

## Verificaciones visuales

1. **Cuadro de identificación**: fondo azul para rutas (`RUTA 1`) y naranja suave para pedidos individuales (`recoge`).
2. **Metadatos del envío**: fecha y hora programada, camión asignado, piloto, cantidad de clientes agregados y total en kg.
3. **Barra de medidor**: muestra avance "X de Y" con relleno progresivo.
4. **Herramientas de cabecera**: botones "Detalle de Ruta", "Ordenar por peso" y "Marcar todo" / "Desmarcar todo".
5. **Filas de preparación**: lote resaltado en fondo claro monoespaciado, desglose de unidades ("1 unidad + 15 kg ÷ 25"), y botón de marca con estado visual activo (`.marca.on` con check verde).
6. **Modal de Detalle**: agrupa pedidos facturados del archivo de Odoo, listando número Odoo, referencia, cliente y sector.
7. **Modal de Confirmación de Despacho**: solicita confirmación explícita antes de pasar a "En Ruta" / "Despachado".

## Diferencias previstas

- En la aplicación, los datos se leen del backend en PostgreSQL con autenticación real Better Auth (usuario `ejemplo.05`, sede Quetzaltenango), mientras que en el prototipo los datos se generaban en memoria desde `simulacion/src/datos.js`.
- La persistencia de marcas, ordenamiento por peso y despacho se ejecutan mediante Server Actions validadas con Zod y notificadas a través de `avisarCambio(sedeId)`.
