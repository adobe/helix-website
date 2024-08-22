import { createTag } from '../../scripts/scripts.js';

/**
 * Updates the 'level' query parameter in the URL.
 * @param {number} value Value for the 'level' parameter.
 */
function updateLevelParam(value) {
  const params = new URLSearchParams(window.location.search);
  params.set('level', value);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({ path: url }, '', url);
}

/**
 * Updates the venn content display based on the value of the range.
 * @param {HTMLInputElement} range Range input element.
 * @param {number} value Value of the range.
 * @param {NodeListOf<HTMLLIElement>} lis List of <li> elements to update.
 */
function updateVennDisplay(value, lis) {
  lis.forEach((li) => {
    li.removeAttribute('style');
    const min = parseInt(li.dataset.min, 10);
    const max = parseInt(li.dataset.max, 10);
    if (value < min) li.className = 'below-range';
    else if (value >= min && value < max) {
      li.className = 'in-range';
      // calculate the percentage position of 'value' within the range min - max
      li.style.setProperty('--venn-progress', `${((value - min + 1) / (max - min + 1)) * 100}%`);
    } else li.className = 'exceeds-range';
  });
}

export default async function decorate(block) {
  const content = block.firstElementChild;
  content.className = 'venn-content';
  const segments = ['left', 'intersection', 'right'];
  [...content.children].forEach((segment, i) => {
    const layout = segments[i];
    if (layout) segment.className = `venn-content-${layout}`;
  });

  // establish skill level ranges
  let sliderMin = 0;
  let sliderMax = 0;
  const lis = block.querySelectorAll('li');
  lis.forEach((wrapper) => {
    // identify skill from <a> tag
    const skill = wrapper.querySelector('a');
    // separate skill level range from skill
    const levels = wrapper.textContent.replace(skill.textContent, '').trim();
    wrapper.innerHTML = skill.outerHTML;
    if (levels) {
      // extract min and max from 'levels' string range
      const [min, max] = levels.replace('(', '').split(',').map((n) => parseInt(n, 10));
      if (sliderMin === 0 || min < sliderMin) sliderMin = min;
      if (sliderMax === 0 || max > sliderMax) sliderMax = max;
      wrapper.dataset.min = min;
      wrapper.dataset.max = max;
    }
  });

  // build skill slider
  const slider = createTag('div', { class: 'venn-slider' });
  const range = createTag('input', {
    type: 'range', name: 'venn-slider', id: 'venn-slider', step: 1,
  });
  // set range min and max based on skill level values
  range.min = sliderMin;
  range.max = sliderMax;
  range.addEventListener('input', () => {
    updateLevelParam(range.value);
    updateVennDisplay(parseInt(range.value, 10), lis);
  });
  const label = createTag('label', { type: 'range', for: 'venn-slider' });
  label.textContent = 'Skill Level';
  const ticks = createTag('div', { class: 'venn-ticks' });
  // TODO: remove hard-coded text
  ticks.innerHTML = `<span>Beginner</span>
    <span>Expert</span>`;
  slider.append(label, range, ticks);
  block.prepend(slider);

  // retrieve level query param
  const params = new URLSearchParams(window.location.search);
  const level = params.get('level') || sliderMin;
  range.value = level;
  updateVennDisplay(level, lis);
}
