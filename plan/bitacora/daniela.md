# Bitácora de Daniela Marín

Cada entrada la agrega el agente al cerrar una tarea (plan/protocolo.md B9), al **final** del archivo, con este formato:

```
## AAAA-MM-DD · <ID> · <título>
- Hecho: ...
- Decisiones: ...
- Pendiente o aviso para otros: ...
```

Los avisos para otra persona van en su propia línea y empiezan en negrita con a quién van dirigidos: `**JM-03:**`, `**Josué:**` o `**Todos:**`.

---

## 2026-10-18 · DM-01 · Herramientas obligatorias del agente (Codex)
- Hecho: verificados Node 24.22.0, npm 11.19.1, Git 2.49.0.windows.1, gh 2.102.0, PostgreSQL 18.1 y acceso de InAlexa. Context7 devolvió documentación de Server Actions de Next.js 16; Playwright abrió Inicio del prototipo, leyó su título y tomó una captura. Los cuatro MCP aparecen habilitados en `codex mcp list`. Plan válido: 62 tareas.
- Decisiones: remoto local HTTPS con autenticación de GitHub CLI por fallo de SSH; ajustes locales de Git para Windows. Chrome instalado por Daniela con privilegios de administrador. Se conserva fuera del PR el cambio preexistente de `.codex/config.toml`. Aislamiento y confirmaciones activos; no se leyeron secretos. Versiones, evidencia y uso en el Resultado de DM-01.
- Verificación: `npm run verificar` aprobado (15 archivos, 169 pruebas); `npm run build` aprobado con Turbopack tras limpiar la caché generada `.next`. Daniela preparó las bases y su configuración local sin compartir credenciales. Revisión independiente sin hallazgos.
- Pendiente o aviso para otros: DM-02 y DM-04 se desbloquean al integrar DM-01; continuar en una conversación nueva. La prueba real de next-devtools y shadcn con la aplicación corresponde a la primera tarea con pantallas, según las notas de DM-01.

## 2026-10-19 · DM-04 · Avance del panel y almacenamiento; integración pendiente
- Hecho: almacenamiento WebP en disco/R2, validación de formato y 5 MB, eliminación segura, galería de hasta cinco imágenes, resumen y contenido institucional con permisos, publicación y bitácora transaccional. Verificación: 219 pruebas, formato, lint, tipos y build correctos; 12 pruebas propias de Playwright aprobadas en tres tamaños con axe y carga real de 5 MB. Capturas y revisión independiente en `pruebas-e2e/panel/evidencias/README.md`.
- Decisiones: se conserva `/panel/resumen` según JG-07; el multipart de imágenes usa una ruta autorizada con control de origen y tamaño para conservar el límite de Odoo. La usuaria autorizó esperar a DM-02 para integrar. No se marca hecha ni se integra; se conserva fuera de los commits `.codex/config.toml`.
- Pendiente o aviso para otros:
  - **DM-02:** integrar Inicio, cabecera y pie; después retomar la rama `daniela/DM-04-panel-contenido-institucional` para verificar los criterios públicos 3 y 5 y cerrar DM-04. La operación de publicación revalida el layout raíz; las lecturas públicas de DM-02 deben reflejar la base actual.
  - **Josué:** la suite general encontró una infracción seria de axe en `src/componentes/picking/bodega/BodegaCliente.tsx:61`: «Quetzaltenango · la prioridad y las marcas no quedan en el historial», `--g500` sobre `--g50`, contraste 4.46:1. El archivo no se modificó en DM-04; requiere corrección en tu tarea de Bodega o por el coordinador.
## 2026-10-19 · DM-02 · Inicio implementado; integración pendiente por contraste en Bodega

- Hecho: implementados Inicio, cabecera, pie condicional, encabezado de página, misión y visión, oficinas, galerías y presentación dinámica, con lecturas públicas de la base. Pasan las 15 pruebas E2E de DM-02 y las 3 de sus lecturas públicas; `npm run verificar` aprobó 209 pruebas, formato, lint y tipos. El build pasó. Ocho capturas comparativas en `pruebas-e2e/sitio/evidencias/`. Revisión independiente LISTO después de corregir portada y orden de contactos del pie.
- Decisiones: conservar la cifra de tres sedes de specs/05 y mostrar únicamente las dos oficinas; mismo logotipo de cabecera y pie; recuentos de productos desde la relación del catálogo. Se conserva intacto y fuera del PR el cambio previo de `.codex/config.toml`. No se inspeccionaron secretos. Herramientas MCP comprobadas mediante invocaciones reales y next-devtools conectado al servidor local.
- Pendiente o aviso para otros: DM-02 permanece pendiente y su PR se deja en borrador. La suite completa con un trabajador da 126 aprobadas, 2 omisiones preexistentes de Facturación y 1 fallo de contraste en Bodega. Daniela eligió esperar la corrección del dueño o del coordinador, sin modificar código ajeno. Repetir toda la verificación después de integrar la corrección.
**JM-08:** tarea registrada por protocolo §C para corregir el contraste de Bodega; la prueba de permisos de ejemplo.05 en escritorio detecta 4.46:1 en el texto de prioridad. Revisar también tarjetas y etiquetas con opacidad y retirar la exclusión de contraste de la prueba propia.
**Josué:** el fallo de Bodega impide cerrar DM-02. El archivo de JM-08 documenta reproducción mínima, rutas y criterios; no se cambió tu implementación.

## 2026-10-20 · DM-04 · Panel: almacenamiento de imágenes, resumen y contenido institucional

- Hecho: se incorporó `develop` con DM-02, se combinaron las lecturas públicas y la edición del panel, y se completaron las verificaciones de publicación en Inicio, cabecera y pie. Al quitar o recuperar Inquiserca también cambia el contrato público. Verificación: 279 pruebas de integración; formato, lint, tipos y compilación correctos; 18 E2E propias en tres tamaños; suite completa con 178 aprobadas, dos omisiones preexistentes y sin fallos. Revisión independiente LISTO. Evidencia en `pruebas-e2e/panel/evidencias/README.md`.
- Decisiones: se mantiene `/panel/resumen`, según JG-07. La usuaria autorizó verificar Inquiserca en base/contrato público y dejar su comprobación visual para DM-06. Sin dependencias nuevas ni archivos protegidos; `.codex/config.toml` permanece fuera de los commits. La incidencia de Bodega del avance quedó resuelta por el coordinador en `develop`.
- Pendiente o aviso para otros:
  - **DM-05:** usar `CampoGaleria` y el módulo de almacenamiento; autorizar el permiso del módulo y validar el dueño de cada imagen antes de conservarla o borrarla. El límite del servidor sigue siendo cinco por galería.
  - **DM-06:** `leerEstructuraSitio()` expone `logotipoInquiserca: string | null`. Comprobar visualmente en Quiénes somos que quitarlo desde el panel elimina el logotipo y su alternancia; esta comprobación quedó asignada a DM-06 por autorización expresa de Daniela al cerrar DM-04.
