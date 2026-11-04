# JC-11 · Posición visible al seleccionar todos

Requisitos: RF-SL-69 y RNF-11. Capturas en 390, 768 y 1440 px con el archivo anonimizado de Odoo.

- `prototipo-*.png`: estado inicial del prototipo.
- `prototipo-con-datos-*.png` y `prototipo-seleccionado-*.png`: referencia de estructura y contenido.
- `facturacion-*.png`: estados de la aplicación (vacío, resumen, con datos, antes de seleccionar todos, seleccionado y confirmación de eliminación).

Las capturas de selección de la aplicación se toman después de desplazar la lista y seleccionar un pedido. Por eso el primer pedido visible puede ser distinto del de la referencia, tomada desde el comienzo. Las pruebas comprueban que el pedido que estaba a la vista conserva su posición, con tolerancia de 1 px, después del repintado. También cubren la selección con teclado y dos disposiciones sin tarjetas completas a la vista.

La traza de Firefox de la matriz original (ejecución 41384901122, primer reintento de `facturacion-carga`) muestra que el pedido 03553 sube aproximadamente 110 px al seleccionar todos. La prueba original comparaba únicamente `scrollTop` (360 frente a 106,5). La regresión de posición, antes de corregir la aplicación, falló también en Chromium en los tres tamaños (368, 367,125 y 302,125 px).

No se añadieron textos, controles, tokens ni reglas del negocio. La compactación de tarjetas seleccionadas se mantiene. El ajuste conserva el contexto de lectura que exige JC-11 al cambiar la altura de las filas anteriores.

Para repetir la regresión:

```sh
npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
NAVEGADOR=firefox npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
NAVEGADOR=webkit npm run e2e -- pruebas-e2e/picking/facturacion-carga.spec.ts --workers=1
```

Las capturas de la aplicación se adjuntan en `test-results/`; estas copias son la evidencia propia de JC-11. Las ejecuciones normales no sobrescriben esta carpeta. La matriz remota ejecuta toda la batería en cada navegador y tamaño y conserva capturas y trazas como artefactos.
