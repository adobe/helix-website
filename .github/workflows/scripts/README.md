# AI Code Review - GitHub Action

Automatically review pull requests with AI-powered code analysis and one-click GitHub Suggestions.

## Quick Start

### 1. Choose Your AI Provider

| Provider | Cost/Review | Setup |
|----------|-------------|-------|
| **Gemini** (Free tier!) | $0-0.10 | Get key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Claude** (Best quality) | $0.10-0.30 | Get key: [console.anthropic.com](https://console.anthropic.com) |
| **OpenAI** | $0.30-0.90 | Get key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Azure OpenAI** | Enterprise | Requires Azure subscription |

### 2. Add API Key to GitHub

Go to: **Repository Settings** → **Secrets and variables** → **Actions**

#### For Gemini (Recommended - FREE tier)
```
AI_PROVIDER = gemini
GEMINI_API_KEY = your-api-key
```

#### For Claude (Best quality)
```
ANTHROPIC_API_KEY = your-api-key
```
*(No need to set AI_PROVIDER - Claude is default)*

#### For OpenAI
```
AI_PROVIDER = openai
OPENAI_API_KEY = your-api-key
```

#### For Azure OpenAI
```
AI_PROVIDER = azure
AZURE_OPENAI_API_KEY = your-key
AZURE_OPENAI_ENDPOINT = your-endpoint-url
AZURE_OPENAI_DEPLOYMENT = your-deployment-name
```

### 3. Done!

The workflow automatically runs on every PR. Reviews appear in ~1-2 minutes with:
- ✅ Comprehensive code review
- ✅ One-click GitHub Suggestions
- ✅ Security and performance checks

## What Gets Reviewed

The AI checks:
- **Code quality**: Patterns, best practices, EDS standards
- **Performance**: LCP, lazy loading, bundle size
- **Security**: XSS, injection, unsafe patterns
- **Accessibility**: ARIA, semantic HTML
- **Linting**: ESLint and Stylelint compliance

## How to Apply Suggestions

On the **Files changed** tab:
1. Find inline comments with `suggestion` blocks
2. Click **"Commit suggestion"** to apply (one-click!)
3. Or batch multiple: **"Add suggestion to batch"** → **"Commit suggestions"**

## Configuration

### Change AI Model

Add these optional secrets:

**Gemini:**
```
GEMINI_MODEL = gemini-1.5-flash  (faster, cheaper)
           or gemini-1.5-pro     (default, better quality)
```

**Claude:**
```
ANTHROPIC_MODEL = claude-sonnet-4-20250514  (default, balanced)
               or claude-opus-4-20250514    (best quality)
```

**OpenAI:**
```
OPENAI_MODEL = gpt-4-turbo-preview  (default, fast)
            or gpt-4                (standard)
```

### Skip Draft PRs

Edit `.github/workflows/code-review.yml`:

```yaml
jobs:
  ai-code-review:
    if: github.event.pull_request.draft == false
```

### Review Only Specific Files

```yaml
on:
  pull_request:
    paths:
      - 'blocks/**'
      - 'scripts/**'
      - 'styles/**'
```

## Cost Estimates

**50 PRs/month:**
- Gemini Flash: $1/month
- Gemini Pro: $0 (FREE tier)
- Claude Sonnet: $5/month
- GPT-4 Turbo: $15/month

## Troubleshooting

### "API_KEY not set"
➡️ Add the secret in Settings → Secrets → Actions

### Suggestions not appearing
➡️ Check Actions tab for workflow logs

### API rate limits
➡️ Add delays or use draft PR filter

### High costs
➡️ Switch to Gemini ($1/month) or use free tier

## Provider Comparison

| Feature | Gemini | Claude | OpenAI |
|---------|--------|--------|--------|
| **Free Tier** | ✅ Yes | ❌ No | ❌ No |
| **Cost** | $0-1/month | $5/month | $15/month |
| **Speed** | 8-12s | 15-25s | 10-15s |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Context** | 2M tokens | 200K tokens | 128K tokens |

**Recommendation:** 
- Open-source/personal: **Gemini** (free tier)
- Teams wanting quality: **Claude**
- Teams with OpenAI already: **OpenAI**

## File Structure

```
.github/workflows/
├── code-review.yml              # Main workflow
├── scripts/
│   ├── ai-code-review.js       # Review logic
│   ├── ai-providers.js         # Provider abstraction
│   ├── package.json            # Dependencies
│   └── .gitignore
└── README.md                   # This file
```

## Disable the Workflow

**Temporarily:** Actions → AI Code Review → ⋯ → Disable workflow

**Permanently:** Delete `.github/workflows/code-review.yml`

## Support

- **Workflow logs**: Actions tab → AI Code Review
- **Code review skill**: `.claude/skills/code-review/SKILL.md`
- **Anthropic docs**: https://docs.anthropic.com/
- **OpenAI docs**: https://platform.openai.com/docs
- **Gemini docs**: https://ai.google.dev/docs

---

**Questions?** Check workflow logs or review the code-review skill documentation.
