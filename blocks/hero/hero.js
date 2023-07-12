import createTag from '../../utils/tag.js';

export default function decorate(block) {
  const backgroundImageWrapper = block.children[0].querySelector('div');
  const backgroundImage = backgroundImageWrapper.querySelector('img');
  backgroundImageWrapper.setAttribute('class', 'background-image-wrapper');

  const innerContent = block.children[1].querySelector('div');
  innerContent.setAttribute('class', 'inner-content');

  if (innerContent) {
    const eyebrow = innerContent.querySelector('h3');
    if (eyebrow && eyebrow.querySelector('.icon')) {
      eyebrow.classList.add('icon-eyebrow');
    }
  }

  if (!block.classList.contains('multiple-cta')) {
    const ctaButton = innerContent.querySelector('a');
    if (ctaButton) {
      ctaButton.classList.add('button', 'large');
      ctaButton.closest('p').replaceWith(ctaButton);
    }
  } else {
    const ctaButtonList = innerContent.querySelector('ul');
    ctaButtonList.classList.add('cta-button-list');
    const ctaButtons = ctaButtonList.querySelectorAll('ul a');
    ctaButtons.forEach((btn) => {
      btn.classList.add('button', 'large', 'black-border');
    });
  }

  const imageWrapper = block.children[2].querySelector('div');
  imageWrapper.setAttribute('class', 'image-wrapper');

  block.innerHTML = '';
  if (backgroundImage) {
    backgroundImageWrapper.classList.add('with-bg-img');
    block.style.background = 'transparent';
    block.append(backgroundImageWrapper);
  } else {
    block.classList.add('colorful-bg');
    const checkerBoardGuide = createTag('div', {
      class: 'checker-board-guide',
    });
    block.append(checkerBoardGuide);
  }

  if (block.classList.contains('side-by-side')) {
    // for hero.side-by-side
    const containedWrapper = createTag('div', {
      class: 'contained-wrapper',
    });
    containedWrapper.append(innerContent, imageWrapper);
    block.append(containedWrapper);
  } else {
    // default hero
    block.append(innerContent, imageWrapper);
  }
}
