---
id: DM-14
titulo: Límite de envíos de Contacto, campo trampa y topes de texto del panel
persona: daniela
responsable: Daniela Marín
hito: E3
prioridad: P1
estado: pendiente
depende_de: [JG-15, JG-26]
programada: 2026-10-30
requisitos: [RF-SW-06, RF-SW-07, RNF-05]
pantallas: []
---

# DM-14 · Límite de envíos de Contacto, campo trampa y topes de texto del panel

**Responsable:** Daniela Marín · **Hito:** E3 · **Prioridad:** P1 · **Programada:** vie 30/10 · **Depende de:** JG-15, JG-26

## Objetivo
Corregir lo que encontró la revisión de seguridad (JG-15) en el sitio y el panel:
- **R-S01** (media, ASVS V2.4.1, P-98): hoy cualquiera puede mandar solicitudes de Contacto sin límite. Además, cada envío bloquea la misma fila que usan las publicaciones del panel, así que un envío masivo también las frena.
- **V2.2.1**: los textos largos del panel no tienen tope.
- **R-S02**: Contacto y la Documentación interna muestran mensajes de Zod en inglés.
- **ZAP 10024**: antes de hidratarse, el formulario de Contacto manda los datos en la URL.

## Contexto que debes leer
- `specs/05-sitio-web.md` › "Contacto" (precisiones del 29/10, JG-15: límite de envíos y campo trampa) y "Panel administrativo" (topes de 10 000 caracteres)
- `specs/16` decisión 29 (la IP sale solo de la cabecera de Caddy) y "Secretos y dependencias" (recepción pública, 24/10)
- `plan/seguridad/asvs-nivel-2.md`: R-S01 y R-S02, y la fila V2.2.1; `plan/seguridad/zap-2026-10-29.md`: alerta 10024
- `## Resultado` de JG-26: la columna `ip` de `solicitud_contacto`
- `src/modulos/solicitudes/servicio.ts` (`crearSolicitud`), `recepcion-publica.ts`, `esquemas.ts`; `src/lib/ip.ts` (`obtenerIp`); la regla `incovsa-recepcion-publica` de `.semgrep/seguridad.yml`

## Qué hacer
1. **Límite de envíos:**
   - en `crearSolicitud`, obtener la IP con `obtenerIp` y guardarla en la columna `ip` de la solicitud (JG-26);
   - dentro de la misma transacción y del mismo bloqueo que calcula el folio, contar las solicitudes de esa IP de los últimos 60 minutos;
   - si ya hay 5, no guardar y responder «Recibimos varias solicitudes desde su conexión. Inténtelo de nuevo en una hora.».
2. **Campo trampa:**
   - agregar al formulario un campo que no se vea (sin `display:none`, que algunos robots detectan), con `tabIndex={-1}`, `autoComplete="off"` y `aria-hidden`;
   - aceptarlo en el esquema;
   - si llega con texto, responder igual que un envío correcto, con un folio con el formato normal, sin guardar nada ni usar un número del consecutivo.
3. **Sin regla nueva de Semgrep:** la IP se lee en el servicio, así que `recepcion-publica.ts` no debería cambiar y la regla `incovsa-recepcion-publica` tampoco. Si de todos modos necesitas cambiar ese archivo o la regla, detente y pregúntale al coordinador.
4. **Topes de 10 000 caracteres**, con el mensaje «El texto admite hasta 10 000 caracteres.»:
   - van en el texto de las noticias, la historia, la misión y la visión, y las descripciones de las industrias y de los productos;
   - en los esquemas de `src/modulos/contenido/` (cliente y servidor) y en los editores del panel, al salir del campo.
5. **Mensajes de Zod en inglés** (`src/modulos/contenido/contacto.ts:30` y `src/modulos/documentos/servicio.ts:79`): mostrar el mensaje de cada campo que define el esquema, o «Revise los datos del formulario.», nunca el mensaje por omisión de Zod. Agregar `maxLength` en los campos de Información de contacto que tienen tope en el esquema.
6. **Formulario de Contacto sin datos en la URL:** con `method="post"`, si se envía antes de hidratarse, los datos no aparecen en la dirección.

## Archivos que creas o modificas
- `src/modulos/solicitudes/servicio.ts`, `src/modulos/solicitudes/esquemas.ts` y sus pruebas (modificar)
- `src/componentes/sitio/FormularioContacto.tsx` (modificar)
- `src/modulos/contenido/esquemas.ts`, `esquemas-noticias.ts`, `esquemas-catalogo.ts`, `contacto.ts` y sus pruebas (modificar)
- `src/modulos/documentos/servicio.ts` y sus pruebas (modificar)
- Los editores del panel afectados en `src/componentes/panel/` (modificar)
- `pruebas-e2e/sitio/contacto.spec.ts` y las pruebas del panel afectadas (modificar)

## Criterios de aceptación
1. **RF-SW-06 / P-98:** la sexta solicitud de una misma IP en 60 minutos no se guarda y muestra el mensaje del límite. Otra IP sí puede enviar, y la misma IP vuelve a poder hacerlo pasados los 60 minutos.
2. **RF-SW-06 / P-98:** dos envíos simultáneos de la misma IP no pasan juntos el límite.
3. **RF-SW-06 / P-98:** con el campo trampa lleno, la respuesta es igual a la de un envío correcto, no se guarda nada y la siguiente solicitud real recibe el folio que le tocaba.
4. **RNF-08:** el campo trampa no se alcanza con el teclado, y axe no reporta violaciones serias ni críticas en Contacto.
5. **RNF-05:** cada texto largo del panel rechaza más de 10 000 caracteres en el navegador y en el servidor, con el mensaje de `specs/05`.
6. **RNF-05:** ningún error de validación de Contacto, de Información de contacto ni de la Documentación interna muestra texto en inglés.
7. Sin JavaScript, enviar el formulario de Contacto no deja los datos en la URL.

## Pruebas obligatorias
- Vitest para el límite, la carrera, la trampa y los topes; Playwright para el formulario (mensaje del límite, campo trampa con axe y envío sin JavaScript). Con nombres que empiecen por `RF-SW-06:`, `RNF-05:` o `RNF-08:`.

## Verificación
Además de los comandos generales del protocolo (B6 y B7):
```
npm run verificar
npm run build
npm run e2e -- pruebas-e2e/sitio pruebas-e2e/panel --workers=1
```

## Fuera de alcance
- Captcha o servicios externos contra robots.
- Borrar solicitudes antiguas o sus IP (riesgo aceptado, JG-27).
