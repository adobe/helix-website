#!/usr/bin/env node

/**
 * Automated Web Accessibility Checker
 * Uses axe-core via Playwright to run WCAG 2.2 Level A/AA automated tests
 *
 * Usage:
 *   node automated-checks.js <url> [--output violations.json] [--no-headless]
 *
 * Examples:
 *   node automated-checks.js https://example.com
 *   node automated-checks.js https://example.com --output report.json
 *   node automated-checks.js http://localhost:3000 --no-headless
 *
 * Requirements:
 *   npm install playwright @axe-core/playwright
 */

import fs from 'fs';

// Lazy import to provide better error messages
let chromium;
let AxeBuilder;

try {
  const playwright = await import('playwright');
  chromium = playwright.chromium;
  const axeModule = await import('@axe-core/playwright');
  AxeBuilder = axeModule.default;
} catch (e) {
  console.error(`Error: Missing required packages: ${e.message}`);
  console.error('\nInstall dependencies with:');
  console.error('  npm install playwright @axe-core/playwright');
  process.exit(1);
}

// POUR principle rule mappings (moved to module level to avoid recreation)
// These map axe-core rule IDs to WCAG POUR principles
const POUR_RULES = {
  // Perceivable (1.x success criteria)
  Perceivable: [
    'image-alt', 'input-image-alt', 'area-alt', 'object-alt',
    'video-caption', 'audio-caption', 'video-description',
    'color-contrast', 'color-contrast-enhanced',
    'aria-hidden-body', 'aria-text',
    'heading-order', 'p-as-heading',
    'meta-viewport', 'meta-viewport-large'
  ],
  // Operable (2.x success criteria)
  Operable: [
    'accesskeys', 'tabindex', 'focus-order-semantics',
    'bypass', 'skip-link',
    'link-in-text-block', 'link-name',
    'button-name', 'frame-title',
    'meta-refresh', 'meta-refresh-no-exceptions',
    'scrollable-region-focusable'
  ],
  // Understandable (3.x success criteria)
  Understandable: [
    'html-lang-valid', 'html-has-lang', 'valid-lang',
    'label', 'label-title-only', 'label-content-name-mismatch',
    'form-field-multiple-labels',
    'autocomplete-valid', 'input-button-name'
  ],
  // Robust (4.x success criteria)
  Robust: [
    'aria-valid-attr', 'aria-valid-attr-value',
    'aria-allowed-attr', 'aria-required-attr',
    'aria-required-children', 'aria-required-parent',
    'aria-roles', 'aria-allowed-role',
    'duplicate-id', 'duplicate-id-active', 'duplicate-id-aria',
    'list', 'listitem', 'definition-list', 'dlitem'
  ]
};

/**
 * Automated accessibility checker using axe-core
 */
class AccessibilityChecker {
  /**
   * @param {boolean} headless - Run browser in headless mode
   */
  constructor(headless = true) {
    this.headless = headless;
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize Playwright browser and page
   */
  async setupBrowser() {
    this.browser = await chromium.launch({
      headless: this.headless,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Run axe-core accessibility checks on the given URL
   * @param {string} url - The URL to check
   * @returns {Promise<Object>} Dictionary with violations, passes, and metadata
   */
  async checkUrl(url) {
    if (!this.browser) {
      await this.setupBrowser();
    }

    console.error(`Loading ${url}...`);
    await this.page.goto(url, { waitUntil: 'networkidle' });

    // Run axe-core with WCAG 2.2 Level A and AA rules
    console.error('Running accessibility checks...');
    const axe = new AxeBuilder({ page: this.page });

    const results = await axe
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
      .analyze();

    // Enhance violations with additional metadata
    const enhanced = this._enhanceResults(results, url);

    return enhanced;
  }

  /**
   * Enhance axe results with additional categorization and metadata
   *
   * Note: Output uses snake_case for property names (wcag_level, pour_principle, etc.)
   * to maintain consistency with axe-core's output format and external API contract.
   *
   * @param {Object} results - Raw axe-core results
   * @param {string} url - The tested URL
   * @returns {Object} Enhanced results dictionary
   */
  _enhanceResults(results, url) {
    const violations = results.violations || [];
    const passes = results.passes || [];

    // Categorize violations by WCAG level
    const levelAViolations = [];
    const levelAAViolations = [];
    const levelAAAViolations = [];

    // Categorize by POUR principle
    const perceivable = [];
    const operable = [];
    const understandable = [];
    const robust = [];

    for (const violation of violations) {
      // Determine WCAG level from tags
      const tags = violation.tags || [];
      const wcagLevel = this._getWcagLevel(tags);
      violation.wcag_level = wcagLevel;

      // Add severity mapping
      const impact = violation.impact || 'moderate';
      violation.severity = this._mapSeverity(impact);

      // Categorize by level
      if (wcagLevel === 'A') {
        levelAViolations.push(violation);
      } else if (wcagLevel === 'AA') {
        levelAAViolations.push(violation);
      } else if (wcagLevel === 'AAA') {
        levelAAAViolations.push(violation);
      }

      // Categorize by POUR principle based on success criterion
      const principle = this._getPourPrinciple(violation.id || '');
      violation.pour_principle = principle;

      if (principle === 'Perceivable') {
        perceivable.push(violation);
      } else if (principle === 'Operable') {
        operable.push(violation);
      } else if (principle === 'Understandable') {
        understandable.push(violation);
      } else if (principle === 'Robust') {
        robust.push(violation);
      }
    }

    // Build enhanced results
    const enhanced = {
      url,
      timestamp: new Date().toISOString(),
      tool: 'axe-core',
      summary: {
        total_violations: violations.length,
        level_a_violations: levelAViolations.length,
        level_aa_violations: levelAAViolations.length,
        level_aaa_violations: levelAAAViolations.length,
        total_passes: passes.length,
        eaa_compliant: levelAViolations.length === 0 && levelAAViolations.length === 0
      },
      violations: {
        all: violations,
        by_level: {
          A: levelAViolations,
          AA: levelAAViolations,
          AAA: levelAAAViolations
        },
        by_principle: {
          Perceivable: perceivable,
          Operable: operable,
          Understandable: understandable,
          Robust: robust
        }
      },
      passes
    };

    return enhanced;
  }

  /**
   * Determine WCAG level from axe tags
   * @param {string[]} tags - Array of axe tags
   * @returns {string} WCAG level (A, AA, AAA, or Unknown)
   */
  _getWcagLevel(tags) {
    if (tags.includes('wcag2a') || tags.includes('wcag21a')) {
      return 'A';
    } else if (tags.includes('wcag2aa') || tags.includes('wcag21aa') || tags.includes('wcag22aa')) {
      return 'AA';
    } else if (tags.includes('wcag2aaa') || tags.includes('wcag21aaa')) {
      return 'AAA';
    }
    return 'Unknown';
  }

  /**
   * Map axe impact to severity level
   * @param {string} impact - Axe impact level
   * @returns {string} Severity level
   */
  _mapSeverity(impact) {
    const mapping = {
      critical: 'CRITICAL',
      serious: 'HIGH',
      moderate: 'MEDIUM',
      minor: 'LOW'
    };
    return mapping[impact] || 'MEDIUM';
  }

  /**
   * Determine POUR principle from axe rule ID
   * This is a heuristic mapping based on common axe rule naming
   * @param {string} ruleId - Axe rule ID
   * @returns {string} POUR principle
   */
  _getPourPrinciple(ruleId) {
    // Check each POUR principle's rules
    for (const [principle, rules] of Object.entries(POUR_RULES)) {
      if (rules.some(rule => ruleId.includes(rule))) {
        return principle;
      }
    }
    return 'Unknown';
  }

  /**
   * Close the browser
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node automated-checks.js <url> [--output violations.json] [--no-headless]');
    console.error('\nExamples:');
    console.error('  node automated-checks.js https://example.com');
    console.error('  node automated-checks.js https://example.com --output report.json');
    console.error('  node automated-checks.js http://localhost:3000 --no-headless');
    process.exit(1);
  }

  const parsed = {
    url: args[0],
    output: 'violations.json',
    headless: true
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error(`Error: ${args[i]} requires a file path argument`);
        process.exit(1);
      }
      parsed.output = args[i + 1];
      i++; // Skip next arg
    } else if (args[i] === '--no-headless') {
      parsed.headless = false;
    }
  }

  return parsed;
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();
  const checker = new AccessibilityChecker(args.headless);

  try {
    const results = await checker.checkUrl(args.url);

    // Write results to file
    fs.writeFileSync(args.output, JSON.stringify(results, null, 2), 'utf-8');

    // Print summary to stderr
    console.error(`\n✓ Accessibility check complete`);
    console.error(`  URL: ${results.url}`);
    console.error(`  Total violations: ${results.summary.total_violations}`);
    console.error(`    Level A: ${results.summary.level_a_violations}`);
    console.error(`    Level AA: ${results.summary.level_aa_violations}`);
    console.error(`    Level AAA: ${results.summary.level_aaa_violations}`);
    console.error(`  EAA Compliant: ${results.summary.eaa_compliant ? '✓ YES' : '✗ NO'}`);
    console.error(`\nResults written to: ${args.output}`);

    // Exit with error code if violations found
    process.exit(results.summary.eaa_compliant ? 0 : 1);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    await checker.cleanup();
  }
}

main();
