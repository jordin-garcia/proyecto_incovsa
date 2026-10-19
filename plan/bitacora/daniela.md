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
