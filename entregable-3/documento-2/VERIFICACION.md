# Verificación de JC-08

Corte documental: `develop` en `d15a140`, 03/11/2026. No se modificaron código de la aplicación, esquema, migraciones, dependencias, pruebas existentes ni herramientas compartidas. La v0.4 permanece intacta.

| Comprobación | Resultado local |
|---|---|
| Entorno | Node 24.22.0, npm 11.19.1, GitHub JDaniC y PostgreSQL 18.6 disponibles |
| Dependencias | npm ci con lock existente; Prisma Client generado |
| Migraciones | Las tres migraciones aplicadas a una base nueva de esta tarea |
| Criterios documentales | 3/3 aprobados: 28 secciones y referencias; 32 tablas/240 columnas con tipos, precisión, PK/FK, nulos e índices contra Prisma y versiones contra lock; ejemplo real JC-07 |
| Pruebas negativas documentales | Alterar decimal por text o permitir NULL en una FK obligatoria provoca rechazo |
| npm run verificar | Formato, lint, tipos y 509 pruebas Vitest aprobados en 57 archivos; base de pruebas desechable |
| npm run build | Compilación standalone aprobada con Next.js 16.4.3 |
| Plan | Plan válido: 82 tareas |
| Armador exigido | Generación aprobada: 16 figuras y 56 tablas de contenido |
| Maquetación final | Carta, márgenes de 2.54 cm, cuerpo Arial 11 e interlineado 1.5; tablas y diagramas en orientación adecuada; 106 páginas |
| Índices | Tres campos TOC conservados; 105 entradas de títulos, 16 figuras y 56 tablas; resultados cotejados contra el PDF y estabilizados en tres pasadas |
| Inspección estructural | Sin referencias sin definir, marcadores de actualización pendientes ni bordes decorativos; 16 dibujos y 58 tablas contando portada/versiones |
| Revisión independiente | LISTO; se reforzó CA2 tras el hallazgo inicial de la revisión |

La fase roja se ejecutó primero sobre el contenido de la v0.4 copiado: fallaron los tres criterios por apartados incompletos, diccionario desactualizado y ausencia del ejemplo real. La versión final pasa las tres comprobaciones. La revisión visual detectó y corrigió el texto recortado del último participante del diagrama de conversión, los anchos del diccionario, los backticks literales en encabezados y la página de Referencias del índice.

Las páginas se renderizaron e inspeccionaron a tamaño nativo. Después de los ajustes se revisaron nuevamente las páginas cambiadas; la comparación de huellas confirmó las páginas sin cambios. Las imágenes de revisión y los registros completos son locales y no contienen cambios de la aplicación.

No se ejecuta la E2E completa local: JC-08 cambia solo documentación y aplica la decisión 90 de specs/16. La CI mantiene todos los controles configurados sin cambios ni omisiones. La revisión y las comprobaciones de GitHub corresponden al PR de esta tarea.

El DOCX, PDF y equipo.local.json quedan fuera de Git. José Daniel confirmó que hará personalmente la subida a Drive. Se preparó `entregable-3/para-subir-JC-08/` con solo el Word y el PDF finales; no se afirma una subida por el agente.
