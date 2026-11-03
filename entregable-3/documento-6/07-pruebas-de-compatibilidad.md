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

MATRIZ_TABLA

## Historial

Tabla: Ejecuciones de la matriz de navegadores {#tab:matriz-historial}

| Fecha | Ejecución | Casos | Resultado |
|---|---|---|---|
| 30/10/2026 | 41028328780 (JG-16) | 1 500 | 1 499 aprobados; falló 1 en Firefox en el teléfono: la lista de Facturación saltaba al «Seleccionar todos» (INC-40) |
| 02/11/2026 | 41390020826 (JC-11) | 1 554 | 1 554 aprobados (2 al repetirse), con la corrección de INC-40 |
| 03/11/2026 | 41706509553 (`develop`) | MATRIZ_CASOS | MATRIZ_RESUMEN |

La primera ejecución de JG-16 tuvo entre 12 y 16 fallos por combinación en Firefox y WebKit. Salvo INC-40, todos eran diferencias de las propias pruebas entre navegadores, no de la aplicación (INC-41). Se corrigieron con funciones de prueba comunes, sin quitar comprobaciones. El detalle está en `plan/pruebas/matriz-2026-10-30.md` (EV-15).

## Resultado

MATRIZ_CONCLUSION
