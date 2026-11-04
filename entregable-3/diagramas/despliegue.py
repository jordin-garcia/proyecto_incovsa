"""Topología diseñada de CE-05 a CE-07; no acredita despliegue real."""
from pathlib import Path
from uml import Canvas
cv=Canvas(1900,1320)
cv.text(50,40,'Despliegue diseñado de INCOVSA',size=38,bold=True,anchor='la')

def caja(x,y,w,h,texto):
 cv.rect(x,y,x+w,y+h,w=2.4,radius=8,fill=(255,255,255));cv.text(x+w/2,y+h/2,texto,size=30,anchor='mm')
 return (x+w/2,y+h)
caja(60,130,480,180,'Navegador\nescritorio, tableta, teléfono, TV')
cv.rect(630,100,1840,1030,w=3)
cv.text(660,140,'VPS Ubuntu 24.04 LTS · Docker Compose',size=34,bold=True,anchor='la')
caja(700,230,480,160,'Caddy 2\n80/443 · HTTPS y X-Real-IP')
caja(700,490,480,200,'Next.js standalone · Node 24\nun proceso · usuario nextjs\npuerto interno 3000')
caja(1320,490,450,200,'PostgreSQL 18\nsin puerto publicado\nvolumen postgres-datos')
cv.arrow((540,220),(700,310));cv.text(560,270,'HTTPS',size=25,anchor='la')
cv.arrow((940,390),(940,490));cv.text(960,440,'HTTP interno / SSE sin búfer',size=25,anchor='la')
cv.arrow((1180,590),(1320,590));cv.text(1200,550,'Prisma',size=25,anchor='la')
caja(60,500,480,200,'GitHub Actions / GHCR\nmain → imagen SHA\nSSH con huella fija')
cv.arrow((540,640),(700,640));cv.text(545,690,'migrate deploy\ny reinicio',size=23,anchor='la')
caja(700,810,1070,150,'cron del VPS → pg_dump → rclone\n7 diarios + 4 semanales · bucket privado de R2')
cv.arrow((1540,690),(1540,810))
caja(50,1100,800,150,'Cloudflare R2\nimágenes públicas / respaldos privados')
caja(1000,1100,800,150,'Google Drive de INCOVSA\nFT, HS y COA por enlaces')
cv.path([(780,690),(650,690),(650,1040),(700,1100)])
cv.arrow((1540,960),(1540,1060));cv.arrow((1540,1060),(800,1100))
cv.dashed_path([(540,170),(600,170),(600,80),(1870,80),(1870,1175),(1800,1175)],open_head=True)
print(cv.save(str(Path(__file__).resolve().parents[1]/'figuras/figura-12-despliegue.png')))
