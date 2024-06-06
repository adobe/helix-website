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

const exitFullScreen = (e) => {
  if (e.key && e.key !== 'Escape') {
    // ignore other keys
    return;
  }
  const imgClone = document.querySelector('.columns.fullscreen-images img.fullscreen');
  if (imgClone) {
    imgClone.remove();
  }
};

const enterFullScreen = (block, img) => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    exitFullScreen(e);
    const imgUrl = new URL(img.src);
    imgUrl.search = '';
    const imgClone = img.cloneNode();
    imgClone.src = imgUrl.toString();
    imgClone.className = 'fullscreen';
    imgClone.style.top = `${window.scrollY}px`;
    imgClone.title = 'Click or hit ESC to exit full screen mode';
    imgClone.addEventListener('click', exitFullScreen);
    block.prepend(imgClone);
  }, { capture: true });
  img.parentElement.title = 'Click to view in full screen mode';
};

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
      img.parentElement.closest('p')?.classList.add('image-wrapper-el');
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

  if (block.classList.contains('fullscreen-images')) {
    block.querySelectorAll('picture > img').forEach((img) => enterFullScreen(block, img));
    if (block === document.querySelector('main .columns.fullscreen-images')) {
      // add exit listeners once
      document.body.addEventListener('click', exitFullScreen);
      document.body.addEventListener('keyup', exitFullScreen);
    }
  }
}
