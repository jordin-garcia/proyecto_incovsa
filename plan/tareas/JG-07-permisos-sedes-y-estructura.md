---
id: JG-07
titulo: Permisos, sedes y estructura conectada a la sesión
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: pendiente
depende_de: [JG-06]
programada: 2026-10-17
requisitos: [RF-SW-25, RF-SL-55, RF-SL-66, RN-17, RN-38, RN-46, RNF-04, RNF-13]
pantallas: [panel.js › armazon, Panel.SECCIONES, sinAcceso; picking.js › vista, ruta; base.js › tiene, esTotal, esPiloto, enSistema, sedesDe, accesoModulo, sedeTrabajo]
---

# JG-07 · Permisos, sedes y estructura conectada a la sesión

**Responsable:** Jordin García · **Hito:** E2 · **Prioridad:** P1 · **Programada:** sáb 17/10 · **Depende de:** JG-06

## Objetivo
Implementar la verificación de **permisos y sedes en el servidor** (`exigirPermiso`), la sede de trabajo, la primera barrera (`proxy.ts`), la conexión del armazón del panel y del picking con la sesión y los permisos, y la versión inicial del aviso de cambios en tiempo real. Desde aquí, cualquier módulo puede escribir sus acciones del servidor de forma segura.

## Contexto que debes leer
- `specs/03-roles-y-accesos.md` §"Modelo de permisos", §"Catálogo de permisos", §"Sedes" y §"Pilotos"
- `specs/12`: RN-17, RN-38 y RN-46; `specs/15`: RNF-04 y RNF-13
- `specs/16`: "Autorización en el servidor" y decisiones 7, 8, 10, 40, 55
- Prototipo: `base.js` › `tiene()`, `esTotal()`, `esPiloto()`, `enSistema()`, `sedesDe()`, `accesoModulo()`, `sedeTrabajo()` y `fijarSede()`; `panel.js` › `Panel.SECCIONES` (qué permiso abre cada sección del panel) y `sinAcceso()`; `picking.js` › `vista()` y `ruta()` (módulos visibles, enlace al Tablero con `pk.bodega`, selector de sede)
- `## Resultado` de JG-05 y JG-06
- Context7: Next.js 16 (`proxy.ts`, componentes del servidor, `cookies()`, `router.refresh()`)

## Qué hacer
1. `src/modulos/permisos/`:
   - `exigirPermiso(sesion, permiso, sede?)`: lanza un error de acceso (sin revelar qué datos existen) si no hay sesión, si el usuario no tiene el permiso o si la sede no está entre las suyas. Gerencia y Soporte pasan siempre, por su **rol** (`esAccesoTotal`, decisión 7). Es la **única** función que usan todas las operaciones del servidor;
   - `tienePermiso(sesion, permiso)` (para mostrar u ocultar botones, que no es control de acceso);
   - `sedesDelUsuario(sesion)` (todas para Gerencia y Soporte) y `esPiloto(sesion)` (rol "Piloto" con `normalizarRol`, RN-46);
   - `accesoModulo(sesion, modulo)` para Facturación, Bodega, Ruta (`pk.ruta.propias` o `pk.ruta.todas`), Reportes y Configuración (acceso total o `pk.cfg.camiones`), igual que el prototipo.
2. **Sede de trabajo** (decisión 55): se guarda en una cookie al elegirla en el selector; `obtenerSedeDeTrabajo(sesion)` la valida contra las sedes del usuario en cada petición y, si no es válida o no existe, usa la primera de sus sedes.
3. **`src/proxy.ts`**: redirige a `/acceso` a quien entra a `/panel/**` sin la cookie de sesión del sitio o a `/picking/**` sin la del picking. Es solo una primera barrera (specs/16).
4. **Armazón conectado:** `src/app/panel/layout.tsx` muestra solo las secciones del panel que permiten sus permisos (las mismas reglas que `Panel.SECCIONES`; "Usuarios" solo para Gerencia y Soporte) y `src/app/picking/layout.tsx`, solo los módulos permitidos y "Tablero" con `pk.bodega`, con el selector de sede y la caja del usuario reales. Quitar las páginas temporales de JG-05: `/panel` y `/picking` redirigen a la primera sección o módulo permitido. Una sección o módulo sin permiso muestra la pantalla de `sinAcceso()`.
5. **Tiempo real, versión inicial** (decisión 10: en el Entregable 2 se empieza con consulta periódica):
   - servidor: `src/modulos/tiempo-real/servidor.ts` › `avisarCambio(sede)` (por ahora no hace nada; JG-10 la implementa con SSE);
   - cliente: `src/modulos/tiempo-real/cliente.ts` › `useCambiosDeSede(sede)`, que llama a `router.refresh()` cada `TIEMPO_REAL_CONSULTA_MS` (5000) mientras la pantalla está visible. JG-10 cambia solo el interior, sin cambiar esta interfaz.
6. **Prueba de seguridad transversal:** `src/modulos/permisos/acciones.test.ts` con un ayudante que, dada una acción del servidor y su permiso, comprueba que rechaza a un usuario sin sesión, sin el permiso y de otra sede. Todas las tareas con acciones lo usan (`plan/convenciones.md` §6).

## Archivos que creas o modificas
- `src/modulos/permisos/**`, `src/modulos/tiempo-real/**` (crear)
- `src/proxy.ts` (crear)
- `src/app/panel/layout.tsx`, `src/app/picking/layout.tsx`, `src/app/panel/page.tsx`, `src/app/picking/page.tsx` (modificar), `src/componentes/comunes/armazon/**` (modificar)
- `pruebas/permisos.ts` (ayudante de pruebas de permisos) (crear)
- `pruebas-e2e/acceso/permisos.spec.ts` (crear)

## Criterios de aceptación
1. **RN-38:** un usuario con rol " gerencia " y sin casillas tiene acceso a todos los módulos de los dos sistemas y a las tres sedes; uno con rol "Facturador" y solo `pk.facturacion` solo ve Facturación.
2. **RN-17 / RF-SL-66:** un usuario con solo la sede Quetzaltenango no puede leer ni cambiar datos de Guatemala, ni desde la pantalla ni cambiando la cookie de sede o la petición.
3. **RNF-04:** `exigirPermiso` rechaza sin sesión, sin permiso y con otra sede; el error no revela si el recurso existe.
4. **RN-46:** `esPiloto` es verdadero para "Piloto", " piloto " y "PILOTO", y falso para otros roles.
5. El panel y el picking muestran solo lo permitido para `ejemplo.03`, `ejemplo.05`, `ejemplo.06`, `ejemplo.08`, `ejemplo.09` y `ejemplo.01`, igual que el prototipo con las mismas cuentas.
6. Entrar a `/picking/bodega` sin sesión del picking lleva a `/acceso`; con sesión pero sin `pk.bodega`, muestra la pantalla de sin acceso.
7. `useCambiosDeSede` vuelve a pedir la página cada 5 segundos mientras la pestaña está visible.

## Pruebas obligatorias
- Unitarias de `exigirPermiso`, `accesoModulo`, `esPiloto` y la sede de trabajo (criterios 1 a 4)
- `pruebas-e2e/acceso/permisos.spec.ts` (criterios 5 y 6)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/acceso
```

## Fuera de alcance
- El aviso real por SSE (JG-10).
- Las pantallas de los módulos.

## Notas
- En el `## Resultado`, deja el patrón exacto de una acción del servidor (`plan/convenciones.md` §4.1) con `exigirPermiso`, Zod, el servicio, la bitácora en la transacción y `avisarCambio`, y cómo usar el ayudante de `pruebas/permisos.ts`. Lo copian todas las tareas de módulos.
