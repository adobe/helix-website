import { loadScript } from '../../scripts/scripts.js';
import createTag from '../../utils/tag.js';

export default async function init(el) {
  await loadScript('https://unpkg.com/@statuspage/status-widget/dist/index.js');
  const status = createTag('statuspage-widget', { src: 'https://status.project-helix.io', appearance: 'badge' });
  el.append(status);
}
