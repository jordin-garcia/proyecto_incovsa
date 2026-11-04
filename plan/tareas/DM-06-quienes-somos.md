---
id: DM-06
titulo: "Sitio público: Quiénes somos"
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: hecha
depende_de: [DM-04]
programada: 2026-10-19
requisitos: [RF-SW-02, RF-SW-15, RF-SW-16, RF-SW-29, CU-08]
pantallas: [sitio.js › nosotros, misionVision; base.js › logoInquiserca]
---

# DM-06 · Sitio público: Quiénes somos

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** lun 19/10 · **Depende de:** DM-04

## Objetivo
La página **Quiénes somos**, con el banner que alterna los logotipos de INCOVSA e Inquiserca, la historia, misión y visión, los 5 valores, "A quién servimos" y el bloque "INCOVSA e Inquiserca".

## Contexto que debes leer
- `specs/05-sitio-web.md` §"Misión y visión" y §"Quiénes somos" **completos**
- `specs/04`: RF-SW-02, RF-SW-29; `specs/20`: CAM-41, CAM-42, CAM-79, CAM-80
- Prototipo: `#/nosotros`; `sitio.js` › `nosotros()` y `misionVision()`; `base.js` › `logoInquiserca()`
- `## Resultado` de DM-02 y DM-04

## Qué hacer
1. `/nosotros`, igual a `nosotros()`, en el orden del prototipo:
   - **banner** con los logotipos de INCOVSA e Inquiserca **alternándose** en el mismo lugar; sin logotipo de Inquiserca, solo el de INCOVSA;
   - **historia**: el texto del panel y su galería opcional. Mientras el texto esté vacío (P-19), la sección muestra solo lo que tenga; la nota amarilla del prototipo no se muestra (`specs/20`);
   - **misión y visión**, con el componente de DM-02;
   - **valores**: solo 5 imágenes, una por valor, en una fila, sin texto; mientras falte la imagen de un valor, su lugar muestra la tarjeta de pendiente del prototipo (specs/05); en teléfono, la fila se acomoda al ancho;
   - **"A quién servimos"** (mercado industrial y artesanal), como el prototipo;
   - bloque **"INCOVSA e Inquiserca"** con los dos logotipos alternándose, como el banner;
   - fondos: "Misión y visión" y "A quién servimos" con el verde del pie (`--v950`); historia, valores e "INCOVSA e Inquiserca" con fondo claro (CAM-79);
   - con pie de página y presentación dinámica.

## Archivos que creas o modificas
- `src/app/(sitio)/nosotros/**`, `src/componentes/sitio/**` (crear y modificar)
- `pruebas-e2e/sitio/nosotros.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-02:** el banner y el bloque "INCOVSA e Inquiserca" alternan los dos logotipos; al quitar el de Inquiserca en el panel, solo queda el de INCOVSA.
2. **RF-SW-29:** los valores son 5 imágenes en una fila, sin texto; los que faltan muestran la tarjeta de pendiente.
3. Los fondos alternan claro y verde como en `specs/05`.
4. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- `pruebas-e2e/sitio/nosotros.spec.ts` (criterios 1 a 4)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/nosotros.spec.ts
```

## Resultado

Implementada `/nosotros` en el orden del prototipo aprobado: banner con logotipos alternados, historia y galería opcional, misión y visión reutilizadas de DM-02, cinco valores, los mercados industrial y artesanal y el bloque del grupo empresarial. Propósito y mercados usan `--v950`; las demás secciones mantienen el fondo claro. Se heredan cabecera, pie y presentación dinámica. No se muestran las notas amarillas de pendientes.

- **Logotipos:** `LogotiposAlternados` muestra INCOVSA e Inquiserca en el mismo lugar con el ciclo de ocho segundos del prototipo. Si el panel quita Inquiserca, los dos bloques muestran solo INCOVSA y no se animan. Con movimiento reducido se muestra INCOVSA fijo.
- **Contenido:** `leerNosotrosSitio()` en `src/modulos/contenido/nosotros.ts` devuelve `{ historia: { texto, imagenes }, valores }`, con campos públicos explícitos, hasta cinco imágenes ordenadas y un arreglo de cinco posiciones, incluyendo `null` donde no hay valor. Daniela autorizó expresamente esta ampliación del alcance para respetar la separación de capas. No se modificaron dependencias, esquema ni decisiones de specs.
- **Valores:** imágenes fijas sin texto visible cuando están cargadas; tarjeta numerada de pendiente en cada espacio vacío. La fila se desplaza horizontalmente dentro de su contenedor en teléfono y tableta, como el prototipo, y admite foco de teclado. Se usan tokens existentes, incluido `--g600` para cumplir contraste en los textos secundarios.
- **Cómo usarlo:** publicar Historia, Valores o cualquiera de los logotipos desde `/panel/contenido` actualiza la página en la siguiente visita. La galería de portada y misión/visión se obtienen con `leerInicioSitio()`; los nuevos módulos no requieren configuración adicional.
- **Verificación:** fase roja de integración por módulo inexistente y E2E por `/nosotros` con 404. Después, `npm run verificar` aprobó formato, lint, tipos y 324 pruebas en 37 archivos; `npm run build` compiló `/nosotros`; doce E2E propios en tres tamaños con axe completo; suite general con código 0, 239 aprobados directamente y uno intermitente aprobado al primer reintento (arranque del servidor de producción de JG-10). Plan válido: 63 tareas. Next-devtools sin errores de configuración o sesión.
- **Revisión independiente:** LISTO, sin hallazgos de corrección. Se aplicó la sugerencia de volver al inicio antes de capturar. Evidencia y comparación de los tres estados en [DM-06](../../pruebas-e2e/sitio/evidencias/DM-06/README.md).
- **Configuración local:** `.codex/config.toml` se conserva fuera de los commits. Las capturas ajenas regeneradas por la suite tampoco forman parte del PR.
