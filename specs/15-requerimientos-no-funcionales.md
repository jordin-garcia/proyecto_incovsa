# 15. Requerimientos no funcionales

| Código | Categoría | Requerimiento | Estado |
|---|---|---|---|
| RNF-01 | Usabilidad | Interfaz responsiva en escritorio, tableta y teléfono | Vigente |
| RNF-02 | Usabilidad | Bodega se lee bien proyectado en una TV y se usa con facilidad en tableta: cantidades y productos bien visibles, estados claros, pocos pasos | Vigente |
| RNF-03 | Seguridad | Contraseñas guardadas con un algoritmo de cifrado unidireccional, nunca en texto plano | Vigente |
| RNF-04 | Seguridad | Todas las rutas del panel, de la documentación interna y del picking están protegidas. Cada usuario solo entra a los módulos de su rol y ve los datos de su sede | Vigente |
| RNF-05 | Seguridad | Toda entrada de formulario se valida en el navegador y en el servidor | Vigente |
| RNF-06 | Integridad | Toda operación que cambia existencias es transaccional: envío de pedido, compra, ajuste, traslado y devolución. Nunca queda aplicada a medias | Modificado (ya no solo el descuento del pedido) |
| RNF-07 | Mantenibilidad | Escalable y modificable por un desarrollador externo, con estructura y convenciones documentadas | Vigente |
| RNF-08 | Accesibilidad | Contraste, etiquetas en formularios y textos alternativos en imágenes | Vigente |
| RNF-09 | Respaldo | Procedimiento documentado y probado de respaldo y restauración de la base de datos, los PDF del servidor y la configuración. Las imágenes están en R2 | Modificado |
| RNF-10 | Privacidad | El repositorio no contiene credenciales, claves, datos reales de producción ni datos personales | Vigente |
| RNF-11 | Compatibilidad | Funciona en los navegadores de uso corriente en los equipos de la empresa. Cuáles son, está pendiente (P-38) | Vigente |
| RNF-12 | Disponibilidad | Se despliega bajo el dominio de la empresa con HTTPS | Vigente |
| RNF-13 | Tiempo real | En Bodega, el marcado de filas y el orden de prioridad se ven **al instante** en todas las pantallas de la sede, sin recargar | Nuevo |
| RNF-14 | Usabilidad | Ruta se usa con comodidad en teléfono y tableta | Nuevo |

La contraparte confirmó que la empresa no tiene limitaciones de equipo, conexión ni presupuesto, y que puede comprar tabletas y televisores para las proyecciones.
