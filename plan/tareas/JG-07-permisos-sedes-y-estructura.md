---
id: JG-07
titulo: Permisos, sedes y estructura conectada a la sesión
persona: jordin
responsable: Jordin García
hito: E2
prioridad: P1
estado: hecha
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

## Resultado

### Interfaces para las tareas de módulos

- `@/modulos/permisos/servicio`: `exigirPermiso(sesion, codigo, sedeId?)`, `tienePermiso`, `accesoModulo`, `esPiloto`, `sedesDelUsuario` (asíncrona) y `ErrorAcceso`. Las operaciones reciben la sesión de `obtenerSesion`, nunca del navegador. El error genérico no revela si existe un recurso. Se respeta la sesión de cada sistema, incluso para Gerencia y Soporte.
- `@/modulos/permisos/sede`: `obtenerSedeDeTrabajo(sesion)` devuelve la sede autorizada o `null`. La cookie `incovsa-sede` es HttpOnly, SameSite=Lax, Secure en producción y limitada a `/picking`. Se valida en cada petición; una cookie ausente o ajena usa la primera sede asignada. Las sedes de acceso total se consultan en la base, sin una lista fija.
- `@/modulos/permisos/navegacion`: reglas del panel y del picking, con Documentación interna abierta por cualquiera de sus tres permisos, Usuarios solo para acceso total y Tablero con `pk.bodega`. `exigirAccesoPantalla` autoriza en el servidor; no sustituye los controles de las lecturas y acciones del módulo.
- `@/modulos/tiempo-real/servidor`: `avisarCambio(sedeId)` conserva una interfaz estable y, por ahora, no hace nada. Debe llamarse después de confirmar la transacción.
- `@/modulos/tiempo-real/cliente`: `useCambiosDeSede(sedeId | null)` llama a `router.refresh()` cada 5000 ms con la pestaña visible. Limpia el intervalo al cambiar de sede o desmontarse. El armazón ya lo monta: los módulos no deben agregar otro intervalo. JG-10 cambia el interior por SSE.

### Patrón de acción, servicio y bitácora

Ejemplo para adaptar con el esquema, permiso, operación y selección mínima del módulo:

```ts
// acciones.ts
"use server";
import { obtenerSesion } from "@/lib/sesion";
import { exigirPermiso, ErrorAcceso } from "@/modulos/permisos/servicio";
import { obtenerSedeDeTrabajo } from "@/modulos/permisos/sede";
import { avisarCambio } from "@/modulos/tiempo-real/servidor";
import { aResultadoDeError } from "@/lib/errores";
import { esquemaEntrada } from "./esquemas";
import { guardar } from "./servicio";

export async function guardarAccion(entrada: unknown) {
  try {
    const sesion = await obtenerSesion("picking");
    const sede = await obtenerSedeDeTrabajo(sesion);
    exigirPermiso(sesion, "pk.bodega", sede?.id);
    if (!sede) throw new ErrorAcceso();
    const datos = esquemaEntrada.parse(entrada);
    const resultado = await guardar(datos, { usuarioId: sesion.usuario.id, sedeId: sede.id });
    avisarCambio(sede.id);
    return { ok: true as const, datos: resultado };
  } catch (error) {
    return aResultadoDeError(error);
  }
}

// servicio.ts: usuarioId y sedeId proceden de la sesión autorizada.
// Dentro de guardar:
return prisma.$transaction(async (tx) => {
  // Buscar/cambiar SIEMPRE con where: { id: datos.id, sedeId }.
  // Aplicar la regla de negocio y seleccionar únicamente los campos necesarios.
  await registrarBitacora(tx, {
    sistema: "picking",
    operacion, // Texto exacto de specs y del prototipo; no registrar las excepciones de RN-39.
    entidad,
    registroId,
    usuarioId,
    detalle,
  });
  return resultadoMinimo;
});
```

Si una entrada admite elegir explícitamente una sede, validarla con Zod y pasar esa sede a `exigirPermiso` antes de consultar datos de negocio. Un ID de recurso no autoriza a leer otra sede: todas las consultas, actualizaciones y eliminaciones incluyen `sedeId`. Las acciones sin sede (por ejemplo, contenido del sitio) omiten ese argumento.

### Ayudante de seguridad transversal

`pruebas/permisos.ts` exporta `comprobarRechazosDeAccion({ accion, establecerSesion, sesion, permiso, entrada, entradaOtraSede })`. Genera tres pruebas RNF-04/RN-17: sin sesión, sin permiso y de otra sede. `accion` es la acción real; `establecerSesion` configura únicamente la sesión leída por ella mediante el adaptador de prueba. La base sigue siendo PostgreSQL real, sin simular Prisma. En `src/modulos/permisos/acciones.test.ts` hay un ejemplo completo con `cambiarSede`. Cada módulo agrega también sus pruebas funcionales y de persistencia.

### Integración de las pantallas

Los layouts usan `ArmazonServidor` y `ArmazonConSesion`, con usuario, permisos, sedes y cierre de sesión reales. `/panel` y `/picking` redirigen al primer destino permitido; Resumen usa `/panel/resumen` para evitar una redirección circular (precisión en specs/05 y specs/18).

Las rutas `[...seccion]` conectan los destinos y la pantalla `SinAcceso` mientras llegan las tareas de módulos; solo muestran el nombre del módulo autorizado, sin simular datos ni operaciones. Las páginas concretas de los módulos tienen prioridad sobre esas rutas y deben autorizar sus propias lecturas y acciones. Las muestras completas de JG-05 se mantienen en `/muestras/panel` y `/muestras/picking`, solo en desarrollo, para conservar todas sus pruebas.

El proxy distingue las cookies de cada sistema y reenvía todas las cabeceras Set-Cookie de renovación de `leerSesion`. La consulta de bitácora de JG-06 ya usa `exigirPermiso`.

El cambio de sede se ejecuta en una transición: mientras espera al servidor, deshabilita el selector y pausa el intervalo; al terminar pide el estado actualizado. Evita que una consulta de la sede anterior sobrescriba el selector. Ambos layouts son dinámicos para que la sesión nunca se prerenderice durante la compilación.

### Evidencia

- [Comparación de armazones y estados de acceso denegado](../evidencias/JG-07/README.md).
- [Verificación local](../evidencias/JG-07/verificacion.md).
- [Revisión independiente](../evidencias/JG-07/revision.md).

### Correcciones de la auditoría (2026-10-22)

H-39: un módulo inexistente muestra «Módulo no encontrado» dentro del armazón, después de comprobar la sesión. No se amplían permisos ni sedes.
