import createTag from '../../utils/tag.js';

// Configuration will be loaded dynamically from config service
let config = null;

/**
 * Fetches configuration from the config service
 * @returns {Promise<Object>} Configuration object with API keys and base URL
 */
async function fetchConfig() {
  if (config) {
    return config;
  }

  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }
    const configData = await response.json();
    config = configData.public;
    return config;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching configuration:', error);
    // Fallback to hard-coded values if config service is unavailable
    config = {
      xwalktrial: {
        webApi: 'https://3531103-xwalktrial.adobeioruntime.net/api/v1/web/web-api',
      },
    };
    return config;
  }
}

// Constants for template placeholder generation
const PLACEHOLDER_COLORS = ['#e8f4fd', '#f0f9ff', '#fef3e2'];
const PLACEHOLDER_DIMENSIONS = {
  width: 150,
  height: 120,
};

/**
 * Generates a data URL for an SVG placeholder image
 * @param {string} text - The text to display in the placeholder
 * @param {number} index - The index to determine background color
 * @param {Object} options - Optional configuration object
 * @param {number} options.width - Width of the placeholder (default: 150)
 * @param {number} options.height - Height of the placeholder (default: 120)
 * @returns {string} Data URL for the SVG placeholder
 */
function generatePlaceholderSVG(text, index, options = {}) {
  const { width = PLACEHOLDER_DIMENSIONS.width, height = PLACEHOLDER_DIMENSIONS.height } = options;
  const backgroundColor = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const centerX = width / 2;
  const centerY = height / 2;

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}" stroke="#ddd" stroke-width="1"/>
      <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
        ${text}
      </text>
      <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
        Preview
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

// Define the steps for the trial setup process
const TRIAL_STEPS = [
  { key: 'createUser', label: 'Creating user account' },
  { key: 'quicksite', label: 'Creating site' },
  { key: 'permissions', label: 'Setting up permissions' },
  { key: 'codeBus', label: 'Configuring site / repo' },
  { key: 'publishContent', label: 'Publishing content' },
  { key: 'sendNotification', label: 'Sending notification' },
];

// Mapping object for step names to readable text for error messages
const STEP_NAME_MAPPING = {
  createUser: 'user account creation',
  quicksite: 'site creation',
  permissions: 'permissions setup',
  codeBus: 'site/repo configuration',
  publishContent: 'content publishing',
  sendNotification: 'notification sending',
};

/**
 * Formats a step key into a readable text for error messages
 * @param {string} stepKey - The step key (e.g., 'createUser', 'publishContent')
 * @returns {string} - The formatted readable text
 */
function formatStepNameForError(stepKey) {
  // First check if we have a specific mapping for this step
  if (STEP_NAME_MAPPING[stepKey]) {
    return STEP_NAME_MAPPING[stepKey];
  }

  // Fallback to a more robust camelCase conversion
  return stepKey
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toLowerCase()) // Make first letter lowercase
    .trim(); // Remove any leading/trailing spaces
}

/**
 * Creates and shows a custom modal dialog
 * @param {string} message - The error message to display
 * @param {string} title - The modal title (optional, defaults to "Error")
 */
function showModal(message, title = 'Error') {
  // Create modal overlay
  const overlay = createTag('div', { class: 'modal-overlay' });

  // Create modal container
  const modal = createTag('div', { class: 'modal-container' });

  // Create modal header
  const header = createTag('div', { class: 'modal-header' });
  const modalTitle = createTag('h3', {}, title);
  const closeButton = createTag('button', { class: 'modal-close', type: 'button' }, '×');
  header.append(modalTitle, closeButton);

  // Create modal body
  const body = createTag('div', { class: 'modal-body' });
  const messageElement = createTag('p', {}, message);
  body.append(messageElement);

  // Create modal footer
  const footer = createTag('div', { class: 'modal-footer' });
  const okButton = createTag('button', { class: 'modal-ok', type: 'button' }, 'OK');
  footer.append(okButton);

  // Assemble modal
  modal.append(header, body, footer);
  overlay.append(modal);

  // Add to document
  document.body.appendChild(overlay);

  // Add event listeners
  const closeModal = () => {
    document.body.removeChild(overlay);
  };

  closeButton.addEventListener('click', closeModal);
  okButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Focus the OK button for accessibility
  okButton.focus();
}

function showSuccessMessage(element) {
  const successMessage = createTag('div', { class: 'success-message' });
  const completionText = createTag('p', {}, 'Your environment is ready! You will receive an email with access details shortly.');
  successMessage.appendChild(completionText);
  element.replaceWith(successMessage);
}

function createStatusInline(form) {
  const statusContainer = createTag('div', { class: 'status-container' });
  form.innerHTML = '';
  form.appendChild(statusContainer);

  const header = createTag('div', { class: 'status-header' });
  const title = createTag('h2', {}, 'Setting up your environment...');
  header.appendChild(title);

  const stepsContainer = createTag('div', { class: 'steps-container' });

  // Create step elements for each major step
  TRIAL_STEPS.forEach((step) => {
    const stepElement = createTag('div', {
      class: 'step-item',
      'data-step': step.key,
    });

    const spinner = createTag('div', { class: 'spinner' });
    const stepLabel = createTag('span', { class: 'step-label' }, step.label);

    stepElement.appendChild(spinner);
    stepElement.appendChild(stepLabel);
    stepsContainer.appendChild(stepElement);
  });

  const errorContainer = createTag('div', {
    class: 'error-container',
    style: 'display: none;',
  });

  const retryButton = createTag('button', {
    class: 'retry-button',
    type: 'button',
  }, 'Try Again');

  errorContainer.appendChild(retryButton);

  statusContainer.appendChild(header);
  statusContainer.appendChild(stepsContainer);
  statusContainer.appendChild(errorContainer);

  return statusContainer;
}

function updateStatusInline(form, status) {
  const steps = TRIAL_STEPS.map((step) => step.key);
  let errorMessage = null;
  let errorStep = null;
  let hasError = false;

  let statusContainer = form.querySelector('.status-container');
  if (!statusContainer) {
    statusContainer = createStatusInline(form);
  }

  steps.forEach((stepKey) => {
    const stepElement = statusContainer.querySelector(`[data-step="${stepKey}"]`);
    if (!stepElement) return;

    const stepData = status[stepKey];
    const spinner = stepElement.querySelector('.spinner');
    if (!spinner) return;

    if (stepData && stepData.result === 'success') {
      spinner.innerHTML = '✓';
      spinner.className = 'checkmark';
      stepElement.classList.add('completed');
    } else if (stepData && stepData.result === 'error') {
      spinner.innerHTML = '✗';
      spinner.className = 'error';
      if (stepData.message) {
        errorMessage = stepData.message;
        errorStep = stepKey;
      }
      hasError = true;
    }
  });

  // Second pass: handle remaining steps based on error state
  steps.forEach((stepKey) => {
    const stepElement = statusContainer.querySelector(`[data-step="${stepKey}"]`);
    if (!stepElement) return;

    const stepData = status[stepKey];
    const spinner = stepElement.querySelector('.spinner');
    if (!spinner) return;

    // If no step data and there's an error, stop the spinner
    if (!stepData && hasError) {
      spinner.innerHTML = '';
      spinner.className = 'spinner stopped';
    } else if (!stepData && !hasError) {
      // Keep spinning for steps that haven't completed yet (no error)
      spinner.innerHTML = '';
      spinner.className = 'spinner';
    }
  });

  // If there was an error, show it in the error container and return true
  if (errorMessage) {
    const errorContainer = statusContainer.querySelector('.error-container');
    if (errorContainer) {
      errorContainer.style.display = 'block';
      errorContainer.innerHTML = `
        <div class="error-message">
          <p><strong>There was an error during the "${formatStepNameForError(errorStep)}" step:</strong><br>${errorMessage}</p>
          <p>If you need help, please <a href="mailto:aemsitestrial@adobe.com">contact us at aemsitestrial@adobe.com</a>.</p>
        </div>
        <button class="retry-button" type="button">Try Again</button>
      `;

      // Add retry functionality
      const retryButton = errorContainer.querySelector('.retry-button');
      retryButton.addEventListener('click', () => {
        // Restore the form
        const block = statusContainer.closest('.xwalk-trials');
        if (block) {
          statusContainer.remove();
          // eslint-disable-next-line no-use-before-define
          const newForm = buildForm(block);
          const formSection = block.querySelector('.form-section');
          if (formSection) {
            formSection.innerHTML = '';
            formSection.appendChild(newForm);
          }
        }
      });
    }
    return true;
  }
  return false;
}

async function checkStatus(form, processId) {
  const statusConfig = await fetchConfig();
  const resp = await fetch(`${statusConfig.xwalktrial.webApi}/check-status?processId=${processId}`);
  const check = await resp.json();

  const hasError = updateStatusInline(form, check);

  if (hasError) {
    return;
  }

  if (!check.status.finished) {
    setTimeout(() => checkStatus(form, processId), 2000);
  } else {
    const elementToReplace = form.querySelector('.status-container');
    showSuccessMessage(elementToReplace, check);
  }
}

/**
 * Extracts terms and conditions content from the block
 * @param {HTMLElement} block - The xwalk-trials block containing terms and conditions
 * @returns {HTMLElement|null} The terms and conditions content element or null if not found
 */
function extractTermsAndConditionsFromBlock(block) {
  const rows = block.querySelectorAll(':scope > div');
  if (rows.length >= 2) {
    const secondRow = rows[1]; // Second row (0-indexed)
    const secondDiv = secondRow.querySelector(':scope > div:nth-child(2)');
    return secondDiv;
  }
  return null;
}

/**
 * Extracts template data from the merged template-selection-data within the block
 * @param {HTMLElement} block - The xwalk-trials block containing merged template data
 * @returns {Array} Array of template objects with value, text, description, and image
 */
function extractTemplatesFromBlock(block) {
  const templates = [];

  const templateRows = block.querySelectorAll(':scope > div:not(:nth-child(-n+2))');

  templateRows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 3) {
      // Extract image
      const imageCell = cells[0];
      const img = imageCell.querySelector('img');

      // Extract title and description
      const contentCell = cells[1];
      const title = contentCell.querySelector('h4')?.textContent?.trim() || '';
      const description = contentCell.querySelector('p')?.textContent?.trim() || '';

      // Extract value
      const valueCell = cells[2];
      const value = valueCell.textContent?.trim() || '';

      if (value && title) {
        templates.push({
          value,
          text: title,
          description,
          image: {
            src: img?.src || '',
            alt: img?.alt || title,
            width: img?.width || '150',
            height: img?.height || '120',
          },
        });
      }
    }
  });
  return templates;
}

/**
 * Processes form data by extracting values and converting types
 * @param {HTMLFormElement} form - The form element to process
 * @returns {Object} Processed form data object
 */
function processFormData(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  return data;
}

/**
 * Waits for the Altcha widget to be ready
 * @param {HTMLElement} altchaWidget - The Altcha widget element
 * @returns {Promise<string|null>} The Altcha token or null if not available
 */
async function waitForAltchaToken(altchaWidget) {
  if (!altchaWidget) return null;

  // First, wait for the custom element to be defined
  const maxWait = 10000; // Increased to 10 seconds
  const startTime = Date.now();

  // Wait for custom element to be defined
  while (Date.now() - startTime < maxWait) {
    if (customElements.get('altcha-widget')) {
      // eslint-disable-next-line no-console
      console.log('Altcha custom element found');
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  if (!customElements.get('altcha-widget')) {
    // eslint-disable-next-line no-console
    console.warn('Altcha custom element not defined after timeout');
    return null;
  }

  // Now wait for the widget to be ready
  const widgetStartTime = Date.now();
  // eslint-disable-next-line no-console
  console.log('Waiting for Altcha widget to be ready...');
  while (Date.now() - widgetStartTime < maxWait) {
    if (altchaWidget.getResponse && typeof altchaWidget.getResponse === 'function') {
      try {
        const token = altchaWidget.getResponse();
        if (token) {
          // eslint-disable-next-line no-console
          console.log('Altcha token obtained successfully');
          return token;
        }
      } catch (error) {
        // Widget exists but not ready yet
        // eslint-disable-next-line no-console
        console.log('Altcha widget not ready yet:', error.message);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('Altcha widget getResponse method not available yet');
    }
    // Wait 100ms before checking again
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  // eslint-disable-next-line no-console
  console.warn('Altcha widget not ready after timeout');
  return null;
}

// Extract form submission logic into a separate function
async function submitFormData(form) {
  const data = processFormData(form);

  // Get Altcha token
  const altchaWidget = form.querySelector('altcha-widget');
  const altchaToken = await waitForAltchaToken(altchaWidget);

  if (altchaToken) {
    data.altcha = altchaToken;
  }

  const submitConfig = await fetchConfig();

  fetch(`${submitConfig.xwalktrial.webApi}/registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (response.ok) {
        const { processId } = await response.json();
        checkStatus(form, processId);
      } else {
        const err = await response.json();
        throw new Error(err.error ? `${err.error}\nThere was an error submitting your request. Please try again.` : 'There was an error submitting your request. Please try again.');
      }
    })
    .catch((error) => {
      showModal(error.message);
      const submitButtonError = form.querySelector('button[type="submit"]');
      submitButtonError.disabled = false;
      submitButtonError.textContent = 'Continue';
    });
}

async function buildForm(block) {
  const form = createTag('form', { action: '/createTrials', method: 'POST' });

  // Business email
  const emailField = createTag('div', { class: 'form-field' });
  const emailLabel = createTag('label', { for: 'business-email' }, 'E-Mail');
  const emailInput = createTag('input', {
    type: 'email',
    id: 'business-email',
    name: 'email',
    required: 'true',
  });
  emailField.append(emailLabel, emailInput);

  // Template visual selector
  const templateField = createTag('div', { class: 'form-field template-selector-field' });
  const templateLabel = createTag('label', {}, 'Select Template');

  const termsAndConditions = extractTermsAndConditionsFromBlock(block);
  // Extract templates from the merged template-selection-data within this block
  const templates = extractTemplatesFromBlock(block);

  const templateGrid = createTag('div', { class: 'template-grid' });

  templates.forEach((template, index) => {
    const templateCard = createTag('div', {
      class: `template-card ${index === 0 ? 'selected' : ''}`,
      'data-value': template.value,
    });

    // Create radio button for accessibility
    const radioInput = createTag('input', {
      type: 'radio',
      id: `template-${template.value}`,
      name: 'template',
      value: template.value,
      required: 'true',
      checked: index === 0, // Default to first template
    });

    // Create label for the radio button
    const radioLabel = createTag('label', {
      for: `template-${template.value}`,
      class: 'template-card-label',
    });

    // Use actual image from template data or create placeholder
    const thumbnail = createTag('div', { class: 'template-thumbnail' });
    let thumbnailImg;

    if (template.image && template.image.src) {
      // Use the actual image from the template-selection block
      thumbnailImg = createTag('img', {
        src: template.image.src,
        alt: template.image.alt,
        width: template.image.width,
        height: template.image.height,
      });
    } else {
      // Create placeholder if no image available
      thumbnailImg = createTag('img', {
        src: generatePlaceholderSVG(template.text, index),
        alt: template.text,
        width: PLACEHOLDER_DIMENSIONS.width.toString(),
        height: PLACEHOLDER_DIMENSIONS.height.toString(),
      });
    }

    thumbnail.append(thumbnailImg);

    // Template info
    const templateInfo = createTag('div', { class: 'template-info' });
    const templateTitle = createTag('h4', {}, template.text);
    const templateDesc = createTag('p', {}, template.description);
    templateInfo.append(templateTitle, templateDesc);

    // Add radio button and content to label
    radioLabel.append(radioInput, thumbnail, templateInfo);
    templateCard.append(radioLabel);

    // Click handler for template selection (for visual feedback)
    templateCard.addEventListener('click', () => {
      // Remove selected class from all cards
      templateGrid.querySelectorAll('.template-card').forEach((card) => {
        card.classList.remove('selected');
      });

      // Add selected class to clicked card
      templateCard.classList.add('selected');

      // Check the radio button
      radioInput.checked = true;
    });

    // Radio button change handler for visual feedback
    radioInput.addEventListener('change', () => {
      if (radioInput.checked) {
        // Remove selected class from all cards
        templateGrid.querySelectorAll('.template-card').forEach((card) => {
          card.classList.remove('selected');
        });

        // Add selected class to this card
        templateCard.classList.add('selected');
      }
    });

    templateGrid.append(templateCard);
  });

  templateField.append(templateLabel, templateGrid);

  // GitHub ID (moved after template)
  const githubField = createTag('div', { class: 'form-field', id: 'github-field' });
  const githubLabel = createTag('label', { for: 'github-id' }, 'GitHub ID (optional)');
  const githubInput = createTag('input', {
    type: 'text',
    id: 'github-id',
    name: 'githubId',
  });
  const githubHelpText = createTag('p', { class: 'help-text' }, 'If you provide your GitHub ID we will also set up a GitHub repo with project files so you can do code and style changes.');
  githubField.append(githubLabel, githubInput, githubHelpText);

  // Terms and Conditions - extract from block content
  const agreement = createTag('div', { class: 'agreement' });

  if (termsAndConditions) {
    // Clone the extracted content to preserve the original structure
    const clonedContent = termsAndConditions.cloneNode(true);

    // Find the last paragraph and restructure it with checkbox and label
    const paragraphs = clonedContent.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const lastParagraph = paragraphs[paragraphs.length - 1];

      // Create checkbox
      const checkbox = createTag('input', {
        type: 'checkbox',
        id: 'terms-and-conditions',
        name: 'termsAndConditions',
        value: 'true',
        required: 'true',
      });

      // Create label element
      const label = createTag('label', { for: 'terms-and-conditions' });

      // Move all content from the paragraph to the label
      while (lastParagraph.firstChild) {
        label.appendChild(lastParagraph.firstChild);
      }

      // Clear the paragraph and add checkbox and label
      lastParagraph.innerHTML = '';
      lastParagraph.appendChild(checkbox);
      lastParagraph.appendChild(document.createTextNode(' '));
      lastParagraph.appendChild(label);
    }

    agreement.appendChild(clonedContent);
  }

  // Altcha widget
  const altchaContainer = createTag('div', { class: 'altcha-container' });
  const statusConfig = await fetchConfig();
  const altchaWidget = createTag('altcha-widget', {
    challengeurl: `${statusConfig.xwalktrial.webApi}/challenge`,
    name: 'altcha',
  });
  altchaContainer.append(altchaWidget);

  // Try to load Altcha script dynamically
  const altchaScript = createTag('script', {
    nonce: 'aem',
    src: 'https://cdn.altcha.org/v2/altcha.min.js',
    defer: 'true',
    type: 'module',
  });

  // Add script to document head
  document.head.appendChild(altchaScript);

  // Submit button
  const buttonContainer = createTag('div', { class: 'button-container' });
  const submitButton = createTag('button', {
    type: 'submit',
    class: 'continue',
  }, 'Continue');
  buttonContainer.append(submitButton);

  // Append all elements to form
  form.append(
    emailField,
    githubField,
    templateField,
    agreement,
    altchaContainer,
    buttonContainer,
  );

  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable submit button to prevent multiple submissions
    const submitButtonSubmit = form.querySelector('button[type="submit"]');
    submitButtonSubmit.disabled = true;
    submitButtonSubmit.textContent = 'Submitting...';

    // Submit form data
    submitFormData(form);
  });

  return form;
}

export default async function decorate(block) {
  // Get the original content from the block (excluding template-selection-data)
  const infoContent = block.querySelector(':scope > div:first-child');

  // Create a new layout with two columns
  const formSection = createTag('div', { class: 'form-section' });
  formSection.append(await buildForm(block));

  // Move the original content to the trial info section
  const trialInfo = createTag('div', { class: 'trial-info' });
  if (infoContent) {
    // Clone the original content and preserve its structure
    trialInfo.append(infoContent.cloneNode(true));
  }

  // Clear the block and add the new layout
  block.textContent = '';
  block.append(formSection, trialInfo);
}
