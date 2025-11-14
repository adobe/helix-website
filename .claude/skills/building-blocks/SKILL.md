---
name: Building Blocks
description: Guide for creating new AEM Edge Delivery blocks or modifying existing blocks. Use this skill whenever you are creating a new block from scratch or making significant changes to existing blocks that involve JavaScript decoration, CSS styling, or content model changes.
---

# Building Blocks

This skill guides you through implementing AEM Edge Delivery blocks following established patterns and best practices. Blocks transform authored content into rich, interactive experiences through JavaScript decoration and CSS styling.

**IMPORTANT: This skill should ONLY be invoked from the content-driven-development skill during Phase 2 (Implementation).**

If you are not already following the CDD process, STOP and invoke the **content-driven-development** skill first.

## Related Skills

- **content-driven-development**: MUST be invoked before using this skill to ensure content and content models are ready
- **block-collection-and-party**: Use to find similar blocks for patterns
- **testing-blocks**: Automatically invoked during Step 5 for comprehensive testing

## When to Use This Skill

This skill is invoked automatically by **content-driven-development** during implementation. It handles:
- Creating new block files and structure
- Implementing JavaScript decoration
- Adding CSS styling
- Testing and documentation

Prerequisites (verified by CDD):
- ✅ Test content exists (in CMS or local drafts)
- ✅ Content model is defined
- ✅ Test content URL is available

## Building Blocks Checklist

Track your progress through block development:

- [ ] Step 1: Find similar blocks for patterns (if new block or major changes)
- [ ] Step 2: Create or modify block structure (files and directories)
- [ ] Step 3: Implement JavaScript decoration
- [ ] Step 4: Add CSS styling
- [ ] Step 5: Test implementation (invokes testing-blocks skill)
- [ ] Step 6: Document block (developer and author-facing)

## Step 1: Find Similar Blocks

**When to use:** Creating new blocks or making major structural modifications

**Skip this step when:** Making minor modifications to existing blocks (CSS tweaks, small decoration changes)

**Quick start:**

1. Search the codebase for similar blocks:
   ```bash
   ls blocks/
   ```

2. Use the **block-collection-and-party** skill to find reference implementations

3. Review patterns from similar blocks:
   - DOM manipulation strategies
   - CSS architecture
   - Variant handling
   - Performance optimizations

## Step 2: Create or Modify Block Structure

### For New Blocks:

1. Create the block directory and files:
   ```bash
   mkdir -p blocks/{block-name}
   touch blocks/{block-name}/{block-name}.js
   touch blocks/{block-name}/{block-name}.css
   ```

2. Basic JavaScript structure:
   ```javascript
   /**
    * decorate the block
    * @param {Element} block the block
    */
   export default async function decorate(block) {
     // Your decoration logic here
   }
   ```

3. Basic CSS structure:
   ```css
   /* All selectors scoped to block */
   main .{block-name} {
     /* block styles */
   }
   ```

### For Existing Blocks:

1. Locate the block directory: `blocks/{block-name}/`
2. Review current implementation:
   ```bash
   # View the initial HTML structure from the server
   curl http://localhost:3000/{test-content-path}
   ```
3. Understand existing decoration logic and styles

## Step 3: Implement JavaScript Decoration

**Essential pattern - re-use existing DOM elements:**

```javascript
export default async function decorate(block) {
  // Platform delivers images as <picture> elements with <source> tags
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h2');

  // Create new structure, re-using existing elements
  const figure = document.createElement('figure');
  figure.append(picture);  // Re-uses picture element

  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';
  wrapper.append(heading, figure);

  block.replaceChildren(wrapper);

  // Only check variants when they affect decoration logic
  // CSS-only variants like 'dark', 'wide' don't need JS
  if (block.classList.contains('carousel')) {
    // Carousel variant needs different DOM structure/behavior
    setupCarousel(block);
  }
}
```

**For complete JavaScript guidelines including:**
- Advanced DOM manipulation patterns
- Fetching data and loading modules
- Performance optimization techniques
- Helper functions from aem.js
- Code style and linting rules

**Read `resources/js-guidelines.md`**

## Step 4: Add CSS Styling

**Essential patterns - scoped, responsive, using custom properties:**

```css
/* All selectors MUST be scoped to block */
main .my-block {
  /* Use CSS custom properties for consistency */
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--body-font-family);
  max-width: var(--max-content-width);

  /* Mobile-first styles (default) */
  padding: 1rem;
  flex-direction: column;
}

main .my-block h2 {
  font-family: var(--heading-font-family);
  font-size: var(--heading-font-size-m);
}

main .my-block .item {
  display: flex;
  gap: 1rem;
}

/* Tablet and up */
@media (width >= 600px) {
  main .my-block {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (width >= 900px) {
  main .my-block {
    flex-direction: row;
    padding: 4rem;
  }
}

/* Variants - most are CSS-only */
main .my-block.dark {
  background-color: var(--dark-color);
  color: var(--clr-white);
}
```

**For complete CSS guidelines including:**
- All available CSS custom properties
- Modern CSS features (grid, logical properties, etc.)
- Performance optimization
- Naming conventions
- Common patterns and anti-patterns

**Read `resources/css-guidelines.md`**

## Step 5: Test Implementation

**After implementation is complete, invoke the testing-blocks skill.**

The testing-blocks skill will guide you through:
- Writing unit tests for logic-heavy utilities
- Browser testing to validate block behavior
- Taking screenshots for validation and PR documentation
- Running linting and fixing issues

**Provide the testing-blocks skill with:**
- Block name being tested
- Test content URL (from CDD process)
- Any variants that need testing
- Screenshots of existing implementation/design/mockup to verify against

Return to this skill after testing is complete to proceed to Step 6.

## Step 6: Document Block

### Developer Documentation

Most blocks are self-contained and only need code comments. For especially complex blocks (many variants, complex logic), add a brief `README.md` in the block folder.

### Author-Facing Documentation

Almost all blocks need author documentation to help content authors understand how to use the block in the CMS.

**When to update author docs:**
- ✅ Variants are added, removed, or modified
- ✅ Content structure changes
- ✅ Block behavior or functionality changes

**Skip author documentation for:**
- Deprecated blocks (shouldn't be used)
- Special-purpose blocks used infrequently
- Auto-blocked blocks (authors don't use directly)

**For complete guidance on:**
- Determining which documentation approach your project uses
- Where author documentation lives (Sidekick Library, DA Library, etc.)
- What to include in author documentation
- Maintaining documentation in sync with code

**Read `resources/block-documentation.md`**

## Reference Materials

- `resources/js-guidelines.md` - Complete JavaScript patterns and best practices
- `resources/css-guidelines.md` - Complete CSS patterns and best practices
- `resources/block-documentation.md` - Complete documentation guidance
