/* global grecaptcha */

import createTag from '../../utils/tag.js';

const V3_SITE_KEY = '6LfiKDErAAAAAK_RgBahms-QPJyErQTRElVCprpx';

// Define the steps for the trial setup process
const TRIAL_STEPS = [
  { key: 'createUser', label: 'Creating user account' },
  { key: 'quicksite', label: 'Creating site' },
  { key: 'permissions', label: 'Setting up permissions' },
  { key: 'codeBus', label: 'Configuring site / repo' },
  { key: 'publishContent', label: 'Publishing content' },
  { key: 'sendNotification', label: 'Sending notification' },
];

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
const V2_SITE_KEY = '6Le1IkYrAAAAAFKLFRoLHFm2XXBCl5c8iiiWHoxf';
const base = 'https://3531103-xwalktrial.adobeioruntime.net/api/v1/web/web-api';

/**
 * Loads states based on selected country
 * @param {HTMLSelectElement} stateSelect - The state select element
 * @param {string} country - The selected country code
 */
function loadStates(stateSelect, country) {
  stateSelect.innerHTML = '';

  if (country === 'US') {
    const usStates = [
      { value: '', text: 'Select an option...' },
      { value: 'AA', text: 'Armed Forces America' },
      { value: 'AE', text: 'Armed Forces Europe' },
      { value: 'AK', text: 'Alaska' },
      { value: 'AL', text: 'Alabama' },
      { value: 'AP', text: 'Armed Forces Pacific' },
      { value: 'AR', text: 'Arkansas' },
      { value: 'AS', text: 'American Samoa' },
      { value: 'AZ', text: 'Arizona' },
      { value: 'CA', text: 'California' },
      { value: 'CO', text: 'Colorado' },
      { value: 'CT', text: 'Connecticut' },
      { value: 'DC', text: 'District of Columbia' },
      { value: 'DE', text: 'Delaware' },
      { value: 'FL', text: 'Florida' },
      { value: 'GA', text: 'Georgia' },
      { value: 'GU', text: 'Guam' },
      { value: 'HI', text: 'Hawaii' },
      { value: 'IA', text: 'Iowa' },
      { value: 'ID', text: 'Idaho' },
      { value: 'IL', text: 'Illinois' },
      { value: 'IN', text: 'Indiana' },
      { value: 'KS', text: 'Kansas' },
      { value: 'KY', text: 'Kentucky' },
      { value: 'LA', text: 'Louisiana' },
      { value: 'MA', text: 'Massachusetts' },
      { value: 'MD', text: 'Maryland' },
      { value: 'ME', text: 'Maine' },
      { value: 'MI', text: 'Michigan' },
      { value: 'MN', text: 'Minnesota' },
      { value: 'MO', text: 'Missouri' },
      { value: 'MP', text: 'Mariana Islands' },
      { value: 'MS', text: 'Mississippi' },
      { value: 'MT', text: 'Montana' },
      { value: 'NC', text: 'North Carolina' },
      { value: 'ND', text: 'North Dakota' },
      { value: 'NE', text: 'Nebraska' },
      { value: 'NH', text: 'New Hampshire' },
      { value: 'NJ', text: 'New Jersey' },
      { value: 'NM', text: 'New Mexico' },
      { value: 'NV', text: 'Nevada' },
      { value: 'NY', text: 'New York' },
      { value: 'OH', text: 'Ohio' },
      { value: 'OK', text: 'Oklahoma' },
      { value: 'OR', text: 'Oregon' },
      { value: 'PA', text: 'Pennsylvania' },
      { value: 'PR', text: 'Puerto Rico' },
      { value: 'PW', text: 'Palau' },
      { value: 'RI', text: 'Rhode Island' },
      { value: 'SC', text: 'South Carolina' },
      { value: 'SD', text: 'South Dakota' },
      { value: 'TN', text: 'Tennessee' },
      { value: 'TX', text: 'Texas' },
      { value: 'UT', text: 'Utah' },
      { value: 'VA', text: 'Virginia' },
      { value: 'VI', text: 'Virgin Islands, US' },
      { value: 'VT', text: 'Vermont' },
      { value: 'WA', text: 'Washington' },
      { value: 'WI', text: 'Wisconsin' },
      { value: 'WV', text: 'West Virginia' },
      { value: 'WY', text: 'Wyoming' },
    ];

    usStates.forEach((state) => {
      stateSelect.append(createTag('option', { value: state.value }, state.text));
    });
  } else {
    stateSelect.append(createTag('option', { value: '' }, 'Select an option...'));
  }
}

/**
 * Loads the reCAPTCHA script dynamically
 */
function loadRecaptchaScript() {
  // reCAPTCHA v3
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${V3_SITE_KEY}`;
  document.head.appendChild(script);
  // reCAPTCHA v2
  const scriptV2 = document.createElement('script');
  scriptV2.src = 'https://www.google.com/recaptcha/api.js';
  document.head.append(scriptV2);
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
  const steps = TRIAL_STEPS.map(step => step.key);
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
          <p><strong>There was an error during the "${errorStep.replace(/([A-Z])/g, ' $1').toLowerCase()}" step:</strong><br>${errorMessage}</p>
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
  const resp = await fetch(`${base}/check-status?processId=${processId}`);
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
 * Extracts template data from the merged template-selection-data within the block
 * @param {HTMLElement} block - The xwalk-trials block containing merged template data
 * @returns {Array} Array of template objects with value, text, description, and image
 */
function extractTemplatesFromBlock(block) {
  const templates = [];

  const templateRows = block.querySelectorAll(':scope > div:not(:first-child)');

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

// Extract form submission logic into a separate function
function submitFormData(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Convert optIn to boolean
  data.optIn = data.optIn === 'true';

  fetch(`${base}/registration`, {
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

function buildForm(block) {
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

  // Extract templates from the merged template-selection-data within this block
  const templates = extractTemplatesFromBlock(block);

  // Hidden input to store selected template value
  const templateInput = createTag('input', {
    type: 'hidden',
    id: 'template-select',
    name: 'template',
    value: templates.length > 0 ? templates[0].value : '', // Default to first template
    required: 'true',
  });

  const templateGrid = createTag('div', { class: 'template-grid' });

  templates.forEach((template, index) => {
    const templateCard = createTag('div', {
      class: `template-card ${index === 0 ? 'selected' : ''}`,
      'data-value': template.value,
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
        src: `data:image/svg+xml;base64,${btoa(`
          <svg width="150" height="120" xmlns="http://www.w3.org/2000/svg">
            <rect width="150" height="120" fill="${['#e8f4fd', '#f0f9ff', '#fef3e2'][index]}" stroke="#ddd"/>
            <text x="75" y="60" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
              ${template.text}
            </text>
            <text x="75" y="80" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
              Preview
            </text>
          </svg>
        `)}`,
        alt: template.text,
        width: '150',
        height: '120',
      });
    }

    thumbnail.append(thumbnailImg);

    // Template info
    const templateInfo = createTag('div', { class: 'template-info' });
    const templateTitle = createTag('h4', {}, template.text);
    const templateDesc = createTag('p', {}, template.description);
    templateInfo.append(templateTitle, templateDesc);

    templateCard.append(thumbnail, templateInfo);

    // Click handler for template selection
    templateCard.addEventListener('click', () => {
      // Remove selected class from all cards
      templateGrid.querySelectorAll('.template-card').forEach((card) => {
        card.classList.remove('selected');
      });

      // Add selected class to clicked card
      templateCard.classList.add('selected');

      // Update hidden input value
      templateInput.value = template.value;
    });

    templateGrid.append(templateCard);
  });

  templateField.append(templateLabel, templateGrid, templateInput);

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

  // Country/Region and State/Province in a row
  const locationRow = createTag('div', { class: 'form-row' });

  // Country/Region
  const countryField = createTag('div', { class: 'form-field' });
  const countryLabel = createTag('label', { for: 'country' }, 'Country / Region');
  const countrySelect = createTag('select', {
    id: 'country',
    name: 'country',
    required: 'true',
  });

  // Define countries with their ISO 3166-1 alpha-2 codes
  /* eslint-disable quote-props */
  const countries = {
    'Algeria': 'DZ',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahrain': 'BH',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Bolivia': 'BO',
    'Brazil': 'BR',
    'Bulgaria': 'BG',
    'Canada': 'CA',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Costa Rica': 'CR',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Dominican Republic': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Greece': 'GR',
    'Guatemala': 'GT',
    'Hong Kong SAR of China': 'HK',
    'Hungary': 'HU',
    'India': 'IN',
    'Indonesia': 'ID',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Korea, South': 'KR',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Macau SAR of China': 'MO',
    'Malaysia': 'MY',
    'Malta': 'MT',
    'Mauritius': 'MU',
    'Mexico': 'MX',
    'Moldova': 'MD',
    'Morocco': 'MA',
    'Netherlands': 'NL',
    'New Zealand': 'NZ',
    'Nigeria': 'NG',
    'Norway': 'NO',
    'Oman': 'OM',
    'Panama': 'PA',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Qatar': 'QA',
    'Romania': 'RO',
    'Russia': 'RU',
    'Saudi Arabia': 'SA',
    'Singapore': 'SG',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'South Africa': 'ZA',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Taiwan Region': 'TW',
    'Tajikistan': 'TJ',
    'Thailand': 'TH',
    'Trinidad and Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'Yemen': 'YE',
  };

  // Add countries to select element
  Object.entries(countries).forEach(([countryName, countryCode]) => {
    const option = createTag('option', { value: countryCode }, countryName);
    if (countryName === 'United States') option.selected = true;
    countrySelect.append(option);
  });

  countryField.append(countryLabel, countrySelect);

  // State/Province
  const stateField = createTag('div', { class: 'form-field', id: 'state-field' });
  const stateLabel = createTag('label', { for: 'state' }, 'State / Province');
  const stateSelect = createTag('select', {
    id: 'state',
    name: 'state',
    required: 'true',
  });

  stateField.append(stateLabel, stateSelect);
  locationRow.append(countryField, stateField);

  // Load initial states based on default country (US)
  loadStates(stateSelect, 'US');

  // Terms and Conditions
  const agreement = createTag('div', { class: 'agreement' });
  const agreementText = createTag('p', {}, 'By clicking on "Continue", I agree that:');

  const terms = createTag('ul');

  const term1 = createTag('li', {}, 'The ');
  const adobeLink = createTag('a', { href: 'https://www.adobe.com/about-adobe.html', target: '_blank' }, 'Adobe family of companies');
  term1.append(adobeLink);
  term1.append(' may keep me informed with ');
  const personalizedLink = createTag('a', { href: 'https://www.adobe.com/privacy.html', target: '_blank' }, 'personalized');
  term1.append(personalizedLink);
  term1.append(' calls about products and services.');

  terms.append(term1);

  const privacyText = createTag('p', {}, 'See our ');
  const privacyLink = createTag('a', { href: 'https://www.adobe.com/privacy/policy.html', target: '_blank' }, 'Privacy Policy');
  privacyText.append(privacyLink);
  privacyText.append(' for more details or to opt-out at any time.');

  agreement.append(agreementText, terms, privacyText);

  // Terms and Conditions checkbox
  const termsAndConditions = createTag('div', { class: 'form-field checkbox-field' });
  const termsAndConditionsCheckbox = createTag('input', {
    type: 'checkbox',
    id: 'terms-and-conditions',
    name: 'termsAndConditions',
    value: 'true',
    required: 'true',
  });
  const termsAndConditionsLabel = createTag('label', { for: 'terms-and-conditions' }, 'I have read and accepted the ');
  const termsLink = createTag('a', { href: './ue-trial-terms.pdf', target: '_blank' }, 'Terms of Use');
  termsAndConditionsLabel.append(termsLink);
  termsAndConditionsLabel.append('.');
  termsAndConditions.append(termsAndConditionsCheckbox, termsAndConditionsLabel);

  const verInput = createTag('input', {
    type: 'hidden',
    id: 'recaptcha-version',
    name: 'recaptchaVersion',
    value: 'v3',
  });
  // Hidden field for reCAPTCHA token
  const recaptchaField = createTag('input', {
    type: 'hidden',
    id: 'g-recaptcha-response',
    name: 'recaptchaToken',
  });
  const v2container = createTag('div', {
    id: 'recaptcha-v2-container',
    style: 'display: none; margin: 1em 0;',
  });
  v2container.append(createTag('div', { id: 'recaptcha-v2' }));

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
    termsAndConditions,
    verInput,
    recaptchaField,
    v2container,
    buttonContainer,
  );

  let v2Rendered = false;
  function showV2Captcha() {
    verInput.value = 'v2';
    v2container.style.display = 'block';
    if (!v2Rendered) {
      grecaptcha.render('recaptcha-v2', {
        sitekey: V2_SITE_KEY,
        callback: (token) => {
          recaptchaField.value = token;
          submitFormData(form);
        },
      });
      v2Rendered = true;
    }
  }

  // Add form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable submit button to prevent multiple submissions
    const submitButtonSubmit = form.querySelector('button[type="submit"]');
    submitButtonSubmit.disabled = true;
    submitButtonSubmit.textContent = 'Submitting...';

    if (verInput.value === 'v3') {
      // Execute v3 reCAPTCHA verification
      grecaptcha.ready(() => {
        grecaptcha.execute(V3_SITE_KEY, { action: 'submit' }).then((v3token) => {
          // Set the reCAPTCHA token
          document.getElementById('g-recaptcha-response').value = v3token;

          // Collect form data
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          // Convert optIn to boolean
          data.optIn = data.optIn === 'true';

          // Submit form data to server using fetch
          fetch(`${base}/registration`, {
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
                if (err.error === 'v2captcha_required') {
                  showV2Captcha();
                } else {
                  throw new Error(err.error ? `${err.error}\nThere was an error submitting your request. Please try again.` : 'There was an error submitting your request. Please try again.');
                }
              }
            }).catch((error) => {
              showModal(error.message);
              submitButton.disabled = false;
              submitButton.textContent = 'Continue';
            });
        });
      });
    } else {
      submitFormData(form);
    }
  });

  // Add dynamic state selection based on country and hide/show logic
  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;

    // Show state field only for US
    if (selectedCountry === 'US') {
      stateField.style.display = 'flex';
      stateSelect.setAttribute('required', 'true');
      loadStates(stateSelect, selectedCountry);
    } else {
      stateField.style.display = 'none';
      stateSelect.removeAttribute('required');
      // Clear state selection when country is not US
      stateSelect.innerHTML = '';
    }
  });

  return form;
}

export default function decorate(block) {
  // Load reCAPTCHA script
  loadRecaptchaScript();

  // Get the original content from the block (excluding template-selection-data)
  const infoContent = block.querySelector(':scope > div:first-child');

  // Create a new layout with two columns
  const formSection = createTag('div', { class: 'form-section' });
  formSection.append(buildForm(block));

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
