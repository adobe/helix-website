import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

function createAutoBlock(pages) {
  const rows = [];
  for (let i = 0; i < pages.length; i += 3) {
    const row = pages.slice(i, i + 3).map((page) => {
      const title = document.createElement('p');
      const link = document.createElement('a');
      link.href = page.path;
      link.textContent = page.title;
      const description = document.createElement('p');
      description.textContent = page.description;
      title.append(link);
      return { elems: [title, description] };
    });
    rows.push(row);
  }

  const cards = buildBlock('cards', rows);
  cards.classList.add('alternate');
  return cards;
}

export default async function decorate(block) {
  const response = await fetch('/docs/feature-lifecycle.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch feature lifecycle index: ${response.status}`);
  }

  const { data } = await response.json();
  if (!Array.isArray(data)) throw new Error('Feature lifecycle index does not contain a data array.');
  const pages = data.filter((page) => (
    typeof page['feature-lifecycle'] === 'string' && page['feature-lifecycle'].trim()
  ));
  const cards = createAutoBlock(pages);
  block.replaceWith(cards);
  decorateBlock(cards);
  await loadBlock(cards);
}
