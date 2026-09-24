# 16. Arquitectura, tecnología y forma de trabajo

## Arquitectura

- **Una sola aplicación web monolítica**, con renderizado en el servidor y organizada por módulos de dominio. Contiene el sitio público, el panel, la documentación interna y los seis módulos del picking, todo bajo incovsa.com.
- **Capas:**
  - presentación: rutas y vistas por área;
  - lógica de negocio: conversión, existencias y movimientos, pedidos, preparación, ruta, contenido y reportes;
  - acceso a datos: ORM y migraciones;
  - base de datos relacional.
- La lógica de conversión y la de existencias viven en la capa de negocio. Se comportan igual sin importar desde qué pantalla se llamen.
- Control de acceso: autenticación con sesión y un intermediario (middleware) que en cada petición revisa el rol y la sede.

## Stack

La contraparte lo revisó y no tuvo objeción.

| Capa | Tecnología |
|---|---|
| Entorno de ejecución | Node.js 22 LTS |
| Framework | Next.js 15 (App Router) con TypeScript |
| Base de datos | PostgreSQL 16 |
| ORM y migraciones | Prisma |
| Autenticación | Auth.js con credenciales y sesiones; contraseñas con bcrypt |
| Roles y permisos | Modelo propio en Prisma y middleware de Next.js |
| Interfaz | Tailwind CSS y shadcn/ui |
| Validación | Zod, en cliente y servidor |
| Correo | Nodemailer con la cuenta SMTP de la empresa (P-09) |
| Exportación de reportes | PDF y Excel (P-05) |
| Pruebas automatizadas | Vitest. **La conversión y los movimientos de existencias deben tener pruebas obligatoriamente** |
| Control de versiones | Git y GitHub, repositorio privado |

## Almacenamiento

| Qué | Dónde |
|---|---|
| Datos | PostgreSQL |
| Imágenes del sitio | **Cloudflare R2, plan gratuito** |
| PDF internos (FT, HS, COA) | Sistema de archivos del servidor, **fuera de la carpeta pública**, entregados por una ruta protegida que verifica el rol |

## Servicios externos

| Servicio | Uso |
|---|---|
| Cloudflare R2 | Imágenes del sitio |
| SMTP de la empresa | Formulario de contacto y recuperación de contraseña por correo |
| Odoo | **Solo un enlace** al inicio de sesión. No hay integración de datos |

No hay más integraciones (decisión del 24/09).

## Despliegue

- Hace falta un servidor capaz de ejecutar Node.js y PostgreSQL. Un hosting compartido tradicional (cPanel con PHP) no sirve.
- La contraparte iba a probar la compatibilidad del hosting actual; el resultado está pendiente (P-10).
- La empresa paga el hosting y el dominio.
- Dónde vive el entorno de pruebas del Entregable 2 está pendiente (P-11).

## Decisiones técnicas abiertas

Las resuelve el equipo y se registran aquí cuando se decidan.

| Id | Decisión |
|---|---|
| P-39 | Cómo se logra el tiempo real en Bodega (RNF-13): SSE, WebSocket o consulta periódica corta. Dónde se guarda el orden compartido y el marcado |
| P-42 | Qué pasa al eliminar un producto con historial (por ejemplo, eliminación lógica) |
| P-37 | Cómo se anonimizan las semillas que se suben al repositorio |
| — | Tipo numérico y precisión de las cantidades en kg (por ejemplo, `numeric` con 3 decimales) |
| — | Estructura de carpetas del repositorio (se documenta en el Documento 2) |
| — | Script de carga inicial desde el Excel maestro limpio |

## Forma de trabajo

### Git

- Ramas:
  - `main`: solo versiones entregadas;
  - `develop`: integración;
  - `feature/<modulo>-<descripcion>`: una por tarea;
  - `fix/<descripcion>`: correcciones.
- Todo entra a `develop` por pull request, que revisa Jordin (o otro integrante si el autor es Jordin). Nadie hace push directo a `main` ni a `develop`.
- Un pull request se aprueba si corre sin errores, cumple la tarea, no incluye credenciales ni archivos generados, y las migraciones corren desde cero.
- Commits en español con prefijo: `feat:`, `fix:`, `docs:`, `db:`, `test:`, `chore:`.
- Etiquetas por entregable: `v0.1-entregable1`, `v0.5-entregable2`, `v1.0-final`.
- El `.gitignore` excluye:
  - `.env*` (excepto `.env.example`);
  - `node_modules/`, `.next/`, `__pycache__/`;
  - los archivos subidos;
  - `docs/` (actas, propuesta y lineamientos);
  - `docs_incovsa/` (datos de la empresa);
  - archivos `~$*` de Office;
  - los .docx y .pdf de los entregables (`entregable-*/**/*.docx` y `*.pdf`);
  - las evidencias fotográficas del Anexo B (`entregable-*/figuras/evidencias/`), porque tienen fotografías de personas y de la empresa.

  La carpeta de archivos subidos se agrega al `.gitignore` cuando el proyecto base la defina.

### Qué va al repositorio

- **Sí:** código, migraciones, semillas anonimizadas, `.env.example`, README, `specs/`, diagramas y prototipos.
- **No:** actas, propuesta, lineamientos, datos de la empresa, documentos entregables .docx y .pdf, ni nada con datos personales. Estos se guardan en la carpeta local y en el Google Drive del equipo.

### Definición de "terminado" para una tarea

1. El código está en `develop`, entrado por un pull request aprobado.
2. Si cambió la base de datos, las migraciones y semillas están actualizadas.
3. Los casos de prueba del módulo están escritos y ejecutados, con evidencia.
4. La sección correspondiente del Documento 2 y del manual está redactada.
5. Esta carpeta `specs/` está actualizada si cambió alguna regla.
