import { createTag, addCopyButtonsToCodeBlocks } from '../../scripts/scripts.js';
import { loadCSS, loadScript } from '../../scripts/lib-franklin.js';

const HIGHLIGHT_JS = '/libs/highlight/highlight.min.js';
const HIGHLIGHT_CSS = '/libs/highlight/atom-one-dark.min.css';

// Files longer than this collapse behind a "Show all N lines" toggle.
const MAX_COLLAPSED_LINES = 40;

// Map file extensions to highlight.js language identifiers where they differ
// from the extension. Unmapped extensions (and extensionless files) fall
// back to 'plaintext', which still gets the themed background even though
// the bundled build doesn't register that grammar either.
const EXT_TO_LANG = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  css: 'css',
  py: 'python',
  rb: 'ruby',
  java: 'java',
  sh: 'bash',
  bash: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  htm: 'xml',
  html: 'xml',
  xml: 'xml',
  svg: 'xml',
};

/**
 * Parse a GitHub blob URL into its parts plus an optional line range.
 * Supports fragments like #L10-L20, #L10-20, #L10, and permalink-style
 * fragments with column numbers such as #L10C5-L20C3.
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

  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const [, owner, repo, ref, path] = match;

  let start;
  let end;
  const lines = url.hash.match(/^#L(\d+)(?:C\d+)?(?:-L?(\d+)(?:C\d+)?)?$/);
  if (lines) {
    start = parseInt(lines[1], 10);
    end = lines[2] ? parseInt(lines[2], 10) : start;
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
 * @returns {string} a language identifier
 */
function langFromPath(path) {
  const file = path.split('/').pop();
  if (!file.includes('.')) return 'plaintext';
  const ext = file.split('.').pop().toLowerCase();
  return EXT_TO_LANG[ext] || 'plaintext';
}

// Multiple blocks on the same page can become visible in the same tick, each
// calling loadScript(HIGHLIGHT_JS) independently. lib-franklin's loadScript
// resolves immediately if it merely finds an existing <script> tag, even one
// still loading - so without this shared promise, later blocks would resolve
// before hljs is actually defined and silently skip highlighting.
let highlightLibraryPromise;
function loadHighlightLibrary() {
  if (!highlightLibraryPromise) {
    highlightLibraryPromise = Promise.all([loadCSS(HIGHLIGHT_CSS), loadScript(HIGHLIGHT_JS)]);
  }
  return highlightLibraryPromise;
}

/**
 * Lazily load the highlight.js library and highlight a single code element.
 * The bundled library only registers a subset of languages, so the `hljs`
 * theme class is always applied for a consistent background, while the
 * highlighter only runs for grammars that are actually available.
 * @param {HTMLElement} codeEl the code element to highlight
 * @param {string} lang the detected language identifier
 */
async function highlightCode(codeEl, lang) {
  await loadHighlightLibrary();
  const { hljs } = window;
  if (!hljs) return;
  codeEl.classList.add('hljs');
  if (hljs.getLanguage(lang)) {
    hljs.highlightElement(codeEl);
  }
}

/**
 * Append a styled error message linking back to the original GitHub URL.
 * @param {HTMLElement} block the block element
 * @param {string} blobUrl the original blob URL
 */
function renderError(block, blobUrl) {
  const error = createTag('div', { class: 'github-code-error' });
  const message = createTag('p', {}, "Couldn't load code from GitHub.");
  const link = createTag('a', { href: blobUrl, target: '_blank', rel: 'noopener noreferrer' });
  link.textContent = blobUrl;
  error.append(message, link);
  block.append(error);
}

/**
 * Add a "Show all N lines" / "Show fewer lines" toggle below a collapsed
 * code block.
 * @param {HTMLElement} block the block element
 * @param {number} lineCount the total number of lines in the snippet
 */
function addCollapseToggle(block, lineCount) {
  block.classList.add('is-collapsible');
  const toggle = createTag('button', {
    type: 'button',
    class: 'github-code-toggle',
    'aria-expanded': 'false',
  }, `Show all ${lineCount} lines`);
  toggle.addEventListener('click', () => {
    const expanded = block.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show fewer lines' : `Show all ${lineCount} lines`;
    // collapsing from the bottom of a long file strands the viewport far below
    // the block; bring it back so the toggle stays visible
    if (!expanded && block.getBoundingClientRect().top < 0) block.scrollIntoView();
  });
  block.append(toggle);
}

/**
 * Fetch the source, render it, and highlight it.
 * @param {HTMLElement} block the block element
 * @param {Object} info parsed GitHub blob URL info
 * @param {string} blobUrl the original blob URL (for the View on GitHub link)
 */
async function renderCode(block, info, blobUrl) {
  const lang = langFromPath(info.path);
  const pre = createTag('pre');
  const codeEl = createTag('code', { class: `language-${lang}` });
  pre.append(codeEl);

  try {
    const response = await fetch(info.rawUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    // raw GitHub files end in a trailing newline; drop the resulting empty
    // "line" so whole-file snippets don't render a blank last line
    let contentLines = text.split('\n');
    if (contentLines.length && contentLines[contentLines.length - 1] === '') {
      contentLines = contentLines.slice(0, -1);
    }

    if (info.start) {
      if (info.start > info.end || info.start > contentLines.length) {
        throw new Error(`Invalid line range #L${info.start}-L${info.end}`);
      }
      contentLines = contentLines.slice(info.start - 1, Math.min(info.end, contentLines.length));
    }

    codeEl.textContent = contentLines.join('\n');
    block.append(pre);
    block.classList.add('is-loaded');
    addCopyButtonsToCodeBlocks();
    await highlightCode(codeEl, lang);
    if (contentLines.length > MAX_COLLAPSED_LINES) addCollapseToggle(block, contentLines.length);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load GitHub code:', err);
    renderError(block, blobUrl);
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const blobUrl = link ? link.href : block.textContent.trim();
  const info = parseGitHubBlobUrl(blobUrl);

  block.textContent = '';

  if (!info) {
    // Not a recognizable GitHub blob URL - leave a link if we have one.
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

  // Header: file path, optional line range, and a link to the source.
  const header = createTag('div', { class: 'github-code-header' });

  const pathEl = createTag('span', { class: 'github-code-path' });
  // info.path is percent-encoded (used as-is for the raw URL); decode for display
  try {
    pathEl.textContent = decodeURIComponent(info.path);
  } catch (e) {
    pathEl.textContent = info.path;
  }
  header.append(pathEl);

  if (info.start) {
    const rangeText = info.end !== info.start ? `Lines ${info.start}–${info.end}` : `Line ${info.start}`;
    header.append(createTag('span', { class: 'github-code-lines' }, rangeText));
  }

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
