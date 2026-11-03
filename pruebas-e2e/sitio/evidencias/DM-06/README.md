# DM-06 · Quiénes somos

Comparación con `sitio.js › nosotros()`, `misionVision()` y `base.js › logoInquiserca()` del prototipo aprobado. Tamaños: teléfono 390 × 844, tableta 768 × 1024 y escritorio 1440 × 900.

## Capturas

Cada estado tiene capturas `aplicacion-<estado>-<tamaño>.png` y `prototipo-<estado>-<tamaño>.png`:

- `vacio`: historia sin texto ni galería y cinco valores pendientes.
- `contenido`: historia de prueba con dos imágenes y cinco valores publicados, en el orden enviado.
- `sin-inquiserca`: después de quitar el logotipo desde Contenido institucional; ambos bloques muestran únicamente INCOVSA.

Las capturas usan movimiento reducido para mostrar todo el contenido. La alternancia real de ocho segundos y la presentación dinámica se verifican por separado con Playwright sin reducir el movimiento. Las imágenes de contenido son datos locales de prueba; se restauran los registros anteriores al terminar cada caso.

## Correspondencia y accesibilidad

Se conserva el orden del prototipo: banner, historia, misión y visión, valores, mercados y grupo empresarial. Se reutilizan las galerías, misión y visión, cabecera, pie y aparición de DM-02. Las secciones de propósito y mercados usan `--v950`; el resto conserva el fondo claro.

Según specs/05 y specs/20, no aparecen las notas amarillas P-19, Demostración ni la leyenda del prototipo. La fila de valores conserva el desplazamiento horizontal del prototipo en teléfono y tableta, sin desbordar la página; admite foco para recorrerla con teclado. Sus números pendientes y el párrafo final usan `--g600` para cumplir el contraste. Las imágenes publicadas no llevan texto visible.

## Fases roja y verde

- La integración falló inicialmente por no existir `./nosotros`.
- El E2E falló inicialmente al recibir el título `404` en `/nosotros`.
- Después de implementar, axe detectó contraste 4.46:1 en el párrafo final y la fila desplazable sin foco. Se corrigieron estilos y accesibilidad, sin excluir reglas de axe.
- La comprobación de posición de los logotipos usa su caja de distribución, porque la transición aprobada cambia temporalmente su escala visual.
- Dos pruebas de integración y doce E2E propios verifican los criterios; se comprueban imágenes publicadas mediante el endpoint real, retirada de Inquiserca desde el panel, contenido escapado, orden de cinco valores, presentación dinámica, movimiento reducido, fondos y axe completo.

## Revisión independiente

Revisión realizada por un agente que no escribió la implementación, siguiendo `plan/prompts/revision.md`, sobre código, pruebas, specs y capturas de los tres tamaños.

CORRECCIÓN (obligatorio corregir): Ninguno.

OPCIONAL (no bloquea): volver al inicio antes de capturar para evitar que la cabecera fija aparezca dentro de la imagen de página completa. Aplicado en la preparación de las capturas.

VEREDICTO: LISTO.

## Alcance autorizado

Daniela autorizó expresamente agregar `src/modulos/contenido/nosotros.ts` y sus pruebas: la tarea no enumeraba la lectura pública de Historia y Valores, y las convenciones prohíben consultar Prisma desde las páginas. La lectura selecciona únicamente campos públicos, no recibe entradas externas ni consulta sesiones o datos internos. No se agregaron dependencias, migraciones ni cambios de especificaciones. `.codex/config.toml` queda fuera de los commits.

## Verificación final

- `node scripts/tareas.mjs --validar`: 63 tareas, plan válido.
- `npm run verificar`: formato, lint, tipos y 324 pruebas en 37 archivos aprobados.
- `npm run build`: aprobado, con `/nosotros` como ruta dinámica.
- `npm run e2e -- pruebas-e2e/sitio/nosotros.spec.ts --workers=1`: doce aprobados en los tres tamaños.
- `npm run e2e -- --workers=1 --retries=1`, con resolución IPv4 primero: código 0, 239 aprobados directamente y uno intermitente aprobado al reintentar. El primer inicio del servidor de producción de JG-10 falló en teléfono; los tres casos del grupo pasaron al reintento. Sin fallos definitivos ni exclusiones agregadas.
- Next-devtools: sin errores de configuración ni de sesión.
- Comprobación adicional de scripts: 110 aprobados; las tres pruebas Bash de respaldo requieren el entorno POSIX de CI y no arrancan desde el entorno nativo Windows. La prueba del design system pasa. No se cambiaron scripts ni pruebas ajenas.
