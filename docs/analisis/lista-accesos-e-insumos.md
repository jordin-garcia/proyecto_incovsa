# Lista de accesos e insumos a solicitar a INCOVSA

**Responsable:** Carlos Hugo Escobar Gómez  
**Fecha límite (plan):** jueves 10 de septiembre de 2026  
**Uso:** checklist para la reunión del 11/09 y seguimiento hasta la visita del 17/09  
**Nota:** las credenciales reales se gestionan por Bitwarden / medio seguro (Anexo J), **no** se guardan en este repositorio.

---

## 1. Accesos técnicos

| # | Insumo / acceso | Para qué | Prioridad | Estado | Notas |
|---|---|---|---|---|---|
| 1 | Confirmación de tipo de hosting (compartido vs VPS / plataforma Node) | Despliegue y Documento 5 | E1 | Pendiente | Pregunta A2 |
| 2 | Acceso SSH o panel del servidor de pruebas/producción | Entorno de pruebas y despliegue | E2 | Pendiente | Tras decidir hosting |
| 3 | Dominio y acceso DNS (o contacto de quien lo administra) | HTTPS, dominio, subdominio/ruta | E1 | Pendiente | Pregunta A3 |
| 4 | Cuenta de correo SMTP corporativa (host, puerto, usuario) | Formulario de contacto y recuperación de contraseña | E2 | Pendiente | Pregunta C8 |
| 5 | Correo destino de solicitudes de contacto | Módulo de contacto | E1 | Pendiente | Pregunta C7 |
| 6 | Acceso a API/BD de Odoo **o** definición de formato de importación | Ingreso de pedidos facturados | E1 | Pendiente | Pregunta A1 |

---

## 2. Insumos de logística de bodega

| # | Insumo | Para qué | Prioridad | Estado | Notas |
|---|---|---|---|---|---|
| 7 | Excel de picking actual (copia real) | Entender columnas, flujo y recorrido | E1 | Pendiente | B1 — idealmente recibir el 17/09 |
| 8 | 3–5 facturas / documentos de envío de ejemplo (anonimizados) | Modelo de pedidos y conversión | E1 | Pendiente | B2 |
| 9 | Maestro de productos (SKU, nombre, origen, presentaciones, kg/unidad, unidades de venta) | Equivalencias y catálogo | E1 | Pendiente | B3 |
| 10 | Lista de vehículos (id, capacidad min/max kg, sede, piloto) | Módulo de carga y rutas | E2 | Pendiente | B13 |
| 11 | Inventario inicial por bodega / producto / presentación / lote | Seeders e inventario | E2 | Pendiente | B11 — antes del 22/09 |
| 12 | Catálogo de clientes (si aplica) | Pedidos y despacho | E2 | Pendiente | B18 |
| 13 | Ejemplos numéricos de conversión kg → unidades (≥10 casos) | Reglas de negocio y Anexo E | E1 | Pendiente | B19 — validar en visita |

---

## 3. Insumos del sitio web institucional

| # | Insumo | Para qué | Prioridad | Estado | Notas |
|---|---|---|---|---|---|
| 14 | Textos de historia, misión, visión y valores | Página Quiénes somos | E1 | Pendiente | C1 — compromiso empresa semana 7–11/09 |
| 15 | Logotipo (alta resolución / vectorial) | Identidad visual | E1 | Pendiente | C2 |
| 16 | Colores institucionales y tipografía (si hay manual de marca) | Diseño del sitio | E1 | Pendiente | C2 |
| 17 | Imágenes por sección e industria | Sitio público | E2 | Pendiente | C3 |
| 18 | Lista definitiva de industrias (nombre, descripción corta, imagen) | Navegación por industria | E1 | Pendiente | C4 |
| 19 | Catálogo público de productos (sin precios; con restricciones) | Catálogo informativo | E2 | Pendiente | C5 |
| 20 | Datos de contacto por sede | Módulo de contacto | E1 | Pendiente | C6 |
| 21 | Ejemplos de ficha técnica, hoja de seguridad y certificado (PDF) | Documentación interna | E1 | Pendiente | C10 |

---

## 4. Autorizaciones y contactos

| # | Insumo | Para qué | Prioridad | Estado | Notas |
|---|---|---|---|---|---|
| 22 | Autorización de fotos/video en bodega | Evidencias Anexo B | E1 | Pendiente | D2 |
| 23 | Indicaciones de confidencialidad | Documentación académica | E1 | Pendiente | D3 |
| 24 | Correos/teléfonos de contacto formales | Actas y envíos | E1 | Pendiente | D1 |
| 25 | Disponibilidad semanal del Ing. William | Reuniones de seguimiento | E1 | Pendiente | D6 |

---

## 5. Seguimiento sugerido

1. **11/09:** solicitar formalmente los ítems E1; registrar compromisos con fecha en el acta.
2. **17/09:** recibir Excel, facturas, maestro y validar conversión in situ.
3. **Antes del 22/09:** inventario inicial y accesos de hosting/SMTP para Sprint 1.
4. Credenciales: solo en Bitwarden / mecanismo acordado; actualizar inventario Anexo J fuera del repositorio.

---

## Control

| Campo | Valor |
|---|---|
| Versión | 0.1 |
| Fecha | 10/09/2026 |
| Autor | Carlos Hugo Escobar Gómez |
| Estado | Checklist inicial; actualizar estados tras reunión 11/09 y visita 17/09 |
