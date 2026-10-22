# Controles de INCOVSA (JG-11)

`semgrep scan --error --strict --config .semgrep/seguridad.yml --config p/typescript --config p/nextjs src`

La regla de permisos se aplica a las operaciones exportadas de `acciones.ts` y los manejadores de API; constantes como `runtime` no son operaciones. La acción pública del paso del usuario está fuera de `src/modulos` y conserva los controles de JG-06. Las únicas rutas excluidas son Better Auth y la ruta exacta de imágenes públicas de disco de la decisión 78 (404 en producción). No se excluye `api/imagenes/publicar`.

Los casos positivos y negativos se ejercitan con el escáner real desde `scripts/probar-semgrep.mjs`: funciones, flechas, una acción protegida junto a otra desprotegida y las API prohibidas. El PR de prueba de JG-11 verifica además el rechazo por GitHub Actions.
