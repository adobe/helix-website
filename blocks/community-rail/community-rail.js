import { createTag } from '../../scripts/scripts.js';

/**
 * Community Rail — Collection block
 * One row per community link, rendered as a stacked button list.
 *
 * | Label | Link |
 * | Discord | https://discord.gg/aem-live |
 */

function getCellLink(cell) {
  const link = cell?.querySelector('a');
  if (link?.href) {
    return {
      href: link.href,
      label: link.textContent.trim(),
    };
  }
  const text = cell?.textContent.trim();
  if (text?.startsWith('http')) {
    return { href: text, label: '' };
  }
  return null;
}

function parseRow(row) {
  const cells = [...row.children].filter((cell) => cell.tagName === 'DIV');
  if (!cells.length) return null;

  if (cells.length >= 2) {
    const label = cells[0].textContent.trim();
    const linkData = getCellLink(cells[1]);
    if (!linkData?.href || !label) return null;
    return { label, href: linkData.href };
  }

  const linkData = getCellLink(cells[0]);
  if (!linkData?.href) return null;
  return {
    label: linkData.label || linkData.href,
    href: linkData.href,
  };
}

export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div')]
    .map(parseRow)
    .filter(Boolean);

  block.textContent = '';

  if (!items.length) return;

  const list = createTag('div', { class: 'community-rail-list' });

  items.forEach(({ label, href }) => {
    const wrapper = createTag('p', { class: 'button-container' });
    wrapper.append(createTag('a', { href, class: 'button secondary' }, label));
    list.append(wrapper);
  });

  block.append(list);
}
