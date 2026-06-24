import { createTag, addCopyButtonsToCodeBlocks } from '../../scripts/scripts.js';
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
    addCopyButtonsToCodeBlocks();
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
