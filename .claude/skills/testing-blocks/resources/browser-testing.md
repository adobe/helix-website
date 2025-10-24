# Browser Testing Guide

Browser testing validates that blocks, DOM transformations, and visual elements work correctly in a real browser environment. These are throwaway tests - use them once to validate, capture screenshots, then discard them.

## When to Use Browser Testing

Use browser testing for:
- **Block decoration validation** - Does the block transform HTML correctly?
- **Visual appearance** - Does it look right at different screen sizes?
- **Interactive behavior** - Do click handlers, forms, and interactions work?
- **DOM structure** - Is the final rendered HTML correct?
- **Responsive design** - Does it work on mobile, tablet, desktop?

## Browser Testing Tools

### Option 1: Playwright (Recommended)

Playwright provides a full browser automation API with excellent developer experience.

**Setup:**

```bash
npm install --save-dev playwright
npx playwright install chromium
```

**Example throwaway test script:**

```javascript
// test-hero-block.js (DO NOT COMMIT)
import { chromium } from 'playwright';

async function testHeroBlock() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to test content
  await page.goto('http://localhost:3000/drafts/hero-test');

  // Wait for block decoration
  await page.waitForSelector('.hero');

  // Take screenshot for validation
  await page.screenshot({ path: 'hero-desktop.png', fullPage: true });

  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'hero-mobile.png', fullPage: true });

  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: 'hero-tablet.png', fullPage: true });

  // Validate DOM structure
  const heroTitle = await page.textContent('.hero h1');
  console.log('Hero title:', heroTitle);

  // Test interactions
  const button = page.locator('.hero .button');
  await button.click();
  await page.waitForTimeout(1000); // Wait for any animations

  await browser.close();
}

testHeroBlock().catch(console.error);
```

**Run the test:**

```bash
node test-hero-block.js
```

### Option 2: Puppeteer

Similar to Playwright but older. Use if Playwright isn't suitable.

```bash
npm install --save-dev puppeteer
```

API is very similar to Playwright. Substitute `puppeteer` for `playwright` in import statements.

### Option 3: Browser MCP

If you have access to a Browser MCP server, use it for interactive browser testing through Claude's tools.

## Browser Testing Workflow

### 1. Ensure dev server is running

```bash
aem up
```

Note the port (usually 3000).

### 2. Write throwaway test script

Create a temporary script file (e.g., `test-my-block.js`) with:
- Navigation to test content URL
- Waiting for block decoration
- Taking screenshots at multiple viewports
- Validating DOM structure or behavior
- Testing interactions

### 3. Run the script

```bash
node test-my-block.js
```

### 4. Review screenshots

- Examine screenshots visually to validate appearance
- Show screenshots to the user for feedback if needed
- Include screenshots in PR description to aid review

### 5. Clean up

- Delete the test script (don't commit)
- Keep screenshots temporarily for PR, then delete

## Common Testing Scenarios

### Testing Multiple Variants

```javascript
async function testBlockVariants() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const variants = ['default', 'dark', 'light', 'wide'];

  for (const variant of variants) {
    await page.goto(`http://localhost:3000/drafts/hero-${variant}`);
    await page.waitForSelector('.hero');
    await page.screenshot({
      path: `hero-${variant}.png`,
      fullPage: true
    });
  }

  await browser.close();
}
```

### Testing Interactive Elements

```javascript
async function testForm() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/drafts/contact-form');
  await page.waitForSelector('.form');

  // Fill out form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="message"]', 'Test message');

  // Take screenshot of filled form
  await page.screenshot({ path: 'form-filled.png' });

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for success message
  await page.waitForSelector('.form-success');
  await page.screenshot({ path: 'form-success.png' });

  await browser.close();
}
```

### Testing Animations and Transitions

```javascript
async function testCarousel() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/drafts/carousel');
  await page.waitForSelector('.carousel');

  // Initial state
  await page.screenshot({ path: 'carousel-1.png' });

  // Click next button
  await page.click('.carousel-next');
  await page.waitForTimeout(500); // Wait for animation
  await page.screenshot({ path: 'carousel-2.png' });

  // Click next again
  await page.click('.carousel-next');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'carousel-3.png' });

  await browser.close();
}
```

### Testing Responsive Behavior

```javascript
async function testResponsive() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/drafts/header');
  await page.waitForSelector('.header');

  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: 'header-desktop.png' });

  // Tablet landscape
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: 'header-tablet-landscape.png' });

  // Tablet portrait
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: 'header-tablet-portrait.png' });

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'header-mobile.png' });

  await browser.close();
}
```

## Browser Testing Best Practices

### DO:
- ✅ Test all viewport sizes (mobile, tablet, desktop)
- ✅ Take screenshots for visual validation
- ✅ Test all block variants in one script
- ✅ Wait for block decoration before capturing state
- ✅ Test interactive elements (clicks, forms, etc.)
- ✅ Show screenshots to humans for feedback
- ✅ Include screenshots in PRs to help reviewers

### DON'T:
- ❌ Commit throwaway test scripts to the repository
- ❌ Try to automate visual regression testing (not worth the maintenance)
- ❌ Write brittle assertions about specific DOM structure
- ❌ Spend time making these tests maintainable (they're throwaway)
- ❌ Test the same thing in both unit tests and browser tests

## Playwright Tips and Tricks

### Waiting for elements

```javascript
// Wait for selector
await page.waitForSelector('.my-block');

// Wait for specific text
await page.waitForSelector('text=Click me');

// Wait for network idle
await page.waitForLoadState('networkidle');
```

### Taking targeted screenshots

```javascript
// Screenshot of specific element
await page.locator('.hero').screenshot({ path: 'hero-only.png' });

// Full page screenshot
await page.screenshot({ path: 'full-page.png', fullPage: true });

// Screenshot with specific viewport
await page.screenshot({
  path: 'mobile.png',
  fullPage: true,
  clip: { x: 0, y: 0, width: 375, height: 812 }
});
```

### Debugging

```javascript
// Launch browser in non-headless mode
const browser = await chromium.launch({ headless: false });

// Slow down actions
const browser = await chromium.launch({ slowMo: 500 });

// Pause execution
await page.pause();
```

### Extracting data

```javascript
// Get text content
const text = await page.textContent('.selector');

// Get attribute value
const href = await page.getAttribute('a', 'href');

// Check if element exists
const exists = await page.locator('.selector').count() > 0;

// Get all matching elements
const items = await page.$$eval('.item', els => els.map(el => el.textContent));
```

## When Browser Tests Are Worth Keeping

In rare cases, browser tests might be worth committing and maintaining:

1. **Critical user flows** - Checkout process, authentication, critical forms
2. **Cross-browser compatibility** - When you need to test in multiple browsers
3. **Accessibility testing** - Using specialized tools like axe-core

Even in these cases, keep tests focused on critical functionality only. The cost of maintaining browser tests is high.

## Next Steps

After browser testing:
1. Review all screenshots carefully
2. Show screenshots to stakeholders if needed
3. Include key screenshots in your PR
4. Delete the test script (don't commit it)
5. Move on to other testing methods (linting, unit tests, etc.)

Remember: Browser tests are a validation tool, not a regression prevention tool. Use them to confirm your implementation works, then move on.
