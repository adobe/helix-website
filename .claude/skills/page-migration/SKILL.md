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
- **page-decomposition** - Analyzes page structure into sections with neutral content descriptions
- **block-inventory** - Surveys available blocks from project and Block Collection (invoked at Step 2.5)
- **content-modeling** - Determines content models from authoring perspective (invoked when block selection is unclear)
- **block-collection-and-party** - Validates block selection against Block Collection
- **content-driven-development** - References `resources/md-structure.md` for markdown syntax
- **docs-search** - Use if you need clarification on Edge Delivery Services platform features

## Philosophy

Follow **David's Model** (https://www.aem.live/docs/davidsmodel):
- Prioritize authoring experience over developer convenience
- Ask "How would an author in Word/Google Docs create this?"
- Minimize blocks - prefer default content where possible
- Use Block Collection content models

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
   await browser_take_screenshot({ fullPage: true, filename: 'original.png' });
   ```
   Purpose: Visual reference for layout analysis

4. **Enhance contrast for section detection:**
   ```javascript
   // Use ENHANCE_CONTRAST_SCRIPT from scripts/browser-templates.js
   await browser_evaluate({ script: ENHANCE_CONTRAST_SCRIPT });
   await browser_take_screenshot({ fullPage: true, filename: 'enhanced-contrast.png' });
   ```
   Purpose: Exaggerate subtle background color differences to make section boundaries obvious

   **How the algorithm works:**
   - Collects all background colors from the page
   - Groups similar colors (within 20 RGB units distance)
   - Spreads each group apart by 60 units
   - Makes subtle differences (e.g., white vs light grey) visually obvious

   **Result:** Enhanced screenshot where section background differences are clear

5. **Extract HTML with attribute preservation:**
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

**Output:**
- Original screenshot for visual reference
- Enhanced contrast screenshot for section boundary detection
- Cleaned HTML with all image `src` URLs and link `href` URLs preserved

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

Examine the **enhanced contrast screenshot** to find visual/thematic breaks that indicate new sections.

**Why use the enhanced screenshot?**
Subtle background color differences (e.g., white vs light grey) are exaggerated, making section boundaries immediately obvious.

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

---

### Step 3: Authoring Analysis - FOR EACH CONTENT SEQUENCE

**Context:** You now have:
- Section boundaries with styles (Step 2a)
- Content sequences per section (Step 2b)
- Available block palette (Step 2.5)

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

**Section metadata structure:**
```html
<div>
  <div class="section-metadata">
    <div>
      <div>Style</div>
      <div>dark</div>
    </div>
  </div>
  <!-- Section content here -->
</div>
```

**Important:**
- Do NOT include header or footer content. Only migrate main page content.
- Use consistent style names from Step 2.5 for section metadata
- Place `section-metadata` div at the start of each section that needs styling
- The metadata div will be processed and removed by the platform
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
