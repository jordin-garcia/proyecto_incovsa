# Pruebas de compatibilidad

Los lineamientos piden probar el sistema en los navegadores establecidos en los requerimientos finales.

## Navegadores

INCOVSA todavía no ha confirmado qué navegadores usa su personal (pendiente P-38 de `specs/19`). Por eso se probaron los **tres motores de navegador** que cubren todos los navegadores actuales, con las versiones de Playwright 1.64:

Tabla: Navegadores probados {#tab:navegadores}

| Motor | Navegadores que representa |
|---|---|
| Chromium | Google Chrome, Microsoft Edge, Opera y Brave |
| Firefox | Mozilla Firefox |
| WebKit | Safari en macOS, iPhone y iPad |

Si INCOVSA confirma otros navegadores, se agregan a la matriz.

## Cómo se probó

La **matriz de navegadores** (`.github/workflows/matriz-navegadores.yml`, tarea JG-16) ejecuta toda la batería de extremo a extremo, con axe, en las 12 combinaciones de navegador y tamaño:

- **Batería completa:** sitio, panel, acceso, picking, flujo completo, tiempo real y cabeceras de seguridad, sin filtros.
- **Entorno por combinación:** cada una tiene su propia base PostgreSQL 18 con las migraciones y los datos de demostración, y su propia compilación de la aplicación.
- **Repeticiones:** como en la CI, una prueba puede repetirse hasta dos veces; las que pasan al repetirse se cuentan aparte como «inestables».
- **WebKit:** las pruebas del servidor de producción pasan por HTTPS de prueba, como Caddy en producción, porque WebKit no guarda en `http://localhost` las cookies seguras de producción.

## Resultado sobre develop (03/11/2026)

Tabla: Resultado de la matriz de navegadores sobre develop {#tab:matriz}

| Navegador | Teléfono | Tableta | Escritorio | TV | Total |
|---|---|---|---|---|---|
| Chromium | 183 de 183 | 183 de 183 | 183 de 183 | 11 de 11 | **560 de 560** |
| Firefox | 183 de 183 (2 al repetirse) | 183 de 183 | 183 de 183 | 11 de 11 | **560 de 560** |
| WebKit | 182 de 183 | 181 de 183 (1 al repetirse) | 182 de 183 (3 al repetirse) | 11 de 11 | **556 de 560** |

La ejecución es 41706509553, del 03/11/2026, sobre el *commit* 37a5c44 (EV-04). Ninguna prueba se omitió. Cada combinación tardó entre 1 y 21 minutos.

Tabla: Casos que fallaron en la matriz del 03/11/2026 {#tab:matriz-fallos}

| Navegador | Tamaño | Prueba | Caso | Qué pasó | Incidencia |
|---|---|---|---|---|---|
| WebKit | Teléfono, tableta y escritorio | `panel/contenido.spec.ts:85`: «RNF-05: al salir de Misión rechaza más de 10 000 caracteres sin publicar» | CP-89 | Después de escribir 10 001 caracteres y salir del campo, no aparece el aviso «El texto admite hasta 10 000 caracteres.» | INC-47 |
| WebKit | Tableta | `picking/facturacion-carga.spec.ts:40`: «RF-SL-50 / RF-SL-67 / RF-SL-69: carga, muestra y selecciona pedidos facturados» | CP-61 | Se agotó el tiempo de 30 s de la prueba al seleccionar las tarjetas una por una | INC-48 |

- La prueba de INC-47 la agregó DM-14 el 02/11/2026, después de la última matriz, así que esta fue su primera ejecución en WebKit. En Chromium y Firefox pasa en todos los tamaños, y el servidor rechaza los textos de más de 10 000 caracteres en todos los navegadores (pruebas de integración de CP-89, EV-01). Falta determinar si la causa es la prueba o el aviso en la pantalla de WebKit; por ejemplo, la prueba no espera a que la página termine de hidratarse, una diferencia de WebKit que ya se vio en JG-16 (INC-41).
- La prueba de INC-48 pasa en los otros 11 tamaños y navegadores.

Las seis pruebas que pasaron al repetirse miden tiempos o simulan arrastres, y WebKit y Firefox son los más lentos en el servidor de GitHub:

- `bodega-tiempo-real.spec.ts:334` (arrastre, 2 veces);
- `rendimiento-galerias.spec.ts:74` (RNF-17, 2 veces);
- `auditoria-jg24.spec.ts:69` (cierre de sesión);
- `industrias-y-catalogo.spec.ts:148` (catálogo en el teléfono).

Se revisan con las demás intermitentes (INC-44).

## Historial

Tabla: Ejecuciones de la matriz de navegadores {#tab:matriz-historial}

| Fecha | Ejecución | Casos | Resultado |
|---|---|---|---|
| 30/10/2026 | 41028328780 (JG-16) | 1 500 | 1 499 aprobados; falló 1 en Firefox en el teléfono: la lista de Facturación saltaba al «Seleccionar todos» (INC-40) |
| 02/11/2026 | 41390020826 (JC-11) | 1 554 | 1 554 aprobados (2 al repetirse), con la corrección de INC-40 |
| 03/11/2026 | 41706509553 (`develop`) | 1 680 | 1 676 aprobados (6 al repetirse) y 4 fallidos en WebKit (INC-47 e INC-48) |

La primera ejecución de JG-16 tuvo entre 12 y 16 fallos por combinación en Firefox y WebKit. Salvo INC-40, todos eran diferencias de las propias pruebas entre navegadores, no de la aplicación (INC-41). Se corrigieron con funciones de prueba comunes, sin quitar comprobaciones. El detalle está en `plan/pruebas/matriz-2026-10-30.md` (EV-15).

## Resultado

**Aprobado en parte.** En Chromium (Chrome, Edge) y Firefox, el sistema pasa todos los casos en todos los tamaños. En WebKit (Safari) pasa 556 de 560. Los cuatro que fallan están en análisis (INC-47 e INC-48), y su corrección o su justificación se programa en la convergencia final (JG-17), antes del primer despliegue (JG-19), que repite la matriz. Cuando INCOVSA confirme sus navegadores (P-38), se dará prioridad a esos.
