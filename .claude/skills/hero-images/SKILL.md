---
name: Creating Hero Images
description: Create hero images, og:images or slides for www.aem.live pages (docs, blog, developer guides) in the AEM Live "Backgrounds Megadeck" art style. Everything is code (HTML/CSS/SVG, no raster) in tools/slides, exported to PNG with playwright-cli. Use this skill whenever someone asks for a hero image, header illustration, meta image, slide or visual for an aem.live page.
---

# Creating Hero Images

## Overview

`tools/slides/` is a slide factory. Slides are single HTML files built from custom elements:

- backgrounds, grids and checker patterns
- app-icon tiles, corner badges and cards
- shapes and icons

All of them reproduce the art style of the AEM Live Backgrounds Megadeck. `scripts/export.mjs`
renders a slide with `playwright-cli` and writes a 4:3 PNG. The aem.live docs heroes are 4:3 as well.

The full rules, style guide and component reference are in `tools/slides/AGENTS.md`.
**Read it before writing a slide.**

## When to Use This Skill

- "Make a hero image for https://www.aem.live/developer/…"
- "We need an og:image / header graphic / illustration for this blog post"
- "Make a slide that explains X in the AEM Live style"

## Requirements

- Node ≥ 20
- `playwright-cli` on PATH, or `PLAYWRIGHT_CLI=/path/to/playwright-cli`

## Workflow

1. **Understand the page.** Fetch the content: `curl -s https://www.aem.live/<path>.plain.html`.
   Note the one idea a reader should take away.
2. **Pick a concept.** The deck's grammar is one centred hero object with plenty of background
   around it, plus a round badge on its corner. Map the page's idea onto that:
   - **Thing + modifier.** A tile with a glyph (lock, gear, webhook, …) and a badge or emoji
     that adds the twist. Examples: `reference/p013-lock-pencil.html`, `p017-night-lock-globe.html`.
   - **A → B flow.** Two tiles joined by a wedge. Example: `reference/p027-html-json.html`.
   - **Concrete artifact.** A card with a real code or JSON snippet, a logo or a wordmark.
     Examples: `p066-fastly.html`, `slides/webhook-c-payload.html`.
   - **Big word or number.** Examples: `p036-unsupported.html`, `p054-bubbles.html`, `p055-dns.html`.

   Unless asked for one, make **three variants** that differ in concept *and* background. Pick
   the closest reference slide for each.
3. **Write the slides.** From `tools/slides/`:
   ```bash
   cp slides/_template.html slides/<topic>-a-<idea>.html
   ```
   - Use only components, tokens and icons from `lib/`. The icon list is at `catalog.html`.
   - If an icon is missing, draw it in `lib/icons-custom.js` in the same chunky flat style.
     MIT/Apache-licensed geometry is fine with attribution in a comment.
   - **No raster images, ever.** That includes `<img>`, `<canvas>`, SVG `<image>`,
     `.png`/`.jpg` URLs and `data:image/png`.
4. **Lint and export.**
   ```bash
   node scripts/lint.mjs
   node scripts/export.mjs <topic>          # → exports/<topic>-*.png, 2048×1536
   node scripts/export.mjs --scale 4 <topic>   # 4096×3072 if needed
   ```
   Every line must read `✓ name.png 2048×1536`. A `✗` or `!` line means it failed.
5. **Look at every PNG.** Check that:
   - nothing is clipped
   - badges sit on corners
   - text fits and is legible when scaled down to 750px wide
   - there are no red unknown-icon boxes
   - it looks like it belongs next to the reference slide
6. **Deliver.** Give the user the PNG paths, or a served preview:
   - Run `node scripts/serve.mjs` and open `/slides/<name>.html?preview`.
   - PNGs are content: the author uploads the chosen one to the page.
   - **Do not commit PNGs.** Commit the slide HTML (and any new icons or components) so the
     image can be regenerated.
7. Before opening a PR, run the repo's `npm run lint`. `tools/slides/lib/*.js` is linted with
   the rest of the site.

## Tips

- One idea per image. If you need a caption to explain it, the concept is too complicated.
- Recreations of pages from the original deck are named after the deck page (`reference/pNNN-*`).
  Copy their positions and sizes rather than eyeballing new ones.
- Text on heroes is rare. If you need it, put it on an `<aem-card>` or use `.aem-text`
  (see AGENTS.md → Text).
