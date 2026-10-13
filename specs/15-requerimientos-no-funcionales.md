# 15. Requerimientos no funcionales

| Código | Categoría | Requerimiento | Estado |
|---|---|---|---|
| RNF-01 | Usabilidad | Interfaz responsiva en escritorio, tableta y teléfono. La contraparte lo reiteró el 29/09 para el sitio | Vigente |
| RNF-02 | Usabilidad | Bodega se lee bien proyectado en una TV y se usa con facilidad en tableta: cantidades y productos bien visibles, estados claros, pocos pasos. Debe cumplirse en modo claro y en modo oscuro (29/09) | Vigente |
| RNF-03 | Seguridad | Contraseñas guardadas con un algoritmo de cifrado unidireccional, nunca en texto plano | Vigente |
| RNF-04 | Seguridad | Todas las rutas del panel, de la documentación interna y del picking están protegidas. Cada usuario solo entra a los módulos y hace las acciones que permiten **sus permisos** (29/09), y ve los datos de las sedes que tiene asignadas (11/10). **(12/10)** Los permisos y la sede se verifican **en el servidor en cada operación**, no solo al entrar a una página ([16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md), "Seguridad") | Modificado |
| RNF-05 | Seguridad | Toda entrada de formulario se valida en el navegador y en el servidor. Incluye el archivo .xlsx de Odoo, que se valida en el servidor antes de mostrar sus líneas (29/09). **(12/10)** Los archivos subidos (.xlsx, imágenes y PDF) se validan por su contenido, no solo por la extensión | Modificado |
| RNF-06 | Integridad | El envío de un pedido a bodega es transaccional: el pedido, sus líneas, su estado y su ruta se guardan completos o no se guardan. Desde el 29/09 ya no hay operaciones de existencias | Modificado |
| RNF-07 | Mantenibilidad | Escalable y modificable por un desarrollador externo, con estructura y convenciones documentadas | Vigente |
| RNF-08 | Accesibilidad | Contraste, etiquetas en formularios y textos alternativos en imágenes | Vigente |
| RNF-09 | Respaldo | Procedimiento documentado y probado de respaldo y restauración de la base de datos, los PDF del servidor y la configuración. Las imágenes están en R2. **(12/10)** Los respaldos son automáticos | Modificado |
| RNF-10 | Privacidad | El repositorio no contiene credenciales, claves, datos reales de producción ni datos personales | Vigente |
| RNF-11 | Compatibilidad | Funciona en los navegadores de uso corriente en los equipos de la empresa. Cuáles son, está pendiente (P-38) | Vigente |
| RNF-12 | Disponibilidad | Se despliega bajo el dominio de la empresa con HTTPS | Vigente |
| RNF-13 | Tiempo real | En Bodega, el marcado de filas y el orden de prioridad se ven **al instante** en todas las pantallas de la sede, sin recargar | Nuevo |
| RNF-14 | Usabilidad | Ruta se usa con comodidad en teléfono y tableta | Nuevo |
| RNF-15 | Seguridad | **(12/10)** Los intentos de inicio de sesión se limitan: después de varios intentos fallidos seguidos, se bloquea temporalmente el acceso. El mensaje de error no revela si el usuario existe | Nuevo |
| RNF-16 | Seguridad | **(12/10)** La aplicación envía cabeceras de seguridad (Content-Security-Policy, HSTS, nosniff, Referrer-Policy y protección contra inserción en marcos) y mantiene sus dependencias al día con los parches de seguridad, revisadas en cada pull request | Nuevo |

La contraparte confirmó que la empresa no tiene limitaciones de equipo, conexión ni presupuesto, y que puede comprar tabletas y televisores para las proyecciones.
