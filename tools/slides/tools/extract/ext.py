import re, sys, xml.etree.ElementTree as ET
NS={'svg':'http://www.w3.org/2000/svg','xlink':'http://www.w3.org/1999/xlink'}
S='{http://www.w3.org/2000/svg}'; XL='{http://www.w3.org/1999/xlink}href'
def mat(t):
    if not t: return (1,0,0,1,0,0)
    m=re.match(r'matrix\(([^)]*)\)',t)
    if m: return tuple(float(x) for x in m.group(1).replace(',',' ').split())
    m=re.match(r'translate\(([^)]*)\)',t)
    if m:
        v=[float(x) for x in m.group(1).replace(',',' ').split()]; return (1,0,0,1,v[0],v[1] if len(v)>1 else 0)
    m=re.match(r'scale\(([^)]*)\)',t)
    if m:
        v=[float(x) for x in m.group(1).replace(',',' ').split()]; return (v[0],0,0,v[-1],0,0)
    raise Exception('tf '+t)
def mul(a,b): # a*b : apply b then a
    A,B,C,D,E,F=a; a2,b2,c2,d2,e2,f2=b
    return (A*a2+C*b2, B*a2+D*b2, A*c2+C*d2, B*c2+D*d2, A*e2+C*f2+E, B*e2+D*f2+F)
def ap(m,x,y): return (m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5])
def tpath(d,m):
    toks=re.findall(r'[MLCZmlcz]|-?[\d.]+(?:e-?\d+)?',d)
    out=[];pts=[];i=0;cmd=None
    while i<len(toks):
        t=toks[i]
        if t in 'MLCZ': cmd=t; out.append(t); i+=1; continue
        x,y=float(toks[i]),float(toks[i+1]); i+=2
        X,Y=ap(m,x,y); pts.append((X,Y)); out.append('%.2f %.2f'%(X,Y))
    return ' '.join(out),pts
class Ctx: pass
def run(path, region, minfrac=0.0):
    tree=ET.parse(path); root=tree.getroot()
    ids={e.get('id'):e for e in root.iter() if e.get('id')}
    res=[]
    def walk(e,m,fill,depth,masked):
        tag=e.tag.replace(S,'')
        if tag in('defs','mask','clipPath','filter','linearGradient','radialGradient','pattern'): return
        m2=mul(m,mat(e.get('transform')))
        f=e.get('fill',fill)
        if e.get('fill-opacity') and e.get('fill')!='none': f_op=e.get('fill-opacity')
        msk=masked or bool(e.get('mask'))
        if tag=='use':
            ref=ids.get(e.get(XL)[1:])
            x=float(e.get('x',0)); y=float(e.get('y',0))
            m3=mul(m2,(1,0,0,1,x,y))
            if ref is not None:
                for c in (list(ref) if ref.tag.replace(S,'') in('symbol','g') else [ref]): walk(c,m3,f,depth+1,msk)
            return
        if tag=='path':
            d,pts=tpath(e.get('d'),m2)
            if not pts: return
            xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
            res.append(dict(d=d,fill=f,bbox=(min(xs),min(ys),max(xs),max(ys)),attrs={k:v for k,v in e.attrib.items() if k not in('d','transform')},masked=msk,m=m2))
            return
        if tag=='rect':
            x,y,w,h=[float(e.get(k,0)) for k in('x','y','width','height')]
            d,pts=tpath(f'M {x} {y} L {x+w} {y} L {x+w} {y+h} L {x} {y+h} Z',m2)
            res.append(dict(d=d,fill=f,bbox=(min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)),attrs={k:v for k,v in e.attrib.items() if k not in('x','y','width','height','transform')},masked=msk,m=m2)); return
        for c in e: walk(c,m2,f,depth+1,msk)
    walk(root,(1,0,0,1,0,0),'black',0,False)
    return res,ids
if __name__=='__main__':
    f=sys.argv[1]; r=[float(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else [0,0,4096,3072]
    res,ids=run(f,r)
    for i,p in enumerate(res):
        b=p['bbox']
        inside=b[0]>=r[0]-2 and b[1]>=r[1]-2 and b[2]<=r[2]+2 and b[3]<=r[3]+2
        if not inside: continue
        print(i,'fill=',p['fill'],'bbox=',tuple(round(v) for v in b),'masked' if p['masked'] else '','len',len(p['d']), {k:v for k,v in p['attrs'].items() if k!='fill'})

def fmt(m): return 'matrix(%s)'%(','.join('%.4f'%v for v in m))
def emit(f, idx, out, pad=0, origin=None, scale=1.0):
    res,ids=run(f,None)
    sel=[res[i] for i in idx]
    bx=[min(p['bbox'][0] for p in sel),min(p['bbox'][1] for p in sel),max(p['bbox'][2] for p in sel),max(p['bbox'][3] for p in sel)]
    # stroke pad
    ox,oy=(bx[0]-pad,bx[1]-pad) if origin is None else origin
    W=(bx[2]-bx[0]+2*pad); H=(bx[3]-bx[1]+2*pad)
    T=(scale,0,0,scale,-ox*scale,-oy*scale)
    defs=[]; body=[]
    for p in sel:
        d,_=tpath(p['d'],T)
        a=dict(p['attrs']); fill=p['fill']
        if fill and fill.startswith('url(#'):
            gid=fill[5:-1]; g=ids[gid]
            g2=ET.fromstring(ET.tostring(g))
            gt=mat(g2.get('gradientTransform')) 
            g2.set('gradientTransform',fmt(mul(T,gt)))
            defs.append(ET.tostring(g2).decode().replace('ns0:','').replace(':ns0',''))
        a['fill']=fill
        if 'stroke-width' in a: a['stroke-width']='%.2f'%(float(a['stroke-width'])*scale)
        body.append('<path d="%s" %s/>'%(d,' '.join('%s="%s"'%(k,v) for k,v in a.items())))
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.1f %.1f"><defs>%s</defs>%s</svg>'%(W*scale,H*scale,''.join(defs),''.join(body))
    open(out,'w').write(svg); return bx
