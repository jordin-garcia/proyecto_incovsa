# Evidencia de JC-06 · Reportes

Verificación con datos ficticios en dos bases PostgreSQL locales desechables, independientes de la configuración del usuario. No se cambiaron dependencias, esquema ni migraciones.

## Capturas comparativas

Cada familia tiene imágenes para `telefono` (390 × 844), `tableta` (768 × 1024) y `escritorio` (1440 × 900).

| Estado | Aplicación | Prototipo |
|---|---|---|
| Despacho diario vacío | `app-despacho-diario-*.png` | `prototipo-despacho-*.png` |
| Fecha inexistente | `app-fecha-invalida-*.png` | `prototipo-fecha-invalida-*.png` |
| Semanal | `app-semanal-*.png` | `prototipo-semanal-*.png` |
| Mensual | `app-mensual-*.png` | `prototipo-mensual-*.png` |
| Anual | `app-anual-*.png` | `prototipo-anual-*.png` |
| Rango | `app-despacho-*.png` | `prototipo-rango-*.png` |
| Despacho con datos | `app-despacho-datos-*.png` | `prototipo-despacho-datos-*.png` |
| Rutas y recorrido final | `app-rutas-datos-*.png` | `prototipo-rutas-datos-*.png` |
| Bitácora | `app-bitacora-*.png` y `app-bitacora-datos-*.png` | `prototipo-bitacora-datos-*.png` |

Los datos y periodos de las dos aplicaciones son de demostración independientes; se contrastaron textos, estructura, orden, estados y colores. Se conserva el medidor verde incluso en el producto de mayor cantidad. El recorrido se muestra únicamente en rutas entregadas. Según specs/10, se excluyen de Rutas realizadas los envíos aún En Preparación, aunque el prototipo también los enumera.

RNF-08 prevalece sobre los grises de contraste insuficiente del prototipo: textos secundarios e indicadores usan `--g600`, aprobado por JG-05. Las tablas se pueden enfocar para desplazarlas con teclado en teléfono. Excel y PDF permanecen deshabilitados hasta JC-07.

Las capturas se toman después de la hidratación; así la ocultación temporal del cursor que realiza Playwright no modifica el HTML antes de que React lo hidrate.

## Cobertura

- Integración real: agrupación por producto y Peso de Conversión entre lotes, suma de Decimal y conversión RN-01, indicadores, entrega independiente del despacho, domingo 23:30, rango inclusivo, fecha calendario de envío, orden de rutas y recorrido, operaciones de ambos sistemas, marcado sin bitácora, aislamiento de sede y rechazo sin sesión/permiso.
- Navegador: tres tamaños, cinco periodos, Enter, desenfoque, calendario nativo, fecha inexistente conservando el periodo anterior, pestañas, conversiones con datos, rutas En Ruta/Entregado, recorrido final, exportación deshabilitada, ausencia de desbordamiento del documento y axe sin violaciones serias ni críticas.
- [Revisión independiente](revision.md): LISTO, sin hallazgos.
