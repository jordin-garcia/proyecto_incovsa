# Casos de prueba

Cada caso de prueba tiene las columnas que piden los lineamientos:

- **Id:** el código del caso.
- **Requerimiento:** el requisito o la regla que comprueba.
- **Entrada:** los datos con que se prueba.
- **Procedimiento:** los pasos y la prueba automatizada que los ejecuta.
- **Resultado esperado:** lo que dice la especificación.
- **Resultado obtenido:** lo que pasó al ejecutarla, con la referencia a su evidencia del Anexo G.
- **Estado:** si coincide o no.

## Origen de los casos

- **CP-01 a CP-64** se definieron en el Entregable No. 2 (Documento 2, Anexo F, 15/10/2026), cuando todavía no se habían ejecutado. Para este documento se ejecutaron todos y se registró su resultado obtenido. Si la especificación precisó el resultado esperado después del 15/10/2026, el caso lo indica.
- **CP-65 a CP-111** se agregaron para el Entregable No. 3. Cubren lo que se construyó después:
    - configuración de camiones y pilotos, exportación de reportes y tablero de Bodega;
    - permisos por perfil, topes de texto y límite de envíos de Contacto;
    - cabeceras, cookies, sesiones y archivos manipulados;
    - conversión con valores aleatorios, flujo completo, tiempo real y accesibilidad.
- Cada caso nuevo tiene una prueba automatizada que lo comprueba; ninguno describe un comportamiento sin prueba.

## Resumen de resultados

Tabla: Resumen de los casos de prueba por sección de este documento {#tab:resumen-casos}

| Grupo | Casos | Sección | Aprobados | Aprobados en parte | Pendientes |
|---|---|---|---|---|---|
| Conversión validada por INCOVSA | CP-01 a CP-15 | 9 | 15 | 0 | 0 |
| Fraccionados, agrupación, equivalencias y datos incorrectos | CP-16 a CP-21, CP-101 a CP-104 | 9 | 9 | 1 | 0 |
| Archivo de Odoo | CP-22 a CP-29 | 3 y 5 | 8 | 0 | 0 |
| Flujo de picking y despacho | CP-30 a CP-41 | 3 y 10 | 11 | 1 | 0 |
| Seguridad y acceso | CP-42 a CP-50 | 4 y 8 | 8 | 1 | 0 |
| Sitio web y panel | CP-51 a CP-59 | 3 | 8 | 1 | 0 |
| Ajustes del 15/10/2026 | CP-60 a CP-64 | 3 y 5 | 4 | 1 | 0 |
| Funciones del Entregable No. 3 | CP-65 a CP-79 | 3 | 15 | 0 | 0 |
| Roles y permisos | CP-80 a CP-84 | 4 | 5 | 0 | 0 |
| Validación | CP-85 a CP-91 | 5 | 7 | 0 | 0 |
| Seguridad básica | CP-92 a CP-100, CP-111 | 8 | 9 | 0 | 1 |
| Flujo completo, tiempo real y accesibilidad | CP-105 a CP-110 | 6, 7 y 10 | 6 | 0 | 0 |
| **Total** | **111** | | **105** | **5** | **1** |

## Casos aprobados en parte y pendientes

Tabla: Casos que no están aprobados por completo {#tab:casos-parciales}

| Id | Qué falta | Cómo se completa |
|---|---|---|
| CP-20 | RN-33 se comprueba de forma indirecta: cada línea enviada a Bodega guarda su propio Peso de Conversión, pero ninguna prueba carga un segundo archivo después del envío | Prueba de integración directa en la convergencia final (JG-17, 05/11/2026) |
| CP-32 | El aviso de qué falta para enviar se prueba en la muestra de componentes, no en Facturación | Igual que CP-20 |
| CP-42 | La apertura directa de la dirección se prueba con Bodega, que usa la misma verificación, y no con Facturación | Igual que CP-20 |
| CP-51 | La prueba abre Inicio, pero no Quiénes somos, que lee el mismo contenido | Igual que CP-20 |
| CP-64 | La fecha escrita sin barras se prueba en el campo común de fecha, no dentro de Reportes | Igual que CP-20 |
| CP-111 | Se aceptan contraseñas comunes, y restablecer la contraseña de Gerencia o Soporte no pide la contraseña propia | Tarea CE-14 (05/11/2026), con sus pruebas |

La tabla completa de los 111 casos, con todas sus columnas, está en el **Anexo F**. Su evidencia está en el **Anexo G**.
