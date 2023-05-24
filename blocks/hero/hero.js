export default function decorate(block) {
  const backgroundImageWrapper = block.children[0].querySelector('div');
  const backgroundImage = backgroundImageWrapper.querySelector('img');
  backgroundImageWrapper.setAttribute('class', 'background-image-wrapper');

  const innerContent = block.children[1].querySelector('div');
  innerContent.setAttribute('class', 'inner-content');

  const bottomImageWrapper = block.children[2].querySelector('div');
  bottomImageWrapper.setAttribute('class', 'bottom-image-wrapper');

  block.innerHTML = '';
  if (backgroundImage) {
    backgroundImageWrapper.classList.add('with-bg-img');
    block.style.background = 'transparent';
    block.append(backgroundImageWrapper);
  }
  block.append(innerContent, bottomImageWrapper);
}
