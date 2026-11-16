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
/**
 * "Migrate your own site" path: authors enable it by adding a template row whose value is
 * `own-site`. Selecting it shows a website field in the form; Continue sends one registration
 * request:
 *   { email, altcha, scope, template: 'own-site', siteUrl, sampleTemplate? }
 * With `sampleTemplate`, the response's processId is expected to track that sample site, so
 * the usual setup progress is shown while the migration runs in the background.
 * The backend does not accept this yet, so submitting is switched off: flip OWN_SITE_ENABLED
 * once it does. Add `?migrate-demo` to the page URL to walk through the flow with simulated
 * responses (nothing is sent).
 */
const OWN_SITE_VALUE = 'own-site';
const OWN_SITE_ENABLED = false;
const MIGRATE_DEMO = new URLSearchParams(window.location.search).has('migrate-demo');
const OWN_SITE_ACCEPTED = OWN_SITE_ENABLED || MIGRATE_DEMO;

/** How long each start path takes, shown under the "Start with" switch */
const START_HINTS = {
  template: 'Ready in seconds',
  [OWN_SITE_VALUE]: 'Takes a while: we\'ll email you',
};

/**
 * A public website address: optional http(s) scheme, a dotted hostname with a real top-level
 * domain (international names included), optional port, path, query or fragment.
 * Addresses without a domain, such as localhost or IP addresses, don't match.
 */
const SITE_URL_PATTERN = /^(?:https?:\/\/)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+(?:\p{L}{2,63}|xn--[a-z0-9-]{2,59})(?::\d{1,5})?(?:[/?#]\S*)?$/iu;
const SITE_URL_MESSAGE = 'Enter your website address, like www.example.com';

/**
 * Normalizes what a visitor typed into an absolute http(s) URL.
 * @param {string} value - e.g. "example.com", "https://www.example.com/en"
 * @returns {string|null} the normalized URL, or null if it isn't a usable website address
 */
function normalizeSiteUrl(value) {
  const trimmed = (value || '').trim();
  if (!SITE_URL_PATTERN.test(trimmed)) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).href;
  } catch (e) {
    return null;
  }
}

/**
 * Flags a badly formed address, so Continue reports it along with the form's other required
 * fields. An empty field is left to `required`.
 * @param {HTMLInputElement} input
 */
function validateSiteUrl(input) {
  input.setCustomValidity(input.value.trim() && !normalizeSiteUrl(input.value) ? SITE_URL_MESSAGE : '');
}

/**
 * The website field of the migrate path.
 * @returns {{ field: HTMLElement, input: HTMLInputElement }}
 */
function buildSiteField() {
  const field = createTag('div', { class: 'form-field site-field' });
  const input = createTag('input', {
    type: 'text',
    id: 'site-url',
    name: 'siteUrl',
    inputmode: 'url',
    autocomplete: 'url',
    placeholder: 'www.example.com',
    'aria-describedby': 'site-url-hint',
  });
  // the "how long" hint shares the label's row, which keeps Continue in the first screen
  const hint = createTag('p', { class: 'start-hint slow', id: 'site-url-hint' }, START_HINTS[OWN_SITE_VALUE]);
  field.append(createTag('label', { for: 'site-url' }, 'Your website'), hint, input);
  input.addEventListener('input', () => {
    validateSiteUrl(input);
    input.closest('form')?.querySelector('.own-site-note')?.remove();
  });
  return { field, input };
}

/**
 * Builds the "Start with" switch. Migrating your own site is the default; because that takes
 * a while, a compact "while you wait" switch (on by default) adds the selected sample site,
 * which is ready in seconds. Visitors who only want to play pick "Explore a sample site",
 * where the full template cards are shown.
 * @param {Object} ownSite - the authored own-site row ({ text })
 * @param {HTMLElement} templateGrid - the sample-site template cards
 * @returns {{ switcher: HTMLElement, panel: HTMLElement, hint: HTMLElement }}
 */
function buildOwnSitePath(ownSite, templateGrid) {
  const switcher = createTag('div', { class: 'start-switch', role: 'radiogroup', 'aria-label': 'Start with' });
  const options = [
    { value: OWN_SITE_VALUE, label: ownSite.text },
    { value: 'template', label: 'Explore a sample site' },
  ];
  options.forEach(({ value, label }, index) => {
    const id = `start-${value}`;
    const input = createTag('input', {
      type: 'radio', name: 'start', id, value,
    });
    if (index === 0) input.checked = true;
    const optionLabel = createTag('label', { for: id });
    optionLabel.textContent = label;
    switcher.append(input, optionLabel);
  });

  const panel = createTag('div', { class: 'own-site-panel' });
  const { field: siteField, input: siteInput } = buildSiteField();

  const waitRow = createTag('label', { class: 'while-you-wait', for: 'sample-too' });
  const waitToggle = createTag('input', {
    type: 'checkbox', id: 'sample-too', class: 'switch-input', role: 'switch', checked: '',
  });
  const waitThumb = createTag('img', { class: 'while-you-wait-thumb', alt: '' });
  const waitText = createTag('span', { class: 'while-you-wait-text' });
  const waitTitle = createTag('strong');
  waitText.append(waitTitle);
  waitRow.append(waitThumb, waitText, waitToggle, createTag('span', { class: 'switch-track', 'aria-hidden': 'true' }));
  panel.append(siteField, waitRow);

  const hint = createTag('p', { class: 'start-hint', 'aria-live': 'polite' });

  const update = () => {
    const start = switcher.querySelector('input:checked')?.value;
    const ownSiteSelected = start === OWN_SITE_VALUE;
    hint.textContent = START_HINTS[start] || '';
    hint.hidden = ownSiteSelected;
    panel.hidden = !ownSiteSelected;
    templateGrid.hidden = ownSiteSelected;
    // a hidden field must not block Continue on the sample path
    siteInput.required = ownSiteSelected;
    if (ownSiteSelected) validateSiteUrl(siteInput);
    else siteInput.setCustomValidity('');
    // the switch row stands in for the selected template card
    const card = templateGrid.querySelector('.template-card.selected') || templateGrid.querySelector('.template-card');
    const img = card?.querySelector('img');
    waitThumb.hidden = !img;
    if (img) waitThumb.src = img.currentSrc || img.src;
    const sampleName = card?.querySelector('h4')?.textContent;
    waitTitle.textContent = `Also explore the ${sampleName ? `${sampleName} ` : ''}sample site while yours migrates`;
    switcher.closest('form')?.querySelector('.own-site-note')?.remove();
  };
  switcher.addEventListener('change', update);
  waitToggle.addEventListener('change', update);
  update();

  return { switcher, panel, hint };
}

/**
 * Own-site submissions are not supported by the backend yet: say so next to Continue.
 * @param {HTMLFormElement} form
 */
function showOwnSiteComingSoon(form) {
  if (form.querySelector('.own-site-note')) return;
  const note = createTag('p', { class: 'own-site-note', role: 'status' }, 'Migrating your own site is coming soon, so nothing has been sent. Choose "Explore a sample site" to get your workspace today.');
  form.querySelector('.button-container')?.before(note);
}

/**
 * Building from a customer site takes a while, so confirm and promise an email
 * instead of polling the setup steps.
 * @param {HTMLFormElement} form
 * @param {string} email
 * @param {string} host - the site being migrated
 */
function showOwnSiteConfirmation(form, email, host) {
  const message = createTag('div', { class: 'success-message own-site-confirmation', role: 'status' });
  // visitor input: set as text, never as HTML
  const body = createTag('p');
  body.textContent = `We're creating your Experience Workspace from ${host}. This can take a while, so there's no need to wait here: we'll email you at ${email} when it's ready.`;
  message.append(createTag('h3', {}, 'We\'re building your workspace'), body);
  form.replaceChildren(message);
}

const TRIAL_STEPS = [
  { key: 'createUser', label: 'Creating user account' },
  { key: 'quicksite', label: 'Creating site' },
  { key: 'permissions', label: 'Setting up permissions' },
  { key: 'codeBus', label: 'Configuring site / repo' },
  { key: 'publishContent', label: 'Publishing content' },
  { key: 'sendNotification', label: 'Sending notification' },
];

// Experience Workspace trials skip the permissions step and run the others in this order
const EW_TRIAL_STEPS = [
  { key: 'createUser', label: 'Creating user account' },
  { key: 'codeBus', label: 'Configuring site' },
  { key: 'quicksite', label: 'Copying template content' },
  { key: 'publishContent', label: 'Previewing and publishing content' },
  { key: 'sendNotification', label: 'Sending notification' },
];

/**
 * The steps the backend reports for the trial this form registers.
 * @param {HTMLFormElement} form
 * @returns {Array<{key: string, label: string}>}
 */
function trialSteps(form) {
  return form.closest('.ue-trial')?.classList.contains('ew') ? EW_TRIAL_STEPS : TRIAL_STEPS;
}

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
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 800)
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 800) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/**
 * Validates a GitHub username by checking if it exists
 * @param {string} username - The GitHub username to validate
 * @returns {Promise<{valid: boolean|null, message: string}>} Validation result
 */
async function validateGitHubId(username) {
  if (!username.trim()) {
    return { valid: true, message: '' };
  }

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);

    if (response.status === 200) {
      return { valid: true, message: 'GitHub user found' };
    }
    if (response.status === 404) {
      return { valid: false, message: 'GitHub user not found' };
    }
    if (response.status === 403 || response.status === 429) {
      return { valid: null, message: 'Rate limit reached. Validation skipped.' };
    }
    return { valid: null, message: 'Unable to verify' };
  } catch (error) {
    return { valid: null, message: 'Unable to verify' };
  }
}

/**
 * Updates the GitHub ID field UI based on validation state
 * @param {HTMLInputElement} input - The input element
 * @param {string} state - Validation state: clear, validating, valid, invalid, warning
 * @param {string} message - The message to display
 */
function updateGitHubValidationUI(input, state, message) {
  const fieldWrapper = input.closest('.form-field');
  const existingMsg = fieldWrapper.querySelector('.validation-message');

  fieldWrapper.classList.remove('validating', 'valid', 'invalid');
  if (existingMsg) existingMsg.remove();

  if (!state || state === 'clear') return;

  if (state === 'validating') {
    fieldWrapper.classList.add('validating');
  } else if (state === 'valid' && message) {
    fieldWrapper.classList.add('valid');
    const msg = createTag('div', { class: 'validation-message validation-success' }, message);
    input.after(msg);
  } else if (state === 'invalid') {
    fieldWrapper.classList.add('invalid');
    const msg = createTag('div', { class: 'validation-message validation-error' }, message);
    input.after(msg);
  } else if (state === 'warning') {
    const msg = createTag('div', { class: 'validation-message validation-warning' }, message);
    input.after(msg);
  }
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
  const { migratingHost, migratingEmail } = form.dataset;
  const steps = trialSteps(form);
  form.innerHTML = '';
  if (migratingHost) {
    // migrate path with a sample site: the migration keeps running in the background
    const banner = createTag('p', { class: 'migration-banner', role: 'status' });
    banner.textContent = `We're migrating ${migratingHost} in the background and will email you at ${migratingEmail} when it's ready. Meanwhile, your sample site:`;
    form.append(banner);
  }
  form.appendChild(statusContainer);

  const header = createTag('div', { class: 'status-header' });
  const title = createTag('h2', {}, 'Setting up your environment...');
  header.appendChild(title);

  const stepsContainer = createTag('div', { class: 'steps-container' });

  // Create step elements for each major step
  steps.forEach((step) => {
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
  const steps = trialSteps(form).map((step) => step.key);
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
 * ?migrate-demo: plays the setup progress without calling the backend.
 * @param {HTMLFormElement} form
 */
function simulateStatus(form) {
  const status = { status: { finished: false } };
  updateStatusInline(form, status);
  const steps = trialSteps(form);
  steps.forEach((step, index) => {
    setTimeout(() => {
      status[step.key] = { result: 'success' };
      updateStatusInline(form, status);
      if (index === steps.length - 1) {
        showSuccessMessage(form.querySelector('.status-container'));
      }
    }, 700 * (index + 1));
  });
}

// Extract form submission logic into a separate function
async function submitFormData(form) {
  const data = processFormData(form);
  const ownSite = data.start === OWN_SITE_VALUE;
  let host = '';
  if (ownSite) {
    // the sample site is an optional extra while the migration runs
    if (form.querySelector('#sample-too')?.checked) data.sampleTemplate = data.template;
    data.template = OWN_SITE_VALUE;
    host = new URL(data.siteUrl).hostname;
  } else {
    delete data.siteUrl;
  }
  delete data.start;

  const onAccepted = (processId) => {
    if (ownSite && !data.sampleTemplate) {
      showOwnSiteConfirmation(form, data.email, host);
      return;
    }
    if (ownSite) {
      form.dataset.migratingHost = host;
      form.dataset.migratingEmail = data.email;
    }
    if (MIGRATE_DEMO) simulateStatus(form);
    else checkStatus(form, processId);
  };

  if (MIGRATE_DEMO) {
    setTimeout(() => onAccepted(null), 600);
    return;
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
        onAccepted(processId);
      } else {
        const err = await response.json();
        throw new Error(err.error ? `${err.error}\nThere was an error submitting your request. Please try again.` : 'There was an error submitting your request. Please try again.');
      }
    })
    .catch((error) => {
      showModal(error.message);
      const submitButtonError = form.querySelector('button.continue');
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
  const allTemplates = extractTemplatesFromBlock(block);
  const ownSite = allTemplates.find((t) => t.value === OWN_SITE_VALUE);
  const templates = allTemplates.filter((t) => t !== ownSite);

  const templateGrid = createTag('div', { class: 'template-grid' });

  templates.forEach((template, index) => {
    const isDefault = index === 0;
    const templateCard = createTag('div', {
      class: `template-card ${isDefault ? 'selected' : ''}`,
      'data-value': template.value,
    });

    // Create radio button for accessibility
    const radioInput = createTag('input', {
      type: 'radio',
      id: `template-${template.value}`,
      name: 'template',
      value: template.value,
      required: 'true',
      ...(isDefault && { checked: true }), // Only add checked attribute when true
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

      // Uncheck all radio buttons and remove checked attribute
      templateGrid.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.checked = false;
        radio.removeAttribute('checked');
      });

      // Add selected class to clicked card
      templateCard.classList.add('selected');

      // Check the radio button and add checked attribute
      radioInput.checked = true;
      radioInput.setAttribute('checked', 'true');
    });

    // Radio button change handler for visual feedback
    radioInput.addEventListener('change', () => {
      if (radioInput.checked) {
        // Remove selected class from all cards
        templateGrid.querySelectorAll('.template-card').forEach((card) => {
          card.classList.remove('selected');
        });

        // Uncheck all radio buttons and remove checked attribute
        templateGrid.querySelectorAll('input[type="radio"]').forEach((radio) => {
          radio.checked = false;
          radio.removeAttribute('checked');
        });

        // Add selected class to this card
        templateCard.classList.add('selected');

        // Check this radio button and add checked attribute
        radioInput.checked = true;
        radioInput.setAttribute('checked', 'true');
      }
    });

    templateGrid.append(templateCard);
  });

  if (ownSite) {
    const { switcher, panel, hint } = buildOwnSitePath(ownSite, templateGrid);
    templateLabel.textContent = 'Start with';
    templateLabel.id = 'start-with-label';
    switcher.setAttribute('aria-labelledby', 'start-with-label');
    switcher.removeAttribute('aria-label');
    templateField.append(templateLabel, switcher, hint, panel, templateGrid);
  } else {
    templateField.append(templateLabel, templateGrid);
  }
  const isAgenticPlaygournd = block.classList.contains('agentic-playground');
  let githubField = null;
  if (!isAgenticPlaygournd) {
    // GitHub ID (moved after template)
    githubField = createTag('div', { class: 'form-field', id: 'github-field' });
    const githubLabel = createTag('label', { for: 'github-id' }, 'GitHub ID (optional)');
    const githubInput = createTag('input', {
      type: 'text',
      id: 'github-id',
      name: 'githubId',
    });
    const githubHelpText = createTag('p', { class: 'help-text' }, 'If you provide your GitHub ID we will also set up a GitHub repo with project files so you can do code and style changes.');
    githubField.append(githubLabel, githubInput, githubHelpText);

    // Add GitHub ID validation
    const debouncedValidate = debounce(async () => {
      const username = githubInput.value.trim();

      if (!username) {
        updateGitHubValidationUI(githubInput, 'clear', '');
        return;
      }

      updateGitHubValidationUI(githubInput, 'validating', '');
      const result = await validateGitHubId(username);

      if (result.valid === true && result.message) {
        updateGitHubValidationUI(githubInput, 'valid', result.message);
      } else if (result.valid === false) {
        updateGitHubValidationUI(githubInput, 'invalid', result.message);
      } else if (result.valid === null) {
        updateGitHubValidationUI(githubInput, 'warning', result.message);
      } else {
        updateGitHubValidationUI(githubInput, 'clear', '');
      }
    }, 800);

    githubInput.addEventListener('input', debouncedValidate);
  }

  // Terms and Conditions - extract from block content
  const agreement = createTag('div', { class: 'agreement' });

  if (termsAndConditions) {
    // Clone the extracted content to preserve the original structure
    const clonedContent = termsAndConditions.cloneNode(true);

    // The checkbox goes on the paragraph that says the terms were accepted (the last one otherwise)
    const paragraphs = [...clonedContent.querySelectorAll('p')];
    if (paragraphs.length > 0) {
      const lastParagraph = paragraphs.find((p) => /\baccept/i.test(p.textContent))
        || paragraphs[paragraphs.length - 1];
      lastParagraph.classList.add('agreement-check');

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
  // Try to load Altcha script dynamically
  const altchaScript = createTag('script', {
    src: 'https://cdn.jsdelivr.net/gh/altcha-org/altcha/dist/altcha.min.js',
    async: 'true',
    defer: 'true',
    nonce: 'aem',
    type: 'module',
  });

  altchaContainer.append(altchaScript);
  altchaContainer.append(altchaWidget);

  // Submit button
  const buttonContainer = createTag('div', { class: 'button-container' });

  if (isAgenticPlaygournd) {
    const hiddenScopeInput = createTag('input', {
      type: 'hidden',
      name: 'scope',
      value: 'agentic-playground',
    });
    buttonContainer.append(hiddenScopeInput);
  }
  if (block.classList.contains('ew')) {
    buttonContainer.append(createTag('input', { type: 'hidden', name: 'target', value: 'ew' }));
  }
  const submitButton = createTag('button', {
    type: 'submit',
    class: 'continue',
  }, 'Continue');
  buttonContainer.append(submitButton);

  // Append all elements to form
  form.append(
    emailField,
    githubField || '',
    templateField,
    agreement,
    altchaContainer,
    buttonContainer,
  );

  // Add form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if GitHub ID field is in invalid state
    const githubFieldEl = form.querySelector('#github-field');
    if (githubFieldEl && githubFieldEl.classList.contains('invalid')) {
      const githubInputEl = githubFieldEl.querySelector('input');
      if (githubInputEl) {
        githubInputEl.focus();
      }
      return;
    }

    // Migrate your own site: the website field has to hold a usable address
    const migrating = form.querySelector('input[name="start"]:checked')?.value === OWN_SITE_VALUE;
    if (migrating) {
      const urlInput = form.querySelector('#site-url');
      const siteUrl = normalizeSiteUrl(urlInput.value);
      if (!siteUrl) {
        urlInput.setCustomValidity(SITE_URL_MESSAGE);
        urlInput.reportValidity();
        return;
      }
      urlInput.value = siteUrl;
      if (!OWN_SITE_ACCEPTED) {
        showOwnSiteComingSoon(form);
        return;
      }
    }

    // Disable submit button to prevent multiple submissions
    const submitButtonSubmit = form.querySelector('button.continue');
    submitButtonSubmit.disabled = true;
    submitButtonSubmit.textContent = 'Submitting...';

    // Submit form data
    submitFormData(form);
  });

  return form;
}

/**
 * Landing template: scrolls back to the sign-up card and puts the cursor in a field.
 * @param {HTMLElement} formSection
 * @param {HTMLElement} [field]
 */
function goToForm(formSection, field) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  formSection.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
  field?.focus({ preventScroll: true });
}

/**
 * Landing template: turns each remaining h2 and its paragraph into a path with a button that
 * sets up the form. A heading written as "Question? Statement" becomes a label and a headline.
 * The path that mentions migrating selects the own-site tab; the other selects the sample tab.
 * @param {HTMLElement} block
 * @param {HTMLElement} formSection
 */
function decoratePaths(block, formSection) {
  const wrapper = block.closest('.section')?.querySelector('.ue-trial-wrapper ~ .default-content-wrapper');
  const headings = wrapper ? [...wrapper.querySelectorAll(':scope > h2')] : [];
  if (!headings.length) return;
  wrapper.classList.add('landing-paths');

  headings.forEach((heading) => {
    const text = heading.nextElementSibling?.tagName === 'P' ? heading.nextElementSibling : null;
    const path = createTag('div', { class: 'landing-path' });
    heading.before(path);
    path.append(heading);
    if (text) path.append(text);

    // authored text: set as text, never as HTML
    const [, question, statement] = heading.textContent.trim().match(/^(.+?\?)\s+(.+)$/) || [];
    if (question) {
      const label = createTag('span', { class: 'landing-path-label' });
      label.textContent = question;
      heading.replaceChildren(label, statement);
    }

    const migrating = /migrate/i.test(text?.textContent || '');
    const radio = formSection.querySelector(`#start-${migrating ? OWN_SITE_VALUE : 'template'}`);
    if (!radio) return;
    const cta = createTag('a', { class: 'landing-path-cta', href: '#business-email' }, migrating ? 'Migrate your site' : 'Explore a sample site');
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      const email = formSection.querySelector('#business-email');
      const site = formSection.querySelector('#site-url');
      goToForm(formSection, migrating && email?.value ? site : email);
    });
    path.append(cta);
  });
}

/**
 * Landing template: moves the first authored section after the block (its h2 and the
 * paragraphs and h3s that follow) into a wrapper of its own, so it can sit beside the form.
 * Authors keep writing it below the block; a section without h3s stays where it is.
 * @param {HTMLElement} block
 */
function decorateLead(block) {
  const after = block.closest('.section')?.querySelector('.ue-trial-wrapper ~ .default-content-wrapper');
  const heading = after?.querySelector(':scope > h2');
  if (!heading) return;
  const parts = [heading];
  let next = heading.nextElementSibling;
  while (next && ['P', 'H3'].includes(next.tagName)) {
    parts.push(next);
    next = next.nextElementSibling;
  }
  if (!parts.some((part) => part.tagName === 'H3')) return;
  const lead = createTag('div', { class: 'landing-lead' });
  lead.append(...parts);
  after.before(lead);
}

/**
 * Landing template: gathers the intro and the agent list into wrappers of their own below the
 * two paths. Authors write them after the paths: the intro first, then the list's lead-in and the
 * list. Older content (the intro after the h1, the list in the block's first row) still works.
 * @param {HTMLElement} block
 * @param {HTMLElement} trialInfo
 */
function decorateIntro(block, trialInfo) {
  const section = block.closest('.section');
  if (!section) return;
  const after = section.querySelector('.ue-trial-wrapper ~ .default-content-wrapper');
  const loose = after ? [...after.querySelectorAll(':scope > p, :scope > ul')] : [];
  const list = loose.find((el) => el.tagName === 'UL')
    || trialInfo.querySelector(':scope > div > div > ul');
  const listLead = list?.previousElementSibling?.tagName === 'P' ? list.previousElementSibling : null;
  let intro = loose.filter((el) => el.tagName === 'P' && el !== listLead);
  if (!intro.length) {
    const below = section.querySelector('.default-content-wrapper > h1 + p');
    intro = below ? [below] : [];
  }

  const wrappers = [];
  if (intro.length) {
    const wrapper = createTag('div', { class: 'landing-intro' });
    wrapper.append(...intro);
    wrappers.push(wrapper);
  }
  if (list) {
    const cell = list.parentElement;
    const wrapper = createTag('div', { class: 'landing-explore' });
    wrapper.append(...[listLead, list].filter(Boolean));
    wrappers.push(wrapper);
    // the block cell the list came from has nothing left to show
    if (cell.closest('.trial-info') && !cell.children.length) cell.hidden = true;
  }
  (after || block.closest('.ue-trial-wrapper'))?.after(...wrappers);
}

/**
 * Landing template: turns the authored sentence "Available now for X. Coming soon for Y and Z."
 * into a status strip. Any other wording stays a plain paragraph.
 * @param {HTMLElement} block
 * @param {HTMLElement} formSection - where "Try it now" takes the visitor
 */
function decorateAvailability(block, formSection) {
  const pattern = /^available now for (.+?)\.\s*coming soon for (.+?)\.?$/i;
  const paragraph = [...(block.closest('.section')?.querySelectorAll('.default-content-wrapper > p') || [])]
    .find((p) => pattern.test(p.textContent.trim()));
  if (!paragraph) return;

  const [, live, soon] = paragraph.textContent.trim().match(pattern);
  const products = (text) => text.split(/\s*,\s*|\s+and\s+/).filter(Boolean);
  const list = createTag('ul', { class: 'availability', 'aria-label': 'Availability' });

  const addItem = (name, status, isLive) => {
    const item = createTag('li', { class: `availability-item${isLive ? ' is-live' : ''}` });
    const nameEl = createTag('span', { class: 'availability-name' });
    nameEl.textContent = name;
    item.append(createTag('span', { class: 'availability-status' }, status), nameEl);
    if (isLive) {
      const cta = createTag('a', { class: 'availability-cta', href: '#business-email' }, 'Try it now');
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        goToForm(formSection, formSection.querySelector('#business-email'));
      });
      item.append(cta);
    }
    list.append(item);
  };
  products(live).forEach((name) => addItem(name, 'Available now', true));
  products(soon).forEach((name) => addItem(name, 'Coming soon', false));
  // the last thing on the page, below the content that follows the form
  paragraph.closest('.section').append(list);
  paragraph.remove();
}

const SAMPLE_SITE = {
  host: 'frescopa.coffee',
  favicon: '/img/frescopa-favicon.png',
  shot: '/img/frescopa-home',
};

const GLOBE_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M1.75 8h12.5M8 1.75c1.8 1.9 2.6 4 2.6 6.25S9.8 12.35 8 14.25C6.2 12.35 5.4 10.25 5.4 8S6.2 3.65 8 1.75z"/></svg>';

/**
 * A browser-like window with a tab strip and no window controls.
 * @param {string} className
 * @returns {{ win: HTMLElement, bar: HTMLElement, view: HTMLElement }}
 */
function buildPreviewWindow(className) {
  const win = createTag('div', { class: `lp-win ${className}` });
  const bar = createTag('div', { class: 'lp-bar' });
  const view = createTag('div', { class: 'lp-view' });
  win.append(bar, view);
  return { win, bar, view };
}

/**
 * One tab: an icon and a title.
 * @param {HTMLElement} icon
 * @param {HTMLElement|string} title
 * @returns {HTMLElement}
 */
function buildPreviewTab(icon, title) {
  const tab = createTag('span', { class: 'lp-tab' });
  tab.append(icon, typeof title === 'string' ? createTag('span', { class: 'lp-host' }, title) : title);
  return tab;
}

const TAB_MOTION_MS = 240;

/**
 * Builds what the visitor lands in: the workspace with its assistant at the back, and in front
 * one browser holding their site and, while they wait, the sample site as a second tab. Tabs
 * open and close like a browser's; a reopened tab joins at the end of the strip. No product UI
 * words.
 * @param {HTMLElement} trialInfo - to borrow the Adobe mark and name for the workspace tab
 * @returns {{ preview: HTMLElement, host: HTMLElement, logo: HTMLElement,
 *   setTabs: (open: {own: boolean, sample: boolean}, active: string) => void }}
 */
function buildWorkspacePreview(trialInfo) {
  const preview = createTag('figure', { class: 'landing-preview', 'aria-hidden': 'true', 'data-state': 'idle' });

  const back = buildPreviewWindow('lp-back');
  const mark = trialInfo?.querySelector('picture img')?.src;
  back.bar.append(buildPreviewTab(
    mark ? createTag('img', { class: 'lp-fav', src: mark, alt: '' }) : createTag('span'),
    trialInfo?.querySelector('.lockup-name')?.textContent || '',
  ));
  back.bar.firstElementChild.dataset.open = 'true';
  back.bar.firstElementChild.dataset.active = 'true';
  const rail = createTag('div', { class: 'lp-rail' });
  rail.append(createTag('span', { class: 'lp-msg' }), createTag('span', { class: 'lp-msg lp-msg-me' }), createTag('span', { class: 'lp-msg' }), createTag('span', { class: 'lp-ask' }));
  back.view.append(createTag('div', { class: 'lp-page' }), rail);

  const front = buildPreviewWindow('lp-front');
  const icon = createTag('span', { class: 'lp-icon' });
  icon.innerHTML = GLOBE_ICON;
  const host = createTag('span', { class: 'lp-host' });
  const tabs = {
    own: buildPreviewTab(icon, host),
    sample: buildPreviewTab(createTag('img', { class: 'lp-fav', src: SAMPLE_SITE.favicon, alt: '' }), SAMPLE_SITE.host),
  };
  front.bar.append(tabs.own, tabs.sample);

  const site = createTag('div', { class: 'lp-site', 'data-tab': 'own' });
  const logo = createTag('span', { class: 'lp-logo' });
  const nav = createTag('div', { class: 'lp-nav' });
  nav.append(logo, createTag('span', { class: 'lp-links' }));
  const cards = createTag('div', { class: 'lp-cards' });
  cards.append(createTag('span'), createTag('span'), createTag('span'));
  site.append(nav, createTag('div', { class: 'lp-hero' }), cards);
  const shot = createTag('picture', { class: 'lp-shot', 'data-tab': 'sample' });
  shot.append(
    createTag('source', { type: 'image/webp', srcset: `${SAMPLE_SITE.shot}.webp` }),
    createTag('img', {
      src: `${SAMPLE_SITE.shot}.jpg`, alt: '', width: '1600', height: '1000', decoding: 'async',
    }),
  );
  front.view.append(site, shot);
  preview.append(back.win, front.win);

  // a tab that has fully closed leaves its place in the strip; one caught mid-close reverses in
  // place, so a quick back-and-forth never makes it jump sides
  let order = 0;
  const parked = new Set(Object.keys(tabs));
  const timers = {};
  const setTabs = (open, active) => {
    Object.entries(tabs).forEach(([key, tab]) => {
      const isOpen = Boolean(open[key]);
      if (isOpen && tab.dataset.open !== 'true') {
        clearTimeout(timers[key]);
        if (parked.has(key)) {
          order += 1;
          tab.style.order = order;
          parked.delete(key);
        }
      } else if (!isOpen && tab.dataset.open !== 'false') {
        timers[key] = setTimeout(() => parked.add(key), preview.isConnected ? TAB_MOTION_MS : 0);
      }
      tab.dataset.open = String(isOpen);
      tab.dataset.active = String(key === active);
    });
    front.view.dataset.active = active;
  };

  return {
    preview, host, logo, setTabs,
  };
}

/**
 * Landing template: one question instead of a two-way switch. The website field leads; a quiet
 * action swaps it for the sample site and back. A preview beside the pitch shows the site the
 * visitor works on and the workspace behind it, with their own domain as they type it.
 * @param {HTMLElement} section
 * @param {HTMLElement} formSection
 * @param {HTMLElement} slot - the fixed-height slot holding both paths
 * @param {HTMLElement} trialInfo
 */
function decorateStart(section, formSection, slot, trialInfo) {
  const ownRadio = formSection.querySelector(`#start-${OWN_SITE_VALUE}`);
  const sampleRadio = formSection.querySelector('#start-template');
  const siteInput = formSection.querySelector('#site-url');
  if (!ownRadio || !sampleRadio || !siteInput) return;

  const labelOf = (radio) => formSection.querySelector(`label[for="${radio.id}"]`)?.textContent || '';
  // the other path sits on the field's own label row, one level with it and never in its way
  const swap = createTag('button', { type: 'button', class: 'start-alt' });
  slot.prepend(swap);
  const waitToggle = formSection.querySelector('#sample-too');
  const siteLabel = formSection.querySelector('label[for="site-url"]')?.textContent || '';

  // the sample site is recognised by its own icon, not a shrunken screenshot
  formSection.querySelectorAll('.template-thumbnail img, .while-you-wait-thumb').forEach((img) => {
    img.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
    img.src = SAMPLE_SITE.favicon;
    img.width = 64;
    img.height = 64;
  });

  // the sample path reads like the website field it replaces: a label, then the site
  const grid = slot.querySelector('.template-grid');
  if (grid) {
    const head = createTag('div', { class: 'template-head', 'aria-hidden': 'true' });
    head.append(createTag('span', { class: 'template-head-label' }, 'Sample site'));
    grid.prepend(head);
  }

  const {
    preview, host, logo, setTabs,
  } = buildWorkspacePreview(trialInfo);

  // the folded sample card is the "while you wait" row's twin, at whatever height the row wraps to
  const waitRow = slot.querySelector('.while-you-wait');
  if (waitRow && window.ResizeObserver) {
    new ResizeObserver(([entry]) => {
      slot.style.setProperty('--wait-row-h', `${entry.borderBoxSize?.[0]?.blockSize ?? waitRow.offsetHeight}px`);
    }).observe(waitRow);
  }
  section.append(preview);

  const update = () => {
    const sampleSelected = sampleRadio.checked;
    const swapText = labelOf(sampleSelected ? ownRadio : sampleRadio);
    // the link's words fade out, change, and fade back in, so they never pop
    if (swap.textContent && swap.textContent !== swapText
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      swap.getAnimations().forEach((a) => a.cancel());
      const fadeOut = swap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: 'ease-in', fill: 'forwards' });
      fadeOut.finished.then(() => {
        swap.textContent = swapText;
        swap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
        fadeOut.cancel();
      }).catch(() => {});
    } else {
      swap.textContent = swapText;
    }
    // the preview follows from the first keystroke, as typed, not only once it is a valid domain
    const own = siteInput.value.trim().toLowerCase()
      .replace(/^[a-z]+:\/\//, '').replace(/^www\./, '')
      .split(/[/?#\s]/)[0];
    let state = own ? 'own' : 'idle';
    if (sampleSelected) state = 'sample';

    // before a site is typed, the window says what goes there rather than inventing a domain
    host.textContent = own || siteLabel;
    logo.textContent = own;
    preview.dataset.state = state;
    // the sample opens beside their site while they wait, or alone when it is the start
    setTabs(
      { own: !sampleSelected, sample: sampleSelected || Boolean(waitToggle?.checked) },
      sampleSelected ? 'sample' : 'own',
    );
  };

  swap.addEventListener('click', () => {
    const next = sampleRadio.checked ? ownRadio : sampleRadio;
    next.checked = true;
    next.dispatchEvent(new Event('change', { bubbles: true }));
    (next === ownRadio ? siteInput : formSection.querySelector('.template-card input'))?.focus();
  });
  formSection.addEventListener('change', update);
  siteInput.addEventListener('input', update);
  update();
}

/**
 * Trims authored copy in place, inside text nodes only, so inline links survive. When the
 * authored text no longer matches, nothing changes.
 * @param {HTMLElement} el
 * @param {RegExp} pattern
 * @param {string} replacement
 */
function trimCopy(el, pattern, replacement = '') {
  if (!el) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (pattern.test(node.nodeValue)) {
      node.nodeValue = node.nodeValue.replace(pattern, replacement);
      return;
    }
  }
}

/**
 * The landing page made each point three or four times; each now has one home. The hero intro
 * pitches and invites; the audiences explain seen, found and chosen; the form offers both paths.
 * @param {HTMLElement} section
 * @param {HTMLElement} formSection
 */
function dedupeLandingCopy(section, formSection) {
  trimCopy(section.querySelector('.landing-explore > p'), /^Explore it hands-on with a sample brand or your own site, and see/, 'See');
  // the audience cards say what the lead paragraph said; its opening line becomes the section's
  // eyebrow, the same pattern as the hero's
  const lead = section.querySelector('.landing-lead > h2 + p');
  const opening = lead?.textContent.match(/^[^.]+\./)?.[0];
  if (opening) {
    lead.replaceChildren(opening);
    lead.classList.add('landing-kicker');
    lead.previousElementSibling.before(lead);
  }
  trimCopy(formSection.querySelector('.form-heading'), / on your own website(?= in just a few clicks)/);
  trimCopy(formSection.querySelector('.form-notice'), /, so you can explore at your own pace\./, '.');
}

/**
 * Landing template: both sign-up paths stacked in one slot so switching between them never
 * moves the page, the two paths band dropped (the switch already offers both), and the consent
 * paragraphs read as one.
 * @param {HTMLElement} block
 * @param {HTMLElement} formSection
 * @param {HTMLElement} trialInfo
 */
function decorateHero(block, formSection, trialInfo) {
  const section = block.closest('.section');
  if (!section) return;
  const panel = formSection.querySelector('.own-site-panel');
  const grid = formSection.querySelector('.template-grid');
  if (panel && grid && panel.parentElement === grid.parentElement) {
    const slot = createTag('div', { class: 'start-slot' });
    panel.before(slot);
    slot.append(panel, grid);
    decorateStart(section, formSection, slot, trialInfo);
  }

  // each audience (title and text) becomes one card
  section.querySelectorAll('.landing-lead > h3').forEach((title) => {
    const text = title.nextElementSibling?.tagName === 'P' ? title.nextElementSibling : null;
    const card = createTag('div', { class: 'landing-aud' });
    title.before(card);
    card.append(...[title, text].filter(Boolean));
  });

  // the two paths repeat what the switch above the form already offers
  section.querySelectorAll('.landing-path').forEach((path) => path.remove());
  section.querySelectorAll('.landing-paths:empty').forEach((wrapper) => wrapper.remove());

  dedupeLandingCopy(section, formSection);

  // one small print paragraph: the consent and where to opt out
  const consent = [...formSection.querySelectorAll('.agreement p:not(.agreement-check)')];
  consent.slice(1).forEach((p) => {
    consent[0].append(' ', ...p.childNodes);
    p.remove();
  });
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

  // Landing template: the info column's first heading leads the sign-up card instead,
  // as the section's h2 (directly below the page h1), and the mark gets a brand name
  if (document.body.classList.contains('landing-template')) {
    const heading = trialInfo.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const cardHeading = createTag('h2', { class: 'form-heading' });
      if (heading.id) cardHeading.id = heading.id;
      cardHeading.append(...heading.childNodes);
      heading.remove();
      formSection.prepend(cardHeading);
    }
    const mark = trialInfo.querySelector(':scope > div > div:first-child');
    if (mark) {
      mark.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      mark.append(createTag('span', { class: 'lockup-name' }, 'Adobe Experience Manager'));
    }
    // the bold note is a sign-up condition: show it right under Continue. Authors write it in the
    // terms cell after the checkbox line; older content has it after the agent list.
    const isNote = (p) => {
      const bold = p.querySelector(':scope > strong');
      return bold && p.textContent.trim() === bold.textContent.trim();
    };
    const notice = [
      ...formSection.querySelectorAll('.agreement p:not(.agreement-check)'),
      ...trialInfo.querySelectorAll(':scope > div > div > p'),
    ].find(isNote);
    const buttonContainer = formSection.querySelector('form .button-container');
    if (notice && buttonContainer) {
      notice.classList.add('form-notice');
      buttonContainer.after(notice);
    }
    // a compact captcha: the "Protected by ALTCHA" footer adds a second row to the box, and its
    // logo floats away from the checkbox it belongs to
    const captcha = formSection.querySelector('altcha-widget');
    captcha?.setAttribute('hidefooter', '');
    captcha?.setAttribute('hidelogo', '');
    const email = formSection.querySelector('#business-email');
    if (email && !email.placeholder) email.placeholder = 'name@company.com';
    decorateAvailability(block, formSection);
    decorateLead(block);
    decoratePaths(block, formSection);
    decorateIntro(block, trialInfo);
    decorateHero(block, formSection, trialInfo);
  }

  // Clear the block and add the new layout
  block.textContent = '';
  block.append(formSection, trialInfo);
}
