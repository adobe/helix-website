---
name: PR Review
description: Review pull requests for AEM Edge Delivery Services projects. Validates code quality, performance, accessibility, and adherence to EDS best practices. Provides actionable feedback with specific line references and suggestions.
---

# PR Review

Review pull requests for AEM Edge Delivery Services (EDS) projects following established coding standards, performance requirements, and best practices.

## When to Use This Skill

Use this skill when:
- Reviewing a pull request for an EDS project
- Validating code changes before merge
- Checking adherence to EDS coding standards
- Verifying performance and accessibility requirements

This skill can be triggered:
- Manually by invoking `/pr-review <PR-URL-or-number>`
- Automatically via GitHub workflow (when configured)

## Review Workflow

### Step 1: Gather PR Context

**Fetch PR information:**
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

### Step 2: Validate PR Structure

**Required elements (MUST HAVE):**

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

### Step 5: Content & Authoring Review

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

### Step 6: Security Review

- [ ] No sensitive data committed (API keys, passwords, secrets)
- [ ] No XSS vulnerabilities (unsafe innerHTML, unsanitized user input)
- [ ] No SQL injection or command injection vectors
- [ ] CSP headers appropriate for tool pages
- [ ] External links have `rel="noopener noreferrer"`

---

### Step 7: Generate Review Summary

**Structure your review as:**

```markdown
## PR Review Summary

### Overview
[Brief summary of the PR and its purpose]

### Preview URLs Validated
- [ ] Before: [URL]
- [ ] After: [URL]

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

**Verified:**
- [ ] Code quality and linting
- [ ] Performance (Lighthouse scores)
- [ ] Responsive behavior
- [ ] Accessibility basics

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

A complete PR review should:
- [ ] Validate all PR structure requirements
- [ ] Check code against all quality criteria
- [ ] Verify performance requirements
- [ ] Assess content/authoring impact
- [ ] Identify security concerns
- [ ] Provide actionable feedback with specific references
- [ ] Use appropriate review status (approve/request-changes/comment)
