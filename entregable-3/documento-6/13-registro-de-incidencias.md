\horizontal

# Registro de incidencias

Esta sección documenta los principales errores que se encontraron durante las pruebas y cómo se resolvieron. Salen de cinco fuentes:

- las dos auditorías del coordinador (22/10 y 26/10/2026, carpeta `plan/auditorias/`);
- la revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP (JG-15, `plan/seguridad/`);
- la matriz de navegadores y tamaños de pantalla (JG-16, `plan/pruebas/`);
- las convergencias (`plan/convergencia/`);
- las bitácoras del equipo.

Los hallazgos menores parecidos se agrupan en una sola fila. El detalle de cada uno está en el informe de origen, con su código H-xx (auditorías), R-xx (revisión manual de seguridad) o el requisito de ASVS. Cada corrección se integró a la rama `develop` con su *pull request* (#n). Cada error funcional o de seguridad corregido tiene una prueba automatizada que lo habría detectado; las correcciones de documentación y de la configuración de la CI (INC-15, INC-18, INC-22 e INC-27) se comprobaron revisándolas.

**Severidad:**

- **Alta:** compromete la seguridad o la disponibilidad del sistema.
- **Media:** un error funcional o una diferencia que la persona usuaria nota.
- **Baja:** un detalle visual o técnico, o un hallazgo de las pruebas o de la documentación.
- **s/e:** sin escala; el informe de origen no la asigna.

Tabla: Registro de incidencias {#tab:incidencias}

| Id | Error | Severidad | Estado | Solución |
|---|---|---|---|---|
| INC-01 | En Bodega, si se caía la red al marcar o reordenar líneas, la pantalla se perdía sin mensaje y sin deshacer el cambio | Media | Corregida | Cada acción captura el error, revierte el cambio y muestra el mensaje; probado cortando la red (JG-23, #136; H-24) |
| INC-02 | El encabezado de Bodega se veía como texto plano, distinto del prototipo, y ninguna prueba lo detectaba | Media | Corregida | Usa el encabezado común de los módulos y una prueba lo comprueba (JG-23, #136; H-17, H-29) |
| INC-03 | Estilos de Bodega distintos del prototipo: «Programada» en gris, avance cortado en el teléfono, barra de herramientas y desplazamiento del Detalle | Media | Corregida | Se agregaron las reglas de estilo del prototipo, incluida la de pantallas de hasta 720 px (JG-23, #136; H-18 a H-21) |
| INC-04 | La prueba de sincronización en tiempo real (CP-37) fallaba por tiempo en escritorio | Media | Corregida | Se mide desde la publicación del aviso; ahora tarda de 621 a 666 ms (JG-23, #136; H-25, H-26) |
| INC-05 | En Reportes › Bitácora, el detalle salía como texto técnico (JSON) en la carga de Odoo, los pedidos eliminados, los intentos fallidos y los bloqueos | Media | Corregida | Se guarda un resumen legible, con el texto del prototipo, también para los registros anteriores (JG-24, #116; H-09, H-12, H-32) |
| INC-06 | El acceso personal mostraba el paso de la contraseña a un usuario sin cuenta en ese sistema, y el intento contaba como fallido | Media | Corregida | Regresa al paso 2 sin registrar un fallo (JG-24, #116; H-33) |
| INC-07 | Abrir la página de acceso con una cuenta desactivada escribía «Intento fallido» en la bitácora | Baja | Corregida | La consulta de la página es de solo lectura (JC-09, #149; H-78) |
| INC-08 | Al cerrar sesión no aparecía el aviso «Sesión cerrada.» | Media | Corregida | Se agregó el aviso de salida (JG-24, #116; H-34) |
| INC-09 | Industrias y Catálogo, sin permiso, no ofrecían el botón «Ir a mi módulo» | Media | Corregida | La pantalla de acceso denegado recibe el destino (JG-24, #116; H-07) |
| INC-10 | Las acciones del panel podían rechazarse (403) detrás del proxy Caddy | Baja | Corregida | El origen se compara con la dirección configurada del sitio, comprobado a través de Caddy (JG-24, #116; H-05) |
| INC-11 | La CI no detectaba que el esquema de la base de datos y las migraciones dejaran de coincidir | Media | Corregida | La CI compara la base migrada con el esquema (JG-25, #146; H-28) |
| INC-12 | Un piloto eliminado seguía elegido en un envío por camión | Media | Corregida | Eliminar un piloto limpia la opción y no se puede cambiar de sede un camión elegido (JG-25, #146; H-41 a H-43, H-45) |
| INC-13 | A través de Caddy solo se comprobaba HSTS, que además salía duplicada, y el tiempo real no se probaba con la imagen de producción | Media | Corregida | La CI comprueba todas las cabeceras, una sola HSTS y el primer evento de tiempo real con sesión (JG-25, #146; H-46 a H-48) |
| INC-14 | La configuración de producción aceptaba las claves de ejemplo | Baja | Corregida | La aplicación no arranca con claves de ejemplo y el código queda de solo lectura (JG-25, #146; H-37, H-49, H-51) |
| INC-15 | Riesgos en la CI: el veredicto del bot de revisión se podía falsificar y un valor se interpolaba en el *shell* | Baja | Corregida | El veredicto exige la ejecución del flujo y los valores pasan por variables de entorno (JG-25, #146; H-40, H-52, H-53) |
| INC-16 | Textos y detalles visuales distintos del prototipo: avisos, títulos de botones, iniciales y la página de módulo no encontrado | Baja | Corregida | Se igualaron con el prototipo aprobado (JG-24, #116; H-04, H-10, H-11, H-13, H-30, H-31, H-35, H-39) |
| INC-17 | Criterios de aceptación sin prueba automatizada, o con pruebas que no aislaban lo que medían | Baja | Corregida | Se agregaron aserciones y casos reales (JG-23 #136, JG-24 #116, JG-25 #146; H-01, H-02, H-06, H-08, H-23, H-27, H-38) |
| INC-18 | Detalles técnicos menores: decimales tratados como números de punto flotante, bitácora sin límite de filas, respaldos y limpieza de imágenes | Baja | Corregida | Ver el resultado de cada tarea (JG-23 #136, JG-24 #116, JG-25 #146; H-03, H-14 a H-16, H-22, H-36, H-44, H-50, H-54, H-55) |
| INC-19 | El detalle de la bitácora salía vacío («—») en Noticias y en Solicitudes | Media | Corregida | Se guarda el título o el folio y el estado (CE-13, #143; H-56, H-57) |
| INC-20 | La galería de imágenes del panel (Contenido, Industrias y Catálogo) no seguía al prototipo | Media | Corregida | Rejilla, miniatura y numeración del prototipo (CE-13, #143; H-58) |
| INC-21 | Formulario de Contacto con mensajes en inglés, validación al salir de cada campo y comentario sin límite | Baja | Corregida | Mensajes en español, validación al enviar y tope de 2000 caracteres (CE-13, #143; H-59 a H-63) |
| INC-22 | Cada corrida de pruebas reescribía las capturas de evidencia del repositorio | Baja | Corregida | Solo se escriben a pedido (CE-13, #143; H-65) |
| INC-23 | En Bodega, si otra pantalla despachaba a mitad de un reordenamiento, quedaban cambios parciales | Baja | Corregida | Transacción con la comprobación dentro (JM-09, #144; H-74) |
| INC-24 | Ruta y Tablero: una ruta sin camión se mostraba como «cliente recoge» y había detalles de presentación | Baja | Corregida | Ver el resultado de JM-09 (#144; H-66 a H-73) |
| INC-25 | Reportes: una descarga fallida no avisaba y el PDF salía sin negritas | Baja | Corregida | Descarga con aviso de error y fuente en negrita incluida (JC-09, #149; H-75 a H-77 y H-79 a H-81) |
| INC-26 | El servidor de producción de las pruebas no arrancaba a tiempo en frío | Baja | Corregida | Espera de hasta 90 s (JG-25, #146; H-84) |
| INC-27 | Errores en la documentación de la CI y en el registro de una excepción de contraste | Baja | Corregida | Documentación corregida y despliegue probado en modo de prueba (JG-25 #146, JG-13 #139; H-64, H-82, H-83) |
| INC-28 | Un archivo .xlsx de 2 MB podía descomprimirse sin límite (bomba ZIP) y tumbar el servidor | **Alta** | Corregida | Máximo 100 entradas, 50 MB descomprimidos, 20 000 filas y largos máximos por campo (JC-10, #157; ASVS V5.2.3) |
| INC-29 | La exportación de reportes usaba siempre la primera sede del usuario, no la elegida | Media | Corregida | La sede elegida se envía a la exportación; prueba «RNF-04 (R-P01)» (JG-26, #153; R-P01) |
| INC-30 | El formulario público de Contacto no limitaba los envíos masivos | Media | Corregida | 5 envíos por dirección IP por hora y campo trampa; además, los datos ya no pasan por la URL (DM-14, #160; R-S01, ZAP 10024) |
| INC-31 | Endurecimiento pendiente: cookies sin prefijo `__Host-`, CSP sin `base-uri`, parámetros de cifrado de contraseñas y sesión anterior abierta al volver a entrar | Media | Corregida | 12 requisitos de ASVS pasaron a «Cumple» (JG-26, #153) |
| INC-32 | Cabeceras faltantes o que revelaban la tecnología: `X-Powered-By`, `Permissions-Policy` y `Cross-Origin-Opener-Policy` | Baja | Corregida | Ya no aparecen en la repetición de ZAP del 30/10 (JG-26, #153) |
| INC-33 | La CSP permite estilos en línea y faltan las cabeceras COEP y CORP | Media | Justificada | Los componentes de la interfaz necesitan estilos en línea, y COEP bloquearía Google Maps y Google Drive; los scripts sí exigen nonce (JG-11, `specs/16`) |
| INC-34 | Identificadores repetidos al reordenar líneas en Bodega dejaban posiciones duplicadas | Baja | Corregida | Validación de unicidad y máximo de 1000 líneas (JM-10, #151; R-P02) |
| INC-35 | Gerencia o Soporte pueden restablecer la contraseña de una cuenta de acceso total sin volver a autenticarse | Media | Pendiente | Pedir la contraseña propia antes de restablecer (CE-14, 05/11/2026; ASVS V7.5.1) |
| INC-36 | Se aceptan contraseñas comunes o con el nombre de la empresa, y el servidor acepta el método TRACE | Media | Pendiente | Lista local de contraseñas comunes y rechazo de TRACE en Caddy (CE-14, 05/11/2026) |
| INC-37 | Mensajes técnicos de validación en inglés ante peticiones manipuladas | Baja | Corregida en Contacto; pendiente en usuarios y camiones | Mensajes en español (DM-14, #160; CE-14 para R-P03) |
| INC-38 | Faltan documentos de seguridad: límites, archivos, sesiones, claves, datos, plazos de parches y registros | s/e | Pendiente | Documentarlos (JG-27, 05/11/2026; 16 requisitos de ASVS) |
| INC-39 | Controles que no se implementan por decisión: MFA, cambio de la contraseña propia, vida máxima de la sesión, TLS interno y gestor de secretos | s/e | Justificada | Riesgos aceptados el 29/10/2026, con sus controles compensatorios; su redacción queda en JG-27 |
| INC-40 | En Firefox, en el teléfono, la lista de Facturación saltaba al «Seleccionar todos» (1 de 1 500 casos de la matriz) | s/e | Corregida | Conserva la posición visible; la matriz final aprobó los 1 554 casos (JC-11, #161) |
| INC-41 | Diferencias de Firefox y WebKit en las pruebas: navegación cancelada, cookies `Secure` en localhost, toque e hidratación | s/e | Corregida | Funciones comunes de prueba, sin quitar comprobaciones (JG-16, #150) |
| INC-42 | El texto de prioridad de Bodega tenía un contraste de 4.46:1 y fallaba la revisión de accesibilidad | s/e | Corregida | Color más oscuro del design system (JM-08, #87) |
| INC-43 | Falla intermitente por tiempo en una prueba de Bodega en tiempo real: el botón sale de la pantalla antes del clic | s/e | Pendiente | Pasó al repetirse (SSE en 320 ms); se revisa en la convergencia final (JG-17) |
| INC-44 | Otras fallas intermitentes en la suite completa (acceso personal en un equipo de 8 GB; flujo, tablero y cabeceras) | s/e | Pendiente | Pasaron al repetirse; se revisan en la convergencia final (JG-17) |
| INC-45 | Sin Cloudflare R2 configurado no se pueden servir imágenes en producción | s/e | Pendiente | Se configura con el VPS (CE-08), que espera los accesos de INCOVSA (P-10, P-93 y P-94) |
| INC-47 | En WebKit (Safari), el aviso «El texto admite hasta 10 000 caracteres.» no aparece al salir del campo Misión con 10 001 caracteres (CP-89); en Chromium y Firefox sí. El servidor rechaza el texto en todos los navegadores | s/e | Pendiente | En análisis: puede ser la prueba, que no espera a que la página termine de hidratarse, o el aviso en WebKit. Se corrige o se justifica en la convergencia final (JG-17), antes de JG-19 |
| INC-48 | En WebKit, en la tableta, la prueba de carga y selección de Facturación agota su tiempo de 30 s al seleccionar las tarjetas una por una (CP-61) | s/e | Pendiente | En análisis; pasa en los otros 11 navegadores y tamaños. Se revisa en la convergencia final (JG-17) |
| INC-46 | ZAP (03/11/2026) señala que el formulario público de Contacto no tiene *token* anti-CSRF; apareció cuando DM-14 lo pasó a POST | Media | Justificada | El formulario es público y no usa sesión, así que un sitio ajeno no puede hacer nada en nombre de otra persona; el envío tiene límite por IP y campo trampa (CP-87 y CP-88). Las acciones con sesión usan cookies `SameSite=Lax`, y Next.js compara el origen cuando el navegador lo envía (observación OC-3 de ASVS). Decisión registrada en `plan/seguridad/zap-2026-10-29.md` |

## Resumen {-}

- **Auditoría del 22/10/2026:** 55 hallazgos (16 Medios y 39 Bajos, ninguno Alto), todos corregidos en JG-23, JG-24 y JG-25.
- **Auditoría del 26/10/2026:** 29 hallazgos (3 Medios y 26 Bajos, ninguno Alto), todos corregidos en CE-13, JM-09, JC-09, JG-25 y JG-13.
- **Revisión de seguridad (JG-15):**
    - ASVS 5.0 nivel 2: al empezar, 55 requisitos no se cumplían; hoy quedan 40. De ellos, 5 se corrigen en CE-14, 16 son de documentación (JG-27) y 19 son riesgos aceptados.
    - Revisión manual: de 5 hallazgos, 4 están corregidos y el último se corrige en CE-14.
    - La única incidencia Alta (INC-28) está corregida.
- **OWASP ZAP:** ninguna alerta Alta en ninguna ejecución. En la primera (29/10/2026) hubo 6 alertas Medias o Bajas: 3 se corrigieron y 3 están justificadas. La del 03/11/2026, sobre `develop`, agregó una Media justificada (INC-46) y confirmó corregida la del correo en la URL (INC-30).
- **Pendientes al 03/11/2026:** INC-35 a INC-38 (CE-14 y JG-27, programadas para el 05/11), INC-43, INC-44, INC-47 e INC-48 (convergencia final, JG-17) e INC-45 (CE-08). Su estado se actualiza en la versión 1.1 de este documento.

\vertical
