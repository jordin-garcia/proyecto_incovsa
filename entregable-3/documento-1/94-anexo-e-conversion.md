# Anexo E. Reglas y casos de conversión {-}

La regla vigente es RN-01, estado Modificado, copiada de `specs/12-reglas-de-negocio.md`.

Conversión. `unidades = parte entera (cantidad_kg ÷ Peso de Conversión)` y `resto_kg = cantidad_kg − unidades × Peso de Conversión`. Se muestra como "N unidades + R kg".

El bloque siguiente es el que `specs/12` escribe bajo el título Conversión. Lleva paréntesis en el producto del resto. No es un caso nuevo.

```
unidades = parte entera (cantidad_kg ÷ Peso de Conversión)
resto_kg = cantidad_kg − (unidades × Peso de Conversión)
```

La tabla siguiente copia los 15 casos que la empresa validó. No se agregan filas ni se cambian los valores.

Tabla: Quince casos de conversión validados por INCOVSA {#tab:anexo-casos}

| # | Código | Cantidad | Peso de Conversión | Unidades esperadas |
|---|---|---|---|---|
| 1 | SULFATO DE SODIO-USA-SAC/0025KG-7896 | 25 | 25 | 1 |
| 2 | SULFATO DE SODIO-USA-SAC/0025KG-2318 | 25 | 25 | 1 |
| 3 | HIDROSULFITO DE SODIO-IND-TON/0050KG-1104 | 50 | 50 | 1 |
| 4 | METANOL-GUA-TON/0055GL-9047 | 55 | 55 | 1 |
| 5 | NEGRO SULFUROSO HIGH QUALITY-CHI-SAC/0025KG-0163 | 50 | 25 | 2 |
| 6 | NEGRO SULFUROSO-CHI-SAC/0025KG-4346 | 50 | 25 | 2 |
| 7 | SULFURO DE SODIO-TUR-SAC/0025KG-7305 | 50 | 25 | 2 |
| 8 | SULFATO DE ALUMINIO TUR-SAC/0025KG-9232 | 50 | 25 | 2 |
| 9 | SODA ASH-TUR-SAC/0025KG-5275 | 50 | 25 | 2 |
| 10 | SODA CAUSTICA-MEX-SAC/0025KG-0249 | 75 | 25 | 3 |
| 11 | INCO-FITEX-CHI-GAR/0030KG-5672T | 90 | 30 | 3 |
| 12 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 500 | 25 | 20 |
| 13 | SULFURO DE SODIO-MEX-SAC/0025KG-1107 | 500 | 25 | 20 |
| 14 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 800 | 25 | 32 |
| 15 | SODA CAUSTICA-CHI-SAC/0025KG-0150 | 1,000 | 25 | 40 |
