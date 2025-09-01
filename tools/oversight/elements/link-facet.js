import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

function urlDecode(part, rich = false) {
  if (!part) return '/';
  // replace %3C(number|hex|base64|uuid)%3E with <...> (ignore case for the url encoding)

  return rich
    ? part.replace(/%3C(number|hex|base64|uuid)%3E/gi, '<span class="withheld">$1</span>')
    : part.replace(/%3[Cc](number|hex|base64|uuid)%3[Ee]/g, '<$1>');
}

function labelURLParts(url, prefix, solo = false) {
  if (prefix && url.startsWith(prefix) && !solo) {
    return `<span class="collapse" title="${url}">${prefix}</span><span class="suffix" title="${urlDecode(url)}">${urlDecode(url.replace(prefix, ''), true)}</span>`;
  }
  const u = new URL(url);
  return ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash']
    .map((part) => ({ part, value: u[part], full: u.href }))
    .reduce(
      (acc, { part, value, full }) => `${acc}<span class="${part}" title="${full}">${value}</span>`,
      '',
    );
}

/**
 * A custom HTML element to display a list of facets with links.
 * <link-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>Referrer</legend>
 * </link-facet>
 */
export default class LinkFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText, prefix, solo = false) {
    const thumbnailAtt = this.getAttribute('thumbnail') === 'true';
    const faviconAtt = this.getAttribute('favicon') === 'true';
    const isCensored = labelText.includes('...')
      || labelText.includes('<number>') || labelText.includes('%3Cnumber%3E')
      || labelText.includes('<hex>') || labelText.includes('%3Chex%3E')
      || labelText.includes('<base64>') || labelText.includes('%3Cbase64%3E')
      || labelText.includes('<uuid>') || labelText.includes('%3Cuuid%3E');
    if (isCensored) {
      return labelURLParts(labelText, prefix, solo);
    }
    if (thumbnailAtt && labelText.startsWith('https://')) {
      const u = new URL('https://www.aem.live/tools/rum/_ogimage');
      u.searchParams.set('proxyurl', labelText);
      return `
      <img loading="lazy" src="${u.href}" title="${labelText}" alt="thumbnail image for ${labelText}" onerror="this.classList.add('broken')">
      <a href="${labelText}" target="_new">${labelURLParts(labelText, prefix, solo)}</a>`;
    }
    if (thumbnailAtt && (labelText.startsWith('http://') || labelText.startsWith('https://') || labelText.startsWith('android-app://'))) {
      const u = new URL('https://www.aem.live/tools/rum/_ogimage');
      u.searchParams.set('proxyurl', labelText);
      return `
      <img loading="lazy" src="${u.href}" title="${labelText}" alt="thumbnail image for ${labelText}" onerror="${faviconAtt ? `this.src='https://www.google.com/s2/favicons?domain=${labelText}&sz=256';this.classList.add('favicon');` : 'this.classList.add(\'broken\');'}">
      <a href="${labelText}" target="_new">${labelURLParts(labelText, prefix, solo)}</a>`;
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
