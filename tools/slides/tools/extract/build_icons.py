import re, json, xml.etree.ElementTree as ET
import ext, ext2
S='{http://www.w3.org/2000/svg}'
F=lambda n:f'svg/p{n}.strip.svg'
def r1(d): 
    d=re.sub(r'(-?\d+\.\d)\d+',r'\1',d); d=re.sub(r'\.0(?=\D|$)','',d); return d
def norm_d(d, box, size=100.0):
    sc=size/max(box[2]-box[0],box[3]-box[1])
    T=(sc,0,0,sc,-box[0]*sc,-box[1]*sc)
    nd,_=ext.tpath(d,T); return r1(nd), sc
def clip(f,cid):
    r=ET.parse(f).getroot()
    for e in r.iter(S+'clipPath'):
        if e.get('id')==cid: return e.find(S+'path').get('d')
def subpaths(d): return [s.strip() for s in re.split(r'(?=M )',d.strip()) if s.strip()]
icons={}
# --- tile shape + tile glyphs (normalised to tile box 0..100)
res,_=ext.run(F(14),None); lockd=res[1]['d']; lb=res[1]['bbox']
sp=subpaths(lockd)
icons['@squircle'],_=norm_d(sp[0],lb)
icons['@squircle']=dict(viewBox='0 0 100 100',d=icons['@squircle'])
icons['lock']=dict(viewBox='0 0 100 100',d=norm_d(' '.join(sp[1:]),lb)[0],kind='tile-glyph',src=14)
gd=clip(F(15),'clip-11'); gsp=subpaths(gd)
gb=(1339.1875,830.375,2756.8125,2241.625)
icons['gear']=dict(viewBox='0 0 100 100',d=norm_d(' '.join(gsp[1:]),gb)[0],kind='tile-glyph',src=15)
def mono(name,page,idx,kind='mono',src=None,evenodd=False):
    res,_=ext.run(F(page),None)
    ps=[res[i] for i in idx]
    box=[min(p['bbox'][0] for p in ps),min(p['bbox'][1] for p in ps),max(p['bbox'][2] for p in ps),max(p['bbox'][3] for p in ps)]
    W=box[2]-box[0];H=box[3]-box[1]; sc=100/max(W,H)
    d=' '.join(norm_d(p['d'],box)[0] for p in ps)
    ev = evenodd or any(p['attrs'].get('fill-rule')=='evenodd' for p in ps)
    icons[name]=dict(viewBox='0 0 %.1f %.1f'%(W*sc,H*sc),d=d,kind=kind,src=page,**({'rule':'evenodd'} if ev else {}))
mono('calendar',105,[13])
mono('gear-badge',66,[12])
mono('padlock',67,[16])
mono('github',97,[3])
mono('git',80,[1])
mono('discord',105,[10])
mono('discord-wordmark',105,[4,5,6,7,8,9,11,12])
mono('adobe',83,[4])
mono('fastly',66,[2,3,4,5,6,7,8,9])
mono('gear-solid',120,[4])
mono('gear-ring',120,[2])
mono('robot',57,[14,15,16,17,18,19])
mono('end-of-service',56,list(range(1,14)),evenodd=True)
mono('store',39,[2])
mono('gauge',38,[2,4,6,8])
# (p10 index 3 is only the dashed ring — use art 'roots-badge')
# --- multi-colour art
def art(name,page,box,keep=None):
    r=ext2.region(F(page),box,keep=keep)
    icons[name]=dict(viewBox=r['viewBox'],body=r['body'],kind='art',src=page)
art('cloudflare',67,(1000,1150,3000,1900),keep=[10,11,12,13])
art('flasks',11,(1280,680,2820,2390))
art('roots-badge',10,(1300,800,2960,2600))
art('map',60,(1100,660,3000,2410))
art('terminal-prompt',31,(1500,1300,2600,1800),keep=[2,3,4,5])
for k,v in icons.items():
    print(k, v.get('viewBox'), len(v.get('d',v.get('body',''))))
json.dump(icons,open('icons.json','w'))
# --- second batch
mono('database-stack',6,[5])
mono('block',8,[5])
mono('person',23,[4])
art('cloudflare-cloud',22,(2500,700,3000,960),keep=[4,5,6])
art('aws',65,(1600,1000,2500,2060),keep=list(range(6,24)))
art('webcomponents',109,(1480,1200,2620,2140),keep=[15,16,17,18,19,20])
art('worldwide',87,(960,500,3100,2570))
for k in ['database-stack','block','person','cloudflare-cloud','aws','webcomponents','worldwide']:
    print(k, icons[k]['viewBox'], len(icons[k].get('d',icons[k].get('body',''))))
json.dump(icons,open('icons.json','w'))
