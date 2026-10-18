# JG-06 · Acceso personal y sesiones

Capturas completas de la aplicación y del prototipo aprobado en 390 × 844, 768 × 1024 y 1440 × 900. Se recorrieron los tres pasos, ambos sistemas, las dos ventanas informativas y el error de credenciales. `node plan/evidencias/JG-06/capturar.mjs` reproduce las 42 capturas y comprueba que no exista desbordamiento horizontal.

| Estado | 390 px: aplicación / prototipo | 768 px: aplicación / prototipo | 1440 px: aplicación / prototipo |
|---|---|---|---|
| Usuario | [Aplicación](aplicacion-usuario-390.png) / [Prototipo](prototipo-usuario-390.png) | [Aplicación](aplicacion-usuario-768.png) / [Prototipo](prototipo-usuario-768.png) | [Aplicación](aplicacion-usuario-1440.png) / [Prototipo](prototipo-usuario-1440.png) |
| Sistemas | [Aplicación](aplicacion-sistemas-390.png) / [Prototipo](prototipo-sistemas-390.png) | [Aplicación](aplicacion-sistemas-768.png) / [Prototipo](prototipo-sistemas-768.png) | [Aplicación](aplicacion-sistemas-1440.png) / [Prototipo](prototipo-sistemas-1440.png) |
| Odoo | [Aplicación](aplicacion-odoo-390.png) / [Prototipo](prototipo-odoo-390.png) | [Aplicación](aplicacion-odoo-768.png) / [Prototipo](prototipo-odoo-768.png) | [Aplicación](aplicacion-odoo-1440.png) / [Prototipo](prototipo-odoo-1440.png) |
| Sitio | [Aplicación](aplicacion-sitio-390.png) / [Prototipo](prototipo-sitio-390.png) | [Aplicación](aplicacion-sitio-768.png) / [Prototipo](prototipo-sitio-768.png) | [Aplicación](aplicacion-sitio-1440.png) / [Prototipo](prototipo-sitio-1440.png) |
| Picking | [Aplicación](aplicacion-picking-390.png) / [Prototipo](prototipo-picking-390.png) | [Aplicación](aplicacion-picking-768.png) / [Prototipo](prototipo-picking-768.png) | [Aplicación](aplicacion-picking-1440.png) / [Prototipo](prototipo-picking-1440.png) |
| Recuperación | [Aplicación](aplicacion-recuperacion-390.png) / [Prototipo](prototipo-recuperacion-390.png) | [Aplicación](aplicacion-recuperacion-768.png) / [Prototipo](prototipo-recuperacion-768.png) | [Aplicación](aplicacion-recuperacion-1440.png) / [Prototipo](prototipo-recuperacion-1440.png) |
| Error | [Aplicación](aplicacion-error-390.png) / [Prototipo](prototipo-error-390.png) | [Aplicación](aplicacion-error-768.png) / [Prototipo](prototipo-error-768.png) | [Aplicación](aplicacion-error-1440.png) / [Prototipo](prototipo-error-1440.png) |

## Comparación

- Mismos títulos, descripciones, orden de opciones, textos de ayuda, fotografías y logotipo. CAM-83: título y descripción centrados, sin notas sobre roles.
- La aplicación omite las cuentas de demostración y sus instrucciones, el botón «Demostración» y la nota P-06, como exige `specs/20`.
- Los textos grises sobre `--g50` usan `--g600` para cumplir RNF-08, siguiendo la precisión de JG-05. Las opciones deshabilitadas conservan el estado aprobado.
- El error de credenciales no lleva punto final, conforme al texto de la tarea. La recuperación es exclusivamente interna; Odoo sin URL muestra únicamente la información aprobada.
- Los formularios usan los componentes y tokens compartidos. Los tres colores laterales y el radio del icono proceden literalmente del prototipo y se centralizaron en `globals.css`.

## Verificación funcional

El flujo automatizado prueba la selección de sistemas según la cuenta, usuarios inexistentes, ventanas informativas, mostrar contraseña, errores, accesibilidad con axe, dos sesiones simultáneas, cookies HttpOnly/SameSite y cierre independiente con regreso a `/`. La API pública impide altas y cambios de contraseña y verifica el origen.

Las pantallas de los módulos todavía corresponden a sus tareas. Por eso los destinos `/panel/documentos` y `/picking/facturacion` se comprueban como redirecciones; actualmente esas páginas no están implementadas. JG-07 conecta el armazón y aplica los permisos. Esta tarea solo conectó su botón de cierre a la acción real.
