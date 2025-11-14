---
name: scrape-webpage
description: Scrape webpage content, extract metadata, download images, and prepare for Edge Delivery Services migration. Returns analysis JSON with paths, metadata, cleaned HTML, and local images.
---

# Scrape Webpage

Extract content, metadata, and images from a webpage for Edge Delivery Services migration.

## When to Use This Skill

Use this skill when:
- Starting a page migration and need to extract content from source URL
- Need webpage analysis with local image downloads
- Want metadata extraction (Open Graph, JSON-LD, etc.)

**Invoked by:** page-migration skill (Step 1)

## Prerequisites

Before using this skill, ensure:
- ✅ Node.js is available
- ✅ npm playwright is installed (`npm install playwright`)
- ✅ Chromium browser is installed (`npx playwright install chromium`)
- ✅ Sharp image library is installed (`cd .claude/skills/scrape-webpage/scripts && npm install`)

## Related Skills

- **page-migration** - Orchestrator that invokes this skill
- **identify-page-structure** - Uses this skill's output (screenshot, HTML, metadata)
- **generate-migration-html** - Uses image mapping and paths from this skill

## Scraping Workflow

### Step 1: Run Analysis Script

**Command:**
```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js "https://example.com/page" --output ./migration-work
```

**What the script does:**
1. Sets up network interception to capture all images
2. Loads page in headless Chromium
3. Scrolls through entire page to trigger lazy-loaded images
4. Downloads all images locally (converts WebP/AVIF/SVG to PNG)
5. Captures full-page screenshot for visual reference
6. Extracts metadata (title, description, Open Graph, JSON-LD, canonical)
7. **Fixes images in DOM** (background-image→img, picture elements, srcset→src, relative→absolute, inline SVG→img)
8. Extracts cleaned HTML (removes scripts/styles)
9. Replaces image URLs in HTML with local paths (./images/...)
10. Generates Edge Delivery Services document paths (sanitized, lowercase, no .html)
11. Saves complete analysis with image mapping to metadata.json

**For detailed explanation:** See `resources/web-page-analysis.md`

---

### Step 2: Verify Output

**Output files:**
- `./migration-work/metadata.json` - Complete analysis with paths and image mapping
- `./migration-work/screenshot.png` - Visual reference for layout comparison
- `./migration-work/cleaned.html` - Main content HTML with local image paths
- `./migration-work/images/` - All downloaded images (WebP/AVIF/SVG converted to PNG)

**Verify files exist:**
```bash
ls -lh ./migration-work/metadata.json ./migration-work/screenshot.png ./migration-work/cleaned.html
ls -lh ./migration-work/images/ | head -5
```

---

### Step 3: Review Metadata JSON

**Output JSON structure:**
```json
{
  "url": "https://example.com/page",
  "timestamp": "2025-01-12T10:30:00.000Z",
  "paths": {
    "documentPath": "/us/en/about",
    "htmlFilePath": "us/en/about.plain.html",
    "mdFilePath": "us/en/about.md",
    "dirPath": "us/en",
    "filename": "about"
  },
  "screenshot": "./migration-work/screenshot.png",
  "html": {
    "filePath": "./migration-work/cleaned.html",
    "size": 45230
  },
  "metadata": {
    "title": "Page Title",
    "description": "Page description",
    "og:image": "https://example.com/image.jpg",
    "canonical": "https://example.com/page"
  },
  "images": {
    "count": 15,
    "mapping": {
      "https://example.com/hero.jpg": "./images/a1b2c3d4e5f6.jpg",
      "https://example.com/logo.webp": "./images/f6e5d4c3b2a1.png"
    },
    "stats": {
      "total": 15,
      "converted": 3,
      "skipped": 12,
      "failed": 0
    }
  }
}
```

**Key fields:**
- `paths.documentPath` - Used for browser preview URL
- `paths.htmlFilePath` - Where to save final HTML file
- `images.mapping` - Original URLs → local paths
- `metadata` - Extracted page metadata

---

## Output

This skill provides:
- ✅ metadata.json with paths, metadata, image mapping
- ✅ screenshot.png for visual reference
- ✅ cleaned.html with local image references
- ✅ images/ folder with all downloaded images

**Next step:** Pass these outputs to identify-page-structure skill

---

## Troubleshooting

**Browser not installed:**
```bash
npx playwright install chromium
```

**Sharp not installed:**
```bash
cd .claude/skills/page-migration/scripts && npm install
```

**Image download failures:**
- Check images.stats.failed count in metadata.json
- Some images may require authentication or be blocked by CORS
- Failed images will be noted but won't stop the scraping process

**Lazy-loaded images not captured:**
- Script scrolls through page to trigger lazy loading
- Some advanced lazy-loading may need customization in scripts/analyze-webpage.js
