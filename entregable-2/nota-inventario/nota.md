# Nota sobre la exclusión del control de inventario {-}

| Dato | Detalle |
|---|---|
| Para | Ing. Manuel Rojas, docente del curso Programación Web |
| De | Equipo del proyecto INCOVSA (coordinador: Héctor Jordin Adolfo García Coyoy) |
| Fecha | 14 de octubre de 2026 |
| Asunto | Exclusión del control de inventario del sistema de control logístico de bodega |

## Solicitud

Solicitamos su aprobación para excluir el control de inventario del alcance del sistema de control logístico de bodega. La exclusión la pidió INCOVSA, la empresa beneficiaria, porque el inventario de todas sus bodegas ya se lleva en su ERP, Odoo.

## Qué piden los lineamientos

Los lineamientos del proyecto incluyen el inventario en varios puntos:

- el alcance del Documento 1 lista «inventario» y «entradas y salidas»;
- el Entregable No. 2 pide evidenciar funcionamiento en «inventario»;
- la demostración final incluye «actualización de inventario» en el flujo completo;
- el Documento 4 (manual del sistema logístico) incluye consulta de inventario y registro de entradas y salidas, y el Documento 6 incluye una prueba de inventario.

## Qué decidió INCOVSA y por qué

En la reunión del 29 de septiembre de 2026 se presentó el prototipo del sistema al Ing. William Ambrossio, encargado del área de tecnología de INCOVSA. Entre los cambios que solicitó estuvo quitar el control de inventario, por estas razones:

- INCOVSA usa Odoo para casi toda su operación, **incluido el inventario de sus tres bodegas** (Quetzaltenango, Guatemala y Escuintla).
- Llevar el inventario también en este sistema duplicaría el registro y obligaría a conciliar dos fuentes que podrían no coincidir.
- Los pedidos llegan al sistema en el archivo que el facturador exporta de Odoo después de facturar. Lo que la empresa necesita resolver es lo que pasa **después** de la facturación: la conversión de kilogramos a unidades, el picking, la preparación, la carga y el despacho.

El cambio está registrado en las notas de esa reunión y en la especificación del proyecto (regla de negocio RN-40: «El sistema no lleva control de inventario: ni existencias, ni entradas, ni salidas. Eso lo hace Odoo»).

## Qué cubre el sistema

El sistema conserva todas las demás funciones logísticas de los lineamientos:

- productos con su Peso de Conversión (presentaciones y equivalencias) y la conversión de kilogramos a unidades;
- carga de los pedidos facturados desde el archivo de Odoo;
- armado de los envíos por camión o para que el cliente recoja en bodega, con control de peso;
- generación del picking, tablero de preparación en tiempo real, cambios de estado y despacho;
- registro de las rutas realizadas, reportes y bitácora;
- usuarios, permisos por usuario y sedes.

Con la exclusión, el flujo de la demostración final quedaría así: pedido facturado → conversión de kg a unidades → generación del picking → preparación → carga → despacho → actualización de estado → reporte.

## Cómo se documenta

- El Documento 1 indicará el inventario en «Fuera del alcance», con el motivo.
- El Documento 2 explica la decisión en la sección «Lógica de inventario».
- Los manuales y el plan de pruebas no incluirán funciones de inventario, para no presentar como implementado algo que no existe.

Quedamos atentos a su respuesta.

Héctor Jordin Adolfo García Coyoy

Coordinador del equipo
