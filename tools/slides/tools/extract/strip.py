import re,sys
for f in sys.argv[1:]:
    s=open(f).read()
    s=re.sub(r'<image[^>]*/>','',s)
    s=re.sub(r'xlink:href="data:[^"]*"','xlink:href=""',s)
    open(f.replace('.svg','.strip.svg'),'w').write(s)
    print(f,len(s))
