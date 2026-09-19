# Cuestionario — Reunión con el Ing. William Ambrossio

**Fecha prevista:** viernes 11 de septiembre de 2026, 6:00 p. m. (Google Meet)  
**Responsable:** Carlos Hugo Escobar Gómez  
**Apoyo:** José Daniel Cifuentes Carrascosa  
**Fuente:** sección 11 del `PLAN_DE_PROYECTO.md`  
**Prioridad:** se prioriza lo que bloquea el **Entregable 1** (E1). Las preguntas E2/E3 se dejan al final si hay tiempo.

---

## Cómo usar este cuestionario

1. Jordin dirige la reunión según la agenda de la sección 12.1.
2. Carlos Hugo formula las preguntas; Daniel anota respuestas de reglas de conversión / pedidos.
3. Daniela registra acuerdos en el acta (Anexo A, Google Drive).
4. Marcar cada ítem: **Respondido** / **Pendiente** / **Aplazado a visita 17/09**.

---

## Bloque A — Decisiones que bloquean el diseño (E1)

### A1. Ingreso de pedidos facturados
- ¿Los pedidos facturados llegarán por integración con Odoo, por importación de archivo o por registro manual?
- Si es Odoo: ¿qué versión usan? ¿Hay API o acceso a base de datos? ¿Quién autoriza el acceso?
- Si es archivo: ¿qué formato y qué campos exportan hoy?
- ¿Quién en INCOVSA cargará o confirmará los pedidos en el sistema?

### A2. Stack y hosting
- ¿Aceptan el stack propuesto (Node.js 22 + Next.js 15 + Prisma + PostgreSQL 16)?
- ¿Qué hosting tienen hoy (proveedor, compartido cPanel/PHP o VPS)?
- ¿Puede ejecutar Node.js 22 y PostgreSQL 16? ¿Hay acceso SSH?
- Si es hosting compartido: ¿pueden contratar un VPS o plataforma compatible (la empresa dijo que cubre el pago)?

### A3. Dominio
- ¿Cuál es el nombre exacto del dominio?
- ¿Dónde está registrado y quién administra el DNS?
- ¿El sistema logístico irá en un subdominio o en una ruta del mismo sitio?

### A4. Empresas en el sitio
- ¿El sitio muestra solo INCOVSA o también Inquiserca?
- Si ambas: ¿una sección, otro sitio o la misma identidad visual?

### A5. Roles
- Confirmar lista definitiva de roles: facturador, despacho, bodega, envío, gerencia, administrador de contenido, rol general de documentación.
- ¿Qué puede hacer cada rol?
- ¿Cuáles roles existen en cada sede (Xela, Guatemala, Escuintla)?

### A6. Usuarios (E2 si falta tiempo)
- ¿Cuántos usuarios por rol y por sede?
- ¿Quién será el administrador del sistema?

---

## Bloque B — Insumos logísticos a solicitar ya (recibir en visita o antes)

| Código | Pregunta / solicitud | Prioridad |
|---|---|---|
| B1 | ¿Pueden entregar una copia del Excel de picking actual? | E1 |
| B2 | ¿Pueden compartir 3–5 facturas o documentos de envío de ejemplo (anonimizados)? | E1 |
| B3 | ¿Pueden entregar el maestro de productos (SKU, origen, presentaciones, kg por unidad)? | E1 |
| B11 | ¿Pueden exportar inventario inicial por bodega/producto/lote desde Odoo? | E2 |
| B12 | ¿El inventario del nuevo sistema será fuente de verdad o espejo de Odoo? ¿INCOVSA e Inquiserca comparten existencias? | E1 |
| B13 | ¿Pueden entregar lista de vehículos (id, capacidad min/max, sede, piloto)? | E2 |
| B18 | ¿Necesitamos catálogo de clientes en el sistema? ¿En qué formato lo entregarían? | E2 |

> Las reglas B4–B10, B14–B17 y B19 se validan en la **visita del 17/09** (ver guía de observación).

---

## Bloque C — Contenido e identidad del sitio (E1 primero)

| Código | Pregunta / solicitud | Prioridad |
|---|---|---|
| C1 | ¿Ya enviaron textos de historia, misión, visión y valores? Si no, ¿cuándo? | E1 |
| C2 | ¿Pueden entregar logotipo en alta resolución (vectorial si existe), colores y tipografía? | E1 |
| C3 | ¿Pueden organizar/compartir imágenes por sección e industria? | E2 |
| C4 | ¿Cuál es la lista definitiva de industrias con descripción corta? | E1 |
| C5 | ¿Qué productos van al catálogo público y con qué datos (sin precios)? | E2 |
| C6 | Contacto por sede: dirección, teléfono, correo, horario, redes, mapa | E1 |
| C7 | ¿Qué correo recibirá las solicitudes del formulario? ¿También se guardan en BD? | E1 |
| C8 | Cuenta SMTP para envío de correos del sistema | E2 |
| C9 | ¿Quién publica noticias y con qué frecuencia? | E2 |
| C10 | Ejemplos de ficha técnica, hoja de seguridad y certificado; quién los sube; qué roles los ven | E1 |
| C11 | Nombre exacto en el sitio: razón social vs. marca INCOVSA | E1 |

---

## Bloque D — Aspectos administrativos (E1)

| Código | Pregunta | Prioridad |
|---|---|---|
| D1 | Correo y teléfono del Ing. William y del Ing. Luis Orozco | E1 |
| D2 | ¿Autorizan fotografías y video en bodega para documentación académica? | E1 |
| D3 | ¿Requieren acuerdo de confidencialidad o restricción de datos (precios, clientes, proveedores)? | E1 |
| D6 | Disponibilidad para reuniones semanales (día y hora) las próximas 8 semanas | E1 |

---

## Orden sugerido (prioriza bloqueo del Entregable 1)

1. A2, A3, A1 (stack, hosting, dominio, ingreso de pedidos)
2. A4, A5, C11 (empresas, roles, nombre comercial)
3. C1, C2, C4, C6, C7, C10 (contenido mínimo del sitio)
4. B1, B2, B3, B12 + preparación de visita (D2, D3)
5. Si hay tiempo: A6, B11, B13, B18, C3, C5, C8, C9

---

## Control

| Campo | Valor |
|---|---|
| Versión | 0.1 |
| Fecha | 10/09/2026 |
| Autor | Carlos Hugo Escobar Gómez |
| Estado | Listo para la reunión; respuestas pendientes de acta Anexo A |
