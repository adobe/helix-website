# HTML File Structure for Test Content

When creating local HTML files for testing blocks in the `drafts/` folder, follow this structure to match how AEM Edge Delivery Services processes authored content.

## Complete HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ALWAYS copy the complete content from head.html -->
  <!-- Then add page-specific meta tags as needed -->
  <title>Your Page Title</title>
  <meta name="description" content="Page description">
</head>

<body>
  <header></header>

  <main>
    <!-- Sections can contain blocks, default content, or a mix of both -->
    <div>
      <!-- Section 1: Mixed content - default content and a block -->
      <h1>Page Heading</h1>
      <p>This is regular paragraph content.</p>

      <div class="block-name">
        <!-- Block content goes here -->
        <div>
          <div>Block content cell 1</div>
          <div>Block content cell 2</div>
        </div>
      </div>

      <p>More content after the block.</p>
    </div>

    <div>
      <!-- Section 2: Block in its own section -->
      <div class="block-name variant-name">
        <!-- Block content -->
      </div>
    </div>

    <div>
      <!-- Section 3: Multiple blocks in one section -->
      <div class="block-one">
        <!-- First block content -->
      </div>

      <div class="block-two">
        <!-- Second block content -->
      </div>
    </div>
  </main>

  <footer></footer>
</body>
</html>
```

## Head Structure

**ALWAYS start by copying the complete content from `head.html`:**
- Copy everything from your project's `head.html` file
- This ensures all required scripts, styles, and meta tags are included
- The content of `head.html` varies by project

**Then add page-specific meta tags:**
- `<title>` - Page title for the test content
- `<meta name="description">` - Page description
- Any other page-specific meta tags needed for testing

## Body Structure

The body must contain three main elements:

```html
<body>
  <header></header>  <!-- Empty, will be auto-populated -->
  <main>
    <!-- Your content goes here -->
  </main>
  <footer></footer>  <!-- Empty, will be auto-populated -->
</body>
```

**Important:**
- Header and footer tags should be empty - they will be automatically populated by the platform
- All page content goes inside `<main>`

## Main Content Structure

Inside `<main>`, content is organized into **sections** (top-level `<div>` elements).

### Sections

Each section is a top-level `<div>` directly inside `<main>`:

```html
<main>
  <div>
    <!-- Section 1 content -->
  </div>

  <div>
    <!-- Section 2 content -->
  </div>
</main>
```

**Important notes about sections:**
- Sections can contain blocks, default content, or a mix of both
- A single section can contain multiple blocks
- There are no strict rules about when to create a new section vs. adding to an existing one
- This varies by project and authoring practices
- Some blocks may require or assume they are in their own section (check block documentation)

### Section Content Types

Sections can contain any combination of:

#### 1. Default Content

Regular HTML elements like headings, paragraphs, lists, etc.

```html
<div>
  <h1>Main Heading</h1>
  <h2>Subheading</h2>
  <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>Unordered list item</li>
  </ul>
  <ol>
    <li>Ordered list item</li>
  </ol>
</div>
```

**Supported default elements:**
- Headings: `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- Paragraphs: `<p>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Inline formatting: `<strong>`, `<em>`, `<a>`
- Images: Use `<picture>` elements with `<source>` and `<img>` tags (see Images section below)
- Code blocks: `<pre>`, `<code>`
- Block quotes: `<blockquote>`

#### 2. Blocks

Blocks are `<div>` elements with specific class names that trigger decoration logic.

**Basic block structure:**
```html
<div>
  <div class="block-name">
    <!-- Block content structured based on content model -->
  </div>
</div>
```

**Block with variant:**
```html
<div>
  <div class="block-name variant-name">
    <!-- Block content -->
  </div>
</div>
```

**Multiple variants:**
```html
<div>
  <div class="block-name variant-one variant-two">
    <!-- Block content -->
  </div>
</div>
```

#### 3. Icons

Icons are authored using the `:iconName:` syntax and are processed into `<span>` elements with icon classes.

**Author input:**
```
:profile:
```

**HTML output:**
```html
<span class="icon icon-profile"></span>
```

**Important notes about icons:**
- Icons can be wrapped in links, strong, em, or other inline elements
- The icon name corresponds to an SVG file in `/icons/` (e.g., `:profile:` → `/icons/profile.svg`)
- Icon spans use two classes: `icon` (base class) and `icon-{name}` (specific icon)
- Icons are inline elements and can be combined with text

**Examples:**

Icon in a link:
```html
<a href="/profile"><span class="icon icon-profile"></span> View Profile</a>
```

Icon with emphasis:
```html
<strong><span class="icon icon-star"></span> Featured</strong>
```

Icon by itself:
```html
<p><span class="icon icon-home"></span></p>
```

#### 4. Images

Images should always use the `<picture>` element with `<source>` elements for responsive images and format optimization.

**Basic picture structure:**
```html
<picture>
  <source type="image/webp" srcset="/media/image.jpg?width=2000&format=webply&optimize=medium" media="(min-width: 600px)">
  <source type="image/webp" srcset="/media/image.jpg?width=750&format=webply&optimize=medium">
  <source srcset="/media/image.jpg?width=2000&format=jpeg&optimize=medium" media="(min-width: 600px)">
  <img loading="lazy" alt="Image description" src="/media/image.jpg?width=750&format=jpeg&optimize=medium">
</picture>
```

**Key aspects of picture elements:**
- Multiple `<source>` elements provide WebP format with fallbacks
- Use `media` attributes for responsive breakpoints (typically `(min-width: 600px)` for desktop)
- Include width query parameters (`?width=750` for mobile, `?width=2000` for desktop)
- Add `format` and `optimize=medium` parameters for image optimization
- The final `<img>` element is the fallback
- Always include `alt` attribute for accessibility
- Use `loading="lazy"` for images below the fold, `loading="eager"` for above-the-fold images

**Standard responsive breakpoints:**
```html
<picture>
  <!-- WebP desktop (600px+) -->
  <source type="image/webp" srcset="/media/image.jpg?width=2000&format=webply&optimize=medium" media="(min-width: 600px)">

  <!-- WebP mobile -->
  <source type="image/webp" srcset="/media/image.jpg?width=750&format=webply&optimize=medium">

  <!-- JPEG desktop (600px+) -->
  <source srcset="/media/image.jpg?width=2000&format=jpeg&optimize=medium" media="(min-width: 600px)">

  <!-- JPEG mobile (fallback) -->
  <img loading="lazy" alt="Descriptive alt text" src="/media/image.jpg?width=750&format=jpeg&optimize=medium">
</picture>
```

**Important notes:**
- Place images in the `/media/` folder or appropriate project location
- Always provide meaningful `alt` text for accessibility
- Use `loading="eager"` only for hero/above-the-fold images
- The platform's `createOptimizedPicture()` JavaScript helper generates this structure automatically in decoration code

**Simplified picture format for examples:**

For brevity, examples in this document may show simplified picture tags:
```html
<picture>
  <img src="/media/image.jpg" alt="Description">
</picture>
```

In actual test files, you can use either:
1. The full responsive structure shown above (recommended for realistic testing)
2. The simplified format (acceptable for quick prototyping, though less realistic)

## Block Content Structure

The internal structure of a block depends on its content model. Blocks typically use nested `<div>` elements to represent the table-like structure from authoring.

### Simple Block Example

A hero block with an image and text:

```html
<div class="hero">
  <div>
    <div>
      <picture>
        <img src="/media/hero-image.jpg" alt="Hero image description">
      </picture>
    </div>
  </div>
  <div>
    <div>
      <h1>Hero Heading</h1>
      <p>Hero description text</p>
    </div>
  </div>
</div>
```

### Block with Multiple Rows

A cards block with multiple items:

```html
<div class="cards">
  <div>
    <div>
      <picture>
        <img src="/media/card1.jpg" alt="Card 1">
      </picture>
    </div>
    <div>
      <h3>Card 1 Title</h3>
      <p>Card 1 description</p>
    </div>
  </div>
  <div>
    <div>
      <picture>
        <img src="/media/card2.jpg" alt="Card 2">
      </picture>
    </div>
    <div>
      <h3>Card 2 Title</h3>
      <p>Card 2 description</p>
    </div>
  </div>
  <div>
    <div>
      <picture>
        <img src="/media/card3.jpg" alt="Card 3">
      </picture>
    </div>
    <div>
      <h3>Card 3 Title</h3>
      <p>Card 3 description</p>
    </div>
  </div>
</div>
```

### Block Structure Mapping

The nested `<div>` structure in HTML corresponds to the table structure in authoring:

**In document authoring (table):**
```
| Block Name        |
|-------------------|
| Cell 1   | Cell 2 |
| Cell 3   | Cell 4 |
```

**In HTML:**
```html
<div class="block-name">
  <div>                    <!-- Row 1 -->
    <div>Cell 1</div>      <!-- Column 1 -->
    <div>Cell 2</div>      <!-- Column 2 -->
  </div>
  <div>                    <!-- Row 2 -->
    <div>Cell 3</div>      <!-- Column 1 -->
    <div>Cell 4</div>      <!-- Column 2 -->
  </div>
</div>
```

## Complete Example

Here's a complete example of a test HTML file for a hero block:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Start: Content copied from head.html -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="/scripts/aem.js" type="module"></script>
  <script src="/scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="/styles/styles.css">
  <link rel="icon" href="/icons/favicon.svg">
  <!-- End: Content copied from head.html -->

  <!-- Page-specific meta tags -->
  <title>Hero Block Test</title>
  <meta name="description" content="Test page for hero block">
</head>

<body>
  <header></header>

  <main>
    <!-- Hero block section -->
    <div>
      <div class="hero">
        <div>
          <div>
            <picture>
              <img src="/media/hero-image.jpg" alt="Welcome to our site">
            </picture>
          </div>
        </div>
        <div>
          <div>
            <h1>Welcome to Our Site</h1>
            <p>This is a compelling hero message that encourages visitors to take action.</p>
            <p><a href="/contact">Get Started</a></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular content section -->
    <div>
      <h2>About This Test</h2>
      <p>This page demonstrates the hero block in action.</p>
    </div>

    <!-- Hero block with variant -->
    <div>
      <div class="hero dark">
        <div>
          <div>
            <picture>
              <img src="/media/hero-dark.jpg" alt="Dark variant hero">
            </picture>
          </div>
        </div>
        <div>
          <div>
            <h2>Dark Variant Hero</h2>
            <p>Testing the dark variant of the hero block.</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer></footer>
</body>
</html>
```

## Important Notes

**File location:**
- Create test HTML files in the `drafts/` folder
- Can be organized in subfolders: `drafts/blocks/hero/test.html`

**Running with local HTML:**
- Start dev server with: `aem up --html-folder drafts`
- This tells the dev server to serve HTML files from the drafts folder

**Head section:**
- ALWAYS copy the complete content from `head.html` first
- Then add any page-specific meta tags
- Do not manually type out head content - copy it to ensure consistency

**Section organization:**
- Sections can contain any mix of blocks and default content
- No strict rules about section boundaries - depends on project and authoring needs
- Some blocks may require being in their own section - check block documentation

**Images:**
- Use `<picture>` elements with proper responsive structure (see Images section)
- Reference images from the `/media/` folder or appropriate location
- Always include `alt` attributes for accessibility

**Testing considerations:**
- Test multiple variants in the same file by adding multiple sections
- Include edge cases in your test content
- Use realistic content, not placeholder text

**Content model alignment:**
- The HTML structure must match your block's expected content model
- Consult your content model documentation when structuring blocks
- The decoration JavaScript will process this structure at two levels:
  - Page-level decoration (e.g., `decorateMain` in `scripts.js`) processes all content
  - Block-specific decoration (`blocks/{block-name}/{block-name}.js`) processes individual blocks
- Classes and enhanced markup are typically added during decoration, not in the authored HTML

## When to Create CMS Content Instead

Local HTML files are useful for quick iteration, but remember:

- **For PRs:** You need actual CMS content for PSI validation links
- **For documentation:** CMS content can serve as author documentation
- **For collaboration:** CMS content is easier for non-developers to review

Always plan to create CMS content before finalizing your PR, even if you start with local HTML for rapid development.
