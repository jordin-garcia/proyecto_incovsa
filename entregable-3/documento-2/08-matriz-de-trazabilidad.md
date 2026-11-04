\horizontal

# Anexo técnico de trazabilidad {-}

La matriz completa de requisitos y casos corresponde al Documento 1, Anexo D, y al Documento 6, Anexos F y G. Esta tabla localiza el código y sus pruebas principales para el mantenimiento. Una prueba existente no equivale a una ejecución aprobada nueva; los resultados de cada corrida se consultan en sus informes y en la CI.

Tabla: Trazabilidad de módulos técnicos {#tab:trazabilidad}

| Reglas o requisitos | Implementación | Prueba automatizada y evidencia |
|---|---|---|
| RF-SW-09, RN-54, RNF-15 | src/app/acceso/servicio.ts; src/lib/auth-configuracion.ts | src/app/acceso/servicio.test.ts; pruebas-e2e/acceso/acceso-personal.spec.ts |
| RN-17, RN-38, RNF-04 | src/modulos/permisos | src/modulos/permisos/servicio.test.ts; pruebas-e2e/acceso/permisos.spec.ts |
| RN-35 a RN-37, RN-50, RNF-05 | src/modulos/odoo/servicio.ts | src/modulos/odoo/servicio.test.ts; pruebas-e2e/picking/facturacion-carga.spec.ts |
| RN-48, RN-49, RN-51 a RN-53, RNF-06 | src/modulos/envios/opciones.ts | src/modulos/envios/opciones.test.ts; pruebas-e2e/picking/facturacion-envio.spec.ts |
| Dos facturadores, RN-48 | src/modulos/envios/concurrencia.ts; FacturacionTablero | src/modulos/envios/concurrencia.test.ts; pruebas-e2e/picking/facturacion-dos-facturadores.spec.ts |
| RN-01, RN-05, RN-21, RN-33 | src/modulos/conversion/servicio.ts | src/modulos/conversion/servicio.test.ts; propiedades y mutación |
| RN-11, RN-20, RN-28, RNF-13 | src/modulos/bodega/servicio.ts; src/modulos/tiempo-real | pruebas-e2e/picking/bodega.spec.ts y bodega-tiempo-real.spec.ts; pruebas-e2e/flujo/tiempo-real.spec.ts |
| RF-SL-77, RNF-02 | src/modulos/bodega/tablero.ts; TableroCliente | src/modulos/bodega/tablero.test.ts; pruebas-e2e/picking/tablero.spec.ts |
| RN-29, RN-46, RF-SL-78 | src/modulos/ruta/servicio.ts | src/modulos/ruta/servicio.test.ts y acciones.test.ts; pruebas-e2e/picking/ruta.spec.ts |
| RF-SL-59, RF-SL-79, RN-39 | src/modulos/reportes; src/modulos/bitacora | pruebas-e2e/picking/reportes.spec.ts y reportes-exportacion.spec.ts |
| RF-SW-07, RN-56, RNF-17 | src/modulos/contenido; src/modulos/almacenamiento | pruebas-e2e/panel/contenido.spec.ts; pruebas-e2e/sitio/rendimiento-galerias.spec.ts |
| RF-SW-06, RF-SW-20, RN-42 | src/modulos/solicitudes | pruebas-e2e/sitio/contacto.spec.ts; pruebas-e2e/panel/solicitudes.spec.ts |
| RF-SW-14, RF-SW-21, RN-41, RN-55 | src/modulos/documentos | src/modulos/documentos/servicio.test.ts; pruebas-e2e/panel/documentos.spec.ts |
| RNF-09 | scripts/respaldo.sh y restaurar.sh | .github/workflows/produccion-respaldo.yml; evidencia/CE-07 y plan/evidencias/JG-25 |
| RNF-12, RNF-16 | src/lib/cabeceras.ts; Caddyfile | pruebas-e2e/seguridad/cabeceras.spec.ts; produccion-imagen.yml; plan/seguridad |
| Flujo integral | Facturación → Bodega → Ruta → Reportes | pruebas-e2e/flujo/flujo-completo.spec.ts; plan/evidencias/JG-14 |

\vertical
