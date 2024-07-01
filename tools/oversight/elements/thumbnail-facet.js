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
    if (labelText.startsWith('https://') && labelText.includes('media_')) {
      return `<img src="${labelText}?width=750&format=webply&optimize=medium"">`;
    } if (labelText.startsWith('http')) {
      return `<img src="${labelText}">`;
    }
    return escapeHTML(labelText);
  }
}
