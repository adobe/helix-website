import { getMetadata, toClassName } from './aem.js';
import parsePluginParams from './plugin-params.js';

/**
 * Registry of templates, each backed by a plugin registered against
 * window.hlx.plugins with a condition matching the page's template metadata.
 * Ported from lib-franklin.js — aem.js has no equivalent.
 */
export default class TemplatesRegistry {
  // Register a new template
  // eslint-disable-next-line class-methods-use-this
  add(id, url) {
    if (Array.isArray(id)) {
      id.forEach((i) => window.hlx.templates.add(i));
      return;
    }
    const { id: templateId, config: templateConfig } = parsePluginParams(id, url);
    templateConfig.condition = () => toClassName(getMetadata('template')) === templateId;
    window.hlx.plugins.add(templateId, templateConfig);
  }

  // Get the template
  // eslint-disable-next-line class-methods-use-this
  get(id) { return window.hlx.plugins.get(id); }

  // Check if the template exists
  // eslint-disable-next-line class-methods-use-this
  includes(id) { return window.hlx.plugins.includes(id); }
}
