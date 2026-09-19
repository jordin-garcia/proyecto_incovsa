# Especificación de casos de uso principales

**Responsable:** Carlos Hugo Escobar Gómez  
**Apoyo:** Héctor Jordin Adolfo García Coyoy  
**Tarea del plan:** 1.12  
**Versión:** 0.1  
**Fecha:** 14/09/2026  
**Diagrama:** `docs/diagramas/casos-de-uso.drawio` y vista Mermaid en `docs/diagramas/casos-de-uso.md`

> Versión previa a la visita del 17/09. Los flujos de picking/estados se ajustarán con lo observado (tarea 1.11).

---

## 1. Actores

| Actor | Tipo | Descripción |
|---|---|---|
| Visitante | Primario | Persona externa que navega el sitio público |
| Administrador de contenido | Primario | Gestiona contenidos del CMS |
| Usuario documentación | Primario | Consulta fichas/hojas/certificados |
| Facturador | Primario | Ingresa o confirma pedidos facturados |
| Bodega | Primario | Ejecuta picking y preparación; usa tablero |
| Despacho | Primario | Carga vehículos y registra despacho/rutas |
| Gerencia | Primario | Consulta información multi-sede y reportes |
| Administrador del sistema | Primario | Usuarios, roles y configuración |
| Motor de conversión | Secundario | Servicio interno kg → unidades |
| Servicio de correo | Secundario | Envío de notificaciones/contacto |
| Odoo (opcional) | Secundario | Fuente posible de pedidos (pendiente A1) |

---

## 2. Catálogo de casos de uso

### Sitio y CMS

| ID | Caso de uso | Actor principal | RF |
|---|---|---|---|
| CU-01 | Navegar el sitio institucional | Visitante | RF-SW-01, 02, 03, 08, 09 |
| CU-02 | Consultar catálogo y detalle de producto | Visitante | RF-SW-04, 05 |
| CU-03 | Enviar solicitud de contacto | Visitante | RF-SW-06 |
| CU-04 | Iniciar / cerrar sesión | Usuarios internos | RF-SW-09, 12 |
| CU-05 | Recuperar contraseña | Usuarios internos | RF-SW-12 |
| CU-06 | Administrar contenido institucional | Administrador de contenido | RF-SW-07, 11 |
| CU-07 | Administrar industrias y catálogo informativo | Administrador de contenido | RF-SW-03, 04, 07 |
| CU-08 | Publicar noticias | Administrador de contenido | RF-SW-14 |
| CU-09 | Gestionar solicitudes de contacto | Administrador de contenido | RF-SW-06 |
| CU-10 | Cargar y consultar documentación interna | Admin contenido / Usuario documentación | RF-SW-10 |
| CU-11 | Gestionar usuarios y roles | Administrador del sistema | RF-SW-13, RF-SL-14 |

### Sistema logístico

| ID | Caso de uso | Actor principal | RF |
|---|---|---|---|
| CU-12 | Gestionar productos y presentaciones | Bodega / Admin sistema | RF-SL-01, 02 |
| CU-13 | Gestionar equivalencias kg → unidades | Bodega / Admin sistema | RF-SL-02, 03 |
| CU-14 | Registrar entradas y salidas de inventario | Bodega | RF-SL-04, 05, 16 |
| CU-15 | Ingresar pedidos facturados pendientes | Facturador | RF-SL-06, 17 |
| CU-16 | Generar picking (conversión + recorrido) | Bodega | RF-SL-03, 07 |
| CU-17 | Preparar pedido y cambiar estado | Bodega | RF-SL-08, 06 |
| CU-18 | Consultar y priorizar tablero de bodega | Bodega | RF-SL-09 |
| CU-19 | Cargar vehículo | Despacho | RF-SL-10, 11 |
| CU-20 | Registrar despacho y ruta | Despacho | RF-SL-12 |
| CU-21 | Consultar reportes de despacho | Gerencia / Despacho | RF-SL-13 |
| CU-22 | Consultar bitácora de operaciones | Gerencia / Admin sistema | RF-SL-16 |

---

## 3. Especificaciones (plantilla resumida)

### CU-03 Enviar solicitud de contacto

| Campo | Contenido |
|---|---|
| Actor | Visitante |
| Precondiciones | El sitio está publicado; el formulario es accesible |
| Flujo básico | 1) Abrir Contacto 2) Completar datos 3) Enviar 4) Sistema valida 5) Guarda y/o envía correo 6) Confirma al usuario |
| Flujos alternos | Datos inválidos → mensaje de error; fallo de correo → queda registro en BD si aplica |
| Postcondiciones | Solicitud registrada y/o notificada |
| RF | RF-SW-06, RNF-04 |

### CU-06 Administrar contenido institucional

| Campo | Contenido |
|---|---|
| Actor | Administrador de contenido |
| Precondiciones | Sesión autenticada con permiso CMS |
| Flujo básico | 1) Ingresar al panel 2) Seleccionar sección (historia, misión, etc.) 3) Editar textos/imágenes 4) Guardar/publicar 5) Verificar en sitio |
| Postcondiciones | Contenido actualizado en el sitio |
| RF | RF-SW-02, 07, 11 |

### CU-10 Cargar y consultar documentación interna

| Campo | Contenido |
|---|---|
| Actor | Administrador de contenido (carga); Usuario documentación (consulta) |
| Precondiciones | Usuario autenticado con rol permitido |
| Flujo básico | Carga: seleccionar producto → subir PDF → validar tipo/tamaño → asociar. Consulta: listar → descargar vía ruta protegida |
| Postcondiciones | Archivo disponible solo para roles autorizados |
| RF | RF-SW-10, RNF-05 |

### CU-15 Ingresar pedidos facturados pendientes

| Campo | Contenido |
|---|---|
| Actor | Facturador (o sistema vía Odoo/importación) |
| Precondiciones | Mecanismo A1 definido; usuario con permiso de sede/empresa |
| Flujo básico | 1) Crear/importar pedido 2) Validar productos y kg 3) Estado = pendiente 4) Queda listo para picking |
| Alternos | Archivo inválido; producto sin equivalencia → rechazo o marcado |
| Postcondiciones | Pedido pendiente visible para bodega de la sede |
| RF | RF-SL-06, 17 |

### CU-16 Generar picking

| Campo | Contenido |
|---|---|
| Actor | Bodega; incluye Motor de conversión |
| Precondiciones | Pedidos pendientes; equivalencias vigentes |
| Flujo básico | 1) Seleccionar pedidos 2) Convertir kg → unidades (RF-SL-03) 3) Generar líneas por cliente/factura 4) Guardar recorrido 5) Disponibilizar en tablero |
| Alternos | Cantidad no exacta según regla B4; sin existencia suficiente → aviso |
| Postcondiciones | Picking persistido; pedidos asociados |
| RF | RF-SL-03, 07, RNF-13 |

### CU-17 Preparar pedido y cambiar estado

| Campo | Contenido |
|---|---|
| Actor | Bodega |
| Precondiciones | Picking generado |
| Flujo básico | 1) Marcar preparación 2) Registrar usuario/hora 3) Avanzar estado según regla B8 |
| Postcondiciones | Estado actualizado; bitácora registrada |
| RF | RF-SL-08, 06, 16 |

### CU-18 Consultar y priorizar tablero

| Campo | Contenido |
|---|---|
| Actor | Bodega |
| Precondiciones | Dispositivo de bodega con acceso |
| Flujo básico | 1) Abrir tablero 2) Ver pedidos/prioridades del día 3) Ajustar prioridad 4) Actualización periódica |
| Postcondiciones | Prioridad del día actualizada |
| RF | RF-SL-09, RNF-14 |

### CU-19 / CU-20 Carga, despacho y ruta

| Campo | Contenido |
|---|---|
| Actor | Despacho |
| Precondiciones | Pedidos preparados; vehículo con capacidades definidas |
| Flujo básico | Asignar productos al vehículo → validar capacidad máx. → registrar despacho → crear/cerrar ruta del día |
| Alternos | Exceso de capacidad → rechazo/advertencia |
| Postcondiciones | Carga y despacho registrados; conteo de rutas del día actualizado |
| RF | RF-SL-10, 11, 12 |

### CU-12 / CU-13 / CU-14 Productos, equivalencias e inventario

| Campo | Contenido |
|---|---|
| Actor | Bodega / Admin |
| Precondiciones | Permisos de sede |
| Flujo básico | Mantener SKU, presentaciones, kg/unidad; registrar entradas (crea lote) y salidas FIFO; consultar existencias |
| Postcondiciones | Inventario y maestro coherentes |
| RF | RF-SL-01..05, 16 |

### CU-21 Consultar reportes

| Campo | Contenido |
|---|---|
| Actor | Gerencia / Despacho |
| Flujo básico | Filtrar por fecha/sede → ver kg y sacos despachados → exportar PDF/Excel |
| RF | RF-SL-13 |

### CU-04 / CU-05 / CU-11 Autenticación y usuarios

| Campo | Contenido |
|---|---|
| Actor | Usuarios internos / Administrador del sistema |
| Flujo básico | Login, logout, recuperación; ABM de usuarios con roles y restricción sede/empresa |
| RF | RF-SW-12, 13; RF-SL-14, 15; RNF-02, 03 |

---

## 4. Notas de alcance por empresa y sede

- Los casos de uso operativos (CU-14 a CU-20) aplican el filtro de **sede** y **empresa** (INCOVSA / Inquiserca) según RF-SL-14 y RF-SL-15.
- Gerencia (CU-21, CU-22) puede ver consolidado.
- La inclusión de Inquiserca en el sitio público (CU-01) depende de la decisión A4/C11.

---

## Control de versiones

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 0.1 | 14/09/2026 | Carlos Hugo Escobar Gómez | Catálogo y especificación inicial para Entregable 1 |
