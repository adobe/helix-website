# Content Creation

Once the content model is defined, you need test content to develop against. This guide covers creating test content in the CMS or as local HTML files.

## Choosing Content Creation Method

Present the user with these options:

"We need test content for development and validation. This content will serve multiple purposes:
- Testing during development
- PR validation link for PSI checks
- Potentially serving as author documentation and examples

Would you like to:
1. **Create this content in the CMS now** (Google Drive/SharePoint/DA/Universal Editor) - Recommended
2. **Create temporary local HTML files for testing** (will need CMS content before PR)"

### Option 1: CMS Content (Recommended)

**Benefits:**
- Serves as PR validation link (required for PSI checks)
- Authors can use it as reference/documentation
- Tests the full authoring → delivery pipeline
- Realistic content creation experience

**When to use:**
- You have CMS access
- Content can serve dual purpose (testing + documentation)
- Building production-ready features
- PR will be opened soon

### Option 2: Local HTML Files (Temporary)

**Benefits:**
- Faster initial setup
- No CMS access required
- Full control over structure
- Easy to iterate quickly

**Drawbacks:**
- Must create CMS content before PR
- Doesn't test authoring experience
- No PR validation link yet
- Additional work later

**When to use:**
- Rapid prototyping
- No CMS access available
- Early exploration/experimentation
- Will create CMS content before PR

## Creating CMS Content

### Step 1: Prepare Content Model Reference

Have the content model documentation ready:
- Initial HTML structure
- Authoring pattern (table structure, fields, etc.)
- Variants and options
- Example content

### Step 2: Guide the User

**For Document Authoring (Google Drive/SharePoint):**

Provide clear instructions:
1. "Create a new document in your authoring environment"
2. "Use this structure:" (provide table/content structure)
3. "Example content to include:" (provide realistic examples)
4. "Preview the content in AEM"
5. "Provide the content URL when ready"

**For Universal Editor:**

Provide clear instructions:
1. "Create a new page/component in Universal Editor"
2. "Configure these fields:" (list fields and values)
3. "Example values:" (provide realistic examples)
4. "Publish/preview the content"
5. "Provide the content URL when ready"

### Step 3: Wait for User Confirmation

**User provides:**
- Content URL(s) for testing
- Confirmation content is published/previewed
- Any notes about the content

### Step 4: Validate Content

Once the user provides URLs, validate the content:

```bash
# Ensure dev server is running
aem up

# Test the URL loads
curl -I http://localhost:3000/path/to/content

# Inspect the structure
curl http://localhost:3000/path/to/content
```

**Verify in browser:**
- Open URL in browser
- Check structure matches content model
- Verify content renders (even without decoration)
- Confirm all expected elements are present

**If validation fails:**
- Identify the issue
- Guide user to fix authoring
- Re-validate until correct

### Step 5: Document Test URLs

Keep track of test content URLs:
- Primary test page
- Variant examples
- Edge case examples
- These will be used for PR validation links

## Creating Local HTML Files

### Step 1: Understand HTML Structure

Review `resources/html-structure.md` for detailed guidance on creating proper HTML files.

**Key requirements:**
- Copy `head.html` content
- Use proper semantic HTML
- Match the content model structure
- Include realistic content

### Step 2: Create HTML File

**Location:**
```
drafts/tmp/{block-name}.html
```

**Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Copy entire contents of head.html here -->
  <title>Test: Block Name</title>
</head>
<body>
  <header></header>
  <main>
    <div>
      <!-- Your test content here following the content model -->
      <div class="block-name">
        <!-- Block content structure -->
      </div>
    </div>
  </main>
  <footer></footer>
</body>
</html>
```

**Full guidance:** See `resources/html-structure.md`

### Step 3: Create Multiple Test Files

Create different files for different scenarios:

```
drafts/tmp/hero-basic.html       # Basic usage
drafts/tmp/hero-dark.html         # Dark variant
drafts/tmp/hero-long-content.html # Edge case: long text
drafts/tmp/hero-no-image.html     # Edge case: missing image
```

### Step 4: Start Dev Server with Drafts Folder

```bash
# Start server with drafts folder enabled
aem up --html-folder drafts
```

**Important:** The folder path is included in the URL:
```
File: drafts/tmp/hero-basic.html
URL:  http://localhost:3000/drafts/tmp/hero-basic
```

### Step 5: Validate Local Content

**Test in browser:**
- Open each test URL
- Verify structure is correct
- Check content renders as expected
- Confirm matches content model

**Common issues:**
- Missing `head.html` content → Blocks aren't loaded and decorated, Styles don't load
- Wrong file location → 404 errors
- Incorrect path in URL → 404 errors
- Malformed HTML → Rendering issues

### Step 6: Plan CMS Content Creation

**Before PR, you MUST create actual CMS content.**

Remind the user:
"These local HTML files are for development only. Before opening a PR, we'll need to create this content in the CMS for the PR validation link."

Plan when to create CMS content:
- After initial implementation is working
- Before opening PR
- When feature is stable

## Content as Documentation

Test content can often double as author-facing documentation, saving time and keeping documentation current.

### When Test Content IS Sufficient Documentation

**Content can serve both purposes when:**
- Block is straightforward with clear patterns
- Test content shows all variants and use cases
- Examples demonstrate best practices
- Content is realistic and relatable

**Make test content documentation-ready:**
1. Use realistic, high-quality examples
2. Show all variants and common patterns
3. Include edge cases with clear labels
4. Place in documentation-friendly location

### When Separate Documentation is Needed

**Create separate docs when:**
- Block has complex configuration requiring explanation
- Edge cases or gotchas need context
- Project requires formal documentation
- Block behavior isn't self-evident

### Structuring Test Content for Documentation

**Ask the user:**
"Should this test content also serve as author documentation? If so, we can structure it accordingly and place it in an appropriate location."

**Documentation-friendly locations:**

**For Sidekick Library projects:**
```
/tools/sidekick/library/{block-name}/
```

**For Document Authoring:**
```
/drafts/library/{block-name}/
/drafts/docs/blocks/{block-name}/
```

**For Universal Editor:**
Follow project-specific documentation patterns

**Content structure for documentation:**
- Clear, descriptive page titles
- Multiple examples showing variations
- Comments or notes explaining usage
- Realistic, production-quality content

## Content Variety and Coverage

Good test content covers multiple scenarios:

### Basic Usage
- Simplest, most common pattern
- Minimal content
- Default variant
- "Happy path" example

### Variants
- Each variant documented in content model
- Combinations of variants if applicable
- Clear labels identifying what's being tested

### Edge Cases

**Content length:**
- Very short content (single word headings)
- Very long content (paragraphs, multiple CTAs)
- Empty optional fields

**Content types:**
- With images
- Without images
- Multiple images
- Different media types

**Structural variations:**
- Minimum required fields
- Maximum fields populated
- Optional elements included/excluded

### Real-World Scenarios

**Realistic content examples:**
- Actual use cases from site
- Representative of production content
- Demonstrates best practices
- Shows how authors will actually use it

## Validating Test Content Quality

Before proceeding to implementation, ensure test content is:

**Structurally correct:**
- ✅ Matches content model exactly
- ✅ Includes all required elements
- ✅ Properly formatted HTML/CMS structure

**Comprehensive:**
- ✅ Covers basic usage
- ✅ Includes all variants
- ✅ Tests edge cases
- ✅ Represents real-world scenarios

**Functional:**
- ✅ Loads in dev environment
- ✅ Renders correctly (even undecorated)
- ✅ Accessible via expected URLs

**Ready for development:**
- ✅ URLs documented and accessible
- ✅ Multiple test scenarios available
- ✅ Edge cases identified

## Next Steps

**After test content is created:**
- ✅ Mark Step 3 complete in your CDD checklist
- ✅ Document test content URLs
- ✅ Proceed to Step 4 (Implementation)
- ✅ Keep test URLs handy for continuous validation

**For local HTML only:**
- ⚠️ Note: CMS content required before PR
- ⚠️ Plan when to create CMS version
- ⚠️ Use local files for development only

**Content ready checklist:**
- [ ] Test content created (CMS or local HTML)
- [ ] URLs accessible in dev environment
- [ ] Content matches content model
- [ ] Variants and edge cases covered
- [ ] Documentation approach decided
