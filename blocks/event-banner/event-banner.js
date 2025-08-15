export default function decorate(block) {
  const content = block.children[0].querySelector('div');
  content.setAttribute('class', 'event-banner-content');

  // Check for background image in content
  const backgroundImg = content.querySelector('img');
  let backgroundImageUrl = '';

  if (backgroundImg) {
    backgroundImageUrl = backgroundImg.src;
    // Remove the image from content since we'll use it as background
    backgroundImg.remove();
  }

  // Add Adobe logo at the top
  const logoImg = document.createElement('img');
  logoImg.src = '/blocks/event-banner/adobe-logo.svg';
  logoImg.alt = 'Adobe';
  logoImg.className = 'adobe-logo';
  content.insertBefore(logoImg, content.firstChild);

  // Add structured content classes
  const headings = content.querySelectorAll('h1, h2, h3');
  if (headings.length > 0) {
    headings[0].classList.add('main-title');
  }

  const paragraphs = content.querySelectorAll('p');
  if (paragraphs.length > 0) {
    paragraphs[0].classList.add('subtitle');
  }

  // Set background image if one was provided
  if (backgroundImageUrl) {
    block.style.setProperty('--event-bg-image', `url('${backgroundImageUrl}')`);
  }

  // Clear the block and add the content
  block.innerHTML = '';
  block.append(content);
}
