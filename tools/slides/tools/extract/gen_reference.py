import os, textwrap
D='reference'
def page(title, body):
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <link rel="stylesheet" href="../lib/aem-live.css">
  <script type="module" src="../lib/aem-live.js"></script>
</head>
<body>
{textwrap.indent(textwrap.dedent(body).strip(), '  ')}
</body>
</html>
'''
S={}
S['p001-architecture']=('Architecture — AEM app icon over a big word','''
<aem-slide bg="aurora">
  <aem-backtext style="--y:51%">Architecture</aem-backtext>
  <aem-appicon kind="aem" style="--size:387px; --y:49%"></aem-appicon>
</aem-slide>''')
S['p002-protocols']=('Protocols word wall behind a black tile','''
<aem-slide bg="aurora">
  <aem-wordwall words="TLS,HTTPS,DNS,CDN,QUIC,URL,URI,API"></aem-wordwall>
  <aem-tile tone="black">
    <aem-icon name="globe" style="--size:200px; color:#1ea6bc"></aem-icon>
  </aem-tile>
</aem-slide>''')
S['p006-api']=('API next to a database stack','''
<aem-slide bg="aurora">
  <div class="row" style="--gap:72px; --y:51%">
    <span style="font:900 236px/1 var(--font); color:var(--graphite); letter-spacing:-.01em">API</span>
    <aem-icon name="database-stack" style="--size:300px; color:var(--graphite)"></aem-icon>
  </div>
</aem-slide>''')
S['p007-rings']=('Concentric glass rings on periwinkle','''
<aem-slide bg="periwinkle" grid="large">
  <aem-rings style="--size:670px; --y:50%"></aem-rings>
</aem-slide>''')
S['p008-yellow-block']=('Yellow grid with a pink block badge','''
<aem-slide bg="yellow" grid="large" grid-tone="light">
  <aem-badge tone="pink" icon="block" style="--size:240px; --badge-ink:#b24eb6; --icon:24%"></aem-badge>
</aem-slide>''')
S['p009-twilight']=('Empty twilight grid (title / text slide background)','''
<aem-slide bg="twilight" grid="fine" seams></aem-slide>''')
S['p010-roots']=('Roots emblem on ember','''
<aem-slide bg="ember">
  <aem-icon name="roots-badge" style="--size:410px; --y:55%"></aem-icon>
</aem-slide>''')
S['p011-flasks']=('Two lab flasks (experiments)','''
<aem-slide bg="twilight" grid="fine" seams>
  <aem-icon name="flasks" style="--size:350px; --y:50%"></aem-icon>
</aem-slide>''')
S['p012-face']=('AEM face app icon','''
<aem-slide bg="sorbet">
  <aem-appicon kind="face" style="--size:404px; --y:49%"></aem-appicon>
</aem-slide>''')
S['p013-lock-pencil']=('Lock tile with pencil badge','''
<aem-slide bg="sorbet">
  <aem-tile tone="graphite" glyph="lock">
    <aem-badge at="bl" emoji>✏️</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p014-lock']=('Lock tile','''
<aem-slide bg="sorbet">
  <aem-tile tone="graphite" glyph="lock"></aem-tile>
</aem-slide>''')
S['p016-lock-key']=('Lock tile with key badge','''
<aem-slide bg="sorbet">
  <aem-tile tone="graphite" glyph="lock">
    <aem-badge at="bl" emoji>🔑</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p017-night-lock-globe']=('Night — silver lock with globe badge','''
<aem-slide bg="night" grid="large">
  <aem-tile tone="silver" glyph="lock">
    <aem-badge at="tr" tone="night" emoji>🌐</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p018-night-gear-cloud']=('Night — silver gear with cloud badge','''
<aem-slide bg="night" grid="large">
  <aem-tile tone="silver" glyph="gear">
    <aem-badge at="tr" tone="night" emoji>☁️</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p019-grey-lock-globe']=('Grey — ink lock with globe badge','''
<aem-slide bg="grey" grid="medium" grid-tone="light">
  <aem-tile tone="ink" glyph="lock">
    <aem-badge at="tr" tone="grey" emoji>🌐</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p021-blush-lock-globe']=('Blush — ink lock with globe badge','''
<aem-slide bg="blush">
  <aem-tile tone="ink" glyph="lock">
    <aem-badge at="tr" tone="pink" emoji>🌐</aem-badge>
  </aem-tile>
</aem-slide>''')
S['p022-lock-cloudflare']=('Lavender — ink lock with Cloudflare badge','''
<aem-slide bg="lavender" grid="medium">
  <aem-tile tone="ink" glyph="lock">
    <aem-badge at="tr" tone="lavender"><aem-icon name="cloudflare-cloud" style="--size:62%"></aem-icon></aem-badge>
  </aem-tile>
</aem-slide>''')
S['p023-lock-person']=('Lavender — ink lock with person badge','''
<aem-slide bg="lavender" grid="medium">
  <aem-tile tone="ink" glyph="lock">
    <aem-badge at="tr" tone="lavender" icon="person" style="--badge-ink:#000; --icon:62%"></aem-badge>
  </aem-tile>
</aem-slide>''')
S['p025-html']=('<html> code tile','''
<aem-slide bg="sorbet">
  <aem-tile tone="white"><span class="aem-code">&lt;<b>html</b>&gt;</span></aem-tile>
</aem-slide>''')
S['p026-byo']=('<byo> code tile on twilight','''
<aem-slide bg="twilight" grid="fine" seams>
  <aem-tile tone="white"><span class="aem-code">&lt;<b>byo</b>&gt;</span></aem-tile>
</aem-slide>''')
S['p027-html-json']=('<html> funnels into {json}','''
<aem-slide bg="sorbet">
  <svg viewBox="0 0 180 300" style="position:absolute; left:426px; top:50%; width:180px; height:300px; translate:0 -50%; z-index:1">
    <defs><linearGradient id="wedge" x1="0" x2="1"><stop offset="0" stop-color="#1e1e1e"/><stop offset=".55" stop-color="#8a8a8a"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient></defs>
    <polygon points="0,0 180,108 180,192 0,300" fill="url(#wedge)"/>
  </svg>
  <aem-tile tone="white" style="--x:264px"><span class="aem-code">&lt;<b>html</b>&gt;</span></aem-tile>
  <aem-tile tone="white" style="--x:766px"><span class="aem-code"><b>{</b>json<b>}</b></span></aem-tile>
</aem-slide>''')
S['p030-face-github']=('Night — dark AEM face with GitHub badge','''
<aem-slide bg="night" grid="large">
  <aem-appicon kind="face-dark" style="--size:406px; --y:49%"></aem-appicon>
  <aem-badge tone="solid-lime" icon="github" style="--x:700px; --y:192px; --size:184px; --icon:84%"></aem-badge>
</aem-slide>''')
S['p031-terminal']=('Night — $ aem terminal tile','''
<aem-slide bg="night" grid="large">
  <aem-appicon kind="terminal" style="--size:352px"></aem-appicon>
</aem-slide>''')
S['p032-night-lock']=('Night — silver lock','''
<aem-slide bg="night" grid="large">
  <aem-tile tone="silver" glyph="lock"></aem-tile>
</aem-slide>''')
S['p033-glass-card']=('Glass card on meadow grid (text container)','''
<aem-slide bg="meadow" grid="large" grid-tone="ink">
  <aem-card tone="glass" style="--w:840px; --h:518px; --r:110px; --y:50%"></aem-card>
</aem-slide>''')
S['p035-dawn']=('Empty dawn grid (text slide background)','''
<aem-slide bg="dawn" grid="large" grid-tone="light"></aem-slide>''')
S['p036-unsupported']=('UNSUPPORTED crossed out','''
<aem-slide bg="pink" grid="fine" seams grid-tone="light">
  <aem-no style="--size:448px; --y:50%"></aem-no>
  <aem-backtext front shadow style="--y:51%; --size:150px">Unsupported</aem-backtext>
</aem-slide>''')
S['p038-telemetry']=('Operational telemetry gauge','''
<aem-slide bg="dusk">
  <div class="col" style="--gap:44px; --y:48%">
    <aem-icon name="gauge" style="--size:760px; color:#e4e4dc"></aem-icon>
    <div style="font:900 70px/1.18 var(--font); color:#fff; text-align:center; letter-spacing:.01em">OPERATIONAL<br>TELEMETRY</div>
  </div>
</aem-slide>''')
S['p039-store']=('Storefront','''
<aem-slide bg="tide">
  <aem-icon name="store" style="--size:624px; color:rgb(255 255 255 / .82); --y:50%"></aem-icon>
</aem-slide>''')
S['p046-wireframe']=('Website wireframe on lime with soft discs','''
<aem-slide bg="lime" grid="large">
  <aem-blob style="--x:270px; --y:60px; --size:520px"></aem-blob>
  <aem-blob style="--x:820px; --y:250px; --size:540px"></aem-blob>
  <aem-blob style="--x:200px; --y:600px; --size:880px"></aem-blob>
  <aem-blob style="--x:840px; --y:660px; --size:240px"></aem-blob>
  <aem-browser tone="site" style="--y:47%"></aem-browser>
</aem-slide>''')
S['p047-wireframe-ue']=('Wireframe with Adobe tile and Universal Editor sticker','''
<aem-slide bg="lime" grid="large">
  <aem-blob style="--x:270px; --y:60px; --size:520px"></aem-blob>
  <aem-blob style="--x:820px; --y:250px; --size:540px"></aem-blob>
  <aem-blob style="--x:200px; --y:600px; --size:880px"></aem-blob>
  <aem-blob style="--x:840px; --y:660px; --size:240px"></aem-blob>
  <aem-browser tone="site" style="--y:47%">
    <div class="aem-wire">
      <div class="nav"><span class="logo"></span><span class="link"></span><span class="link"></span><span class="link"></span></div>
      <div class="lines"><span></span><span></span><span></span><span></span></div>
      <div class="button"></div>
      <div class="media"><aem-icon name="image-placeholder" style="--size:100%"></aem-icon></div>
      <div class="panel"></div>
    </div>
  </aem-browser>
  <aem-tile tone="white" style="--size:192px; --x:841px; --y:154px"><aem-icon name="adobe" style="--size:118px; color:var(--adobe-red)"></aem-icon></aem-tile>
  <aem-sticker tone="lime" style="--x:189px; --y:557px; --size:184px"></aem-sticker>
</aem-slide>''')
S['p050-wireframe-highlight']=('Wireframe with highlighted media block','''
<aem-slide bg="lime" grid="large">
  <aem-blob style="--x:270px; --y:60px; --size:520px"></aem-blob>
  <aem-blob style="--x:820px; --y:250px; --size:540px"></aem-blob>
  <aem-blob style="--x:200px; --y:600px; --size:880px"></aem-blob>
  <aem-blob style="--x:840px; --y:660px; --size:240px"></aem-blob>
  <aem-browser tone="site" style="--y:47%">
    <div class="aem-wire">
      <div class="nav"><span class="logo"></span><span class="link"></span><span class="link"></span><span class="link"></span></div>
      <div class="cta-top"></div>
      <div class="lines"><span></span><span></span><span></span><span></span></div>
      <div class="button"></div>
      <div class="media" hl><aem-icon name="image-placeholder" style="--size:100%"></aem-icon></div>
      <div class="panel"></div>
    </div>
  </aem-browser>
</aem-slide>''')
S['p054-bubbles']=('Lighthouse 100 bubbles','''
<aem-slide bg="grey" grid="medium" grid-tone="light">
  <aem-bubble tone="periwinkle" style="--x:62px;  --y:40px;  --size:192px">100</aem-bubble>
  <aem-bubble tone="pink"       style="--x:925px; --y:88px;  --size:300px">100</aem-bubble>
  <aem-bubble tone="pink"       style="--x:8px;   --y:350px; --size:340px">100</aem-bubble>
  <aem-bubble tone="lime"       style="--x:659px; --y:384px; --size:270px">100</aem-bubble>
  <aem-bubble tone="periwinkle" style="--x:286px; --y:680px; --size:412px">100</aem-bubble>
  <aem-bubble tone="pink"       style="--x:870px; --y:650px; --size:296px">100</aem-bubble>
</aem-slide>''')
S['p055-dns']=('DNS hexagon','''
<aem-slide bg="grey" grid="medium" grid-tone="light">
  <aem-shape kind="hexagon" tone="lavender" shadow style="--size:522px; --y:50%; font-size:216px">DNS</aem-shape>
</aem-slide>''')
S['p056-end-of-service']=('End of service sign','''
<aem-slide bg="grey" grid="medium" grid-tone="light">
  <aem-icon name="end-of-service" style="--size:522px; color:#000"></aem-icon>
</aem-slide>''')
S['p057-robot']=('Robot (bots, crawlers)','''
<aem-slide bg="grey" grid="medium" grid-tone="light">
  <aem-icon name="robot" style="--size:451px; color:#000; --y:47%"></aem-icon>
</aem-slide>''')
S['p060-map']=('Folded map on iris with violet checkers','''
<aem-slide bg="iris">
  <aem-checker tone="violet" cell="l" style="left:0; top:0; width:37.7%; height:56%"></aem-checker>
  <aem-checker tone="violet" cell="l" style="right:0; bottom:0; width:28.5%; height:44%"></aem-checker>
  <aem-icon name="map" style="--size:470px; color:#fff; --y:50%; filter:var(--drop)"></aem-icon>
</aem-slide>''')
S['p062-map-unsupported']=('Map crossed out','''
<aem-slide bg="iris">
  <aem-checker tone="violet" cell="l" style="left:0; top:0; width:37.7%; height:56%"></aem-checker>
  <aem-checker tone="violet" cell="l" style="right:0; bottom:0; width:28.5%; height:44%"></aem-checker>
  <!-- "lights off": dim everything below, then a greyed-out map -->
  <aem-layer style="background:linear-gradient(180deg, rgb(12 10 40 / .62), rgb(8 6 30 / .78)); z-index:2"></aem-layer>
  <aem-icon name="map" style="--size:470px; --y:50%; filter:grayscale(1) brightness(.84) var(--drop)"></aem-icon>
  <aem-no style="--size:448px"></aem-no>
</aem-slide>''')
S['p065-aws']=('AWS tile with gear badge on dawn','''
<aem-slide bg="dawn">
  <aem-checker tone="graphite" style="left:40%; top:0; right:0; height:57%"></aem-checker>
  <aem-tile tone="white">
    <aem-icon name="aws" style="--size:56%"></aem-icon>
    <aem-badge at="tr" icon="gear-badge"></aem-badge>
  </aem-tile>
</aem-slide>''')
S['p066-fastly']=('Fastly card with gear badge','''
<aem-slide bg="lavender" grid="medium">
  <aem-card>
    <aem-icon name="fastly" style="--size:535px; color:var(--fastly)"></aem-icon>
    <aem-badge at="tr" icon="gear-badge"></aem-badge>
  </aem-card>
</aem-slide>''')
S['p067-cloudflare']=('Cloudflare card with lock badge','''
<aem-slide bg="lavender" grid="medium">
  <aem-card>
    <aem-icon name="cloudflare" style="--size:480px"></aem-icon>
    <aem-badge at="tr" icon="padlock" style="--badge-ink:var(--lime-ink)"></aem-badge>
  </aem-card>
</aem-slide>''')
S['p069-environments']=('Environments vs. branches','''
<aem-slide bg="periwinkle" grid="large">
  <aem-card flat style="--x:288px; --y:381px; --w:246px; --h:389px; --r:40px; --gap:36px; --pad:32px; --fill:linear-gradient(180deg,#fff24a,#ffd33c); --card-shadow:var(--shadow-soft)">
    <div class="aem-label" style="background:#f5f200; width:100%; padding:20px 0; border-radius:8px; font-weight:400; font-size:23px">Production</div>
    <div class="aem-label" style="background:#f5f200; width:100%; padding:20px 0; border-radius:8px; font-weight:400; font-size:23px">Stage</div>
    <div class="aem-label" style="background:#f5f200; width:100%; padding:20px 0; border-radius:8px; font-weight:400; font-size:23px">Development</div>
  </aem-card>
  <aem-card flat style="--x:744px; --y:381px; --w:246px; --h:389px; --r:40px; --gap:36px; --pad:32px; --fill:linear-gradient(180deg,#6af4f0,#0db39a); --card-shadow:var(--shadow-soft)">
    <div class="aem-mono" style="background:#16e5cf; width:100%; padding:20px 0; border-radius:8px; color:#3a7a6f; font-size:23px; box-shadow:0 0 0 1px #0fb7a5">main</div>
    <div class="aem-mono" style="background:#16e5cf; width:100%; padding:20px 0; border-radius:8px; color:#3a7a6f; font-size:23px; box-shadow:0 0 0 1px #0fb7a5">stage</div>
    <div class="aem-mono" style="background:#16e5cf; width:100%; padding:20px 0; border-radius:8px; color:#3a7a6f; font-size:23px; box-shadow:0 0 0 1px #0fb7a5">dev</div>
    <aem-badge at="tr" tone="solid-lime" icon="github" style="--size:99px; --icon:80%; --badge-ink:#111; --inset:0px"></aem-badge>
  </aem-card>
  <aem-appicon kind="aem" style="--size:96px; --x:168px; --y:576px"></aem-appicon>
</aem-slide>''')
S['p070-livecopy']=('MSM source → live copy','''
<aem-slide bg="lime">
  <aem-checker tone="olive" style="left:0; top:0; width:41.2%; height:100%"></aem-checker>
  <aem-card align="start" style="--y:50%">
    <div class="row" style="--gap:0; width:100%; justify-content:space-between; padding:0 22px">
      <div style="position:relative; width:210px; height:84px">
        <div style="position:absolute; inset:30px -30px -30px 30px; border:2px solid #d2d2d2; border-radius:4px"></div>
        <div style="position:absolute; inset:15px -15px -15px 15px; border:2px solid #b5b8a4; border-radius:4px; background:#fff"></div>
        <div style="position:absolute; inset:0; border:2px solid #4f5a2e; border-radius:4px; background:#7a8a4e; color:#fff; display:flex; align-items:center; justify-content:center; font:400 22px var(--font)">Source</div>
      </div>
      <svg width="130" height="40" viewBox="0 0 130 40" style="margin-left:24px"><path d="M0 8h120M0 8v24h108" stroke="#d2d2d2" stroke-width="4" fill="none"/><path d="M106 22l18 10-18 10z" fill="#d2d2d2"/></svg>
      <div style="position:relative; width:210px; height:84px">
        <div style="position:absolute; inset:30px -30px -30px 30px; border:2px solid #ecefe0; border-radius:4px"></div>
        <div style="position:absolute; inset:15px -15px -15px 15px; border:2px solid #dfe5c4; border-radius:4px; background:#fff"></div>
        <div style="position:absolute; inset:0; border:2px solid #c9d29c; border-radius:4px; background:#f1fbc7; color:var(--graphite); display:flex; align-items:center; justify-content:center; font:400 22px var(--font)">Live Copy</div>
      </div>
    </div>
    <aem-sticker at="tl" tone="grey" style="--size:176px; --inset:0px; translate:-58% -46%"></aem-sticker>
  </aem-card>
</aem-slide>''')
S['p080-git']=('Git logo on blush','''
<aem-slide bg="blush">
  <aem-icon name="git" style="--size:512px; color:#100f0d; --y:50%"></aem-icon>
  <p class="aem-fineprint">Git Logo by <u>Jason Long</u> is licensed under the <u>Creative Commons Attribution 3.0 Unported License</u>.</p>
</aem-slide>''')
S['p083-adobe-ai']=('Adobe tile with AI emoji row','''
<aem-slide bg="candy">
  <aem-checker tone="mauve" style="left:29.5%; top:47.5%; right:0; bottom:0"></aem-checker>
  <aem-card style="--y:50%; flex-direction:row; --gap:24px; --pad:0 26px 0 50px; justify-content:flex-start">
    <aem-tile tone="white" style="--size:246px; position:relative; flex:0 0 auto"><aem-icon name="adobe" style="--size:144px; color:var(--adobe-red)"></aem-icon></aem-tile>
    <span class="emoji" style="font-size:70px; letter-spacing:20px; white-space:nowrap">🤖❓💬🟢</span>
  </aem-card>
</aem-slide>''')
S['p090-adobe-badge']=('Adobe tile with pink gear badge','''
<aem-slide bg="lime" grid="large">
  <aem-tile tone="white" style="--size:464px; --y:49%">
    <aem-icon name="adobe" style="--size:270px; color:var(--adobe-red)"></aem-icon>
    <aem-badge at="tr" tone="pink" icon="gear-badge" style="--size:152px; --inset:14px; --badge-ink:#e9a5ec"></aem-badge>
  </aem-tile>
</aem-slide>''')
S['p091-http-codes']=('HTTP status code bubbles on lightning wallpaper','''
<aem-slide bg="lime" grid="large">
  <aem-bolts></aem-bolts>
  <aem-bubble tone="periwinkle" style="--x:62px;  --y:40px;  --size:192px">403</aem-bubble>
  <aem-bubble tone="pink"       style="--x:925px; --y:88px;  --size:300px">405</aem-bubble>
  <aem-bubble tone="pink"       style="--x:8px;   --y:350px; --size:340px">401</aem-bubble>
  <aem-bubble tone="lime"       style="--x:659px; --y:384px; --size:270px">400</aem-bubble>
  <aem-bubble tone="periwinkle" style="--x:286px; --y:680px; --size:412px">404</aem-bubble>
  <aem-bubble tone="pink"       style="--x:870px; --y:650px; --size:296px">504</aem-bubble>
</aem-slide>''')
S['p093-quote']=('Quote on lime grid','''
<aem-slide bg="lime" grid="large">
  <aem-quote style="--w:990px; --y:50%; --size:64px; --ink:#7f6c91">“Everybody has a testing environment. Some people are lucky enough to have a totally separate environment to run production in”</aem-quote>
</aem-slide>''')
S['p094-quadrant']=('Testing quadrant','''
<aem-slide bg="lime" grid="large">
  <aem-quadrant x-label="Cost of testing" y-label="Impact of errors">
    <aem-card><p class="aem-title">Test Thoroughly<small>(your backend is here)</small></p></aem-card>
    <aem-card><p class="aem-title">Tread Carefully<small>(frontend libraries)</small></p></aem-card>
    <aem-card><p class="aem-title">Spot Testing</p></aem-card>
    <aem-card><p class="aem-title" style="white-space:nowrap">Perfectionist’s Corner<small>(most UI testing)</small></p></aem-card>
  </aem-quadrant>
</aem-slide>''')
S['p096-aem-live']=('hlx.live → aem.live pentagon','''
<aem-slide bg="lime">
  <aem-checker tone="olive" style="left:0; top:0; width:41.2%; height:100%"></aem-checker>
  <aem-shape kind="pentagon" tone="olive" shadow style="--size:590px; --y:49%; --ink:#fff; font-weight:700; font-size:106px; line-height:.98; padding-top:10px; padding-bottom:70px">
    <span class="strike">hlx.live</span>
    <span>aem.live</span>
  </aem-shape>
</aem-slide>''')
S['p097-github-emoji']=('GitHub card with emoji reactions','''
<aem-slide bg="lime">
  <aem-checker tone="olive" style="left:0; top:0; width:41.2%; height:100%"></aem-checker>
  <aem-card style="flex-direction:row; --gap:26px; justify-content:flex-start; --pad:0 40px">
    <aem-icon name="github" style="--size:256px; color:var(--github)"></aem-icon>
    <span class="emoji" style="font-size:76px; letter-spacing:18px">🙏👀👍✅</span>
  </aem-card>
</aem-slide>''')
S['p099-github-badge']=('GitHub tile with gear badge','''
<aem-slide bg="lime">
  <aem-checker tone="olive" style="left:0; top:0; width:41.2%; height:100%"></aem-checker>
  <aem-tile tone="white">
    <aem-icon name="github" style="--size:256px; color:var(--github)"></aem-icon>
    <aem-badge at="tr" icon="gear-badge"></aem-badge>
  </aem-tile>
</aem-slide>''')
S['p101-dawn-checker']=('Dawn with graphite checker band (text slide background)','''
<aem-slide bg="dawn">
  <aem-checker tone="graphite" style="left:40%; top:0; right:0; height:57%"></aem-checker>
</aem-slide>''')
S['p105-discord-thursday']=('Discord community hangout card','''
<aem-slide bg="prism">
  <aem-checker tone="glass" style="left:0; right:0; top:54.7%; bottom:0"></aem-checker>
  <aem-card style="--gap:30px">
    <p class="aem-caption">Tune in: Thursday 4pm UTC, Adobe<br>Experience Manager community hangout</p>
    <aem-logo name="discord" style="--size:575px"></aem-logo>
    <aem-badge at="tr" icon="calendar" style="--icon:56%"></aem-badge>
  </aem-card>
</aem-slide>''')
S['p106-discord-tuesday']=('Discord “don’t miss” card','''
<aem-slide bg="sorbet">
  <aem-card style="--gap:30px">
    <p class="aem-caption">Don’t miss: Tuesday 8am UTC, Adobe<br>Experience Manager community hangout</p>
    <aem-logo name="discord" style="--size:575px"></aem-logo>
    <aem-badge at="tr" icon="calendar" style="--icon:56%"></aem-badge>
  </aem-card>
</aem-slide>''')
S['p120-gears']=('Two glass gears on twilight','''
<aem-slide bg="twilight" grid="fine" seams>
  <aem-icon name="gear-ring" fill="glass" shadow style="--size:390px; --x:302px; --y:266px"></aem-icon>
  <aem-icon name="gear-solid" fill="glass" shadow style="--size:392px; --x:691px; --y:499px"></aem-icon>
</aem-slide>''')
S['p153-battle']=('Event card over a celebration panel','''
<aem-slide bg="periwinkle" grid="large">
  <aem-layer style="left:13%; right:13%; top:51%; bottom:0; background:linear-gradient(180deg,#fee3ff,#f0b2f2); z-index:1"></aem-layer>
  <aem-checker tone="mauve" style="left:35%; right:13%; top:77%; bottom:0"></aem-checker>
  <aem-card style="--x:512px; --y:602px; --w:466px; --h:256px; --r:56px">
    <span class="emoji" style="font-size:100px; letter-spacing:-8px">🎉🎉🎉</span>
  </aem-card>
  <aem-card style="--x:757px; --y:246px; --w:470px; --h:192px; --r:52px; --gap:12px; --pad:18px">
    <p class="aem-caption" style="font-size:23px; font-weight:400">Thursday Frequency<br>Battle of the Templates</p>
    <aem-logo name="discord" style="--size:285px"></aem-logo>
    <aem-badge at="tr" icon="calendar" style="--size:110px; --inset:30px; --icon:56%"></aem-badge>
  </aem-card>
</aem-slide>''')
for k,(t,b) in S.items():
    open(os.path.join(D,k+'.html'),'w').write(page(t,b))
print(len(S))
