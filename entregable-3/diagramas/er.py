"""ER compacto regenerado desde Prisma: claves y relaciones; todos los atributos en el diccionario."""
from pathlib import Path
from modelo import MODELO
from uml import Canvas

SALIDA=Path(__file__).resolve().parents[1]/'figuras'
GRUPOS=[
 ('figura-9-er-acceso','Acceso: identidad y permisos',['usuario','permiso','usuario_permiso','sede','usuario_sede']),
 ('figura-13-er-sesiones','Acceso: credenciales y auditoría',['usuario','cuenta','sesion','verificacion','bitacora']),
 ('figura-10-er-picking','Picking: facturación y envío',['sede','opcion_envio','pedido_facturado','detalle_pedido_facturado','envio']),
 ('figura-14-er-preparacion','Picking: preparación y entrega',['envio','linea_preparacion','estado_envio','historial_estado','entrega_ruta','camion']),
 ('figura-11-er-sitio','Sitio: catálogo y noticias',['industria','producto_industria','producto_sitio','noticia','imagen']),
 ('figura-15-er-contenido','Sitio: contenido y documentación',['configuracion_sitio','contenido_institucional','valor','producto_documentado','pais']),
 ('figura-16-er-contacto','Sitio: contacto y territorios',['sede','informacion_contacto','solicitud_contacto','departamento','municipio','pais']),
]

def generar(nombre,titulo,tablas):
    W,H=1760,1370
    cv=Canvas(W,H)
    cv.text(45,35,titulo,size=35,bold=True,anchor='la')
    cv.text(45,92,'Modelo físico de Prisma · PK / FK · ? permite NULL',size=26,anchor='la')
    cajas={}; bw=680
    # Conectores entre claves de tablas de esta vista; las demás FK conservan destino textual.
    posiciones={t:(100+(i%2)*870,170+(i//2)*370) for i,t in enumerate(tablas)}
    for t in tablas:
        x,y=posiciones[t]
        claves=[c for c in MODELO[t]['campos'] if c[3] or c[4]]
        for j,c in enumerate(claves):
            if not c[4] or c[4] not in posiciones:
                continue
            dx,dy=posiciones[c[4]]; yy=y+78+j*39; destino=dy+78
            if x==dx:
                carril=x-35-12*j
                pts=[(x,yy),(carril,yy),(carril,destino),(dx,destino)]
            else:
                izquierda=x<dx
                origen=x+bw if izquierda else x
                final=dx if izquierda else dx+bw
                carril=885+12*j
                pts=[(origen,yy),(carril,yy),(carril,destino),(final,destino)]
            cv.path(pts,w=1.8)
    for i,t in enumerate(tablas):
        x=100+(i%2)*870;y=170+(i//2)*370
        campos=[c for c in MODELO[t]['campos'] if c[3] or c[4]]
        h=70+max(1,len(campos))*39
        cajas[t]=(x,y,x+bw,y+h)
        cv.rect(x,y,x+bw,y+h,w=2,fill=(255,255,255))
        cv.rect(x,y,x+bw,y+52,w=2,fill=(235,238,233))
        cv.text(x+bw/2,y+26,t,size=29,bold=True,anchor='mm')
        for j,c in enumerate(campos):
            n,typ,lon,pk,fk,nu,desc=c
            marca=('PK ' if pk else '')+('FK ' if fk else '')
            texto=marca+n+(' ?' if nu else '')+(' → '+fk if fk else '')
            cv.text(x+18,y+78+j*39,texto,size=24,anchor='lm')
        if not campos:
            cv.text(x+18,y+78,'Sin claves foráneas',size=25,anchor='lm')
    cv.text(45,H-70,'Cada FK apunta a una fila del destino; del destino puede depender N filas, salvo FK única.',size=25,anchor='la')
    cv.text(45,H-30,'Campos y restricciones completos en el diccionario. Las flechas externas continúan en las otras figuras.',size=25,anchor='la')
    cv.save(str(SALIDA/(nombre+'.png')))

if __name__=='__main__':
    SALIDA.mkdir(exist_ok=True)
    for datos in GRUPOS:
        generar(*datos)
        print(datos[0]+'.png')
