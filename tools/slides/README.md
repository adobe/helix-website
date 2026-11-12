# AEM Live slides (`tools/slides`)

The art style of *AEM Live Backgrounds Megadeck* (Keynote, 177 pages, 4096×3072), rebuilt as code:

- Backgrounds, grids, checker patterns, app-icon tiles, badges, cards, shapes and icons are all
  **HTML, CSS and SVG**. The repo contains no raster images.
- Slides are single HTML files built from those components, so a coding agent can write new ones.
- `playwright-cli` exports them to PNG.

```bash
node scripts/serve.mjs          # gallery at http://127.0.0.1:4173/ and /catalog.html
node scripts/export.mjs         # slides/*.html → exports/*.png (2048×1536)
node scripts/export.mjs --scale 4 01-title    # one slide at 4096×3072
node scripts/lint.mjs           # fails on any raster content
```

There are no dependencies beyond Node ≥ 20 and `playwright-cli` on PATH (or set `PLAYWRIGHT_CLI`).
Run the commands from `tools/slides/`. *Adobe Clean* and *Source Code Pro* come from the site's
`/fonts` folder. The gallery is static-host friendly (it falls back to `manifest.json`), so it also
works at https://www.aem.live/tools/slides/index.html.

## Layout

```
lib/aem-live.css      tokens, 21 backgrounds, grids, patterns, every component's styles
lib/aem-live.js       custom elements (<aem-slide>, <aem-tile>, <aem-badge>, …), ready signal, raster lint
lib/icons.js          vector paths extracted from the deck (generated)
lib/icons-custom.js   hand-drawn icons in the same style
slides/               your slides (_template.html is the starting point)
manifest.json         slide list for the gallery on static hosts (written by export.mjs)
reference/            57 deck pages recreated in code, named pNNN-… after the deck page
scripts/              serve.mjs · export.mjs (playwright-cli) · lint.mjs
tools/extract/        the PDF → SVG → icon extraction and comparison tooling
index.html            gallery of slides/ and reference/
catalog.html          every background, tone, checker and icon with its name
AGENTS.md             how to make slides: rules, style guide, component reference
```

See **[AGENTS.md](AGENTS.md)** for the full guide.
