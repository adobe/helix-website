import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets with thumbnails.
 * <thumbnail-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>User Agent</legend>
 *   <dl>
 *    <dt>desktop</dt>
 *    <dd>Chrome 90.0.4430.93 (Windows 10)</dd>
 *   </dl>
 * </thumbnail-facet>
 */
export default class ThumbnailFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    const fileName = labelText.split('/').pop().replace(/\?.*/, '');
    if (labelText.startsWith('https://') && labelText.includes('media_')) {
      return `<img src="${labelText}?width=750&format=webply&optimize=medium" title="${escapeHTML(labelText)}"><span class="filename">${escapeHTML(fileName)}</span>`;
    } if (labelText.startsWith('http') && labelText.match(/\.(jpeg|jpg|gif|png|svg|webp)$/)) {
      return `<img src="${labelText}" title="${escapeHTML(labelText)}"><span class="filename">${escapeHTML(fileName)}</span>`;
    }
    return escapeHTML(labelText);
  }
}
