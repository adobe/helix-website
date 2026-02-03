#!/usr/bin/env node

/**
 * AI Code Review Script
 * 
 * Uses Claude (Anthropic API) to perform comprehensive code reviews
 * following the code-review skill guidelines.
 * 
 * Automatically posts GitHub Suggestions for fixable issues.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { getProvider, extractJSON } from './ai-providers.js';

const GH_TOKEN = process.env.GH_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const COMMIT_SHA = process.env.COMMIT_SHA;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'adobe/helix-website';
const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';

if (!GH_TOKEN) {
  console.error('❌ GH_TOKEN not set');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split('/');

// Initialize AI provider (Anthropic, OpenAI, or Azure)
const aiProvider = getProvider();

/**
 * Read the code-review skill
 */
function readCodeReviewSkill() {
  const skillPath = '.claude/skills/code-review/SKILL.md';
  if (!existsSync(skillPath)) {
    console.error(`❌ Code review skill not found at ${skillPath}`);
    process.exit(1);
  }
  return readFileSync(skillPath, 'utf8');
}

/**
 * Get PR information
 */
async function getPRInfo() {
  const cmd = `gh api repos/${owner}/${repo}/pulls/${PR_NUMBER} --jq '{
    title: .title,
    body: .body,
    base: .base.ref,
    head: .head.ref,
    files: .changed_files,
    additions: .additions,
    deletions: .deletions,
    url: .html_url
  }'`;
  
  const output = execSync(cmd, { encoding: 'utf8', env: { ...process.env, GH_TOKEN } });
  return JSON.parse(output);
}

/**
 * Get PR diff
 */
function getPRDiff() {
  const cmd = `gh pr diff ${PR_NUMBER} --repo ${owner}/${repo}`;
  return execSync(cmd, { encoding: 'utf8', env: { ...process.env, GH_TOKEN } });
}

/**
 * Get changed files
 */
async function getChangedFiles() {
  const cmd = `gh api repos/${owner}/${repo}/pulls/${PR_NUMBER}/files --jq '.[] | {
    filename: .filename,
    status: .status,
    additions: .additions,
    deletions: .deletions,
    patch: .patch
  }'`;
  
  const output = execSync(cmd, { encoding: 'utf8', env: { ...process.env, GH_TOKEN } });
  return output.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
}

/**
 * Run linting
 */
function getLintResults() {
  try {
    execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
    return { passed: true, output: 'All linting checks passed' };
  } catch (error) {
    return { passed: false, output: error.stdout || error.message };
  }
}

/**
 * Call Claude to perform code review
 */
async function performCodeReview(prInfo, prDiff, changedFiles, lintResults) {
  const codeReviewSkill = readCodeReviewSkill();
  
  const prompt = `You are an expert code reviewer for AEM Edge Delivery Services projects. Review this pull request following the code-review skill guidelines.

## Code Review Skill
${codeReviewSkill}

## PR Information
- **Title**: ${prInfo.title}
- **Description**: ${prInfo.body || 'No description provided'}
- **Base Branch**: ${prInfo.base}
- **Head Branch**: ${prInfo.head}
- **Changed Files**: ${prInfo.files}
- **Additions**: +${prInfo.additions}
- **Deletions**: -${prInfo.deletions}

## Linting Results
\`\`\`
${lintResults.output}
\`\`\`

## Changed Files
${changedFiles.map(f => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join('\n')}

## PR Diff
\`\`\`diff
${prDiff}
\`\`\`

## Your Task

Follow the code-review skill workflow (Steps 1-9) to:

1. **Validate PR structure** (preview URLs, description)
2. **Review code quality** (JavaScript, CSS, HTML)
3. **Check performance** requirements
4. **Assess security** concerns
5. **Identify issues** with clear priorities (Must Fix, Should Fix, Consider)
6. **Provide GitHub Suggestions** for fixable issues

## Output Format

Provide your response as a structured JSON object that can be used to:
1. Post a comprehensive review comment
2. Create GitHub Suggestions for fixable issues
3. Post a summary comment

\`\`\`json
{
  "summary": {
    "title": "PR Review Summary",
    "overview": "Brief overview of the PR",
    "previewUrls": {
      "before": "URL or null",
      "after": "URL or null"
    },
    "checklist": {
      "mustFix": ["list of blocking issues"],
      "shouldFix": ["list of high-priority issues"],
      "consider": ["list of suggestions"]
    }
  },
  "suggestions": [
    {
      "path": "relative/path/to/file.js",
      "position": 12,
      "severity": "blocking|high|low",
      "title": "Issue title",
      "description": "Detailed explanation of the issue",
      "suggestedCode": "The fixed code (exact replacement)",
      "reasoning": "Why this fix is needed"
    }
  ],
  "guidanceComments": [
    {
      "path": "relative/path/to/file.js",
      "position": 45,
      "title": "Architectural suggestion",
      "description": "Detailed guidance without a specific code fix"
    }
  ],
  "recommendation": "APPROVE|REQUEST_CHANGES|COMMENT"
}
\`\`\`

Be thorough but constructive. Focus on creating actionable GitHub Suggestions for concrete fixes.`;

  console.log(`🤖 Using AI Provider: ${aiProvider.getName()}`);
  
  const result = await aiProvider.performReview(prompt, {
    maxTokens: 16000,
    temperature: 0.3,
  });

  console.log(`📊 Token usage: ${result.usage.inputTokens} in, ${result.usage.outputTokens} out`);
  
  // Extract JSON from response
  try {
    return extractJSON(result.text);
  } catch (error) {
    console.error('❌ Could not parse AI response as JSON');
    console.error('Response:', result.text);
    throw new Error('Invalid AI response format: ' + error.message);
  }
}

/**
 * Post GitHub review with suggestions
 */
async function postGitHubReview(reviewData) {
  console.log('📝 Creating GitHub review with suggestions...');
  
  // Build review comments with suggestions
  const comments = reviewData.suggestions.map(suggestion => ({
    path: suggestion.path,
    position: suggestion.position,
    body: `**${suggestion.severity === 'blocking' ? '🚫 [BLOCKING] ' : suggestion.severity === 'high' ? '⚠️ ' : '💡 '}${suggestion.title}**

${suggestion.description}

\`\`\`suggestion
${suggestion.suggestedCode}
\`\`\`

${suggestion.reasoning}`,
  }));
  
  // Add guidance comments (without suggestions)
  reviewData.guidanceComments.forEach(comment => {
    comments.push({
      path: comment.path,
      position: comment.position,
      body: `**💭 ${comment.title}**

${comment.description}`,
    });
  });
  
  if (comments.length === 0) {
    console.log('✅ No suggestions to post - code looks good!');
    return;
  }
  
  // Create review JSON
  const reviewPayload = {
    commit_id: COMMIT_SHA,
    event: reviewData.recommendation === 'APPROVE' ? 'APPROVE' : 'COMMENT',
    comments,
  };
  
  // Write to temp file
  const fs = await import('fs/promises');
  await fs.writeFile('/tmp/review-payload.json', JSON.stringify(reviewPayload, null, 2));
  
  // Submit review via gh CLI
  try {
    execSync(`gh api POST repos/${owner}/${repo}/pulls/${PR_NUMBER}/reviews --input /tmp/review-payload.json`, {
      encoding: 'utf8',
      env: { ...process.env, GH_TOKEN },
    });
    
    console.log(`✅ Posted review with ${comments.length} suggestions`);
  } catch (error) {
    console.error('❌ Failed to post review:', error.message);
    console.error('Payload:', JSON.stringify(reviewPayload, null, 2));
    throw error;
  }
}

/**
 * Post comprehensive review comment
 */
async function postReviewComment(reviewData) {
  console.log('💬 Posting comprehensive review comment...');
  
  const mustFixItems = reviewData.summary.checklist.mustFix
    .map(item => `- [ ] ${item}`)
    .join('\n');
    
  const shouldFixItems = reviewData.summary.checklist.shouldFix
    .map(item => `- [ ] ${item}`)
    .join('\n');
    
  const considerItems = reviewData.summary.checklist.consider
    .map(item => `- [ ] ${item}`)
    .join('\n');
  
  const previewUrls = reviewData.summary.previewUrls.before || reviewData.summary.previewUrls.after
    ? `### Preview URLs Validated
- ${reviewData.summary.previewUrls.before ? `✅ Before: ${reviewData.summary.previewUrls.before}` : '❌ Before: Not provided'}
- ${reviewData.summary.previewUrls.after ? `✅ After: ${reviewData.summary.previewUrls.after}` : '❌ After: Not provided'}
`
    : '### ⚠️ Preview URLs Missing\nPlease provide preview URLs for automated testing.\n';
  
  const suggestionCount = reviewData.suggestions.length;
  const blockingCount = reviewData.suggestions.filter(s => s.severity === 'blocking').length;
  
  const body = `## ${reviewData.summary.title}

### Overview
${reviewData.summary.overview}

${previewUrls}

---

### Checklist Results

${mustFixItems ? `#### 🚫 Must Fix (Blocking)\n${mustFixItems}\n` : ''}
${shouldFixItems ? `#### ⚠️ Should Fix (High Priority)\n${shouldFixItems}\n` : ''}
${considerItems ? `#### 💡 Consider (Suggestions)\n${considerItems}\n` : ''}

---

${suggestionCount > 0 ? `## ✨ ${suggestionCount} GitHub Suggestion${suggestionCount > 1 ? 's' : ''} Added!

I've added **GitHub Suggestions** that you can apply with a single click!

### How to Apply

1. Go to the **Files changed** tab
2. Look for inline comments with code suggestions
3. Click **"Commit suggestion"** to apply individually
4. Or click **"Add suggestion to batch"** on multiple suggestions, then **"Commit suggestions"**

### What's Included

${blockingCount > 0 ? `- 🚫 ${blockingCount} BLOCKING fix${blockingCount > 1 ? 'es' : ''} (must address before merge)\n` : ''}${reviewData.suggestions.filter(s => s.severity === 'high').length > 0 ? `- ⚠️ ${reviewData.suggestions.filter(s => s.severity === 'high').length} high-priority improvement${reviewData.suggestions.filter(s => s.severity === 'high').length > 1 ? 's' : ''}\n` : ''}${reviewData.suggestions.filter(s => s.severity === 'low').length > 0 ? `- 💡 ${reviewData.suggestions.filter(s => s.severity === 'low').length} optional suggestion${reviewData.suggestions.filter(s => s.severity === 'low').length > 1 ? 's' : ''}\n` : ''}

After applying suggestions, run \`npm run lint\` to verify all checks pass!

---
` : ''}

## Recommendation

${reviewData.recommendation === 'REQUEST_CHANGES' 
  ? '**⚠️ Changes Requested** - Please address the blocking issues above.' 
  : reviewData.recommendation === 'APPROVE'
  ? '**✅ Approved** - Code looks good! Great work!'
  : '**💬 Comments** - Please review the suggestions above.'}

---

*🤖 Automated review powered by the [code-review skill](.claude/skills/code-review/SKILL.md)*`;

  // Post comment via gh CLI
  const commentFile = '/tmp/review-comment.md';
  await import('fs/promises').then(fs => fs.writeFile(commentFile, body));
  
  execSync(`gh pr comment ${PR_NUMBER} --repo ${owner}/${repo} --body-file ${commentFile}`, {
    encoding: 'utf8',
    env: { ...process.env, GH_TOKEN },
  });
  
  console.log('✅ Posted comprehensive review comment');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting AI Code Review');
    console.log(`   PR: #${PR_NUMBER}`);
    console.log(`   Repo: ${owner}/${repo}`);
    console.log(`   Commit: ${COMMIT_SHA}`);
    console.log('');
    
    // Gather PR context
    console.log('📊 Gathering PR information...');
    const prInfo = await getPRInfo();
    const prDiff = getPRDiff();
    const changedFiles = await getChangedFiles();
    const lintResults = getLintResults();
    
    console.log(`   Title: ${prInfo.title}`);
    console.log(`   Files changed: ${changedFiles.length}`);
    console.log(`   Lint status: ${lintResults.passed ? '✅ Passed' : '❌ Failed'}`);
    console.log('');
    
    // Perform AI code review
    const reviewData = await performCodeReview(prInfo, prDiff, changedFiles, lintResults);
    
    console.log('');
    console.log('📋 Review Summary:');
    console.log(`   Suggestions: ${reviewData.suggestions.length}`);
    console.log(`   Guidance comments: ${reviewData.guidanceComments.length}`);
    console.log(`   Recommendation: ${reviewData.recommendation}`);
    console.log('');
    
    // Post review with suggestions
    await postGitHubReview(reviewData);
    
    // Post comprehensive comment
    await postReviewComment(reviewData);
    
    console.log('');
    console.log('✅ AI Code Review Complete!');
    console.log(`   View at: ${prInfo.url}`);
    
  } catch (error) {
    console.error('');
    console.error('❌ AI Code Review Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
