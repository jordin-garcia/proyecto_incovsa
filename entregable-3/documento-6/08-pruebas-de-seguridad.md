# Pruebas de seguridad básicas

Los lineamientos piden verificar las rutas protegidas, los permisos, las sesiones, la carga de archivos, la validación de entradas y la protección de la información interna. Para cada punto, esta sección indica qué se verificó, cómo y con qué resultado.

## Cómo se evaluó

La seguridad se evaluó de cuatro formas:

1. **Pruebas automatizadas** de los requisitos de seguridad, en la CI de cada cambio: RNF-04 (acceso por permisos y sedes), RNF-05 (validación de entradas) y RNF-15 (límite de intentos). Hay pruebas unitarias, de integración con la base de datos y de extremo a extremo (casos CP-42 a CP-50 y los de esta sección en el Anexo F).
2. **Análisis estático** en cada *pull request*:
    - **Semgrep**, con reglas propias del proyecto, que hacen fallar la CI si una operación del servidor no verifica el permiso, o si se usan SQL sin parámetros, `eval` o HTML sin escapar;
    - **gitleaks**, que busca secretos en todas las ramas;
    - **npm audit**, **OSV-Scanner** y **Dependabot**, que revisan las dependencias.
3. **Revisión manual con OWASP ASVS 5.0, nivel 2** (JG-15, 29/10/2026), actualizada después de las correcciones. Revisó las **82 operaciones del servidor**, 44 del picking y 38 del sitio y el panel, y no encontró ningún acceso a datos de otra sede ni ninguna operación sin permiso.
4. **Escaneo con OWASP ZAP 2.17** (escaneo básico pasivo) sobre la aplicación compilada para producción. Se hicieron tres ejecuciones: 40986033558 del 29/10, 41172622744 del 30/10 y **41706521296 del 03/11/2026**, esta última sobre la versión actual de `develop`.

Tabla: Alertas de OWASP ZAP sobre develop (03/11/2026) {#tab:zap}

| Alerta | Riesgo | Decisión |
|---|---|---|
| CSP: `style-src 'unsafe-inline'` | Medio | Justificada: los componentes de la interfaz necesitan estilos en línea; los scripts sí exigen un *nonce* por respuesta (INC-33) |
| Falta el *token* anti-CSRF en el formulario de Contacto | Medio | Justificada: el formulario es público y no usa sesión, y Next.js rechaza las acciones con un origen ajeno (INC-46) |
| Faltan las cabeceras `Cross-Origin-Embedder-Policy` y `Cross-Origin-Resource-Policy` | Bajo | Justificada: COEP bloquearía Google Maps y Google Drive (INC-33) |
| 8 alertas informativas (contenido que se guarda o no en caché, cabeceras `Sec-Fetch-*` que envía el navegador, aplicación moderna, atributos con valores de listas de países) | Informativo | Falsos positivos o sin efecto en la seguridad |

Las alertas de `X-Powered-By`, `Permissions-Policy` y `Cross-Origin-Opener-Policy` se corrigieron en JG-26 (INC-32). El correo en la URL del formulario de Contacto se corrigió en DM-14 (INC-30). Ninguna de ellas aparece en la ejecución del 03/11.

Tabla: Resultado de la revisión con OWASP ASVS 5.0 nivel 2 {#tab:asvs}

| Estado | Al empezar (29/10) | Al 03/11/2026 |
|---|---|---|
| Cumple | 112 | 127 |
| No cumple | 55 | 40 |
| No aplica | 86 | 86 |
| **Total de requisitos** | **253** | **253** |

De los 40 requisitos que todavía no se cumplen:

- 5 se corrigen en la tarea CE-14 (05/11/2026);
- 16 son de documentación y se completan en JG-27 (05/11/2026);
- 19 son **riesgos aceptados** por decisión del proyecto el 29/10/2026, con sus controles compensatorios. Por ejemplo: no hay autenticación de dos factores ni vida máxima de la sesión, porque el tablero de Bodega queda abierto en una TV.

El detalle está en el registro de incidencias (sección 13).

## Rutas protegidas

- **Qué se verificó:** que el panel, la documentación interna y el picking no se puedan abrir sin una sesión del sistema correcto (RNF-04). Hay dos barreras:
    - el *proxy* de Next.js, que revisa la cookie de sesión;
    - cada página y cada operación del servidor, que vuelven a leer la sesión en la base de datos.
- **Cómo:**
    - `src/proxy.test.ts`: «RNF-04: una cookie de otro sistema no permite pasar la primera barrera»;
    - `pruebas-e2e/acceso/permisos.spec.ts`: «RNF-04: primera barrera por sistema y rechazo de acceso directo en el servidor»;
    - ZAP: sin sesión, todas las direcciones internas redirigen a `/acceso`.
- **Resultado:** **aprobada.** Ninguna ruta interna se abre sin sesión, y una sesión del sitio no abre el picking ni al revés.

## Permisos

- **Qué se verificó:**
    - que cada operación compruebe el permiso del usuario por módulo y acción (RN-38) y su sede (RN-17) antes de leer o cambiar datos;
    - que un usuario no pueda acceder a funciones que no le corresponden, ni desde la pantalla ni llamando directamente a la operación;
    - el detalle por perfil está en la sección 4.
- **Cómo:**
    - `pruebas-e2e/acceso/permisos.spec.ts` (RN-38 y «RN-17 / RF-SL-66: cookie ajena se ignora»);
    - pruebas de integración «otra sede» con envíos reales de la sede 2, en Bodega y en Ruta;
    - la regla de Semgrep que exige la verificación del permiso en cada operación del servidor;
    - la revisión manual de las 82 operaciones.
- **Resultado:** **aprobada.** La revisión encontró que la exportación de reportes usaba la primera sede del usuario y no la elegida (INC-29). Se corrigió en JG-26 con la prueba «RNF-04 (R-P01)».
- **Pendiente:** pedir la contraseña propia antes de restablecer la de una cuenta de acceso total (INC-35, CE-14).

## Sesiones

- **Qué se verificó:**
    - Sesiones de Better Auth con un token aleatorio que se verifica en la base de datos en cada petición.
    - Cookies con el prefijo `__Host-`, `HttpOnly`, `Secure` y `SameSite=Lax`.
    - La sesión se revoca al cerrarla, al desactivar o eliminar al usuario y al restablecer su contraseña.
    - Volver a iniciar sesión cierra la sesión anterior del mismo sistema.
    - Límite de intentos (RNF-15): 5 fallidos por usuario y 20 por dirección IP en 15 minutos, con bloqueo de 15 minutos.
- **Cómo:**
    - `src/app/acceso/servicio.test.ts`, `src/lib/cookies.test.ts`;
    - `pruebas-e2e/acceso/sesiones-jg26.spec.ts`, `pruebas-e2e/acceso/acceso-personal.spec.ts` (CP-45 a CP-50);
    - la comprobación de la cookie a través de Caddy en el flujo de la imagen de producción.
- **Resultado:** **aprobada.** Riesgos aceptados: no hay vida máxima absoluta de la sesión ni autenticación de dos factores (INC-39).

## Carga de archivos

- **Qué se verificó:**
    - **Imágenes del panel:**
        - solo se aceptan JPEG, PNG o WebP según su contenido real, no según la extensión; no se aceptan SVG ni GIF;
        - máximo 5 MB por imagen y 5 imágenes por galería;
        - el servidor las vuelve a codificar a WebP y las guarda con un nombre aleatorio.
    - **Archivo de Odoo:**
        - solo .xlsx, comprobado por su firma, de hasta 2 MB;
        - desde JC-10, con límites contra la bomba ZIP (INC-28): 100 entradas, 50 MB descomprimidos, 20 000 filas y largos máximos por campo;
        - el archivo no se guarda.
- **Cómo:**
    - pruebas de almacenamiento: «rechaza SVG, GIF, texto renombrado…»;
    - pruebas del lector de Odoo, con regresiones «ASVS V5.2.3» que incluyen una bomba de 50 MB + 1 byte;
    - caso CP-28: un archivo que no es .xlsx y uno de más de 2 MB.
- **Resultado:** **aprobada.** La única incidencia Alta del proyecto (INC-28) se encontró aquí y está corregida.

## Validación de entradas

- **Qué se verificó:**
    - Toda entrada se valida con Zod en el servidor, además de en el navegador (RNF-05).
    - Las consultas a la base de datos usan Prisma o plantillas con parámetros.
    - Hay topes de longitud: 10 000 caracteres en los textos del panel y 2000 en el mensaje y el comentario de Contacto.
    - El formulario de Contacto acepta 5 envíos por dirección IP por hora y tiene un campo trampa contra robots.
    - El Excel exportado guarda como texto los valores que empiezan con `=` (inyección de fórmulas).
    - El detalle de los casos está en la sección 5.
- **Cómo:**
    - pruebas `RNF-05:` de Contenido, Noticias, Catálogo, Documentos y Solicitudes;
    - `pruebas-e2e/sitio/nosotros.spec.ts`: publica un texto con `<script>` y comprueba que se muestra como texto y no se ejecuta;
    - `pruebas-e2e/sitio/contacto.spec.ts`.
- **Resultado:** **aprobada.** Pendiente: traducir al español los mensajes de validación que llegan ante peticiones manipuladas en usuarios y camiones (INC-37, CE-14).

## Protección de información interna

- **Qué se verificó:**
    - el repositorio no tiene secretos ni datos reales (RNF-10, gitleaks);
    - la aplicación no arranca en producción con las claves de ejemplo;
    - los mensajes de error no muestran detalles técnicos, y el registro del servidor no guarda datos personales;
    - la bitácora no se puede modificar ni borrar, porque un disparador de la base de datos lo impide;
    - la documentación interna muestra la vista previa o la descarga según el permiso del usuario (RN-19);
    - las cabeceras de seguridad: CSP con *nonce* por respuesta, HSTS, `X-Content-Type-Options: nosniff`, `frame-ancestors 'none'`, `Referrer-Policy` y `Permissions-Policy`.
- **Cómo:**
    - `pruebas-e2e/seguridad/cabeceras.spec.ts` y `src/lib/cabeceras.test.ts`;
    - CP-57;
    - ZAP;
    - `npm audit`, sin vulnerabilidades.
- **Resultado:** **aprobada.** ZAP no reportó alertas de riesgo alto. Las alertas bajas se corrigieron o se justificaron (INC-32 e INC-33).

## Pruebas pendientes en producción {-}

TLS, Caddy y Docker se evaluaron con la configuración del repositorio, porque el sistema todavía no está desplegado. El escaneo de ZAP y la comprobación de las cabeceras se repiten en producción, con HTTPS, en el primer despliegue (JG-19, 07/11/2026). Su resultado se agrega en la versión 1.1.
