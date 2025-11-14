---
name: Content Driven Development
description: Apply a Content Driven Development process to AEM Edge Delivery Services development. Use for all development tasks, including building new blocks, modifying existing blocks, making changes to core decoration functionality, etc.
---

# Content Driven Development (CDD)

Content Driven Development is a mandatory process for AEM Edge Delivery Services that prioritizes creating or identifying test content before writing code. This ensures code is built against real content with author-friendly content models.

**CRITICAL: Never start writing or modifying code without first identifying or creating the content you will use to test your changes.**

## Related Skills

- **content-modeling**: Invoked when designing or modifying content models
- **building-blocks**: Invoked during block implementation
- **testing-blocks**: Referenced during validation phase
- **block-collection-and-party**: Used to find similar blocks and reference implementations

## When to Use This Skill

Use CDD for ALL AEM development tasks:
- ✅ Creating new blocks
- ✅ Modifying existing blocks (structural or functional changes)
- ✅ Changes to core decoration functionality
- ✅ Bug fixes that require validation
- ✅ Any code that affects how authors create or structure content

Skip CDD only for:
- ⚠️ Trivial CSS-only styling tweaks (but still identify test content for validation)
- ⚠️ Configuration changes that don't affect authoring

## CDD Checklist

Copy this checklist and track your progress:

- [ ] Step 1: Find existing test content. See "Finding Existing Content" below
- [ ] Step 2: Design content model, if needed. See "Content Modeling" below
- [ ] Step 3: Create test content, if needed. See "Creating Test Content" below
- [ ] Step 4: Implement against real content. See "Implementation" below
- [ ] Step 5: Validate with test content. See "Validation" below

## Finding Existing Content

**When to use:** Modifications to existing blocks or functionality

**Skip this step when:** Building a brand new block that definitely doesn't exist yet

**Quick start:**
1. Ask user: "Does content using this block already exist that we can use for testing? If so, what are the path(s) to page(s) with this block?"
2. If user doesn't know, offer: "I can help search for existing content using the find-block-content script"
3. Use the script if needed:

```bash
# Search for pages containing a block
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name>

# Search on live site
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> main--about-boa--aemsites.aem.live
```

**If doing content discovery, read `resources/content-discovery.md` for complete guidance** on:
- Detailed script usage and examples
- Validating discovered content
- Assessing content variety and coverage
- Determining if existing content is sufficient

## Content Modeling

**When to use:** New blocks or structural changes to existing blocks

**Skip this step when:** Making non-structural changes (CSS only, decoration logic that doesn't affect content model)

**Workflow:**
1. Ask user: "Would you like me to use the content-modeling skill to design an author-friendly content model?"
2. If YES → Invoke **content-modeling** skill (it provides complete guidance)
3. If NO → Ask user to describe the content structure and document it

## Creating Test Content

**When to use:** After content model is defined and no existing content is available

**Skip this step when:** Existing content was found in Step 1 that covers all test scenarios

**Quick start:**
1. Ask user to choose:
   - **CMS Content (Recommended)** - Create in Google Drive/SharePoint/DA/Universal Editor
   - **Local HTML Files (Temporary)** - Create in `drafts/tmp/` for quick testing

2. **For CMS Content:**
   - Guide user through CMS creation process
   - Wait for user to provide URL(s)
   - Validate content loads in local dev environment

3. **For Local HTML:**
   - Create HTML file(s) in `drafts/tmp/{block-name}.html`
   - Restart dev server: `aem up --html-folder drafts`
   - Remind user that CMS content will be needed before PR

**If creating test content, read `resources/content-creation.md` for complete guidance** on:
- HTML structure for local files (see also `resources/html-structure.md`)
- Making test content serve as documentation
- Content variety requirements (variants, edge cases)
- Validating test content quality

## Implementation

**CRITICAL: Do not begin implementation until test content exists and is accessible.**

**For blocks:**
- Invoke **building-blocks** skill (it handles implementation and testing)
- Provide: content model and test content URL(s)

**For core functionality (scripts, styles, etc.):**
- Make changes to scripts, styles, or configuration
- Test against identified content throughout development in browser
- Run linting regularly: `npm run lint`
- Verify existing functionality still works

## Validation

**CRITICAL: Browser validation is MANDATORY. Testing must be performed in a real browser environment, not with curl or command-line tools.**

**Workflow:**
1. Invoke **testing-blocks** skill (it provides complete guidance on testing and validation)
2. The testing-blocks skill covers:
   - Mandatory browser testing
   - Unit tests (if needed)
   - Linting and existing test verification
   - PR preparation requirements

## Anti-Patterns to Avoid

Common mistakes that violate CDD principles:
- ❌ Starting with code before understanding the content model
- ❌ Making assumptions about content structure without seeing real examples
- ❌ Creating developer-friendly but author-hostile content models
- ❌ Skipping content creation "to save time" (costs more time later)

## Resources

- **Philosophy:** `resources/cdd-philosophy.md` - Why content-first matters
- **Content Discovery:** `resources/content-discovery.md` - Finding and identifying existing content
- **Content Creation:** `resources/content-creation.md` - Creating test content (CMS vs local HTML)
- **HTML Structure:** `resources/html-structure.md` - Guide for creating local HTML test files

## Integration with Other Skills

This skill orchestrates the AEM development workflow:

**At Content Discovery stage:**
- Use `scripts/find-block-content.js` to locate existing content

**At Content Modeling stage:**
- Invoke **content-modeling** skill for author-friendly design

**At Implementation stage:**
- Invoke **building-blocks** skill for block development
- Reference **block-collection-and-party** skill for patterns

**At Validation stage:**
- Reference **testing-blocks** skill for comprehensive testing

Following this orchestration ensures all development follows content-first principles.
