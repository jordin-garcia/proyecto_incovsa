# 00. Proyecto

## Identificación

| Dato | Valor |
|---|---|
| Nombre del proyecto | Sitio web institucional autoadministrable y sistema de control logístico de bodega INCOVSA |
| Curso | Programación Web |
| Carrera | Ingeniería en Informática y Sistemas |
| Universidad | Universidad Rafael Landívar, Campus San Alberto Hurtado S.J. de Quetzaltenango, Facultad de Ingeniería |
| Docente | Ing. Manuel Rojas |
| Empresa beneficiaria | INCOVSA |
| Razón social a mostrar | **Industria del Cuero Covadonga S. A.** (con "del") |
| Empresa del grupo incluida | Inquiserca |
| Contraparte técnica | Ing. William Ambrossio, encargado del área de tecnología |
| Representante de gerencia (reunión 1) | Ing. Luis Orozco |

## La empresa

- Compra y venta de productos químicos en Guatemala, con más de 30 años en el mercado.
- Industrias que atiende: cuero, textil, cerería, hulera, medicamentos, limpieza, alimentación animal, tratamiento de agua y lavandería. El sitio usa estas 9 industrias; ver [05-sitio-web.md](05-sitio-web.md).
- Tiene dos mercados: industrial (con maquinaria) y artesanal (trabajo manual).
- Tiene presencia en todo el país con tres sedes y bodegas: **Quetzaltenango** (oficinas y bodega central), **Guatemala** y **Escuintla**.
- INCOVSA e Inquiserca **comparten productos y existencias**. En el sitio se presentan bajo una misma identidad visual.
- Usa el ERP **Odoo** para casi toda su operación. El picking se lleva en un Excel (`Picking II.xlsm`).
- Presencia web actual: solo una página básica en Google Sites que comparte con sus clientes: <https://sites.google.com/view/incovsa>. No tiene un sitio corporativo propio.

### Volumen de operación

| Sede | Envíos en ruta por día |
|---|---|
| Quetzaltenango | 20 aproximadamente |
| Guatemala | 10 a 15 |
| Escuintla | 8 a 10 |

### Sede piloto

El sistema se implementa y se prueba **solo con Quetzaltenango** (ubicaciones de Odoo que empiezan con `XE`). El modelo de datos y los permisos contemplan las tres sedes desde el inicio.

## Equipo

| Integrante | Rol principal en el proyecto |
|---|---|
| Héctor Jordin Adolfo García Coyoy | Coordinador, arquitecto e integrador, responsable de calidad (QA). Responsable del Documento 6 |
| Carlos Hugo Escobar Gómez | Requerimientos, documentación general y despliegue. Responsable de los Documentos 1 y 5 |
| Daniela Alexandra Marín Orozco | Frontend del sitio y del panel administrativo. Actas. Responsable del Documento 3 |
| Josué André Menéndez Juárez | Base de datos y frontend del sistema logístico. Responsable del Documento 4 |
| José Daniel Cifuentes Carrascosa | Backend del sistema logístico y documentación técnica. Responsable del Documento 2 |

> El apellido correcto es **Cifuentes**. Las notas de reunión originales decían "Fuentes" por error.
>
> La asignación de tareas por módulo del plan anterior quedó desactualizada con los cambios de alcance y debe rehacerse (P-40 en [19-pendientes.md](19-pendientes.md)).

## Entregables y fechas

| Fecha | Entregable | Valor |
|---|---|---|
| Lunes 21/09/2026 | **Entregable 1.** Definición, análisis y diseño inicial. Se presenta en clase | 10 puntos |
| Miércoles 14/10/2026 | **Entregable 2.** Avance funcional y documentación técnica. Se presenta en clase | 10 puntos |
| Miércoles 04/11/2026 | **Entregable 3.** Entrega final con el sistema desplegado. Se presenta en clase | 30 puntos |

Lo que exige cada entregable está en [17-lineamientos-del-curso.md](17-lineamientos-del-curso.md).

### Estado al 24/09/2026

- El Entregable 1 (Documento 1 v0.1, 79 páginas) está elaborado. En el repositorio no hay evidencia de su presentación ni de la retroalimentación del docente (P-31).
- **No existe código.** El proyecto base todavía no se ha creado.
- Las reglas y el alcance cambiaron el 23 y 24/09. Esta carpeta refleja esos cambios, y el **Documento 1 v0.2** (86 páginas), los diagramas y los prototipos ya están alineados con ella (`entregable-1/`).
