// UTM tracking function
function addUTMTracking(button) {
  // Parse current page URL for UTM parameters
  const params = new URLSearchParams(window.location.search);
  const utmValue = params.get('utm');

  if (utmValue && button.href) {
    try {
      const buttonUrl = new URL(button.href);
      buttonUrl.searchParams.set('utm', utmValue);
      button.href = buttonUrl.toString();
    } catch (error) {
      console.warn('Error adding UTM parameter to button:', error);
    }
  }
}

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

  // Find and style the button
  const ctaButton = content.querySelector('a');
  if (ctaButton) {
    ctaButton.classList.add('button', 'large');
    ctaButton.id = 'DevLiveRegButton'; // Add specific ID for UTM tracking
    // Don't replace the parent paragraph, just style the button
    ctaButton.style.display = 'inline-block';
    
    // Add UTM parameter handling
    addUTMTracking(ctaButton);
  }

  // Add structured content classes
  const headings = content.querySelectorAll('h1, h2, h3');
  if (headings.length > 0) {
    headings[0].classList.add('main-title');
  }

  const paragraphs = content.querySelectorAll('p');
  if (paragraphs.length > 0 && !paragraphs[0].querySelector('a')) {
    paragraphs[0].classList.add('subtitle');
  }
  if (paragraphs.length > 1 && !paragraphs[1].querySelector('a')) {
    paragraphs[1].classList.add('event-details');
  }

  // Set background image if one was provided
  if (backgroundImageUrl) {
    block.style.setProperty('--event-bg-image', `url('${backgroundImageUrl}')`);
  }

  // Clear the block and add the content
  block.innerHTML = '';
  block.append(content);
}
