# Introducción {-}

Este documento es el **plan y las evidencias de pruebas** del sitio web institucional autoadministrable y del sistema de control logístico de bodega (picking) de INCOVSA (Industria del Cuero Covadonga, S. A.). Sigue las 13 secciones del Documento 6 de los lineamientos del curso: explica qué tipos de pruebas se hicieron, presenta los casos de prueba con su resultado obtenido y registra los principales errores encontrados y cómo se corrigieron.

Como piden los lineamientos, no basta con decir que el sistema se probó. Cada resultado de este documento sale de una ejecución real: las pruebas automatizadas que corren en GitHub Actions en cada cambio, las pruebas de extremo a extremo con Playwright, la matriz de navegadores y tamaños de pantalla, el escaneo de seguridad con OWASP ZAP y las auditorías del coordinador. El **Anexo F** reúne todos los casos de prueba, y el **Anexo G**, las evidencias: los enlaces a las ejecuciones, las salidas resumidas y las capturas.

El documento describe el sistema tal como está en la rama `develop` del repositorio el 03/11/2026, antes del primer despliegue a producción. Lo que dependa de producción o de la capacitación al personal de INCOVSA (la prueba del CMS por una persona de la empresa, sección 12) se agrega en la versión 1.1 del 12/11/2026.

Las reglas y los requisitos que se citan (RN-xx, RF-SW-xx, RF-SL-xx y RNF-xx) son los de la especificación del proyecto (carpeta `specs/` del repositorio), descrita en el Documento 1 y en el Documento 2.
