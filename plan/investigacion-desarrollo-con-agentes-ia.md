# Un arnés en el repositorio gobierna cuatro agentes

> **Informe de investigación del 16/10/2026, solo de consulta.** No es una regla del proyecto. Las decisiones que se tomaron a partir de él, y las que lo contradicen (por ejemplo, la revisión y la integración de los PR con un bot de Claude, sin aprobación humana en `develop`), están en `specs/16-arquitectura-y-tecnologia.md`, decisiones 59 a 70. Si este informe y `specs/` dicen cosas distintas, vale `specs/`.

En octubre de 2026 el mejor método disponible no es un framework concreto (Spec Kit, BMAD, Kiro u OpenSpec). Es lo que la industria llama *harness engineering* aplicado sobre una especificación existente. Sus piezas son: un `AGENTS.md` corto, que hoy leen de forma nativa Claude Code, Cursor, Codex y Antigravity; tarjetas de tarea que citan los IDs de `specs/` y la pantalla del prototipo; sesiones de "una tarea por turno" cuyo estado vive en archivos y en git, y no en la memoria del agente; y, sobre todo, **puertas deterministas** (CI, pruebas escritas antes del código, pruebas de paridad contra el prototipo, escaneos de seguridad y protección de ramas). Esas puertas son las que obligan a cada agente a cumplir la especificación, sin importar el harness o el modelo. La evidencia apunta en la misma dirección desde varios frentes. Anthropic y OpenAI documentan que sus mejores resultados llegaron después de que un humano construyó el arnés y las pruebas. DORA 2025 concluye que la IA "amplifica lo que ya existe" y degrada la estabilidad si no hay pruebas y retroalimentación rápida. Y los benchmarks de 2026 muestran que ningún agente, por sí solo, entrega una interfaz fiel y funcional. INCOVSA ya tiene la parte más cara: 22 archivos de especificación con IDs, decisiones y un prototipo aprobado. Le falta convertir eso en verificaciones ejecutables. Antes de eso hay algo urgente: **la versión de Next.js anotada en `specs/16` (16.4.0) quedó vulnerable el 14/10/2026 a dos fallos críticos de ejecución remota sin autenticación; hay que fijar `next@16.4.1` y `sharp ≥ 0.35.5`**. Una advertencia honesta: la meta de "intervención humana solo cuando falten datos" no está respaldada para todo el sistema. La evidencia sostiene una intervención humana mínima pero no nula, concentrada en revisar planes, pruebas y las rutas de alto riesgo (autenticación, permisos, auditoría y base de datos).

## Tres avisos de seguridad obligan a cambiar versiones antes de escribir código

**[Evidencia, fuente primaria]** El 14 de octubre de 2026 Next.js publicó una actualización fuera de calendario con dos fallos **críticos**. El primero, GHSA-673q-mjm6-r5xr, es una ejecución remota de código sin autenticación ligada a funciones `use cache`. El aviso dice textualmente que no hay mitigación alternativa y que hay que actualizar "aunque tu aplicación no tenga funciones similares". El segundo, CVE-2026-96889, es una ejecución remota en la optimización de imágenes con SVG sobre Linux con glibc, y se mitiga asegurando **`sharp` 0.35.5 o posterior**. El mismo aviso corrige una denegación de servicio en Server Actions que afecta a cualquier app con App Router que tenga al menos una acción. Las versiones corregidas son **16.4.1 (Active LTS)** y 15.5.28 ([Next.js, 14 oct 2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026); [Netlify](https://www.netlify.com/changelog/2026-10-14-nextjs-react-security-vulnerabilities/)). `specs/16-arquitectura-y-tecnologia.md` registra "16.4.0 al 12/10". La regla de la especificación ("la versión más reciente con los parches de seguridad al día") sigue siendo válida, pero el número anotado ya no lo es. Como el proyecto usa `sharp` directamente para recodificar imágenes, la dependencia propia también debe quedar en ≥ 0.35.5. Rechazar SVG por *magic bytes* con `file-type` sigue siendo correcto con cualquier versión.

**[Evidencia, fuentes secundarias]** El aviso de julio de 2026 incluyó CVE-2026-64649, un SSRF en Server Actions en servidores propios cuando la cabecera Host no está fijada ([Next.js, julio 2026](https://nextjs.org/blog/july-2026-security-release); [GitLab Advisory](https://advisories.gitlab.com/npm/next/CVE-2026-64649/)). El de agosto incluyó CVE-2026-75604 (CVSS 9.0), un *path traversal* con ejecución remota en apps alojadas en Windows ([Next.js, agosto 2026](https://nextjs.org/blog/august-2026-security-release)). **[Inferencia]** El VPS es Linux, pero el equipo desarrolla en Windows. Conviene levantar `next dev` solo en `127.0.0.1` y no exponerlo en redes compartidas. No verifiqué si el modo de desarrollo está afectado. Que el despliegue `standalone` detrás de Caddy cuente como "servidor propio" para CVE-2026-64649 tampoco está verificado. Aun así, fijar `Host`/`X-Forwarded-Host` en Caddy, configurar `serverActions.allowedOrigins` y limitar el tamaño del cuerpo de la petición cuesta poco y cubre ambos casos.

**[Evidencia, solo agregadores; sin verificar en GitHub Advisories]** Better Auth acumuló varios CVE en 2026. El más grave para la versión elegida es CVE-2026-67327 (CVSS 8.3): toma de cuentas cuando se combinan el registro abierto con correo y contraseña y el inicio de sesión por *magic link* u OTP. Afecta a versiones anteriores a 1.6.22 y a 1.7.0-beta.0 hasta beta.9 ([CraftedSignal](https://feed.craftedsignal.io/briefs/2026-08-better-auth-takeover/); [GitLab Advisory CVE-2026-45337](https://advisories.gitlab.com/npm/better-auth/CVE-2026-45337/)). **[Inferencia]** INCOVSA usa inicio de sesión por nombre de usuario, así que probablemente no le afecta. Aun así, hay que confirmar que la "1.7" instalada sea una versión estable posterior a 1.7.0-beta.10 y revisar `github.com/better-auth/better-auth/security/advisories` antes de la Fase 0. **No investigado:** avisos de 2026 para Prisma 7, PostgreSQL 18, Caddy, pdfmake y `file-type`. Para SheetJS 0.20.3, instalado desde el CDN y no desde npm, falta comprobar si `npm audit` y Dependabot lo rastrean. Si no lo hacen, alguien debe vigilar a mano la página de avisos de SheetJS.

Hay un cuarto hallazgo urgente, de plataforma y no de seguridad. **En repositorios privados, GitHub no ofrece secret scanning, push protection ni CodeQL en los planes Free ni Pro**. Solo pueden comprarse en Team o Enterprise. En Pro quedan gratis el grafo de dependencias y las alertas de Dependabot ([GitHub Docs](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)). La cuenta GitHub Student/Pro del equipo debe cubrir esos huecos con herramientas gratuitas (sección 4). Además, una página oficial de GitHub, leída en su versión en francés, dice que **las nuevas altas a Copilot Pro, Pro+ y al plan para estudiantes están pausadas desde el 20/04/2026** ([GitHub Docs, fr](https://docs.github.com/fr/copilot/get-started/plans)). No hay que contar con la revisión de Copilot sin verificarlo primero.

## Ningún framework de SDD encaja; la convención en Markdown sí

**[Evidencia]** En 2026 conviven cinco familias de métodos guiados por especificación:

| Familia | Ejemplo | Estado relevante |
|---|---|---|
| Kits con fases y aprobaciones | Spec Kit (`/speckit-constitution` → `specify` → `plan` → `tasks` → `implement` → el nuevo `/speckit-converge`, que se repite hasta reportar "Converged") ([github/spec-kit](https://github.com/github/spec-kit)) | — |
| | Kiro (requirements → design → tasks, criterios EARS) ([Böckeler, martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)) | IDE propio de AWS |
| | BMAD | Línea estable congelada y v7 en alfa con documentación que "cambia seguido" ([BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)) |
| Cambios por deltas | OpenSpec (propose → apply → archive) ([Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)) | — |
| Plan vivo en un archivo | ExecPlans de OpenAI ([OpenAI Cookbook](https://developers.openai.com/cookbook/articles/codex_exec_plans)); research → plan → implement de HumanLayer ([ACE-FCA](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)) | — |
| Arneses de larga duración | Agente inicializador + lista de funcionalidades en JSON + bitácora de progreso de Anthropic ([Anthropic, nov 2025](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)); planificador/generador/evaluador ([Anthropic, mar 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)) | — |
| Bucles sin estado | Ralph | — |

Thoughtworks dejó el SDD en **"Assess"** y lo describió como flujos "elaborados y con opiniones fuertes" ([Thoughtworks Radar](https://www.thoughtworks.com/radar/techniques/spec-driven-development)). Böckeler observó que Kiro convirtió un bug pequeño en 4 historias con 16 criterios de aceptación, "un mazo para partir una nuez", y que los agentes "frecuentemente" ignoraban parte de las instrucciones ([Böckeler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)).

**[Inferencia]** Todos esos frameworks suponen que la especificación se genera dentro de la herramienta. INCOVSA ya la tiene. Además, `specs/` es la fuente de verdad con su propia estructura, y forzarla al formato de OpenSpec o Spec Kit la duplicaría. BMAD queda descartado por estar en alfa y por su curva de aprendizaje, con solo 19 días hasta el 04/11. Lo que sí vale la pena tomar de todos ellos es su lección común: el ciclo **implementar → verificación independiente → repetir** (el `converge` de Spec Kit, el evaluador de Anthropic, el "BMad Loop") importa más que la elección de herramienta. La opción recomendada es usar solo convenciones: Markdown y JSON en el repositorio, scripts de verificación y nada que instalar con Python o uv. Cualquier harness lo puede leer.

Las fuentes también coinciden en cómo debe ser una tarea que un agente pueda ejecutar sola y bien. **[Evidencia]** Una funcionalidad por sesión: Anthropic lo llamó "crítico" para que el agente no intente demasiado. La lista de tareas va en JSON porque el modelo tiene menos tendencia a reescribirlo de forma indebida que si fuera Markdown, y el agente solo puede cambiar el campo de estado. Anthropic agrega que "es inaceptable eliminar o editar pruebas" ([Anthropic, nov 2025](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). El plan es autocontenido y vivo, con secciones de Progreso, Registro de decisiones y Sorpresas, y los criterios de aceptación describen conducta observable con entradas y salidas concretas ([OpenAI ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)). La especificación útil nombra archivos e interfaces, dice qué queda fuera de alcance y termina en una verificación de extremo a extremo ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). HumanLayer resume dónde conviene poner la atención humana: "no puedo leer 2000 líneas de Go al día, pero sí 200 líneas de un buen plan" ([ACE-FCA](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). Ninguna fuente da un tamaño óptimo de tarea en líneas o tokens. La guía disponible es cualitativa: una funcionalidad por sesión y tareas autocontenidas.

## Un solo AGENTS.md alcanza a los cuatro harnesses desde octubre de 2026

**[Evidencia, documentación oficial consultada el 16/10]** `AGENTS.md` pasó a la Agentic AI Foundation de la Linux Foundation el 9 de diciembre de 2025 ([Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)), y hoy los cuatro harnesses lo leen:

| Harness | Cómo lee `AGENTS.md` | Precauciones |
|---|---|---|
| Claude Code | Desde la v2.1.277, pero **solo si no existe un `CLAUDE.md` o `CLAUDE.local.md`** en el directorio de trabajo o por encima. Si existe, hay que importarlo con `@AGENTS.md` ([Claude Code memory](https://code.claude.com/docs/en/memory)) | La misma página advierte que **en Windows no hay que usar enlaces simbólicos**: crearlos requiere permisos de administrador y git los descarga como archivos de texto |
| Codex | Concatena los archivos desde la raíz hasta el directorio actual ([Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)) | Límite de 32 KiB en total. Solo carga la configuración del proyecto (`.codex/`) si el proyecto está marcado como **confiable** ([Codex config](https://learn.chatgpt.com/docs/config-file/config-basic)) |
| Cursor | Lee `AGENTS.md` en la raíz y en subcarpetas ([Cursor rules](https://cursor.com/docs/context/rules)) | Ignora los `.md` sin frontmatter dentro de `.cursor/rules` |
| Antigravity | Lee `AGENTS.md` del espacio de trabajo ([Antigravity rules](https://antigravity.google/docs/rules)) | Trunca archivos de más de 24 KB, descarta en silencio las reglas con frontmatter inválido y usa otra sintaxis de inclusión (`@[etiqueta](ruta)`) |

Next.js 16.3+ escribe y mantiene un bloque propio dentro de `AGENTS.md` que remite a la documentación de la versión instalada en `node_modules/next/dist/docs/`. Vercel reporta 100% de aciertos en su evaluación con esa documentación incluida, frente a un máximo de 79% con enfoques basados en skills ([Next.js AI agents](https://nextjs.org/docs/app/guides/ai-agents)). Eso importa en un stack reciente (Next 16, Prisma 7, Better Auth 1.7), donde las API inventadas o desactualizadas son un riesgo concreto.

Las demás piezas de configuración **no** son portables, y el proyecto debe saberlo de antemano. Las skills (formato abierto de agentskills.io) se leen desde `.agents/skills/` en Codex, Cursor y Antigravity, pero Claude Code usa `.claude/skills/`. Que Claude lea `.agents/skills/` **no está confirmado** ([Claude Code skills](https://code.claude.com/docs/en/skills); [Codex skills](https://learn.chatgpt.com/docs/build-skills); [Cursor skills](https://cursor.com/docs/context/skills); [Antigravity skills](https://antigravity.google/docs/skills)). La configuración de MCP vive en cuatro archivos con esquemas distintos: `.mcp.json`; `.cursor/mcp.json` con `${env:VAR}`; `.codex/config.toml`; y `.agents/mcp_config.json`, que exige `serverUrl` en lugar de `url` ([Antigravity MCP](https://antigravity.google/docs/mcp); [Cursor MCP](https://cursor.com/docs/context/mcp)). Los hooks de Claude, Codex y Antigravity comparten casi el mismo esquema, en el que el código de salida 2 bloquea la acción. Pero en Codex requieren confianza ligada al hash del archivo, y en Antigravity sobre Windows los permisos todavía usan "el sistema anterior", con comandos que por defecto piden confirmación ([Codex hooks](https://learn.chatgpt.com/docs/hooks); [Antigravity permissions](https://antigravity.google/docs/permissions)).

**[Inferencia]** De ahí sale una regla de diseño. Lo que debe cumplirse se hace cumplir fuera del agente: con git hooks (husky o lefthook), que todo harness dispara al hacer commit, y con GitHub Actions más protección de ramas. Los hooks de cada agente son una ayuda local, no la garantía. La configuración de agentes tiene que ser mínima y vivir en el repositorio. Una advertencia de seguridad refuerza este punto: el gusano Mini Shai-Hulud (mayo de 2026) escribió hooks maliciosos en `.claude/settings.json` y `.vscode/tasks.json` para persistir ([CSA](https://labs.cloudsecurityalliance.org/research/csa-research-note-shai-hulud-ai-supply-chain-20260517-csa-st/)). Por eso los archivos de configuración de agentes deben estar bajo CODEOWNERS.

## Las puertas deterministas, no las reglas en prosa, hacen cumplir la especificación

**[Evidencia]** El código generado por IA funciona más a menudo de lo que es seguro, y eso no mejora con modelos más capaces. Veracode encontró fallos del OWASP Top 10 en el **45%** de las tareas, con más de 100 modelos. Los modelos no se defendieron contra XSS en el 86% de los casos ni contra la inyección en logs en el 88%. La corrección sintáctica mejoró con los modelos nuevos; la seguridad, no ([Veracode](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/); [BusinessWire](https://www.businesswire.com/news/home/20250730694951/en)). CodeRabbit midió en PR reales unas **1,7 veces más incidencias** y entre 1,5 y 2 veces más problemas de seguridad en los PR con IA, sobre todo referencias inseguras a objetos (IDOR) y manejo de contraseñas. Es un estudio de proveedor ([CodeRabbit](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)). Cerca del **19,7%** de los paquetes que recomiendan los modelos no existen, y el 43% de esos nombres se repite en cada ejecución, lo que permite a un atacante registrarlos (*slopsquatting*) ([CSA](https://labs.cloudsecurityalliance.org/research-rb/csa-research-note-slopsquatting-ai-coding-assistant-supply-c/)). La propia documentación de Next.js describe el fallo típico en este stack: una Server Action es alcanzable con un POST directo, la verificación de sesión de la página **no se extiende** a las acciones que define, y hay que autorizar "este recurso específico" y devolver DTO mínimos, nunca filas crudas ([Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)).

**[Evidencia]** Los agentes también se equivocan al verificar su propio trabajo. Anthropic documenta que "Claude declara victoria demasiado pronto", que evaluado por sí mismo tiende a aprobar sus propios defectos, y que es mucho más manejable afinar un evaluador separado y escéptico ([Anthropic, nov 2025](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents); [Anthropic, mar 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)). En pruebas, algunos conjuntos generados por un LLM alcanzaron 100% de cobertura con apenas **4% de puntaje de mutación** ([MutGen, arXiv 2506.02954](https://arxiv.org/html/2506.02954v5)). En fidelidad visual, el benchmark VISTA (mayo de 2026) dio como **mejor puntaje combinado visual y funcional 0,261**, y encontró que la calidad visual y la funcional no suben juntas: GPT-5.5 tuvo la mejor similitud visual y la peor conducta. Agregar capturas de pantalla mejoró la ubicación de los elementos pero bajó el puntaje combinado ([resumen de VISTA](https://www.emergentmind.com/papers/2605.26144); fuente secundaria). Incluso con el arnés completo, Anthropic obtuvo una app "más pulida" pero "no de nivel profesional" ([Anthropic, mar 2026](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

**[Inferencia]** Para una empresa real, el marco adecuado es **OWASP ASVS 5.0 nivel 2** como meta de verificación, porque la app maneja autenticación, roles, archivos subidos y bitácora. Se complementa con el OWASP Top 10:2025 para las reglas de los agentes ([The Register](https://www.theregister.com/2025/11/11/new_owasp_top_ten_broken/)), el OWASP Top 10 para aplicaciones agénticas para el uso de agentes ([OWASP GenAI](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)) y NIST SSDF para documentar el proceso ([NIST SSDF](https://csrc.nist.gov/projects/SSDF)). Cada regla en prosa debe tener un control mecánico detrás:

| Regla en prosa | Control mecánico |
|---|---|
| "Toda exportación `'use server'` y todo `route.ts` llama a `exigirPermiso` y verifica la propiedad del registro" | Regla de Semgrep o ESLint, más una prueba de integración que recorre todas las acciones y comprueba que rechazan a un usuario sin sesión o sin permiso |
| "Nunca `$queryRawUnsafe` ni `dangerouslySetInnerHTML` fuera del sanitizador" | Regla de Semgrep o ESLint |
| "Ninguna dependencia nueva sin aprobación humana" | Job de CI que bloquea o etiqueta el PR, más `lockfile-lint` que solo admite el registro de npm y `cdn.sheetjs.com` |

Para la fidelidad al prototipo, la convergencia es igual de clara. **[Evidencia]** La captura de pantalla sirve para confirmar, no para especificar. Playwright `toHaveScreenshot` es gratuito y documenta que las capturas "difieren entre navegadores y plataformas", así que las referencias deben generarse siempre en el mismo entorno ([Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)). `@axe-core/playwright` agrega accesibilidad automatizada, aunque "no detecta todas las violaciones de WCAG" ([Playwright accessibility](https://playwright.dev/docs/accessibility-testing)). Tailwind v4 permite vaciar la paleta por defecto con `--color-*: initial` ([Tailwind theme](https://tailwindcss.com/docs/theme)). **[Inferencia, diseño propio sin fuente que lo documente como patrón]** Se proponen cuatro mecanismos:

- Los tokens de `estilos.css` del prototipo se convierten con un script a `@theme inline` y a los tokens semánticos de shadcn, y la paleta por defecto se vacía. Así un color inventado deja de compilar.
- Las mismas pruebas E2E, escritas solo con localizadores por rol, se ejecutan contra dos proyectos de Playwright: el HTML del prototipo y la app. El prototipo funciona como oráculo ejecutable; las pruebas `@parity` deben pasar en ambos y las `@spec-delta` documentan dónde la especificación manda sobre el prototipo.
- Las referencias visuales se aprueban **desde el prototipo**, no desde la app.
- Como `specs/16` dice que en las computadoras del equipo no se usa Docker, las comparaciones de píxeles corren **solo en CI** sobre la imagen oficial `mcr.microsoft.com/playwright` con versión fija ([Playwright Docker](https://playwright.dev/docs/docker)). En las máquinas Windows locales, el agente ejecuta pruebas funcionales y toma capturas como evidencia, no como puerta de aprobación.

## Cinco agentes en paralelo exigen un esqueleto previo y archivos disjuntos

**[Evidencia]** En el experimento de Anthropic con 16 agentes en paralelo, el humano "escribió la especificación inicial y construyó el arnés, y luego se hizo a un lado". La mayor parte de su esfuerzo fue diseñar pruebas. Cuando todos los agentes trabajaron sobre "una tarea gigante", tropezaron con el mismo bug, se sobrescribieron entre sí y **16 agentes no dieron ninguna aceleración**. La CI estricta tuvo que añadirse después, "porque las nuevas funciones seguían rompiendo el código existente" ([Anthropic, compilador de C](https://www.anthropic.com/engineering/building-c-compiler)). En el experimento de OpenAI, de cerca de un millón de líneas sin código escrito a mano, un directorio `docs/` fue la fuente de verdad y las pruebas estructurales bloquearon las violaciones de arquitectura ([InfoQ](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex); fuente secundaria, la original devolvió 403). GitHub recomienda no dar a agentes sin supervisión trabajo de autenticación, seguridad o datos personales, ni tareas ambiguas ([GitHub Docs](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)). En Anthropic, más de la mitad de los ingenieros solo puede delegar por completo entre el **0% y el 20%** de su trabajo ([Anthropic, dic 2025](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)). DORA 2025 encontró más PR por persona pero una entrega organizacional plana, porque el cuello de botella pasa a la revisión ([RDEL #112](https://rdel.substack.com/p/rdel-112-whats-ais-impact-on-software)). La única prueba controlada (METR 2025) midió a desarrolladores con experiencia un **19% más lentos** con IA, aunque ellos creían ir un 20% más rápido. El seguimiento de 2026 se declaró "una señal poco confiable" ([Simon Willison](https://simonwillison.net/b/8833); [Rob Bowley](https://blog.robbowley.net/2026/04/04/metrs-developer-productivity-research-2026-update/)).

**[Evidencia]** Con Prisma 7 y `prisma migrate`, un conflicto en el historial de migraciones hace que la CLI pida reiniciar la base de desarrollo. La documentación indica que nunca se debe editar una migración ya aplicada ([Prisma v7 troubleshooting](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/troubleshooting)). La *merge queue* de GitHub no está disponible para un repositorio privado personal (regla de 2023; no la re-verifiqué para 2026) ([GitHub Changelog](https://github.blog/changelog/2023-07-12-pull-request-merge-queue-is-now-generally-available/)). `claude --worktree` aísla sesiones en paralelo, pero cada worktree necesita su propia instalación y su `.env` ([Claude Code worktrees](https://code.claude.com/docs/en/worktrees.md)).

**[Inferencia]** Lo que se sigue de todo esto: el paralelismo solo se abre cuando ya existen el esqueleto, el esquema, la autenticación, los permisos, la auditoría, la CI y los contratos (Zod y firmas) congelados. Cada integrante trabaja en `src/modulos/<su módulo>/` y en su carpeta de rutas. Los archivos compartidos (`schema.prisma`, `prisma/migrations/`, `package.json`, el lockfile y los helpers de permisos y auditoría) tienen un dueño, y sus cambios entran en serie. El progreso se mide solo en tareas integradas con la CI en verde, no en la velocidad percibida.

## Método recomendado para convertir en el plan de desarrollo

Esta sección es **inferencia de síntesis**: combina los patrones citados arriba y adapta cada uno a INCOVSA. No hay en la evidencia un caso publicado de un equipo con exactamente estos cuatro harnesses.

### Estructura del repositorio para agentes

```
repo/
├── AGENTS.md                 # ÚNICA fuente de instrucciones (≤150-200 líneas). Remite a specs/, al prototipo y a los comandos; incluye el bloque gestionado por Next.js
├── CLAUDE.md                 # Solo "@AGENTS.md" (no symlink: Windows)
├── specs/                    # Fuente de verdad (se cita, nunca se copia a las reglas)
├── entregable-1/prototipos/  # Prototipo aprobado: solo lectura, fuera de lint y build
├── plan/
│   ├── 00-hoja-de-ruta.md    # Fases, orden, dueños, ventanas de esquema
│   ├── <modulo>.md           # Plan vivo estilo ExecPlan: Progreso, Decisiones, Sorpresas
│   └── progreso/<modulo>.md  # Bitácora de turnos, solo se agregan entradas
├── docs/preguntas.md         # Respaldo de escalamientos si el harness no accede a GitHub
├── prisma/AGENTS.md          # Reglas anidadas (la única forma portable de reglas por carpeta)
├── src/modulos/<modulo>/{esquemas.ts,servicio.ts,acciones.ts}
├── tests/{unit,integracion,e2e,paridad,visual}/
├── .agents/skills/<nombre>/SKILL.md   # Skills canónicas: implementar-tarea, verificar-prototipo, revisar-pr, abrir-pr
├── .claude/{settings.json,skills/}    # Permisos allow/ask/deny + copia generada de las skills
├── .cursor/{mcp.json,hooks.json} · .codex/{config.toml,hooks.json} · .agents/{mcp_config.json,hooks.json} · .mcp.json
├── scripts/{init.mjs,verify.mjs,agent-hooks/*.mjs,agents-sync.mjs}   # Node, no bash (Windows)
├── .husky/ o lefthook.yml    # Puerta obligatoria en el commit
├── .github/{workflows/,ISSUE_TEMPLATE/tarea.yml,pull_request_template.md,CODEOWNERS}
└── .gitattributes            # * text=auto eol=lf
```

El MCP del proyecto se limita a cuatro servidores: Context7 para documentación actual, `next-devtools-mcp` para errores de compilación y de ejecución, Playwright y Prisma local. Las credenciales se pasan solo como variables de entorno. Con tan pocos servidores, escribir a mano los cuatro archivos de MCP y protegerlos con CODEOWNERS es más simple que adoptar rulesync. Para las skills, un `scripts/agents-sync.mjs` copia `.agents/skills/` a `.claude/skills/`, y la CI falla si la copia está desactualizada.

### Formato de tarea

La tarea vive como **GitHub Issue** con un formulario de campos obligatorios, porque `specs/16` fija Issues y Projects para el seguimiento. El agente la lee con `gh issue view`. Puede comentar en ella y cambiar su etiqueta de estado, pero no editar su cuerpo.

```yaml
id: T-042                      # una funcionalidad vertical: ruta + acción + Prisma + UI + pruebas
modulo: picking-bodega
refs: [RF-xx, RN-xx, D-xx, "specs/07-picking-bodega.md#…", "prototipo: picking.js › pantalla X"]
depende_de: [T-010, T-031]
rutas_permitidas: ["src/modulos/picking-bodega/**", "src/app/(logistica)/bodega/**", "tests/**/picking-bodega/**"]
contrato: "esquemas.ts: …; servicio.ts: firma(...) → …"   # congelado en la Fase 1
fuera_de_alcance: [...]
aceptacion:                    # Dado/Cuando/Entonces copiados de specs, uno por RF/RN
  - "RN-12: Dado … Cuando … Entonces …"
pruebas_primero: ["tests/integracion/picking-bodega/rn-12.test.ts", "tests/paridad/bodega.spec.ts"]
deltas_spec_vs_prototipo: [...] # para que el ciclo de fidelidad no "corrija" hacia el prototipo
verificar: "node scripts/verify.mjs --tarea T-042"   # typecheck, lint, unit, integración, e2e Chromium, axe
pendientes_bloqueantes: [P-xx]
revision_coordinador: true     # si toca esquema, autenticación, permisos o auditoría
```

Los nombres de las pruebas llevan el ID de la especificación (`it('RN-12: …')`). Así, un script puede buscar en las pruebas cada RF y RN y reportar los que nadie cubre. Esa es una trazabilidad determinista que no depende del harness.

### Ritual de sesión idéntico en los cuatro harnesses

Cada sesión es un "turno sin memoria", y la skill `/implementar-tarea` (`$implementar-tarea` en Codex) lo codifica. El agente lee `AGENTS.md`, la bitácora del módulo, `git log -20` y su Issue. Ejecuta `scripts/verify` en modo humo. Si la tarea no tiene las pruebas aprobadas, las escribe y las deja en rojo. Si ya las tiene, implementa sin tocarlas. Después verifica, pega la evidencia en el PR (salida de los comandos, capturas, reporte de axe), hace commit, actualiza la bitácora, abre el PR a `develop` y **se detiene**. Hay que limpiar el contexto entre tareas, y tras dos correcciones fallidas reiniciar la sesión ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). Si el mismo diff falla tres veces, se escala a un humano en lugar de seguir repitiendo.

### Secuencia hasta el 04/11/2026 (13 días hábiles)

| Fase | Fechas | Quién | Contenido y criterio de salida |
|---|---|---|---|
| 0. Esqueleto y arnés | vie 16/10 – mar 20/10 | Coordinador + integrante de BD | `next@16.4.1`, `sharp ≥ 0.35.5`, Better Auth estable verificada. Estructura de `src/modulos/`, `schema.prisma` completo del MVP con la primera migración, Better Auth con usuario y roles, `exigirPermiso`, helper de auditoría, tokens y componentes base del prototipo, semilla, CI completa, `AGENTS.md`, skills, plantillas y CODEOWNERS. **Salida:** un módulo de prueba pasa de extremo a extremo por la CI |
| 0 (en paralelo) | mismas fechas | Resto del equipo con sus agentes | Redactar los Issues de cada módulo desde `specs/`, escribir las pruebas de aceptación y de paridad (verdes contra el prototipo), aprobar las referencias visuales desde el prototipo en CI |
| 1. Contratos | mar 20/10 – mié 21/10 | Dueño de cada módulo, revisa el coordinador | `esquemas.ts`, firmas de `servicio.ts` y nombres en `acciones.ts` como stubs. **Se congelan** |
| 2. Rebanadas verticales | mié 21/10 – jue 29/10 | Una persona y un agente por módulo | Orden del flujo del MVP según `specs/06`–`11` y `specs/05`. Cada uno trabaja con datos sembrados, sin esperar la interfaz del módulo anterior. **Vie 23/10:** medir las tareas integradas por persona y día y recortar el alcance "could" si el camino feliz no llega a tiempo. Una sola "ventana de esquema" a mitad de fase |
| 3. Integración | vie 30/10 – lun 02/11 | Todos | E2E del flujo completo, matriz de navegadores y viewports, ZAP baseline, prueba de restauración del respaldo, despliegue |
| Congelamiento | mar 03/11 – mié 04/11 | Todos | Solo corrección de errores, documentación y entrega |

Hay una tensión con la especificación. La decisión 31 de `specs/16` fija el primer despliegue "cuando la aplicación esté completa". La evidencia de DORA sugiere integrar y recorrer el flujo cada uno o dos días. Si no se cambia la decisión, ese recorrido puede hacerse sobre el entorno efímero de la CI (Postgres 18 de GitHub Actions más `next start`). Lo decide el coordinador.

### Puertas de verificación y seguridad

| Puerta | Dónde | Herramienta (gratis en repo privado Pro salvo indicación) |
|---|---|---|
| Formato, lint, `tsc --noEmit`, `prisma validate` | Commit (husky o lefthook) y CI | ESLint con `@next/eslint-plugin-next` y `eslint-plugin-security` |
| Unit e integración con Postgres 18 real; autorización de cada acción contra un rol sin permiso | CI | Vitest; cobertura ≥ 80% en `lib/` y dominio, como piso y no como meta |
| Integridad de pruebas | CI | Falla si se borran pruebas, si baja el conteo, si aparecen `.skip` o `.only` o si bajan los umbrales |
| Mutación en la lógica de dominio (conversión en gramos enteros, permisos, estados del picking) | CI incremental y nocturna | StrykerJS (umbral inicial de 60-70%) y fast-check para las propiedades de `convertir()` |
| Migraciones | CI | `prisma migrate deploy` desde cero más `migrate diff` contra Postgres 18 |
| E2E, paridad con el prototipo, comparación visual, axe WCAG A/AA | CI (imagen de Playwright con versión fija) | Playwright, `@axe-core/playwright` |
| SAST con reglas propias | CI | Semgrep AppSec Platform, gratis hasta 10 contribuidores ([Semgrep](https://docs.semgrep.dev/semgrep-pro-vs-oss)) |
| Secretos | Commit y CI | gitleaks o trufflehog (sustituyen la push protection, no disponible en Pro) |
| Dependencias y cadena de suministro | CI | Dependabot, `npm audit --audit-level=high` u OSV-Scanner, `lockfile-lint`, bloqueo de dependencias nuevas, `ignore-scripts`, SBOM |
| Workflows | CI | Permisos mínimos, acciones fijadas por SHA, sin `pull_request_target`, zizmor o actionlint, OpenSSF Scorecard |
| Revisión independiente | Antes de integrar | Sesión nueva (o subagente) con `/revisar-pr`: diff contra Issue, IDs de la especificación y prototipo; solo corrección y requisitos ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)) |
| DAST y cabeceras | Fase 3 | OWASP ZAP baseline, aserciones de CSP y HSTS en Playwright |

En las máquinas, ningún agente lee `.env*`, llaves ni `~/.ssh` (reglas `deny` en `.claude/settings.json`, `disableBypassPermissionsMode`). Nadie usa modos sin permisos ("YOLO") fuera de un contenedor desechable. Las credenciales de producción viven solo en el VPS y en los secrets de Actions. **[Evidencia]** El sandbox de Claude Code **no funciona en Windows nativo** ([Claude Code sandboxing](https://code.claude.com/docs/en/sandboxing)), y los ataques reales a agentes (CurXecute, s1ngularity) explotaron justamente MCP y los modos sin permisos ([Cato Networks](https://www.catonetworks.com/blog/curxecute-rce/); [InfoQ](https://www.infoq.com/news/2025/10/npm-s1ngularity-shai-hulud)). El equipo tiene que elegir entre WSL2 con sandbox y Windows nativo con reglas `deny` estrictas sin secretos reales en la máquina. La segunda opción es coherente con `specs/16` pero ofrece menos defensa.

### Puntos de intervención humana

| Cuándo | Quién | Por qué no lo resuelve el agente |
|---|---|---|
| Aprobar la hoja de ruta, los planes por módulo y los Issues (Fase 0-1) | Coordinador | Una línea mala del plan genera cientos de líneas malas de código ([ACE-FCA](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)) |
| Aprobar las pruebas de aceptación antes de implementar | Dueño del módulo | Las pruebas son el oráculo; si son débiles, el agente "resuelve el problema equivocado" |
| Pendientes P-xx de `specs/19-pendientes.md`, datos del negocio, contradicción entre especificación y prototipo | Coordinador con INCOVSA | El agente no puede inventar reglas ni datos. Comenta en el Issue (pregunta, opciones, opción recomendada, qué queda bloqueado), le pone la etiqueta `bloqueado:humano` y sigue con otra tarea |
| Credenciales y cuentas: VPS, DNS, R2, GHCR, secrets de Actions, primer administrador (`npm run crear-admin`, P-08) | Coordinador | Datos fuera del alcance de las herramientas del agente, por diseño |
| Dependencia nueva, cambio de esquema fuera de su ventana, comando destructivo de base de datos | Coordinador | Riesgo de *slopsquatting* y de conflictos de migración |
| PR que toca CODEOWNERS (esquema, auth, permisos, auditoría, workflows, configuración de agentes) | Coordinador, línea por línea | GitHub excluye estos temas del trabajo sin supervisión; ahí se concentra el riesgo de IDOR |
| Integración `develop` → `main` y despliegue; respuesta a avisos (Críticos ≤ 48 h, Altos ≤ 7 días) | Coordinador | Producción y SLA de parches |
| Recorrido manual del flujo del MVP y pasada manual de accesibilidad | Coordinador y QA | axe no detecta todo; la fidelidad sutil escapa a los navegadores integrados |

Esto choca con el flujo acordado del equipo, en el que Claude integra solo los PR a `develop`. La forma de conservarlo es exigir la aprobación de un code owner solo en las rutas protegidas y en `main`, y permitir que los demás PR entren a `develop` con la CI en verde. **Sin verificar:** si un *ruleset* de GitHub Pro permite cero aprobaciones generales y a la vez exige la revisión del code owner. Tampoco está resuelto qué pasa si el agente opera con la cuenta del propio coordinador, porque GitHub no deja aprobar un PR propio.

## Qué está demostrado, qué es inferencia y qué falta verificar

| Afirmación | Estado |
|---|---|
| Los cuatro harnesses leen `AGENTS.md`; Claude Code lo deja de leer si existe un `CLAUDE.md` sin importarlo; no usar symlinks en Windows | Documentación oficial, 16/10/2026 |
| `next@16.4.1` y `sharp ≥ 0.35.5` corrigen dos RCE críticas del 14/10 | Blog oficial de Next.js |
| Avisos de Next.js de julio y agosto de 2026; CVE de Better Auth | Fuentes secundarias y agregadores; **verificar en GitHub Advisories** |
| GHAS no se puede comprar en Free ni Pro para repos privados | Documentación oficial de GitHub |
| Altas de Copilot para estudiantes pausadas desde el 20/04/2026 | Documentación oficial en francés; **verificar estado actual** |
| Una funcionalidad por sesión, estado en archivos, evaluador separado, puertas deterministas | Ingeniería de Anthropic y OpenAI; evidencia de proveedores, no estudios controlados |
| 45% de tareas con fallos OWASP; 1,7 veces más incidencias en PR con IA; 19,7% de paquetes inventados | Veracode (tareas controladas), CodeRabbit (proveedor), USENIX vía secundarias |
| VISTA: mejor puntaje combinado 0,261; las capturas bajan el puntaje combinado | Resumen secundario del preprint |
| Oráculo de paridad prototipo-app, referencias visuales desde el prototipo, calendario, formato de tarea, flujo de escalamiento | **Inferencia** de este informe; no hay fuente que lo documente como patrón |
| Que Claude Code lea `.agents/skills/`; capacidades de nube de Codex, Cursor y Antigravity; avisos de Prisma 7, PostgreSQL 18 y Caddy; seguimiento de SheetJS desde el CDN por Dependabot; `wcag22aa` en axe | **Sin verificar** |
| Tamaño óptimo de tarea; multiplicadores de productividad para equipos novatos | **Sin evidencia**: no usar cifras de "N veces más rápido" |

## Conclusión

El hallazgo central contradice la intuición de "elegir el mejor agente": con cuatro harnesses y cuatro familias de modelos, la calidad no puede depender del agente. Tiene que depender del repositorio. La especificación de INCOVSA ya es mejor que la que tenían la mayoría de los casos publicados. El trabajo que queda en la Fase 0 es traducirla en oráculos ejecutables (pruebas con IDs de la especificación, paridad contra el prototipo y reglas de seguridad verificadas por máquina). Si eso se hace bien, el harness de cada estudiante se vuelve un detalle de preferencia. Si no se hace, ninguna configuración de agentes compensa: DORA lo llama amplificación, y Anthropic lo comprobó cuando 16 agentes en paralelo no aceleraron nada sin un buen verificador.

La implicación práctica para el coordinador es que la meta de "intervención mínima" se alcanza moviendo el trabajo humano de lugar, no eliminándolo. El juicio humano se concentra al principio (plan, contratos, pruebas) y en las rutas de alto riesgo, y todo lo demás queda a las puertas automáticas. El primer paso no admite espera: actualizar Next.js a 16.4.1 y `sharp` a ≥ 0.35.5, corregir la versión anotada en `specs/16` y confirmar los avisos de Better Auth antes de que cualquier agente genere código sobre una base vulnerable.
