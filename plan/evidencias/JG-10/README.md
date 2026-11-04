# JG-10 · Tiempo real por sede

La comprobación usa datos anónimos de demostración y bases PostgreSQL desechables. La tarea cambia el transporte de avisos y el estado del indicador «En vivo»; conserva los textos y la estructura de las pantallas.

## Comparación visual

| Ancho | Prototipo | Aplicación conectada | Aplicación sin SSE |
|---|---|---|---|
| 390 px | [Bodega](prototipo-bodega-390.png) | [Conectada](aplicacion-bodega-conectada-390.png) | [Desconectada](aplicacion-bodega-desconectada-390.png) |
| 768 px | [Bodega](prototipo-bodega-768.png) | [Conectada](aplicacion-bodega-conectada-768.png) | [Desconectada](aplicacion-bodega-desconectada-768.png) |
| 1440 px | [Bodega](prototipo-bodega-1440.png) | [Conectada](aplicacion-bodega-conectada-1440.png) | [Desconectada](aplicacion-bodega-desconectada-1440.png) |

El estado conectado conserva los tokens y el texto del prototipo. Al perder SSE el indicador pasa a los grises existentes del design system, detiene el latido y mantiene el texto «En vivo», como pide JG-10. Las capturas de aplicación usan Bodega vacía; el marcado con datos se verifica en los dos navegadores del E2E. La diferencia preexistente del encabezado de Bodega está registrada para JM-04 en la bitácora de Jordin del 19/10 y queda fuera de este cambio de transporte e indicador.

También se recorrieron [Facturación](aplicacion-facturacion-1440.png) con la cuenta de ejemplo 03 y [Ruta](aplicacion-ruta-1440.png) con la 06. Ambas conectan SSE con su permiso. Ruta conserva la pantalla de conexión de JG-07 hasta que se implemente su módulo. Los flujos de Bodega y Facturación se ejercen además en la batería E2E completa.

next-devtools devolvió `configErrors: []` y `sessionErrors: []` tras el recorrido. No hubo errores de consola de la aplicación en la navegación normal. Los cortes de red generan los errores de transporte esperados. Se retiró una cabecera de prueba global que hacía fallar por CORS las peticiones inyectadas por el antivirus; no se modificó ni desactivó el antivirus.

## Cobertura

- Publicación aislada por sede y respuesta mínima, sin datos de negocio.
- Autorización por sesión, permiso del módulo y sede; revalidación durante una conexión abierta.
- Latido cada 25 segundos y liberación al abortar, cancelar o detectar un consumidor lento.
- Conexión compartida por sede y módulo; un solo refresco por aviso.
- Consulta de respaldo cada 5000 ms, reconexión automática y actualización tras recuperar la conexión.
- Indicador conectado y desconectado; pestaña oculta, cambio de sede y desmontaje.
- Dos contextos reales de navegador: marcado remoto en menos de dos segundos y funcionamiento durante el corte de SSE.

Verificación local: **302 pruebas de aplicación y 204 E2E aprobados**, junto con formato, lint, tipos y compilación. [Comandos y resultados](verificacion.md), [mediciones desde la publicación](latencias.json) y [revisión independiente](revision.md). Las verificaciones de GitHub y la integración constan en el PR de JG-10.
