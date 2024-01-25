// Load the visible-for Web Component code whenever this block is used
import '../../web-components/visible-for.js';

// Replace the <em> text of this block
// with a visible-for element, and replace
// the block's nested div with a single p element
export default function decorate($block) {
  const marker = $block.querySelector('em');
  if(marker) {
    const vfor = document.createElement('visible-for');
    marker.parentElement.replaceChild(vfor, marker);
    const innerDiv = $block.querySelector(':scope > div > div');
    if(innerDiv) {
      const $p = document.createElement('p');
      $p.innerHTML = innerDiv.innerHTML;
      $block.replaceChildren($p);
    }
  }
}
