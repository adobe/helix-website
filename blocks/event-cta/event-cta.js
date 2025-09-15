// UTM tracking function - consistent with event-banner
function addUTMTracking(button) {
  if (!button.href) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const buttonUrl = new URL(button.href);

    // Add all UTM parameters to the button URL
    for (const [key, value] of params) {
      if (key.startsWith('utm_')) {
        buttonUrl.searchParams.set(key, value);
      }
    }

    button.href = buttonUrl.toString();
  } catch (error) {
    // Silent error handling - don't break the page if UTM tracking fails
  }
}

export default function decorate(block) {
  const content = block.querySelector('div');
  content.setAttribute('class', 'event-cta-content');

  // Find tagline text (first paragraph without a link)
  const paragraphs = content.querySelectorAll('p');
  let tagline = null;

  Array.from(paragraphs).some((p) => {
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

    // Remove the button from its paragraph wrapper for cleaner layout
    const buttonParagraph = ctaButton.closest('p');
    if (buttonParagraph) {
      buttonParagraph.replaceWith(ctaButton);
    }

    // Add UTM parameter handling AFTER DOM manipulation
    addUTMTracking(ctaButton);
  }

  // Clear the block and add the content
  block.innerHTML = '';
  block.append(content);
}