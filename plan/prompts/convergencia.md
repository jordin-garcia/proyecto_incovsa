# Instrucciones para la revisión de convergencia

Úsalas en las tareas de convergencia del coordinador (JG-12, JG-13 y JG-17). El objetivo es comparar **lo que dicen `specs/` y el prototipo** con **lo que hay en `develop`** y convertir cada brecha en una tarea, para que el 02/11/2026 todo esté implementado.

## Pasos
1. `git switch develop && git pull --ff-only`. Luego `node scripts/tareas.mjs` para ver el estado general.
2. Levanta la aplicación (`plan/instalacion.md` §5) con `npm run db:reiniciar` y `npm run semilla:demo`, y el prototipo (`node scripts/servir-prototipo.mjs`).
3. Por cada requisito de `specs/04-requerimientos-funcionales.md` (RF-SW y RF-SL vigentes, nuevos o modificados), cada regla de `specs/12-reglas-de-negocio.md` y cada RNF de `specs/15` que corresponde a lo integrado hasta hoy según `plan/calendario.md`:
   - busca el código que lo implementa y la prueba que lo verifica (busca el código del requisito en `src/` y `pruebas-e2e/`);
   - clasifícalo como ✅ cumplido, ⚠️ parcial (falta prueba, algún criterio, algún texto o alguna pantalla) o ❌ ausente.
4. Recorre con Playwright, lado a lado con el prototipo, las pantallas integradas y el guion de la próxima demostración (`plan/calendario.md`), y anota cada diferencia de texto, orden, dato, estado o color.
5. **Por cada ⚠️ o ❌ que no tenga ya una tarea pendiente**, crea una tarea nueva con `plan/tareas/_plantilla.md`, asignada a su dueño según `plan/convenciones.md` §2, con el siguiente número libre de esa persona y prioridad P1 si la demostración o el flujo completo no funcionan sin ella.
6. **Reprograma el calendario** para que el 02/11 siga siendo alcanzable: cambia la `programada` de las tareas atrasadas o nuevas (y de las que dependen de ellas), y ejecuta `node scripts/tareas.mjs --calendario --escribir` y `node scripts/tareas.mjs --validar`. Nada del alcance se recorta (specs/16, decisión 68).
7. Escribe el informe en `plan/convergencia/<AAAA-MM-DD>.md`: la tabla de requisitos (✅/⚠️/❌), las diferencias con el prototipo, las tareas creadas y las fechas que cambiaste.
8. Cierra tu tarea de convergencia con el protocolo normal. El PR incluye el informe y las tareas nuevas.

## Reglas
- No implementes nada: solo evalúa y crea tareas.
- No cambies las decisiones de `specs/`. Si encuentras una contradicción, anótala como **❓ Decisión pendiente** para el coordinador.
