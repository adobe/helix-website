/* eslint-disable max-classes-per-file -- one small custom element per component */
// AEM Live slide components. Light-DOM custom elements that expand into
// CSS/SVG. Load once per slide:  <script type="module" src="../lib/aem-live.js"></script>
//
// Query parameters understood by every slide page:
//   ?scale=N    CSS zoom factor for export (1 → 1024×768, 4 → 4096×3072 like the deck)
//   ?preview    dark surround + padding for looking at a slide in a browser
//
// When everything is rendered, <html data-ready="1"> is set and
// window.aemReady (a Promise) resolves. The exporter waits for it.

import { ICONS } from './icons.js';
import { CUSTOM } from './icons-custom.js';

const ALL = { ...ICONS, ...CUSTOM };
const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;
const nextId = (p) => {
  uid += 1;
  return `${p}-${uid}`;
};

export function iconNames() { return Object.keys(ALL).filter((k) => !k.startsWith('@')); }
export function getIcon(name) { return ALL[name]; }

// ids inside multi-colour art must be unique per document
function scopeIds(body) {
  const ids = [...body.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  if (!ids.length) return body;
  const p = nextId('a');
  let out = body;
  ids.forEach((id) => {
    out = out.replaceAll(`id="${id}"`, `id="${p}-${id}"`).replaceAll(`url(#${id})`, `url(#${p}-${id})`);
  });
  return out;
}

/** Build an <svg> string for icon `name`. opts: { fill, rule, cls, gradient } */
export function iconSVG(name, opts = {}) {
  const ic = ALL[name];
  if (!ic) {
    console.warn(`[aem] unknown icon "${name}". Known: ${iconNames().join(', ')}`);
    return `<svg class="aem-icon" viewBox="0 0 100 100"><rect width="100" height="100" fill="none" stroke="red" stroke-width="4"/><text x="50" y="58" font-size="16" text-anchor="middle" fill="red">${name}</text></svg>`;
  }
  const cls = opts.cls ?? 'aem-icon';
  if (ic.body) {
    return `<svg class="${cls}" xmlns="${SVGNS}" viewBox="${ic.viewBox}" aria-hidden="true">${scopeIds(ic.body)}</svg>`;
  }
  const rule = opts.rule ?? ic.rule ?? (ic.kind === 'tile-glyph' ? 'evenodd' : 'nonzero');
  let defs = '';
  let fill = opts.fill ?? 'currentColor';
  let stroke = '';
  if (opts.gradient) {
    const id = nextId('g');
    const [a, b] = opts.gradient;
    defs = `<defs><radialGradient id="${id}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>`;
    fill = `url(#${id})`;
    if (opts.stroke) stroke = ` stroke="${opts.stroke}" stroke-width="${opts.strokeWidth ?? 0.35}"`;
  }
  return `<svg class="${cls}" xmlns="${SVGNS}" viewBox="${ic.viewBox}" aria-hidden="true">${defs}<path fill="${fill}" fill-rule="${rule}"${stroke} d="${ic.d}"/></svg>`;
}

const svgURL = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
const attr = (el, name, dflt) => (el.hasAttribute(name) ? el.getAttribute(name) : dflt);

// ---------------------------------------------------------------------- base
const rendered = new WeakSet(); // elements that already built their markup
class AemElement extends HTMLElement {
  connectedCallback() {
    if (rendered.has(this)) return;
    rendered.add(this);
    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  render() {}
}

// ---------------------------------------------------------------------- slide
class AemSlide extends AemElement {}

// ---------------------------------------------------------------------- icon
class AemIcon extends AemElement {
  static observedAttributes = ['name'];

  render() {
    const name = attr(this, 'name', 'lock');
    const glass = this.getAttribute('fill');
    const opts = {};
    const GLASS = {
      glass: [['#e1fa82', '#f8fde4'], '#ddf681'],
      'glass-lime': [['#e1fa82', '#f8fde4'], '#ddf681'],
      'glass-pink': [['#f0b2f2', '#fff0ff'], '#efbde8'],
      'glass-white': [['#ffffff', '#e8e8f4'], '#ffffff'],
    };
    if (GLASS[glass]) [opts.gradient, opts.stroke] = GLASS[glass];
    this.innerHTML = iconSVG(name, opts);
  }

  attributeChangedCallback() { if (rendered.has(this)) this.render(); }
}

// ---------------------------------------------------------------------- logo lockups
const LOCKUPS = {
  discord: () => `${iconSVG('discord', { cls: 'aem-icon' }).replace('<svg', '<svg style="height:100%;flex:0 0 auto"')}${iconSVG('discord-wordmark').replace('<svg', '<svg style="height:47%;flex:0 0 auto"')}`,
};
class AemLogo extends AemElement {
  render() {
    const name = attr(this, 'name', 'discord');
    if (!this.style.color) {
      this.style.color = {
        discord: 'var(--discord)', github: 'var(--github)', adobe: 'var(--adobe-red)', fastly: 'var(--fastly)',
      }[name] ?? '';
    }
    if (LOCKUPS[name]) {
      this.style.height = 'calc(var(--size, 300px) * .2)';
      this.innerHTML = LOCKUPS[name]();
    } else {
      this.innerHTML = iconSVG(name);
    }
  }
}

// ---------------------------------------------------------------------- tile
// <aem-tile tone="graphite" glyph="lock"> … </aem-tile>
class AemTile extends AemElement {
  render() {
    const kids = [...this.childNodes];
    const wrap = document.createElement('div');
    wrap.className = 'aem-face-wrap';
    const face = document.createElement('div');
    face.className = 'aem-face';
    wrap.append(face);
    const glyph = this.getAttribute('glyph');
    if (glyph) {
      const ic = ALL[glyph];
      if (ic?.kind === 'tile-glyph') {
        const m = svgURL(`<svg xmlns="${SVGNS}" viewBox="0 0 100 100"><path fill="#000" fill-rule="evenodd" d="${ic.d}"/></svg>`);
        face.style.maskImage = `${m}, linear-gradient(#000 0 0)`;
        face.style.maskSize = '100% 100%';
        face.style.maskRepeat = 'no-repeat';
        face.style.maskComposite = 'exclude';
      } else {
        console.warn(`[aem] glyph "${glyph}" is not a tile-glyph (use: ${Object.entries(ALL).filter(([, v]) => v.kind === 'tile-glyph').map(([k]) => k).join(', ')})`);
      }
    }
    const content = document.createElement('div');
    content.className = 'aem-content';
    const badges = kids.filter((n) => n.nodeType === 1 && /^(AEM-BADGE|AEM-STICKER)$/.test(n.tagName) && n.hasAttribute('at'));
    const rest = kids.filter((n) => !badges.includes(n));
    content.append(...rest);
    this.replaceChildren(wrap, content, ...badges);
  }
}

// ---------------------------------------------------------------------- badge
// <aem-badge at="tr" icon="calendar"></aem-badge>   <aem-badge at="bl" emoji>🔑</aem-badge>
class AemBadge extends AemElement {
  render() {
    const icon = this.getAttribute('icon');
    if (icon) {
      const defaults = { calendar: 'var(--olive-ink)', 'gear-badge': 'var(--lime-ink)' };
      const iconEl = document.createElement('div');
      iconEl.className = 'aem-icon';
      iconEl.style.cssText = 'display:flex;align-items:center;justify-content:center;';
      iconEl.innerHTML = iconSVG(icon);
      if (defaults[icon] && !this.style.getPropertyValue('--badge-ink') && (!this.getAttribute('tone') || this.getAttribute('tone') === 'lime')) this.style.color = defaults[icon];
      this.replaceChildren(iconEl);
    }
  }
}

// ---------------------------------------------------------------------- sticker
class AemSticker extends AemElement {
  render() {
    const a = attr(this, 'line1', 'universal');
    const b = attr(this, 'line2', 'editor');
    const e = attr(this, 'emoji', '✏️');
    this.innerHTML = `<span class="l1">${a}</span><span class="l2">${e ? `<span class="aem-emoji">${e}</span>` : ''}<span>${b}</span></span>`;
  }
}

// ---------------------------------------------------------------------- browser
function wireframe() {
  const el = document.createElement('div');
  el.className = 'aem-wire';
  el.innerHTML = `
    <div class="nav"><span class="logo"></span><span class="link"></span><span class="link"></span><span class="link"></span></div>
    <div class="cta-top"></div>
    <div class="lines"><span></span><span></span><span></span><span></span></div>
    <div class="button"></div>
    <div class="media">${iconSVG('image-placeholder')}</div>
    <div class="panel"></div>`;
  return el;
}

class AemBrowser extends AemElement {
  render() {
    const kids = [...this.childNodes];
    const bar = document.createElement('div');
    bar.className = 'aem-bar';
    bar.innerHTML = '<i></i><i></i><i></i>';
    const body = document.createElement('div');
    body.className = 'aem-body';
    body.append(...kids);
    const empty = !kids.some((n) => n.nodeType === 1);
    if (this.getAttribute('tone') === 'site' && empty) body.append(wireframe());
    this.replaceChildren(bar, body);
  }
}

// ---------------------------------------------------------------------- word wall
// <aem-wordwall words="TLS,HTTPS,DNS,CDN,QUIC,URL,URI,API" rows="7"></aem-wordwall>
class AemWordwall extends AemElement {
  render() {
    const words = attr(this, 'words', 'TLS,HTTPS,DNS,CDN,QUIC,URL,URI,API').split(',').map((s) => s.trim()).filter(Boolean);
    const rows = Number(attr(this, 'rows', 7));
    const sep = attr(this, 'sep', ' · ');
    const out = [];
    for (let r = 0; r < rows; r += 1) {
      const seq = [];
      for (let i = 0; i < words.length * 3; i += 1) seq.push(words[(i + r * 3) % words.length]);
      const shift = -((r * 137) % 260) - 40;
      out.push(`<div style="--shift:${shift}px">${seq.join(sep)}</div>`);
    }
    this.innerHTML = out.join('');
  }
}

// ---------------------------------------------------------------------- bolts wallpaper
class AemBolts extends AemElement {
  render() {
    const id = nextId('bolt');
    const c = attr(this, 'color', 'rgb(120 136 80 / .5)');
    const s = Number(attr(this, 'cell', 54)); // horizontal period (px)
    const k = s / 46;
    // Chunky "Z" bolt with parallel slanted strokes.
    // Taller than the row period so rows nest (deck p91).
    this.innerHTML = `<svg xmlns="${SVGNS}" preserveAspectRatio="none"><defs><pattern id="${id}" width="${s}" height="${44 * k}" patternUnits="userSpaceOnUse" patternTransform="translate(${-8 * k} ${-6 * k})">
      <path fill="${c}" transform="scale(${k})" d="M22 0H44L31 19H46L12 54L21 28H6Z"/><path fill="${c}" transform="translate(0 ${44 * k}) scale(${k})" d="M22 0H44L31 19H46L12 54L21 28H6Z"/><path fill="${c}" transform="translate(0 ${-44 * k}) scale(${k})" d="M22 0H44L31 19H46L12 54L21 28H6Z"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  }
}

// ---------------------------------------------------------------------- shapes
const SHAPES = {
  hexagon: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]],
  pentagon: [[50, 0], [100, 36.3], [81, 95], [19, 95], [0, 36.3]],
  octagon: [
    [29.3, 0], [70.7, 0], [100, 29.3], [100, 70.7],
    [70.7, 100], [29.3, 100], [0, 70.7], [0, 29.3],
  ],
  diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
  triangle: [[50, 0], [100, 100], [0, 100]],
};
const SHAPE_TONES = {
  lavender: ['#bfc1f6', '#6870ec', '#6870ec'], // DNS hexagon (p55)
  olive: ['#8d9c58', '#d6e98a', '#788850'], // aem.live pentagon (p96)
  lime: ['#e1fa82', '#f6fede', '#ddf681'],
  pink: ['#f0b2f2', '#fff0ff', '#efbde8'],
  periwinkle: ['#8e94f2', '#6870ec', '#5a62e0'],
  ink: ['#000', '#000', '#fff'],
  white: ['#fff', '#fff', '#e6eff9'],
};
class AemShape extends AemElement {
  render() {
    const kind = attr(this, 'kind', 'hexagon');
    const tone = attr(this, 'tone', 'lavender');
    const [a, b, line] = SHAPE_TONES[tone] ?? SHAPE_TONES.lavender;
    const pts = kind === 'circle' ? null : (SHAPES[kind] ?? SHAPES.hexagon);
    const id = nextId('shape');
    const vb = kind === 'hexagon' ? '0 0 100 86.6' : '0 0 100 100';
    const sy = kind === 'hexagon' ? 0.866 : 1;
    if (kind === 'hexagon' && !this.style.getPropertyValue('--ratio')) this.style.setProperty('--ratio', '100 / 86.6');
    const geom = pts
      ? `<polygon points="${pts.map(([x, y]) => `${x},${y * sy}`).join(' ')}"`
      : '<circle cx="50" cy="50" r="50"';
    const grad = tone === 'olive'
      ? `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
      : `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    const svg = `<svg xmlns="${SVGNS}" viewBox="${vb}" preserveAspectRatio="none"><defs>${grad}</defs>${geom} fill="url(#${id})" stroke="${line}" stroke-width="${attr(this, 'line-width', 0.6)}" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
    const kids = [...this.childNodes];
    const tpl = document.createElement('template');
    tpl.innerHTML = svg;
    this.replaceChildren(tpl.content.firstChild, ...kids);
  }
}

// ---------------------------------------------------------------------- prohibition sign
class AemNo extends AemElement {
  render() {
    const c = attr(this, 'color', 'var(--red)');
    this.innerHTML = `<svg xmlns="${SVGNS}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44.6" fill="none" stroke="${c}" stroke-width="10.75"/><path d="M19.5 80.5 80.5 19.5" stroke="${c}" stroke-width="10.75"/></svg>`;
  }
}

// ---------------------------------------------------------------------- quadrant
class AemQuadrant extends AemElement {
  render() {
    const xl = attr(this, 'x-label', 'Cost of testing');
    const yl = attr(this, 'y-label', 'Impact of errors');
    const kids = [...this.children];
    this.insertAdjacentHTML('beforeend', `<div class="aem-axis y"></div><div class="aem-axis x"></div>
      <div class="aem-axis-label x">${xl}</div><div class="aem-axis-label y">${yl}</div>`);
    kids.forEach((k) => k.setAttribute('flat', ''));
  }
}

// ---------------------------------------------------------------- app icons (vector re-creations)
// kind="aem"        black squircle + iridescent Adobe "A" (deck p1)
// kind="face"       iridescent squircle + | _ | face (deck p12)
// kind="face-dark"  black squircle + gradient bars (deck p30)
// kind="terminal"   black squircle + "$ aem" prompt (deck p31)
const SQ = () => ALL['@squircle'].d;
class AemAppIcon extends AemElement {
  render() {
    const kind = attr(this, 'kind', 'aem');
    const g = nextId('app');
    const a = ALL.adobe;
    let inner = '';
    if (kind === 'aem') {
      // A glyph is 100×89.9 → place at 56% width, centred
      inner = `
        <defs>
          <linearGradient id="${g}-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#e8f53a"/><stop offset=".3" stop-color="#f8c5f8"/>
            <stop offset=".62" stop-color="#d7a6f6"/><stop offset="1" stop-color="#5f63f5"/>
          </linearGradient>
          <radialGradient id="${g}-w" cx=".2" cy=".95" r=".6"><stop offset="0" stop-color="#f4f2ff"/><stop offset=".55" stop-color="#cfd0ff" stop-opacity=".7"/><stop offset="1" stop-color="#cfd0ff" stop-opacity="0"/></radialGradient>
          <radialGradient id="${g}-b" cx=".85" cy=".95" r=".5"><stop offset="0" stop-color="#5b5ff6"/><stop offset="1" stop-color="#5b5ff6" stop-opacity="0"/></radialGradient>
          <radialGradient id="${g}-y" cx=".28" cy=".08" r=".38"><stop offset="0" stop-color="#e3f21c"/><stop offset="1" stop-color="#e3f21c" stop-opacity="0"/></radialGradient>
        </defs>
        <path d="${SQ()}" fill="#000"/>
        <g transform="translate(21 20.5) scale(.58)">
          <path d="${a.d}" fill="url(#${g}-base)"/><path d="${a.d}" fill="url(#${g}-w)"/><path d="${a.d}" fill="url(#${g}-b)"/><path d="${a.d}" fill="url(#${g}-y)"/>
        </g>`;
    } else if (kind === 'face') {
      inner = `
        <defs>
          <linearGradient id="${g}-1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e1f42c"/><stop offset=".35" stop-color="#f6c4f6"/><stop offset=".7" stop-color="#d6c4fa"/><stop offset="1" stop-color="#5b60f3"/></linearGradient>
          <radialGradient id="${g}-2" cx=".18" cy=".95" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#eef" stop-opacity=".6"/><stop offset="1" stop-color="#eef" stop-opacity="0"/></radialGradient>
          <radialGradient id="${g}-3" cx="1" cy=".1" r=".6"><stop offset="0" stop-color="#f6b8f6"/><stop offset="1" stop-color="#f6b8f6" stop-opacity="0"/></radialGradient>
        </defs>
        <path d="${SQ()}" fill="url(#${g}-1)"/><path d="${SQ()}" fill="url(#${g}-2)"/><path d="${SQ()}" fill="url(#${g}-3)"/>
        <rect x="16.3" y="26.5" width="9.6" height="42" rx="4.8" fill="#000"/>
        <rect x="74.2" y="26.5" width="9.6" height="42" rx="4.8" fill="#000"/>
        <rect x="42.5" y="72" width="15" height="3.6" rx="1.8" fill="#000"/>`;
    } else if (kind === 'face-dark') {
      inner = `
        <defs>
          <linearGradient id="${g}-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e1fa82"/><stop offset=".6" stop-color="#f1f8d0"/><stop offset="1" stop-color="#f6f2ff"/></linearGradient>
          <linearGradient id="${g}-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7c2f7"/><stop offset=".5" stop-color="#e6aef4"/><stop offset="1" stop-color="#a99af7"/></linearGradient>
        </defs>
        <path d="${SQ()}" fill="#000"/>
        <rect x="14.5" y="30.5" width="8.5" height="36" rx="4.25" fill="url(#${g}-l)"/>
        <rect x="76.5" y="30.5" width="8.5" height="36" rx="4.25" fill="url(#${g}-r)"/>`;
    } else if (kind === 'terminal') {
      inner = `<path d="${SQ()}" fill="#000"/>
        <text x="16" y="62" font-family="Andale Mono, Source Code Pro, Menlo, monospace" font-size="27" fill="#61d836">$</text>
        <text x="35" y="62" font-family="Andale Mono, Source Code Pro, Menlo, monospace" font-size="27" letter-spacing="2" fill="#d5d5d5">aem</text>`;
    }
    this.innerHTML = `<svg xmlns="${SVGNS}" viewBox="0 0 100 100">${inner}</svg>`;
  }
}

// ---------------------------------------------------------------------- glass rings (deck p7)
class AemRings extends AemElement {
  render() {
    const g = nextId('ring');
    this.innerHTML = `<svg xmlns="${SVGNS}" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="${g}-a" x1=".1" y1=".1" x2=".85" y2=".95"><stop offset="0" stop-color="#e1fa82" stop-opacity=".95"/><stop offset=".5" stop-color="#cfdfa5" stop-opacity=".75"/><stop offset="1" stop-color="#b9bdf0" stop-opacity=".35"/></linearGradient>
        <linearGradient id="${g}-b" x1=".85" y1=".9" x2=".15" y2=".1"><stop offset="0" stop-color="#e1fa82" stop-opacity=".95"/><stop offset="1" stop-color="#e8eedc" stop-opacity=".85"/></linearGradient>
        <linearGradient id="${g}-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e1fa82"/><stop offset="1" stop-color="#eef0e4"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="49.7" fill="url(#${g}-a)" stroke="#e1fa82" stroke-width=".25"/>
      <circle cx="50" cy="50" r="34.7" fill="url(#${g}-b)" stroke="#e1fa82" stroke-width=".25"/>
      <circle cx="50" cy="50" r="18.2" fill="url(#${g}-c)" stroke="#e1fa82" stroke-width=".35"/>
    </svg>`;
  }
}

// ---------------------------------------------------------------------- register
const ELEMENTS = {
  'aem-slide': AemSlide,
  'aem-icon': AemIcon,
  'aem-logo': AemLogo,
  'aem-tile': AemTile,
  'aem-badge': AemBadge,
  'aem-sticker': AemSticker,
  'aem-browser': AemBrowser,
  'aem-wordwall': AemWordwall,
  'aem-bolts': AemBolts,
  'aem-shape': AemShape,
  'aem-no': AemNo,
  'aem-quadrant': AemQuadrant,
  'aem-appicon': AemAppIcon,
  'aem-rings': AemRings,
};
Object.entries(ELEMENTS).forEach(([tag, cls]) => {
  if (!customElements.get(tag)) customElements.define(tag, cls);
});

// ---------------------------------------------------------------------- page setup + ready signal
const params = new URLSearchParams(window.location.search);
const scale = Number(params.get('scale') || 1);
if (scale !== 1) document.documentElement.style.zoom = String(scale);
if (params.has('preview')) document.documentElement.classList.add('aem-preview');

function lintRaster() {
  const bad = [...document.querySelectorAll('img, picture, canvas, video, image, [style*="url("]')]
    .filter((el) => {
      if (/^(IMG|PICTURE|CANVAS|VIDEO)$/.test(el.tagName)) return true;
      if (el.tagName.toLowerCase() === 'image') return true;
      const s = el.getAttribute('style') || '';
      return /url\((?!\s*["']?(#|data:image\/svg\+xml))/.test(s);
    });
  if (bad.length) console.error('[aem] raster content is not allowed in slides:', bad);
  return bad.length;
}

window.aemReady = (async () => {
  await customElements.whenDefined('aem-slide');
  // no requestAnimationFrame here: export tabs may be hidden, where rAF never fires
  await new Promise((r) => { setTimeout(r, 30); });
  await document.fonts.ready;
  const raster = lintRaster();
  document.documentElement.dataset.ready = raster ? 'raster' : '1';
  return document.documentElement.dataset.ready;
})();
