# Estrategia de pruebas

## Enfoque

El proyecto se desarrolló con **desarrollo dirigido por especificaciones**: la carpeta `specs/` del repositorio define los requisitos (RF y RNF) y las reglas de negocio (RN), y cada tarea del plan los convierte en criterios de aceptación. La regla del equipo es **escribir primero las pruebas** de cada criterio y nombrarlas con el código del requisito o la regla que comprueban (por ejemplo, «RN-01 CP-05: 50 kg con 25 kg son 2 unidades»). Así cada prueba se puede rastrear hasta su requisito, y cada requisito, hasta sus pruebas.

Ninguna tarea se integra a la rama principal de desarrollo (`develop`) sin pasar todas las verificaciones automáticas. Las pruebas no se debilitan ni se omiten para que pase la CI, y la configuración del proyecto prohíbe dejar pruebas marcadas con `.only`.

## Tipos de pruebas

Tabla: Tipos de pruebas del proyecto {#tab:tipos-pruebas}

| Tipo | Herramienta | Qué comprueba | Cuándo se ejecuta |
|---|---|---|---|
| Unitarias | Vitest 5 | Funciones sin base de datos: la conversión de kilogramos a unidades, las fechas, los permisos, la lectura del archivo de Odoo, el formato de los reportes | En cada *pull request* y en cada integración a `develop` |
| De integración | Vitest 5 con PostgreSQL 18 real | Las operaciones del servidor contra una base de datos real migrada desde cero: permisos y sedes, transacciones, numeración de rutas y pedidos, bitácora | Igual que las unitarias |
| De propiedades | fast-check (dentro de Vitest) | Que la conversión cumpla siempre «unidades × Peso de Conversión + resto = cantidad», con más de mil valores aleatorios | Igual que las unitarias |
| De extremo a extremo | Playwright 1.64 | Las pantallas en un navegador real, como las usaría una persona: sitio, panel, acceso y picking | En el equipo de cada desarrollador antes de abrir el *pull request* y en la matriz de navegadores |
| Prueba integral del flujo | Playwright con el servidor de producción | Pedido facturado → conversión → picking → preparación → carga → despacho → estado → reporte (sección 10) | Cada día a las 06:00 en GitHub Actions y en cada cambio del flujo |
| Matriz de navegadores y tamaños | Playwright: Chromium, Firefox y WebKit | Toda la batería de extremo a extremo en teléfono, tableta, escritorio y TV (secciones 6 y 7) | A pedido y antes de cada entrega |
| Accesibilidad | axe-core | Que ninguna página tenga violaciones serias o críticas de las pautas WCAG | Dentro de las pruebas de extremo a extremo |
| De mutación | Stryker 10 | La calidad de las pruebas: introduce errores a propósito en la conversión, los permisos, los envíos y Bodega, y mide cuántos detectan las pruebas | Cada noche y en los *pull requests* que tocan esos módulos |
| Análisis estático | ESLint, TypeScript, Semgrep | Errores de tipos y de estilo, y reglas de seguridad propias: toda operación del servidor debe verificar el permiso | En cada *pull request* |
| Secretos y dependencias | gitleaks, npm audit, OSV-Scanner, Dependabot | Que no haya contraseñas ni claves en el repositorio y que las dependencias no tengan vulnerabilidades altas | En cada *pull request* |
| Escaneo de seguridad | OWASP ZAP 2.17 | Cabeceras, cookies y fugas de información del sitio compilado para producción (sección 8) | A pedido y antes de cada entrega |
| Revisión de seguridad | OWASP ASVS 5.0 nivel 2 | Revisión manual de las 82 operaciones del servidor y de 253 requisitos (sección 8) | JG-15, 29/10/2026, actualizada con cada corrección |
| Revisión de código | Bot de revisión con Claude y revisión en contexto limpio | Que el cambio cumpla su tarea, `specs/` y el prototipo, sin errores ni problemas de seguridad | En cada *pull request* |
| Auditorías | Coordinador | Revisión completa de lo integrado contra `specs/` y el prototipo aprobado (sección 13) | 22/10 y 26/10/2026, y en la convergencia final |
| Prueba con usuarios | Personal de INCOVSA | Que una persona ajena al desarrollo administre el sitio con el panel y el manual (sección 12) | En la capacitación, 10/11/2026 |

## Entorno de pruebas

- **Base de datos:** las pruebas de integración usan una base PostgreSQL 18 dedicada, que se migra desde cero en cada ejecución de la CI. La CI comprueba además que la base migrada coincida con el esquema de Prisma. Antes de cada prueba se limpian las tablas de negocio y se cargan los datos de demostración.
- **Datos:** el archivo de Odoo que se usa en las pruebas es una **copia anonimizada** del archivo de ejemplo que entregó INCOVSA (`pruebas/fixtures/odoo/odoo-ejemplo-anonimizado.xlsx`). Tiene las mismas 80 referencias, cantidades y Pesos de Conversión, pero con clientes ficticios. El repositorio no contiene datos reales de la empresa.
- **Usuarios:** los usuarios de demostración `ejemplo.01` a `ejemplo.10` cubren los perfiles: Gerencia, Soporte, facturador, Bodega, piloto y usuarios con permisos parciales. Sus permisos y sedes son los del prototipo aprobado.
- **Tamaños de pantalla:** teléfono (390 × 844, táctil), tableta (768 × 1024, táctil), escritorio (1440 × 900) y TV (1920 × 1080, solo para el tablero de Bodega).
- **Servidor:** las pruebas de extremo a extremo usan el servidor de desarrollo de Next.js. La prueba integral, las de tiempo real y el escaneo de ZAP usan el servidor de producción (*standalone*), el mismo de la imagen de Docker que se despliega.

## Criterios de aprobación

- Una prueba automatizada se considera **aprobada** si pasa en la CI. En la matriz de navegadores, una prueba que pasa al repetirse se registra aparte como «inestable» y se investiga.
- Un caso de prueba del Anexo F se considera:
    - **aprobado** si todas sus comprobaciones pasan;
    - **aprobado en parte** si una parte se comprueba de forma indirecta o en otra pantalla;
    - **pendiente** si su resultado todavía no coincide con el esperado y tiene una tarea de corrección.
- El puntaje de mutación no puede bajar del 60 %, que es el umbral que hace fallar la CI.
- El escaneo de ZAP no puede tener alertas de riesgo alto.
- La revisión de accesibilidad no puede tener violaciones serias ni críticas.

## Resultado general al 03/11/2026

Tabla: Resultado de las pruebas automatizadas sobre develop {#tab:resultado-general}

| Verificación | Ejecución | Resultado |
|---|---|---|
| Pruebas unitarias y de integración (Vitest) | 41611123183, 03/11/2026, commit 37a5c44 | **509 de 509 aprobadas** en 57 archivos (200.8 s) |
| Pruebas de los scripts del plan (node:test) | La misma | 186 de 186 aprobadas |
| Formato, lint, tipos y compilación | La misma | Aprobados |
| Semgrep, gitleaks, OSV-Scanner | 41611123137, 03/11/2026 | 0 hallazgos en 79 reglas y 265 archivos; ningún secreto en 123 *commits*; ninguna vulnerabilidad sin aceptar |
| npm audit | 41611123183 | 0 vulnerabilidades altas; 19 moderadas en herramientas de desarrollo (ESLint y Stryker), con el riesgo aceptado hasta el 15/11/2026 |
| Prueba integral del flujo | 41698054254, 03/11/2026, commit 37a5c44 | **3 de 3 aprobadas** (teléfono, tableta y escritorio) |
| Pruebas de mutación | 41317332051, 01/11/2026 | **67.90 %** (1 189 de 1 751 mutantes válidos detectados; umbral: 60 %) |
| Matriz de navegadores | Ver la sección 7 | Ver las secciones 6 y 7 |
| Pruebas unitarias y de integración en el equipo del coordinador | 03/11/2026, rama de esta tarea sobre 37a5c44 | **509 de 509 aprobadas** en 57 archivos (630.5 s) |
| OWASP ZAP | 41706521296, 03/11/2026, commit 37a5c44 | Sin alertas de riesgo alto: 2 medias y 2 bajas, todas justificadas (sección 8) |

El detalle de cada ejecución y sus enlaces están en el Anexo G.
