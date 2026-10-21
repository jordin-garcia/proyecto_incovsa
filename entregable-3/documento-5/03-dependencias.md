# Dependencias

Desde la raíz del repositorio, instale exactamente lo que fija `package-lock.json`. No use `npm install` para preparar el equipo. `npm ci` no reescribe el archivo de bloqueo.

```
npm ci
```

Ese comando también ejecuta `prisma generate`, porque `postinstall` está definido así en `package.json`. En su computadora, `prepare` instala los ganchos de husky. Dentro de la imagen de Docker, la compilación usa `HUSKY=0` porque ahí no hay repositorio Git. Usted no tiene que exportar esa variable en desarrollo.

Instale los navegadores de Playwright. El comando es el de `plan/instalacion.md`.

```
npx playwright install --with-deps chromium firefox webkit
```

SheetJS 0.20.3 no se instala desde el registro de npm. `package.json` lo declara como `file:vendor/xlsx-0.20.3.tgz`, y `npm ci` lo toma de esa carpeta. No ejecute `npm install xlsx`.

Si más adelante cambia `package-lock.json`, vuelva a ejecutar `npm ci`. Si esa instalación queda incompleta, borre `node_modules` y ejecute `npm ci` otra vez.
