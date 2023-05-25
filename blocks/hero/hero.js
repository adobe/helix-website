import createTag from '../../utils/tag.js';

export default function decorate(block) {
  const backgroundImageWrapper = block.children[0].querySelector('div');
  const backgroundImage = backgroundImageWrapper.querySelector('img');
  backgroundImageWrapper.setAttribute('class', 'background-image-wrapper');

  const innerContent = block.children[1].querySelector('div');
  innerContent.setAttribute('class', 'inner-content');
  const ctaButton = innerContent.querySelector('a');
  if (ctaButton) {
    ctaButton.classList.add('button');
  }

  const imageWrapper = block.children[2].querySelector('div');
  imageWrapper.setAttribute('class', 'image-wrapper');

  block.innerHTML = '';
  if (backgroundImage) {
    backgroundImageWrapper.classList.add('with-bg-img');
    block.style.background = 'transparent';
    block.append(backgroundImageWrapper);
  } else {
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
