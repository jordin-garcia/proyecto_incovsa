# DM-05 · Industrias y catálogo del panel

Responsable: Daniela Marín (`InAlexa`). Verificación del 21/10/2026.

## Comparación con el prototipo

Se comparan textos, estructura, orden, estados y colores según `plan/convenciones.md` §7. Las notas P-17/P-21 y el botón «Demostración» se excluyen según `specs/20`. La aplicación usa las imágenes de demostración servidas por el almacenamiento local; el prototipo puede mostrar sus imágenes vacías cuando el recurso original no está disponible. Los datos del catálogo no incluyen lote ni Peso de Conversión.

| Pantalla | Teléfono · 390 px | Tableta · 768 px | Escritorio · 1440 px |
| --- | --- | --- | --- |
| Industrias · aplicación | [Captura](aplicacion-industrias-390.png) | [Captura](aplicacion-industrias-768.png) | [Captura](aplicacion-industrias-1440.png) |
| Industrias · prototipo | [Captura](prototipo-industrias-390.png) | [Captura](prototipo-industrias-768.png) | [Captura](prototipo-industrias-1440.png) |
| Catálogo · aplicación | [Captura](aplicacion-catalogo-390.png) | [Captura](aplicacion-catalogo-768.png) | [Captura](aplicacion-catalogo-1440.png) |
| Catálogo · prototipo | [Captura](prototipo-catalogo-390.png) | [Captura](prototipo-catalogo-768.png) | [Captura](prototipo-catalogo-1440.png) |
| Producto · aplicación | [Captura](aplicacion-producto-390.png) | [Captura](aplicacion-producto-768.png) | [Captura](aplicacion-producto-1440.png) |
| Producto · prototipo | [Captura](prototipo-producto-390.png) | [Captura](prototipo-producto-768.png) | [Captura](prototipo-producto-1440.png) |
| Industria publicada · aplicación | [Captura](industria-publicada-390.png) | [Captura](industria-publicada-768.png) | [Captura](industria-publicada-1440.png) |
| Editar producto · aplicación | [Captura](producto-editar-390.png) | [Captura](producto-editar-768.png) | [Captura](producto-editar-1440.png) |
| Editar producto · prototipo | [Captura](prototipo-editar-390.png) | [Captura](prototipo-editar-768.png) | [Captura](prototipo-editar-1440.png) |
| Confirmar eliminación · aplicación | [Captura](eliminar-390.png) | [Captura](eliminar-768.png) | [Captura](eliminar-1440.png) |
| Confirmar eliminación · prototipo | [Captura](prototipo-eliminar-390.png) | [Captura](prototipo-eliminar-768.png) | [Captura](prototipo-eliminar-1440.png) |
| Error conservando borrador · aplicación | [Captura](producto-error-390.png) | [Captura](producto-error-768.png) | [Captura](producto-error-1440.png) |

## Cobertura

- `panel-catalogo.test.ts`: integración real con PostgreSQL. Rechazo sin sesión, sin permiso y desde otro sistema; independencia de permisos y lecturas; creación, edición y eliminación con relaciones; bitácora transaccional; publicación pública de industria; limpieza física; cinco posiciones reordenadas; rechazo de sexta imagen, referencias ajenas, índices duplicados, industria inexistente y nombre vacío.
- `industrias-y-catalogo.spec.ts`: publicación de descripción e imagen y consulta pública; creación y edición, filtros por las dos industrias, cancelación y confirmación de eliminación; axe en ambas pantallas y ventana; bloqueo de cierre durante publicación y conservación de borrador tras error. Los datos originales de Cuero se restauran al terminar.
- Fase roja: integración falló por ausencia de `acciones-catalogo`; E2E falló por ausencia del encabezado y botón del catálogo. La regresión del cierre falló al pulsar Escape antes de aplicar la corrección.
- Verificaciones locales: plan válido (63 tareas), `npm ci` (687 paquetes, cero vulnerabilidades), migraciones sin pendientes, `npm run verificar` (322 pruebas en 36 archivos), `npm run build` y 12 E2E propias aprobadas.
- Suite completa: **228 E2E aprobadas en 8,3 minutos, sin fallos, omisiones ni reintentos**. Comando en Windows: `$env:NODE_OPTIONS='--dns-result-order=ipv4first'; npm.cmd run e2e -- --workers=1 --retries=1`. La opción temporal de DNS permitió acceder al servidor de producción de las pruebas de tiempo real que escucha en 127.0.0.1; no se cambió código ni se redujeron aserciones o umbrales.
- Next-devtools sin errores de configuración ni ejecución. Recorrido adicional con Playwright de `/industrias/cuero`, `/productos` y `/productos/1`, sin errores de ejecución.
- Corrección de CI: `plan` detectó radios literales en `catalogo.module.css`. Se sustituyeron 12, 10 y 999 px por sus tokens existentes equivalentes (`--radius-prototipo-3`, `--radius-prototipo-1` y `--radius-prototipo-5`), sin cambiar el aspecto ni modificar la prueba del design system. Se añadió a la comprobación local `node --test "scripts/*.test.mjs"`.
- Scripts en Windows: 110 pruebas aprobadas y tres de respaldo fallidas porque crean un entorno Bash con rutas Unix; el design system ya pasa. Esas tres pruebas no se modifican y se verifican en Linux en la CI obligatoria. `node --test scripts/design-system.test.mjs` verifica específicamente los tres criterios del diseño.
- Tras corregir los tokens: design system 3/3, `npm run verificar` 322/322, compilación y 12 E2E propias aprobadas de nuevo (44,9 s). La revisión independiente del delta también concluye LISTO.

## Interfaces para las siguientes tareas

Las acciones `publicarIndustria(FormData)`, `publicarProducto(FormData)` y `eliminarProducto(id)` están en `src/modulos/contenido/acciones-catalogo.ts`. Las cargas multipart usan rutas específicas `/panel/industrias/publicar` y `/panel/catalogo/publicar`, dentro del alcance autorizado, para admitir cinco imágenes de hasta 5 MB sin modificar límites de acciones compartidas. Se exige sesión, permiso, origen y límite total antes de procesar el formulario.

El campo `datos` contiene JSON validado por `esquemas-catalogo.ts`. Las referencias `imagenes` son direcciones de la galería actual o índices únicos de los archivos nuevos enviados con nombre `imagenes`. No se admiten direcciones externas nuevas ni fotos de otro registro. El servicio bloquea el registro antes de leer su galería, actualiza contenido y bitácora en una transacción y limpia el almacenamiento después de confirmar. Una publicación fallida elimina sus archivos nuevos. La revalidación del layout raíz actualiza las páginas públicas existentes.

Sin dependencias, migraciones ni cambios de especificaciones. `.codex/config.toml` se conserva fuera de los commits.
