import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets with literal
 * values. If a placeholder has been provided, then the explanation
 * will be shown after the literal value.
 * <literal-facet facet="viewmedia.source" drilldown="share.html" mode="all">
 *   <legend>Media Source</legend>
 * </literal-facet>
 */
export default class LiteralFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    if (this.placeholders && this.placeholders[labelText]) {
      return `<span class="value">${labelText}</span><span class="label">${this.placeholders[labelText]}</span>`;
    }
    return `<span class="value">${escapeHTML(labelText)}</span>`;
  }
}
