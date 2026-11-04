# Anexo H. Evidencia de capacitación

Tabla: Control de versiones del Anexo H

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 03/11/2026 | Plan de la capacitación al personal de INCOVSA, para la entrega académica del 04/11 | Héctor Jordin Adolfo García Coyoy |

Este anexo es la evidencia de la capacitación al personal de INCOVSA. En la versión 1.0 contiene el **plan** de la capacitación. La capacitación se da antes de la entrega final a INCOVSA del **jueves 12/11/2026** (`specs/16`, decisión 90), y la versión 1.1 (JG-21) reemplaza el plan por la evidencia: fecha, asistentes por cargo, temas cubiertos, capturas y el resultado de la prueba del panel sin ayuda.

## Estado al 03/11/2026

- La capacitación **no se ha dado**. La fecha se acuerda con INCOVSA antes del 12/11/2026.
- Las personas que reciben la capacitación y la persona que hará la prueba del panel sin ayuda las define INCOVSA (P-03, pendiente).
- La capacitación se da con el sistema desplegado en producción (JG-19). Las cuentas de las personas que se capacitan las crean Gerencia o Soporte desde la administración de usuarios de cada sistema.

## A quién va dirigida

Se identifica a las personas solo por su cargo o su función en el sistema. Sus nombres quedan en la lista de asistencia firmada, que se guarda en el Drive del equipo y no se sube al repositorio.

Tabla: Personas a las que va dirigida la capacitación

| Cargo o función | Sistema que usa | Para qué |
|---|---|---|
| Gerencia | Administración del sitio y sistema de picking | Acceso total a los dos sistemas, en todas las sedes; administra los usuarios |
| Soporte | Administración del sitio y sistema de picking | El mismo acceso que Gerencia, para el mantenimiento |
| Personal que administra el contenido del sitio | Administración del sitio | Edita el contenido del sitio público, la documentación interna y atiende las solicitudes de contacto, según sus permisos |
| Personal de Facturación | Sistema de picking, módulo de Facturación | Carga el archivo de Odoo, arma las rutas y los pedidos y los envía a Bodega |
| Personal de Bodega | Sistema de picking, módulos de Bodega y tablero | Prepara, prioriza y despacha las rutas y los pedidos |
| Pilotos | Sistema de picking, módulo de Ruta | Ejecuta sus rutas asignadas y registra las entregas |

## Temas por rol

Los temas salen de los manuales de usuario: el **Documento 3, Manual de usuario de la administración del sitio**, y el **Documento 4, Manual de usuario del sistema logístico**. Cada número es un apartado del manual.

Tabla: Temas de la capacitación por rol

| Rol | Temas | Apartados |
|---|---|---|
| Todas las personas | Acceso personal, recuperación de la contraseña por medio de Gerencia o Soporte, el entorno de trabajo y cerrar sesión | Documento 3: 1, 2, 3 y 16. Documento 4: 1 y 2 |
| Personal que administra el contenido del sitio | Información institucional; historia, misión, visión y valores; imágenes del sitio; industrias; productos informativos; información de contacto; noticias; documentos internos y carga de fichas técnicas, hojas de seguridad y certificados; contenido restringido y permisos; consultas y solicitudes; problemas frecuentes | Documento 3: 4 a 13, 15 y 17 |
| Personal de Facturación | Los productos y su Peso de Conversión tal como llegan de Odoo; pedidos pendientes; generación del picking y opciones de envío; registro de carga y control de peso; asignación de los pedidos al camión y al piloto | Documento 4: 3, 4, 8, 9, 15 y 16 |
| Personal de Bodega | Interpretación de kilogramos y unidades; preparación de los pedidos; marcado y prioridad; detalle y cambios de estado; tablero en pantalla completa; despacho de rutas y pedidos | Documento 4: 10 a 14 y 17 |
| Pilotos | Módulo de Ruta y registro de las entregas | Documento 4: 18 |
| Gerencia y Soporte | Todo lo anterior, más la administración de usuarios de los dos sistemas, la configuración de camiones, el historial de operaciones y la bitácora, y los reportes con su exportación | Documento 3: 14. Documento 4: 19, 20 y 21 |
| Todas las personas del picking | Problemas frecuentes, y por qué el sistema no lleva inventario, entradas ni salidas: lo lleva Odoo (P-58) | Documento 4: 5, 6, 7 y 22 |

## Duración y forma

- **Duración:** 2 horas, en una sesión para los dos sistemas.
- **Fecha:** se acuerda con INCOVSA antes del 12/11/2026.
- **Quién la da:** las personas del equipo del proyecto. La agenda con los tiempos de cada tema, quién dirige cada uno y la guía práctica por rol se preparan en JG-20.
- **Material:** los Documentos 3 y 4, la guía práctica por rol y las cuentas de cada persona en producción.

## Prueba del panel sin ayuda

Durante la capacitación, una persona de INCOVSA que no participó en el desarrollo hace la **prueba del CMS** del Documento 6, sección 12: siete tareas (CMS-01 a CMS-07) en el panel administrativo, solo con el panel y el Documento 3, sin indicaciones del equipo. Se aprueba si la persona completa sin ayuda todas las tareas.

## Evidencia que se registra en la versión 1.1

- Fecha, lugar y duración real de la capacitación.
- Asistentes por cargo, sin nombres. La lista de asistencia firmada queda en el Drive del equipo.
- Temas cubiertos con cada rol.
- Capturas o fotografías de la capacitación.
- Resultado de la prueba del panel sin ayuda, que también completa la sección 12 del Documento 6.
- Dudas o dificultades observadas. Las que sean del sistema se agregan al registro de incidencias del Documento 6 (sección 13) y las de los manuales se corrigen en los Documentos 3 y 4.
