import { loadScript } from '../../scripts/lib-franklin.js';
import createTag from '../../utils/tag.js';

async function loadWidget(el) {
  await loadScript('https://unpkg.com/@statuspage/status-widget/dist/index.js');
  const status = createTag('statuspage-widget', { src: 'https://status.project-helix.io', appearance: 'badge' });
  el.append(status);
}

export default async function init(el) {
  setTimeout(() => {
    loadWidget(el);
  }, 3000);
}
