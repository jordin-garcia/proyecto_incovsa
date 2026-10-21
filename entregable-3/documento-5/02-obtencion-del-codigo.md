# Obtención del código

Clone el repositorio privado con GitHub CLI. La rama por defecto es `develop`. El comando lo deja en esa rama.

```
gh repo clone jordin-garcia/proyecto_incovsa
cd proyecto_incovsa
```

Compruebe el equipo desde la raíz del repositorio. El script no instala nada. Si falta una herramienta obligatoria, termina con código 1 y escribe qué instalar. Si todo está, la última línea es `El equipo tiene todo lo necesario.`

```
node scripts/verificar-entorno.mjs
```

No descargue un ZIP para trabajar. El archivo de bloqueo y los ganchos de Git forman parte del clon.

Para producción, el VPS no compila el código. En `~/incovsa` bastan `docker-compose.yml`, `Caddyfile` y `.env`. El apartado Despliegue dice cuándo copiarlos. Hoy esa carpeta no existe en un servidor real.

TODO(CE-11): No clone hacia un VPS todavía. P-10 sigue sin servidor.
