import { removeOuterElementLayer, combineChildrenToSingleDiv, addInViewAnimationToMultipleElements } from '../../utils/helpers.js';

const ColorIconPattern = ['pink', 'lightgreen', 'purple', 'yellow', 'purple', 'yellow', 'lightgreen', 'pink'];
const ColorNumberPattern = ['lightgreen', 'pink', 'purple', 'yellow'];
const animationConfig = {
  staggerTime: 0.04,
  items: [
    {
      selectors: '.columns-content-wrapper',
      animatedClass: 'fade-up',
      staggerTime: 0.15,
    },
  ],
};

const getColorPatternIndex = (patternArray, currentIndex) => (currentIndex % patternArray.length);

export default function decorate(block) {
  const classes = ['one', 'two', 'three', 'four', 'five'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });

  const row = block.children[0];
  if (row) {
    block.classList.add(classes[row.children.length - 1]);
  }

  block.querySelectorAll(':scope > div > div').forEach((cell, index) => {
    if (!cell.previousElementSibling) cell.classList.add('columns-left');
    if (!cell.nextElementSibling) cell.classList.add('columns-right');

    const img = cell.querySelector('img');
    if (img) {
      cell.classList.add('columns-image');
      observer.observe(img);
      img.parentElement.closest('p').classList.add('image-wrapper-el');
    } else {
      cell.classList.add('columns-content');
      const wrapper = document.createElement('div');
      wrapper.className = 'columns-content-wrapper';
      while (cell.firstChild) wrapper.append(cell.firstChild);
      cell.append(wrapper);

      // colored icons
      removeOuterElementLayer(cell, '.icon');
      if (block.classList.contains('colored-icon')) {
        const colorIconPatternIndex = getColorPatternIndex(ColorIconPattern, index);
        cell.querySelector('.icon').classList.add('colored-tag', 'circle', colorIconPatternIndex);
      }
    }

    // colored number tag in cards
    if (block.classList.contains('colored-number')) {
      const colorNumberPatternIndex = getColorPatternIndex(ColorNumberPattern, index);
      cell.querySelector('h4')?.classList.add('colored-tag', 'number-tag', ColorNumberPattern[colorNumberPatternIndex]);
    }
  });

  if (block.classList.contains('single-grid')) {
    combineChildrenToSingleDiv(block);
  }

  if (block.classList.contains('inview-animation')) {
    addInViewAnimationToMultipleElements(animationConfig.items, block, animationConfig.staggerTime);
  }
}
