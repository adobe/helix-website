#!/usr/bin/env node
// Tiny static file server for the slide system (no dependencies).
//   node scripts/serve.mjs [--port 4173]
// Also serves GET /api/slides → JSON list of slides/*.html (used by index.html).
import http from 'node:http';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// When this lives in adobe/helix-website (tools/slides), the site's /fonts are two levels up.
const FONT_DIRS = [join(ROOT, 'fonts'), resolve(ROOT, '..', '..', 'fonts')];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

export async function listSlides(dir = 'slides') {
  const abs = join(ROOT, dir);
  const files = (await readdir(abs)).filter((f) => f.endsWith('.html') && !f.startsWith('_')).sort();
  const out = [];
  for (const f of files) {
    const html = await readFile(join(abs, f), 'utf8');
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? f;
    out.push({ file: `${dir}/${f}`, name: f.replace(/\.html$/, ''), title });
  }
  return out;
}

/** Write manifest.json ({ slides, reference }) so the gallery also works without this server. */
export async function writeManifest() {
  const out = {};
  for (const dir of ['slides', 'reference']) out[dir] = await listSlides(dir).catch(() => []);
  await writeFile(join(ROOT, 'manifest.json'), `${JSON.stringify(out, null, 2)}\n`);
  return out;
}

export function startServer(port = 0) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      if (url.pathname === '/api/slides') {
        const dir = url.searchParams.get('dir') || 'slides';
        res.writeHead(200, { 'content-type': TYPES['.json'], 'cache-control': 'no-store' });
        res.end(JSON.stringify(await listSlides(dir)));
        return;
      }
      let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
      if (p.endsWith('/')) p += 'index.html';
      let file = join(ROOT, p);
      if (p.startsWith('/fonts/')) {
        const name = p.slice('/fonts/'.length);
        const hits = await Promise.all(FONT_DIRS.map((d) => stat(join(d, name)).then(() => join(d, name), () => null)));
        file = hits.find(Boolean) ?? file;
      } else if (!file.startsWith(ROOT)) throw Object.assign(new Error('forbidden'), { code: 'EACCES' });
      const s = await stat(file);
      if (s.isDirectory()) { res.writeHead(302, { location: `${url.pathname}/` }); res.end(); return; }
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(await readFile(file));
    } catch (e) {
      res.writeHead(e.code === 'ENOENT' ? 404 : 500, { 'content-type': 'text/plain' });
      res.end(String(e.message));
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--port');
  const port = i > 0 ? Number(process.argv[i + 1]) : 4173;
  const server = await startServer(port);
  console.log(`AEM Live slides → http://127.0.0.1:${server.address().port}/`);
}
