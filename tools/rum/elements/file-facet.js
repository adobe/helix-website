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
    const removedFragment = labelText.split('#')[0];
    const isImage = removedFragment.startsWith('http') && (removedFragment.endsWith('.png') || removedFragment.endsWith('.jpg') || removedFragment.endsWith('.jpeg') || removedFragment.endsWith('.gif') || removedFragment.endsWith('.svg') || removedFragment.endsWith('.webp'));
    const imageString = isImage ? `<img class="facet-thumbnail" src="${labelText}">` : '';
    return `${imageString}<span class="filename">${escapeHTML(labelText)}</span>`;
  }
}
