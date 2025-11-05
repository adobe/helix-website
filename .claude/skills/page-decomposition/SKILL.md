---
name: page-decomposition
description: Analyze webpage structure and decompose into Edge Delivery Services sections, blocks, and default content with consistent style naming. Use when migrating pages to identify section boundaries and metadata.
---

# Page Decomposition

Analyze webpage structure and decompose into Edge Delivery Services sections with proper metadata.

## When to Use This Skill

This skill is called by **page-migration** after scraping to:
- Identify visual section boundaries
- Assign consistent style names for section metadata
- Classify content as blocks vs default content
- Provide structure for HTML/markdown generation

## Input Required

From the calling skill (page-migration), you need:
- Screenshot of the original page (for visual analysis)
- Cleaned HTML content (from scraping step)

## Related Skills

- **page-migration** - Orchestrator that calls this skill
- **content-driven-development** - References section metadata in html-structure.md

## Key Concepts

**Edge Delivery Services page structure has three layers:**
1. **Sections** - Top-level containers with optional metadata (style, background)
2. **Blocks** - Structured components within sections (hero, cards, etc.)
3. **Default content** - Regular HTML (headings, paragraphs, images) not in blocks

## Decomposition Workflow

### Step 1: Identify Visual Sections

Examine the screenshot to identify distinct visual sections.

**Visual cues for section boundaries:**
- Background color changes (white → grey → white)
- Spacing/padding changes (tight → wide → normal)
- Clear horizontal breaks or dividers
- Thematic content shifts

**Number sections sequentially** from top to bottom.

**Output:** List of visual sections with their position

---

### Step 2: Assign Consistent Style Names

For each section, identify its visual style and assign a name.

**Style naming rules:**
- Use short, descriptive names: `light`, `dark`, `grey`, `accent`
- **REUSE the same name** for sections with identical visual treatment
- Don't create unique names for every section

**Common styles:**
- `light` - White or light background
- `dark` - Dark background with light text
- `grey` - Grey or off-white background
- `accent` - Branded color background

**Anti-pattern example:**
```
Section 1: white background → style: "white"
Section 2: grey background → style: "grey"
Section 3: white background → style: "light"  ❌ Inconsistent!
Section 4: white background → style: "default" ❌ Inconsistent!

CORRECT:
Section 1: white background → style: "light"
Section 2: grey background → style: "grey"
Section 3: white background → style: "light"  ✓ Reused!
Section 4: white background → style: "light"  ✓ Reused!
```

**Output:** Style name per section with consistency enforced

---

### Step 3: Classify Content Types

For each section, determine if content should be blocks or default content.

**Block content (structured components):**
- Repeating patterns (card grids, testimonials, FAQ items)
- Distinct visual components (hero banners, carousels)
- Structured layouts (columns, tabs, accordions)

**Default content (regular HTML):**
- Body text with headings and paragraphs
- Inline images within text
- Simple lists or quotes
- Content that flows naturally without structure

**Decision criteria:**
- If it needs decoration/interaction → Block
- If it's just text/images flowing → Default content
- If it repeats with structure → Block
- If it's unique prose → Default content

**Output:** Content type classification per section

---

### Step 4: Generate Section Decomposition

Return structured section map for the calling skill.

**Output format:**
```javascript
{
  sections: [
    {
      sectionNumber: 1,
      style: "light",
      contentType: "block",
      contentDescription: "Large banner with heading + CTA"
    },
    {
      sectionNumber: 2,
      style: "light",  // Reused style
      contentType: "default",
      contentDescription: "Paragraph text with inline images"
    },
    {
      sectionNumber: 3,
      style: "grey",
      contentType: "block",
      contentDescription: "Grid of 4 items with images + titles"
    }
  ]
}
```

**This data enables:**
- Section metadata tables in markdown
- Consistent style naming across sections
- Clear separation of blocks from default content

---

## Section Metadata Format

**Markdown format:**
```markdown
+------------------------------+
| Section Metadata             |
+------------------+-----------+
| style            | light     |
+------------------+-----------+
```

**Placement:** At the start of each section, before content

**Usage:** Applied by page-migration skill when generating final HTML/markdown

---

## Examples

### Example 1: Homepage

**Visual analysis:**
- Section 1: White background, hero banner
- Section 2: White background, feature cards
- Section 3: Grey background, testimonials
- Section 4: White background, CTA banner

**Output:**
```javascript
{
  sections: [
    { sectionNumber: 1, style: "light", contentType: "block" },
    { sectionNumber: 2, style: "light", contentType: "block" },  // Reused "light"
    { sectionNumber: 3, style: "grey", contentType: "block" },
    { sectionNumber: 4, style: "light", contentType: "block" }   // Reused "light"
  ]
}
```

**Note:** 3 sections use "light" style consistently.

---

### Example 2: Blog Post

**Visual analysis:**
- Section 1: White background, article header
- Section 2: White background, body text with images
- Section 3: Grey background, related articles

**Output:**
```javascript
{
  sections: [
    { sectionNumber: 1, style: "light", contentType: "block" },     // Hero
    { sectionNumber: 2, style: "light", contentType: "default" },   // Body text (not block!)
    { sectionNumber: 3, style: "grey", contentType: "block" }       // Cards
  ]
}
```

**Note:** Section 2 is default content (flowing text), not a block.

---

### Example 3: Landing Page

**Visual analysis:**
- Section 1: Dark background with video, hero
- Section 2: White background, features
- Section 3: White background, social proof
- Section 4: Dark background, form CTA

**Output:**
```javascript
{
  sections: [
    { sectionNumber: 1, style: "dark", contentType: "block" },
    { sectionNumber: 2, style: "light", contentType: "block" },
    { sectionNumber: 3, style: "light", contentType: "block" },  // Reused "light"
    { sectionNumber: 4, style: "dark", contentType: "block" }    // Reused "dark"
  ]
}
```

---

## Common Mistakes to Avoid

**Style naming inconsistency:**
❌ Section 1: "white", Section 2: "light", Section 3: "default" (all white background)
✓ Section 1: "light", Section 2: "light", Section 3: "light" (consistent)

**Creating blocks for everything:**
❌ Body text paragraphs as "text block"
✓ Body text paragraphs as default content

**Ignoring visual breaks:**
❌ One section for entire page
✓ Separate sections at visual boundaries
