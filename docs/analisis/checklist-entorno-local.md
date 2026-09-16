# Checklist de entorno local (asistencia Semana 0 — tarea 0.11)

**Apoyo:** Carlos Hugo Escobar Gómez  
**Responsable de cada máquina:** cada integrante  
**Dependencia:** proyecto base (tarea 0.12, responsable Jordin)

Cuando exista el proyecto base en `develop`, cada integrante debe:

1. Instalar Node.js 22 LTS, Git y VS Code (extensiones Prisma, Tailwind, ESLint).
2. Instalar PostgreSQL 16 **o** usar Docker con el `docker-compose.yml` del repo.
3. Clonar el repositorio y crear archivo `.env` a partir de `.env.example`.
4. Ejecutar `npm install`.
5. Ejecutar `npx prisma migrate dev`.
6. Ejecutar `npm run dev` y abrir la URL local.
7. Confirmar en WhatsApp del equipo: “entorno OK en mi máquina”.

Si algo falla, reportar: sistema operativo, versión de Node (`node -v`), error exacto y si usan Docker o PostgreSQL local.
