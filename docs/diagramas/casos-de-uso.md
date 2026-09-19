# Diagrama de casos de uso — vista Mermaid

Fuente editable draw.io: `casos-de-uso.drawio`  
Responsable: Carlos Hugo Escobar Gómez (tarea 1.12)

```mermaid
flowchart LR
  subgraph Actores
    V[Visitante]
    AC[Admin contenido]
    UD[Usuario documentación]
    F[Facturador]
    B[Bodega]
    D[Despacho]
    G[Gerencia]
    AS[Admin sistema]
  end

  subgraph SitioCMS[Sitio y CMS]
    CU01[CU-01 Navegar sitio]
    CU02[CU-02 Consultar catálogo]
    CU03[CU-03 Enviar contacto]
    CU04[CU-04 Login / logout]
    CU05[CU-05 Recuperar contraseña]
    CU06[CU-06 Admin contenido]
    CU07[CU-07 Industrias y catálogo]
    CU08[CU-08 Noticias]
    CU09[CU-09 Gestionar solicitudes]
    CU10[CU-10 Docs internas]
    CU11[CU-11 Usuarios y roles]
  end

  subgraph Logistica[Sistema logístico]
    CU12[CU-12 Productos y presentaciones]
    CU13[CU-13 Equivalencias]
    CU14[CU-14 Inventario]
    CU15[CU-15 Pedidos facturados]
    CU16[CU-16 Generar picking]
    CU17[CU-17 Preparar pedido]
    CU18[CU-18 Tablero]
    CU19[CU-19 Cargar vehículo]
    CU20[CU-20 Despacho y ruta]
    CU21[CU-21 Reportes]
    CU22[CU-22 Bitácora]
  end

  V --> CU01
  V --> CU02
  V --> CU03
  AC --> CU04
  AC --> CU06
  AC --> CU07
  AC --> CU08
  AC --> CU09
  AC --> CU10
  UD --> CU04
  UD --> CU10
  F --> CU04
  F --> CU15
  B --> CU04
  B --> CU12
  B --> CU13
  B --> CU14
  B --> CU16
  B --> CU17
  B --> CU18
  D --> CU04
  D --> CU19
  D --> CU20
  D --> CU21
  G --> CU04
  G --> CU21
  G --> CU22
  AS --> CU04
  AS --> CU11
  AS --> CU05
```

Exportar a PNG desde draw.io para el Anexo de diagramas del Documento 1.
