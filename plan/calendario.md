# Calendario del proyecto

Trabajamos **todos los días**, del sábado 17/10/2026 al miércoles 04/11/2026 (specs/16, decisión 72). Las fechas no se mueven y nada del alcance se recorta (decisión 68).

## Hitos

| Fecha | Hito | Qué tiene que estar listo |
|---|---|---|
| Sáb 17/10 | Inicio | Cada integrante con su agente y sus herramientas obligatorias (`XX-01`). El coordinador deja la base del proyecto: estructura, esquema, autenticación, permisos y design system (JG-02 a JG-07) |
| **Dom 18/10** | **E2: avance terminado** | Todas las tareas del hito E2 integradas en `develop` y verificadas (JG-09) |
| Lun 19/10 | Presentación del avance | Jordin presenta el avance al Ing. Manuel Rojas (no en clase). No se prepara nada más que la demostración |
| Mié 21/10 | Convergencia 1 | JG-12 |
| Dom 25/10 | Convergencia 2 | JG-13 |
| Mié 28/10 | Accesos de INCOVSA | VPS (P-10), DNS de incovsa.com en Cloudflare (P-93) y cuentas de los servicios (P-94), pedidos al Ing. William para esta fecha (decisión 73) |
| Vie 30/10 | Convergencia final | JG-17: todo `specs/` y el prototipo en `develop`; solo quedan correcciones |
| **Lun 02/11** | **E3: desarrollo completo** | Todo integrado; `develop` pasa a `main` y se hace el primer despliegue a producción (JG-19); contenido oficial cargado (DM-12) |
| Mar 03/11 | Capacitación | Capacitación al personal de INCOVSA (JG-20 y JG-21); documentos y anexos terminados |
| **Mié 04/11** | **Entrega final** | Presentación en clase del Entregable 3 (JG-22) y transferencia de accesos (CE-12) |

## Guion de la demostración del 19/10

Lo presenta Jordin, en su equipo, con la aplicación en modo de producción local (`npm run build && npm start`), la semilla de demostración y el archivo de Odoo anonimizado (JG-09). Cumple lo que pide el Entregable 2 (`specs/17`): lógica de negocio y datos guardados de verdad.

1. **Acceso personal:** escribir `ejemplo.03`, ver que tiene los dos sistemas, entrar al picking con su contraseña (JG-06).
2. **Pedido facturado:** en Facturación, cargar el archivo de Odoo y mostrar el resumen de la carga (33 cargados; 46 sin cargar por el Peso de Conversión en 0, P-91) y el tablero persistente (JC-02, JC-03).
3. **Generación del picking:** seleccionar y arrastrar pedidos facturados a "Envío por camión", elegir camión, piloto, fecha y hora, ver el control de peso, y "Enviar a Bodega" (Ruta 1). Repetir con "Cliente recoge en bodega" (Pedido 1) (JC-04).
4. **Conversión de kg a unidades:** en Bodega, con `ejemplo.05`, mostrar las filas por producto y lote con "N unidades + R kg" (JM-02, JM-03).
5. **Preparación:** marcar filas, marcar todo, ordenar por peso, ver el Detalle de Ruta y pulsar "Ruta Despachada" y "Pedido Despachado" (JM-03).
6. **Persistencia:** recargar y entrar con otro usuario: todo sigue igual.
7. **Usuarios y permisos:** con `ejemplo.01` (Gerencia), crear un usuario del picking con permisos por casillas y sedes, y entrar con él (CE-03, JG-07).
8. **Sitio con CMS:** en el panel, con `ejemplo.08`, cambiar el texto de la misión, subir imágenes, editar una industria y crear un producto público; mostrar los cambios en Inicio, Industrias y Productos (DM-02 a DM-05).

## Guion de la demostración del 04/11

Lo completa JG-22, en producción (https://incovsa.com), con el contenido oficial. Recorre el flujo que piden los lineamientos (`specs/17`): **pedido facturado → conversión de kg a unidades → generación del picking → preparación → carga → despacho → actualización de estado → reporte**. La actualización de inventario no aplica: el docente aprobó la exclusión (P-58). Además: el sitio público, el panel, la documentación interna, el tablero en la TV, la Ruta en el teléfono, los reportes con exportación y la bitácora.

## Calendario por día

Cada tarea tiene su día en el campo `programada`. Esta tabla la genera `node scripts/tareas.mjs --calendario --escribir`; no se edita a mano.

<!-- calendario:inicio (lo genera node scripts/tareas.mjs --calendario --escribir; no lo edites a mano) -->

| Día | Jordin | Carlos | Daniela | Josué | José Daniel |
|---|---|---|---|---|---|
| Sáb 17 oct | **JG-01** Herramientas obligatorias del agente (Claude Code y Codex)<br>**JG-02** Proyecto base de Next.js, dependencias y calidad local<br>**JG-03** Esquema completo de la base de datos, migración inicial y semillas<br>**JG-04** Datos de prueba y recursos gráficos del prototipo<br>**JG-05** Design system, componentes comunes y estructura del panel y del picking<br>**JG-06** Autenticación, acceso personal, sesiones y bitácora<br>**JG-07** Permisos, sedes y estructura conectada a la sesión<br>**JG-08** Integración continua, bot de revisión, tablero del plan y protección de ramas | **CE-01** Herramientas obligatorias del agente (Cursor) | **DM-01** Herramientas obligatorias del agente (Codex) | **JM-01** Herramientas obligatorias del agente (Codex)<br>**JM-02** Conversión de kilogramos a unidades | **JC-01** Herramientas obligatorias del agente (Codex)<br>**JC-02** Lectura del archivo de Odoo |
| Dom 18 oct | **JG-09** Verificación del avance del Entregable 2 (19/10) | **CE-02** Configuración: camiones<br>**CE-03** Configuración: usuarios del picking | **DM-02** Sitio público: cabecera, pie, presentación dinámica e Inicio<br>**DM-03** Sitio público: Industrias, Productos y detalle de producto<br>**DM-04** Panel: almacenamiento de imágenes, resumen y contenido institucional<br>**DM-05** Panel: industrias y catálogo de productos públicos | **JM-03** Bodega: preparación, detalle y despacho de rutas y pedidos | **JC-03** Facturación: carga del archivo y tablero de pedidos facturados<br>**JC-04** Facturación: opciones de envío y envío a Bodega |
| Lun 19 oct | — | **CE-04** Panel: usuarios del sitio | **DM-06** Sitio público: Quiénes somos | — | — |
| Mar 20 oct | **JG-10** Tiempo real con SSE para Bodega, Facturación y Ruta<br>**JG-11** Controles automáticos de seguridad y calidad | — | **DM-07** Noticias en el panel y en el sitio | **JM-04** Bodega: prioridad compartida y tiempo real | — |
| Mié 21 oct | **JG-12** Convergencia 1 | **CE-05** Producción con Docker Compose y Caddy | **DM-08** Contacto, formulario de solicitudes e información de contacto | — | **JC-05** Facturación: dos facturadores a la vez y tiempo real |
| Jue 22 oct | — | — | **DM-09** Bandeja de solicitudes del panel | **JM-05** Tablero de Bodega en pantalla completa, modo claro y modo oscuro | — |
| Vie 23 oct | — | **CE-06** Despliegue automático desde main con GitHub Actions y GHCR | **DM-10** Documentación interna con enlaces de Google Drive | — | **JC-06** Reportes: Despacho, Rutas realizadas y Bitácora con filtros de periodo |
| Sáb 24 oct | — | **CE-07** Respaldos automáticos y prueba de restauración | **DM-11** Rendimiento de las galerías y revisión integral del sitio y del panel | **JM-06** Ruta del piloto y registro de la entrega | — |
| Dom 25 oct | **JG-13** Convergencia 2 | — | — | — | **JC-07** Exportación de los reportes a Excel y PDF |
| Lun 26 oct | **JG-14** Prueba del flujo completo y recorrido diario en GitHub Actions | — | — | — | — |
| Mié 28 oct | **JG-15** Revisión de seguridad con OWASP ASVS 5.0 nivel 2 y OWASP ZAP | **CE-08** Preparación del VPS, del dominio y de Cloudflare R2 | — | — | — |
| Jue 29 oct | **JG-16** Pruebas en navegadores, tamaños de pantalla y accesibilidad | — | — | — | — |
| Vie 30 oct | **JG-17** Convergencia final y cierre del desarrollo | **CE-09** Documento 1 final, con las reuniones 4 y 5 y los anexos A a E | — | — | — |
| Sáb 31 oct | — | — | **DM-13** Documento 3, manual de usuario de la administración del sitio | **JM-07** Documento 4, manual de usuario del sistema logístico | **JC-08** Documento 2, nueva versión para el Entregable 3 |
| Dom 1 nov | **JG-18** Documento 6, plan y evidencias de pruebas (Anexos F y G) | — | — | — | — |
| Lun 2 nov | **JG-19** Integración de develop en main y primer despliegue a producción<br>**JG-20** Material y cuentas para la capacitación del 03/11 | **CE-10** Verificación de producción después del primer despliegue<br>**CE-11** Documento 5 (instalación, despliegue y mantenimiento) y README final | **DM-12** Carga del contenido oficial de INCOVSA en producción | — | — |
| Mar 3 nov | **JG-21** Capacitación al personal de INCOVSA y evidencia (Anexo H)<br>**JG-22** Presentación del Entregable 3 (04/11) | **CE-12** Anexos I y J, evidencia de entrega e inventario de servicios y accesos | — | — | — |

<!-- calendario:fin -->
