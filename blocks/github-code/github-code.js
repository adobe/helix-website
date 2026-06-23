import { createTag } from '../../scripts/scripts.js';
import { loadCSS, loadScript } from '../../scripts/lib-franklin.js';

const HIGHLIGHT_JS = '/libs/highlight/highlight.min.js';
const HIGHLIGHT_CSS = '/libs/highlight/atom-one-dark.min.css';

// Map file extensions to highlight.js language identifiers where they differ
// from the extension. Unmapped extensions are passed through as-is.
const EXT_TO_LANG = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  jsx: 'javascript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  htm: 'xml',
  html: 'xml',
  svg: 'xml',
};

const COPY_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <path d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4z"/>
  <path d="M2 6V2h4v1H2.5v3H2z"/>
</svg>`;

const COPIED_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
</svg>`;

/**
 * Parse a GitHub blob URL into its parts plus an optional line range.
 * Supports fragments like #L10-L20, #L10-20 and a single #L10.
 * @param {string} href the GitHub blob URL
 * @returns {Object|null} parsed parts, or null if not a valid blob URL
 */
function parseGitHubBlobUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return null;
  }
  if (url.hostname !== 'github.com') return null;

  // pathname: /{owner}/{repo}/blob/{ref}/{...path}
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 5 || parts[2] !== 'blob') return null;

  const [owner, repo, , ref] = parts;
  const path = parts.slice(4).join('/');

  let start;
  let end;
  const match = url.hash.match(/^#L(\d+)(?:-L?(\d+))?$/);
  if (match) {
    start = parseInt(match[1], 10);
    end = match[2] ? parseInt(match[2], 10) : start;
    if (end < start) [start, end] = [end, start];
  }

  return {
    owner,
    repo,
    ref,
    path,
    start,
    end,
    rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`,
  };
}

/**
 * Derive a highlight.js language identifier from a file path.
 * @param {string} path the file path
 * @returns {string} a language identifier (may be empty for extensionless files)
 */
function langFromPath(path) {
  const file = path.split('/').pop();
  if (!file.includes('.')) return '';
  const ext = file.split('.').pop().toLowerCase();
  return EXT_TO_LANG[ext] || ext;
}

/**
 * Reduce raw file content to the requested 1-based, inclusive line range.
 * @param {string} text the full file content
 * @param {number} [start] first line (1-based)
 * @param {number} [end] last line (1-based)
 * @returns {string} the selected lines
 */
function sliceLines(text, start, end) {
  if (!start) return text;
  return text.split('\n').slice(start - 1, end).join('\n');
}

/**
 * Add a copy-to-clipboard button to a code block, matching the project's
 * guide-template code block pattern.
 * @param {HTMLPreElement} pre the pre element wrapping the code
 * @param {HTMLElement} codeEl the code element holding the source
 */
function addCopyButton(pre, codeEl) {
  pre.classList.add('code-block-wrapper');
  const button = createTag('button', {
    class: 'code-copy-button',
    type: 'button',
    'aria-label': 'Copy code to clipboard',
    title: 'Copy code',
  }, COPY_ICON);

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.textContent);
      button.classList.add('copied');
      button.setAttribute('aria-label', 'Code copied!');
      button.innerHTML = COPIED_ICON;
      setTimeout(() => {
        button.classList.remove('copied');
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.innerHTML = COPY_ICON;
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy code:', err);
    }
  });

  pre.append(button);
}

/**
 * Lazily load the highlight.js library and highlight a single code element.
 * The bundled library only registers a subset of languages, so the `hljs`
 * theme class is always applied for a consistent background, while the
 * highlighter only runs for grammars that are actually available.
 * @param {HTMLElement} codeEl the code element to highlight
 * @param {string} lang the detected language identifier (may be empty)
 */
async function highlightCode(codeEl, lang) {
  await loadCSS(HIGHLIGHT_CSS);
  await loadScript(HIGHLIGHT_JS);
  const { hljs } = window;
  if (!hljs) return;
  codeEl.classList.add('hljs');
  if (lang && hljs.getLanguage(lang)) {
    hljs.highlightElement(codeEl);
  }
}

/**
 * Fetch the source, render it, and highlight it.
 * @param {HTMLElement} block the block element
 * @param {Object} info parsed GitHub blob URL info
 * @param {string} blobUrl the original blob URL (for the View on GitHub link)
 */
async function renderCode(block, info, blobUrl) {
  const pre = createTag('pre');
  const lang = langFromPath(info.path);
  const codeEl = createTag('code', lang ? { class: `language-${lang}` } : {});
  pre.append(codeEl);

  try {
    const response = await fetch(info.rawUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    codeEl.textContent = sliceLines(text, info.start, info.end);
    block.append(pre);
    addCopyButton(pre, codeEl);
    await highlightCode(codeEl, lang);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load GitHub code:', err);
    const fallback = createTag('a', {
      class: 'github-code-fallback',
      href: blobUrl,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, 'View code on GitHub');
    block.append(fallback);
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const blobUrl = link ? link.href : '';
  const info = parseGitHubBlobUrl(blobUrl);

  block.textContent = '';

  if (!info) {
    // Not a recognizable GitHub blob URL - leave the original link if present.
    if (blobUrl) {
      block.append(createTag('a', {
        class: 'github-code-fallback',
        href: blobUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
      }, 'View code on GitHub'));
    }
    return;
  }

  // Header: file path (with optional line range) and a link to the source.
  const header = createTag('div', { class: 'github-code-header' });
  const rangeText = info.start
    ? ` · Lines ${info.start}${info.end !== info.start ? `–${info.end}` : ''}`
    : '';
  header.append(createTag('span', { class: 'github-code-path' }, `${info.path}${rangeText}`));
  header.append(createTag('a', {
    class: 'github-code-link',
    href: blobUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
  }, 'View on GitHub'));
  block.append(header);

  // Defer fetching and highlighting until the block scrolls into view.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        renderCode(block, info, blobUrl);
      }
    });
  }, { root: null, rootMargin: '200px', threshold: 0 });

  observer.observe(block);
}
