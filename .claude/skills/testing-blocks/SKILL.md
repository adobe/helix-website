---
name: Testing Blocks
description: Guide for testing code changes in AEM Edge Delivery projects including blocks, scripts, and styles. Use this skill after making code changes and before opening a pull request to validate functionality. Covers unit testing for utilities and logic, browser testing with Playwright, linting, and guidance on what to test and how
---

# Testing Blocks

This skill guides you through testing code changes in AEM Edge Delivery Services projects. Testing follows a value-versus-cost philosophy: create and maintain tests when the value they bring exceeds the cost of creation and maintenance.

**CRITICAL: Browser validation is MANDATORY. You cannot complete this skill without providing proof of functional testing in a real browser environment.**

## Related Skills

- **content-driven-development**: Test content created during CDD serves as the basis for testing
- **building-blocks**: This skill is automatically invoked after block implementation
- **block-collection-and-party**: May provide reference test patterns from similar blocks

## When to Use This Skill

Use this skill:
- ✅ After implementing or modifying blocks
- ✅ After changes to core scripts (scripts.js, delayed.js, aem.js)
- ✅ After style changes (styles.css, lazy-styles.css)
- ✅ After configuration changes that affect functionality
- ✅ Before opening any pull request with code changes

This skill should be automatically invoked by the **building-blocks** skill after implementation is complete.

## Testing Checklist

Copy this checklist and track your progress:

- [ ] Step 1: Perform browser validation. See "Browser Testing" section below and `resources/browser-testing.md`
- [ ] Step 2: Determine if unit tests are needed. See `resources/testing-philosophy.md`
- [ ] Step 3: Add unit tests, if necessary. See "Unit Testing" section below and `resources/unit-testing.md`
- [ ] Step 4: Verify existing tests and lint checks pass. See "Verification" section below

## Browser Testing

**What to test:** Block decoration, visual validation, DOM structure, responsive design, and more **MUST** be validated in a real browser

**Quick start:**

Use one of three options to test in a real browser environment.

1. **Playwright MCP** (Recommended) - Use MCP tools directly, no scripts needed
2. **Playwright Scripts** - Write Node.js automation scripts for full control
3. **Browser MCP** - Use basic MCP browser tools if available

**Detailed guide:** See `resources/browser-testing.md`

## Unit Testing

**What to test:** Logic-heavy functions, utilities, data processing, API integrations

**Quick start:**
```bash
# Verify test setup (see resources/vitest-setup.md if not configured)
npm test

# Write test for utility function
# test/utils/my-utility.test.js
import { describe, it, expect } from 'vitest';
import { myUtility } from '../../scripts/utils/my-utility.js';

describe('myUtility', () => {
  it('should transform input correctly', () => {
    expect(myUtility('input')).toBe('OUTPUT');
  });
});
```

**Detailed guide:** See `resources/unit-testing.md`

## Verification

### Linting

**When to use:** Before every commit

**Quick start:**
```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Linting MUST pass before opening a PR.** Non-negotiable.

### Existing Tests Pass

**When to use:** Before every commit

**Quick start:**
```bash
# Run tests
npm run test
```

Analyze and fix any test failures.

**All tests MUST pass before opening a PR.** Non-negotiable.

## Troubleshooting

For detailed troubleshooting guide, see `resources/troubleshooting.md`.

**Common issues:**

### Tests fail
- Read error message carefully
- Run single test: `npm test -- path/to/test.js`
- Fix code or update test

### Linting fails
- Run `npm run lint:fix`
- Manually fix remaining issues

### Browser tests fail
- Verify dev server running: `aem up --html-folder drafts`
- Check test content exists in `drafts/tmp/`
- Verify URL uses `/tmp/` path: `http://localhost:3000/drafts/tmp/my-block`
- Add waits: `await page.waitForSelector('.block')`

## Resources

- **Browser Testing:** `resources/browser-testing.md` - Playwright workflows and best practices
- **Unit Testing:** `resources/unit-testing.md` - Complete guide to writing and maintaining unit tests
- **Testing Workflow:** `resources/testing-workflow.md` - Step-by-step workflow from dev to PR
- **Troubleshooting:** `resources/troubleshooting.md` - Solutions to common testing issues
- **Vitest Setup:** `resources/vitest-setup.md` - One-time configuration guide
- **Testing Philosophy:** `resources/testing-philosophy.md` - Guide on what and how to test

## Integration with Building Blocks Skill

The **building-blocks** skill automatically invokes this skill after implementation.

**Expected flow:**
1. Building blocks completes implementation
2. Invokes **testing-blocks** skill
3. This skill guides testing process
4. Returns control when testing complete

**Building blocks provides:**
- Block name being tested
- Test content URL from CDD process
- Any variants that need testing

**This skill returns:**
- Confirmation all tests pass
- Screenshots from browser testing
- Any issues discovered during testing
