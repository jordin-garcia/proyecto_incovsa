# 20. Prototipo aprobado y cambios de la reunión 4

## El prototipo

| Dato | Valor |
|---|---|
| Nombre | Prototipo de simulación de INCOVSA |
| Código fuente | `entregable-1/prototipos/simulacion/src/` (`base.js`, `sitio.js`, `panel.js`, `picking.js`, `tablero.js`, `inicio.js`, `estilos.css`, `plantilla.html`) |
| Cómo se arma | `python construir.py` desde `entregable-1/prototipos/simulacion/`. Genera `entregable-1/prototipos/prototipo-simulacion-incovsa.html`, que se abre con doble clic |
| Datos | Toma productos, Peso de Conversión, clientes, sectores, imágenes y documentos de `docs_incovsa/`. Desde el 11/10/2026 los clientes llevan sus **nombres reales**, porque la validación de clientes del archivo de Odoo los necesita y el HTML armado no se sube al repositorio. Los usuarios siguen anonimizados. Los departamentos y municipios de Guatemala salen del INE (Censo 2018), en `simulacion/datos/guatemala.json` |
| Repositorio | Se sube el código fuente. El HTML armado **no se sube**, porque contiene datos reales de la empresa (RNF-10) |
| Presentado | 29/09/2026, reunión 4, al Ing. William Ambrossio |
| Aprobación | El 09/10/2026 el coordinador confirmó que el **design system** y la **mayoría de las funcionalidades** están aprobados por el Ing. William Ambrossio y por el Ing. Manuel Rojas, **salvo los cambios de la reunión 4** |

## Cómo se usa para desarrollar

1. La aplicación real se construye **a partir de este prototipo, de los cambios de la reunión 4 y de las respuestas del 11/10/2026**.
2. Si el prototipo y esta carpeta dicen cosas distintas, **vale esta carpeta** (regla 1 de [README.md](README.md)). Los cambios de la reunión 4 ya están escritos en los archivos de cada módulo.
3. Lo que esta carpeta no detalla (distribución de la pantalla, textos de ayuda, orden de los elementos, interacción) se toma del prototipo.
4. Mientras un cambio esté pendiente (P-xx), no se implementa como decidido. Donde el cambio está pendiente pero el prototipo ya resuelve algo, el archivo del módulo dice qué parte del prototipo se conserva.

### Lo que el prototipo tiene y la aplicación real no

| Elemento del prototipo | Motivo |
|---|---|
| Botón "Demostración" (entrar como, abrir pantallas, reiniciar datos, alternar P-26) | Herramienta de presentación |
| Cuentas de ejemplo y contraseña `demo` en el inicio de sesión | Herramienta de presentación |
| Notas amarillas de pendientes (P-xx) | Herramienta de validación |
| Leyenda "Prototipo para validación" del pie y nota "Simulación" del tablero | Herramienta de validación |
| Estado guardado en el navegador (`localStorage`) y sincronizado entre pestañas (`BroadcastChannel`) | Simula la base de datos y el tiempo real. La aplicación real usa PostgreSQL y avisos por SSE ([16](16-arquitectura-y-tecnologia.md)) |
| Nombres "Usuario de ejemplo NN" | Anonimización. La aplicación real usa los datos que cargue la empresa |
| Módulo de Inventario, validación de existencias, devoluciones, columnas de existencia | Eliminados el 29/09 ([09-picking-inventario.md](09-picking-inventario.md)) |
| Captura manual de pedidos en Facturación y un solo pedido con un camión por pantalla | Reemplazados por la carga del archivo de Odoo y el armado de envíos arrastrando pedidos (29/09 y 11/10, [06](06-picking-facturacion.md)) |
| Columna y campo "Unidad medida" de los productos | No se usa (11/10) |
| Nombre "Peso2" | Se llama "Peso de Conversión" (11/10) |
| Recuperación de contraseña por correo en el sitio | La contraseña la restablecen Gerencia o Soporte (11/10) |
| Escuintla en el sitio público (presencia, contacto y formulario) | Solo se muestran Quetzaltenango y Guatemala (11/10) |
| Roles fijos por sistema en los formularios de usuario | Rol de texto libre, sedes y permisos por casillas (29/09 y 11/10) |

## Design system aprobado

Definido en `entregable-1/prototipos/simulacion/src/estilos.css`. La aplicación real lo reproduce con Tailwind CSS y shadcn/ui ([16-arquitectura-y-tecnologia.md](16-arquitectura-y-tecnologia.md)).

### Tipografía

| Uso | Fuente |
|---|---|
| Títulos | Poppins (500 a 800) |
| Interfaz y texto | Figtree (400 a 800) |
| Nombres de producto, cantidades y cifras | JetBrains Mono (400 a 700), con cifras tabulares |

Se cargan desde Google Fonts. La tipografía oficial de la empresa sigue pendiente (P-18).

### Colores

| Grupo | Tokens |
|---|---|
| Verdes | `--v950` #031F0B, `--v900` #062D12, `--v850` #083817, `--v800` #0A461F, `--v700` #0D5A24, `--v600` #126C2A (principal), `--v500` #1B8238, `--v400` #37A052, `--v300` #7CC48E, `--v200` #BFE3C8, `--v100` #E3F2E7, `--v50` #F1F8F2 |
| Lima (acento del logotipo) | `--lima` #64932A, `--lima-v` #8DC63F, `--lima-b` #B5E07A |
| Grises | `--g900` #1C1D1C, `--g800` #2B2C2B, `--g700` #3C3C3C, `--g600` #545554, `--g500` #727372, `--g400` #9A9B99, `--g300` #C3C5C1, `--g200` #DCDED9, `--g150` #E7E9E4, `--g100` #EFF1EC, `--g50` #F7F8F5 |
| Estados | Ámbar `--ambar` #9A5B00 / `--ambar-f` #FFF1D6; rojo `--rojo` #B42318 / `--rojo-f` #FDECEA; azul `--azul` #0A6780 / `--azul-f` #E1F2F6 |

Los colores se tomaron de los dos logotipos recibidos. Los códigos exactos de la empresa siguen pendientes (P-18).

### Formas y componentes

- Radios: 8, 12, 18 y 26 px. Sombras suaves en tono verde oscuro.
- Íconos de trazo, dibujados en SVG dentro del código.
- Componentes: tarjetas, chips de estado (En Preparación, Despachado, En Ruta, Entregado), avisos verde, ámbar, rojo y azul, mensajes emergentes, ventanas modales de confirmación, tablas con filas que se arrastran, botones segmentados, búsqueda con lista desplegable, medidores y barra lateral de navegación.
- Tablero de Bodega: diseño "Pickit Visual" (pedido en curso con anillo de avance, líneas con unidades grandes, silueta del camión con la ocupación por peso y cola de pedidos). Las siluetas de los camiones también están en `entregable-1/prototipos/pickit-visual/`.
- El tablero tenía dos temas: "TV" (verdes oscuros) y "Tableta" (claro). Desde el 29/09 son **modo claro** (el de "Tableta") y **modo oscuro** (negros y grises) ([07-picking-bodega.md](07-picking-bodega.md)).

## Registro de cambios de la reunión 4

Cada cambio que pidió el Ing. William el 29/09/2026, con su estado después de las respuestas del 11/10/2026. "Definido" significa que se puede implementar; "Pendiente" significa que falta resolver lo que indica el P-xx antes de implementarlo.

### Sitio público

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-01 | Inicio: quitar la sección "Catálogo informativo", y nada más | Definido | [05](05-sitio-web.md) |
| CAM-02 | Inicio: misión y visión como las imágenes de la empresa, centradas, una debajo de la otra | Definido | [05](05-sitio-web.md) |
| CAM-03 | Inicio: todas las imágenes con animación de aparición y desaparición al desplazarse | Definido | [05](05-sitio-web.md) |
| CAM-04 | Inicio: Quetzaltenango y Guatemala con sus datos y su mapa de Google Maps insertado; Escuintla no se muestra en el sitio | Definido (textos nuevos sin el número de sedes) | [05](05-sitio-web.md) |
| CAM-05 | Inicio: debe ser informativa | Definido (solo se quita "Catálogo informativo") | [05](05-sitio-web.md) |
| CAM-06 | Pie de página solo en Inicio, Quiénes somos, Noticias y Contacto, con el logotipo de la cabecera; Industrias, Productos y detalle de producto sin pie | Definido | [05](05-sitio-web.md) |
| CAM-07 | El logotipo "Transformamos INCOVSA" es de uso interno y no va en el sitio público | Definido | [05](05-sitio-web.md) |
| CAM-08 | Quiénes somos: banner con transición entre los logotipos de INCOVSA e Inquiserca | Definido (falta recibir el logotipo, P-69) | [05](05-sitio-web.md) |
| CAM-09 | Quiénes somos: misión arriba y visión abajo, con animación al desplazarse, a media pantalla | Definido (centradas) | [05](05-sitio-web.md) |
| CAM-10 | Industrias: sin imágenes de productos; descripción, una imagen por industria y productos en texto | Definido | [05](05-sitio-web.md) |
| CAM-11 | Catálogo: búsqueda aprobada; "Productos Recomendados" en el detalle, siempre visible | Definido | [05](05-sitio-web.md) |
| CAM-12 | Noticias con fotografía, título y texto | Definido | [05](05-sitio-web.md) |
| CAM-13 | Contacto: teléfono con código de área por país | Definido | [05](05-sitio-web.md) |
| CAM-14 | Contacto: validación de la estructura del correo y del teléfono | Definido | [05](05-sitio-web.md) |
| CAM-15 | Contacto: listas opcionales País, Departamento y Municipio (estos dos solo de Guatemala, y solo si el país es Guatemala); sede obligatoria con solo Quetzaltenango y Guatemala | Definido | [05](05-sitio-web.md) |
| CAM-16 | Responsivo en teléfono y escritorio | Definido (ya estaba) | [05](05-sitio-web.md) |
| CAM-34 | Detalle de producto: imagen, nombre, descripción, presentación, países de origen e industrias; sin manejo, almacenamiento, humedad, tipo ni restricciones | Definido (sin documentos técnicos) | [05](05-sitio-web.md) |

### Panel del sitio

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-17 | Imágenes de misión y visión, imagen opcional para historia y valores, y logotipo de Inquiserca | Definido | [05](05-sitio-web.md) |
| CAM-18 | Imagen por industria | Definido | [05](05-sitio-web.md) |
| CAM-19 | Catálogo: producto con nombre, descripción, presentación, países de origen (texto) e imagen subida o arrastrada; eliminar producto | Definido | [05](05-sitio-web.md) |
| CAM-20 | Noticias: crear con fotografía, título y texto | Definido | [05](05-sitio-web.md) |
| CAM-21 | Solicitudes: división por motivo (solicitud, queja, reclamo) | Definido | [05](05-sitio-web.md) |
| CAM-22 | Solicitudes: responsable (usuario del sitio), un comentario y botones Asignado, En proceso y Solucionado, sin estado inicial ni restricción | Definido | [05](05-sitio-web.md) |
| CAM-23 | Documentación interna: producto escrito (uno), país de una lista y lote con letras y números, obligatorio solo en COA | Definido | [05](05-sitio-web.md) |
| CAM-24 | Documentación interna: buscar por lote, nombre y país de origen | Definido | [05](05-sitio-web.md) |
| CAM-35 | Información de contacto: solo Quetzaltenango y Guatemala, con su mapa | Definido | [05](05-sitio-web.md) |

### Usuarios y permisos

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-25 | Permisos por usuario, por módulo y por acción, con casillas; dos administraciones de usuarios y dos inicios de sesión | Definido | [03](03-roles-y-accesos.md) |
| CAM-26 | Rol de texto libre; únicos roles predeterminados Gerencia y Soporte; sedes por usuario con casillas; pilotos = rol "Piloto" | Definido | [03](03-roles-y-accesos.md) |
| CAM-27 | Eliminar usuarios | Definido (eliminación lógica, 12/10) | [03](03-roles-y-accesos.md) |
| CAM-28 | Bitácora con inicios de sesión, consultable en la pestaña "Bitácora" de Reportes | Definido | [12](12-reglas-de-negocio.md) |
| CAM-36 | La contraseña la restablecen Gerencia o Soporte, a solicitud; sin recuperación por correo | Definido | [03](03-roles-y-accesos.md) |

### Sistema de picking

| Id | Cambio | Estado | Dónde |
|---|---|---|---|
| CAM-29 | Sin control de inventario: se quitan el módulo de Inventario, la validación de existencias, las columnas de existencia y las devoluciones | Definido (docente: P-58) | [09](09-picking-inventario.md) |
| CAM-30 | Facturación: carga del .xlsx de Odoo al tablero de pedidos facturados (guardado en la base); opciones de envío a la derecha; arrastrar pedidos facturados de varios clientes a camiones o a "Cliente recoge en bodega" y de regreso; control de peso; botones por opción; cada envío crea un pedido con correlativo | Definido | [06](06-picking-facturacion.md) |
| CAM-31 | Tablero: "Modo claro" y "Modo oscuro" en lugar de "TV" y "Tableta" | Definido | [07](07-picking-bodega.md) |
| CAM-32 | Reportes: filtros diario, semanal (lunes a domingo), mensual, anual y por rango, también en "Rutas realizadas" | Definido | [10](10-picking-reportes.md) |
| CAM-33 | Menú lateral izquierdo reducido a íconos | Definido en el picking y en el panel del sitio | [04](04-requerimientos-funcionales.md) |
| CAM-37 | Producto del picking con solo nombre y Peso de Conversión; "Peso2" pasa a llamarse "Peso de Conversión"; "Unidad de Medida" no se usa | Definido (nombre en formato de Odoo; sin SKU) | [11](11-picking-configuracion.md) |
| CAM-38 | Bodega sin columna SKU; Ruta con una fila por cliente aunque tenga varios pedidos facturados | Definido | [07](07-picking-bodega.md), [08](08-picking-ruta.md) |
| CAM-39 | Textos del sitio sin el número de sedes y bodegas, sin Escuintla, sin inventario y sin roles fijos | Definido | [05](05-sitio-web.md) |
