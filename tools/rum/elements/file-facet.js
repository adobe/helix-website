import { escapeHTML } from '../utils.js';
import ListFacet from './list-facet.js';

/**
 * A custom HTML element to display a list of facets with literal
 * values. If a placeholder has been provided, then the explanation
 * will be shown after the literal value.
 * <file-facet facet="viewmedia.source" mode="all">
 *   <legend>Media Source</legend>
 * </file-facet>
 */
export default class FileFacet extends ListFacet {
  // eslint-disable-next-line class-methods-use-this
  createLabelHTML(labelText) {
    return `<span class="filename">${escapeHTML(labelText)}</span>`;
  }
}
