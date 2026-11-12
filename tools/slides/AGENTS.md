# AGENTS.md — making AEM Live slides

`tools/slides/` turns the art style of *AEM Live Backgrounds Megadeck* (a Keynote deck with
4096×3072 pages) into a set of **HTML/CSS/SVG** components. Each slide is one HTML file.
`playwright-cli` exports it to PNG. Use it for hero images, `og:image`s and slides for
www.aem.live pages. The repo skill `.claude/skills/hero-images` wraps this workflow.

All commands below run from `tools/slides/`. The gallery is also published at
https://www.aem.live/tools/slides/index.html (it reads `manifest.json`, which `export.mjs` rewrites).

PNGs are content, not code. Hand them to the author (or upload them to the page in the CMS);
never commit them. `exports/` is git-ignored.

## Hard rules

1. **No raster images.** Do not use `<img>`, `<picture>`, `<canvas>`, `<video>`, SVG `<image>`,
   `.png`/`.jpg`/… URLs or `data:image/png`. Everything must be HTML, CSS, inline SVG or emoji text.
   - `scripts/lint.mjs` checks the files statically.
   - At runtime the page also sets `html[data-ready="raster"]`, and the exporter warns when it does.
   - `img`/`canvas`/`video` are `display:none` in the stylesheet.
2. **Slide size is 1024×768 CSS px (4:3).** All coordinates in this file are in that space.
   - Export scale 2 gives 2048×1536, which is the default.
   - Export scale 4 gives 4096×3072, the same as the original deck.
3. **Each file has exactly one `<aem-slide>`.** It must load `../lib/aem-live.css` and `../lib/aem-live.js`.
4. Use the components and tokens from `lib/`. Don't invent new colours or shadows. If something is
   missing, add it to `lib/` (see *Extending*) so the next slide can reuse it.
5. **Look at your export.** Open the PNG after every export and compare it with the closest
   reference slide (`reference/pNNN-*.html`, where NNN is the page number in the original deck).

## Workflow

```bash
cp slides/_template.html slides/05-my-topic.html     # files starting with _ are ignored
# edit …
node scripts/lint.mjs slides/05-my-topic.html        # no-raster check
node scripts/export.mjs 05                           # → exports/05-my-topic.png (2048×1536)
node scripts/export.mjs --scale 4 05                 # → 4096×3072
node scripts/export.mjs                              # every slides/*.html
node scripts/export.mjs --dir reference --out exports/reference   # the reference set
node scripts/serve.mjs                               # http://127.0.0.1:4173/ gallery + /catalog.html
```

How `scripts/export.mjs` works:

- It starts its own static server. playwright-cli refuses `file://` URLs.
- It opens one playwright-cli session and resizes the viewport to 1024·scale × 768·scale.
- For each slide it loads `?scale=N` (CSS zoom), waits for `window.aemReady`, takes a full-page
  screenshot and checks the PNG size.
- Arguments can be `.html` paths or slide-name prefixes.
- Options:
  - `--scale N`
  - `--out DIR`
  - `--dir slides|reference`
  - `--session NAME`
- Set `PLAYWRIGHT_CLI=/path/to/playwright-cli` if the binary is not on PATH. It normally lives at
  `~/.local/bin/playwright-cli`.
- If playwright-cli reports *"no debugger is connected"*, re-run the export. Each run uses a fresh session.

For a quick look in a browser, add `?preview` to the URL (dark surround) and `?scale=0.5` to shrink.

## Layout model

```html
<aem-slide bg="sorbet" grid="large">            <!-- background + optional grid -->
  <aem-checker tone="olive" style="left:0; top:0; width:41.2%; height:100%"></aem-checker>  <!-- layer -->
  <aem-tile tone="white" style="--x:512px; --y:384px">  <!-- object, centred on (--x, --y) -->
    <aem-icon name="github" style="--size:256px; color:var(--github)"></aem-icon>
    <aem-badge at="tr" icon="gear-badge"></aem-badge>   <!-- sticks to the tile's corner -->
  </aem-tile>
</aem-slide>
```

- **Objects.** Every direct child of `<aem-slide>` is absolutely positioned and **centred** on
  `--x`/`--y`, which default to `50%`/`50%`. `--rotate` is also available.
- **Layers.** These are not centred: `aem-checker`, `aem-bolts`, `aem-wordwall`, `aem-backtext`,
  `aem-blob` and `aem-layer`.
  - Place `aem-checker`, `aem-bolts`, `aem-wordwall` and `aem-layer` with ordinary
    `left/top/right/bottom/width/height/inset`.
  - `aem-blob` uses `--x/--y/--size`.
- **Stacking order:**
  - background
  - grid (`z-index:0`)
  - layers (`z-index:1`)
  - objects (`z-index:2`)
  - `aem-no` (`z-index:4`) and `aem-backtext[front]` (`z-index:5`)
  - If you need a different order, set `z-index` inline.
- **Knobs that do not inherit.** `--x --y --size --w --h --r --fill --ring --pad --gap --rotate
  --inset --icon --ink --color --ratio` are registered with `inherits:false`. A tile's `--size`
  therefore never leaks into the badge on it. Set each knob **on the element it belongs to**.
- Text inside a slide is just HTML. Wrap it in `<div class="aem-text">` (see Text below).

## The style

Read these off the reference slides; they are the deck's grammar.

- **One hero, centred.** Most slides have a single object in the middle: a 352px app-icon *tile*,
  a 709×352 *card*, a big icon or a shape. Leave plenty of empty background around it.
- **A badge on the corner.** A 154px round sticker overlaps the hero's top-right corner
  (`at="tr"`), or bottom-left for emoji badges on tiles (`at="bl"`). It carries a small glyph
  (gear, calendar, padlock) or one emoji.
- **Backgrounds.** Each one is either a soft multi-stop gradient (aurora, sorbet, prism, dawn…) or
  a flat colour with a hairline **grid** (lime, lavender, grey, night, periwinkle).
  - `twilight` and `pink` use `grid="fine" seams`.
- **Pattern blocks.** The *tall-cell checker* is cut into hard-edged rectangles anchored to the
  slide edges. Typical blocks:
  - a 41% left column (lime/olive, p70, p96–99)
  - a top-right band starting at 40% (dawn/graphite, p65, p101)
  - two opposite corners (iris/violet, p60)
  - a bottom-right block (candy/mauve, p83)
  - The hero overlaps the block.
- **Depth.**
  - One consistent drop shadow (`--shadow`, `--drop`).
  - Tiles and cards use continuous "squircle" corners (`corner-shape: superellipse`).
  - The slide itself has 22px rounded corners, which the deck has too. Use `corners="square"`
    to turn them off.
- **Palette** (from `:root` in `lib/aem-live.css`):
  - lime `#e1fa82`, pink `#f0b2f2`, periwinkle `#6870ec`, lavender `#e8eaff`
  - graphite `#5e5e5e` (text and tiles), yellow `#f5e66b`, grey `#d4d4d4`
  - checker darks olive `#788850`, violet `#565086`, mauve `#806488`
  - brand reds/blues only for logos
- **Type.**
  - The font is *Adobe Clean*, loaded from the site's `/fonts` (with Source Sans fallbacks).
    `serve.mjs` maps `/fonts/` to the repo's `fonts/` folder.
  - Big words are 900 weight (`aem-backtext`, `aem-bubble`, `aem-shape`).
  - Captions are 700 graphite. Quotes are 400 italic.
  - Monospace is used for code and branch names.
- **Emoji are welcome** as glyphs on badges and in cards (✏️ 🔑 🌐 ☁️ 🎉 🙏 👀 👍 ✅). They are text,
  not images.

## Reference: `<aem-slide>`

| attribute    | values |
|--------------|--------|
| `bg`         | `aurora` `sorbet` `twilight` `lavender` `night` `periwinkle` `meadow` `dawn` `blush` `candy` `pink` `lime` `yellow` `grey` `iris` `prism` `ember` `tide` `dusk` `white` `ink` |
| `grid`       | `fine` (21px) · `medium` (31px) · `large` (37px) |
| `grid-tone`  | *(default: multiply dark)* · `light` · `ink` · `glow` |
| `seams`      | adds the long cross-lines (`--seam-x` 66%, `--seam-y` 79.6%) |
| `corners`    | `square` turns off the rounded slide corners |
| style vars   | `--bg` replaces the background entirely; `--grid-line` changes the grid colour |

Which deck pages each background comes from:

| bg | deck pages |
|----|------------|
| aurora | 1–3, 6 |
| sorbet | 12–16, 25, 27, 106 |
| twilight | 9, 11, 26, 120 |
| lavender | 22–24, 66, 67 |
| night | 17, 18, 30–32 |
| periwinkle | 7, 69, 153 |
| meadow | 33 |
| dawn | 35, 65, 101 |
| blush | 21, 80 |
| candy | 83 |
| pink | 36 |
| lime | 46–50, 70, 90–99 |
| yellow | 8 |
| grey | 19, 54–57 |
| iris | 60, 62 |
| prism | 105 |
| ember | 10 |
| tide | 39 |
| dusk | 38 |

## Reference: components

| element | attributes / knobs | deck |
|---------|--------------------|------|
| `<aem-tile>` app-icon squircle | `tone` = `graphite ink silver steel black white lime pink periwinkle glass`. `glyph` = `lock` or `gear` (cut out of the tile). `--size` (default 352px), `--fill`. Children are centred; `<aem-badge at>` children stick to the corners. | 13–32, 65, 90, 99 |
| `<aem-card>` rounded panel | `tone` = `white glass frost lime pink lavender`, `flat`, `align="start"`. `--w --h --r --pad --gap --fill`, `--card-shadow`. Flex column, centred. | 33, 66–70, 83, 97, 105 |
| `<aem-badge>` round sticker | `at` = `tr tl br bl` (inside a tile or card) or free with `--x/--y`. `tone` = `lime pink lavender night grey white solid-lime glass`. `icon="name"` or `emoji` + text content. `--size` (154px), `--icon` (glyph %, default 38%), `--inset`, `--fill`, `--ring`, `--badge-ink`. | 13–23, 65–67, 90, 105 |
| `<aem-icon>` | `name`, `--size`, `color`, `shadow`, `fill="glass\|glass-pink\|glass-white"` (lime-glass gradient like the p120 gears) | everywhere |
| `<aem-logo name="discord">` | icon + wordmark lockup, `--size` = width | 105, 153 |
| `<aem-appicon>` | `kind` = `aem` (black + iridescent A), `face`, `face-dark`, `terminal`. `--size`. | 1, 12, 30, 31, 69 |
| `<aem-checker>` | `tone` = `olive violet mauve graphite plum glass glass-lime`. `cell` = `s` (default) `m` `l`. Position with `left/top/width/height`. | 60, 65, 70, 83, 96–105 |
| `<aem-bolts>` | lightning wallpaper layer, `color`, `cell` | 91 |
| `<aem-wordwall words="A,B,C">` | `rows`, `sep`, `--wall-size`, `--wall-color` | 2 |
| `<aem-backtext>` | one huge uppercase word behind the hero. `front` puts it in front; `shadow`; `--size`, `--y`. | 1, 36 |
| `<aem-blob>` | translucent disc, `--x --y --size --fill` | 46–50 |
| `<aem-layer>` | plain rectangle for custom fills or dimming. Give it `background` and a position. | 62, 153 |
| `<aem-bubble>` | big number disc, `tone` = `periwinkle pink lime`, `--size` | 54, 91 |
| `<aem-shape>` | `kind` = `hexagon pentagon octagon diamond triangle circle`. `tone` = `lavender olive lime pink periwinkle ink white`. `shadow`, `--size`, `--ink`. Text content. `.strike` span for a crossed-out line. | 55, 96 |
| `<aem-no>` | red prohibition sign, `--size`, `color` | 36, 62 |
| `<aem-browser>` | `tone` = `site` (with default wireframe) `paper` `dark` `sheet`. Custom content goes inside a `.aem-wire` div (see p047/p050). | 46–50 |
| `<aem-sticker>` | "universal ✏️ editor" round label. `line1 line2 emoji`, `tone` = `lime grey clear pink`, `at`, `--size` | 47, 70 |
| `<aem-quote>` | `--w --size --ink`, optional `<cite>` | 93 |
| `<aem-quadrant>` | 2×2 of `<aem-card>`s with axes, `x-label y-label` | 94 |
| `<aem-rings>` | concentric lime-glass rings, `--size` | 7 |

Helpers for text inside cards:

- `.aem-title` (46px; `<small>` for a sub-line)
- `.aem-caption` (34px bold)
- `.aem-label`, `.aem-small`, `.aem-mono`
- `.aem-code` (the `<html>` tile text; wrap the bold part in `<b>`)
- `.emoji`
- `.row` and `.col` (flex with `--gap`)
- `.aem-fineprint` (attribution line, bottom-right)

### Text

The original deck is mostly backgrounds, so titles and copy use these classes:

```html
<div class="aem-text on-dark shadow" style="--y:450px; --w:900px">  <!-- class "left" to left-align -->
  <p class="aem-kicker">Section</p>
  <h1 class="aem-h1">Edge Delivery Services</h1>    <!-- 96px/900 -->
  <p class="aem-lead">Fast by default.</p>           <!-- 32px -->
</div>
```

- Text classes: `.aem-h1` 96, `.aem-h2` 58, `.aem-h3` 36, `.aem-lead` 32, `.aem-body` 26.
- `.aem-list` (`<ul>`/`<ol>`, 30px; set `--marker` for the bullet colour).
- Text is graphite by default. Add `on-dark` on dark or saturated backgrounds.
- Put longer text on an `<aem-card>` rather than straight onto a busy background. See `slides/02-agenda.html`.

## Icons

Run `node scripts/serve.mjs` and open **`/catalog.html`**. It renders every background, tile tone,
badge tone, checker and icon, with names. Icons come in four kinds:

- **tile-glyph** — `lock`, `gear`. Use `<aem-tile glyph="…">`, which cuts the glyph out of the tile.
- **mono** — single colour, painted with `currentColor`, so set `color:`. The vector paths come
  straight from the deck:
  - `calendar`, `gear-badge`, `padlock`
  - `github`, `git`, `discord`, `discord-wordmark`, `adobe`, `fastly`
  - `gear-solid`, `gear-ring`, `robot`, `end-of-service`, `store`, `gauge`
  - `database-stack`, `block`, `person`
- **art** — multi-colour, with the colours fixed: `cloudflare`, `cloudflare-cloud`, `aws`,
  `webcomponents`, `worldwide`, `flasks`, `roots-badge`, `map`, `terminal-prompt`.
- **custom** — drawn by hand in the deck's chunky flat style (`lib/icons-custom.js`):
  - `globe`, `key`, `pencil`, `cloud`, `user`, `rocket`, `bolt`, `check`, `plus`
  - `chart`, `stopwatch`, `doc`, `database`, `sparkle`, `mountain-range`, `image-placeholder`, `price-tag`, `webhook`

An unknown name renders as a red box and logs the list of valid names to the console.

## Extending

- **A new icon.** Add `name: { viewBox, kind: 'mono'|'art', d | body }` to `lib/icons-custom.js`.
  - `d` is one path, painted with `currentColor`.
  - `body` is raw SVG markup with fixed colours.
  - Keep the shapes flat, geometric and heavy, as in the deck.
  - Do **not** hand-edit `lib/icons.js`. It is generated by `tools/extract/`
    (`build_icons.py` reads `pdftocairo -svg` output of deck pages, and `gen_icons_js.cjs` writes the JS).
- **A new background, tone or component.** Add it to `lib/aem-live.css`, and to `lib/aem-live.js`
  if it needs generated markup, next to its siblings, with a comment naming the deck page or idea.
  The catalog picks up new `bg`/`tone` selectors automatically.
- **Recreating another deck page.** Add `reference/pNNN-name.html`, where NNN is the deck page number.
  - `tools/extract/gen_reference.py` regenerates the whole reference set from one Python dict.
    Edit it there and re-run it from `tools/slides/`.
  - The extraction scripts need the original Keynote PDF, which is not part of this repo.
- Pages of the original deck that use photographic or AI-generated imagery are intentionally not
  reproduced.

## Checklist before you hand over a slide

- [ ] `node scripts/lint.mjs` passes
- [ ] `node scripts/export.mjs <name>` prints `✓ name.png 2048×1536` with no `!` warning
- [ ] you opened the PNG and checked that:
  - nothing is clipped
  - badges sit on corners
  - text fits
  - nothing has fallen back to a red unknown-icon box
- [ ] it looks like it belongs next to the reference slide it was derived from
