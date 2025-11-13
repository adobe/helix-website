---
name: page-migration
description: Migrate a single webpage from any URL to Edge Delivery Services-compliant HTML content. Scrapes the page, analyzes structure, maps to existing blocks, and generates HTML for immediate local preview.
---

# Page Migration

Convert a webpage URL to Edge Delivery Services-compliant HTML content file.

## ⚠️ Critical Requirement: Complete Content Migration

**THIS SKILL MUST MIGRATE ALL PAGE CONTENT WITHOUT EXCEPTION.**

You MUST NOT:
- ❌ Truncate or skip sections because the page is "too long"
- ❌ Summarize or abbreviate any content
- ❌ Use placeholders like "<!-- rest of content -->" or "..."
- ❌ Stop generating HTML before all sections are complete

If you encounter concerns about content length, you MUST generate the complete HTML anyway. Partial migration is a critical failure. The validation checklist in Step 4 will catch any incomplete migrations.

---

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
- ✅ Node.js is available for running scripts
- ✅ npm playwright is installed (`npm install playwright`)
- ✅ Chromium browser is installed (`npx playwright install chromium`)
- ✅ Sharp image library is installed (`cd scripts && npm install`)
- ✅ Local dev server is running (`aem up`)
- ✅ Required blocks already exist in the project (hero, cards, columns, etc.)
- ✅ You understand basic Edge Delivery Services block table syntax (see `content-driven-development/resources/md-structure.md`)

## Related Skills

This skill references and works with:
- **page-decomposition** - Analyzes page structure into sections with neutral content descriptions
- **block-inventory** - Surveys available blocks from project and Block Collection (invoked at Step 2.5)
- **content-modeling** - Determines content models from authoring perspective (invoked when block selection is unclear)
- **block-collection-and-party** - Validates block selection against Block Collection
- **content-driven-development** - References `resources/md-structure.md` for markdown syntax
- **docs-search** - Use if you need clarification on Edge Delivery Services platform features

## Internal Resources

This skill includes self-contained resources:
- **resources/web-page-analysis.md** - How the analyze-webpage.js script works
- **resources/metadata-extraction.md** - How metadata is mapped to EDS format
- **resources/metadata-mapping.md** - Detailed metadata mapping rules

## Philosophy

Follow **David's Model** (https://www.aem.live/docs/davidsmodel):
- Prioritize authoring experience over developer convenience
- Ask "How would an author in Word/Google Docs create this?"
- Minimize blocks - prefer default content where possible
- Use Block Collection content models

## Migration Workflow

### Step 1: Scrape Webpage

Analyze the webpage using the automated script:

**Command:**
```bash
node .claude/skills/page-migration/scripts/analyze-webpage.js "https://example.com/page" --output ./migration-work
```

**What the script does:**
1. Sets up network interception to capture all images
2. Loads the page in headless Chromium
3. Scrolls through entire page to trigger lazy-loaded images
4. Downloads all images locally (converts WebP/AVIF/SVG to PNG)
5. Captures full-page screenshot for visual reference
6. Extracts metadata (title, description, Open Graph, JSON-LD, canonical, etc.)
7. **Fixes images in DOM** (background-image→img, picture elements, srcset→src, relative→absolute, inline SVG→img)
8. Extracts cleaned HTML (removes scripts/styles)
9. Replaces image URLs in HTML with local paths (./images/...)
10. Generates Edge Delivery Services document paths (sanitized, lowercase, no .html)
11. Saves complete analysis with image mapping to metadata.json file

**For detailed explanation:** See `resources/web-page-analysis.md`

**Output (JSON to stdout + saved to metadata.json):**
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
    "canonical": "https://example.com/page",
    ...
  },
  "images": {
    "count": 15,
    "mapping": {
      "https://example.com/hero.jpg": "./images/a1b2c3d4e5f6.jpg",
      "https://example.com/logo.webp": "./images/f6e5d4c3b2a1.png",
      ...
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

**Output files:**
- `./migration-work/metadata.json` - Complete analysis results including paths and image mapping
- `./migration-work/screenshot.png` - Visual reference for layout comparison
- `./migration-work/cleaned.html` - Main content HTML with local image paths
- `./migration-work/images/` - All downloaded images (WebP/AVIF/SVG converted to PNG)

**To skip metadata extraction:**
User must explicitly request "no metadata" or "skip metadata". By default, metadata is always extracted.

---

### Step 2: Identify Page Structure (TWO-LEVEL ANALYSIS)

**CRITICAL:** EDS content has a strict hierarchy:
```
DOCUMENT
├── SECTION (top-level container with optional metadata)
│   ├── Content Sequence 1 (default content OR block)
│   ├── Content Sequence 2 (default content OR block)
│   └── ...
├── SECTION
│   └── Content Sequence 1
└── ...
```

Sections contain content sequences. You must analyze BOTH levels.

---

#### Step 2a: Identify Section Boundaries (Level 1)

Examine the **screenshot** to find visual/thematic breaks that indicate new sections.

**Visual cues for section boundaries:**
- Background color changes (white → grey → dark → white)
- Spacing/padding changes (tight → wide → normal)
- Clear horizontal breaks or dividers
- Thematic content shifts

**What to exclude:**
- Header/navigation (auto-populated)
- Footer (auto-populated)
- Cookie banners, popups

**For each section, note:**
- Section number (sequential)
- Visual style (light, dark, grey, accent)
- Brief overview of what's in it

**Output:** Section boundaries with style metadata

**Example:**
```
Section 1: light background, hero content
Section 2: light background, grid of features
Section 3: grey background, article cards
Section 4: dark background, tabs
```

---

#### Step 2b: Analyze Content Sequences Within Each Section (Level 2)

For EACH section identified in Step 2a, analyze its internal content sequences.

**What is a "content sequence"?**
A vertical flow of related content that will become EITHER:
- Default content (headings, paragraphs, lists, inline images)
- A block (structured, repeating, or interactive component)

**Breaking points between sequences:**
- Change from default content → block
- Change from block → different block
- Change from block → default content

**Invoke page-decomposition skill** for each section to get neutral descriptions.

**For each section, identify:**
- Sequence 1: [Neutral description - NO block names yet]
- Sequence 2: [Neutral description]
- ...

**Output:** Content sequences per section with neutral descriptions

**Example:**
```
Section 1 (light):
  - Sequence 1: Large centered heading, paragraph, two buttons
  - Sequence 2: Two images displayed side-by-side

Section 2 (light):
  - Sequence 1: Centered heading
  - Sequence 2: Grid of 8 items, each with icon and short text
  - Sequence 3: Two centered buttons

Section 3 (grey):
  - Sequence 1: Eyebrow text, heading, paragraph, button
  - Sequence 2: Four items in grid, each with image, category tag, heading, description
```

---

### Step 2.5: Survey Available Blocks

**STOP: Before making any authoring decisions, understand what blocks are available.**

Invoke **block-inventory** skill to catalog available blocks.

**Why this matters:**
Real authors see a block library and choose from available options. You need the same context to make authentic authoring decisions following David's Model.

**What this provides:**
- Local blocks already in project
- Common Block Collection blocks that can be added
- Purpose/description for each block
- Live example URLs

**Output:** Block palette with purposes

**Example output:**
```
Available Blocks:

LOCAL BLOCKS:
- custom-banner: Special promotional banner
- testimonial-slider: Customer testimonials carousel

BLOCK COLLECTION AVAILABLE:
- hero: Large heading, text, buttons for page intro
- cards: Grid of items with images/text
- columns: Side-by-side content layout
- accordion: Expandable Q&A sections
- tabs: Switchable content panels
```

---

### Step 3: Authoring Analysis - FOR EACH CONTENT SEQUENCE

**Context:** You now have:
- Section boundaries with styles (Step 2a)
- Content sequences per section (Step 2b)
- Available block palette (Step 2.5)

**IMPORTANT:** After completing Step 3, you MUST execute Step 3e to validate single-block section styling before proceeding to Step 4.

**For EACH content sequence, follow this mandatory process:**

---

#### Step 3a: MANDATORY - Default Content Check (FIRST!)

**Question:** "Can an author create this with normal typing in Word/Google Docs?"

**Default content means:**
- ✅ Headings, paragraphs, lists
- ✅ Inline images within text
- ✅ Simple quotes
- ✅ Just... typing content

**NOT default content means:**
- ❌ Repeating structured patterns (card grids, feature lists)
- ❌ Interactive components (accordions, tabs, carousels)
- ❌ Complex layouts (side-by-side columns, split content)
- ❌ Requires specific structure for decoration

**Decision:**
- If YES (can type normally) → **Mark as DEFAULT CONTENT, DONE** ✅
- If NO (needs structure) → **Proceed to Step 3b**

**Example:**
```
Section 1, Sequence 1: "Large centered heading, paragraph, two buttons"
- Can author just type heading, paragraph, links? YES
- Decision: DEFAULT CONTENT ✅
- (The fact that many sites style this prominently is a CSS concern, not authoring)

Section 2, Sequence 3: "Two centered buttons"
- Can author just type two links? YES
- Decision: DEFAULT CONTENT ✅

Section 3, Sequence 2: "Four items in grid, each with image, heading, description"
- Can author just type this? NO - requires grid structure
- Decision: Proceed to Step 3b (needs block) ➡️

Section 4, Sequence 1: "Expandable questions and answers"
- Can author just type this? NO - requires interaction/decoration
- Decision: Proceed to Step 3b (needs block) ➡️
```

---

#### Step 3b: Block Selection (ONLY IF NOT DEFAULT)

**With block inventory context, ask:** "Which available block would an author choose for this?"

**Author's perspective:**
- They see the block library
- They match their content need to available blocks
- They choose the best fit

**Process:**
1. Review content sequence description
2. Review available blocks from Step 2.5
3. Ask: "Which block fits this content pattern?"
4. If perfect match exists → Use it
5. If no match → Consider if content-modeling skill can help determine canonical model

---

**DECISION TREE: When to Invoke content-modeling**

**OBVIOUS MATCH (Don't invoke content-modeling):**

Pattern matches block purpose 1:1
- "Grid of items with images/text" + see "cards" block → USE IT ✅
- "Expandable questions" + see "accordion" block → USE IT ✅
- "Tabbed content panels" + see "tabs" block → USE IT ✅
- "Side-by-side content" + see "columns" block → USE IT ✅
- "Rotating images" + see "carousel" block → USE IT ✅

**Criteria for OBVIOUS:**
- Content description matches block purpose exactly
- No ambiguity about structure
- Block exists in inventory

---

**UNCLEAR MATCH (Invoke content-modeling):**

Ambiguous which block to use:
- "Three items with images" - Could be cards? Could be columns? → INVOKE
- "List of features with icons" - Cards? Custom list block? → INVOKE
- "Customer quotes with photos" - Quote block? Cards? Testimonial block? → INVOKE

Missing from inventory:
- Content needs structure BUT no matching block exists → INVOKE
- content-modeling can recommend canonical model or suggest creating custom block

Complex authoring consideration:
- "Hero-like content but in middle of page" → INVOKE
- "Card-like items but only 2 of them" → INVOKE
- Need validation on author mental model → INVOKE

**Criteria for UNCLEAR:**
- Multiple blocks could work
- No obvious block match
- Need authoring perspective validation
- Creating custom block might be needed

---

**Example - OBVIOUS:**
```
Sequence: "Four items in grid, each with image, heading, description"
- Review: "cards: Grid of items with images/text"
- Match: 1:1 match, grid of items with images/text
- Decision: Cards block ✅ (no content-modeling needed)
```

**Example - OBVIOUS:**
```
Sequence: "Three content panels with tab navigation"
- Review: "tabs: Switchable content panels"
- Match: 1:1 match, switchable panels
- Decision: Tabs block ✅ (no content-modeling needed)
```

**Example - UNCLEAR:**
```
Sequence: "Two large items side-by-side, each with icon, heading, long paragraph, button"
- Review blocks: Could be "columns" (side-by-side), could be "cards" (structured items)
- Ambiguity: Is author thinking "put these side by side" or "create feature cards"?
- Decision: INVOKE content-modeling to determine authoring mental model
- content-modeling returns: "Author thinks 'side-by-side' → columns block"
```

**Example - UNCLEAR:**
```
Sequence: "Customer testimonials with photos, names, and quotes"
- Review blocks: "quote" exists, but says "highlighted testimonial" (singular?)
- Ambiguity: Multiple testimonials - is this multiple quote blocks? Cards? Custom testimonial block?
- Decision: INVOKE content-modeling to validate approach
- content-modeling returns: "Collection pattern → cards block with testimonial styling"
```

---

#### Step 3c: Validate Block Exists (IF NEEDED)

**Only if block not in Block Collection common set:**

Invoke **block-collection-and-party** to:
- Confirm block exists
- Get live example URL
- Review content model

**Output:** Validated block selection or confirmation to use default content

---

#### Step 3d: Get Block HTML Structure (BEFORE generating HTML)

**CRITICAL:** Before generating any HTML in Step 4, fetch the pre-decoration HTML structure for ALL blocks you'll use.

```bash
# Get structure examples for each block
node .claude/skills/block-collection-and-party/scripts/get-block-structure.js cards
node .claude/skills/block-collection-and-party/scripts/get-block-structure.js tabs
node .claude/skills/block-collection-and-party/scripts/get-block-structure.js accordion
node .claude/skills/block-collection-and-party/scripts/get-block-structure.js columns
```

**Why this prevents mistakes:**
- Shows exact row/column structure (e.g., cards: each card = 1 row with 2 columns)
- Reveals all variants (e.g., "Cards" vs "Cards (no images)")
- Displays clean HTML without decoration
- Prevents the #1 HTML generation error: wrong structure

**Use the output to:**
1. Understand how many columns each row should have
2. See where images vs content go
3. Match your content to the correct variant
4. Generate HTML that matches the expected structure exactly

**Output:** Structure examples for all blocks to be used in Step 4

---

**Complete Step 3 Output Format:**

```
Section 1 (light):
  - Sequence 1: "Large centered heading, paragraph, two call-to-action buttons"
    → Decision: DEFAULT CONTENT
    → Reason: Author can type heading, paragraph, links normally
    → Note: Prominent styling is a CSS concern

  - Sequence 2: "Two images side-by-side"
    → Decision: Columns block (2 columns)
    → Reason: Side-by-side layout requires structure
    → Obvious match with "columns" block in inventory

Section 2 (light):
  - Sequence 1: "Centered heading"
    → Decision: DEFAULT CONTENT
    → Reason: Just a heading - author types it

  - Sequence 2: "Grid of 8 items, each with icon and short text"
    → Decision: Cards block
    → Reason: Repeating structured pattern, needs block
    → Obvious match with "cards" block in inventory

  - Sequence 3: "Two centered buttons"
    → Decision: DEFAULT CONTENT
    → Reason: Just two links - author types them

Section 3 (grey):
  - Sequence 1: "Eyebrow text, heading, paragraph, button stacked vertically"
    → Decision: DEFAULT CONTENT
    → Reason: Author types text and link normally

  - Sequence 2: "Four items in grid, each with image, category tag, heading, description"
    → Decision: Cards block
    → Reason: Repeating structured pattern
    → Obvious match with "cards" block in inventory

Section 4 (dark):
  - Sequence 1: "Tab navigation with three switchable content panels"
    → Decision: Tabs block
    → Reason: Interactive component, needs decoration
    → Obvious match with "tabs" block in inventory
```

---

#### Step 3e: Validate Section Styling (Single-Block Sections Only)

**⚠️ EXECUTION TRIGGER:** This step is executed AFTER Step 3 is complete. Execute this step if and only if:
- ✅ You have completed Step 3 (identified which sequences become blocks)
- ✅ At least one section contains exactly ONE sequence that became a block
- ✅ That section has distinct background styling from Step 2a

**If NO sections meet these criteria → Skip Step 3e entirely and proceed to Step 4**

**If ANY sections meet these criteria → You MUST execute all sub-steps below for EACH qualifying section**

---

**Why this validation matters:**

When a section contains a single block, the background styling might be:
- **Block-specific design** (e.g., hero with dark background image) → Don't add section-metadata
- **Section container styling** (e.g., dark section with tabs block) → Add section-metadata

Without validation, we risk adding unnecessary section-metadata that conflicts with block styling or makes authoring more complex.

**Sections with multiple sequences:** Always keep section-metadata (styling applies to all content, not validated in Step 3e)

---

**For EACH section with exactly one block, execute ALL these sub-steps:**

**Sub-step 1: Identify the candidate sections**

Review your Step 3 output. Find sections where:
- Section contains exactly 1 content sequence
- That sequence became a block (not default content)
- Section has distinct background styling identified in Step 2a

**Example:**
```
Section 1 (dark blue):
  - Sequence 1: Large centered heading, paragraph, two buttons
    → Decision: Hero block (from Step 3)

Section 3 (grey):
  - Sequence 1: Tab navigation with three switchable panels
    → Decision: Tabs block (from Step 3)
```

---

**Sub-step 2: For each candidate section, examine the screenshot**

Open `./migration-work/screenshot.png` and examine the section visually.

**Ask these questions:**

**Q1: Is the background an image (photo, gradient, illustration)?**
- If YES → Likely block-specific design
- If NO (solid color) → Continue to Q2

**Q2: Does the content fill the colored area edge-to-edge, or is there visible section padding?**
- Edge-to-edge (full-bleed) → Likely block-specific design
- Visible padding around content → Likely section container styling

**Q3: Does the block type typically have its own background styling?**
- Hero, banner, full-width CTAs → Often have own backgrounds
- Tabs, accordion, cards, columns → Often use section backgrounds

---

**Sub-step 3: Make the decision**

Based on your analysis, decide for each single-block section:

**SKIP section-metadata if:**
- Background is an image/gradient (block-specific)
- Content is full-bleed/edge-to-edge (no section padding visible)
- Block type typically has intrinsic background (hero, banner)

**KEEP section-metadata if:**
- Background is solid color with visible section padding
- Block type typically inherits section styling (tabs, cards, accordion)
- Styling clearly provides container context (not block design)

---

**Sub-step 4: Document your decisions**

For each validated section, note:
- Section number
- Block type
- Background analysis (image vs solid, full-bleed vs padded)
- Decision (keep or skip section-metadata)
- Reason

**Example output:**
```
VALIDATED SECTIONS:

Section 1 (dark blue):
  - Block: Hero
  - Background: Full-width dark blue gradient image
  - Layout: Edge-to-edge, no visible section padding
  - Decision: SKIP section-metadata
  - Reason: Background is hero's design, not section styling

Section 3 (grey):
  - Block: Tabs
  - Background: Solid grey (#f5f5f5)
  - Layout: Content centered with visible padding (~80px on sides)
  - Decision: KEEP section-metadata style="grey"
  - Reason: Section provides container styling for tabs block
```

---

**When in doubt:**

If you're uncertain whether background is block-specific or section-wide:
- **Default to KEEPING section-metadata** (safer, easier for authors to remove than add)
- **Add a note** in your documentation explaining the ambiguity
- Consider asking the user for guidance

---

**Step 3e Completion Checklist:**

Before proceeding to Step 4, verify you have completed:
- ✅ Identified all single-block sections with background styling
- ✅ Examined original screenshot for EACH candidate section
- ✅ Answered Q1, Q2, Q3 for EACH candidate section
- ✅ Made skip/keep decision for EACH candidate section
- ✅ Documented reasoning for EACH decision
- ✅ Updated section styling notes with validated decisions

**Output:** Updated section list with validated styling decisions (some sections may now be marked "no section-metadata")

---

### Step 4: Generate HTML

**⚠️ CRITICAL REQUIREMENT: COMPLETE CONTENT MIGRATION**

**YOU MUST MIGRATE ALL CONTENT FROM THE PAGE. PARTIAL MIGRATION IS UNACCEPTABLE.**

- ❌ NEVER truncate or skip sections due to length concerns
- ❌ NEVER summarize or abbreviate content
- ❌ NEVER use placeholders like "<!-- rest of content -->"
- ❌ NEVER omit content because the page is "too long"
- ✅ ALWAYS migrate every section identified in Steps 2a and 2b
- ✅ ALWAYS include all text, images, and structure from the original page
- ✅ If you encounter length issues, generate the FULL HTML anyway

**Validation requirement:** After generating HTML, you MUST verify that the number of sections in your HTML matches the number of sections identified in Step 2a. If they don't match, you have made an error.

---

Create plain HTML file with ONLY the section content using Edge Delivery Services block structure with validated section styling from Steps 2a, 2.5, and 3e.

**IMPORTANT CHANGE:** The AEM CLI now automatically wraps HTML content with the headful structure (head, header, footer). You MUST generate ONLY the section content.

**What to generate:**
- ✅ Section divs with content: `<div>...</div>` (one per section)
- ✅ Blocks as `<div class="block-name">` with nested divs
- ✅ Default content (headings, paragraphs, links, images)
- ✅ Section metadata blocks where validated in Step 3e

**What NOT to generate:**
- ❌ NO `<html>`, `<head>`, or `<body>` tags
- ❌ NO `<header>` or `<footer>` elements
- ❌ NO `<main>` wrapper element
- ❌ NO head content (meta tags, title, etc. - this comes from project's head.html)

**Structure format:**
```html
<div>
  <!-- Section 1 content -->
</div>
<div>
  <!-- Section 2 content with section-metadata if needed -->
  <div class="section-metadata">
    <div>
      <div>Style</div>
      <div>grey</div>
    </div>
  </div>
  <!-- Section 2 blocks/content -->
</div>
<div>
  <!-- Section 3 content -->
</div>
```

**For detailed structure guidance:**
- See `content-driven-development/resources/html-structure.md` for block structure patterns, image handling, and section metadata examples

**Section metadata structure:**

**WITH section-metadata** (section provides container styling):
```html
<div>
  <div class="section-metadata">
    <div>
      <div>Style</div>
      <div>dark</div>
    </div>
  </div>
  <div class="tabs">
    <!-- Tabs block content -->
  </div>
</div>
```

**WITHOUT section-metadata** (background is block-specific):
```html
<div>
  <div class="hero">
    <!-- Hero block content with its own dark background -->
  </div>
</div>
```

**Important:**
- Only migrate the visible body content sections (skip header, navigation, and footer - these are auto-generated)
- Use consistent style names from Step 2a for section metadata
- **Apply validated decisions from Step 3e** - Skip section-metadata for single-block sections where background is block-specific
- Place `section-metadata` div at the start of each section that needs styling (only if Step 3e validation says to keep it)
- The metadata div will be processed and removed by the platform
- Each section is a separate top-level `<div>` element

**Example application:**
```
Section 1 (dark blue) - Validated: SKIP section-metadata
→ HTML: Just <div> with hero block, no section-metadata

Section 2 (light) - Multiple sequences
→ HTML: <div> with heading + cards + buttons, no section-metadata (light is default)

Section 3 (grey) - Validated: KEEP section-metadata
→ HTML: <div> with section-metadata style="grey" + tabs block
```

**Page Metadata Block (from Step 1):**

**Unless user explicitly requested to skip metadata**, use the metadata extracted in Step 1 to generate a metadata block.

**Process (execute each step):**

**1. Review extracted metadata from Step 1 JSON output**

You have raw metadata containing: `title`, `description`, `og:*` properties, `twitter:*` properties, `canonical`, `jsonLd`, etc.

**2. Map each property to EDS format**

For EACH metadata property, apply the decision logic:

**Title:**
- Compare source `title` (or `og:title`) with first H1 on page
- If matches first H1 → Omit (EDS defaults to H1)
- If differs → Include as `title` property

**Description:**
- Compare source `description` (or `og:description`) with first paragraph
- If matches first paragraph → Consider omitting (EDS defaults to first paragraph)
- If differs OR more descriptive → Include as `description` property
- Check: 150-160 characters ideal

**Image:**
- Check source `og:image`
- If matches first content image → Consider omitting (EDS defaults to first image)
- If custom social image → Include as `image` property
- Ensure absolute URL or correct relative path
- Check: 1200x630 pixels recommended

**Canonical:**
- If points to same page URL → Omit (EDS auto-generates)
- If points to different page → Include as `canonical` property

**Tags:**
- Map `article:tag` or `keywords` → comma-separated `tags` property

**Properties to SKIP** (EDS auto-populates these):
- `og:url`, `og:title`, `og:description`, `twitter:title`, `twitter:description`, `twitter:image`
- `viewport`, `charset`, `X-UA-Compatible` (belong in head.html)

**3. Handle JSON-LD (if present)**

```
Has JSON-LD?
├─ Page-specific schema (Article, Product, Event)?
│  ├─ Small payload (<500 chars)? → Include in metadata block as "schema.org" property
│  └─ Large payload? → Note for client-side JS decoration
└─ Site-wide schema (Organization, WebSite)? → Note for head.html
```

**4. Generate metadata block HTML**

Create `<div class="metadata">` with only the properties you decided to include:

```html
<div>
  <div class="metadata">
    <div>
      <div>title</div>
      <div>[Your mapped title]</div>
    </div>
    <div>
      <div>description</div>
      <div>[Your mapped description]</div>
    </div>
    <!-- Only include image if custom -->
    <!-- Only include canonical if differs from page URL -->
    <!-- Only include tags if present -->
  </div>
</div>
```

**5. Document your decisions**

Note which properties were:
- **Included** and why (differs from EDS default)
- **Omitted** and why (matches default OR redundant)
- **Recommendations** (e.g., move to head.html, use bulk metadata)

**Detailed guidance:** See `resources/metadata-extraction.md` and `resources/metadata-mapping.md` for full decision trees and examples

Example placement:
```html
<div>
  <!-- Section 1 content -->
</div>
<div>
  <!-- Section 2 content -->
</div>
<!-- More sections... -->

<!-- Metadata block at the end -->
<div>
  <div class="metadata">
    <div>
      <div>title</div>
      <div>Buy Widgets Online | WidgetCo</div>
    </div>
    <div>
      <div>description</div>
      <div>Shop our extensive collection of high-quality widgets.</div>
    </div>
    <div>
      <div>image</div>
      <div><img src="https://example.com/social-image.jpg" alt="Social preview"></div>
    </div>
  </div>
</div>
```

**Append metadata block as the last section div at the end of the HTML file.**

---

**Images Folder Management (CRITICAL):**

The images are currently in `./migration-work/images/` and the HTML references them as `./images/...`. You MUST handle the images folder correctly:

**Step 1: Determine the correct images folder location**

Based on `paths.htmlFilePath` from metadata.json:
- HTML file: `us/en/about.plain.html` → Images should be at: `us/en/images/`
- HTML file: `products/widget.plain.html` → Images should be at: `products/images/`
- HTML file: `index.plain.html` → Images should be at: `images/`

**Rule:** Images folder goes in the same directory as the HTML file.

**Step 2: Copy the images folder**

```bash
# Example: If HTML is at us/en/about.plain.html
mkdir -p us/en/images
cp -r ./migration-work/images/* us/en/images/
```

**Step 3: Verify image paths in HTML are correct**

The HTML should already reference images as `./images/...` which is correct for files in the same directory. No path changes needed in the HTML.

**Example:**
```
HTML location: us/en/about.plain.html
Images location: us/en/images/
Image reference in HTML: <img src="./images/abc123.jpg">
Result: ✅ Correct - browser resolves to us/en/images/abc123.jpg
```

---

**Save HTML to:** Use `paths.htmlFilePath` from `./migration-work/metadata.json` (e.g., `us/en/about.plain.html`)

Example: Read the metadata.json file from Step 1 to get the correct file path.

**Alternative:** For markdown format, see `resources/md-structure.md`

**Output:**
- HTML file saved to the path specified in metadata.json
- Images folder copied to the same directory as the HTML file

---

**Step 4 Validation Checklist (MANDATORY):**

Before proceeding to Step 5, verify:
- ✅ Section count: HTML has the same number of top-level `<div>` sections as identified in Step 2a
- ✅ All sequences: Every content sequence from Step 2b appears in the HTML
- ✅ No truncation: No "..." or "<!-- more content -->" or similar placeholders
- ✅ Complete text: All headings, paragraphs, and text from cleaned.html are present
- ✅ All images: Every image reference from the scraped page is included
- ✅ HTML file saved: HTML file written to disk at the correct path
- ✅ Images folder copied: Images folder exists in the same directory as the HTML file
- ✅ Images accessible: Verify that at least one image file exists in the copied images folder

**If any validation check fails, STOP and fix before proceeding.**

---

### Step 5: Preview and Verify

Open the migrated content in your local dev server:

**Navigate in browser:**

For most files, use the document path directly:
```
http://localhost:3000${documentPath}
Example: http://localhost:3000/us/en/about
```

**IMPORTANT:** For index files, use `/index` instead of `/`:
```
If file is: index.plain.html
Preview at: http://localhost:3000/index
NOT: http://localhost:3000/
```

(Use `paths.documentPath` from `./migration-work/metadata.json`, but for index files ensure the path is `/index` not `/`)

**Verify:**
- ✅ Blocks render with correct styling
- ✅ Layout matches original page structure (compare to `screenshot.png` from Step 1)
- ✅ Images load (or show appropriate placeholders)
- ✅ No raw HTML visible
- ✅ Metadata appears in page source (view source, check `<meta>` tags)
- ✅ Section styling applied correctly

**Comparison:**
- Open `./migration-work/screenshot.png` alongside preview
- Check that content structure matches
- Verify blocks decorated correctly

**If issues found:**
- Check HTML structure matches EDS format
- Verify block names match exactly
- Ensure image URLs are absolute or correct relative paths
- Review `resources/html-structure.md` for format guidance
- Check browser console for JavaScript errors

**Output:** Verified preview that matches original page structure

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

**Browser not installed**
→ Run `npx playwright install chromium` to install Chromium

**Blocks don't render correctly**
→ Check `content-driven-development/resources/html-structure.md` for structure guidance

**Metadata not appearing in page**
→ Check `resources/metadata-extraction.md` for mapping rules and EDS defaults

**Lazy-loaded images not captured**
→ Some advanced lazy-loading may need customization in analyze-webpage.js

**Not sure which block to use**
→ Invoke **block-collection-and-party** skill to search for examples

**Need Edge Delivery Services clarification**
→ Invoke **docs-search** skill to search aem.live documentation

**Complex content doesn't fit standard blocks**
→ Invoke **content-driven-development** skill to create custom block first, then return to migration

**Need to understand web page analysis**
→ See `resources/web-page-analysis.md` for detailed explanation of the scraping process

---

## Limitations

This skill focuses on single-page migration with existing blocks. It does NOT include:
- Custom variant creation (blocks are used as-is)
- Multi-page batch processing (migrate one page at a time)
- Block code development (assumes blocks exist)
- Advanced reuse detection across migrations
- Automatic block matching algorithms

For those features, consider the more comprehensive migration workflows available in specialized tools.
