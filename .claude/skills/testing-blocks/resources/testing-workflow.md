# Complete Testing Workflow

This guide provides a step-by-step workflow for testing code changes from development through pull request approval.

## Workflow Phases

### Phase 1: During Development

#### 1. Write unit tests as you code

For any new utility functions or logic-heavy code, write unit tests alongside implementation:

```bash
# Open test in watch mode for immediate feedback
npm run test:watch
```

This gives you instant feedback as you develop. Tests should be passing before you consider code complete.

#### 2. Run tests in watch mode

Keep `npm run test:watch` running during development to catch regressions immediately.

#### 3. Manually test in browser

View your changes in the local dev server as you work:

```bash
# Start dev server if not already running
aem up
```

Navigate to your test content and verify the implementation looks and behaves correctly.

### Phase 2: Before Committing

#### 4. Run full test suite

Ensure all keeper tests pass:

```bash
npm test
```

If tests fail:
- Review the error messages
- Fix broken functionality OR update tests if requirements changed
- Re-run `npm test` until all pass

#### 5. Run linting

```bash
npm run lint
```

If linting fails:

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Manually fix remaining issues
# Re-run to verify
npm run lint
```

**Linting MUST pass before committing.** Non-negotiable.

#### 6. Write throwaway browser test

Create a temporary test script (e.g., `test-my-block.js`) to validate block behavior:

```javascript
// test-my-block.js (DO NOT COMMIT)
import { chromium } from 'playwright';

async function testMyBlock() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Test desktop
  await page.goto('http://localhost:3000/drafts/my-block-test');
  await page.waitForSelector('.my-block');
  await page.screenshot({ path: 'my-block-desktop.png', fullPage: true });

  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'my-block-mobile.png', fullPage: true });

  await browser.close();
}

testMyBlock().catch(console.error);
```

#### 7. Run browser test

Execute the script and review screenshots:

```bash
node test-my-block.js
```

Review each screenshot:
- Does it look correct?
- Are all variants working?
- Is responsive behavior correct?
- Do interactions work?

#### 8. Manual validation

Double-check test content in browser yourself. Don't rely solely on screenshots. Click around, test interactions, check on real devices if possible.

### Phase 3: Before Opening PR

#### 9. Commit and push

```bash
git add .
git commit -m "Your commit message"
git push -u origin your-feature-branch
```

#### 10. Verify branch is accessible

Check that your branch preview loads:

```
https://your-branch--repo--owner.aem.page/path/to/test-content
```

Visit this URL in your browser to ensure the content is accessible for PSI checks.

#### 11. Run `gh checks`

Verify CI checks pass:

```bash
gh pr checks
```

Or if you haven't created the PR yet, you can check branch status:

```bash
gh pr status
```

#### 12. Create PR with test link

Your PR description MUST include a test link for PSI checks:

```markdown
## Related Issues
Fixes #123

## Summary
Added new hero block with support for multiple variants.

## Testing
Preview: https://hero-block--shsteimer-com--shsteimer.aem.page/drafts/hero-test
```

The test link is required for automatic performance testing.

#### 13. Monitor GitHub checks

After creating the PR, monitor checks:

```bash
# Watch checks in real-time
gh pr checks --watch

# Or check once
gh pr checks
```

Wait for all checks to pass, especially PSI performance checks.

### Phase 4: After PR Review

#### 14. Address feedback

If reviewers request changes:
- Make the requested modifications
- Follow the same workflow (test, lint, browser test)

#### 15. Re-test

After making changes:

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Create new browser test if needed
node test-updated-block.js
```

#### 16. Verify checks pass

```bash
gh pr checks
```

Ensure all CI checks pass on the latest commit before requesting re-review.

## Quick Reference Checklist

Use this checklist for every code change:

**During Development:**
- [ ] Write unit tests for new utilities/logic
- [ ] Run `npm run test:watch` during development
- [ ] Manually test in browser at `http://localhost:3000`

**Before Committing:**
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - linting passes
- [ ] Write throwaway browser test script
- [ ] Run browser test and review screenshots
- [ ] Manually validate in browser

**Before Opening PR:**
- [ ] Commit and push to feature branch
- [ ] Verify branch preview loads
- [ ] Run `gh checks` to verify CI passes
- [ ] Create PR with test link for PSI checks
- [ ] Monitor `gh pr checks` until all pass

**After PR Review:**
- [ ] Address all feedback
- [ ] Re-run tests and linting
- [ ] Verify `gh pr checks` pass on latest commit

## Integration with Other Skills

This workflow integrates with other AEM skills:

**content-driven-development** provides:
- Test content URLs for validation
- Content model for testing against

**building-blocks** invokes testing-blocks:
- After block implementation
- With block name and test URLs

**This skill returns:**
- Confirmation tests pass
- Screenshots for validation
- Any issues discovered

## Common Workflow Variations

### For Bug Fixes

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Follow standard workflow

### For Refactoring

1. Ensure existing tests pass before starting
2. Make refactoring changes
3. Verify all tests still pass
4. No new tests needed if behavior unchanged

### For New Features

1. Follow content-driven-development first
2. Create test content
3. Implement feature with unit tests
4. Browser test to validate
5. Follow standard workflow

## Tips for Efficient Testing

**Use watch mode during development:**
```bash
npm run test:watch
```

**Run single test file:**
```bash
npm test -- test/utils/my-utility.test.js
```

**Run tests matching pattern:**
```bash
npm test -- --grep "checkDomain"
```

**Generate coverage report:**
```bash
npm run test:coverage
```

**Monitor GitHub checks continuously:**
```bash
gh pr checks --watch
```

## Next Steps

After completing this workflow:
1. Delete throwaway browser test scripts
2. Keep screenshots for PR, then delete
3. Celebrate passing tests! 🎉
4. Monitor PR for review feedback

Remember: The goal is confidence your code works, not perfection. Follow the workflow, fix what breaks, and ship with confidence.
