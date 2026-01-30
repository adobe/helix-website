---
name: Code Review
description: Review code for AEM Edge Delivery Services projects. Use at the end of development (before PR) for self-review, or to review pull requests. Validates code quality, performance, accessibility, and adherence to EDS best practices.
---

# Code Review

Review code for AEM Edge Delivery Services (EDS) projects following established coding standards, performance requirements, and best practices.

## When to Use This Skill

This skill supports **two modes** of operation:

### Mode 1: Self-Review (End of Development)

Use this mode when you've finished writing code and want to review it before committing or opening a PR. This is the recommended workflow integration point.

**When to invoke:**
- After completing implementation in the **content-driven-development** workflow (between Step 5 and Step 6)
- Before running `git add` and `git commit`
- When you want to catch issues early, before they reach PR review

**How to invoke:**
- Automatically: CDD workflow invokes this skill after implementation
- Manually: `/code-review` (reviews uncommitted changes in working directory)

**What it does:**
- Reviews all modified/new files in working directory
- Checks code quality, patterns, and best practices
- Validates against EDS standards
- Identifies issues to fix before committing
- Captures visual screenshots for validation

### Mode 2: PR Review

Use this mode to review an existing pull request (your own or someone else's).

**When to invoke:**
- Reviewing a PR before merge
- Automated review via GitHub Actions workflow
- Manual review of a specific PR

**How to invoke:**
- Manually: `/code-review <PR-number>` or `/code-review <PR-URL>`
- Automated: Via GitHub workflow on `pull_request` event

**What it does:**
- Fetches PR diff and changed files
- Validates PR structure (preview URLs, description)
- Reviews code quality
- Posts review comment with findings and screenshots

---

## Review Workflow

### Step 1: Identify Review Mode and Gather Context

**For Self-Review (no PR number provided):**

```bash
# See what files have been modified
git status

# See the actual changes
git diff

# For staged changes
git diff --staged
```

**Understand the scope:**
- What files were modified?
- What type of change is this? (new block, bug fix, feature, styling, refactor)
- What is the test content URL? (from CDD workflow)

**For PR Review (PR number provided):**

```bash
# Get PR details
gh pr view <PR-number> --json title,body,author,baseRefName,headRefName,files,additions,deletions

# Get changed files
gh pr diff <PR-number>

# Get PR comments and reviews
gh api repos/{owner}/{repo}/pulls/<PR-number>/comments
gh api repos/{owner}/{repo}/pulls/<PR-number>/reviews
```

**Understand the scope:**
- What type of change is this? (new block, bug fix, feature, styling, refactor)
- What files are modified?
- Is there a related GitHub issue?
- Are there test/preview URLs provided?

---

### Step 2: Validate Structure (PR Review Mode Only)

**Skip this step for Self-Review mode.**

**Required elements for PRs (MUST HAVE):**

| Element | Requirement | Check |
|---------|-------------|-------|
| Preview URLs | Before/After URLs showing the change | Required |
| Description | Clear explanation of what changed and why | Required |
| Scope alignment | Changes match PR title and description | Required |
| Issue reference | Link to GitHub issue (if applicable) | Recommended |

**Preview URL format:**
- Before: `https://main--{repo}--{owner}.aem.page/{path}`
- After: `https://{branch}--{repo}--{owner}.aem.page/{path}`

**Flag if missing:**
- Missing preview URLs (blocks automated PSI checks)
- Vague or missing description
- Scope creep (changes unrelated to stated purpose)
- Missing issue reference for bug fixes

---

### Step 3: Code Quality Review

#### 3.1 JavaScript Review

**Linting & Style:**
- [ ] Code passes ESLint (airbnb-base configuration)
- [ ] No `eslint-disable` comments without justification
- [ ] No global `eslint-disable` directives
- [ ] ES6+ features used appropriately
- [ ] `.js` extensions included in imports

**Architecture:**
- [ ] No frameworks in critical rendering path (LCP/TBT impact)
- [ ] Third-party libraries loaded via `loadScript()` in blocks, not `head.html`
- [ ] Consider `IntersectionObserver` for heavy libraries
- [ ] `aem.js` is NOT modified (submit upstream PRs for improvements)
- [ ] No build steps introduced without team consensus

**Code Patterns:**
- [ ] Existing DOM elements re-used, not recreated
- [ ] Block selectors scoped appropriately
- [ ] No hardcoded values that should be configurable
- [ ] Console statements cleaned up (no debug logs)
- [ ] Proper error handling where needed

**Common Issues to Flag:**
```javascript
// BAD: CSS in JavaScript
element.style.backgroundColor = 'blue';

// GOOD: Use CSS classes
element.classList.add('highlighted');

// BAD: Hardcoded configuration
const temperature = 0.7;

// GOOD: Use config or constants
const { temperature } = CONFIG;

// BAD: Global eslint-disable
/* eslint-disable */

// GOOD: Specific, justified disables
/* eslint-disable-next-line no-console -- intentional debug output */
```

#### 3.2 CSS Review

**Linting & Style:**
- [ ] Code passes Stylelint (standard configuration)
- [ ] No `!important` unless absolutely necessary (with justification)
- [ ] Property order maintained (don't reorder in functional PRs)

**Scoping & Selectors:**
- [ ] All selectors scoped to block: `.{block-name} .selector` or `main .{block-name}`
- [ ] Private classes/variables prefixed with block name
- [ ] Simple, readable selectors (add classes rather than complex selectors)
- [ ] ARIA attributes used for styling when appropriate (`[aria-expanded="true"]`)

**Responsive Design:**
- [ ] Mobile-first approach (base styles for mobile, media queries for larger)
- [ ] Standard breakpoints used: `600px`, `900px`, `1200px` (all `min-width`)
- [ ] No mixing of `min-width` and `max-width` queries
- [ ] Layout works across all viewports

**Frameworks & Preprocessors:**
- [ ] No CSS preprocessors (Sass, Less, PostCSS) without team consensus
- [ ] No CSS frameworks (Tailwind, etc.) without team consensus
- [ ] Native CSS features used (supported by evergreen browsers)

**Common Issues to Flag:**
```css
/* BAD: Unscoped selector */
.title { color: red; }

/* GOOD: Scoped to block */
main .my-block .title { color: red; }

/* BAD: !important abuse */
.button { color: white !important; }

/* GOOD: Increase specificity instead */
main .my-block .button { color: white; }

/* BAD: Mixed breakpoint directions */
@media (max-width: 600px) { }
@media (min-width: 900px) { }

/* GOOD: Consistent mobile-first */
@media (min-width: 600px) { }
@media (min-width: 900px) { }

/* BAD: CSS in JS patterns */
element.innerHTML = '<style>.foo { color: red; }</style>';

/* GOOD: Use external CSS files */
```

#### 3.3 HTML Review

- [ ] Semantic HTML5 elements used appropriately
- [ ] Proper heading hierarchy maintained
- [ ] Accessibility attributes present (ARIA labels, alt text)
- [ ] No inline styles or scripts in `head.html`
- [ ] Marketing tech NOT in `<head>` (performance impact)

---

### Step 4: Performance Review

**Critical Requirements:**
- [ ] Lighthouse scores green (ideally 100) for mobile AND desktop
- [ ] No third-party libraries in critical path (`head.html`)
- [ ] No layout shifts introduced (CLS impact)
- [ ] Images optimized and lazy-loaded appropriately

**Performance Checklist:**
- [ ] Heavy operations use `IntersectionObserver` or delayed loading
- [ ] No synchronous operations blocking render
- [ ] Bundle size reasonable (no minification unless measurable Lighthouse gain)
- [ ] Fonts loaded efficiently

**Preview URL Verification:**
If preview URLs provided, check:
- PageSpeed Insights scores
- Core Web Vitals (LCP, CLS, INP)
- Mobile and desktop performance

---

### Step 5: Visual Validation with Screenshots

**Purpose:** Capture screenshots of the preview URL to validate visual appearance. For self-review, this confirms your changes look correct before committing. For PR review, this provides visual evidence in the review comment.

**When to capture screenshots:**
- Always capture at least one screenshot of the primary changed page/component
- For responsive changes, capture mobile (375px), tablet (768px), and desktop (1200px)
- For visual changes (styling, layout), capture before AND after for comparison
- For block changes, capture the specific block area

**How to capture screenshots:**

**Option 1: Playwright (Recommended for automation)**

```javascript
// capture-screenshots.js
import { chromium } from 'playwright';

async function captureScreenshots(afterUrl, outputDir = './screenshots') {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Desktop screenshot
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(afterUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait for animations
  await page.screenshot({
    path: `${outputDir}/desktop.png`,
    fullPage: true
  });

  // Tablet screenshot
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({
    path: `${outputDir}/tablet.png`,
    fullPage: true
  });

  // Mobile screenshot
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({
    path: `${outputDir}/mobile.png`,
    fullPage: true
  });

  // Optional: Capture specific block/element
  const block = page.locator('.my-block');
  if (await block.count() > 0) {
    await block.screenshot({ path: `${outputDir}/block.png` });
  }

  await browser.close();

  return {
    desktop: `${outputDir}/desktop.png`,
    tablet: `${outputDir}/tablet.png`,
    mobile: `${outputDir}/mobile.png`
  };
}

// Usage
captureScreenshots('https://branch--repo--owner.aem.page/path');
```

**Option 2: Using MCP Browser Tools**

If you have MCP browser or Playwright tools available:
1. Navigate to the After preview URL
2. Take screenshots at different viewport sizes
3. Optionally take element-specific screenshots of changed blocks

**Option 3: Manual capture with guidance**

Instruct the reviewer or PR author to:
1. Open the After preview URL
2. Use browser DevTools to set viewport sizes
3. Take screenshots and attach to PR

**Uploading screenshots to GitHub:**

```bash
# Upload screenshot as PR comment with image
# First, upload to a hosting service or use GitHub's image upload

# Option A: Embed in PR comment (drag & drop in GitHub UI)
gh pr comment <PR-number> --body "## Visual Preview

### Desktop (1200px)
![Desktop Screenshot](screenshot-url-or-drag-drop)

### Mobile (375px)
![Mobile Screenshot](screenshot-url-or-drag-drop)
"

# Option B: Use GitHub's attachment API (for automation)
# Screenshots can be uploaded as part of the comment body
```

**Screenshot checklist:**
- [ ] Primary page/component captured at desktop width
- [ ] Mobile viewport captured (if responsive changes)
- [ ] Specific block/component captured (if block changes)
- [ ] Before/After comparison (if significant visual changes)
- [ ] No sensitive data visible in screenshots
- [ ] Screenshots uploaded and embedded in PR comment

**Visual issues to look for:**
- Layout breaks or misalignment
- Text overflow or truncation
- Image sizing or aspect ratio issues
- Color/contrast problems (especially in dark mode)
- Missing or broken icons
- Responsive layout issues at breakpoints
- Unexpected visual differences from main branch

---

### Step 6: Content & Authoring Review

**Content Model (if applicable):**
- [ ] Content structure author-friendly
- [ ] Backward compatibility maintained with existing content
- [ ] No breaking changes requiring content migration
- [ ] New content features only available after preview/publish

**Static Resources:**
- [ ] No binaries/static assets committed (unless code-referenced)
- [ ] User-facing strings sourced from content (placeholders, spreadsheets)
- [ ] No hardcoded literals that should be translatable

---

### Step 7: Security Review

- [ ] No sensitive data committed (API keys, passwords, secrets)
- [ ] No XSS vulnerabilities (unsafe innerHTML, unsanitized user input)
- [ ] No SQL injection or command injection vectors
- [ ] CSP headers appropriate for tool pages
- [ ] External links have `rel="noopener noreferrer"`

---

### Step 8: Generate Review Summary

**Output depends on the review mode:**

#### For Self-Review Mode (End of Development)

Report findings directly to continue the development workflow:

```markdown
## Code Review Summary

### Files Reviewed
- `blocks/my-block/my-block.js` (new)
- `blocks/my-block/my-block.css` (new)

### Visual Validation
![Desktop Screenshot](path/to/screenshot.png)

✅ Layout renders correctly across viewports
✅ No console errors
✅ Responsive behavior verified

### Issues Found

#### Must Fix Before Committing
- [ ] `blocks/my-block/my-block.js:45` - Remove console.log debug statement
- [ ] `blocks/my-block/my-block.css:12` - Selector `.title` needs block scoping

#### Recommendations
- [ ] Consider using `loadScript()` for the external library

### Ready to Commit?
- [ ] All "Must Fix" issues resolved
- [ ] Linting passes: `npm run lint`
- [ ] Visual validation complete
```

**After self-review:** Fix any issues found, then proceed with committing and opening a PR.

#### For PR Review Mode

Structure the review comment for GitHub:

```markdown
## PR Review Summary

### Overview
[Brief summary of the PR and its purpose]

### Preview URLs Validated
- [ ] Before: [URL]
- [ ] After: [URL]

### Visual Preview

#### Desktop (1200px)
![Desktop Screenshot](url-or-embedded-image)

#### Mobile (375px)
![Mobile Screenshot](url-or-embedded-image)

<details>
<summary>Additional Screenshots</summary>

#### Tablet (768px)
![Tablet Screenshot](url-or-embedded-image)

#### Block Detail
![Block Screenshot](url-or-embedded-image)

</details>

### Visual Assessment
- [ ] Layout renders correctly across viewports
- [ ] No visual regressions from main branch
- [ ] Colors and typography consistent
- [ ] Images and icons display properly

### Checklist Results

#### Must Fix (Blocking)
- [ ] [Critical issue with file:line reference]

#### Should Fix (High Priority)
- [ ] [Important issue with file:line reference]

#### Consider (Suggestions)
- [ ] [Nice-to-have improvement]

### Detailed Findings

#### [Category: e.g., JavaScript, CSS, Performance]
**File:** `path/to/file.js:123`
**Issue:** [Description of the issue]
**Suggestion:** [How to fix it]
```

---

## Review Priority Levels

### Must Fix (Blocking)
Issues that MUST be resolved before merge:
- Missing preview URLs
- Linting failures
- Security vulnerabilities
- Breaking existing functionality
- Performance regressions (Lighthouse score drop)
- Accessibility violations
- Modifications to `aem.js`

### Should Fix (High Priority)
Issues that SHOULD be resolved:
- `!important` usage without justification
- Unscoped CSS selectors
- Hardcoded values that should be configurable
- Missing error handling
- Console statements left in code
- CSS in JavaScript

### Consider (Suggestions)
Improvements to consider:
- Code organization
- Naming conventions
- Documentation
- Additional test coverage
- Modern API usage opportunities

---

## Common Review Patterns

Based on actual PR reviews, watch for these patterns:

### CSS Issues
- **"No CSS in JS, please"** - Inline styles should use CSS classes
- **"Use proper CSS"** - Avoid style manipulation in JavaScript
- **"Do we need the `!important`?"** - Strong preference against `!important`
- **"Solvable with more CSS specificity"** - Increase specificity instead of `!important`

### JavaScript Issues
- **"Why is it hardcoded here?"** - Configuration should be externalized
- **"No global eslint-disable directives"** - Specific, justified disables only
- **"Clean up console messages"** - Remove debug logging
- **"Use proper feature (e.g., decorateIcons, loadScript)"** - Leverage existing utilities

### Architecture Issues
- **"Use existing patterns"** - Check if similar functionality exists
- **"Consider IntersectionObserver"** - For lazy loading
- **"Extract and align design tokens"** - Use CSS custom properties

### Content Issues
- **"Check the type in content config"** - Validate against expected schema
- **"Is this feature needed?"** - Question value vs complexity

---

## Review Response Templates

### Approval
```markdown
## Approved

Preview URLs verified and changes look good.

### Visual Preview
![Desktop Screenshot](url-or-embedded-image)

<details>
<summary>Mobile View</summary>

![Mobile Screenshot](url-or-embedded-image)

</details>

**Verified:**
- [x] Code quality and linting
- [x] Performance (Lighthouse scores)
- [x] Visual appearance (screenshots captured)
- [x] Responsive behavior
- [x] Accessibility basics

[Any additional notes]
```

### Request Changes
```markdown
## Changes Requested

### Blocking Issues
[List with file:line references]

### Suggestions
[List of recommendations]

Please address the blocking issues before merge.
```

### Comment
```markdown
## Review Notes

[Non-blocking observations and questions]
```

---

## Integration with GitHub Workflow

When triggered via GitHub Actions, the skill should:

1. **Receive:** PR number, repository info, event context
2. **Execute:** Full review workflow above
3. **Output:**
   - Review comment on the PR
   - Appropriate review status (approve/request-changes/comment)
   - Summary posted as PR comment

**GitHub Actions integration points:**
- `pull_request` event triggers
- `gh pr review` for posting reviews
- `gh pr comment` for detailed feedback

---

## Resources

- **EDS Development Guidelines:** https://www.aem.live/docs/dev-collab-and-good-practices
- **Performance Best Practices:** https://www.aem.live/developer/keeping-it-100
- **Block Development:** https://www.aem.live/developer/block-collection
- **David's Model:** https://www.aem.live/docs/davidsmodel

---

## Success Criteria

### For Self-Review Mode

A complete self-review should:
- [ ] Review all modified/new files
- [ ] Check code against all quality criteria
- [ ] Run linting and fix issues
- [ ] Capture visual screenshots of test content
- [ ] Verify responsive behavior across viewports
- [ ] Identify issues to fix before committing
- [ ] Confirm code is ready for commit and PR

### For PR Review Mode

A complete PR review should:
- [ ] Validate all PR structure requirements (preview URLs, description)
- [ ] Check code against all quality criteria
- [ ] Verify performance requirements
- [ ] Capture and include visual screenshots
- [ ] Assess visual appearance for regressions
- [ ] Assess content/authoring impact
- [ ] Identify security concerns
- [ ] Provide actionable feedback with specific references
- [ ] Include screenshots in PR review comment
- [ ] Use appropriate review status (approve/request-changes/comment)

---

## Integration with Content-Driven Development

This skill integrates with the **content-driven-development** workflow:

```
CDD Workflow:
Step 1: Start dev server
Step 2: Analyze & plan
Step 3: Design content model
Step 4: Identify/create test content
Step 5: Implement (building-blocks skill)
    └── testing-blocks skill (browser testing)
        └── **code-review skill (self-review)** ← Invoke here
Step 6: Lint & test
Step 7: Final validation
Step 8: Ship it (commit & PR)
```

**Recommended invocation point:** After implementation and testing-blocks skill complete, before final linting and committing.

**What this catches before PR:**
- Code quality issues
- EDS pattern violations
- Security concerns
- Performance problems
- Visual regressions

**Benefits of self-review:**
- Catch issues early (cheaper to fix)
- Cleaner PRs with fewer review cycles
- Learn from immediate feedback
- Consistent code quality
