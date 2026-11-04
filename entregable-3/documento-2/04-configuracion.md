# Variables de entorno

Las plantillas `.env.example` y `.env.produccion.example` contienen los nombres y valores de ejemplo. Esta sección documenta su función; los valores reales se mantienen fuera del repositorio y del documento. Prisma 7 toma la conexión desde `prisma.config.ts`; Node 24 carga el archivo local para la CLI. El cliente de aplicación se crea con el adaptador pg en `src/lib/prisma.ts`.

Tabla: Variables de aplicación y desarrollo {#tab:variables-app}

| Variable | Uso | Regla |
|---|---|---|
| DATABASE_URL | Conexión de aplicación y migraciones | Desarrollo: PostgreSQL local; producción: host postgres en Compose |
| DATABASE_URL_PRUEBAS | Base exclusiva de Vitest | Distinta de desarrollo; las pruebas vacían sus propias tablas |
| BETTER_AUTH_SECRET_SITIO | Firma de la sesión del sitio | Aleatoria, al menos 32 caracteres, distinta de la otra clave |
| BETTER_AUTH_SECRET_PICKING | Firma de la sesión de picking | Aleatoria, al menos 32 caracteres; no usar ejemplos en producción |
| BETTER_AUTH_URL | Origen canónico de la aplicación | Local por HTTP; producción https://incovsa.com |
| SESION_DIAS | Expiración con renovación diaria | Entero positivo; valor por omisión 7 (P-07) |
| CLAVE_DEMO | Contraseña de cuentas de demostración | Solo desarrollo/CI; mínimo 8; producción no lleva semilla demo |
| ALMACENAMIENTO | Destino de imágenes | disco en desarrollo/CI; r2 en producción |
| R2_CUENTA | Cuenta de Cloudflare | Solo r2; configura el endpoint S3 |
| R2_LLAVE | Identificador de llave de imágenes | Acceso limitado al bucket |
| R2_SECRETO | Secreto de la llave | Nunca se registra ni se entrega al navegador |
| R2_BUCKET_IMAGENES | Bucket de imágenes | Separado del bucket privado de respaldos |
| URL_IMAGENES | Origen público HTTPS de imágenes | Sin barra final; controla también los orígenes de la CSP |
| URL_ODOO | Enlace externo del acceso personal | Configurable; P-06 mientras INCOVSA no lo defina |
| TIEMPO_REAL_CONSULTA_MS | Respaldo de SSE por consulta | 5000 ms por omisión |

Tabla: Variables del despliegue y respaldos {#tab:variables-prod}

| Variable | Uso | Dónde se configura |
|---|---|---|
| POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB | Crear y conectar PostgreSQL | Archivo privado del VPS; DATABASE_URL debe concordar |
| DOMINIO | Sitio atendido por Caddy | incovsa.com en producción |
| IMAGEN_APP | Imagen GHCR por etiqueta | Despliegue fija SHA; Compose usa produccion por omisión |
| RCLONE_DEST | Remoto y bucket privado de respaldos | VPS; las llaves están en la configuración privada de rclone |
| RCLONE_ORIGEN | Objeto a restaurar | Ejecución controlada del script restaurar.sh |
| POSTGRES_DB_DEST | Base destino de restauración | Base nueva; protección explícita si coincide con producción |
| FORZAR_SEMANAL | Forzar copia semanal | Opcional, valor 1 para la prueba de retención |
| USAR_DOCKER_RUN | Modo alternativo del script en CI | 1 en la prueba aislada; VPS usa docker compose exec |
| CONFIRMAR_SOBRESCRITURA | Confirmación de reemplazo de producción | Solo intervención autorizada; nunca necesaria para base nueva |

GitHub guarda VPS_HOST, VPS_USUARIO, VPS_LLAVE_SSH y VPS_KNOWN_HOSTS en el environment produccion. El flujo fija la huella del servidor SSH. Los secretos de la revisión automática son responsabilidad del coordinador. NODE_ENV, PORT, HOSTNAME y NEXT_TELEMETRY_DISABLED los fija la imagen para su ejecución. Ninguna credencial de producción se guarda en las computadoras del equipo.

# Configuración de desarrollo

Se necesitan Node.js 24, npm 11.19 o posterior, PostgreSQL 18, Git y GitHub CLI. El desarrollo se ejecuta sin Docker. La guía de instalación por sistema operativo está en plan/instalacion.md; la comprobación es:

```
node scripts/verificar-entorno.mjs
npm ci
npm run db:aplicar
npm run db:semilla
npm run semilla:demo
npm run dev
```

Antes de las migraciones, la persona configura su archivo local a partir de la plantilla y crea dos bases propias: desarrollo y pruebas. No se sustituye una base de otra persona. npm ci ejecuta prisma generate y husky. La semilla base crea sedes, permisos, estados, opciones, países, territorios y contenido base no personal. La semilla demo añade cuentas de ejemplo, camiones y productos de desarrollo; requiere CLAVE_DEMO y nunca se ejecuta en producción.

La aplicación abre en localhost:3000. Las imágenes de disco se guardan en almacenamiento-local/imagenes y se sirven por la ruta pública de desarrollo. El prototipo se sirve por separado:

```
node scripts/servir-prototipo.mjs
```

Las verificaciones ordinarias son npm run verificar y npm run build. Playwright prueba teléfono, tableta y escritorio; TV solo para el tablero. La base de los recorridos debe ser desechable. Si una prueba arranca el servidor de producción, primero se compila; no se usa next start con la salida standalone.

# Configuración de producción

La configuración está implementada y probada en CI; la instalación en el VPS sigue pendiente de los accesos de INCOVSA (CE-08). El diseño exige Ubuntu 24.04 LTS, 2 vCPU, 4 GB RAM, 80 GB SSD, SSH con llave y cortafuegos para 22, 80 y 443. Las cuentas Cloudflare y VPS pertenecen a INCOVSA. No hay un ambiente de pruebas en internet.

Dockerfile instala con npm ci, genera Prisma, compila Next.js y conserva solo dependencias de producción. La imagen final corre como nextjs, aplica prisma migrate deploy al arrancar y ejecuta node server.js. El código pertenece a root; la caché de Next, /home/nextjs y /tmp permiten escritura. No contiene secretos, herramientas de pruebas ni la semilla demo.

Compose inicia PostgreSQL con salud comprobada, después app y finalmente Caddy. La base no publica puertos al host; app expone 3000 solo a la red de Compose. Los datos de PostgreSQL 18 van a /var/lib/postgresql. Los servicios reinician con unless-stopped y sus registros se limitan a cinco archivos de 10 MB.

Caddy obtiene el certificado, reenvía a app:3000, sobrescribe X-Real-IP y permite SSE sin búfer. Acepta cuerpos de hasta 27 MB para cinco imágenes de 5 MB más multipart. Las acciones de Next siguen limitadas a 3 MB. Next envía HSTS, CSP con nonce y las demás cabeceras. El DNS previsto conecta incovsa.com al VPS e imagenes.incovsa.com al bucket de R2.

El primer despliegue se realiza al integrar develop en main, después del 04/11, con la aplicación completa y los accesos disponibles. Los siguientes son automáticos desde main: GitHub Actions compila, publica en GHCR las etiquetas SHA y produccion, entra por SSH, aplica migraciones, reinicia app y comprueba HTTPS. Conserva cinco imágenes. La ejecución manual con etiqueta permite volver a una imagen sin aplicar migraciones; no revierte por sí sola los cambios de datos o de esquema. Antes de volver atrás se comprueba la compatibilidad de la imagen con la base actual.

La prueba del flujo con modo_prueba publica en un paquete GHCR separado, sin desplegar. La operación real y la custodia de secretos se detallan en el Documento 5 y el Anexo J. Tras la puesta en marcha se ejecuta crear-admin dentro del contenedor, con entrada interactiva; no hay administrador de producción en la semilla.

# Migraciones

El esquema completo está en `prisma/schema.prisma`. Solo el coordinador lo modifica y crea migraciones. Cada SQL aplicado es inmutable. Las demás personas aplican las migraciones existentes con npm run db:aplicar; no crean versiones paralelas del esquema.

Tabla: Migraciones implementadas al corte {#tab:migraciones}

| Migración | Contenido |
|---|---|
| 20261017120000_inicial | Tablas, relaciones, claves e índices del sistema |
| 20261017120100_restricciones | CHECK de dominio y disparador que rechaza UPDATE, DELETE y TRUNCATE de Bitácora |
| 20261031034121_solicitud_contacto_ip | IP opcional de Contacto e índice ip/creado_en para su límite de recepción |

Cuando un cambio autorizado requiere estructura nueva, se solicita al coordinador. Este modifica Prisma en su rama, genera el SQL con npm run db:migrar, revisa la pérdida potencial de datos y verifica sobre una base vacía. El cambio y la migración deben integrarse antes del código que depende de ellos. No se editan migraciones ya aplicadas.

La CI aplica las migraciones desde cero y compara la base con el esquema mediante prisma migrate diff. El generador de documentos lee el mismo schema.prisma para producir el ER y el diccionario. La semilla de producción se ejecuta con npm run db:semilla; el contenido oficial se administra desde el panel. Ninguna migración importa pedidos de la empresa.

Antes de modificar producción se respalda la base. migrate deploy aplica solo lo pendiente y no genera SQL nuevo. db:reiniciar es destructivo y se reserva a una base local propia; no se usa como procedimiento de actualización ni restauración de producción.
