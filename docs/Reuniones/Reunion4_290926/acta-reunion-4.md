# Acta de reunión No. 4

| Dato | Detalle |
|---|---|
| Fecha | Martes 29 de septiembre de 2026 |
| Horario previsto | 6:00 a 7:30 p. m. |
| Hora de inicio y de cierre | 6:00 a 8:00 p. m. |
| Modalidad | Virtual, por Google Meet |
| Participantes por el equipo | Jordin García, Carlos Hugo Escobar, Daniela Marín, José Daniel Cifuentes y Josué Menéndez |
| Participantes por INCOVSA | Ing. William Ambrossio |
| Responsable de las notas | Daniela Marín |

## Temas tratados

- Revisión del sitio web: estructura general, secciones y navegación.
- Panel de control y gestión de usuarios: roles, accesos y permisos.
- Administración del sitio: catálogo y documentación interna.
- Sistema de picking: alcance del inventario, Facturación, Bodega, Reportes e interfaz.

## Cambios solicitados

**Sitio web.**

- El diseño se adapta a teléfono y escritorio.
- Se validan las industrias y las proporciones y tamaños de las imágenes de los productos.
- Se aprueban las secciones Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto.
- Inicio es informativo. Se elimina la sección «Catálogo informativo». La sección de presencia incluye el enlace a la ubicación de cada bodega en Google Maps. La misión y la visión son las imágenes proporcionadas, centradas, una debajo de la otra. Las imágenes tienen una animación de aparición y desaparición.
- El pie de página va solo en Inicio, Quiénes somos, Noticias y Contacto, con el mismo logotipo de la cabecera. El logotipo «Transformamos INCOVSA» es solo de uso interno. Industrias y Productos no llevan pie de página.
- Quiénes somos: imágenes de misión y visión con animación, a media pantalla. Cada dato del bloque admite una imagen desde la administración del sitio. Banner principal con transición entre los logotipos de INCOVSA e Inquiserca. El logotipo de Inquiserca está pendiente de recibirse.
- Industrias: no se muestran imágenes de productos. Cada industria muestra su descripción, una imagen, que se sube desde la administración del sitio, y sus productos en texto.
- Productos: la búsqueda actual queda aprobada. Se agrega abajo una sección de productos recomendados, relacionados con el producto que se está viendo.
- Noticias: cada noticia tiene fotografía, título y texto, y se administra desde la administración del sitio.
- Contacto: teléfono con código de área por país, validación de la estructura del correo y del teléfono, y campos de país, departamento o estado y municipio o ciudad.
- Solicitudes: se dividen por motivo (solicitud, queja y reclamo). Cada solicitud tiene un responsable, un comentario del responsable y los botones de estado Asignado, En proceso y Solucionado.

**Panel de control y gestión de usuarios.**

- El acceso depende de los permisos asignados a cada usuario, no de su rol. Los permisos y los módulos se marcan con casillas. Se pueden agregar, editar o revocar permisos puntuales y eliminar usuarios.
- El rol es un campo del usuario que deciden Gerencia o Soporte. Los únicos roles predeterminados son Gerencia y Soporte, los dos con acceso total al picking y a la administración del sitio.
- La bitácora registra todas las acciones de cada usuario para la auditoría. No se muestra en la interfaz.

**Administración del sitio.**

- Catálogo: cada producto admite una imagen y se puede eliminar. Al crear un producto, los únicos campos adicionales son el origen y la presentación.
- Documentación interna: se busca por lote, nombre y país de origen del producto. Al subir un documento se ingresan el nombre del producto, el país de origen y el lote, que solo admite números.

**Sistema de picking.**

- El control de inventario (existencias, entradas y salidas) queda fuera del alcance. El sistema está pensado para integrarse en el futuro con el ERP Odoo de la empresa, que es el que lleva el inventario de todas las bodegas.
- Facturación: los pedidos ya no se ingresan a mano. Se carga un archivo .xlsx con la estructura del archivo de ejemplo «Data Odoo para Picking». Las filas sin referencia ni contacto pertenecen al pedido de arriba. De la columna Referencia (por ejemplo, XE-IN/SALIDA/03539) solo se toma el número de pedido. Contacto es el cliente, «Movimientos de stock/Producto» es el producto y «Movimientos de stock/Cantidad hecha» es la cantidad en kilogramos. La columna del peso no se usa, porque en algunos productos viene en cero: se siguen usando los pesos de conversión actuales.
- Bodega: el tablero en pantalla completa ofrece «Modo claro» y «Modo oscuro» en lugar de TV y Tableta. El modo claro se ve como el modo Tableta actual y el modo oscuro usa negros y grises.
- Reportes: filtros de los pedidos despachados por día, semana, mes, año y rango de fechas.
- Interfaz: el menú lateral izquierdo se puede contraer para ampliar el área de trabajo.
