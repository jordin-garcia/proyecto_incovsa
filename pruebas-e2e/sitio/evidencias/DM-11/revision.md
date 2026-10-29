# Revisión independiente de DM-11

Revisor separado del autor, siguiendo `plan/prompts/revision.md`.

## Hallazgos corregidos

1. La primera versión comparaba mediana de cinco imágenes con el máximo de una. Se sustituyó por mediana contra mediana, con doce pares alternados y calentamiento de ambas configuraciones, sobre el fixture de producción existente.
2. Resource Timing solo contabilizaba descargas terminadas. Se agregó registro de solicitudes anterior a la navegación y comprobación del inicio frente al instante de load, incluidas las solicitudes pendientes.
3. La revisión podía capturar los datos temporales de otras pruebas. Ahora adquiere los candados de los preparadores; Documentos comparte un candado nuevo con la revisión. Se regeneraron las capturas con el aislamiento activo.

## Revisiones posteriores

Daniela autorizó el 26/10 un margen temporal de 10 ms para el ruido de medición. Se documentó en specs/05, specs/15 y specs/18 y se aplicó solo a las medianas temporales; los bytes y las solicitudes siguen siendo estrictos. La revisión independiente confirmó LISTO para esta precisión.

CE-13 se incorporó desde develop después de su integración en #143. Las pruebas nuevas adoptaron D-08 (`EVIDENCIA=1`) y se regeneraron las capturas. La revisión independiente de código, especificaciones, candados, restauración de datos, geometría y foco del editor confirmó LISTO, sin hallazgos de corrección ni opcionales.

El 29/10 se incorporó JG-25 (#146). Una revisión independiente adicional confirmó LISTO para la espera de la animación de los diálogos de Documentos antes de axe y su compatibilidad con JG-25. No se cambian los colores ni las reglas de accesibilidad.

## Veredicto final del 29/10

Comprobados código, pruebas, especificaciones y cierre. Los registros acreditan 450 pruebas de integración, 186 E2E del sitio/panel —incluidos los 42 de DM-11— y cobertura de los 476 casos mediante las repeticiones documentadas. Los 120 enlaces a capturas existen. El cierre distingue los fallos iniciales y sus resultados posteriores.

CORRECCIÓN (obligatorio corregir): Ninguno.

OPCIONAL (no bloquea): Ninguno.

**VEREDICTO: LISTO.**
