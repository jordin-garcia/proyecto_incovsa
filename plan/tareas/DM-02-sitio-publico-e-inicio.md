---
id: DM-02
titulo: "Sitio público: cabecera, pie, presentación dinámica e Inicio"
persona: daniela
responsable: Daniela Marín
hito: E2
prioridad: P1
estado: pendiente
depende_de: [DM-01, JG-03, JG-05]
programada: 2026-10-18
requisitos: [RF-SW-01, RF-SW-08, RF-SW-15, RF-SW-16, RF-SW-22, RF-SW-24, RF-SW-27, RF-SW-28, RN-56, RNF-01, RNF-08, RNF-17, CU-08]
pantallas: [sitio.js › cabecera, pie, pagina, revelar, montarBase, cabPag, misionVision, inicio, sedes; base.js › galeria, Galerias, galSitio, logoSitio, MAPAS]
---

# DM-02 · Sitio público: cabecera, pie, presentación dinámica e Inicio

**Responsable:** Daniela Marín · **Hito:** E2 · **Prioridad:** P1 · **Programada:** dom 18/10 · **Depende de:** DM-01, JG-03, JG-05

## Objetivo
La estructura del sitio público (cabecera, pie, encabezados de página, animación de aparición y galerías que rotan) y la página de **Inicio**, leyendo el contenido de la base de datos.

## Contexto que debes leer
- `specs/05-sitio-web.md` §"Identidad", §"Estructura y navegación" (pie de página y presentación dinámica), §"Galerías de imágenes que rotan", §"Sedes que se muestran en el sitio", §"Misión y visión", §"Inicio" y §"Textos que se reemplazan" **completos**
- `specs/04`: RF-SW-01, RF-SW-15, RF-SW-16, RF-SW-22, RF-SW-24, RF-SW-27, RF-SW-28; `specs/12`: RN-56; `specs/15`: RNF-17
- `specs/16`: decisiones 20, 51 y 52
- Prototipo: `#/` (Inicio); `sitio.js` › `cabecera()`, `pie()`, `pagina()`, `revelar()`, `montarBase()` (menú en teléfono), `cabPag()`, `misionVision()`, `inicio()` y `sedes()`; `base.js` › `galeria()`, `Galerias`, `galSitio()`, `logoSitio()` y `MAPAS`
- `## Resultado` de JG-03, JG-04 (`public/marca/`) y JG-05

## Qué hacer
1. `src/app/(sitio)/layout.tsx` y `src/componentes/sitio/`:
   - **cabecera** con el logotipo del sitio (el subido en el panel o, si no hay, `public/marca/incovsa-quimicos.webp`), la navegación en este orden: Inicio, Quiénes somos, Industrias, Productos, Noticias y Contacto, y el botón **"Acceso personal"** (a `/acceso`); menú en teléfono como el prototipo. El logotipo "Transformamos INCOVSA" no se usa (RF-SW-24);
   - **pie** con el logotipo de la cabecera y los datos de Quetzaltenango y Guatemala (nunca Escuintla), **solo** en Inicio, Quiénes somos, Noticias y Contacto (RF-SW-15);
   - **encabezado de página** (`cabPag()`) con las imágenes de la galería de portada de fondo (specs/05).
2. **Galería que rota** (`src/componentes/sitio/Galeria.tsx`, decisión 20, RN-56): hasta 5 imágenes que rotan cada 5 segundos; con una sola, fija; al abrir la página solo se descarga la primera con prioridad y las demás después (`loading="lazy"`), para no hacer más lenta la carga (RNF-17); respeta la preferencia de reducir el movimiento.
3. **Presentación dinámica** (`revelar()`, RF-SW-16): las imágenes y tarjetas del contenido aparecen al entrar en la pantalla y desaparecen al salir, en todas las páginas públicas, con `IntersectionObserver` y CSS (decisión 52), respetando la preferencia de reducir el movimiento.
4. **Inicio** (`inicio()`, RF-SW-01), informativa, en el orden del prototipo y sin la sección "Catálogo informativo":
   - portada con la galería de portada (sin imágenes subidas, `public/marca/foto-equipo.webp`, como el prototipo), el párrafo y las cifras de `specs/05` (la cifra "3 sedes con bodega de distribución" se mantiene);
   - **misión y visión** (`misionVision()`, componente reutilizable para DM-06): misión con el texto a la izquierda y su galería a la derecha; debajo, visión con su galería a la izquierda y el texto a la derecha; en teléfono, uno debajo del otro; fondo verde del pie (`--v950`) con títulos en blanco y acento `--lima-b`; sin imágenes subidas, el lugar de la imagen queda vacío;
   - industrias atendidas (las 9, con sus íconos, enlazadas a su página);
   - **"Visítenos"** (RF-SW-22): una tarjeta para Quetzaltenango y otra para Guatemala con sus datos y su mapa insertado (`iframe` con `allowfullscreen`, `loading="lazy"` y `referrerpolicy="strict-origin-when-cross-origin"`, tamaño responsivo);
   - el llamado a enviar una solicitud.
   Los textos son los del prototipo con los reemplazos de `specs/05` §"Textos que se reemplazan" (RF-SW-27).
5. `src/modulos/contenido/`: las lecturas que necesita el sitio público (configuración del sitio, contenido institucional, galerías, industrias, información de contacto), sin permisos porque son públicas.

## Archivos que creas o modificas
- `src/app/(sitio)/layout.tsx`, `src/app/(sitio)/page.tsx` (reemplaza la página mínima de JG-02) (crear)
- `src/componentes/sitio/**` (crear)
- `src/modulos/contenido/**` (crear; lecturas públicas)
- `pruebas-e2e/sitio/inicio.spec.ts` (crear)

## Criterios de aceptación
1. **RF-SW-01 / RF-SW-27:** Inicio tiene las secciones y los textos del prototipo con los reemplazos de `specs/05`, sin "Catálogo informativo", y no menciona Escuintla, el número de sedes en los textos, el inventario ni los roles.
2. **RF-SW-28 / RN-56:** una galería con 5 imágenes rota cada 5 s; con una, queda fija; con la preferencia de reducir el movimiento, no rota.
3. **RNF-17:** al abrir Inicio solo se descarga la primera imagen de cada galería; las demás se piden después de cargar la página.
4. **RF-SW-15:** el pie aparece en Inicio y no aparece en una página sin pie (se comprueba en DM-03).
5. **RF-SW-22:** los dos mapas de `specs/05` se muestran con sus atributos, y Escuintla no aparece en ninguna parte.
6. **RF-SW-16:** las imágenes y tarjetas aparecen al desplazarse.
7. Coincide con el prototipo en 390, 768 y 1440 px (capturas en el PR) y no tiene violaciones serias de axe.

## Pruebas obligatorias
- `pruebas-e2e/sitio/inicio.spec.ts` (criterios 1 a 3 y 5 a 7)

## Verificación
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio/inicio.spec.ts
```

## Fuera de alcance
- Quiénes somos (DM-06), Industrias y Productos (DM-03), Noticias (DM-07), Contacto (DM-08) y el panel (DM-04 y DM-05).

## Notas
- Con la semilla de demostración, la portada, misión y visión no tienen imágenes: súbelas desde el panel cuando exista DM-04 para probar la rotación, o crea los registros de imagen en la prueba.
