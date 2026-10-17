---
id: CE-07
titulo: Respaldos automáticos y prueba de restauración
persona: carlos
responsable: Carlos Hugo Escobar
hito: E3
prioridad: P1
estado: pendiente
depende_de: [CE-05]
programada: 2026-10-24
requisitos: [RNF-09]
pantallas: []
---

# CE-07 · Respaldos automáticos y prueba de restauración

**Responsable:** Carlos Hugo Escobar · **Hito:** E3 · **Prioridad:** P1 · **Programada:** sáb 24/10 · **Depende de:** CE-05

## Objetivo
Los respaldos diarios de PostgreSQL al bucket privado de Cloudflare R2, con su retención, y el procedimiento de restauración probado (RNF-09; specs/16, decisión 34; Documento 5, apartados 14 y 15).

## Contexto que debes leer
- `specs/16` §"Respaldos" y decisión 34; `specs/15`: RNF-09
- `## Resultado` de CE-05
- Context7: `pg_dump` y `pg_restore` de PostgreSQL 18, `rclone` con R2

## Qué hacer
1. `scripts/respaldo.sh`: `pg_dump` en formato personalizado dentro del contenedor de PostgreSQL, sube el archivo a R2 con `rclone` (credencial limitada a ese bucket) y borra los que sobran: conserva **7 diarios y 4 semanales**. Registra el resultado en el registro del sistema.
2. La línea de `cron` del VPS (cada noche) y cómo instalarla, para el Documento 5.
3. `scripts/restaurar.sh`: descarga un respaldo elegido y lo restaura en una base nueva; nunca sobrescribe la base de producción sin una confirmación escrita.
4. **Prueba de restauración** automatizada en GitHub Actions (`.github/workflows/produccion-respaldo.yml`, manual y semanal): levanta PostgreSQL 18, carga la semilla de demostración y datos de prueba, respalda (a un destino local de `rclone` mientras no exista la cuenta de R2, P-94), restaura en otra base y compara la cantidad de filas de cada tabla.
5. Con el VPS listo (CE-08), repetir la prueba contra R2 y dejar la evidencia para el Documento 5 (al menos una restauración documentada).

## Archivos que creas o modificas
- `scripts/respaldo.sh`, `scripts/restaurar.sh` (crear)
- `.github/workflows/produccion-respaldo.yml` (crear; excepción de archivos protegidos para Carlos)

## Criterios de aceptación
1. **RNF-09:** el respaldo se genera y se restaura en una base nueva con la misma cantidad de filas en cada tabla.
2. La retención deja 7 diarios y 4 semanales.
3. Ningún secreto queda en los scripts ni en los registros.
4. La restauración nunca toca la base de producción sin confirmación.

## Verificación
```
gh workflow run produccion-respaldo.yml
gh run watch
```

## Fuera de alcance
- Las imágenes: ya están en R2 (specs/16). Los documentos técnicos están en el Drive de INCOVSA.
