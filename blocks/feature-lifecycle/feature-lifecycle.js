/*
 * feature-lifecycle block: shows where a feature stands on the Adoption Arc as a badge
 * next to the page title, plus an optional notice under the title.
 *
 * Built by scripts.js from page metadata:
 *   row 1: requested stage, from the `feature-lifecycle` metadata
 *   row 2: optional notice text, from `feature-lifecycle-notice`
 *
 * Legacy `labs` and `deprecation` blocks are handled by decorateLegacyFeatureLifecycle().
 *
 * The `feature-lifecycle` metadata value is a stage number from 1 to 7.
 */
import { getMetadata, loadCSS } from '../../scripts/aem.js';

// Keep in sync with PHASES in generate.py. The key is the `feature-lifecycle` metadata value.
const STAGES = {
  1: { label: 'Interest' },
  2: { label: 'Repeatable' },
  3: { label: 'Increasing use' },
  4: { label: 'Mainstream' },
  5: { label: 'Decreasing use' },
  6: { label: 'Discouraged' },
  7: { label: 'Removed' },
};

function formatLegacyLabsNotice(lab) {
  return `Ask us about this feature from the ${lab} labs on your Teams or Slack channel!`;
}

export function getFeatureLifecycleMetadata() {
  const explicitStage = getMetadata('feature-lifecycle').trim();
  const labs = getMetadata('labs').trim();
  const deprecation = getMetadata('deprecation').trim();
  let inferredStage = '';
  if (labs) inferredStage = '3';
  else if (deprecation) inferredStage = '6';
  const stage = explicitStage || inferredStage;
  let notice = getMetadata('feature-lifecycle-notice').trim();
  if (!notice && labs) {
    notice = labs.includes(':')
      ? labs.split(':').slice(1).join(':').trim()
      : formatLegacyLabsNotice(labs);
  } else if (!notice && deprecation) {
    notice = deprecation;
  }
  return { stage, notice };
}

/** Resolve a stage number from metadata to a STAGES key, or null. Allowlist only. */
function resolveStage(value) {
  const v = (value || '').trim();
  return Object.hasOwn(STAGES, v) ? v : null;
}

async function loadBadgeIcon(stage) {
  const response = await fetch(`/icons/feature-lifecycle-stage${stage}.svg`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feature lifecycle badge icon: ${response.status}`);
  }

  const svgDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  const svg = svgDocument.documentElement;
  if (svg.localName !== 'svg' || svgDocument.querySelector('parsererror')) {
    throw new Error(`Invalid feature lifecycle badge SVG for stage "${stage}".`);
  }
  const title = svg.querySelector('title')?.textContent.trim();
  if (!title) {
    throw new Error(`Feature lifecycle badge SVG for stage "${stage}" must have a title.`);
  }

  const icon = document.importNode(svg, true);
  icon.classList.add('feature-lifecycle-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  return { icon, title };
}

/**
 * Badge above the title, notice below it. Moving the block is a no-op when it is already there.
 */
function place(block, note) {
  const h1 = document.querySelector('main h1');
  if (!h1) {
    if (note) block.after(note);
    return;
  }
  const oldWrapper = block.parentElement;
  h1.parentElement.insertBefore(block, h1);
  if (oldWrapper !== block.parentElement && !oldWrapper.children.length) oldWrapper.remove();
  if (note) h1.after(note);
}

/**
 * Turns `block` into the badge (and creates the notice). `notice` is a string, or an array of
 * nodes taken from authored content. Returns the stage number, or null if there is nothing to show.
 */
async function render(block, { stage, notice }) {
  // allowlist: an unknown value never reaches the DOM or a URL
  const stageNumber = resolveStage(stage);
  if (stage?.trim() && !stageNumber) {
    const numbers = Object.keys(STAGES);
    // eslint-disable-next-line no-console
    console.warn(`feature-lifecycle: unknown stage "${stage.trim()}", valid: ${numbers.join(', ')}`);
  }
  if (!stageNumber) {
    block.remove();
    return null;
  }
  const { label } = STAGES[stageNumber];
  // headings on /docs/lifecycle are the descriptive labels, e.g. #increasing-use
  const anchor = label.toLowerCase().replace(/\s+/g, '-');
  const { icon, title } = await loadBadgeIcon(stageNumber);

  block.textContent = '';
  const stageClass = `feature-lifecycle-stage${stageNumber}`;
  block.classList.add(stageClass);

  const badge = document.createElement('a');
  badge.className = 'badge';
  badge.href = `/docs/lifecycle#${anchor}`;
  badge.setAttribute('aria-label', title);
  badge.append(icon);
  block.append(badge);

  let note = null;
  if (typeof notice === 'string' ? notice : notice?.length) {
    note = document.createElement('div');
    note.className = `feature-lifecycle-notice ${stageClass}`;
    note.setAttribute('role', 'note');
    if (typeof notice === 'string') note.textContent = notice;
    else note.append(...notice);
  }
  place(block, note);
  return stageNumber;
}

export default async function decorate(block) {
  await render(block, {
    stage: block.children[0]?.textContent,
    notice: block.children[1]?.textContent.trim(),
  });
}

/**
 * Called by the legacy `labs` and `deprecation` blocks, which replace themselves with this block.
 * What they used to show stays: the authored text becomes the notice. Their header (a heading,
 * or the generic "Early-access technology" / "Deprecation notice") is replaced by the badge.
 * New `feature-lifecycle` metadata takes precedence over the legacy block's stage and notice.
 *
 * @param {Element} block the legacy block
 * @param {'labs'|'deprecation'} kind which legacy block it is
 */
export async function decorateLegacyFeatureLifecycle(block, kind) {
  // the loader only fetches the legacy block's own CSS, so load ours before changing the markup
  await loadCSS(`${window.hlx.codeBasePath}/blocks/feature-lifecycle/feature-lifecycle.css`);

  block.classList.remove('labs', 'deprecation');
  block.classList.add('feature-lifecycle');

  // labs used any heading as its header, deprecation only an h3
  const heading = block.querySelector(kind === 'labs' ? 'h1, h2, h3, h4, h5, h6' : 'h3');
  heading?.remove();

  let notice = '';
  if (kind === 'labs' && !heading) {
    // plain text: either a product ("AEM Sites") or "Header: text", as before
    const text = block.textContent.replace(/\s+/g, ' ').trim();
    const colon = text.indexOf(':');
    if (colon >= 0) notice = text.slice(colon + 1).trim();
    else if (text) notice = formatLegacyLabsNotice(text);
  } else if (block.textContent.trim()) {
    // rich content (links, code, several paragraphs) is moved over as it is
    const cells = [...block.querySelectorAll(':scope > div > div')];
    notice = (cells.length ? cells : [block]).flatMap((cell) => [...cell.childNodes]);
  }
  const metadataNotice = getMetadata('feature-lifecycle-notice').trim();
  if (metadataNotice) notice = metadataNotice;

  await render(block, {
    stage: resolveStage(getMetadata('feature-lifecycle'))
      || (kind === 'labs' ? '3' : '6'),
    notice,
  });
}
