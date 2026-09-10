# Plan de proyecto — Sitio web institucional autoadministrable y Sistema de Control Logístico de Bodega INCOVSA

**Curso:** Programación Web — Ingeniería en Informática y Sistemas, Universidad Rafael Landívar, Campus San Alberto Hurtado S.J. de Quetzaltenango
**Docente:** Ing. Manuel Rojas
**Empresa beneficiaria:** INCOVSA (Industria del Cuero Covadonga S. A.)
**Enlace con la empresa:** Ing. William Ambrossio (encargado de tecnología)
**Fecha de elaboración del plan:** 8 de septiembre de 2026
**Versión:** 1.1

Fuentes utilizadas para elaborar este plan: acta de la primera reunión (27/08/2026), documento "INCOVSA Propuesta de proyectos" (01/09/2026), acta de la segunda reunión (04/09/2026) y "Lineamientos para la documentación y entrega del proyecto" del Ing. Manuel Rojas.

---

## Índice

1. Resumen del proyecto
2. Estado actual (8 de septiembre de 2026)
3. Alcance consolidado
4. Equipo y roles
5. Stack tecnológico recomendado
6. Herramientas de trabajo propuestas
7. Metodología y forma de trabajo
8. Cronograma general
9. Plan paso a paso por fase
10. Matriz de responsabilidades (documentos, módulos y diagramas)
11. Información pendiente de recopilar de INCOVSA
12. Agendas propuestas: reunión del 11 de septiembre y visita del 17 de septiembre
13. Riesgos identificados y cómo mitigarlos

---

## 1. Resumen del proyecto

INCOVSA es una empresa con más de 30 años en el mercado dedicada a la compra y venta de productos químicos en Guatemala. Atiende las industrias de cuero, textil, cerería, hulera, medicamentos, limpieza, alimentación animal y tratamiento de agua. Tiene presencia en todos los departamentos del país y opera tres bodegas de distribución: Quetzaltenango (oficinas y bodega central), Guatemala y Escuintla. Forma parte de un grupo familiar (familia Orozco) con varias empresas; el proyecto abarcará a INCOVSA e Inquiserca, que comparten productos según la logística.

La empresa cuenta con un ERP (Odoo) para casi toda su operación, pero no tiene sitio web corporativo y el picking de bodega se lleva de forma manual en un archivo de Excel.

El proyecto aprobado por la empresa y por el docente se compone de dos componentes:

1. **Sitio web corporativo e institucional autoadministrable** (requisito indispensable de la empresa).
2. **Sistema de Control Logístico de Bodega (picking y despacho)** — Propuesta 1 del documento de la empresa.

El problema central que resuelve el sistema logístico es la conversión entre la unidad de facturación (kilogramos) y la unidad de manejo físico en bodega (unidades o presentaciones), y a partir de ella la generación del picking, la preparación, la carga de vehículos y el despacho de pedidos ya facturados.

### Fechas clave

| Fecha | Evento | Peso |
|---|---|---|
| Viernes 11 de septiembre de 2026, 6:00 p. m. | Tercera reunión con el Ing. William (virtual, Google Meet) | — |
| Jueves 17 de septiembre de 2026, 4:30 p. m. | Visita presencial a la empresa (1 hora) para observar la logística de bodega | — |
| Lunes 21 de septiembre de 2026 | **Entregable 1:** definición, análisis y diseño inicial. Se presenta en clase ese día | 10 puntos |
| Miércoles 14 de octubre de 2026 | **Entregable 2:** avance funcional + documentación técnica. Se presenta en clase ese día | 10 puntos |
| Miércoles 4 de noviembre de 2026 | **Entregable 3:** entrega final, sistema desplegado. Se presenta en clase ese día | 30 puntos |

Total del proyecto: 50 puntos. Quedan 8 semanas de trabajo desde hoy hasta la entrega final.

---

## 2. Estado actual (8 de septiembre de 2026)

Realizado hasta ahora:

- Dos reuniones virtuales con el Ing. William Ambrossio (27/08 y 04/09), con actas levantadas por Daniela Marín.
- Propuesta 1 (Sistema de Control Logístico de Bodega) + sitio web corporativo aprobada por la empresa ("Está de acuerdo") y por el docente.
- Lineamientos de documentación y entrega recibidos del Ing. Manuel Rojas.
- Repositorio de GitHub creado por Jordin García (rama `main`, un commit inicial con `README.md`).
- Compromiso de la empresa: enviar textos de historia, misión, visión y valores e imágenes a más tardar la semana del 7 al 11 de septiembre; brindar información de clientes, productos y vehículos.

Pendiente inmediato:

- Decidir el stack tecnológico (se tratará en la reunión del 11 de septiembre).
- Definir cómo llegan al sistema los pedidos facturados (integración con Odoo o carga manual/importación). No se trató en la última reunión.
- Confirmar hosting y dominio que usará la empresa.
- Las actas, la propuesta de INCOVSA y los lineamientos se conservan en la carpeta local del proyecto y en la carpeta compartida de Google Drive del equipo; **no se suben al repositorio** de GitHub (privado). El repositorio contendrá solo código, migraciones, configuración de ejemplo, README, diagramas y prototipos. Los documentos entregables y anexos se entregan al docente por el medio que él indique.

---

## 3. Alcance consolidado

Este alcance une lo solicitado por la empresa (documento de propuestas y reuniones) con lo exigido por los lineamientos del docente. Es la base para el capítulo 1.7 del Documento 1 y para la matriz de trazabilidad.

### 3.1 Sitio web corporativo e institucional

| Código | Requerimiento | Origen |
|---|---|---|
| SW-01 | Página de inicio intuitiva con información institucional y noticias | Reunión 2 |
| SW-02 | Apartado "Quiénes somos": historia, misión, visión y valores (texto lo redacta la empresa) | Propuesta, Lineamientos |
| SW-03 | Apartado de industrias atendidas, con navegación por industria. El Ing. William no quiere las industrias en una barra superior horizontal | Propuesta, Reunión 2 |
| SW-04 | Catálogo informativo de productos por industria, sin e-commerce y **sin precios**. Al cliente se le muestra: nombre, origen, presentación en kg. No se muestra el lote | Propuesta, Reunión 2 |
| SW-05 | Detalle de producto: presentación, origen, cómo se maneja, almacenamiento, humedad, tipo de producto, restricciones ("qué no se puede hacer") | Reunión 2 |
| SW-06 | Módulo de contacto: formulario para solicitudes, quejas o reclamos, con envío por correo y/o almacenamiento en base de datos; correo de contacto visible | Propuesta, Reunión 2 |
| SW-07 | Panel administrativo (CMS) para actualizar sin tocar código: información institucional, historia/misión/visión/valores, imágenes, industrias, catálogo de productos, noticias, información de contacto | Propuesta, Lineamientos (confirmado por el equipo) |
| SW-08 | Diseño responsive: escritorio, tableta, móvil | Propuesta, Lineamientos |
| SW-09 | Todas las plataformas bajo un mismo dominio e identidad visual. El acceso al sistema logístico se hace desde el sitio corporativo (apartado de ingreso para personal) | Propuesta, Reunión 2 |
| SW-10 | Documentación interna de productos (fichas técnicas, hojas de seguridad, certificados de análisis) en un área protegida con inicio de sesión. Acceso según el rol de la persona que ingresa; existe un "rol general – documentación" | Propuesta, Reunión 2 |
| SW-11 | Sitio escalable, ágil y ligero; mantenimiento sencillo e intuitivo | Reunión 2 |
| SW-12 | Recuperación de contraseña para usuarios del panel | Lineamientos (Doc. 3) |

### 3.2 Sistema de Control Logístico de Bodega (picking y despacho)

| Código | Requerimiento | Origen |
|---|---|---|
| SL-01 | Gestión de productos (SKU único e irrepetible), origen y presentaciones | Propuesta, Reunión 2, Lineamientos |
| SL-02 | Gestión de presentaciones y equivalencias kg → unidades por producto | Propuesta, Lineamientos |
| SL-03 | Motor de conversión kg → unidades según la presentación, incluyendo el tratamiento de cantidades no exactas y redondeo según reglas aprobadas por INCOVSA | Propuesta, Lineamientos |
| SL-04 | Manejo de lotes: se crea un lote cada vez que ingresa producto; el lote diferencia precio; almacenamiento FIFO | Reunión 2 |
| SL-05 | Control de inventario en tiempo real: entradas, salidas, existencias por producto y por bodega. Recepción en kg aunque se compre en otra medida (p. ej. toneladas); venta en libras, kg o galones; todo se trabaja internamente en kilogramos | Propuesta, Reunión 2 |
| SL-06 | Control de pedidos de venta facturados pendientes de despacho con estados: pendiente, en preparación, despachado, en ruta | Propuesta |
| SL-07 | Generación automática del picking: unidades a preparar por factura y por cliente; listar todos los pedidos a sacar de la bodega; guardar el recorrido | Propuesta, Reunión 2 |
| SL-08 | Preparación de pedidos con cambio de estado y registro de quién y cuándo | Lineamientos |
| SL-09 | Pantalla de proyección (tablero) del picking/preparación para el personal de bodega, pensada para TV o tableta; desde la tableta se coloca la prioridad de los productos a despachar en el día | Propuesta, Reunión 2 |
| SL-10 | Gestión de vehículos con capacidad mínima y máxima de carga | Reunión 2 |
| SL-11 | Control de carga: productos y cantidades que se cargan a cada camión; un vehículo no debe cargarse de más | Propuesta, Reunión 2 |
| SL-12 | Registro de despacho y registro de cantidad de rutas realizadas por día | Propuesta |
| SL-13 | Reporte diario de kilogramos y sacos despachados; demás reportes de despacho | Propuesta, Lineamientos |
| SL-14 | Usuarios y roles: facturador, despacho, bodega, envío, gerencia (lista por confirmar). Cada sede (Xela, Guatemala, Escuintla) solo ve lo de su sede a nivel operativo; gerencia ve todo | Reunión 2, Lineamientos |
| SL-15 | Sistema dividido para dos empresas (INCOVSA e Inquiserca) que comparten productos según la logística; tres bodegas, cada una ve solo lo suyo | Reunión 2 |
| SL-16 | Historial de operaciones y bitácora: movimientos de inventario, preparación, cambios de estado, cargas, despachos | Lineamientos |

### 3.3 Fuera del alcance (para documentar explícitamente en el apartado 1.8 del Documento 1)

- Comercio electrónico y precios en el sitio.
- Propuesta 2 (planificación de rutas en mapa) y Propuesta 3 (mantenimiento y combustible de flota).
- Cálculo de costos logísticos: el equipo entrega la herramienta y la empresa evalúa los costos.
- Integración con Odoo: **queda por decidir** en la reunión del 11 de septiembre. Si no se integra, se documenta como fuera del alcance y se define el mecanismo de ingreso de pedidos facturados.

---

## 4. Equipo y roles

Criterio de asignación: cada integrante toma el área donde tiene más habilidad y todos cargan responsabilidades equivalentes en código, documentación y pruebas. Cada módulo tiene un responsable y un apoyo, para que ninguna parte dependa de una sola persona.

| Integrante | Carné | Rol principal | Responsabilidades |
|---|---|---|---|
| **Héctor Jordin Adolfo García Coyoy** | 2427124 | **Coordinador del proyecto, arquitecto e integrador, responsable de calidad (QA)** | Enlace con el Ing. William y el Ing. Manuel. Convocar y dirigir reuniones internas. Definir la arquitectura, la estructura del repositorio y las convenciones de código. Revisar y aprobar todos los pull requests. Backend de autenticación, usuarios y roles; backend de carga de vehículos, despacho, rutas y reportes. Responsable del Documento 6 (plan y evidencias de pruebas) y de la prueba integral del flujo completo. Diagramas de arquitectura, componentes y despliegue. Preparar y dirigir las presentaciones en clase. |
| **Carlos Hugo Escobar Gómez** | 1563824 | **Analista de requerimientos, responsable de documentación general y de despliegue (DevOps)** | Levantamiento y redacción de requerimientos funcionales, no funcionales y reglas de negocio. Responsable del Documento 1 (memoria general) y del Documento 5 (instalación, despliegue y mantenimiento). Diagrama de casos de uso y especificación de casos de uso. Backend del panel administrativo (CMS): contenido institucional, industrias, noticias, contacto y documentos internos (carga de archivos). Configuración de entornos (desarrollo, pruebas y producción), hosting, dominio, HTTPS, respaldos y prueba de restauración. Matriz de trazabilidad. |
| **Daniela Alexandra Marín Orozco** | 1570022 | **Responsable del frontend del sitio institucional y del panel administrativo; responsable de actas** | Diseño visual e identidad del sitio (tipografías, colores, componentes). Prototipos de las secciones públicas y del panel administrativo. Desarrollo del sitio público (inicio, quiénes somos, industrias, catálogo, detalle de producto, contacto, noticias, área de documentación interna) y de las vistas del panel administrativo. Diseño responsive y accesibilidad (capítulo 7). Responsable del Documento 3 (manual del administrador del sitio). Actas de todas las reuniones (Anexo A). Capacitación al personal que administrará el sitio. |
| **Josué André Menéndez Juárez** | 1511124 | **Responsable de base de datos y del frontend del sistema logístico** | Modelo entidad-relación, migraciones, seeders con datos reales de la empresa, diccionario de datos y reglas de integridad (capítulo 5). Prototipos de las pantallas del sistema logístico. Desarrollo de las vistas del sistema logístico: productos, presentaciones, equivalencias, inventario, pedidos, picking, preparación, carga, despacho, rutas y reportes. Tablero de proyección para TV/tableta (interfaz para personal de bodega, capítulo 7.3). Responsable del Documento 4 (manual del sistema logístico). Capacitación al personal de bodega. |
| **José Daniel Cifuentes Carrascosa** | 1548423 | **Responsable del backend del sistema logístico y de la documentación técnica** | Backend de productos, presentaciones, equivalencias, motor de conversión kg → unidades, lotes, inventario (entradas, salidas, existencias), pedidos pendientes, generación de picking, preparación y cambios de estado, bitácora. Validación de las reglas de conversión con INCOVSA junto con Carlos Hugo. Responsable del Documento 2 (documentación técnica), incluyendo el procedimiento para extender el sistema. Diagrama de clases, diagramas de actividades y diagramas de secuencia. Pruebas de conversión (sección 9 del Documento 6). |

Reglas comunes para todos:

- Cada integrante escribe los casos de prueba y las evidencias de los módulos que desarrolla y las entrega a Jordin para el Documento 6.
- Cada integrante documenta en el Documento 2 la lógica de los módulos que programó.
- Cada integrante toma capturas de pantalla de sus módulos para los manuales.
- Nadie hace push directo a `main` ni a `develop`; todo entra por pull request.

---

## 5. Stack tecnológico recomendado

Este stack es el que el equipo propondrá en la reunión del 11 de septiembre. Se eligió porque es el que el equipo conoce mejor, y cumple con lo que piden la empresa y el docente: algo escalable, ligero y fácil de mantener a código por terceros; migraciones, roles, manejo de archivos y despliegue reproducible; y dos aplicaciones integradas bajo un mismo dominio en 8 semanas.

### Recomendación: Node.js 22 + Next.js 15 + Prisma + PostgreSQL 16 (una sola aplicación)

| Capa | Tecnología | Uso | Justificación |
|---|---|---|---|
| Entorno de ejecución | Node.js 22 (LTS) | Servidor de la aplicación | Versión con soporte a largo plazo; un solo lenguaje (TypeScript) en todo el proyecto. |
| Framework | Next.js 15 (App Router) con TypeScript | Sitio público, panel administrativo (CMS), sistema logístico y tablero en un solo proyecto, bajo un mismo dominio | Renderizado en servidor para el sitio público (rápido y ligero), rutas protegidas para el panel y el sistema logístico, Route Handlers y Server Actions para la lógica de negocio. |
| Base de datos | PostgreSQL 16 | Persistencia de todo el sistema | Transacciones para inventario, picking y despacho; tipos numéricos exactos (`numeric`) para kilogramos. |
| ORM y migraciones | Prisma | Modelo de datos, migraciones versionadas, seeders | Migraciones obligatorias por los lineamientos; el esquema de Prisma sirve de base para el diagrama de clases y el diccionario de datos. |
| Autenticación | Auth.js (NextAuth v5) con credenciales + sesiones; contraseñas con bcrypt | Inicio de sesión, cierre de sesión, recuperación de contraseña | Integración nativa con Next.js; sin servicios externos de identidad. |
| Roles y permisos | Tabla de roles y permisos propia en Prisma + middleware de Next.js | Roles: facturador, despacho, bodega, envío, gerencia, administrador de contenido, documentación; restricción por sede y empresa | Control total sobre las reglas de sede y empresa que pidió INCOVSA. |
| Interfaz | Tailwind CSS + shadcn/ui | Componentes del sitio, panel, sistema logístico y tablero; responsive | Componentes accesibles y consistentes; sin dependencia de un tema de terceros. |
| Validación de entradas | Zod | Formularios y solicitudes (contacto, cantidades, archivos) | Exigido por el capítulo 6.5 de los lineamientos. |
| Archivos | Sistema de archivos del servidor (carpeta de almacenamiento fuera de `public/`) | Imágenes del sitio, fichas técnicas, hojas de seguridad, certificados | Sin costo ni servicios externos; se respalda con la carpeta. Se sirven por una ruta protegida para los documentos internos. |
| Correo | Nodemailer con la cuenta SMTP de la empresa | Formulario de contacto y recuperación de contraseña | La empresa ya tiene correo corporativo. |
| Reportes | Vistas HTML imprimibles + exportación a PDF (`@react-pdf/renderer`) y Excel (`exceljs`) | Reporte diario de kg y sacos despachados, rutas por día | Formatos que la empresa ya usa (Excel). |
| Tablero de bodega | Página de Next.js con actualización periódica (polling) | Pantalla de TV/tableta | Simple, sin servicios de tiempo real externos. |
| Pruebas automatizadas | Vitest | Pruebas del motor de conversión, inventario y picking | Evidencia para el Documento 6. |
| Control de versiones | Git + GitHub | Repositorio ya creado (privado) | Exigido por los lineamientos. |
| Servidor | VPS Linux con Node.js, PostgreSQL, Nginx como proxy inverso y HTTPS con Let's Encrypt (o plataforma que ejecute Node) | Producción | Este stack **no funciona en hosting compartido tradicional** (cPanel con PHP). Si el hosting de la empresa es compartido, se debe contratar un VPS o una plataforma con Node y PostgreSQL. |

Condición a confirmar el 11 de septiembre: el tipo de hosting de la empresa (A2 en la sección 11). Si no puede ejecutar Node.js y PostgreSQL, hay que acordar con el Ing. William contratar un VPS o una plataforma compatible, dado que la empresa cubre el pago del hosting. Después de esa reunión se actualiza este plan (versión 1.1).

---

## 6. Herramientas de trabajo propuestas

Todas gratuitas y de uso sencillo.

| Necesidad | Herramienta | Uso |
|---|---|---|
| Comunicación diaria | WhatsApp (ya en uso) | Avisos rápidos y coordinación |
| Reuniones internas y con la empresa | Google Meet (ya en uso con el Ing. William) | Reuniones semanales y de validación |
| Gestión de tareas | GitHub Projects (tablero Kanban en el mismo repositorio) + GitHub Issues | Una tarjeta por tarea con responsable, fecha y entregable. Columnas: Por hacer, En progreso, En revisión, Hecho |
| Código y versiones | GitHub (repositorio ya creado) | Ramas, pull requests, etiquetas por entregable |
| Prototipos | Claude Code generando prototipos HTML estáticos, guardados en `docs/prototipos/` | Prototipos navegables para validar con el Ing. William y adjuntar como Anexo C |
| Diagramas | draw.io (diagrams.net) — archivos `.drawio` guardados en `docs/diagramas/`, exportados a PNG | Casos de uso, actividades, secuencia, arquitectura, componentes, despliegue, clases y ER |
| Modelo ER | draw.io, o generado desde el esquema de Prisma con `prisma-erd-generator` y ajustado a mano | Modelo ER que corresponda a la base de datos final |
| Documentos entregables | Microsoft Word (los lineamientos exigen índice automático con estilos de Word). Redacción colaborativa en Word Online/OneDrive si los integrantes tienen cuenta Microsoft 365 de la universidad; si no, en Google Docs con estilos de título y conversión final a `.docx` por el responsable de cada documento | Documentos 1 a 6 |
| Evidencias (capturas, fotos de la visita, videos) | Carpeta compartida de Google Drive del equipo, organizada por anexo | Anexos B, G, H, I |
| Entorno de desarrollo local | Node.js 22 LTS + PostgreSQL 16 instalados en cada máquina (o PostgreSQL en Docker con un `docker-compose.yml` incluido en el repositorio) | Ejecutar el proyecto en cada máquina con la misma versión de base de datos |
| Editor | Visual Studio Code | Con extensiones de Prisma, Tailwind CSS y ESLint |
| Cliente de base de datos | Prisma Studio (incluido) o DBeaver | Consultas y revisión de datos |
| Pruebas de formularios y rutas | Navegador + Postman (opcional) | Validaciones y pruebas de seguridad básicas |
| Contraseñas y accesos | Bitwarden (gratuito) | Entregar credenciales por un mecanismo seguro y separado de la documentación (Anexo J) |

---

## 7. Metodología y forma de trabajo

### 7.1 Ciclo de trabajo

- Trabajo por **sprints de dos semanas** (excepto el sprint final, de una semana), alineados con los tres entregables.
- **Reunión interna semanal** de 45 minutos (Google Meet), dirigida por Jordin, el día anterior a la reunión con el Ing. William: revisión del tablero, bloqueos y preparación de las preguntas para la empresa.
- **Reunión semanal con el Ing. William** (día y hora según su disponibilidad). Daniela levanta el acta el mismo día y la sube a la carpeta de actas (Anexo A) en Google Drive. Cada acta incluye: acuerdos, decisiones, pendientes de la empresa y pendientes del equipo.
- **Reporte breve diario** en WhatsApp (una línea por persona: qué hice, qué haré, si tengo bloqueo) durante las semanas de desarrollo.

### 7.2 Flujo de Git

- Ramas: `main` (solo versiones entregadas), `develop` (integración), `feature/<modulo>-<descripcion>` (una por tarea), `fix/<descripcion>`.
- Todo cambio entra a `develop` por pull request revisado por Jordin (o por otro integrante si Jordin es el autor). Un pull request se aprueba si: corre sin errores, cumple la tarea, no incluye credenciales ni archivos generados, y las migraciones corren desde cero.
- Mensajes de commit en español, breves y descriptivos, con prefijo: `feat:`, `fix:`, `docs:`, `db:`, `test:`, `chore:`.
- Etiquetas (tags) por entregable: `v0.1-entregable1`, `v0.5-entregable2`, `v1.0-final`.
- `.gitignore` con `.env*` (excepto `.env.example`), `node_modules/`, `.next/`, la carpeta de archivos subidos y archivos temporales. Un archivo `.env.example` con todas las variables y valores de ejemplo.

### 7.3 Estructura propuesta del repositorio

```
proyecto_incovsa/
├── src/
│   ├── app/                      # Rutas de Next.js (App Router)
│   │   ├── (sitio)/              # Sitio público: inicio, quiénes somos, industrias, catálogo, contacto, noticias
│   │   ├── (auth)/               # Inicio de sesión, recuperación de contraseña
│   │   ├── admin/                # Panel administrativo (CMS) y documentación interna protegida
│   │   ├── logistica/            # Sistema de control logístico de bodega
│   │   ├── tablero/              # Pantalla de proyección para TV/tableta
│   │   └── api/                  # Route Handlers (archivos protegidos, tablero, importación de pedidos)
│   ├── components/               # Componentes de interfaz reutilizables (shadcn/ui + propios)
│   ├── modules/                  # Lógica de negocio por módulo: conversion, inventario, pedidos, picking, carga, despacho, reportes, contenido
│   ├── lib/                      # Cliente de Prisma, autenticación, permisos, utilidades
│   └── validations/              # Esquemas Zod
├── prisma/
│   ├── schema.prisma             # Modelo de datos
│   ├── migrations/               # Migraciones versionadas
│   └── seed.ts                   # Datos iniciales reales (industrias, productos, presentaciones, vehículos, usuarios)
├── tests/                        # Pruebas automatizadas (Vitest) de conversión, inventario y picking
├── docs/
│   ├── prototipos/               # Prototipos HTML (Anexo C)
│   └── diagramas/                # .drawio + .png
├── docker-compose.yml            # PostgreSQL para desarrollo (opcional)
├── .env.example
├── PLAN_DE_PROYECTO.md
└── README.md                     # Con las 16 secciones obligatorias
```

Las actas, evidencias del levantamiento, documentos entregables (.docx y .pdf) y demás anexos se guardan en la carpeta compartida de Google Drive, no en el repositorio.

### 7.4 Definición de "terminado" para una tarea

1. Código en `develop` mediante pull request aprobado.
2. Migraciones y seeders actualizados si cambió la base de datos.
3. Casos de prueba del módulo escritos y ejecutados, con captura de evidencia.
4. Sección correspondiente del Documento 2 y del manual de usuario redactada.
5. Tarjeta movida a "Hecho" en GitHub Projects.

---

## 8. Cronograma general

| Fase | Fechas | Objetivo | Cierre |
|---|---|---|---|
| Fase 0. Arranque | Martes 8 – Domingo 13 de septiembre | Preparar la reunión del 11, decidir stack, montar herramientas y entornos | Stack decidido, repositorio y tablero listos |
| Fase 1. Análisis y diseño | Lunes 14 – Lunes 21 de septiembre | Visita del 17, requerimientos, reglas de conversión validadas, prototipos validados, Documento 1 inicial | **Entregable 1 – 21 de septiembre** |
| Fase 2. Sprint 1 | Martes 22 de septiembre – Domingo 4 de octubre | Base del proyecto, autenticación y roles, base de datos, CMS funcional, productos, presentaciones, equivalencias, conversión e inventario | Demostración interna 4 de octubre |
| Fase 2. Sprint 2 | Lunes 5 – Martes 13 de octubre | Pedidos pendientes, picking, preparación, estados, tablero; documentación técnica; pruebas iniciales | **Entregable 2 – 14 de octubre** |
| Fase 3. Sprint 3 | Jueves 15 – Domingo 25 de octubre | Vehículos, carga, despacho, rutas, reportes, documentación interna protegida, noticias, bitácora; correcciones del entregable 2 | Sistema completo en `develop` |
| Fase 3. Sprint 4 | Lunes 26 de octubre – Domingo 1 de noviembre | Despliegue en el hosting de la empresa, pruebas completas, manuales, respaldo y restauración, capacitación | Sistema desplegado y probado |
| Fase 3. Cierre | Lunes 2 – Miércoles 4 de noviembre | Congelamiento de código, documentación final, ensayo de presentación | **Entregable 3 – 4 de noviembre** |

---

## 9. Plan paso a paso por fase

### Fase 0. Arranque (martes 8 – domingo 13 de septiembre)

**Objetivo:** llegar a la reunión del viernes 11 con un cuestionario completo, una propuesta de stack y las herramientas del equipo listas.

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 0.1 | Compartir este plan con el equipo, revisarlo en una reunión interna de 45 minutos y confirmar los roles | Jordin | Todos | Miércoles 9 de septiembre |
| 0.2 | Crear el tablero en GitHub Projects con las columnas y cargar las tareas de la Fase 0 y la Fase 1 | Jordin | Carlos Hugo | Miércoles 9 de septiembre |
| 0.3 | Crear la carpeta compartida de Google Drive con subcarpetas por anexo (A a J) | Daniela | — | Miércoles 9 de septiembre |
| 0.4 | Subir a la carpeta de Google Drive las actas (con el apellido "Cifuentes" ya corregido), la propuesta de INCOVSA y los lineamientos del docente, en las subcarpetas correspondientes | Daniela | Jordin | Jueves 10 de septiembre |
| 0.5 | Redactar el cuestionario para la reunión del 11 de septiembre a partir de la sección 11 de este plan, priorizando lo que bloquea el Entregable 1 | Carlos Hugo | Daniel | Jueves 10 de septiembre |
| 0.6 | Preparar la propuesta de stack (sección 5) con una explicación de 5 minutos para el Ing. William y para el equipo | Jordin | Carlos Hugo | Jueves 10 de septiembre |
| 0.7 | Preparar la lista de accesos e insumos a solicitar a la empresa: hosting, dominio, correo SMTP, Excel de picking, facturas de ejemplo, maestro de productos, vehículos, logotipo | Carlos Hugo | — | Jueves 10 de septiembre |
| 0.8 | **Reunión con el Ing. William** (viernes 11, 6:00 p. m.): agenda en la sección 12.1 | Jordin dirige, Daniela levanta acta, todos participan | — | Viernes 11 de septiembre |
| 0.9 | Acta de la tercera reunión subida a la carpeta de actas en Google Drive | Daniela | — | Sábado 12 de septiembre |
| 0.10 | Confirmación del stack y del hosting (reunión interna de 30 minutos tras la reunión con la empresa) y actualización de este plan a la versión 1.2 | Jordin | Todos | Sábado 12 de septiembre |
| 0.11 | Instalar el entorno de desarrollo local en las 5 máquinas (Node.js 22 LTS, PostgreSQL 16 o Docker, Git, VS Code con extensiones de Prisma, Tailwind y ESLint) y confirmar en WhatsApp que cada uno corre el proyecto base con `npm run dev` y `npx prisma migrate dev` | Cada integrante | Carlos Hugo asiste | Domingo 13 de septiembre |
| 0.12 | Crear el proyecto base en el repositorio (rama `develop`, Next.js 15 con TypeScript, Tailwind, Prisma conectado a PostgreSQL, `docker-compose.yml`, `.env.example`, `.gitignore`, README preliminar, estructura de carpetas de la sección 7.3) | Jordin | Carlos Hugo | Domingo 13 de septiembre |

### Fase 1. Análisis y diseño → Entregable 1 (lunes 14 – lunes 21 de septiembre)

**Objetivo:** cumplir el Entregable 1: introducción, antecedentes, problemática, justificación, objetivos, alcance y exclusiones, actores y roles, requerimientos funcionales y no funcionales, reglas de negocio, casos de uso principales, diagrama de casos de uso, diagrama de actividades del flujo principal, modelo ER inicial, arquitectura propuesta, tecnologías seleccionadas y prototipos de las principales interfaces (sitio público, panel administrativo y sistema logístico). Las reglas de conversión, el alcance, los flujos y los prototipos deben quedar **validados con INCOVSA** antes de la entrega.

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 1.1 | Redactar el documento de requerimientos (RF y RNF codificados: RF-SW-xx, RF-SL-xx, RNF-xx) a partir de la sección 3 y de lo aclarado el 11 de septiembre | Carlos Hugo | Daniel | Martes 15 de septiembre |
| 1.2 | Redactar la primera versión de las reglas de negocio de conversión kg → unidades (con ejemplos numéricos por presentación) para validarlas en la visita | Daniel | Carlos Hugo | Martes 15 de septiembre |
| 1.3 | Prototipos HTML del sitio público: inicio, quiénes somos, industrias, catálogo por industria, detalle de producto, contacto, noticias, ingreso de personal, área de documentación interna | Daniela | Jordin | Miércoles 16 de septiembre |
| 1.4 | Prototipos HTML del panel administrativo: inicio del panel, edición de información institucional, industrias, productos, noticias, contacto, documentos internos, usuarios | Daniela | Carlos Hugo | Miércoles 16 de septiembre |
| 1.5 | Prototipos HTML del sistema logístico: inicio, productos y presentaciones, equivalencias, inventario, pedidos pendientes, picking, preparación, tablero de bodega (TV/tableta), carga de vehículo, despacho, rutas, reportes | Josué | Daniel | Miércoles 16 de septiembre |
| 1.6 | Modelo ER inicial (draw.io) con entidades: empresa, sede/bodega, usuario, rol, industria, producto, presentación, equivalencia, lote, inventario, movimiento de inventario, cliente, pedido/factura, detalle de pedido, picking, detalle de picking, vehículo, carga, detalle de carga, despacho, ruta, noticia, contenido institucional, documento interno, solicitud de contacto, bitácora | Josué | Daniel | Miércoles 16 de septiembre |
| 1.7 | Enviar al Ing. William los prototipos y las reglas de conversión por correo/WhatsApp para que los revise antes de la visita | Jordin | — | Miércoles 16 de septiembre |
| 1.8 | Preparar la guía de observación de la visita (sección 12.2): qué observar, qué preguntar, qué fotografiar, qué documentos pedir | Carlos Hugo | Josué | Miércoles 16 de septiembre |
| 1.9 | **Visita presencial a la empresa** (jueves 17, 4:30 p. m.): observar el proceso real de picking, preparación, carga y despacho; validar reglas de conversión y prototipos; fotografiar (con autorización) bodega, presentaciones, etiquetas y el Excel de picking | Todos. Carlos Hugo dirige el levantamiento, Daniela levanta acta, Josué y Daniel registran datos de productos y presentaciones, Jordin valida prototipos y reglas | — | Jueves 17 de septiembre |
| 1.10 | Acta de la visita + organización de evidencias en Drive (Anexo B) | Daniela | Todos suben sus fotos | Viernes 18 de septiembre |
| 1.11 | Ajustar requerimientos, reglas de negocio, prototipos y modelo ER con lo validado en la visita. Obtener del Ing. William la confirmación escrita (correo o mensaje) de que aprueba el alcance, las reglas de conversión y los prototipos | Carlos Hugo (requerimientos), Daniel (reglas), Daniela y Josué (prototipos y ER), Jordin (confirmación) | — | Sábado 19 de septiembre |
| 1.12 | Diagrama de casos de uso y especificación de los casos de uso principales (administración de contenido, productos, presentaciones, inventario, pedidos, picking, preparación, carga, despacho, rutas, reportes, usuarios, documentación interna) | Carlos Hugo | Jordin | Sábado 19 de septiembre |
| 1.13 | Diagrama de actividades del flujo principal: pedido facturado → conversión → picking → preparación → inventario → carga → despacho → estado → reporte | Daniel | Josué | Sábado 19 de septiembre |
| 1.14 | Arquitectura propuesta (texto + diagrama) y tabla de tecnologías seleccionadas con versión y justificación | Jordin | Carlos Hugo | Sábado 19 de septiembre |
| 1.15 | Redacción del Documento 1 versión 0.1: portada, índices, capítulo 1 completo (introducción, antecedentes, problema, justificación, objetivos, alcance, fuera de alcance, actores), capítulo 2 (metodología, RF, RNF, reglas de negocio, matriz de trazabilidad inicial), capítulo 3 parcial (casos de uso, actividades), capítulo 4 parcial (arquitectura, tecnologías), capítulo 5.1 (ER inicial). Formato: carta, márgenes 2.54 cm, Arial 11 o 12, interlineado 1.5, justificado, títulos numerados, índice automático, tabla de control de versiones | Carlos Hugo integra; cada uno redacta su parte | Todos | Domingo 20 de septiembre, 12:00 p. m. |
| 1.16 | Revisión completa del documento (ortografía, consistencia, correspondencia con lo validado), exportación a PDF y etiqueta `v0.1-entregable1` en el repositorio | Jordin | Daniela | Domingo 20 de septiembre, 8:00 p. m. |
| 1.17 | Preparar la presentación del Entregable 1 (10 a 15 minutos): contexto, problema, alcance, roles, reglas de conversión, prototipos navegables, arquitectura, plan | Jordin | Todos exponen su parte | Domingo 20 de septiembre |
| 1.18 | **Entrega y presentación del Entregable 1 en clase** | Todos | — | Lunes 21 de septiembre |

### Fase 2. Desarrollo → Entregable 2 (martes 22 de septiembre – miércoles 14 de octubre)

**Objetivo:** cumplir el Entregable 2: sitio institucional con panel administrativo funcionando (autenticación, roles, contenido, industrias y catálogo), sistema logístico con productos, presentaciones, equivalencias, inventario, pedidos pendientes y generación de picking funcionando, con avance en preparación, estados y tablero. Documentación técnica: arquitectura actualizada, componentes, clases, secuencias, ER actualizado, diccionario de datos, estructura del repositorio, migraciones, dependencias, seguridad, README preliminar, casos de prueba iniciales y matriz de trazabilidad. Demostración obligatoria del flujo: **pedido facturado → conversión kg a unidades → generación de picking → preparación del pedido**, con lógica y persistencia reales.

#### Sprint 1 (martes 22 de septiembre – domingo 4 de octubre)

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 2.1 | Incorporar las correcciones del docente al Entregable 1 en el Documento 1 (versión 0.2) | Carlos Hugo | — | Viernes 25 de septiembre |
| 2.2 | Migraciones de todas las tablas del modelo ER validado; seeders con datos reales (empresas, sedes, roles, industrias, productos, presentaciones, equivalencias, vehículos, usuarios de prueba) | Josué | Daniel | Viernes 25 de septiembre |
| 2.3 | Autenticación (inicio de sesión, cierre de sesión, recuperación de contraseña), modelo de usuarios, roles y permisos, restricción por sede y por empresa, middleware de rutas protegidas, creación del primer administrador | Jordin | Carlos Hugo | Domingo 27 de septiembre |
| 2.4 | Plantilla base del sitio (layout, navegación, identidad visual, responsive) y páginas: inicio, quiénes somos, industrias, catálogo por industria, detalle de producto, contacto | Daniela | — | Miércoles 30 de septiembre |
| 2.5 | Backend del CMS: modelos y controladores de contenido institucional, imágenes, industrias, productos informativos, información de contacto; carga y validación de imágenes | Carlos Hugo | Daniela | Miércoles 30 de septiembre |
| 2.6 | Vistas del panel administrativo para lo anterior (listar, crear, editar, eliminar, subir imágenes) | Daniela | Carlos Hugo | Sábado 3 de octubre |
| 2.7 | Formulario de contacto: validación, almacenamiento en base de datos, envío por correo, bandeja de solicitudes en el panel | Carlos Hugo | — | Sábado 3 de octubre |
| 2.8 | Backend de productos, presentaciones, equivalencias y lotes (SKU único, origen, presentación, kg por unidad, vigencia) | Daniel | Josué | Domingo 27 de septiembre |
| 2.9 | Servicio de conversión kg → unidades con las reglas aprobadas (cantidades exactas, no exactas, redondeo, unidades de venta lb/kg/galón → kg) y pruebas automatizadas con los ejemplos validados por INCOVSA | Daniel | Jordin | Miércoles 30 de septiembre |
| 2.10 | Backend de inventario: entradas (con creación de lote), salidas, existencias por producto, presentación, lote y bodega; movimientos con bitácora; FIFO por lote | Daniel | Josué | Sábado 3 de octubre |
| 2.11 | Vistas del sistema logístico: layout, productos, presentaciones, equivalencias, inventario, entradas y salidas | Josué | Daniel | Domingo 4 de octubre |
| 2.12 | Configurar un entorno de pruebas accesible por internet (servidor de la empresa si ya se tiene acceso; de lo contrario una plataforma gratuita temporal que ejecute Next.js y PostgreSQL) con despliegue documentado paso a paso | Carlos Hugo | Jordin | Domingo 4 de octubre |
| 2.13 | Revisión de pull requests, integración en `develop`, demostración interna del Sprint 1 y registro de incidencias | Jordin | Todos | Domingo 4 de octubre |
| 2.14 | Reunión semanal con el Ing. William: mostrar avance del sitio y del CMS, confirmar datos de productos y presentaciones, recibir contenido pendiente | Jordin | Daniela (acta) | Semana del 28 de septiembre |

#### Sprint 2 (lunes 5 – martes 13 de octubre)

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 2.15 | Backend de pedidos facturados pendientes de despacho: registro (manual, importación o integración según lo decidido), cliente, detalle en kg, estados pendiente / en preparación / despachado / en ruta | Daniel | Jordin | Miércoles 7 de octubre |
| 2.16 | Generación de picking: conversión de cada línea del pedido a unidades por presentación, agrupación por factura y por cliente, lista de todos los pedidos a sacar de la bodega, guardado del recorrido, prioridad del día | Daniel | Josué | Viernes 9 de octubre |
| 2.17 | Preparación del pedido: marcar líneas preparadas, cambio de estado a "en preparación", descuento de inventario con bitácora de quién y cuándo | Daniel | Jordin | Sábado 10 de octubre |
| 2.18 | Vistas de pedidos, picking y preparación | Josué | Daniel | Sábado 10 de octubre |
| 2.19 | Tablero de proyección para TV/tableta: pedidos del día, prioridad, producto, presentación, cantidad en unidades, estado; letra grande, actualización automática | Josué | Daniela | Domingo 11 de octubre |
| 2.20 | Área de documentación interna en el sitio: acceso con inicio de sesión, listado de productos con fichas técnicas, hojas de seguridad y certificados; carga de archivos desde el panel; control por rol | Carlos Hugo (backend), Daniela (vistas) | Jordin | Domingo 11 de octubre |
| 2.21 | Noticias: modelo, panel y publicación en el inicio del sitio | Carlos Hugo (backend), Daniela (vistas) | — | Domingo 11 de octubre |
| 2.22 | Documento 2 versión 0.1: introducción técnica, arquitectura, diagrama de componentes, diagrama de clases, diagramas de secuencia (picking, conversión, inventario, preparación y estado, publicación en CMS), tecnologías y versiones, dependencias, estructura del repositorio, variables de entorno, configuración de desarrollo, migraciones, autenticación, roles, lógica de conversión, lógica de inventario, lógica de picking | Daniel integra; Josué (ER y diccionario de datos), Jordin (arquitectura, componentes, seguridad), Carlos Hugo (estructura, variables, configuración) | — | Domingo 11 de octubre |
| 2.23 | Diccionario de datos completo y reglas de integridad; modelo ER actualizado desde la base real | Josué | — | Sábado 10 de octubre |
| 2.24 | Documento 6 versión 0.1: estrategia de pruebas, casos de prueba iniciales (funcionales, roles, validación, conversión), evidencias del Sprint 1 y 2, registro de incidencias | Jordin | Cada uno entrega los casos de su módulo | Domingo 11 de octubre |
| 2.25 | Matriz de trazabilidad actualizada (requerimiento → módulo → caso de uso → prueba → estado) | Carlos Hugo | Jordin | Domingo 11 de octubre |
| 2.26 | README preliminar con las 16 secciones obligatorias | Carlos Hugo | Jordin | Domingo 11 de octubre |
| 2.27 | Documento 1 versión 0.3 con alcance, reglas de negocio y diagramas actualizados a lo implementado | Carlos Hugo | Todos | Lunes 12 de octubre |
| 2.28 | Preparar y ensayar la demostración del flujo pedido facturado → conversión → picking → preparación, con datos reales de la empresa, en el entorno de pruebas y en local como respaldo | Jordin | Daniel, Josué | Lunes 12 de octubre |
| 2.29 | Revisión final, exportación a PDF, etiqueta `v0.5-entregable2` | Jordin | Daniela | Martes 13 de octubre |
| 2.30 | **Entrega y presentación del Entregable 2 en clase** | Todos | — | Miércoles 14 de octubre |

### Fase 3. Completar, desplegar y entregar → Entregable 3 (jueves 15 de octubre – miércoles 4 de noviembre)

**Objetivo:** sistema completamente funcional y desplegado en el hosting de la empresa; documentación final de los seis documentos; pruebas con evidencia (incluida la prueba integral del flujo completo, las pruebas de conversión y la prueba del CMS por una persona ajena al desarrollo); capacitación al personal; respaldo y restauración probados; transferencia de accesos.

#### Sprint 3 (jueves 15 – domingo 25 de octubre)

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 3.1 | Incorporar las correcciones del docente al Entregable 2 | Cada responsable de documento | Jordin | Lunes 19 de octubre |
| 3.2 | Vehículos (capacidad mínima y máxima) y control de carga: asignación de pedidos preparados y cantidades a un vehículo, validación de kg contra capacidad, estado "en ruta" | Jordin (backend), Josué (vistas) | Daniel | Miércoles 21 de octubre |
| 3.3 | Despacho: registro de despacho, cambio de estado a "despachado", salida definitiva de inventario, bitácora | Jordin (backend), Josué (vistas) | Daniel | Viernes 23 de octubre |
| 3.4 | Rutas realizadas: registro por día, vehículo y pedidos; conteo de rutas por día | Jordin (backend), Josué (vistas) | — | Viernes 23 de octubre |
| 3.5 | Reportes: reporte diario de kilogramos y sacos despachados, pedidos por estado, rutas por día, movimientos de inventario; exportación a PDF/Excel | Jordin (backend), Josué (vistas) | Carlos Hugo | Domingo 25 de octubre |
| 3.6 | Historial de operaciones y consulta de bitácora en el sistema logístico | Daniel | Josué | Domingo 25 de octubre |
| 3.7 | Gestión de usuarios y roles desde el panel (crear, editar, desactivar, asignar rol, sede y empresa) | Jordin | Daniela (vistas) | Domingo 25 de octubre |
| 3.8 | Cargar el contenido real definitivo en el sitio: textos institucionales, imágenes, industrias, catálogo, contactos, documentos internos | Daniela | Carlos Hugo | Domingo 25 de octubre |
| 3.9 | Revisión de accesibilidad (contraste, textos alternativos, etiquetas, navegación por teclado) y responsive en escritorio, tableta y teléfono, con capturas para el capítulo 7 | Daniela | Josué | Domingo 25 de octubre |
| 3.10 | Pruebas de seguridad básicas: rutas protegidas, permisos por rol y por sede, sesiones, carga de archivos, validación de entradas | Jordin | Carlos Hugo | Domingo 25 de octubre |
| 3.11 | Reunión semanal con el Ing. William: validar carga, despacho, rutas y reportes; confirmar fecha de capacitación y de acceso al hosting | Jordin | Daniela (acta) | Semana del 19 de octubre |

#### Sprint 4 (lunes 26 de octubre – domingo 1 de noviembre)

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 3.12 | Despliegue de producción en el hosting de la empresa con el dominio y HTTPS; configuración de correo, almacenamiento y variables de entorno; creación del primer administrador | Carlos Hugo | Jordin | Martes 27 de octubre |
| 3.13 | Respaldo de base de datos, archivos y configuración; **prueba de restauración documentada** con evidencia | Carlos Hugo | Josué | Miércoles 28 de octubre |
| 3.14 | Prueba integral del flujo completo en producción: pedido facturado → conversión → picking → preparación → inventario → carga → despacho → estado → reporte, con evidencia paso a paso | Jordin | Daniel, Josué | Jueves 29 de octubre |
| 3.15 | Pruebas de conversión (todos los escenarios exigidos) y pruebas de inventario, comparadas con cálculos validados por INCOVSA | Daniel | Jordin | Jueves 29 de octubre |
| 3.16 | Prueba del CMS por una persona ajena al desarrollo (personal de INCOVSA) usando solo el panel y el manual; registrar resultado | Daniela | Carlos Hugo | Viernes 30 de octubre |
| 3.17 | Pruebas responsive y de compatibilidad en los navegadores definidos en los requerimientos finales | Daniela | Josué | Viernes 30 de octubre |
| 3.18 | Documento 3 (manual del administrador del sitio, 17 apartados con capturas) | Daniela | Carlos Hugo | Viernes 30 de octubre |
| 3.19 | Documento 4 (manual del sistema logístico, 22 apartados con capturas) | Josué | Daniel | Viernes 30 de octubre |
| 3.20 | Documento 5 (instalación, despliegue y mantenimiento, 19 apartados con comandos reales) | Carlos Hugo | Jordin | Viernes 30 de octubre |
| 3.21 | Documento 2 final, incluyendo lógica de picking y despacho, manejo de archivos, manejo de errores, servicios externos, respaldos, procedimiento para agregar nuevas funcionalidades con un ejemplo real, convenciones y limitaciones conocidas | Daniel | Todos aportan su módulo | Sábado 31 de octubre |
| 3.22 | Documento 6 final: todas las secciones, evidencias y registro de incidencias | Jordin | Todos | Sábado 31 de octubre |
| 3.23 | **Capacitación** al personal de INCOVSA (administradores del sitio y personal de bodega), con lista de asistencia, fotos o grabación (Anexo H) | Daniela (sitio y CMS), Josué y Daniel (sistema logístico) | Jordin coordina la fecha con el Ing. William | Sábado 31 de octubre (fecha sujeta a la empresa) |
| 3.24 | Corrección de incidencias encontradas en pruebas y capacitación | Cada responsable de módulo | Jordin revisa | Domingo 1 de noviembre |

#### Cierre (lunes 2 – miércoles 4 de noviembre)

| # | Tarea | Responsable | Apoyo | Fecha límite |
|---|---|---|---|---|
| 3.25 | Congelamiento de código: fusión de `develop` en `main`, etiqueta `v1.0-final`, limpieza del repositorio (sin credenciales, sin archivos generados) | Jordin | Carlos Hugo | Lunes 2 de noviembre |
| 3.26 | Documento 1 versión 1.0: conclusiones, recomendaciones, trabajo futuro, diagramas definitivos y matriz de trazabilidad final | Carlos Hugo | Todos | Lunes 2 de noviembre |
| 3.27 | README final y anexos A a J organizados; inventario de servicios y accesos (Anexo J) y entrega de credenciales por Bitwarden o mecanismo seguro acordado con el Ing. William (Anexo I: evidencia de entrega) | Carlos Hugo | Jordin | Martes 3 de noviembre |
| 3.28 | Revisión cruzada de los seis documentos (cada uno revisa el documento de otro) y exportación a PDF | Todos | — | Martes 3 de noviembre |
| 3.29 | Ensayo de la presentación final con demostración del flujo completo en producción y respaldo en local | Todos | — | Martes 3 de noviembre |
| 3.30 | **Entrega y presentación final en clase** | Todos | — | Miércoles 4 de noviembre |

---

## 10. Matriz de responsabilidades

### 10.1 Documentos entregables

| Documento | Responsable | Colaboradores |
|---|---|---|
| Documento 1. Memoria general y especificación del sistema | Carlos Hugo | Todos (cada uno redacta su área) |
| Documento 2. Documentación técnica del sistema | Daniel | Josué (base de datos), Jordin (arquitectura y seguridad), Carlos Hugo (configuración) |
| Documento 3. Manual de usuario – administración del sitio | Daniela | Carlos Hugo |
| Documento 4. Manual de usuario – sistema logístico | Josué | Daniel |
| Documento 5. Manual técnico de instalación, despliegue y mantenimiento | Carlos Hugo | Jordin |
| Documento 6. Plan y evidencias de pruebas | Jordin | Todos |
| README obligatorio | Carlos Hugo | Jordin |
| Actas de reuniones (Anexo A) | Daniela | — |
| Presentaciones en clase | Jordin | Todos exponen |

### 10.2 Diagramas

| Diagrama | Responsable |
|---|---|
| Casos de uso y especificación de casos de uso | Carlos Hugo |
| Actividades (picking, preparación y despacho, carga, inventario) | Daniel |
| Secuencia (6 obligatorios) | Daniel (picking, conversión, inventario, preparación), Jordin (carga y despacho), Carlos Hugo (publicación en CMS) |
| Arquitectura, componentes y despliegue | Jordin |
| Clases | Daniel |
| Entidad-relación y diccionario de datos | Josué |

### 10.3 Módulos de software

| Módulo | Backend | Frontend / vistas |
|---|---|---|
| Sitio público (inicio, quiénes somos, industrias, catálogo, producto, contacto, noticias) | Carlos Hugo | Daniela |
| Panel administrativo (CMS) | Carlos Hugo | Daniela |
| Formulario de contacto y bandeja de solicitudes | Carlos Hugo | Daniela |
| Documentación interna protegida (archivos) | Carlos Hugo | Daniela |
| Autenticación, recuperación de contraseña, usuarios, roles, sedes y empresas | Jordin | Daniela |
| Productos, presentaciones, equivalencias, lotes | Daniel | Josué |
| Motor de conversión kg → unidades | Daniel | Josué |
| Inventario, entradas, salidas, existencias, bitácora | Daniel | Josué |
| Pedidos pendientes, picking, preparación, estados | Daniel | Josué |
| Tablero de proyección (TV/tableta) | Daniel | Josué |
| Vehículos, carga, despacho, rutas | Jordin | Josué |
| Reportes y exportación | Jordin | Josué |
| Base de datos: migraciones, seeders, integridad | Josué | — |
| Entornos, despliegue, dominio, HTTPS, respaldos | Carlos Hugo | — |
| Revisión de código y control de calidad | Jordin | — |

---

## 11. Información pendiente de recopilar de INCOVSA

Esta lista se convierte en el cuestionario de la reunión del 11 de septiembre y en la guía de la visita del 17 de septiembre. Se marca la prioridad: **E1** = necesaria para el Entregable 1, **E2** = necesaria para el Entregable 2, **E3** = necesaria para la entrega final.

### 11.1 Decisiones que bloquean el diseño

| # | Información | Prioridad | Cuándo obtenerla |
|---|---|---|---|
| A1 | Cómo ingresarán los pedidos facturados al sistema logístico: integración con Odoo (versión, acceso a su API o base de datos, quién lo autoriza), importación de archivo exportado desde Odoo (formato y campos), o registro manual | E1 | Reunión 11/09 |
| A2 | Aceptación del stack (Node.js + Next.js + Prisma + PostgreSQL) y tipo de hosting de la empresa: proveedor, si es compartido (cPanel/PHP) o VPS, si puede ejecutar Node.js 22 y PostgreSQL 16, acceso por SSH. Si es compartido, acordar la contratación de un VPS o plataforma compatible, que la empresa dijo que cubre | E1 | Reunión 11/09 |
| A3 | Dominio a utilizar (nombre exacto, dónde está registrado, quién administra el DNS) y si el sistema logístico irá en un subdominio o en una ruta del mismo sitio | E1 | Reunión 11/09 |
| A4 | Si el sitio muestra solo a INCOVSA o también a Inquiserca (y cómo: una sección, otro sitio, misma identidad) | E1 | Reunión 11/09 |
| A5 | Lista definitiva de roles y qué puede hacer cada uno: facturador, despacho, bodega, envío, gerencia, administrador de contenido, rol general de documentación. Cuáles roles existen en cada sede | E1 | Reunión 11/09 y visita 17/09 |
| A6 | Cantidad de usuarios por rol y por sede, y quién será el administrador del sistema | E2 | Reunión 11/09 |

### 11.2 Reglas de negocio del sistema logístico (validar en la visita)

| # | Información | Prioridad | Cuándo obtenerla |
|---|---|---|---|
| B1 | El archivo de Excel del picking manual actual (copia real), para entender columnas, flujo y quién lo llena | E1 | Solicitar 11/09, recibir en visita 17/09 |
| B2 | Facturas o documentos de envío de ejemplo (3 a 5, pueden anonimizar cliente y precio): campos, unidad facturada, cómo aparece el producto | E1 | Solicitar 11/09 |
| B3 | Maestro de productos: SKU, nombre, origen, presentaciones disponibles y kg por unidad de cada presentación (saco, cubeta, tambor, galón u otras), unidades de venta (lb, kg, galón) y factores de conversión | E1 | Solicitar 11/09, validar 17/09 |
| B4 | Regla exacta de conversión kg → unidades cuando la cantidad no es exacta (por ejemplo, 510 kg de un producto en sacos de 25 kg): ¿se redondea hacia arriba, hacia abajo, se fracciona la presentación, se ajusta la factura? ¿Hay productos que se venden fraccionados? | E1 | Visita 17/09 |
| B5 | Productos líquidos vendidos por galón: cómo se convierten a kg (densidad o factor por producto) | E1 | Visita 17/09 |
| B6 | Manejo de lotes en bodega: ¿el picking indica de qué lote sacar (FIFO)? ¿El lote está etiquetado físicamente? ¿Puede un pedido salir de varios lotes? | E1 | Visita 17/09 |
| B7 | Cómo están identificados y ubicados los productos dentro de la bodega (racks, zonas, códigos de ubicación) y si el sistema debe registrar ubicación para el recorrido de picking | E1 | Visita 17/09 |
| B8 | Definición exacta de cada estado del pedido (pendiente, en preparación, despachado, en ruta), quién cambia cada estado y en qué orden ocurren "despachado" y "en ruta" | E1 | Visita 17/09 |
| B9 | Qué significa "guardar el recorrido" del picking: orden de productos, orden de pedidos, ruta dentro de la bodega | E1 | Visita 17/09 |
| B10 | Cómo se recibe hoy el producto (compras nacionales y extranjeras): documento de entrada, unidad de compra, conversión a kg, quién registra | E1 | Visita 17/09 |
| B11 | Inventario inicial por bodega, producto, presentación y lote para arrancar el sistema (se puede exportar de Odoo) | E2 | Solicitar 11/09, recibir antes del 22/09 |
| B12 | Si el inventario del sistema será la fuente de verdad o solo un espejo de Odoo, y si INCOVSA e Inquiserca comparten existencias físicas | E1 | Reunión 11/09 |
| B13 | Lista de vehículos: identificación, capacidad mínima y máxima en kg, sede a la que pertenecen, piloto | E2 | Solicitar 11/09 |
| B14 | Qué se registra en una ruta: fecha, vehículo, piloto, pedidos incluidos, kg totales, hora de salida y de retorno | E1 | Visita 17/09 |
| B15 | Qué es un "saco" en el reporte diario de kg y sacos despachados cuando el producto no viene en sacos (¿se cuenta como unidad?) y qué otros reportes esperan | E2 | Visita 17/09 |
| B16 | Cómo se define la prioridad diaria de despacho y quién la asigna desde la tableta | E1 | Visita 17/09 |
| B17 | Dispositivos reales para el tablero: tamaño de TV o tableta, navegador, si hay internet o Wi-Fi en cada bodega | E2 | Visita 17/09 |
| B18 | Clientes: si el sistema necesita un catálogo de clientes (nombre, dirección, sede que lo atiende) y en qué formato lo entregarán | E2 | Solicitar 11/09 |
| B19 | Ejemplos numéricos validados por INCOVSA para las pruebas de conversión (al menos 10 casos con resultado esperado, confirmados por escrito) — Anexo E | E1 | Visita 17/09 y confirmación por correo |

### 11.3 Contenido e identidad del sitio web

| # | Información | Prioridad | Cuándo obtenerla |
|---|---|---|---|
| C1 | Textos de historia, misión, visión y valores (la empresa se comprometió a enviarlos a más tardar la semana del 7 al 11 de septiembre) | E1 | Confirmar recepción 11/09 |
| C2 | Logotipo en alta resolución (vectorial si existe), colores institucionales y tipografía si tienen manual de marca | E1 | Solicitar 11/09 |
| C3 | Imágenes para el sitio (la empresa las tiene en presentaciones): organizar por sección e industria; confirmar derechos de uso | E2 | Solicitar 11/09 |
| C4 | Lista definitiva de industrias atendidas con descripción corta e imagen de cada una | E1 | Solicitar 11/09 |
| C5 | Catálogo de productos a publicar: qué productos van en el sitio (no necesariamente todos, por ser químicos de venta restringida), a qué industrias pertenece cada uno, descripción, origen, presentación en kg, almacenamiento, humedad, tipo, restricciones | E2 | Solicitar 11/09 |
| C6 | Información de contacto por sede: dirección, teléfono, correo, horario; redes sociales; ubicación en mapa si la desean | E1 | Solicitar 11/09 |
| C7 | Correo que recibirá las solicitudes del formulario de contacto y si además se guardan en el sistema (ambas cosas están permitidas por la propuesta) | E1 | Reunión 11/09 |
| C8 | Cuenta de correo (SMTP) que el sistema usará para enviar correos | E2 | Solicitar 11/09 |
| C9 | Noticias: quién las publicará, con qué frecuencia y si tienen contenido inicial | E2 | Reunión 11/09 |
| C10 | Ejemplos reales de ficha técnica, hoja de seguridad y certificado de análisis (formato, tamaño, si son PDF), quién los sube y qué roles pueden verlos | E1 | Solicitar 11/09 |
| C11 | Confirmar el nombre exacto con el que se debe presentar la empresa en el sitio (razón social "Industria del Cuero Covadonga S. A." vs. marca "INCOVSA") | E1 | Reunión 11/09 |

### 11.4 Aspectos administrativos

| # | Información | Prioridad | Cuándo obtenerla |
|---|---|---|---|
| D1 | Correo y teléfono del Ing. William Ambrossio y del Ing. Luis Orozco para las actas y para envíos formales | E1 | Reunión 11/09 |
| D2 | Autorización para tomar fotografías y video en la bodega durante la visita y para usarlas en la documentación académica | E1 | Reunión 11/09 |
| D3 | Si la empresa requiere acuerdo de confidencialidad o restricción sobre datos que aparezcan en la documentación (precios, clientes, proveedores) | E1 | Reunión 11/09 |
| D4 | Personas que recibirán la capacitación (sitio y bodega) y fecha tentativa (última semana de octubre) | E3 | Reunión de la semana del 19/10 |
| D5 | Persona que recibirá los accesos y credenciales en la entrega final y medio seguro para entregarlos | E3 | Reunión de la semana del 19/10 |
| D6 | Disponibilidad del Ing. William para las reuniones semanales de las próximas 8 semanas (día y hora tentativos) | E1 | Reunión 11/09 |
| D7 | Persona de INCOVSA que hará la prueba del CMS sin ayuda del equipo (exigida por los lineamientos) | E3 | Reunión de la semana del 19/10 |

---

## 12. Agendas propuestas

### 12.1 Reunión virtual del viernes 11 de septiembre, 6:00 p. m. (Google Meet)

Duración estimada: 90 minutos. Dirige Jordin; acta: Daniela.

1. (5 min) Resumen de acuerdos de la reunión anterior y confirmación de recepción de textos e imágenes (C1, C3).
2. (10 min) Presentación del plan de trabajo, fechas de entrega (21/09, 14/10, 04/11) y roles del equipo.
3. (10 min) Propuesta de stack tecnológico y preguntas sobre hosting y dominio (A2, A3).
4. (15 min) Ingreso de pedidos facturados: integración con Odoo o alternativa (A1, B2, B11, B12, B18).
5. (15 min) Roles, sedes y empresas (A4, A5, A6, C11).
6. (15 min) Sitio web: contenido, catálogo, contacto, documentación interna (C2, C4 a C10).
7. (10 min) Preparación de la visita del 17 de septiembre: qué documentos tener listos (B1, B2, B3, B13), autorización de fotos (D2), confidencialidad (D3).
8. (5 min) Datos de contacto y disponibilidad para reuniones (D1, D6). Acuerdo de la fecha de validación de prototipos y reglas de conversión (antes del 19/09).
9. (5 min) Cierre: lista de pendientes de cada parte con fechas.

### 12.2 Visita presencial del jueves 17 de septiembre, 4:30 p. m. (1 hora)

Objetivo: observar la operación real de picking, preparación, carga y despacho, y validar reglas de conversión, prototipos y modelo de datos.

| Minuto | Actividad | Quién del equipo |
|---|---|---|
| 0–10 | Recorrido por la bodega: ubicación de productos, identificación (etiquetas, lote, SKU), presentaciones físicas. Fotografiar con autorización | Todos; Josué y Daniel anotan presentaciones y kg por unidad (B3, B6, B7) |
| 10–25 | Observar o que expliquen un picking real con el Excel actual: desde la factura hasta la lista de unidades (B1, B4, B5, B9, B16) | Carlos Hugo dirige preguntas; Daniel valida las reglas de conversión con casos numéricos (B19) |
| 25–35 | Preparación y cambio de estado: quién marca, cómo se sabe que un pedido está listo (B8) | Carlos Hugo, Jordin |
| 35–45 | Carga de vehículo y despacho: capacidad, cómo deciden qué va en cada camión, registro de salida y de ruta (B13, B14, B15) | Jordin, Josué |
| 45–55 | Validación rápida de prototipos en tableta o laptop: sitio público, panel, pantallas de picking y tablero (¿dónde estaría la TV o tableta? B17) | Daniela, Josué |
| 55–60 | Cierre: confirmar pendientes, pedir el Excel y facturas de ejemplo si no se han recibido, acordar confirmación escrita de las reglas | Jordin; Daniela levanta acta |

Material a llevar: prototipos impresos o en tableta, tabla de reglas de conversión con ejemplos, lista de preguntas B1 a B19, cámara del teléfono, cuaderno.

---

## 13. Riesgos identificados y cómo mitigarlos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La empresa no entrega a tiempo textos, imágenes, maestro de productos o inventario inicial | Retrasa el sitio y los seeders con datos reales | Solicitar todo el 11/09 con fechas; usar datos de ejemplo claramente marcados mientras llegan; recordar los pendientes en cada reunión y en el acta |
| Reglas de conversión ambiguas o cambiantes | La lógica central del proyecto y sus pruebas no corresponden con la realidad | Validar con ejemplos numéricos en la visita, obtener confirmación escrita (Anexo E), programar las reglas como servicio aislado con pruebas automatizadas |
| Integración con Odoo no definida o sin acceso | Bloquea el módulo de pedidos | Decidir el 11/09; si no hay acceso confirmado antes del 22/09, implementar importación desde archivo y registro manual, y documentar la integración como trabajo futuro |
| Hosting de la empresa compartido (PHP/cPanel), incompatible con Node.js y PostgreSQL | Retrasa el despliegue final | Confirmar tipo de hosting el 11/09; si es compartido, acordar ese mismo día la contratación de un VPS o plataforma compatible por parte de la empresa; tener acceso al servidor a más tardar el 4/10 para el entorno de pruebas |
| Carga de trabajo desigual o un integrante sin avance | Retraso en módulos con un solo responsable | Cada módulo tiene responsable y apoyo; reporte diario en WhatsApp; el coordinador redistribuye tareas en la reunión interna semanal |
| Documentación elaborada al final, sin corresponder con el sistema | Pérdida de puntos en los tres entregables por falta de correspondencia | Documentar como parte de la definición de terminado de cada tarea; revisión cruzada antes de cada entrega |
| Capacitación o prueba del CMS por personal de INCOVSA sin fecha | Faltan los Anexos H e I y la sección 12 del Documento 6 | Acordar fecha en la reunión de la semana del 19/10; tener plan B de capacitación virtual grabada |

---

## Control de versiones de este plan

| Versión | Fecha | Responsable | Descripción del cambio |
|---|---|---|---|
| 1.0 | 08/09/2026 | Jordin García | Creación inicial del plan a partir de las actas, la propuesta de INCOVSA y los lineamientos del docente |
| 1.1 | 09/09/2026 | Jordin García | Stack cambiado a Node.js 22 + Next.js 15 + Prisma + PostgreSQL 16 (el equipo lo domina mejor); actas y anexos se guardan en Google Drive y no en el repositorio privado |
| 1.2 | Pendiente (12/09/2026) | Jordin García | Actualización con hosting confirmado, mecanismo de ingreso de pedidos y acuerdos de la reunión del 11/09 |
