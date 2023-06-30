import createTag from '../../utils/tag.js';

export default function decorate(block) {
  const outerSectionWrapper = block.closest('.section');
  outerSectionWrapper.classList.add('roi-calulator-outer-wrapper');

  const upperContent = block.children[0].querySelector('div');
  upperContent.setAttribute('class', 'upper-content');
  const ctaButton = upperContent.querySelector('a');
  if (ctaButton) {
    ctaButton.classList.add('button', 'large');
    ctaButton.closest('p').replaceWith(ctaButton);
  }

  const innerContent = createTag('div', { class: 'inner-content contained-wrapper' });
  innerContent.appendChild(upperContent);

  block.innerHTML = '';

  // colorful background setting
  block.classList.add('colorful-bg');
  const checkerBoardGuide = createTag('div', {
    class: 'checker-board-guide',
  });
  block.append(checkerBoardGuide);

  // TODO: append more content like form & ROI calculator here
  // const calculatorContent = block.children[1].querySelector('div');

  block.append(innerContent);
}
