#!/usr/bin/env node

/**
 * Accessibility Report Generator
 * Generates formatted accessibility reports from axe-core violations JSON
 *
 * Usage:
 *   node generate-report.js violations.json [--output report.md] [--format markdown]
 *
 * Examples:
 *   node generate-report.js violations.json
 *   node generate-report.js violations.json --output accessibility-audit.md
 *   node generate-report.js violations.json --output report.md --format markdown
 */

import fs from 'fs';

/**
 * Generate formatted accessibility compliance reports
 */
class ReportGenerator {
  /**
   * @param {string} violationsFile - Path to violations JSON file
   */
  constructor(violationsFile) {
    const content = fs.readFileSync(violationsFile, 'utf-8');
    this.data = JSON.parse(content);
  }

  /**
   * Generate a markdown-formatted accessibility report
   * @returns {string} Markdown report content
   */
  generateMarkdown() {
    const report = [];

    // Header
    report.push('# Accessibility Audit Report\n');
    report.push(`**Website:** ${this.data.url || 'N/A'}\n`);
    report.push(`**Date:** ${this.data.timestamp || 'N/A'}\n`);
    report.push(`**Tool:** ${this.data.tool || 'axe-core'}\n`);
    report.push('\n---\n');

    // Executive Summary
    report.push(this._generateExecutiveSummary());

    // Violations by Principle
    report.push('\n## Violations by POUR Principle\n');
    report.push(this._generateViolationsByPrinciple());

    // Testing Methodology
    report.push('\n## Testing Methodology\n');
    report.push(this._generateMethodology());

    // Next Steps
    report.push('\n## Next Steps (Prioritized)\n');
    report.push(this._generateNextSteps());

    return report.join('\n');
  }

  /**
   * Generate executive summary section
   * @returns {string} Executive summary markdown
   */
  _generateExecutiveSummary() {
    const summary = this.data.summary || {};
    const total = summary.total_violations || 0;
    const levelA = summary.level_a_violations || 0;
    const levelAA = summary.level_aa_violations || 0;
    const levelAAA = summary.level_aaa_violations || 0;
    const eaaCompliant = summary.eaa_compliant || false;

    // Count severity
    const violationsAll = this.data.violations?.all || [];
    const critical = violationsAll.filter(v => v.severity === 'CRITICAL').length;
    const high = violationsAll.filter(v => v.severity === 'HIGH').length;
    const medium = violationsAll.filter(v => v.severity === 'MEDIUM').length;
    const low = violationsAll.filter(v => v.severity === 'LOW').length;

    const lines = [
      '## Executive Summary\n',
      `- **Total issues:** ${total} (${critical} critical, ${high} high, ${medium} medium, ${low} low)`,
      `- **Level A compliance:** ${levelA === 0 ? '✓ PASS' : `✗ FAIL (${levelA} issues)`}`,
      `- **Level AA compliance:** ${levelAA === 0 ? '✓ PASS' : `✗ FAIL (${levelAA} issues)`}`,
      `- **Overall EAA compliance:** ${eaaCompliant ? '✓ PASS' : '✗ FAIL'}\n`
    ];

    if (!eaaCompliant) {
      lines.push(
        '**Verdict:** This website does not meet WCAG 2.2 Level AA requirements ' +
        'and is not compliant with the European Accessibility Act.\n'
      );
    } else {
      lines.push(
        '**Verdict:** This website meets WCAG 2.2 Level AA requirements ' +
        'based on automated testing. Manual testing is still required for full EAA compliance.\n'
      );
    }

    return lines.join('\n');
  }

  /**
   * Generate violations organized by POUR principle
   * @returns {string} Violations by principle markdown
   */
  _generateViolationsByPrinciple() {
    const lines = [];
    const violationsByPrinciple = this.data.violations?.by_principle || {};

    const principles = [
      ['Perceivable', violationsByPrinciple.Perceivable || []],
      ['Operable', violationsByPrinciple.Operable || []],
      ['Understandable', violationsByPrinciple.Understandable || []],
      ['Robust', violationsByPrinciple.Robust || []]
    ];

    for (const [principleName, principleViolations] of principles) {
      if (principleViolations.length === 0) {
        lines.push(`### ${principleName} (0 issues)\n`);
        lines.push('✓ No violations found in this category.\n');
        continue;
      }

      lines.push(`### ${principleName} (${principleViolations.length} issues)\n`);

      for (const violation of principleViolations) {
        lines.push(this._formatViolation(violation));
      }
    }

    return lines.join('\n');
  }

  /**
   * Format a single violation with all details
   * @param {Object} violation - Violation object
   * @returns {string} Formatted violation markdown
   */
  _formatViolation(violation) {
    const lines = [];

    // Header with success criterion
    const wcagLevel = violation.wcag_level || 'Unknown';
    const severity = violation.severity || 'MEDIUM';
    const description = violation.description || 'No description';
    const helpText = violation.help || 'No help available';
    const helpUrl = violation.helpUrl || '';

    lines.push(`#### ${helpText} (Level ${wcagLevel}) - ${severity}\n`);

    // Issue description
    lines.push(`**Issue:** ${description}\n`);

    // Impact
    const impact = violation.impact || 'moderate';
    lines.push(`**Impact:** ${impact.charAt(0).toUpperCase() + impact.slice(1)}\n`);

    // Affected nodes
    const nodes = violation.nodes || [];
    if (nodes.length > 0) {
      lines.push(`**Affected elements:** ${nodes.length} instance(s)\n`);
      lines.push('**Locations:**');

      // Show up to 5 examples
      for (let i = 0; i < Math.min(5, nodes.length); i++) {
        const node = nodes[i];
        const target = node.target || ['unknown'];
        const html = node.html || 'N/A';
        const failureSummary = node.failureSummary || '';

        lines.push(`\n${i + 1}. Selector: \`${target[0] || 'unknown'}\``);
        lines.push(`   \`\`\`html\n   ${html}\n   \`\`\``);

        if (failureSummary) {
          lines.push(`   ${failureSummary}`);
        }
      }

      if (nodes.length > 5) {
        lines.push(`\n...and ${nodes.length - 5} more instance(s)`);
      }
    }

    // Remediation guidance
    lines.push('\n**How to fix:**');

    // Get specific remediation from nodes
    if (nodes.length > 0 && nodes[0].any) {
      for (const check of nodes[0].any) {
        const message = check.message || '';
        if (message) {
          lines.push(`- ${message}`);
        }
      }
    } else if (nodes.length > 0 && nodes[0].all) {
      for (const check of nodes[0].all) {
        const message = check.message || '';
        if (message) {
          lines.push(`- ${message}`);
        }
      }
    } else {
      lines.push(`- ${description}`);
    }

    // Reference link
    if (helpUrl) {
      lines.push(`\n**Reference:** [${helpText}](${helpUrl})`);
    }

    lines.push('\n---\n');

    return lines.join('\n');
  }

  /**
   * Generate testing methodology section
   * @returns {string} Methodology markdown
   */
  _generateMethodology() {
    const lines = [
      '**Automated Testing:**',
      `- Tool: ${this.data.tool || 'axe-core'}`,
      '- Standard: WCAG 2.2 Level A and AA',
      `- URL tested: ${this.data.url || 'N/A'}`,
      `- Date: ${this.data.timestamp || 'N/A'}`,
      '',
      '**Manual Testing:**',
      '- ⚠️ Automated testing only catches ~30-40% of accessibility issues',
      '- Manual keyboard navigation testing: Required',
      '- Screen reader testing: Recommended',
      '- Zoom/reflow testing: Required',
      '- Form interaction testing: Required',
      '',
      '**Standards:**',
      '- WCAG 2.2 Level AA (European Accessibility Act requirement)',
      '- EN 301 549 (European standard)',
      '- European Accessibility Act (EAA) compliance deadline: June 28, 2025',
      ''
    ];
    return lines.join('\n');
  }

  /**
   * Generate prioritized next steps
   * @returns {string} Next steps markdown
   */
  _generateNextSteps() {
    const violationsAll = this.data.violations?.all || [];

    // Categorize by severity
    const critical = violationsAll.filter(v => v.severity === 'CRITICAL');
    const high = violationsAll.filter(v => v.severity === 'HIGH');
    const medium = violationsAll.filter(v => v.severity === 'MEDIUM');
    const low = violationsAll.filter(v => v.severity === 'LOW');

    const lines = [];

    if (critical.length > 0) {
      lines.push('### Phase 1: Critical Issues (Immediate - 1-2 weeks)\n');
      for (let i = 0; i < Math.min(5, critical.length); i++) {
        const violation = critical[i];
        const nodeCount = violation.nodes?.length || 0;
        lines.push(
          `${i + 1}. ${violation.help || 'Fix issue'} - ${nodeCount} instance(s)`
        );
      }
      lines.push('');
    }

    if (high.length > 0) {
      lines.push('### Phase 2: High Priority (2-4 weeks)\n');
      for (let i = 0; i < Math.min(5, high.length); i++) {
        const violation = high[i];
        const nodeCount = violation.nodes?.length || 0;
        lines.push(
          `${i + 1}. ${violation.help || 'Fix issue'} - ${nodeCount} instance(s)`
        );
      }
      lines.push('');
    }

    if (medium.length > 0) {
      lines.push('### Phase 3: Medium Priority (1-2 months)\n');
      for (let i = 0; i < Math.min(5, medium.length); i++) {
        const violation = medium[i];
        const nodeCount = violation.nodes?.length || 0;
        lines.push(
          `${i + 1}. ${violation.help || 'Fix issue'} - ${nodeCount} instance(s)`
        );
      }
      lines.push('');
    }

    if (low.length > 0) {
      lines.push('### Phase 4: Low Priority (Ongoing)\n');
      for (let i = 0; i < Math.min(3, low.length); i++) {
        const violation = low[i];
        const nodeCount = violation.nodes?.length || 0;
        lines.push(
          `${i + 1}. ${violation.help || 'Fix issue'} - ${nodeCount} instance(s)`
        );
      }
      lines.push('');
    }

    // Recommendations
    lines.push('### Recommendations\n');
    lines.push('1. **Start with critical issues** - These have the highest impact on users');
    lines.push('2. **Perform manual testing** - Automated tools miss 60-70% of issues');
    lines.push('3. **Test with real users** - Include users with disabilities in testing');
    lines.push('4. **Establish ongoing monitoring** - Run automated checks on every deploy');
    lines.push('5. **Train development team** - Prevent future accessibility issues');
    lines.push('6. **EAA deadline** - Compliance required by June 28, 2025');
    lines.push('');
    lines.push(
      '**Recommended re-audit:** After fixing critical and high priority issues ' +
      '(approximately 6-8 weeks)\n'
    );

    return lines.join('\n');
  }
}

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-report.js violations.json [--output report.md] [--format markdown]');
    console.error('\nExamples:');
    console.error('  node generate-report.js violations.json');
    console.error('  node generate-report.js violations.json --output accessibility-audit.md');
    console.error('  node generate-report.js violations.json --output report.md --format markdown');
    process.exit(1);
  }

  const parsed = {
    violationsFile: args[0],
    output: 'accessibility_report.md',
    format: 'markdown'
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      parsed.output = args[i + 1];
      i++; // Skip next arg
    } else if (args[i] === '--format' || args[i] === '-f') {
      parsed.format = args[i + 1];
      i++; // Skip next arg
    }
  }

  return parsed;
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();

  try {
    const generator = new ReportGenerator(args.violationsFile);
    const report = generator.generateMarkdown();

    // Write report
    fs.writeFileSync(args.output, report, 'utf-8');

    console.error(`✓ Report generated: ${args.output}`);

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: Violations file not found: ${args.violationsFile}`);
      process.exit(1);
    } else if (error instanceof SyntaxError) {
      console.error(`Error: Invalid JSON in violations file: ${error.message}`);
      process.exit(1);
    } else {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
}

main();
