---
id: JG-25
titulo: Correcciones de la auditoría del 22/10 en configuración, producción y CI
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: hecha
depende_de: [JG-12]
programada: 2026-10-27
requisitos: [RF-SL-04, RF-SL-57, RNF-09, RNF-12, RNF-13, RNF-16]
pantallas: [panel.js › eliminarUsuario (limpieza del piloto)]
---

# JG-25 · Correcciones de la auditoría del 22/10 en configuración, producción y CI

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JG-12

## Objetivo
Corregir los hallazgos del paso 5 de la auditoría del 22/10 y los del paso 4 que tocan scripts y la CI. Así la producción se verifica a través de Caddy con todas las cabeceras y con SSE (RNF-16, RNF-13), la CI detecta diferencias entre el esquema y las migraciones, y Configuración limpia las opciones de envío como el prototipo. Son correcciones del coordinador sobre tareas ya integradas (`plan/protocolo.md` §E3).

## Contexto que debes leer
- `plan/auditorias/2026-10-26.md`, paso 3 (H-82 a H-84)
- `plan/auditorias/2026-10-22.md`, paso 4 (H-27, H-28, H-36 y H-37) y paso 5 (H-40 a H-55), con las decisiones D-03, D-04 y D-05 (resueltas al final de la auditoría)
- `plan/protocolo.md` §E3
- `specs/11-picking-configuracion.md`; `specs/15`: RNF-09, RNF-12, RNF-13 y RNF-16; `specs/16`: decisiones 29, 58 y 70, y "Seguridad"
- Prototipo: `panel.js` › `eliminarUsuario()` (l. 124); `picking.js` › `configuracion()`
- `## Resultado` de JG-02, JG-03, JG-06, JG-08, JG-11, CE-02, CE-03, CE-05, CE-06 y CE-07

## Qué hacer
1. **Producción a través de Caddy (H-46, H-47, H-48 y H-51):** en `produccion-imagen.yml`, comprobar con `curl -I` todas las cabeceras de JG-11 (y que HSTS salga una sola vez), y abrir `/api/tiempo-real` con sesión exigiendo el primer evento. Ampliar `paths` a `next.config.ts`, `src/lib/cabeceras.ts` y `src/proxy.ts`. Dejar la aplicación de la imagen de root y de solo lectura.
2. **Configuración de producción (H-49, H-50 y H-37):** `:produccion` como imagen por omisión, el límite de 27 MB registrado en `specs/16` y `specs/18`, y rechazar en producción los secretos de ejemplo («cambie-esto…»).
3. **Despliegue y respaldos (H-52 a H-55):** pasar `github.ref` por `env`, quitar el disparador de `ce-06-prueba` y borrar la rama, preparar la poda para una organización, y cubrir el modo `docker compose exec` de los respaldos en una verificación automática.
4. **CI (H-28, H-27 y H-40):** `prisma migrate diff --exit-code` en la CI; una prueba para las variables de `.env.example` y los nombres de los scripts; y que el veredicto acepte solo el comentario del flujo de `revision-claude`.
5. **Configuración (H-41 a H-45 y H-36):** probar con `consultarOpciones` que un camión eliminado desaparece de Facturación; al eliminar un piloto, limpiar su selección en «Envío por camión» como el prototipo; documentar la excepción de Semgrep de las acciones de usuarios; probar los registros de un usuario eliminado en Reportes; y `normalizarRol` y los mensajes en `crear-admin`. Además, bloquear el cambio de sede de un camión elegido en «Envío por camión» (D-03) y que Gerencia o Soporte desactiven su propia cuenta (D-04), como dice `specs/11`, con sus pruebas.
6. **D-05:** dejar en `evidencia/CE-07/README.md` la nota para el Documento 5 (CE-11) de cómo rehacer el `.env` del VPS desde la plantilla, según `specs/16` («Respaldos»).
7. **Auditoría del 26/10 (agregado en la convergencia 2, JG-13):**
   - **H-82:** corregir el `## Resultado` de JG-08 (la auditoría «2026-10-24» no existe; #117, #119 y #120 ya se integraron) y agregar el agrupamiento de Dependabot a `specs/16`, «Dependencias al día».
   - **H-83:** ejecutar `gh workflow run despliegue.yml -f modo_prueba=true` con las nuevas versiones mayores de las acciones de Docker y guardar el resultado como evidencia.
   - **H-84:** en `pruebas-e2e/flujo/servidor-produccion.ts`, consultar `127.0.0.1`, que es donde escucha el servidor, y dar más tiempo al primer arranque en frío, para que la carpeta `flujo` no falle al primer intento en Windows. Comprobarlo con dos corridas seguidas de `pruebas-e2e/flujo` después de `npm run build`.
8. En el `## Resultado` de cada tarea corregida, agregar `### Correcciones de la auditoría (2026-10-22)`, y `### Correcciones de la auditoría (2026-10-26)` en JG-08 y JG-10 para H-82 a H-84. Su estado no cambia.

## Archivos que creas o modificas
- `.github/workflows/ci.yml`, `.github/workflows/produccion-imagen.yml`, `.github/workflows/despliegue.yml`, `.github/workflows/produccion-respaldo.yml`
- `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.env.produccion.example`, `src/lib/auth-configuracion.ts`
- `evidencia/CE-07/README.md` (D-05); `.semgrep/**` (H-44); `scripts/veredicto-revision.mjs`, `scripts/administrador.ts`, `scripts/crear-admin.ts`, `scripts/*.test.mjs`
- `src/modulos/camiones/**`, `src/modulos/usuarios/**` y sus pruebas
- `specs/16-arquitectura-y-tecnologia.md`, `specs/18-historial-de-decisiones.md` (H-50)
- `pruebas-e2e/flujo/servidor-produccion.ts` (H-84); `specs/16` («Dependencias al día», H-82)
- `plan/tareas/` de las tareas corregidas (solo la sección de correcciones); `plan/bitacora/jordin.md` (con el aviso para Carlos)

## Criterios de aceptación
1. **RNF-16 (H-46, H-48):** el flujo de la imagen de producción falla si a través de Caddy falta CSP, HSTS, `nosniff`, `Referrer-Policy` o `frame-ancestors`, o si HSTS sale dos veces.
2. **RNF-13 (H-47):** el flujo falla si el primer evento de `/api/tiempo-real` no llega a través de Caddy en pocos segundos.
3. **JG-03, criterio 1 (H-28):** la CI falla si `schema.prisma` y las migraciones no coinciden (comprobado con un PR de prueba que se cierra sin integrar).
4. **RF-SL-04 (H-41):** una prueba con `consultarOpciones` comprueba que un camión eliminado ya no se ofrece en Facturación.
5. **RF-SL-57 (H-43, H-45):** al eliminar un piloto, su selección en «Envío por camión» se limpia, y sus registros siguen en Reportes con su nombre.
6. **RNF-09 (H-55):** el modo `docker compose exec` del respaldo y la restauración se ejecuta en una verificación automática.
7. Cada hallazgo restante (H-27, H-36, H-37, H-40, H-42, H-44 y H-49 a H-54) tiene su corrección y, donde se puede, una prueba que lo habría detectado.
8. **D-03 y D-04:** cambiar de sede un camión elegido en «Envío por camión» se rechaza con el aviso de `specs/11`, y Gerencia o Soporte no pueden desactivar su propia cuenta («No puede desactivar su propia cuenta.»).
9. **RNF-09 (D-05):** `evidencia/CE-07/README.md` explica cómo rehacer el `.env` y la configuración de `rclone` del VPS desde la plantilla, y no contiene ningún secreto (lo comprueba el trabajo `secretos` de la CI).
10. **Auditoría del 26/10 (H-82 a H-84):** el Resultado de JG-08 y `specs/16` describen el agrupamiento de Dependabot; `despliegue.yml` corrió en modo prueba con las acciones nuevas; `pruebas-e2e/flujo` pasa dos veces seguidas, sin reintentos, después de `npm run build`.

## Pruebas obligatorias
- Una prueba o verificación por hallazgo (criterios 1 a 10)
- La batería completa de navegador si se toca algo que se ve en la aplicación (protocolo B7)

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
gh pr checks --watch
```

## Fuera de alcance
- Preparar el VPS, el dominio y R2 (CE-08, bloqueada por P-10, P-93 y P-94).
- Los pasos 1 a 3 de la auditoría (JG-23 y JG-24).

## Notas
- Rama `jordin/JG-25-auditoria-produccion-y-ci`. Varios archivos son protegidos o de Carlos: el coordinador los modifica con el aviso en su bitácora (protocolo §E1).

## Resultado

Se corrigieron los 25 hallazgos de la tarea (H-27, H-28, H-36, H-37, H-40 a H-55 y H-82 a H-84) y se aplicaron D-03, D-04 y D-05. Cada corrección tiene una prueba o una verificación automática que la habría detectado. La tabla de cobertura y la evidencia están en [`plan/evidencias/JG-25/README.md`](../evidencias/JG-25/README.md), y cada tarea corregida tiene su sección `### Correcciones de la auditoría`.

### Qué cambió

- **Configuración (CE-02, CE-03):** `editarCamion` rechaza cambiar de sede un camión elegido en «Envío por camión» (D-03); `editarUsuario` rechaza desactivar la propia cuenta (D-04); `eliminarUsuario` quita al piloto de «Envío por camión» y devuelve `sedesConCambios`, que la acción avisa en tiempo real (H-43). Las acciones de usuarios exigen `exigirAccesoTotal(sesion, sistema)` en lugar de un permiso ajeno, con su regla de Semgrep (H-44). H-41 y H-45 ya se cumplían y ahora tienen prueba.
- **Acceso (JG-06):** `crear-admin` usa `normalizarRol` y mensajes propios (`mensajeDeError`, H-36). En producción, `crearAuth` rechaza las claves «cambie-esto…» (H-37): el sitio público responde, pero no se puede iniciar sesión.
- **Producción (CE-05):** Caddy ya no agrega HSTS (la envía Next.js). `produccion-imagen.yml` comprueba a través de Caddy todas las cabeceras con una sola HSTS (H-46, H-48), el primer evento de `/api/tiempo-real` con sesión (H-47) y que el proceso no puede escribir en su código (H-51), y su `paths` incluye las cabeceras, el *proxy*, el tiempo real y `crear-admin`. Compose usa `:produccion` por omisión (H-49). El límite de 27 MB está en `specs/16` y `specs/18` (H-50).
- **Despliegue y respaldos (CE-06, CE-07):** contextos por `env` (H-52), sin la rama `ce-06-prueba` (H-53), poda en `/orgs/` o `/users/` según el dueño (H-54) y una pasada de respaldo y restauración en modo `docker compose exec` (H-55). Nota para el Documento 5 en `evidencia/CE-07/README.md` (D-05).
- **CI (JG-02, JG-03, JG-08):** el trabajo `pruebas` compara la base migrada con `schema.prisma` (H-28); `scripts/auditoria-jg25.test.mjs` cubre `.env.example` y los scripts (H-27); y el veredicto de `revision-claude` solo acepta el comentario que cita una ejecución de ese flujo para el commit (H-40).
- **Auditoría del 26/10:** Resultado de JG-08 y `specs/16` con el agrupamiento de Dependabot (H-82); despliegue en modo prueba con las acciones de Docker nuevas, run 40812088052 (H-83); y el servidor de producción de las pruebas espera en `127.0.0.1` hasta 90 s, con su propio límite (H-84).

### Decisiones tomadas

- **H-28:** se compara la base recién migrada (`--from-config-datasource`) en lugar de usar `--from-migrations`, que en Prisma 7 exige una base *shadow* configurada en `prisma.config.ts`. El resultado es el mismo y no cambia la configuración.
- **H-48:** se quitó la HSTS de Caddy y no la de Next.js, porque la prueba de JG-11 (`seguridad/cabeceras.spec.ts`) la exige en el servidor de la aplicación.
- **H-40:** la cita de la ejecución descarta los comentarios de otros flujos que no la imitan, pero no prueba la autoría. La protección de fondo sigue siendo `archivos-protegidos`.
- **H-36:** se reutilizan los textos de `src/modulos/usuarios/esquemas.ts`. El único texto nuevo es «El rol debe ser Gerencia o Soporte.», de la terminal de `crear-admin`.
- **H-51:** el usuario `nextjs` tiene su carpeta en `/home/nextjs` (antes era `/app`) para que npm y tsx escriban fuera del código.

### Cómo usarlo

- Para iniciar sesión con el servidor de producción en local (por ejemplo, en `pruebas-e2e/flujo`), `.env` necesita dos claves propias: `openssl rand -base64 32` para cada una (`plan/instalacion.md`).
- La administración de usuarios exige `exigirAccesoTotal(sesion, "picking" | "sitio")`. Fuera de `src/modulos/usuarios/acciones.ts`, sigue siendo obligatorio `exigirPermiso`.
- El comentario del bot de revisión lleva «Commit revisado: <sha> · Ejecución: <id>». `scripts/veredicto-revision.mjs` exige `--ejecuciones <archivo>`.
- Para probar la publicación en GHCR sin desplegar: `gh workflow run despliegue.yml -f modo_prueba=true`.

### Verificación

`npm run verificar` y `npm run build` pasan; Semgrep (36 casos y escaneo de `src`) sin hallazgos; la batería de navegador completa pasa por partes (detalle en la evidencia); `produccion-imagen`, `produccion-respaldo` y las verificaciones obligatorias pasan en el PR.
