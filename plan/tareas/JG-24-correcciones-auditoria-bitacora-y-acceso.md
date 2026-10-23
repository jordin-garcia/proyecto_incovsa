---
id: JG-24
titulo: Correcciones de la auditoría del 22/10 en la bitácora, el acceso, el sitio y Facturación
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-12]
programada: 2026-10-24
requisitos: [RF-SL-36, RF-SL-68, RN-39, RF-SL-02, RF-SW-03, RF-SW-27, RF-SW-09, RF-SW-25, RF-SW-30]
pantallas: [picking.js › reportes (Bitácora), sitio.js › acceso, login; panel.js › sinAcceso, contenido, armazon; picking.js › facturacion, tarjetaFact]
---

# JG-24 · Correcciones de la auditoría del 22/10 en la bitácora, el acceso, el sitio y Facturación

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 24/10 · **Depende de:** JG-12

## Objetivo
Corregir los hallazgos de los pasos 1 y 2 de la auditoría del 22/10, y los del paso 4 que tocan el acceso y el armazón: que el Detalle de la Bitácora se lea como en el prototipo (RF-SL-36, RN-39), que el acceso personal se comporte como `login()`, y los textos y pruebas que faltan en el sitio, el panel y Facturación. Son correcciones del coordinador sobre tareas ya integradas (`plan/protocolo.md` §E3).

## Contexto que debes leer
- `plan/auditorias/2026-10-22.md`, pasos 1 y 2 (H-01 a H-15) y paso 4 (H-30 a H-35, H-38 y H-39), con las decisiones D-01, D-02 y D-06 (resueltas al final de la auditoría); `specs/16`, decisión 89
- `plan/protocolo.md` §E3
- `specs/10-picking-reportes.md` (Bitácora); `specs/03-roles-y-accesos.md` (acceso personal); `specs/05-sitio-web.md` (lo que toca cada hallazgo); `specs/06-picking-facturacion.md` (tablero)
- Prototipo: `base.js` › `opCargarArchivo()`, `opEliminarFacturados()` y `bitacora()` (l. 333); `sitio.js` › `acceso()`, `login()` (l. 440-495); `panel.js` › `sinAcceso()`, `contenido()` y la salida (l. 43); `picking.js` › `reportes()`, `tarjetaFact()`, `cargarArchivo()` y la ruta del módulo inexistente (l. 37)
- `## Resultado` de JG-05, JG-06, JG-07, DM-02 a DM-05, JC-03 y JC-06

## Qué hacer
1. **Bitácora legible (H-09, H-12, H-32 y H-14):** guardar `detalle.resumen` con el texto del prototipo en la carga del archivo de Odoo (con la sede), en la eliminación de pedidos facturados, en los intentos fallidos, en los usuarios inexistentes (con «(no existe)») y en los bloqueos. En Reportes, mostrar siempre texto, nunca JSON ni `{}`, y aplicar el límite de 250 filas del prototipo. El filtro por sede ya está confirmado (D-02, `specs/10`).
2. **Acceso (H-33, H-34, H-35, H-38 y H-39):** `/acceso/<sistema>` vuelve al paso 2 si el usuario no tiene cuenta en ese sistema; al salir se muestra «Sesión cerrada.»; el mensaje lleva su punto final; una prueba para RF-SL-02; «Módulo no encontrado» dentro del armazón.
3. **Armazón (H-30 y H-31):** el `title` del botón de reducir el menú y la regla de las iniciales de `base.js`.
4. **Sitio y panel (H-01 a H-08):** las aserciones que faltan (RF-SW-27, título de la industria, menú sin permiso); «Ir a mi módulo» en Industrias y Catálogo; el texto «Imagen del valor N»; el origen esperado de las rutas multipart (comprobarlo también a través de Caddy); la prueba de la sexta imagen; y la sección «## Avance» de DM-04 marcada como histórica.
5. **Facturación y Reportes (H-10, H-11, H-13 y H-15):** el `title` de la tarjeta, el texto del botón de carga según el prototipo, el texto sin permiso de Reportes y las capturas de JC-06 movidas a `evidencia/JC-06/`.
6. **D-01 (RN-49):** una sola clave de cliente, que compara el nombre y el sector sin distinguir mayúsculas ni tildes y sin espacios al inicio ni al final, como `norm()` y `claveRuta()` del prototipo (un nombre o un sector vacío cuenta como «Sin nombre» o «Sin sector»), para agrupar las entregas de la Ruta (`opciones.ts`), contar los clientes en la confirmación de Facturación (`OpcionEnvio.tsx:92`) y contarlos en Bodega (`bodega/servicio.ts:72-74`). Ajustar `opciones.test.ts:301` (`specs/12`, `specs/08`). **D-06** ya está resuelta (la rejilla del prototipo se conserva).
7. **Decisión 89 (en diseño manda el prototipo):** revisar las diferencias de diseño que `specs/18` introdujo frente al prototipo, como el `--g600` de los textos secundarios (JG-05 y JM-08) y la opacidad de la etiqueta «RUTA», y volver al diseño del prototipo. Si un cambio hace fallar axe (RNF-08), detenerse y preguntarle a Jordin antes de tocar la prueba: las pruebas no se debilitan.
8. En el `## Resultado` de cada tarea corregida, agregar `### Correcciones de la auditoría (2026-10-22)`. Su estado no cambia.

## Archivos que creas o modificas
- `src/app/acceso/**`, `src/componentes/comunes/**` (incluido el aviso «Sesión cerrada.» al llegar al inicio, H-34), `src/app/(sitio)/page.tsx` o su `layout.tsx` si el aviso se muestra ahí, `src/modulos/bitacora/**`
- `src/modulos/envios/servicio.ts`, `src/modulos/envios/opciones.ts`, `src/componentes/picking/facturacion/OpcionEnvio.tsx`, `src/modulos/bodega/servicio.ts` y sus pruebas; `src/modulos/reportes/**`, `src/app/picking/reportes/**`, `src/componentes/picking/facturacion/FacturacionTablero.tsx`
- `src/app/panel/catalogo/page.tsx`, `src/app/panel/industrias/page.tsx`, `src/modulos/contenido/**`, `src/componentes/panel/EditorContenido.tsx`, `src/app/api/imagenes/publicar/route.ts`
- Las pruebas de cada área (`pruebas-e2e/acceso/**`, `pruebas-e2e/comunes/**`, `pruebas-e2e/sitio/**`, `pruebas-e2e/panel/**`, `pruebas-e2e/picking/reportes.spec.ts`, `pruebas-e2e/picking/facturacion-*.spec.ts`)
- `src/app/globals.css` y los estilos de los módulos que usen `--g600` u otros ajustes de diseño de `specs/18` (decisión 89)
- `evidencia/JC-06/` (mover); `specs/` y `specs/18` (lo que cambie por la decisión 89)
- `plan/tareas/` de las tareas corregidas (solo la sección de correcciones y, por H-03, la sección «## Avance» de DM-04); `plan/bitacora/jordin.md` (con los avisos para Daniela y José Daniel)

## Criterios de aceptación
1. **RF-SL-36 / RN-39 / RF-SL-68 (H-09, H-12, H-32):** en Reportes › Bitácora, la carga del archivo, la eliminación de pedidos facturados, los intentos fallidos, el usuario inexistente y los bloqueos muestran el texto del prototipo; ninguna fila muestra `{}` ni JSON, y la prueba lo exige.
2. **H-14:** la Bitácora muestra como máximo 250 filas.
3. **RF-SW-09 (H-33):** con `ejemplo.08`, abrir `/acceso/picking` regresa al paso 2 sin registrar un intento fallido.
4. **RF-SW-30 (H-34):** al salir de cualquiera de los dos sistemas se ve «Sesión cerrada.» en el inicio del sitio.
5. **RF-SL-02 (H-38):** una prueba comprueba que ningún paso del acceso pide la sede.
6. **RF-SW-25 (H-07):** sin permiso, Industrias y Catálogo muestran «Ir a mi módulo».
7. **RF-SW-27 (H-01):** la prueba de Inicio falla si un texto menciona el número de sedes o bodegas fuera de la cifra permitida.
8. Cada hallazgo restante (H-02 a H-06, H-08, H-10, H-11, H-13, H-15, H-30, H-31, H-35 y H-39) tiene su corrección y una prueba que lo habría detectado.
9. **RN-49 (D-01):** dos pedidos facturados del mismo cliente escrito con otras mayúsculas, tildes o espacios al inicio o al final quedan en una sola fila de entrega, con la suma de sus kg, y cuentan como **un** cliente en la confirmación de Facturación y en la tarjeta de Bodega. Dos nombres que solo difieren en los espacios del medio siguen siendo dos clientes, como en el prototipo.
10. **Decisión 89:** cada diferencia de diseño frente al prototipo que quede después de esta tarea está justificada por una prueba de RNF-08 y aprobada por Jordin; las demás se corrigieron.

## Pruebas obligatorias
- Una prueba por hallazgo que lo habría detectado (criterios 1 a 10)
- La batería completa de navegador (protocolo B7)

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/acceso pruebas-e2e/comunes pruebas-e2e/picking/reportes.spec.ts pruebas-e2e/picking/facturacion-carga.spec.ts pruebas-e2e/picking/facturacion-envio.spec.ts pruebas-e2e/panel pruebas-e2e/sitio
```

## Fuera de alcance
- La exportación de reportes (JC-07), Noticias y Contacto (DM-07 y DM-08).
- Los pasos 3 y 5 de la auditoría (JG-23 y JG-25).

## Notas
- Rama `jordin/JG-24-auditoria-bitacora-y-acceso`. Si JC-07 ya está integrada, actualizar la rama antes de tocar Reportes.
