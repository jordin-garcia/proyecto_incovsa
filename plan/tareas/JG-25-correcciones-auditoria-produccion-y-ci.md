---
id: JG-25
titulo: Correcciones de la auditoría del 22/10 en configuración, producción y CI
persona: jordin
responsable: Jordin García
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-12]
programada: 2026-10-27
requisitos: [RF-SL-04, RF-SL-57, RNF-09, RNF-12, RNF-13, RNF-16, RNF-18]
pantallas: [panel.js › eliminarUsuario (limpieza del piloto)]
---

# JG-25 · Correcciones de la auditoría del 22/10 en configuración, producción y CI

**Responsable:** Jordin García · **Hito:** E3 · **Prioridad:** P1 · **Programada:** mar 27/10 · **Depende de:** JG-12

## Objetivo
Corregir los hallazgos del paso 5 de la auditoría del 22/10 y los del paso 4 que tocan scripts y la CI. Así la producción se verifica a través de Caddy con todas las cabeceras y con SSE (RNF-16, RNF-13), la CI detecta diferencias entre el esquema y las migraciones, y Configuración limpia las opciones de envío como el prototipo. Son correcciones del coordinador sobre tareas ya integradas (`plan/protocolo.md` §E3).

## Contexto que debes leer
- `plan/auditorias/2026-10-22.md`, paso 4 (H-27, H-28, H-36 y H-37) y paso 5 (H-40 a H-55), con las ❓ D-03, D-04 y D-05
- `plan/protocolo.md` §E3
- `specs/11-picking-configuracion.md`; `specs/15`: RNF-09, RNF-12, RNF-13 y RNF-16; `specs/16`: decisiones 29, 58 y 70, y "Seguridad"
- Prototipo: `panel.js` › `eliminarUsuario()` (l. 124); `picking.js` › `configuracion()`
- `## Resultado` de JG-02, JG-03, JG-06, JG-08, JG-11, CE-02, CE-03, CE-05, CE-06 y CE-07

## Qué hacer
1. **Producción a través de Caddy (H-46, H-47, H-48 y H-51):** en `produccion-imagen.yml`, comprobar con `curl -I` todas las cabeceras de JG-11 (y que HSTS salga una sola vez), y abrir `/api/tiempo-real` con sesión exigiendo el primer evento. Ampliar `paths` a `next.config.ts`, `src/lib/cabeceras.ts` y `src/proxy.ts`. Dejar la aplicación de la imagen de root y de solo lectura.
2. **Configuración de producción (H-49, H-50 y H-37):** `:produccion` como imagen por omisión, el límite de 27 MB registrado en `specs/16` y `specs/18`, y rechazar en producción los secretos de ejemplo («cambie-esto…»).
3. **Despliegue y respaldos (H-52 a H-55):** pasar `github.ref` por `env`, quitar el disparador de `ce-06-prueba` y borrar la rama, preparar la poda para una organización, y cubrir el modo `docker compose exec` de los respaldos en una verificación automática.
4. **CI (H-28, H-27 y H-40):** `prisma migrate diff --exit-code` en la CI; una prueba para las variables de `.env.example` y los nombres de los scripts; y que el veredicto acepte solo el comentario del flujo de `revision-claude`.
5. **Configuración (H-41 a H-45 y H-36):** probar con `consultarOpciones` que un camión eliminado desaparece de Facturación; al eliminar o desactivar un piloto, limpiar su selección en «Envío por camión» como el prototipo; documentar la excepción de Semgrep de las acciones de usuarios; probar los registros de un usuario eliminado en Reportes; y `normalizarRol` y los mensajes en `crear-admin`. Antes se preguntan D-03 y D-04.
6. **D-05:** si Jordin lo confirma, documentar el respaldo de la configuración del VPS para el Documento 5 (CE-11).
7. En el `## Resultado` de cada tarea corregida, agregar `### Correcciones de la auditoría (2026-10-22)`. Su estado no cambia.

## Archivos que creas o modificas
- `.github/workflows/ci.yml`, `.github/workflows/produccion-imagen.yml`, `.github/workflows/despliegue.yml`, `.github/workflows/produccion-respaldo.yml`
- `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.env.produccion.example`, `src/lib/auth-configuracion.ts`
- `scripts/veredicto-revision.mjs`, `scripts/administrador.ts`, `scripts/crear-admin.ts`, `scripts/*.test.mjs`
- `src/modulos/camiones/**`, `src/modulos/usuarios/**` y sus pruebas
- `specs/16-arquitectura-y-tecnologia.md`, `specs/18-historial-de-decisiones.md` (H-50 y lo que decidan las ❓)
- `plan/tareas/` de las tareas corregidas (solo la sección de correcciones); `plan/bitacora/jordin.md` (con el aviso para Carlos)

## Criterios de aceptación
1. **RNF-16 (H-46, H-48):** el flujo de la imagen de producción falla si a través de Caddy falta CSP, HSTS, `nosniff`, `Referrer-Policy` o `frame-ancestors`, o si HSTS sale dos veces.
2. **RNF-13 (H-47):** el flujo falla si el primer evento de `/api/tiempo-real` no llega a través de Caddy en pocos segundos.
3. **RNF-18 (H-28):** la CI falla si `schema.prisma` y las migraciones no coinciden (comprobado con un PR de prueba que se cierra sin integrar).
4. **RF-SL-04 (H-41):** una prueba con `consultarOpciones` comprueba que un camión eliminado ya no se ofrece en Facturación.
5. **RF-SL-57 (H-43, H-45):** al eliminar o desactivar un piloto, su selección en «Envío por camión» se limpia, y sus registros siguen en Reportes con su nombre.
6. **RNF-09 (H-55):** el modo `docker compose exec` del respaldo y la restauración se ejecuta en una verificación automática.
7. Cada hallazgo restante (H-27, H-36, H-37, H-40, H-42, H-44 y H-49 a H-54) tiene su corrección y, donde se puede, una prueba que lo habría detectado.

## Pruebas obligatorias
- Una prueba o verificación por hallazgo (criterios 1 a 7)
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
