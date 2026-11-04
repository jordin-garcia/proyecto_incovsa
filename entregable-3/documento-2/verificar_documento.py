"""Criterios de JC-08. Ejecutar desde la raíz: python .../verificar_documento.py."""
import json
import re
import unittest
from pathlib import Path

CARPETA = Path(__file__).resolve().parent
RAIZ = CARPETA.parents[1]


class DocumentoTecnico(unittest.TestCase):
    def texto(self):
        config = json.loads((CARPETA / "documento.json").read_text())
        return "\n".join((CARPETA / n).read_text() for n in config["secciones"])

    def test_01_JC08_28_secciones_completas_y_referencias_resueltas(self):
        """JC-08 CA1: 28 secciones, sin promesas heredadas ni figuras ausentes."""
        texto = self.texto()
        titulos = re.findall(r"^# (.+)$", texto, re.M)
        self.assertEqual(28, sum(not t.endswith("{-}") for t in titulos))
        self.assertNotRegex(texto.lower(), r"se completa|se completará|junto con el código|se define en el entregable")
        for imagen in re.findall(r"!\[[^\]]*\]\(([^)]+)\)", texto):
            self.assertTrue((CARPETA / imagen).is_file(), imagen)
        ids = set(re.findall(r"\{#((?:fig|tab):[\w-]+)\}", texto))
        for referencia in re.findall(r"\{\{((?:fig|tab):[\w-]+)\}\}", texto):
            self.assertIn(referencia, ids)
        for ruta in set(re.findall(r"`((?:src/|prisma/|scripts/|\.github/workflows/)[\w./-]+)`", texto)):
            self.assertTrue((RAIZ / ruta).exists(), ruta)

    def test_02_JC08_diccionario_contra_migraciones_y_versiones_contra_lock(self):
        """JC-08 CA2: el diccionario coincide con Prisma y las versiones directas con el lock."""
        texto = (CARPETA / "02b-diccionario-de-datos.md").read_text()
        self.comparar_diccionario(texto)
        alterado = texto.replace('| `capacidad_kg` | decimal | 12,3 |', '| `capacidad_kg` | text | — |', 1)
        with self.assertRaises(AssertionError):
            self.comparar_diccionario(alterado)
        alterado = texto.replace('| `sede_id` | integer | — |  | sede | No |', '| `sede_id` | integer | — |  | sede | Sí |', 1)
        with self.assertRaises(AssertionError):
            self.comparar_diccionario(alterado)
        paquete = json.loads((RAIZ / "package.json").read_text())
        lock = json.loads((RAIZ / "package-lock.json").read_text())
        dependencias = (CARPETA / "03-tecnologias-y-repositorio.md").read_text()
        for grupo in ("dependencies", "devDependencies"):
            for nombre in paquete[grupo]:
                version = lock["packages"]["node_modules/" + nombre]["version"]
                self.assertIn(f"| `{nombre}` | {version} |", dependencias, nombre)

    def comparar_diccionario(self, texto):
        # Lectura independiente del generador: coteja las filas publicadas con el esquema vigente.
        esquema = (RAIZ / "prisma/schema.prisma").read_text()
        modelos = dict(re.findall(r"^model (\w+) \{\n(.*?)^\}", esquema, re.M | re.S))
        tablas = {m: re.search(r'@@map\("([^"]+)"\)', cuerpo)[1] for m, cuerpo in modelos.items()}
        secciones = dict(re.findall(r"### Tabla (\w+)\n(.*?)(?=\n### Tabla |\n## |\\vertical|\Z)", texto, re.S))
        self.assertEqual(set(tablas.values()), set(secciones), "Tablas exactas de Prisma")
        tipos = {"String": "text", "Int": "integer", "BigInt": "bigint", "Boolean": "boolean", "Decimal": "decimal", "DateTime": "timestamp", "Json": "jsonb"}
        nativos = {"VarChar": "varchar", "Char": "char", "SmallInt": "smallint", "Decimal": "decimal", "Timestamptz": "timestamptz", "Date": "date", "Time": "time"}
        for modelo, cuerpo in modelos.items():
            tabla = tablas[modelo]
            pk = re.search(r"@@id\(\[([^]]+)\]", cuerpo)
            pk = set(pk[1].replace(" ", "").split(",")) if pk else set()
            relaciones = {}
            for linea in cuerpo.splitlines():
                if "@relation" in linea and "fields:" in linea:
                    destino = re.match(r"\s*\w+\s+(\w+)", linea)[1]
                    for campo in re.search(r"fields:\s*\[([^]]+)\]", linea)[1].split(","):
                        relaciones[campo.strip()] = tablas[destino]
            esperadas = {}
            for linea in cuerpo.splitlines():
                campo = re.match(r"\s+(\w+)\s+(\w+)(\?)?\s*(.*)", linea)
                if not campo or campo[2] not in tipos:
                    continue
                nombre, tipo, opcional, atributos = campo.groups()
                fisico = re.search(r'(?<!@)@map\("([^"]+)"\)', atributos)
                fisico = fisico[1] if fisico else nombre
                nativo = re.search(r"@db\.(\w+)(?:\(([^)]*)\))?", atributos)
                tipo_sql = nativos[nativo[1]] if nativo else tipos[tipo]
                precision = (nativo[2] or "—").replace(" ", "") if nativo else "—"
                esperadas[fisico] = [tipo_sql, precision, "Sí" if "@id" in atributos or nombre in pk else "", relaciones.get(nombre, ""), "Sí" if opcional else "No"]
                if "@unique" in atributos:
                    self.assertIn("@unique(" + fisico + ")", secciones[tabla])
            publicadas = {}
            for linea in secciones[tabla].splitlines():
                if linea.startswith("| `"):
                    celdas = [c.strip() for c in linea.strip("|").split("|")]
                    self.assertEqual(7, len(celdas), tabla + ": fila válida")
                    publicadas[celdas[0].strip("`")] = celdas[1:6]
            self.assertEqual(esperadas, publicadas, tabla + ": campos, tipos, precisión, PK/FK y nulabilidad")
            for restriccion in re.findall(r"^\s*(@@(?:id|unique|index)\(.+)$", cuerpo, re.M):
                self.assertIn("`" + restriccion.strip() + "`", secciones[tabla], tabla + ": restricciones e índices")

    def test_03_JC08_extension_con_ejemplo_real_y_pruebas_existentes(self):
        """JC-08 CA3: el ejemplo permite seguir una funcionalidad real de extremo a extremo."""
        texto = (CARPETA / "07-operacion-y-mantenimiento.md").read_text()
        for termino in ("JC-07", "src/modulos/reportes/exportacion.ts", "src/app/api/reportes/exportar/route.ts",
                        "pruebas-e2e/picking/reportes-exportacion.spec.ts", "exigirPermiso", "npm run verificar"):
            self.assertIn(termino, texto)
        servicio = (RAIZ / "src/modulos/reportes/exportacion.ts").read_text()
        for nombre in re.findall(r"export (?:async )?function (\w+)", servicio):
            self.assertIn(nombre, texto)


if __name__ == "__main__":
    unittest.main(verbosity=2)
