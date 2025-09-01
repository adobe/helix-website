// UTM tracking function - consistent with event-banner
function addUTMTracking(button) {
  // Parse current page URL for all UTM parameters
  const params = new URLSearchParams(window.location.search);
  const utmParams = [];

  // Collect all UTM parameters using Array.from instead of for...of
  Array.from(params.entries()).forEach(([key, value]) => {
    if (key.startsWith('utm_') || key === 'utm') {
      utmParams.push([key, value]);
    }
  });

  if (utmParams.length > 0 && button.href) {
    try {
      const buttonUrl = new URL(button.href);
      // Add all UTM parameters to the button URL
      utmParams.forEach(([key, value]) => {
        buttonUrl.searchParams.set(key, value);
      });
      button.href = buttonUrl.toString();
    } catch (error) {
      // Silent error handling - don't break the page if UTM tracking fails
    }
  }
}

export default function decorate(block) {
  const content = block.querySelector('div');
  content.setAttribute('class', 'event-cta-content');

  // Find tagline text (first paragraph without a link)
  const paragraphs = content.querySelectorAll('p');
  let tagline = null;

  paragraphs.some((p) => {
    if (!p.querySelector('a')) {
      tagline = p;
      return true;
    }
    return false;
  });

  if (tagline) {
    tagline.classList.add('tagline-text');
  }

  // Find and style the button
  const ctaButton = content.querySelector('a');
  if (ctaButton) {
    ctaButton.classList.add('button');
    ctaButton.id = 'EventCTAButton'; // Add specific ID for tracking

    // Add UTM parameter handling
    addUTMTracking(ctaButton);

    // Remove the button from its paragraph wrapper for cleaner layout
    const buttonParagraph = ctaButton.closest('p');
    if (buttonParagraph) {
      buttonParagraph.replaceWith(ctaButton);
    }
  }

  // Clear the block and add the content
  block.innerHTML = '';
  block.append(content);
}
