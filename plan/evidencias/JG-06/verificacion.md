# Verificación de JG-06 · 18/10/2026

Entorno local desechable con PostgreSQL 18.6 nativo, sin datos ni credenciales de INCOVSA. Node 24.13.0 y npm 11.19.0; GitHub CLI autenticado como `jordin-garcia`. Context7 consultado para Better Auth, Next.js, Prisma, Zod, React Hook Form, Vitest y Playwright; APIs contrastadas también con los paquetes instalados.

| Comprobación | Resultado |
|---|---|
| `npm ci` | 687 paquetes instalados; auditoría: 0 vulnerabilidades |
| `npm run db:aplicar` | Las dos migraciones se aplicaron desde cero a una base nueva |
| `npm run db:reiniciar` | Autorizado expresamente por Jordin; `Database reset successful`, dos migraciones aplicadas a `incovsa_jg06_reinicio` en `127.0.0.1:55436` |
| `npm run db:semilla` | Semilla base cargada |
| `npm run semilla:demo` | 11 cuentas, 3 camiones y 28 productos de ejemplo |
| `npm run verificar` | Formato, lint y tipos aprobados; **9 archivos y 108 pruebas aprobadas** |
| `npm run build` | Compilación de producción y TypeScript aprobados; rutas de acceso y API generadas correctamente |
| `node --test "scripts/*.test.mjs"` | **109 pruebas aprobadas**, ninguna omitida |
| `node scripts/tareas.mjs --validar` | Plan válido: 62 tareas |
| `npm run e2e -- --workers=1` | **63 pruebas aprobadas**, teléfono, tableta y escritorio, 5 minutos |
| `npm run crear-admin` | Terminal interactiva: las contraseñas no tuvieron eco; cuenta `ambos` creada |
| next-devtools `get_errors`, puerto 3000 | `configErrors: []`, `sessionErrors: []` |
| Revisión independiente | **LISTO**, después de corregir el mensaje de Zod y hacer efectiva la comprobación de cookies; revisión adicional de la corrección UTC también LISTO |

## Incidencias corregidas durante la verificación

- La prueba de cuentas eliminadas detectó que Better Auth intentaba crear una sesión antes de devolver el error del gancho. El servicio usa una consulta inexistente de Better Auth cuando no hay cuenta elegible; no valida la contraseña de una cuenta inactiva ni crea sesión.
- axe encontró el contraste 4.46:1 del gris del prototipo sobre `--g50` y un nombre accesible incompleto en Odoo. Se usa `--g600` y el texto completo del botón como nombre accesible.
- El error de un campo de contraseña vacío movía el enlace de ayuda durante el primer clic. Se muestra al intentar ingresar, sin interferir con la apertura de la ayuda. Se eliminó una actualización innecesaria del enrutador al recibir un error de credenciales.
- Las pruebas generales detectaron un desfase de seis horas con PostgreSQL local en `America/Guatemala`. Se fijó UTC por conexión y se agregó una prueba que falló antes de la corrección. Pasan tanto la nueva prueba como RN-57 del esquema, sin cambiar sus umbrales.
- Se separaron las IP de los navegadores de prueba para que los fallos de distintos proyectos y trabajadores no activen el bloqueo de una IP compartida. El servicio conserva los límites reales; las pruebas de concurrencia y de bloqueo usan PostgreSQL real.
- Una ejecución bajo compilación y pruebas simultáneas agotó tiempos locales. La ejecución final completa del navegador, sin esas cargas concurrentes, aprobó las 63 pruebas sin cambiar tiempos máximos, exclusiones ni criterios.

## Reinicio autorizado

Prisma rechazó inicialmente `npm run db:reiniciar` (`prisma migrate reset --force`) mediante su protección para agentes de IA. Jordin autorizó expresamente reiniciar únicamente `incovsa_jg06_reinicio` en `127.0.0.1:55436`, una base desechable vacía creada para esta comprobación. El comando se repitió con ese consentimiento y terminó con `Database reset successful`; aplicó las dos migraciones. Después se ejecutaron `npm run db:semilla` y `npm run semilla:demo` sobre ese mismo destino, ambas correctamente. No se reinició ninguna otra base.

La aplicación y las pruebas se verificaron en otras dos bases desechables migradas desde cero. El archivo de la tarea registra el cierre y las interfaces que usarán las tareas siguientes.
