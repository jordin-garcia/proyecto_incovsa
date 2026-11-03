\salto

# Anexo G. Evidencias de pruebas {-}

Este anexo reúne la evidencia de los resultados de este documento.

- **Ejecuciones de GitHub Actions:** el repositorio es `jordin-garcia/proyecto_incovsa`. Cada una se abre en `https://github.com/jordin-garcia/proyecto_incovsa/actions/runs/<número>`. GitHub conserva sus registros 90 días, y sus artefactos (informes HTML, capturas y trazas), 30 días.
- **Salidas resumidas** de cada ejecución.
- **Capturas de pantalla** de la aplicación, tomadas por las pruebas de extremo a extremo; están guardadas en el repositorio, en las carpetas que se indican.

## Ejecuciones de las pruebas automatizadas {-}

Tabla: Evidencias de las ejecuciones de pruebas {#tab:g-ejecuciones}

| Id | Evidencia | Ejecución y fecha | Resultado |
|---|---|---|---|
| EV-01 | CI de `develop`: formato, lint, tipos, pruebas unitarias y de integración (Vitest con PostgreSQL 18), compilación y `npm audit` | 41611123183, 03/11/2026, *commit* 37a5c44 (integración del PR #164) | Aprobada. Vitest: 57 archivos, **509 de 509 pruebas aprobadas**, 0 omitidas, 200.8 s. Pruebas de los scripts: 186 de 186. Compilación correcta. `npm audit`: 0 altas |
| EV-02 | Seguridad de `develop`: Semgrep, gitleaks, cadena de suministro (OSV-Scanner), revisión de los flujos (actionlint) e integridad de las pruebas | 41611123137, 03/11/2026, 37a5c44 | Aprobada. Semgrep: 79 reglas en 265 archivos, 0 hallazgos. gitleaks: 123 *commits*, ningún secreto. OSV-Scanner: 942 paquetes, sin vulnerabilidades no aceptadas |
| EV-03 | Prueba integral del flujo completo (recorrido diario) | 41698054254, 03/11/2026, 37a5c44 | Aprobada: **3 de 3** (teléfono 10.8 s, tableta 21.3 s y escritorio 18.6 s). También aprobadas las diarias del 31/10, el 01/11 y el 02/11 |
| EV-04 | Matriz de navegadores sobre `develop`: toda la batería de extremo a extremo, con axe, en Chromium, Firefox y WebKit, y en teléfono, tableta, escritorio y TV | 41706509553, 03/11/2026, 37a5c44 | MATRIZ_RESULTADO |
| EV-05 | Matrices anteriores | 41028328780 (30/10, JG-16) y 41390020826 (02/11, rama de JC-11) | 1 499 de 1 500 casos (el que fallaba se corrigió en JC-11) y después 1 554 de 1 554, con 2 repeticiones |
| EV-06 | Pruebas de mutación (Stryker) de conversión, permisos, envíos y Bodega | 41317332051, 01/11/2026, *commit* 5283147 | Aprobada: **67.90 %** (1 751 mutantes válidos: 1 189 detectados, 457 sobrevivientes y 105 sin cobertura; otros 6 no compilaron), por encima del umbral de 60 %. Duró 105 min |
| EV-07 | Escaneo de seguridad con OWASP ZAP 2.17 sobre el servidor de producción | 41706521296, 03/11/2026, 37a5c44 (antes: 40986033558 del 29/10 y 41172622744 del 30/10) | Aprobada: **0 alertas altas**, 2 medias, 2 bajas y 8 informativas, todas justificadas (sección 8); 64 reglas sin alertas |
| EV-08 | Pruebas unitarias y de integración en el equipo del coordinador (Windows 10, PostgreSQL local) | 03/11/2026, rama `jordin/JG-18-documento-6` sobre 37a5c44 | **57 archivos, 509 de 509 aprobadas**, 630.5 s |

Salida resumida de EV-08 (`npm test`):

```
 Test Files  57 passed (57)
      Tests  509 passed (509)
   Duration  630.48s (tests 73%, import 26%, transform 1%)
```

Resumen de EV-03 (prueba integral). La prueba se llama «RN-11 / RN-52 / RN-29 / RF-SL-16 / RF-SL-24 / RF-SL-29 / RF-SL-37 / RF-SL-38 / RNF-06: flujo completo de un pedido facturado hasta el reporte» y se ejecutó en los tres tamaños:

```
[telefono]    aprobada  10.8 s
[tableta]     aprobada  21.3 s
[escritorio]  aprobada  18.6 s
3 passed (39.6s)
```

Salida resumida de EV-07 (OWASP ZAP):

```
FAIL-NEW: 0  FAIL-INPROG: 0  WARN-NEW: 7  WARN-INPROG: 0  INFO: 0  IGNORE: 0  PASS: 64
High: 0   Medium: 2   Low: 2   Informational: 8
```

## Informes del repositorio {-}

Tabla: Informes de pruebas en el repositorio {#tab:g-informes}

| Id | Informe | Archivo | Contenido |
|---|---|---|---|
| EV-13 | Revisión de seguridad OWASP ASVS 5.0 nivel 2 | `plan/seguridad/asvs-nivel-2.md` | Los 253 requisitos con su estado, las 82 operaciones del servidor revisadas y las tareas de corrección |
| EV-14 | Escaneo de OWASP ZAP | `plan/seguridad/zap-2026-10-29.md` | Las alertas del 29/10, del 30/10 y del 03/11, con la decisión de cada una |
| EV-15 | Matriz de navegadores y tamaños | `plan/pruebas/matriz-2026-10-30.md` | El resultado por navegador y tamaño, y las diferencias encontradas y corregidas |
| EV-16 | Auditorías del coordinador | `plan/auditorias/2026-10-22.md` y `plan/auditorias/2026-10-26.md` | Los 84 hallazgos H-01 a H-84 con su severidad y su tarea de corrección |
| EV-17 | Convergencias | `plan/convergencia/2026-10-22.md`, `2026-10-22-avance-e2.md` y `2026-10-26.md` | La comparación de la aplicación con `specs/` y el prototipo, con capturas lado a lado |
| EV-18 | Evidencia de la prueba integral | `plan/evidencias/JG-14/` | 45 capturas (15 pasos en 3 tamaños) y las salidas de `verificar`, `build` y de las pruebas del flujo |

## Capturas de pantalla {-}

Las capturas de esta sección las tomaron las pruebas de extremo a extremo, con los datos de demostración y el archivo de Odoo anonimizado. Hay más capturas en las carpetas `plan/evidencias/`, `evidencia/` y `pruebas-e2e/*/evidencias/` del repositorio: cada pantalla está en teléfono, tableta y escritorio.

### EV-09. Prueba integral del flujo completo {-}

Capturas de la prueba integral (JG-14, sección 10), en escritorio.

![Flujo completo: resumen de la carga del archivo de Odoo en Facturación](../../plan/evidencias/JG-14/01-facturacion-resumen-carga-escritorio.png){#fig:g-flujo-carga}

![Flujo completo: armado del envío por camión, con camión, piloto, fecha y hora programadas](../../plan/evidencias/JG-14/02-facturacion-envio-por-camion-escritorio.png){#fig:g-flujo-envio}

![Flujo completo: la Ruta 1 y el Pedido 1 en Bodega, con la conversión a unidades](../../plan/evidencias/JG-14/06-bodega-ruta-y-pedido-escritorio.png){#fig:g-flujo-bodega}

![Flujo completo: ruta preparada, con todas sus líneas marcadas](../../plan/evidencias/JG-14/07-bodega-ruta-lista-escritorio.png){#fig:g-flujo-preparada}

![Flujo completo: Bodega después del despacho de la ruta y del pedido](../../plan/evidencias/JG-14/09-bodega-despachados-escritorio.png){#fig:g-flujo-despacho}

![Flujo completo: el piloto confirma la entrega con el recorrido reordenado](../../plan/evidencias/JG-14/12-ruta-confirmar-entrega-escritorio.png){#fig:g-flujo-entrega}

![Flujo completo: reporte de despacho diario con sus indicadores](../../plan/evidencias/JG-14/13-reportes-despacho-escritorio.png){#fig:g-flujo-reporte}

![Flujo completo: la ruta entregada en Rutas realizadas](../../plan/evidencias/JG-14/14-reportes-rutas-realizadas-escritorio.png){#fig:g-flujo-realizadas}

![Flujo completo: las operaciones del flujo en la bitácora](../../plan/evidencias/JG-14/15-reportes-bitacora-escritorio.png){#fig:g-flujo-bitacora}

### EV-10. Conversión de kilogramos a unidades {-}

![Bodega: conversión de kilogramos a unidades con el Peso de Conversión del archivo; SODA ASH (CHI-SAC/0040KG) con peso 25: 240 kg son «9 unidades + 15 kg» (CP-16 y CP-26; recorrido del 22/10/2026)](../../plan/convergencia/2026-10-22-avance-e2/04-bodega-conversion-kg-a-unidades.png){#fig:g-conversion}

### EV-11. Roles y permisos {-}

![Usuario sin el permiso de Reportes: «Sin acceso a este módulo» con el botón «Ir a mi módulo» (JG-24)](../../plan/evidencias/JG-24/aplicacion-sin-acceso-reportes-1440.png){#fig:g-sin-acceso}

![Gerencia crea un usuario con sus permisos por módulo y sus sedes (recorrido del 22/10/2026)](../../plan/convergencia/2026-10-22-avance-e2/07a-usuarios-nuevo-usuario-con-permisos.png){#fig:g-permisos}

### EV-12. Validación {-}

![Panel, Información de contacto: un correo mal formado se marca con «Indique un correo válido.» y no se guarda (CP-91, CE-13b)](../../pruebas-e2e/panel/evidencias/CE-13b/despues-invalido-1440.png){#fig:g-correo-invalido}

### EV-19. Tamaños de pantalla {-}

![Bodega con la Ruta 1 y el Pedido 1 en el teléfono, 390 px (JG-14)](../../plan/evidencias/JG-14/06-bodega-ruta-y-pedido-telefono.png){#fig:g-telefono}

![Bodega con la Ruta 1 y el Pedido 1 en la tableta, 768 px (JG-14)](../../plan/evidencias/JG-14/06-bodega-ruta-y-pedido-tableta.png){#fig:g-tableta}

![Tablero de Bodega en la TV, 1920 px, con una ruta de 60 líneas en dos columnas (JM-05)](../../plan/evidencias/JM-05/app-ruta-60-lineas-1920.png){#fig:g-tv}

### EV-20. Panel administrativo {-}

![Inicio muestra la misión publicada desde el panel (recorrido del 22/10/2026)](../../plan/convergencia/2026-10-22-avance-e2/08f-sitio-inicio-mision-publicada.png){#fig:g-cms}

> La evidencia de la prueba del CMS por una persona de INCOVSA (sección 12) se agrega en la versión 1.1, junto con la de la capacitación (Anexo H).
