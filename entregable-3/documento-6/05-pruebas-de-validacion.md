# Pruebas de validación

Los lineamientos piden comprobar los formularios, las cantidades, los archivos, los campos obligatorios y los datos incorrectos.

Toda entrada se valida **dos veces**:

- en el navegador, para que la persona vea el error al momento;
- en el servidor con Zod, porque la validación del navegador se puede saltar (RNF-05).

Las pruebas comprueban sobre todo la del servidor: llaman a las operaciones con datos inválidos, sin pasar por la pantalla.

Tabla: Pruebas de validación {#tab:pruebas-validacion}

| Tipo | Qué se probó | Casos | Resultado |
|---|---|---|---|
| Campos obligatorios | Envío por camión sin piloto, camión, fecha u hora; formulario de Contacto sin país o, con Guatemala, sin departamento y municipio; producto documentado sin lote; usuario sin nombre, rol o sede | CP-32, CP-58, CP-56, CP-85 | Aprobado; CP-32 en parte |
| Cantidades | Cantidad vacía, con texto, en 0 o negativa en el archivo de Odoo; capacidad de camión en 0, negativa, con texto o con más de 3 decimales; más de 3 decimales en la conversión | CP-27, CP-85, CP-102 | Aprobado |
| Peso de Conversión | En 0, vacío, negativo o con texto: el pedido facturado completo no se carga y el resumen indica el motivo | CP-21, CP-23, CP-102 | Aprobado |
| Fechas y horas | «20102026» y «1330» se normalizan; «31/02/2026» y «25:90» se rechazan en la pantalla y en el servidor | CP-60, CP-64 | Aprobado; CP-64 en parte |
| Archivos de Odoo | Archivo que no es .xlsx aunque tenga esa extensión; .xlsx de más de 2 MB; archivo de otra bodega, con un prefijo desconocido o con dos bodegas; .xlsx manipulado (bomba ZIP, más de 20 000 filas) | CP-28, CP-29, CP-98 | Aprobado |
| Imágenes | SVG, GIF, texto renombrado como .jpg, archivo de más de 5 MB, sexta imagen de una galería | CP-52, CP-97 | Aprobado |
| Enlaces | Enlaces de documentos que no son de Google Drive | CP-56 | Aprobado |
| Topes de texto | Más de 10 000 caracteres en los textos del panel; más de 2000 en el comentario de una solicitud; textos de Contacto más largos que su tope; correo mal formado | CP-86, CP-89 a CP-91 | Aprobado; CP-89 en parte: en WebKit no aparece el aviso al salir del campo, aunque el servidor sí rechaza el texto (INC-47) |
| Contraseñas | Contraseña de menos de 8 caracteres | CP-48 | Aprobado |
| Contraseñas | Contraseñas comunes o con el nombre de la empresa | CP-111 | Pendiente (CE-14) |
| Envíos repetidos | Más de 5 envíos de Contacto por hora desde la misma dirección IP; campo trampa lleno por un robot | CP-87, CP-88 | Aprobado |
| Datos duplicados | Producto documentado duplicado, también al guardarlo dos veces al mismo tiempo; líneas repetidas al reordenar Bodega | CP-78, CP-91 | Aprobado |
| Contenido peligroso | Un texto con `<script>` publicado en el panel se muestra como texto y no se ejecuta | Sección 8 | Aprobado |

## Mensajes de error

- Los mensajes son en español y dicen qué corregir, con los textos del prototipo aprobado.
- La auditoría del 26/10/2026 encontró mensajes de Zod en inglés en el formulario de Contacto (INC-21); se corrigieron en CE-13.
- Quedan mensajes técnicos en inglés en las operaciones de usuarios y camiones. Solo aparecen si alguien manipula la petición, porque la pantalla valida antes, y se corrigen en CE-14 (INC-37).

## Resultado

**Aprobado.** Ningún dato inválido se guardó, en ningún navegador. Queda en análisis el aviso de CP-89 en WebKit (INC-47). Quedan pendientes el rechazo de las contraseñas comunes (CP-111) y los mensajes en inglés de INC-37; los dos se corrigen en CE-14.
