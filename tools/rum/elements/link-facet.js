import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets with links.
 * <link-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>Referrer</legend>
 * </link-facet>
 */
export default class LinkFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    const thumbnailAtt = this.getAttribute('thumbnail');
    if (thumbnailAtt && (labelText.startsWith('https://') || labelText.startsWith('android-app://'))) {
      const u = new URL('https://www.aem.live/tools/rum/_ogimage');
      u.searchParams.set('proxyurl', labelText);
      return `
      <img loading="lazy" src="${u.href}" title="${labelText}" alt="thumbnail image for ${labelText}" onerror="this.classList.add('broken')">
      <a href="${labelText}" target="_new">${labelText}</a>`;
    }
    if (labelText.startsWith('https://') || labelText.startsWith('http://')) {
      return `<a href="${labelText}" target="_new">${labelText}</a>`;
    }
    if (labelText.startsWith('referrer:')) {
      return `<a href="${labelText.replace('referrer:', 'https://')}" target="_new">${labelText.replace('referrer:', '')}</a>`;
    }
    if (labelText.startsWith('navigate:')) {
      const domain = new URL(window.location.href).searchParams.get('domain');
      return `navigate from <a href="${labelText.replace('navigate:', `https://${domain}`)}" target="_new">${labelText.replace('navigate:', '')}</a>`;
    }
    if (this.placeholders && this.placeholders[labelText]) {
      return (`${this.placeholders[labelText]} [${labelText}]`);
    }
    return escapeHTML(labelText);
  }
}
