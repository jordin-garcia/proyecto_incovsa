# Anexo técnico de verificación {-}

Los casos CP y sus estados están en el Documento 6, no en una copia de los casos iniciales pendientes de la v0.4. Para reproducir los controles de una versión del sistema, se usa una base de pruebas propia, las dependencias del lock y el código del mismo commit. Los comandos no se ejecutan contra datos de producción.

Tabla: Verificaciones reproducibles {#tab:verificaciones}

| Control | Comando o ubicación | Qué comprueba |
|---|---|---|
| Plan | node scripts/tareas.mjs --validar | Metadatos, responsables y dependencias |
| Calidad y reglas | npm run verificar | Formato, lint, tipos y Vitest con PostgreSQL real |
| Compilación | npm run build | Salida standalone y tipos de la aplicación |
| Navegador | npm run e2e -- --workers=1 | Recorridos en los tamaños del navegador seleccionado |
| Otros navegadores | NAVEGADOR=firefox o webkit al ejecutar e2e | Mismos casos y proyectos; matriz en GitHub Actions |
| Flujo | pruebas-e2e/flujo/flujo-completo.spec.ts | Carga, conversión, envío, preparación, despacho, entrega e informe |
| Seguridad | plan/seguridad/asvs-nivel-2.md y zap-2026-10-29.md | Revisión por requisito y escaneo básico; conserva pendientes |
| Documento técnico | python entregable-3/documento-2/verificar_documento.py | 28 secciones, figuras y rutas; columnas de migraciones; paquetes exactos; ejemplo real |
| Datos documentados | python entregable-3/diagramas/modelo.py | Regenera diccionario desde schema.prisma |
| Armado | python entregable-2/herramientas/armar_documento.py entregable-3/documento-2 | Word con portada, índices, figuras y tablas |

Al 03/11 la matriz más reciente documentada tiene incidencias INC-47 e INC-48 en WebKit que siguen a JG-17. Las ejecuciones históricas de JC-11 aprobaron su corrección, pero no sustituyen la matriz posterior con los cambios integrados. La versión 1.0 conserva esa diferencia y no presenta una aprobación global inexistente. El detalle de seguridad distingue JG-15, sus correcciones y lo pendiente en CE-14/JG-27.

El archivo Word y su revisión visual se generan localmente. equipo.local.json contiene la portada y no se versiona. Para regenerar diagramas e índices se siguen las instrucciones de README.md de esta carpeta. Los archivos DOCX/PDF se conservan en la carpeta local y se entregan en el Drive del equipo; no se incorporan a Git.
