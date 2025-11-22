# Content Discovery

Content discovery is the process of finding existing content that can be used for testing your code changes. This is the first step in the CDD workflow and determines whether you need to create new test content.

## When to Use Content Discovery

**Always use content discovery when:**
- Modifying existing blocks
- Making changes to core functionality that affects existing blocks
- Bug fixes that need validation against real scenarios
- Any work that could impact existing content

**Skip content discovery when:**
- Building a brand new block that definitely doesn't exist yet
- Adding completely new functionality that has no existing equivalent

When in doubt, search. Finding existing content is faster than creating new content unnecessarily.

## Discovery Methods

### Method 1: Ask the User

Often the fastest approach is to ask the user directly if they know where relevant content exists.

**Ask directly:**
"Does content using this block already exist that we can use for testing? If so, what are the path(s) to page(s) with this block?"

**If the user doesn't know:**
"I can help search for existing content using the find-block-content script. Would you like me to search for pages containing this block?"

**If user provides URLs:**
- Validate the provided URLs (see "Validating Discovered Content" below)
- Open in browser or test programmatically
- Verify the block renders correctly
- Confirm it matches the changes you're making

### Method 2: Use the find-block-content Script

If the user doesn't know where content exists, use the project's utility script that searches the query-index for pages containing specific blocks.

**Basic usage:**
```bash
# Search localhost (default)
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name>

# Search for specific variant
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> localhost:3000 <variant>

# Search on live site
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> main--repo--owner.aem.live

# Search on preview environment
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> main--repo--owner.aem.page
```

**Examples:**
```bash
# Find all hero blocks on localhost
node .claude/skills/content-driven-development/scripts/find-block-content.js hero

# Find hero blocks with "dark" variant on localhost
node .claude/skills/content-driven-development/scripts/find-block-content.js hero localhost:3000 dark

# Find all cards blocks on live site
node .claude/skills/content-driven-development/scripts/find-block-content.js cards main--about-boa--aemsites.aem.live

# Find cards with "three-up" variant on preview
node .claude/skills/content-driven-development/scripts/find-block-content.js cards main--about-boa--aemsites.aem.page three-up
```

**Script output:**
- List of page URLs containing the block
- Total count of pages found
- Clickable URLs for browser testing

**How it works:**
- Queries the site's query-index (JSON data source)
- Uses proper DOM parsing to identify blocks
- Filters by block name and optional variant
- Returns full page URLs ready for testing

## Validating Discovered Content

Once you've found existing content, validate it's suitable for testing:

### 1. Load in Local Dev Environment

```bash
# Ensure dev server is running
aem up

# Open the URL in browser
# http://localhost:3000/path/to/page
```

**What to check:**
- ✅ Content loads without errors
- ✅ Block renders correctly
- ✅ Block includes the elements you need to test
- ✅ Content represents typical usage patterns

### 2. Inspect the Content Structure

View the raw HTML structure delivered by the backend:

```bash
# Get the full page HTML
curl http://localhost:3000/path/to/page

# View just the block structure (requires jq or manual inspection)
curl http://localhost:3000/path/to/page | grep -A 20 'class="block-name"'
```

**What to look for:**
- Initial DOM structure (before decoration)
- Content model being used
- Variants or special classes
- Edge cases or unusual patterns

### 3. Check Content Variety

**Good test content has:**
- Multiple instances (test edge cases)
- Different variants (if applicable)
- Various content lengths (short, medium, long)
- Realistic examples (not placeholder text)

**If existing content is limited:**
- Note gaps in coverage
- Plan to create additional test content for missing scenarios
- Document which test cases existing content doesn't cover

## When Existing Content Isn't Enough

Sometimes you'll find existing content but it's insufficient:

**Scenarios requiring additional content:**
- Only one example exists (need variety)
- No examples of specific variants
- Missing edge cases (very long/short content)
- Content doesn't test the specific feature you're changing

**In these cases:**
- Use existing content as a starting point
- Create supplementary test content for gaps
- Document what each piece of content tests
- Proceed to content creation step (see `content-creation.md`)

## Next Steps

**If you found suitable existing content:**
- ✅ Mark Step 1 complete in your CDD checklist
- ✅ Skip to Step 4 (Implementation) if no structural changes needed
- ✅ Proceed to Step 2 (Content Modeling) if making structural changes

**If no existing content was found:**
- ✅ Mark Step 1 complete in your CDD checklist
- ✅ Proceed to Step 2 (Content Modeling)
- ✅ Then Step 3 (Content Creation)

**For new blocks:**
- ✅ Mark Step 1 as N/A
- ✅ Proceed directly to Step 2 (Content Modeling)
