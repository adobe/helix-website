// UTM tracking function - consistent with event-banner

function addUTMTracking(button) {
  if (!button.href) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const buttonUrl = new URL(button.href);

    // Add all UTM parameters to the button URL
    Array.from(params.entries()).forEach(([key, value]) => {
      if (key.startsWith('utm_')) {
        buttonUrl.searchParams.set(key, value);
      }
    });

    button.href = buttonUrl.toString();
  } catch (error) {
    // Silent error handling - don't break the page if UTM tracking fails
  }
}

function decorateSingleButton(block, content) {
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

function decorateMultiButtons(block, content) {
  content.setAttribute('class', 'event-cta-content multi-buttons');

  // Find the CTA text (first paragraph without a link)
  const paragraphs = content.querySelectorAll('p');
  let ctaText = null;

  Array.from(paragraphs).some((p) => {
    if (!p.querySelector('a')) {
      ctaText = p;
      return true;
    }
    return false;
  });

  // Find all the button links
  const buttons = content.querySelectorAll('a');

  if (buttons.length === 0) {
    return;
  }

  // Create the new structure
  const newContent = document.createElement('div');
  newContent.className = 'event-cta-content multi-buttons';

  // Add the centered CTA text
  if (ctaText) {
    const centeredCTA = document.createElement('p');
    centeredCTA.className = 'cta-text';
    centeredCTA.textContent = ctaText.textContent.trim();
    newContent.appendChild(centeredCTA);
  }

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'multi-button-container';

  // Process each button
  Array.from(buttons).forEach((button, index) => {
    // Style the button
    button.classList.add('button');
    button.id = `EventCTAButton-${index + 1}`;

    // Add UTM tracking
    addUTMTracking(button);

    // Add button to container
    buttonContainer.appendChild(button);
  });

  newContent.appendChild(buttonContainer);

  // Replace content
  block.innerHTML = '';
  block.appendChild(newContent);
}

export default function decorate(block) {
  const content = block.querySelector('div');

  // Check if this is the multi-button variant
  const isMultiVariant = block.classList.contains('multi');

  if (isMultiVariant) {
    decorateMultiButtons(block, content);
  } else {
    decorateSingleButton(block, content);
  }
}
