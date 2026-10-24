# JG-24 · Correcciones de la auditoría del 22/10

Estado: verificada el 23/10/2026. Esta carpeta conserva también las fases rojas y los intentos fallidos; los resultados válidos del cierre están en «Resultado final».

## Cobertura

| Hallazgo o regla | Comprobación |
| --- | --- |
| H-01, RF-SW-27 | `sitio/inicio.spec.ts`: elimina únicamente la cifra permitida y rechaza otras menciones de cantidad de sedes o bodegas |
| H-02 | `sitio/industrias-y-productos.spec.ts`: título con el recuento real de productos |
| H-03 | `scripts/auditoria-jg24.test.mjs`: avance de DM-04 identificado como histórico |
| H-04 | `contenido/acciones.test.ts` y `panel/auditoria-jg24.spec.ts`: número del valor en bitácora y aviso al publicar |
| H-05 | Pruebas de las tres rutas multipart con origen público e interno, y `scripts/verificar-publicacion-caddy.mjs` a través de Caddy real |
| H-06 | `panel/contenido.spec.ts`: menú sin la sección no autorizada |
| H-07, H-13, H-39 | `acceso/auditoria-jg24.spec.ts`: botón al módulo propio, mensaje de Reportes, «Sección no encontrada» en el panel y «Módulo no encontrado» en el picking dentro del armazón |
| H-08 | `contenido/panel-catalogo.test.ts`: cinco referencias distintas válidas; la sexta produce exactamente `too_big` en `imagenes` |
| H-09 | `envios/servicio.test.ts`: resúmenes persistidos de carga y eliminación con sede, pedidos y kilogramos |
| H-10, H-11 | `picking/facturacion-carga.spec.ts`: título completo de las tarjetas y texto del botón con la carga retenida |
| H-12 | `reportes/servicio.test.ts`: detalles históricos legibles («Industria Cuero») y usuario inexistente; exportaciones conservan el usuario de inicios históricos |
| H-14 | `bitacora/servicio.test.ts` y `reportes/servicio.test.ts`: lotes acotados de 250, desempate por id y 250 registros visibles después de filtrar sedes |
| H-15 | `scripts/auditoria-jg24.test.mjs`: capturas de JC-06 fuera de `src/`, conservadas en `evidencia/JC-06/` |
| H-30, H-31 | `comunes/armazon.spec.ts` y `armazon/iniciales.test.ts`: título al reducir y expandir, iniciales del prototipo y respaldo «U» |
| H-32 | `acceso/servicio.test.ts`: resúmenes de los intentos fallidos y de ambos bloqueos, sin cambiar límites |
| H-33, H-38 | `acceso/auditoria-jg24.spec.ts` y `acceso/acceso-personal.spec.ts`: regreso al paso 2 sin fallo y ausencia de selector de sede en los tres pasos |
| H-34, H-35 | `acceso/auditoria-jg24.spec.ts`, `acceso/acceso-personal.spec.ts` y `acceso/servicio.test.ts`: aviso de salida de ambos sistemas y punto final del error |
| RN-49, D-01 | `envios/cliente.test.ts`, `envios/opciones.test.ts` y `picking/auditoria-jg24.spec.ts`: normalización compartida, entregas, suma exacta, conteo de Bodega y confirmación real de Facturación |
| Decisión 89, RNF-08 | `panel/auditoria-jg24.spec.ts`: medidas y hover de galería, contraste aprobado y capturas comparativas |

Las rutas de navegador anteriores son relativas a `pruebas-e2e/`; las de integración, a `src/modulos/` o `src/app/`, según su área.

## Decisiones aprobadas

Jordin autorizó conservar los colores accesibles en los elementos con contraste insuficiente del prototipo. `contraste-prototipo.json` recoge los nodos y las mediciones reproducidas con Playwright y axe: textos secundarios 4.46:1, etiqueta «RUTA» 4.44:1 y zonas vacías de Facturación 2.61:1. Las pruebas no se modifican para admitir esas violaciones. La precisión está en `specs/18` y `specs/20`.

El texto de `CampoGaleria` conserva la excepción ya aprobada. Se recuperan el relleno de 16 px, letra de 13.5 px y fondo de hover del prototipo. Los grises sobre blanco que cumplen contraste deben seguir el prototipo.

## Capturas

Las familias `prototipo-*-390.png`, `prototipo-*-768.png` y `prototipo-*-1440.png` cubren acceso, contraseña y error, sistema no autorizado, salida, accesos denegados, módulo inexistente, contenido, galerías, publicación de un valor, Facturación y Bitácora. Las familias `aplicacion-*` registran sus estados correspondientes. Se comparan textos, disposición, orden, estados y tokens; los datos de las pruebas pueden diferir de la demostración del prototipo (decisión 74).

Las capturas `prototipo-confirmacion-envio-*` reproducen `confirmar()` del prototipo con el mismo HTML de `picking.js` y los datos ficticios de RN-49, sin ejecutar el envío. Playwright confirmó `rgb(43, 44, 43)` y 16 px en la rejilla. El componente común conserva `--g600`/15.5 px; ese resumen usa una clase local con `--g800`/16 px.

## Lectura de los intentos

Los archivos de fase roja registran fallos anteriores a la corrección. `fase-roja-galeria.txt` usó por error una expectativa RGB equivocada: la fase válida es `fase-roja-galeria-corregida.txt`, que detecta los 22 px frente a 16 px. En `fase-roja-colores.txt`, solo la expectativa de las tarjetas de acceso corresponde a la referencia definitiva; la de confirmación se corrigió después de revisar el HTML del prototipo. La fase válida del resumen está en `fase-roja-resumen-confirmacion.txt`.

El primer recorrido de la tarea detectó 33 pedidos de demostración previos en la base local y una medición de Industrias durante su transición. Se preparó `incovsa_e2e_jg24`, una base local independiente con migraciones y semilla de demostración, para el recorrido completo. La prueba de Industrias exige la clase visible y opacidad 1 antes de medir con axe. Se conservan los umbrales, las animaciones y las reglas.

## Verificador local de Caddy

`Caddyfile.pruebas` liga el proxy a loopback, en el puerto 3080, y conserva el límite de 27 MB y la IP real. El verificador inicia su propio Next.js en 3100 con origen público 3080 y almacenamiento en disco; no modifica `.env`. Exige base local, ambos puertos libres y los mismos candados que los fixtures de contenido y catálogo. Comprueba las tres publicaciones con una imagen real, rechaza el origen interno y restaura los datos y archivos creados. Sus procesos terminan al finalizar.

```powershell
node scripts/verificar-publicacion-caddy.mjs <ruta-al-ejecutable-Caddy>
```

Se usa Caddy 2.11.7 de su release oficial, verificado con los SHA-512 publicados. El ejecutable queda en la carpeta temporal del equipo; no forma parte del repositorio.

## Resultado final

| Comprobación | Resultado | Archivo |
| --- | --- | --- |
| `npm run verificar` | formato, lint, tipos y 359 pruebas en 43 archivos | `verificar.txt` |
| `npm run build` | compilación correcta | `build.txt` |
| Batería E2E completa (B7), base limpia `incovsa_e2e_jg24_final`, 1 worker | 297 aprobadas, 3 fallos | `e2e-completa.txt` |
| E2E de la sección Verificación y `picking/auditoria-jg24.spec.ts`, después de las correcciones | 216 aprobadas, 0 fallos | `e2e-tarea.txt` |
| Fase roja de las correcciones de la revisión final | 2 fallos esperados | `fase-roja-revision-final.txt` |

Los 3 fallos de la batería completa:
- `panel/contenido.spec.ts` en teléfono y tableta: el interlineado 1.55 de JG-24 llevaba a dos líneas el aviso del campo de una sola imagen con imagen, que tapaba la imagen. Se corrigió conservando interlineado 1 solo en ese aviso (`specs/18`). La prueba no cambió y pasó en las tres medidas.
- `acceso/acceso-personal.spec.ts` › RN-54 en teléfono: el inicio de sesión no terminó en 5 s (la página seguía en el paso 3, sin error). Es el fallo intermitente conocido de este equipo, que también ocurre en `develop`; pasó en la corrida siguiente.

La revisión final en contexto limpio (subagente `revisor`) encontró 3 hallazgos de corrección, todos corregidos con su fase roja: «Sección no encontrada» en el panel, «Industria *nombre*» en la Bitácora y el registro en `specs/10` y `specs/18` de los textos de los bloqueos, que aprobó Jordin. Se aplicó también el opcional del límite de palabra en la expresión de RF-SW-27. Los demás opcionales quedan anotados en el PR.
