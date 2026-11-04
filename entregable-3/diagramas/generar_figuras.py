"""Regenera todas las figuras propias del Documento 2 desde la raíz del repositorio."""
import subprocess
import sys
from pathlib import Path
D = Path(__file__).resolve().parent
F = D.parent / 'figuras'
F.mkdir(exist_ok=True)
for n in (1, 2, 3):
    nombres = {1:'arquitectura',2:'componentes',3:'clases'}
    nombre=f'figura-{n}-{nombres[n]}'
    subprocess.run([sys.executable,str(D/(nombre+'.py')),str(F/(nombre+'.png'))],check=True)
for n, nombre in ((4,'picking'),(5,'conversion'),(6,'preparacion'),(7,'carga-despacho'),(8,'cms')):
    subprocess.run([sys.executable,str(D/'secuencia.py'),str(n),str(F/f'figura-{n}-secuencia-{nombre}.png')],check=True)
for nombre in ('modelo.py','er.py','despliegue.py'):
    subprocess.run([sys.executable,str(D/nombre)],check=True)
