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

// Keep in sync with PHASES in generate.py. `label` is the descriptive term that leads;
// `name` is the garden nickname; `number` is the value used in `feature-lifecycle` metadata.
const STAGES = {
  seed: { number: '1', name: 'Seed', label: 'Interest' },
  sprout: { number: '2', name: 'Sprout', label: 'Repeatable' },
  sapling: { number: '3', name: 'Sapling', label: 'Increasing use' },
  rooted: { number: '4', name: 'Rooted', label: 'Mainstream' },
  wilting: { number: '5', name: 'Wilting', label: 'Decreasing use' },
  spent: { number: '6', name: 'Spent', label: 'Discouraged' },
  uprooted: { number: '7', name: 'Uprooted', label: 'Removed' },
};

function formatLegacyLabsNotice(lab) {
  return `Ask us about this feature from the ${lab} labs on your Teams or Slack channel!`;
}

export function getFeatureLifecycleMetadata() {
  const explicitStage = getMetadata('feature-lifecycle').trim();
  const labs = getMetadata('labs').trim();
  const deprecation = getMetadata('deprecation').trim();
  let inferredStage = '';
  if (labs) inferredStage = STAGES.sapling.number;
  else if (deprecation) inferredStage = STAGES.spent.number;
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

/** Resolve a stage number from metadata to a key of STAGES, or null. Allowlist only. */
function resolveStage(value) {
  const v = (value || '').trim();
  if (!v) return null;
  return Object.keys(STAGES).find((key) => STAGES[key].number === v) || null;
}

async function loadBadgeIcon(stage) {
  const response = await fetch(`/icons/feature-lifecycle-${stage}.svg`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feature lifecycle badge icon: ${response.status}`);
  }

  const svgDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  const svg = svgDocument.documentElement;
  if (svg.localName !== 'svg' || svgDocument.querySelector('parsererror')) {
    throw new Error(`Invalid feature lifecycle badge SVG for stage "${stage}".`);
  }

  const icon = document.importNode(svg, true);
  icon.classList.add('feature-lifecycle-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  return icon;
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
 * nodes taken from authored content. Returns the stage slug, or null if there is nothing to show.
 */
async function render(block, { stage, notice }) {
  // allowlist: an unknown value never reaches the DOM or a URL
  const slug = resolveStage(stage);
  if (stage?.trim() && !slug) {
    const numbers = Object.values(STAGES).map(({ number }) => number);
    // eslint-disable-next-line no-console
    console.warn(`feature-lifecycle: unknown stage "${stage.trim()}", valid: ${numbers.join(', ')}`);
  }
  if (!slug) {
    block.remove();
    return null;
  }
  const { name, label } = STAGES[slug];
  // headings on /docs/lifecycle are the descriptive labels, e.g. #increasing-use
  const anchor = label.toLowerCase().replace(/\s+/g, '-');
  const icon = await loadBadgeIcon(slug);

  block.textContent = '';
  block.classList.add(`feature-lifecycle-${slug}`);

  const badge = document.createElement('a');
  badge.className = 'badge';
  badge.href = `/docs/lifecycle#${anchor}`;
  badge.title = 'Where this feature stands in the feature lifecycle';
  badge.setAttribute('aria-label', `Feature lifecycle: ${label} (${name}). Read about the feature lifecycle.`);
  badge.append(icon);
  block.append(badge);

  let note = null;
  if (typeof notice === 'string' ? notice : notice?.length) {
    note = document.createElement('div');
    note.className = `feature-lifecycle-notice feature-lifecycle-${slug}`;
    note.setAttribute('role', 'note');
    if (typeof notice === 'string') note.textContent = notice;
    else note.append(...notice);
  }
  place(block, note);
  return slug;
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
    stage: STAGES[resolveStage(getMetadata('feature-lifecycle'))]?.number
      || (kind === 'labs' ? STAGES.sapling.number : STAGES.spent.number),
    notice,
  });
}
