# Pruebas funcionales

Las pruebas funcionales verifican las principales funciones de los dos sistemas: el sitio web con su panel administrativo y el sistema de picking. Se hicieron en dos niveles:

- **De integración (Vitest con PostgreSQL):** llaman a cada operación del servidor con una sesión de prueba y comprueban lo que queda guardado en la base de datos.
- **De extremo a extremo (Playwright):** usan la aplicación en un navegador real, con los usuarios de demostración, en teléfono, tableta y escritorio.

## Sistema de picking

Tabla: Pruebas funcionales del sistema de picking {#tab:funcionales-picking}

| Módulo | Función | Casos | Resultado |
|---|---|---|---|
| Facturación | Cargar el archivo de Odoo, con el resumen de pedidos cargados y no cargados | CP-22 a CP-29 | Aprobado |
| Facturación | Seleccionar, mover, ordenar y eliminar pedidos facturados en el tablero; conservar el orden al recargar | CP-30, CP-31, CP-61 | Aprobado |
| Facturación | Elegir camión, piloto, fecha y hora programadas; alerta de sobrepeso; enviar a Bodega con la numeración diaria por sede | CP-32 a CP-35, CP-60, CP-68 | Aprobado; CP-32 en parte |
| Facturación | Dos facturadores trabajando al mismo tiempo en la misma sede | CP-108 | Aprobado |
| Bodega | Ver rutas y pedidos En Preparación, con la conversión agrupada por producto, lote y Peso de Conversión | CP-19, CP-36 | Aprobado |
| Bodega | Marcar líneas, «Marcar todo», ordenar por peso y despachar; sincronización entre pantallas | CP-37 a CP-39 | Aprobado |
| Bodega | Tablero en pantalla completa: dos columnas, modo claro u oscuro, ocupación del camión y despacho desde la TV | CP-40, CP-71 a CP-73 | Aprobado |
| Ruta | Ver las rutas del piloto, reordenar los clientes y marcar «Ruta Entregada» | CP-41, CP-84 | Aprobado |
| Reportes | Despacho, Rutas realizadas y Bitácora, con filtros por periodo; exportación a Excel y PDF | CP-41, CP-64, CP-69, CP-70, CP-104 | Aprobado; CP-64 en parte |
| Configuración | Camiones: crear, editar y eliminar, sin afectar las rutas que ya los usan | CP-65, CP-66 | Aprobado |
| Configuración | Usuarios del picking, con sus permisos y sedes | CP-67, CP-74, CP-83 | Aprobado |

## Sitio web y panel administrativo

Tabla: Pruebas funcionales del sitio web y del panel {#tab:funcionales-sitio}

| Área | Función | Casos | Resultado |
|---|---|---|---|
| Contenido institucional | Editar la misión, la visión y los valores con sus imágenes, y las imágenes de la portada | CP-51 a CP-53 | Aprobado; CP-51 en parte |
| Noticias | Crear, editar y eliminar noticias con imágenes | CP-62, CP-75 | Aprobado |
| Industrias y catálogo | Editar industrias y productos públicos; productos recomendados; búsqueda y filtro en Productos | CP-54, CP-55, CP-76, CP-77 | Aprobado |
| Documentación interna | Registrar productos documentados con sus enlaces de Google Drive; ver o descargar según el permiso | CP-56, CP-57, CP-78 | Aprobado |
| Contacto | Enviar el formulario de contacto; recibirlo en la bandeja con el indicador de solicitudes nuevas; comentarlo | CP-58, CP-59, CP-63 | Aprobado |
| Acceso personal | Elegir el sistema y entrar con la contraseña de cada uno; cerrar sesión | CP-45, CP-46, CP-50 | Aprobado |
| Todo el sitio | Banners de la misma altura y ningún texto de ejemplo del prototipo | CP-79 | Aprobado |

## Persistencia y concurrencia

Además de cada función, se verificó que:

- todo lo que se guarda se conserva después de recargar la página (CP-31 y CP-60);
- las operaciones de varios pasos se hacen en una sola transacción, de modo que, si algo falla, no se guarda nada a medias (CP-35);
- dos personas que trabajan al mismo tiempo no duplican ni pierden datos (CP-108).

## Resultado

Las 509 pruebas de Vitest pasan en la CI y en el equipo del coordinador (EV-01 y EV-08). MATRIZ_FUNCIONALES

Ninguna función principal falla. Tres casos se comprueban en parte (CP-32, CP-51 y CP-64). Las diferencias funcionales y visuales que encontraron las auditorías se corrigieron (sección 13).
