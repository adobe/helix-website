# Block Documentation Guide

Blocks require two types of documentation: developer-facing documentation for maintainers, and author-facing documentation for content creators using the CMS.

## Developer Documentation

Developer documentation helps future developers (including AI agents) understand, maintain, and modify block code.

### When Code Comments Are Sufficient

Most blocks are simple and self-contained. For these blocks, clear code comments are all you need:

```javascript
/**
 * decorate the block
 * @param {Element} block the block element
 */
export default async function decorate(block) {
  // Transform each row into a card
  const rows = block.querySelectorAll(':scope > div');
  rows.forEach((row) => {
    row.classList.add('card');
  });
}
```

**Use code comments when:**
- The block has straightforward decoration logic
- The content model is simple and obvious from the code
- There are 0-2 variants
- No complex data fetching or external dependencies

### When to Add a README.md

For complex blocks, add a brief `README.md` in the block folder (`blocks/{block-name}/README.md`).

**Add a README when:**
- The block has many variants (3+) with different behaviors
- Complex decoration logic that isn't immediately obvious
- Special setup requirements
- Non-obvious authoring patterns

**Keep READMEs brief and scannable:**
- One-line summary of what the block does
- List of variants and what they do
- Key authoring requirements (if non-obvious)
- Links to related blocks or documentation

**Example README structure:**
```markdown
# Gallery Block

Displays images in a responsive grid layout.

## Variants
- `masonry` - Masonry-style layout with variable heights
- `carousel` - Carousel with navigation arrows
- `lightbox` - Opens images in a lightbox overlay

## Content Model
- Each row = one image
- First column = image
- Second column (optional) = caption

## Notes
- Images are lazy-loaded using Intersection Observer
- Carousel variant requires at least 3 images
```

## Author-Facing Documentation

Author documentation helps content authors understand how to use the block in the CMS. This documentation typically exists as draft/library content in the CMS itself, not in the codebase.

### When Author Documentation Is Needed

Almost all blocks should have author-facing documentation.

**Skip author documentation only for:**
- Deprecated blocks that should no longer be used but can't be removed yet
- Special-purpose blocks used very infrequently on a need-to-know basis
- Auto-blocked blocks that shouldn't be used directly by authors

### When to Update Author Documentation

Author documentation must be kept in sync with the block implementation. Update whenever:
- ✅ Variants are added, removed, or modified
- ✅ The content structure changes
- ✅ Block behavior or functionality changes
- ✅ New authoring best practices are discovered
- ✅ Common authoring mistakes are identified

### Where Author Documentation Lives

Different projects use different approaches for author documentation. Your project may use one of these:

#### 1. Sidekick Library (Google Drive/SharePoint)

Uses https://github.com/adobe/franklin-sidekick-library

**How to detect:**
- Check for `/tools/sidekick/library.html` in the codebase
- Look for `.library.json` or library metadata

**If present:**
- Guide user to add/update block documentation in the library
- Library content is typically maintained in Google Drive or SharePoint
- Documentation includes block examples, variants, and usage guidance

#### 2. Document Authoring (DA) Library

Uses https://docs.da.live/administrators/guides/setup-library

**How to detect:**
- Different implementation than Sidekick Library
- Check for DA-specific library configuration
- Look for library paths in project configuration

**If present:**
- Guide user to update block documentation in DA library
- DA Library has different authoring and management patterns

#### 3. Universal Editor (UE) Projects

**How to detect:**
- Look for Universal Editor configuration
- AEM as a Cloud Service project structure

**Characteristics:**
- Often skip dedicated author documentation libraries
- May use inline help or other mechanisms
- Documentation approach varies by project

#### 4. Simple Documentation Pages

Some projects maintain simple documentation under `/drafts` or `/docs`.

**How to detect:**
- Look for `/drafts/blocks/` or similar paths
- Check for documentation pages in the project

**If present:**
- Pages contain authoring guides and block examples
- Update the relevant documentation page for the block

### What to Include in Author Documentation

The specific content varies by project, but typically includes:

**Essential information:**
- Block name and purpose
- When/where to use this block
- Content structure (what goes in each row/column)
- Available variants and what they do
- Examples showing different use cases

**Helpful additions:**
- Screenshots of the block in action
- Common mistakes to avoid
- Best practices for content authoring
- Tips for different screen sizes

**Example author documentation content:**

```markdown
# Hero Block

Creates a large, prominent banner at the top of a page.

## When to Use
- Homepage or landing page headers
- Section introductions
- Campaign announcements

## Content Structure
- Row 1, Column 1: Heading text
- Row 1, Column 2: Hero image
- Row 2 (optional): Body text
- Row 3 (optional): Call-to-action link(s)

## Variants
- `dark` - Dark background with light text
- `centered` - Center-aligned text (default is left-aligned)
- `full-width` - Full viewport width (default is contained)

## Examples
[Include visual examples of the block with different variants]

## Tips
- Use high-quality images at least 1920px wide
- Keep heading text under 60 characters
- Limit to 1-2 call-to-action buttons
```

### Process for Updating Author Documentation

**As an agent, follow these steps:**

1. **Identify the documentation approach:**
   ```bash
   # Check for Sidekick Library
   ls tools/sidekick/library.html 2>/dev/null

   # Check for docs/drafts
   ls drafts/blocks/ 2>/dev/null
   ls docs/blocks/ 2>/dev/null
   ```

2. **Determine what changed:**
   - New variants added/removed?
   - Content structure modified?
   - Behavior changes?
   - Best practices updated?

3. **Guide the user:**
   - Explain what documentation needs updating
   - Identify which documentation approach the project uses
   - Provide specific guidance based on the approach
   - Help draft documentation content if requested

4. **Example guidance for user:**
   ```
   The block's content structure has changed. You'll need to update the
   author documentation in the Sidekick Library:

   1. Open the library in Google Drive/SharePoint
   2. Find the existing documentation for the {block-name} block
   3. Update the "Content Structure" section to reflect:
      - Row 1 now accepts an optional icon
      - Row 2 is no longer used
   4. Update any examples showing the old structure
   ```

### Documentation Maintenance Checklist

When completing a block implementation, verify:

- [ ] Developer docs are clear (code comments or README)
- [ ] Author documentation approach identified
- [ ] Changes that require author docs updates documented
- [ ] User guided on where/how to update author docs
- [ ] Examples in author docs match current implementation
- [ ] Variant documentation is complete and accurate

## Common Documentation Mistakes to Avoid

**❌ Don't create documentation that gets out of sync:**
- Avoid duplicating implementation details in multiple places
- Keep documentation close to the code when possible
- Use automation where available

**❌ Don't over-document simple blocks:**
- Clear code is often better than comments
- Don't explain what is obvious from the code

**❌ Don't under-document complex blocks:**
- Complex logic needs explanation
- Variants need clear documentation
- Non-obvious patterns need guidance

**❌ Don't forget to update author docs:**
- Author docs are often overlooked
- Out-of-date docs confuse content authors
- Always update when the content model changes
