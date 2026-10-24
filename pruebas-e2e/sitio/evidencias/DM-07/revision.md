# Revisión independiente final · DM-07 · 24/10/2026

Un agente que no escribió la implementación revisó el diff contra `origin/develop`, la tarea, sus especificaciones, el prototipo, los cinco criterios de aceptación, servicios, acciones, endpoint multipart, interfaz, pruebas y capturas en 390, 768 y 1440 px, siguiendo `plan/prompts/revision.md`. No modificó archivos ni ejecutó pruebas en paralelo.

La revisión final incluye JG-24: Noticias hereda las medidas y el contraste de `CampoGaleria`, sin duplicar el relleno y el tamaño de letra compartidos. El helper de capturas conserva el PNG completo y reemplaza el archivo anterior; solo ignora `ENOENT`, sin ocultar otros errores, reducir axe ni cambiar tiempos o aserciones.

El origen público detrás del proxy se valida igual que en Catálogo después de JG-24. La prueba nueva invoca el endpoint real, rechaza los orígenes interno y ajeno sin crear noticias y acepta el origen público configurado. Las variables sustituidas se restauran después de cada prueba.

La excepción `--g600` está autorizada por Jordin y registrada en `specs/18` y `specs/20`. No se identificaron cambios fuera del alcance, pruebas debilitadas ni hallazgos de seguridad o corrección. Las revisiones anteriores y el desbloqueo quedan descritos en el README de esta carpeta y en el historial de Git. Los resultados de ejecución se registran en ese README.

Tras la revisión de Claude en el PR #126, el revisor independiente comprobó también el destino de acceso denegado: Noticias deriva el enlace de `opcionesPermitidas(sesion)`, igual que Catálogo. La regresión exige el enlace al módulo propio, ausencia del botón de creación, axe y navegación efectiva. El usuario predeterminado del helper conserva los casos anteriores. Veredicto de esta corrección: LISTO, sin hallazgos.

REVISIÓN DM-07

CORRECCIÓN (obligatorio corregir):
Ninguno.

OPCIONAL (no bloquea):
Ninguno.

VEREDICTO: LISTO
