---
name: Using the Block Collection and Block Party
description: The Block Collection and Block Party are repositories for existing AEM blocks, build tools, code snippets, integration patterns, plugins, and more. Use this skill anytime you are developing something and want to find a reference to use as a starting point.
---

# Using the Block Collection and Block Party

## Overview

This skill helps you find reference implementations, code examples, and patterns from two key AEM Edge Delivery resources:

- **Block Collection**: Adobe-maintained reference blocks following best practices
- **Block Party**: Community-driven repository of blocks, plugins, tools, and integrations

Use the provided search scripts to discover relevant examples, then review the code to inform your implementation approach.

## When to Use This Skill

Use this skill when:
- Building a new block and want to see if similar implementations exist
- Looking for code patterns or snippets to solve a specific problem
- Searching for integration examples (e.g., third-party services, build tools)
- Need reference implementations for sidekick or Document Authoring plugins
- Want to understand best practices through working examples

**Do NOT use this skill when:**
- You need official documentation (use `docs-search` instead)
- You're making minor CSS tweaks to existing code (just edit directly)
- You already know exactly which block/example you need (use it directly)

## Related Skills

- **building-blocks**: This skill is called from building-blocks during development
- **docs-search**: Use for official aem.live documentation
- **content-driven-development**: Use when creating content models for blocks

## Key Concepts

### Block Collection vs Block Party

**Block Collection** (Prefer this when available)
- Maintained by Adobe
- Vetted for best practices
- Excellent content modeling
- High performance and accessibility standards
- Limited to commonly-needed blocks
- Documentation: https://www.aem.live/developer/block-collection
- Repository: https://github.com/adobe/aem-block-collection
- Live site: https://main--aem-block-collection--adobe.aem.live

**Block Party** (Use for specialized needs)
- Community-driven contributions
- Broader variety of content types
- Includes experimental/innovative approaches
- Only approved entries are returned by the search script
- Contains blocks, plugins, build tools, integrations, and more
- Documentation: https://www.aem.live/developer/block-party/
- Search index: https://www.aem.live/developer/block-party/block-party.json?sheet=curated-list-new

**When to prefer which:**
- Start with Block Collection for standard blocks (carousels, accordions, cards, etc.)
- Use Block Party when Block Collection doesn't have what you need
- Block Party is the only source for sidekick plugins, build tools, and integrations
- Sometimes Block Party has innovative approaches worth considering even if Block Collection has a similar block

## How to Use This Skill

### Step 1: Identify Search Terms

Determine what you're looking for and identify relevant search terms. **Think about similar or alternative names** for the functionality.

**Examples:**
- Looking for FAQ block → search for "faq" AND "accordion" (Block Collection has accordion)
- Looking for image gallery → search for "gallery", "carousel", "slideshow"
- Looking for navigation → search for "navigation", "menu", "header"
- Looking for build tooling → search for "webpack", "vite", "sass", "typescript"

**Good search terms:**
- Specific functionality names: "carousel", "tabs", "modal"
- Tool names: "sass", "webpack", "target"
- Component types: "navigation", "footer", "hero"

**Poor search terms:**
- Too generic: "content", "page", "website"
- Too specific: "my-custom-carousel-with-auto-play"

### Step 2: Search Block Collection

Execute the Block Collection search script from the project root:

```bash
node .claude/skills/block-collection-and-party/scripts/search-block-collection.js <search-term>
```

**Examples:**
```bash
# Search for accordion/FAQ blocks
node .claude/skills/block-collection-and-party/scripts/search-block-collection.js accordion

# Search for carousel
node .claude/skills/block-collection-and-party/scripts/search-block-collection.js carousel

# Search for navigation/header
node .claude/skills/block-collection-and-party/scripts/search-block-collection.js header
```

### Step 3: Search Block Party

Execute the Block Party search script from the project root:

```bash
node .claude/skills/block-collection-and-party/scripts/search-block-party.js [--category <category>] <search-term> [additional-terms...]
```

**Options:**
- `--category <category>`: Filter by specific category (Block, Sidekick Plugin, DA Plugin, Code Snippet, Build Tooling, etc.)
- Without `--category`: Searches all categories

**Examples:**
```bash
# Search for breadcrumb blocks
node .claude/skills/block-collection-and-party/scripts/search-block-party.js breadcrumb

# Search for Sass integration examples
node .claude/skills/block-collection-and-party/scripts/search-block-party.js sass

# Search only for build tooling
node .claude/skills/block-collection-and-party/scripts/search-block-party.js --category "Build Tooling" webpack

# Multi-word search
node .claude/skills/block-collection-and-party/scripts/search-block-party.js adobe target integration
```

### Step 4: Review Search Results

**Block Collection Results (type: "block"):**
```json
{
  "query": "accordion",
  "source": "Adobe AEM Block Collection",
  "totalItems": 26,
  "matchCount": 1,
  "results": [
    {
      "name": "accordion",
      "displayName": "Accordion",
      "type": "block",
      "liveExampleUrl": "https://main--aem-block-collection--adobe.aem.live/block-collection/accordion",
      "jsUrl": "https://github.com/adobe/aem-block-collection/blob/main/blocks/accordion/accordion.js",
      "cssUrl": "https://github.com/adobe/aem-block-collection/blob/main/blocks/accordion/accordion.css"
    }
  ]
}
```

**Block Collection Results (type: "default-content"):**
```json
{
  "query": "breadcrumb",
  "source": "Adobe AEM Block Collection",
  "totalItems": 26,
  "matchCount": 1,
  "results": [
    {
      "name": "breadcrumbs",
      "displayName": "Breadcrumbs",
      "type": "default-content",
      "liveExampleUrl": "https://main--aem-block-collection--adobe.aem.live/block-collection/breadcrumbs",
      "note": "This is default content documentation, not a standalone block. Code may be part of other blocks (e.g., breadcrumbs are in the header block). Visit https://www.aem.live/developer/block-collection and the live example URL for implementation guidance.",
      "documentationUrl": "https://www.aem.live/developer/block-collection"
    }
  ]
}
```

**Block Party Results:**
```json
{
  "query": "breadcrumb",
  "category": "All categories",
  "source": "AEM Block Party (Approved Only)",
  "totalEntries": 90,
  "approvedEntries": 62,
  "matchCount": 1,
  "results": [
    {
      "title": "Breadcrumbs",
      "category": "Block",
      "description": "A breadcrumb navigation component...",
      "githubUrl": "https://github.com/...",
      "showcaseUrl": "https://...",
      "githubProfile": "https://github.com/..."
    }
  ]
}
```

### Step 5: Examine the Code

Use the provided URLs to review the implementation:

**For Block Collection results with `type: "block"`:**
1. Read the JS file to understand decoration logic
2. Read the CSS file to see styling approach
3. Visit the live example URL to see the block in action and understand the content model

**For Block Collection results with `type: "default-content"`:**
1. These represent standard HTML elements and patterns (breadcrumbs, buttons, headings, etc.)
2. Code exists but may be part of other blocks (e.g., breadcrumbs code is in the header block)
3. Visit the `documentationUrl` (https://www.aem.live/developer/block-collection) to find implementation details
4. Visit the `liveExampleUrl` to see examples and understand how to author the content
5. Search the Block Collection repository for related blocks that might contain the implementation

**For Block Party entries:**
1. Visit the GitHub URL to see the code
2. Visit the showcase URL to see it in action (if available)
3. Review the description to understand the purpose and approach

### Step 6: Apply Learnings

Use the reference implementations to inform your approach:
- Understand the content model used
- Study decoration patterns and techniques
- Review CSS architecture and responsive approaches
- Adapt (don't copy) the code to fit your specific needs
- Ensure you follow your project's coding standards

## Search Behavior Details

### Block Collection Search

- Searches block folder names in the GitHub repository
- Returns exact and partial matches (case-insensitive)
- Provides direct links to JS, CSS, and live examples
- Fast and reliable (limited to ~16 blocks)

### Block Party Search

- Searches title, description, and category fields
- Supports category filtering
- Returns all matching entries (not limited)
- Shows approval status for each entry
- Includes diverse content types beyond blocks

## Examples

### Example 1: Building an FAQ Block

**User Request:** "I need to build an FAQ section with expandable questions"

**Good Approach:**
1. Recognize FAQ often uses accordion pattern
2. Search Block Collection: `node .claude/skills/block-collection-and-party/scripts/search-block-collection.js accordion`
3. Find the accordion block with JS, CSS, and live example URLs
4. Review the implementation approach
5. Adapt the pattern to your specific FAQ needs

**Why this works:**
- Used alternative term "accordion" for "FAQ"
- Started with Block Collection (Adobe best practices)
- Found a vetted, accessible, performant implementation

### Example 2: Finding Breadcrumb Implementation

**User Request:** "Add breadcrumb navigation to the site"

**Good Approach:**
1. Search Block Collection first: `node .claude/skills/block-collection-and-party/scripts/search-block-collection.js breadcrumb`
2. No results in Block Collection
3. Search Block Party: `node .claude/skills/block-collection-and-party/scripts/search-block-party.js breadcrumb`
4. Find breadcrumb block in Block Party
5. Review the implementation, noting it's community-contributed
6. Evaluate if it meets your needs or needs adaptation

**Why this works:**
- Checked Block Collection first (best practices)
- Fell back to Block Party when BC didn't have it
- Aware that Block Party code may need more review

### Example 3: Integrating Sass

**User Request:** "Can we use Sass for our styles instead of plain CSS?"

**Good Approach:**
1. Recognize this is a build tooling question (not a block)
2. Skip Block Collection (doesn't have build tools)
3. Search Block Party: `node .claude/skills/block-collection-and-party/scripts/search-block-party.js --category "Build Tooling" sass`
4. Find Sass integration examples
5. Review the approach and adapt to your project

**Why this works:**
- Recognized Block Party is the right resource for build tools
- Used category filter to narrow results
- Found community examples of the integration

### Example 4: Multiple Implementations Exist

**User Request:** "Build a carousel for product images"

**Scenario:** Both Block Collection and Block Party have carousel implementations

**Good Approach:**
1. Search Block Collection: `node .claude/skills/block-collection-and-party/scripts/search-block-collection.js carousel`
2. Find Block Collection carousel
3. Also search Block Party: `node .claude/skills/block-collection-and-party/scripts/search-block-party.js carousel`
4. Find multiple Block Party carousels
5. **Prefer Block Collection** for best practices
6. Review Block Party versions to see if they have innovative features worth considering
7. Make informed decision based on requirements

**Why this works:**
- Searched both resources to see all options
- Defaulted to Block Collection (Adobe vetted)
- Considered Block Party for potential innovations
- Made an informed decision rather than blindly copying

## Important Reminders

1. **Always search for alternative names** - "FAQ" = "accordion", "slideshow" = "carousel"
2. **Prefer Block Collection when available** - it's vetted for quality and best practices
3. **Use Block Party for specialized needs** - it has broader variety but needs more evaluation
4. **Don't copy blindly** - understand the code and adapt it to your project
5. **Review content models carefully** - how authors structure content is critical
6. **Check accessibility and performance** - especially for Block Party code
7. **Search both resources** - sometimes both have implementations with different trade-offs
8. **Category matters for Block Party** - use filters when you know what type you need

## Common Search Patterns

| Need | Block Collection Search | Block Party Search |
|------|------------------------|-------------------|
| FAQ section | `accordion` | `faq`, `accordion` |
| Image gallery | `carousel` | `gallery`, `carousel`, `slideshow` |
| Tabbed content | `tabs` | `tabs`, `tabbed` |
| Navigation | `header` | `navigation`, `menu`, `header` |
| Footer | `footer` | `footer` |
| Product cards | `cards` | `cards`, `product` |
| Video embed | `video`, `embed` | `video`, `embed`, `youtube` |
| Build tools | N/A | Use `--category "Build Tooling"` |
| Sidekick plugins | N/A | Use `--category "Sidekick Plugin"` |
| Integrations | N/A | Search for service name (e.g., `target`, `analytics`) |

## Troubleshooting

**No results in Block Collection:**
- Try alternative terms
- Fall back to Block Party
- Consider building from scratch with guidance from `building-blocks` skill

**Too many results in Block Party:**
- Use `--category` to filter
- Refine search terms to be more specific
- Review descriptions to find best matches

**Found code but seems outdated:**
- Check Block Collection for newer patterns
- Review official docs with `docs-search` skill
- Consider using as inspiration but implementing with modern approaches

**Multiple implementations, unsure which to use:**
- Prefer Block Collection for standard functionality
- Choose Block Party for specialized or innovative features
- Consider your specific requirements (performance, accessibility, features)
- Review code quality and documentation before deciding
