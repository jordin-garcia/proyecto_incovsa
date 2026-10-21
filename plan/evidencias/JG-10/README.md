# JG-10 · Tiempo real por sede

La comprobación usa datos anónimos de demostración y bases PostgreSQL desechables. La tarea cambia el transporte de avisos y el estado del indicador «En vivo»; conserva los textos y la estructura de las pantallas.

## Comparación visual

| Ancho | Prototipo | Aplicación conectada | Aplicación sin SSE |
|---|---|---|---|
| 390 px | [Bodega](prototipo-bodega-390.png) | Pendiente | Pendiente |
| 768 px | [Bodega](prototipo-bodega-768.png) | Pendiente | Pendiente |
| 1440 px | [Bodega](prototipo-bodega-1440.png) | Pendiente | Pendiente |

El estado conectado conserva los tokens del prototipo. Al perder SSE el indicador pasa a los grises existentes del design system, detiene el latido y mantiene el texto «En vivo», como pide JG-10. Las diferencias del contenido de las tarjetas se deben a los datos de prueba; no forman parte del cambio visual.

## Cobertura

- Publicación aislada por sede y respuesta mínima, sin datos de negocio.
- Autorización por sesión, permiso del módulo y sede; revalidación durante una conexión abierta.
- Latido cada 25 segundos y liberación al abortar, cancelar o detectar un consumidor lento.
- Conexión compartida por sede y módulo; un solo refresco por aviso.
- Consulta de respaldo cada 5000 ms, reconexión automática y actualización tras recuperar la conexión.
- Indicador conectado y desconectado; pestaña oculta, cambio de sede y desmontaje.
- Dos contextos reales de navegador: marcado remoto en menos de dos segundos y funcionamiento durante el corte de SSE.

Estado de la verificación: [avance y pendientes](verificacion.md). Revisión independiente: [primera pasada](revision.md). **La tarea sigue pendiente y no está integrada.**
