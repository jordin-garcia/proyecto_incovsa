# Revisión independiente de JM-03 · 18/10/2026

Revisor: revisión en contexto limpio siguiendo `plan/prompts/revision.md`.

REVISIÓN JM-03

Revisados los criterios de aceptación, las especificaciones indicadas (RF-SL-19, RF-SL-20, RF-SL-21, RF-SL-22, RF-SL-23, RF-SL-24, RF-SL-35, RF-SL-74, RF-SL-75, RF-SL-76, RN-11, RN-20, RN-28, RN-51, CU-03, CU-04), la implementación en `src/modulos/bodega/`, `src/componentes/picking/bodega/` y `src/app/picking/bodega/`, las pruebas unitarias y de integración (24 pruebas en Vitest), las pruebas E2E (15 pruebas en Playwright), la accesibilidad con axe, y la comparación con el prototipo de simulación (`picking.js`, `estilos.css`).

Se verificaron las observaciones de la revisión automática con Claude:
1. `fechaEnvio` (@db.Date): se convierte la fecha a su representación de día en formato ISO 'AAAA-MM-DD' en el servicio para evitar desfases a UTC−6 (hora de Guatemala). El modal de Detalle y la bitácora ("Cambio de estado") muestran exactamente 18/10/2026.
2. Despacho concurrente: se protege la transacción con bloqueo pesimista `SELECT id FROM envio WHERE ... FOR UPDATE` (decisión 41 de specs/16), previniendo carreras en doble clic o pantallas simultáneas, validado con prueba de ejecución en paralelo.
3. Validación Zod en acciones: `obtenerDetalleEnvioAccion` valida la entrada mediante `esquemaDetalleEnvio` y cuenta con pruebas completas de rechazo de sesión, permiso y sede.
4. Tokens de diseño: `bodega.css` sustituyó todos los literales por tokens del design system (`--color-blanco`, `--v50`, `--r`, `--radius-acceso-icono`), pasando `node --test scripts/design-system.test.mjs`.

CORRECCIÓN (obligatorio corregir):
Ninguno.

OPCIONAL (no bloquea):
Ninguno.

VEREDICTO: LISTO
