import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets with links.
 * <link-facet facet="userAgent" drilldown="share.html" mode="all">
 *   <legend>Referrer</legend>
 * </link-facet>
 */
export default class ThumbnailFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    if (labelText.startsWith('https://') || labelText.startsWith('http://')) {
      return `<a href="${labelText}" target="_new">${labelText}</a>`;
    }
    if (this.placeholders && this.placeholders[labelText]) {
      return (`${this.placeholders[labelText]} [${labelText}]`);
    }
    return escapeHTML(labelText);
  }
}
