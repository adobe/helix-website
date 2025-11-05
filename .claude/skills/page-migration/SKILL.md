---
name: page-migration
description: Migrate a single webpage from any URL to Edge Delivery Services-compliant HTML content. Scrapes the page, analyzes structure, maps to existing blocks, and generates HTML for immediate local preview.
---

# Page Migration

Convert a webpage URL to Edge Delivery Services-compliant HTML content file.

## When to Use This Skill

Use this skill when:
- Migrating individual pages from existing websites to Edge Delivery Services
- Converting competitor pages for reference or analysis
- Creating content files from design prototypes or staging sites

**Do NOT use this skill for:**
- Building new blocks from scratch (use **content-driven-development** skill instead)
- Modifying existing block code (use **building-blocks** skill instead)
- Designing content models (use **content-modeling** skill instead)

## Scope: Main Content Only

**This skill migrates main content only.**
- ✅ Migrate: Hero sections, features, testimonials, CTAs, body content
- ❌ Skip: Header, navigation, footer (handled by dedicated skills)

## Prerequisites

Before using this skill, ensure:
- ✅ Node.js is available for running path generation script
- ✅ Playwright MCP tools are available for web scraping
- ✅ Local dev server is running (`aem up`)
- ✅ Required blocks already exist in the project (hero, cards, columns, etc.)
- ✅ You understand basic Edge Delivery Services block table syntax (see `content-driven-development/resources/md-structure.md`)

## Related Skills

This skill references and works with:
- **page-decomposition** - Analyzes page structure into sections with style metadata
- **block-collection-and-party** - Used to find similar block implementations for reference
- **content-driven-development** - References `resources/md-structure.md` for markdown syntax
- **docs-search** - Use if you need clarification on Edge Delivery Services platform features

## Migration Workflow

### Step 1: Scrape Webpage

Use Playwright MCP tools to capture the page with complete data preservation:

**Actions (Execute in sequence):**

1. **Navigate to URL:**
   ```javascript
   await browser_navigate({ url: 'https://example.com/page' });
   ```

2. **Scroll to trigger lazy-loaded images:**
   ```javascript
   // Use SCROLL_SCRIPT from scripts/browser-templates.js
   await browser_evaluate({ script: [scroll script] });
   ```
   Purpose: Ensures lazy-loaded images populate their `src` attributes

3. **Take screenshot:**
   ```javascript
   await browser_take_screenshot({ fullPage: true });
   ```
   Purpose: Visual reference for layout analysis

4. **Extract HTML with attribute preservation:**
   ```javascript
   // Use EXTRACT_HTML_SCRIPT from scripts/browser-templates.js
   const cleanedHTML = await browser_evaluate({ script: [extraction script] });
   ```
   Purpose: Capture cleaned HTML with guaranteed `src` and `href` preservation

   **The extraction script does:**
   - Removes non-content elements (scripts, styles, nav, footer, ads, iframes)
   - Works on full body HTML (doesn't isolate - Claude identifies main content in Step 2)
   - **Preserves essential attributes:** `src`, `href`, `alt`, `title`, `class`, `id`
   - Strips all other attributes
   - Compresses whitespace

**Scripts reference:** See `scripts/browser-templates.js` for complete extraction logic

**Output:** Screenshot image + Cleaned HTML with all image `src` URLs and link `href` URLs preserved

---

### Step 2: Analyze Content Structure

Examine the screenshot and HTML to identify content sections:

**What to identify:**
- Main sections (hero, features, testimonials, CTA, etc.)
- Content types (headings, paragraphs, images, buttons)
- Visual layout (single column, grid, side-by-side)
- Section styling (light background, dark background, accent colors)

**What to exclude:**
- Header/navigation elements
- Footer elements
- Cookie banners, popups
- Sidebar navigation

**Output:** Mental model of page structure with section types identified

---

### Step 2.5: Decompose Page Structure

Invoke **page-decomposition** skill to identify sections and assign consistent style names.

**Action:**
"Analyze this page structure and identify sections with consistent style naming"

**What this provides:**
- Section boundaries (where one section ends, next begins)
- Style names for section metadata (light, dark, grey, accent)
- Content type classification (block vs default content)
- Consistent naming across sections with same visual treatment

**Output:** Section map with style names and content types for use in Step 4

---

### Step 3: Identify Content Patterns

For each section, describe the content pattern WITHOUT assigning block names yet.

**Identify:**
- Layout type: "single banner", "grid layout", "side-by-side", "Q&A pairs", "image gallery"
- Content elements: "has images", "has headings", "has CTAs", "repeating items"
- Visual hierarchy: "prominent", "equal-weight", "sequential"

**Do NOT assign block names yet** - that happens in Step 3b after searching.

**Example output:**
- Section 1: Large banner with heading + CTA + background image
- Section 2: Grid of 4 similar items, each with image + title + description
- Section 3: Two-column layout with text content
- Section 4: Sequential Q&A pairs

**Output:** List of content patterns per section (no block names)

---

### Step 3a: Search for Block Examples (REQUIRED)

**MANDATORY:** For each content pattern from Step 3, invoke **block-collection-and-party** skill.

**Why this is required:**
- Provides actual block examples with structure
- Shows correct row/column counts for each block
- Gives live URLs to see blocks in action
- Ensures you use correct content models (not assumptions)

**Process:**
1. Review content patterns from Step 3
2. For EACH pattern, invoke block-collection-and-party with search terms
3. Collect block examples with their structures

**Example execution:**

For "Large banner with heading + CTA":
→ **Invoke:** "Search Block Collection for hero examples"

For "Grid of similar items":
→ **Invoke:** "Search Block Collection for cards examples"

For "Side-by-side content":
→ **Invoke:** "Search Block Collection for columns examples"

For "Q&A pairs":
→ **Invoke:** "Search Block Collection for accordion examples"

**Output:** Search results with block examples for each content pattern

---

### Step 3b: Select Final Blocks

Using search results from Step 3a and the Block Selection Guide below, choose the best block for each section.

**Decision process:**
1. Review search results - what blocks are available?
2. Check Block Selection Guide - when to use each block?
3. Match content pattern to best block type

**Common mappings:**
- Large banner with heading + CTA → **Hero** block
- Grid of similar items → **Cards** block
- Content side-by-side → **Columns** block
- Expandable Q&A pairs → **Accordion** block
- Rotating/sliding images → **Carousel** block

**Decision tips:**
- **Cards vs Columns:** Cards = distinct repeating items; Columns = general layout
- **Hero vs Columns:** Hero = prominent banner; Columns = equal-weight sections
- **Accordion vs Tabs:** Accordion = sequential disclosure; Tabs = parallel alternatives

**Output:** Final block assignment per section
Example: "Section 1 → Hero block, Section 2 → Cards block, Section 3 → Columns block"

---

### Step 3.5: Generate Save Path

Generate Edge Delivery Services-compliant file paths from the source URL.

**Command:**
```bash
node .claude/skills/page-migration/scripts/generate-path.js "https://example.com/us/en/about.html"
```

**Output:**
```json
{
  "success": true,
  "url": "https://example.com/us/en/about.html",
  "documentPath": "/us/en/about",
  "mdFilePath": "us/en/about.md",
  "htmlFilePath": "us/en/about.html",
  "dirPath": "us/en",
  "filename": "about",
  "directoryCreated": true
}
```

**What this does:**
- Converts URL to Edge Delivery Services-compliant path (lowercase, sanitized)
- Handles trailing slashes (appends 'index')
- Removes `.html` extension
- Sanitizes special characters and diacritics
- Creates directory structure automatically
- Returns paths for both .md and .html files

**Use these paths:**
- `htmlFilePath` → Save HTML file in Step 4
- `documentPath` → Preview URL in Step 5

---

### Step 4: Generate HTML

Create HTML file using Edge Delivery Services block structure with section metadata from Step 2.5.

**For complete HTML structure guidance:**
Use the **content-driven-development** skill resource: `resources/html-structure.md`

This resource provides:
- Complete HTML document template
- Block structure mapping (rows/columns → nested divs)
- Head content requirements (copy from head.html)
- Image handling with picture elements
- Section organization patterns
- Section metadata guidance

**Quick structure:**
- Copy complete content from project's head.html
- Empty `<header>` and `<footer>` tags (auto-populated)
- Main content in sections: `<main><div>...</div></main>`
- Blocks as `<div class="block-name">` with nested divs
- **Include section metadata** using style names from Step 2.5

**Important:**
- Do NOT include header or footer content. Only migrate main page content.
- Use consistent style names from Step 2.5 for section metadata
- Separate sections with proper boundaries

**Save to:** Use `htmlFilePath` from Step 3.5 (e.g., `content/us/en/about.html`)

**Alternative:** For markdown format, see `resources/md-structure.md`

**Output:** HTML file in `htmlFilePath` with section metadata

---

### Step 5: Preview and Verify

Open the migrated content in your local dev server:

**Actions:**
```javascript
// Navigate to preview URL using documentPath from Step 3.5
await browser_navigate({ url: 'http://localhost:3000${documentPath}' });
// Example: http://localhost:3000/us/en/about

// Take screenshot to verify rendering
await browser_take_screenshot({ fullPage: true });
```

**Verify:**
- ✅ Blocks render with correct styling
- ✅ Layout matches original page structure
- ✅ Images load (or show appropriate placeholders)
- ✅ No raw markdown syntax visible
- ✅ No table characters (`+`, `|`, `-`) visible

**If issues found:**
- Check column alignment in markdown
- Verify block names match exactly
- Ensure images URLs are complete
- Review `md-structure.md` for common pitfalls

**Output:** Verified preview + screenshot proof

---

## Block Selection Guide

Quick reference for matching content to blocks:

| Content Pattern | Block Type | When to Use |
|-----------------|------------|-------------|
| Large banner with heading + CTA | **Hero** | Full-width page header, prominent message |
| Grid of similar items | **Cards** | Products, features, team members, testimonials |
| Content in side-by-side columns | **Columns** | Comparisons, features, general layout |
| Expandable questions/answers | **Accordion** | FAQs, documentation, progressive disclosure |
| Rotating/sliding images | **Carousel** | Image galleries, testimonials, case studies |
| Embedded content (video, map) | **Embed** | YouTube videos, Google Maps, iframes |
| Tabbed content switcher | **Tabs** | Multiple related content sections |
| Data in rows and columns | **Table** | Pricing tables, comparison charts |

**Decision tips:**
- **Cards vs Columns:** Cards = distinct repeating items; Columns = general side-by-side layout
- **Hero vs Columns:** Hero = prominent banner; Columns = equal-weight content sections
- **Accordion vs Tabs:** Accordion = sequential disclosure; Tabs = parallel alternatives

---

## Common Content Patterns

### Pattern 1: Homepage

**Original page structure:**
- Hero banner with heading, description, CTA
- Feature grid (3 items with icons, titles, descriptions)
- Testimonials section (2 testimonials side-by-side)
- Final CTA banner

**Maps to:**
```markdown
Hero block (main banner)
Cards block (3-column features)
Columns block (2-column testimonials)
Hero block (final CTA)
```

---

### Pattern 2: Product Page

**Original page structure:**
- Product hero with large image and details
- Specifications in side-by-side format
- Customer reviews grid
- Related products grid

**Maps to:**
```markdown
Hero block (product intro)
Columns block (specs comparison)
Cards block (reviews)
Cards block (related products)
```

---

### Pattern 3: About Page

**Original page structure:**
- Company mission banner
- Timeline or milestones
- Team member grid
- FAQ section

**Maps to:**
```markdown
Hero block (mission)
Columns or Cards (timeline)
Cards block (team members)
Accordion block (FAQs)
```

---

### Pattern 4: Blog Post

**Original page structure:**
- Article header with title, date, author
- Body content (headings, paragraphs, images)
- Related articles grid

**Maps to:**
```markdown
Hero block (article header)
Default content (headings, paragraphs, images - not in blocks)
Cards block (related articles)
```

---

### Pattern 5: Landing Page

**Original page structure:**
- Hero with video background
- Feature highlights (icon + text)
- Social proof (logos or testimonials)
- Lead capture form

**Maps to:**
```markdown
Hero block (with video embed)
Cards block (features)
Logo Wall or Columns (social proof)
Form block (lead capture)
```

---

## Tips for Migration Success

**Content accuracy:**
- Preserve exact text from original page
- Maintain heading hierarchy (H1 → H2 → H3)

**Workflow:**
- Always preview before considering migration complete
- Take screenshot proof that rendering works
- Compare with original page for accuracy

**For detailed guidance:**
- HTML structure → `content-driven-development/resources/html-structure.md`
- Block examples → Invoke **block-collection-and-party** skill
- Edge Delivery Services features → Invoke **docs-search** skill

## Troubleshooting

**Blocks don't render correctly**
→ Check `content-driven-development/resources/html-structure.md` for structure guidance

**Not sure which block to use**
→ Invoke **block-collection-and-party** skill to search for examples

**Need Edge Delivery Services clarification**
→ Invoke **docs-search** skill to search aem.live documentation

**Complex content doesn't fit standard blocks**
→ Invoke **content-driven-development** skill to create custom block first, then return to migration

---

## Limitations

This skill focuses on single-page migration with existing blocks. It does NOT include:
- Custom variant creation (blocks are used as-is)
- Multi-page batch processing (migrate one page at a time)
- Block code development (assumes blocks exist)
- Advanced reuse detection across migrations
- Automatic block matching algorithms

For those features, consider the more comprehensive migration workflows available in specialized tools.
