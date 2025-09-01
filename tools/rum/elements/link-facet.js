import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

function labelURLParts(url) {
  const u = new URL(url);
  return ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash']
    .reduce((acc, part) => `${acc}<span class="${part}" title="${u.href}">${u[part]}</span>`, '');
}

/**
 * A custom HTML element to display a list of facets with links.
 * <link-facet facet="userAgent" mode="all">
 *   <legend>Referrer</legend>
 * </link-facet>
 */
export default class LinkFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    const thumbnailAtt = this.getAttribute('thumbnail') === 'true';
    const faviconAtt = this.getAttribute('favicon') === 'true';
    if (thumbnailAtt && labelText.startsWith('https://')) {
      const u = new URL('https://www.aem.live/tools/rum/_ogimage');
      u.searchParams.set('proxyurl', labelText);
      return `<a href="${labelText}" target="_new">${labelURLParts(labelText)}</a>`;
    }
    if (thumbnailAtt && (labelText.startsWith('http://') || labelText.startsWith('https://') || labelText.startsWith('android-app://'))) {
      const u = new URL('https://www.aem.live/tools/rum/_ogimage');
      u.searchParams.set('proxyurl', labelText);
      return `
      <img loading="lazy" src="${u.href}" title="${labelText}" alt="thumbnail image for ${labelText}" onerror="${faviconAtt ? `this.src='https://www.google.com/s2/favicons?domain=${labelText}&sz=256';this.classList.add('favicon');` : 'this.classList.add(\'broken\');'}">
      <a href="${labelText}" target="_new">${labelURLParts(labelText)}</a>`;
    }
    if (labelText.startsWith('https://') || labelText.startsWith('http://')) {
      return `<a href="${labelText}" target="_new">${labelText}</a>`;
    }
    if (labelText.startsWith('referrer:')) {
      return `<a href="${labelText.replace('referrer:', 'https://')}" target="_new">${labelText.replace('referrer:', '')}</a>`;
    }
    const currentURL = new URL(window.location.href);
    const domain = currentURL.searchParams.get('domain');
    if (labelText.startsWith('navigate:')) {
      return `navigate from <a href="${labelText.replace('navigate:', `https://${domain}`)}" target="_new">${labelText.replace('navigate:', '')}</a>`;
    }
    if (this.placeholders && this.placeholders[labelText]) {
      return (`${this.placeholders[labelText]} [${labelText}]`);
    }
    if (domain.endsWith(':all')) {
      currentURL.searchParams.set('domain', labelText);
      currentURL.searchParams.delete('domainkey');
      return `<a href="${currentURL.toString()}" target="_new">${labelText}</a>`;
    }
    return escapeHTML(labelText);
  }
}
