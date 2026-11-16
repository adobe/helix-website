import re, json, sys, xml.etree.ElementTree as ET
import ext
S='{http://www.w3.org/2000/svg}'
def rgbhex(v):
    if not v or not v.startswith('rgb('): return v
    nums=[float(x.strip().rstrip('%')) for x in v[4:-1].split(',')]
    return '#%02x%02x%02x'%tuple(round(n*2.55) for n in nums)
def region(f, box, out=None, tol=3, exclude=(), include_masked=True, norm=None, keep=None, fillmode='orig'):
    res,ids=ext.run(f,None)
    sel=[]
    for i,p in enumerate(res):
        b=p['bbox']
        if keep is not None and i not in keep: continue
        if i in exclude: continue
        if not(b[0]>=box[0]-tol and b[1]>=box[1]-tol and b[2]<=box[2]+tol and b[3]<=box[3]+tol): continue
        if p['masked'] and not include_masked: continue
        sel.append((i,p))
    if not sel: return None
    bx=[min(p['bbox'][0] for _,p in sel),min(p['bbox'][1] for _,p in sel),max(p['bbox'][2] for _,p in sel),max(p['bbox'][3] for _,p in sel)]
    if norm: bx=norm
    W=bx[2]-bx[0]; H=bx[3]-bx[1]; sc=100.0/max(W,H)
    T=(sc,0,0,sc,-bx[0]*sc,-bx[1]*sc)
    defs=[];body=[]
    for i,p in sel:
        d,_=ext.tpath(p['d'],T)
        d=re.sub(r'(\d+\.\d)\d',r'\1',d)  # 1 decimal at 100 scale
        d=re.sub(r'\.0\b','',d)
        a={}
        fill=p['fill']; at=p['attrs']
        if fill and fill.startswith('url(#'):
            gid=fill[5:-1]; g=ids[gid]
            g2=ET.fromstring(ET.tostring(g))
            gt=ext.mat(g2.get('gradientTransform'))
            g2.set('gradientTransform',ext.fmt(ext.mul(T,gt)))
            for st in g2: 
                st.set('stop-color',rgbhex(st.get('stop-color')))
            # thin stops
            stops=list(g2)
            if len(stops)>12:
                for k,st in enumerate(stops):
                    if k%8 and k!=len(stops)-1: g2.remove(st)
            defs.append(ET.tostring(g2).decode().replace('ns0:','').replace(':ns0','').replace(' xmlns="http://www.w3.org/2000/svg"',''))
        a['fill']=rgbhex(fill)
        if at.get('fill-rule')=='evenodd': a['fill-rule']='evenodd'
        if at.get('fill-opacity') not in (None,'1'): a['fill-opacity']=at['fill-opacity']
        if at.get('stroke'): 
            a['stroke']=rgbhex(at['stroke']); a['stroke-width']='%.2f'%(float(at.get('stroke-width',1))*sc)
            if at.get('stroke-linecap','butt')!='butt': a['stroke-linecap']=at['stroke-linecap']
            if at.get('stroke-linejoin','miter')!='miter': a['stroke-linejoin']=at['stroke-linejoin']
            if at.get('stroke-opacity') not in (None,'1'): a['stroke-opacity']=at['stroke-opacity']
        if at.get('opacity'): a['opacity']=at['opacity']
        body.append('<path %s d="%s"/>'%(' '.join('%s="%s"'%(k,v) for k,v in a.items()),d))
    vb='0 0 %.1f %.1f'%(W*sc,H*sc)
    inner=('<defs>%s</defs>'%''.join(defs) if defs else '')+''.join(body)
    if out: open(out,'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s">%s</svg>'%(vb,inner))
    return dict(viewBox=vb,body=inner,idx=[i for i,_ in sel],bbox=bx)
