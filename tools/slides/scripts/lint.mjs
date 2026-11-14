#!/usr/bin/env node
// Static "no raster" check for the slide sources.
//   node scripts/lint.mjs            # slides/ reference/ lib/ + root html
//   node scripts/lint.mjs slides/x.html
// Fails (exit 1) on <img>, <picture>, <canvas>, <video>, SVG <image>, raster
// file references (.png .jpg .jpeg .gif .webp .avif .bmp .tif) and raster data: URLs.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { ROOT } from './serve.mjs';

const RULES = [
  [/<\s*(img|picture|canvas|video)\b/i, 'raster element'],
  [/<\s*image\b/i, 'SVG <image> (embeds a bitmap)'],
  [/data:image\/(?!svg\+xml)[a-z]+/i, 'raster data: URL'],
  [/["'(\s]?[^"'()\s]+\.(png|jpe?g|gif|webp|avif|bmp|tiff?)\b(?!\s*[-:]?\s*(export|output))/i, 'raster file reference'],
];
const EXT = /\.(html|css|js|mjs|svg)$/;

async function walk(p, out = []) {
  const s = await stat(p);
  if (s.isDirectory()) for (const f of await readdir(p)) await walk(join(p, f), out);
  else if (EXT.test(p)) out.push(p);
  return out;
}

const targets = process.argv.slice(2);
const files = [];
if (targets.length) for (const t of targets) await walk(t, files);
else {
  for (const d of ['slides', 'reference', 'lib']) await walk(join(ROOT, d), files).catch(() => {});
  for (const f of ['index.html', 'catalog.html']) files.push(join(ROOT, f));
}

let bad = 0;
for (const f of files) {
  const lines = (await readFile(f, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    // comments that merely talk about formats are fine; the code below them is what counts
    const code = line.replace(/\/\/.*$|\/\*.*?\*\/|<!--.*?-->/g, '');
    for (const [re, why] of RULES) {
      if (re.test(code)) {
        bad += 1;
        console.error(`${relative(ROOT, f)}:${i + 1}: ${why}\n    ${line.trim().slice(0, 160)}`);
        break;
      }
    }
  });
}
if (bad) { console.error(`\n✗ ${bad} raster reference(s). Slides must be pure HTML/CSS/SVG.`); process.exit(1); }
console.log(`✓ ${files.length} files, no raster content`);
