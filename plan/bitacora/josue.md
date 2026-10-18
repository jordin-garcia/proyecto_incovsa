# Bitácora de Josué Menéndez

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-17 · JM-01 · Herramientas obligatorias del agente (Codex)
- Hecho: Se verificó el entorno base en Windows (Node.js 24.21.0, npm 11.19.0, Git 2.55.0 con core.autocrlf false, GitHub CLI 2.102.0 autenticado con Josh-JM, PostgreSQL 18.6). Se instaló Codex CLI globalmente y se configuraron los servidores MCP obligatorios (Context7, Playwright, next-devtools y shadcn) en ~/.codex/config.toml y ~/.gemini/antigravity/mcp_config.json (con respaldo en ~/.gemini/config/mcp_config.json). Se comprobó la consulta a Context7 con Server Actions de Next.js 16 y la ejecución de Playwright abriendo el prototipo local en http://127.0.0.1:4173/ y capturando la página de inicio.
- Decisiones: Se mantiene la configuración para Codex en Windows y Antigravity en paralelo conforme a las decisiones 84 y 86 de specs/16. Context7 opera inicialmente con acceso sin token (nivel gratuito) hasta que se configure opcionalmente clave de API. Modo de trabajo con aislamiento activo (sandbox_mode = "workspace-write", approval_policy = "on-request") y proyecto marcado como confiable (trust_level = "trusted").
- Pendiente o aviso para otros: Ninguno (la tarea JM-02 de conversión queda desbloqueada para Josué).

## 2026-10-17 · JM-02 · Conversión de kilogramos a unidades
- Hecho: Se implementó el servicio de conversión en `src/modulos/conversion/servicio.ts` y el componente de interfaz `src/componentes/picking/bodega/Unidades.tsx`. El cálculo opera en gramos enteros (`BigInt`) sin usar aritmética de punto flotante para cumplir con exactitud RN-01, RN-05 y RN-21. Se agregaron 31 pruebas unitarias y de propiedades en `src/modulos/conversion/servicio.test.ts` que validan los 15 casos aprobados por INCOVSA (CP-01 a CP-15), casos con resto (CP-16 a CP-18), conversiones exactas, validación de Peso de Conversión inválido (RN-50 con `ErrorNegocio`), propiedades algebraicas con fast-check (1,000 iteraciones con cadenas y Decimal de Prisma) y renderizado del componente visual.
- Decisiones: Se admite polimorfismo de entrada (`string`, `Prisma.Decimal`, `number`) parseando a gramos enteros; el Peso de Conversión menor o igual a cero lanza `ErrorNegocio`; se exportan utilidades auxiliares `fmt`, `textoUnidades`, `textoConversion` y `htmlConversion` idénticas a `base.js` del prototipo.
- Pendiente o aviso para otros:
**JM-03:** Puedes importar `convertir`, `textoConversion` desde `@/modulos/conversion/servicio` y usar el componente `<Unidades />` desde `@/componentes/picking/bodega/Unidades` para la tabla de preparación y el detalle.
**JC-06:** La lógica de conversión requerida para Reportes está disponible en `@/modulos/conversion/servicio` (`convertir`, `textoConversion`).
**JM-05:** El componente `<Unidades />` y el cálculo de conversión están listos para la proyección del tablero en pantalla completa.

