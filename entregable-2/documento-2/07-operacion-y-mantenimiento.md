# Respaldos

- Los respaldos son **automáticos y diarios**, en la noche: una copia de la base de datos con `pg_dump` y una copia de la carpeta de documentos internos (RNF-09).
- Se conservan **7 respaldos diarios y 4 semanales**.
- Se guardan **fuera del servidor**, en un bucket privado de Cloudflare R2, distinto del de las imágenes. Las imágenes ya están en R2.

El procedimiento de respaldo y la prueba de restauración se documentan en el Entregable No. 3, en el manual técnico de instalación, despliegue y mantenimiento (Documento 5).

# Procedimiento para agregar nuevas funcionalidades

Esta sección se completa en el Entregable No. 3, con un ejemplo real basado en la arquitectura del proyecto.

# Convenciones de desarrollo

## Ramas y revisiones

- `main` contiene solo las versiones entregadas; `develop` es la rama de integración.
- Cada tarea se trabaja en su propia rama: `feature/<modulo>-<descripcion>` para funciones y `fix/<descripcion>` para correcciones.
- Todo entra a `develop` por **pull request**. Nadie sube cambios directamente a `main` ni a `develop`.
- Un pull request se acepta si el código corre sin errores, cumple la tarea, no incluye credenciales ni archivos generados, y las migraciones corren desde cero.
- Cada entrega se marca con una etiqueta: `v0.1-entregable1`, `v0.5-entregable2` y `v1.0-final`.

## Commits

Los mensajes de commit se escriben en español y empiezan con un prefijo que indica el tipo de cambio:

Tabla: Prefijos de los commits {#tab:commits}

| Prefijo | Uso |
|---|---|
| `feat:` | Función nueva |
| `fix:` | Corrección de un error |
| `docs:` | Documentación y especificación |
| `db:` | Cambios del esquema, migraciones o semillas |
| `test:` | Pruebas |
| `chore:` | Mantenimiento: configuración, dependencias, limpieza |

## Código

- Los nombres de módulos y funciones y los mensajes al usuario están en español, como en la especificación y en el prototipo aprobado.
- Las reglas de negocio van en `src/modulos/`, nunca en las pantallas.
- Cada operación del servidor verifica permisos con `exigirPermiso` antes de llamar a la lógica de negocio.
- Todo dato que llega al servidor se valida con un esquema de Zod.

## Definición de terminado

Una tarea está terminada cuando:

1. El código está en `develop`, por un pull request aprobado.
2. Si cambió la base de datos, las migraciones y la semilla están actualizadas.
3. Los casos de prueba del módulo están escritos y ejecutados, con evidencia.
4. La sección correspondiente de este documento y del manual de usuario está redactada.
5. La carpeta `specs/` está actualizada si cambió alguna regla.

# Problemas conocidos o limitaciones técnicas

Esta sección se completa en el Entregable No. 3.
