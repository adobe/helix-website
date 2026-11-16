#!/usr/bin/env node
// Export slides to PNG with playwright-cli.
//
//   node scripts/export.mjs                         # every slides/*.html → exports/*.png at scale 2 (2048×1536)
//   node scripts/export.mjs slides/p013-lock-pencil.html   # one slide (path)
//   node scripts/export.mjs p013 p017                       # slides by name prefix
//   node scripts/export.mjs --scale 4               # 4096×3072, same pixel size as the original Keynote deck
//   node scripts/export.mjs --out /tmp/pngs --dir slides
//
// Requires `playwright-cli` on PATH (or PLAYWRIGHT_CLI=/path/to/playwright-cli).
// The script starts its own static server on a random port, opens one tab in a
// private playwright-cli session, renders each slide with ?scale=N and takes a
// full-page screenshot (the page is exactly one slide big).
import { execFile } from 'node:child_process';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { startServer, listSlides, writeManifest, ROOT } from './serve.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return dflt;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const scale = Number(opt('scale', process.env.AEM_SCALE ?? 2));
const outDir = resolve(opt('out', join(ROOT, 'exports')));
const dir = opt('dir', 'slides');
const session = opt('session', `aem-slides-${process.pid}`);
const CLI = process.env.PLAYWRIGHT_CLI || 'playwright-cli';

// async on purpose: the static server lives in this process and must keep serving
function pw(...a) {
  return new Promise((ok, fail) => {
    execFile(CLI, [`-s=${session}`, ...a], { encoding: 'utf8', timeout: 120_000 }, (err, stdout, stderr) => {
      const out = `${stdout ?? ''}${stderr ?? ''}`;
      if (err) fail(new Error(`${CLI} ${a.join(' ')} failed (${err.code ?? err.message}):\n${out}`));
      else ok(out);
    });
  });
}

async function pngSize(file) {
  const b = await readFile(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
let slides;
if (args.length) {
  // each argument is a path to an .html file, or a name prefix of a slide in --dir ("p013", "p013-lock-pencil")
  const all = await listSlides(dir);
  slides = [];
  for (const f of args) {
    if (f.endsWith('.html')) {
      slides.push({ file: resolve(f).replace(`${ROOT}/`, ''), name: basename(f).replace(/\.html$/, '') });
      continue;
    }
    const hits = all.filter((s) => s.name.startsWith(basename(f)));
    if (!hits.length) throw new Error(`no slide matches "${f}" in ${dir}/`);
    slides.push(...hits);
  }
} else {
  slides = await listSlides(dir);
}
await mkdir(outDir, { recursive: true });

let opened = false;
let failures = 0;
try {
  for (const s of slides) {
    await stat(join(ROOT, s.file));
    const url = `${base}/${s.file}?scale=${scale}`;
    if (!opened) {
      await pw('open', url);
      opened = true;
      // the full-page capture is max(document, viewport): pin the viewport to the slide size
      await pw('resize', String(Math.round(1024 * scale)), String(Math.round(768 * scale)));
    } else {
      await pw('goto', url);
    }
    const ready = await pw('eval', 'async () => { await window.aemReady; return document.documentElement.dataset.ready; }');
    if (!/"?1"?/.test(ready.trim().split('\n').pop())) {
      console.warn(`! ${s.name}: page reported ${ready.trim()} (raster content or script error?)`);
    }
    const png = join(outDir, `${s.name}.png`);
    const W = Math.round(1024 * scale);
    const H = Math.round(768 * scale);
    await pw('screenshot', '--full-page', '--filename', png);
    let { w, h } = await pngSize(png);
    if (w !== W || h !== H) {
      // the viewport occasionally doesn't take the resize on a fresh session: re-pin and retry once
      await pw('resize', String(W), String(H));
      await pw('reload');
      await pw('eval', 'async () => { await window.aemReady; return 1; }');
      await pw('screenshot', '--full-page', '--filename', png);
      ({ w, h } = await pngSize(png));
    }
    const ok = w === W && h === H;
    if (!ok) failures += 1;
    console.log(`${ok ? '✓' : '✗'} ${s.name}.png  ${w}×${h}${ok ? '' : `  (expected ${1024 * scale}×${768 * scale})`}`);
  }
} finally {
  if (opened) { try { await pw('tab-close'); } catch { /* ignore */ } }
  server.close();
}
await writeManifest();
console.log(`\n${slides.length} slide(s) → ${outDir}`);
process.exit(failures ? 1 : 0);
