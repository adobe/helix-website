/* global grecaptcha */

import createTag from '../../utils/tag.js';

const V3_SITE_KEY = '6LfiKDErAAAAAK_RgBahms-QPJyErQTRElVCprpx';
const V2_SITE_KEY = '6Le1IkYrAAAAAFKLFRoLHFm2XXBCl5c8iiiWHoxf';

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

function showSuccessMessage(form) {
  const successMessage = createTag('div', { class: 'success-message' });
  successMessage.innerHTML = 'Your trial request has been submitted successfully. You will receive an email in the next 10 minutes with all details about your trial access';
  form.replaceWith(successMessage);
}

/**
 * Builds the trial form
 * @returns {HTMLElement} The form element
 */
/**
 * Extracts template data from the merged template-selection-data within the block
 * @param {HTMLElement} block - The xwalk-trials block containing merged template data
 * @returns {Array} Array of template objects with value, text, description, and image
 */
function extractTemplatesFromBlock(block) {
  const templates = [];
  // Look for the merged template-selection-data within this block
  const templateData = block.querySelector('.template-selection-data');

  if (!templateData) return templates;
  // Get all template rows from the template-selection-data
  const templateRows = templateData.querySelectorAll(':scope > div');

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

  fetch('https://3531103-xwalktrial.adobeioruntime.net/api/v1/web/web-api/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (response.ok) {
        showSuccessMessage(form);
      } else {
        const err = await response.json();
        throw new Error(err.error ? `${err.error}\nThere was an error submitting your request. Please try again.` : 'There was an error submitting your request. Please try again.');
      }
    })
    .catch((error) => {
      /* eslint-disable no-alert */
      alert(error.message);
      const submitButtonError = form.querySelector('button[type="submit"]');
      submitButtonError.disabled = false;
      submitButtonError.textContent = 'Continue';
    });
}

function buildForm(block) {
  const form = createTag('form', { action: '/createTrials', method: 'POST' });

  // Business email
  const emailField = createTag('div', { class: 'form-field' });
  const emailLabel = createTag('label', { for: 'business-email' }, 'Business email');
  const emailInput = createTag('input', {
    type: 'email',
    id: 'business-email',
    name: 'email',
    required: 'true',
  });
  emailField.append(emailLabel, emailInput);

  // Name fields (first, last) in a row
  const nameRow = createTag('div', { class: 'form-row' });

  // First name
  const firstNameField = createTag('div', { class: 'form-field' });
  const firstNameLabel = createTag('label', { for: 'first-name' }, 'First name');
  const firstNameInput = createTag('input', {
    type: 'text',
    id: 'first-name',
    name: 'firstName',
    required: 'true',
  });
  firstNameField.append(firstNameLabel, firstNameInput);

  // Last name
  const lastNameField = createTag('div', { class: 'form-field' });
  const lastNameLabel = createTag('label', { for: 'last-name' }, 'Last name');
  const lastNameInput = createTag('input', {
    type: 'text',
    id: 'last-name',
    name: 'lastName',
    required: 'true',
  });
  lastNameField.append(lastNameLabel, lastNameInput);

  nameRow.append(firstNameField, lastNameField);

  // Company name
  const companyField = createTag('div', { class: 'form-field' });
  const companyLabel = createTag('label', { for: 'company-name' }, 'Company name');
  const companyInput = createTag('input', {
    type: 'text',
    id: 'company-name',
    name: 'company',
    required: 'true',
  });
  companyField.append(companyLabel, companyInput);

  // User role dropdown
  const roleField = createTag('div', { class: 'form-field' });
  const roleLabel = createTag('label', { for: 'user-role' }, 'User role');
  const roleSelect = createTag('select', {
    id: 'user-role',
    name: 'persona',
    required: 'true',
  });

  // Add role options
  const roles = [
    { value: 'business', text: 'Practitioner' },
    { value: 'developer', text: 'Developer' },
  ];

  roles.forEach((role) => {
    const option = createTag('option', { value: role.value }, role.text);
    if (role.value === 'business') option.selected = true;
    roleSelect.append(option);
  });

  roleField.append(roleLabel, roleSelect);

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
  const githubField = createTag('div', { class: 'form-field', id: 'github-field', style: 'display: none;' });
  const githubLabel = createTag('label', { for: 'github-id' }, 'GitHub ID');
  const githubInput = createTag('input', {
    type: 'text',
    id: 'github-id',
    name: 'githubId',
  });
  githubField.append(githubLabel, githubInput);

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
  const term1 = createTag('li', {}, 'I have read and accepted the ');
  const termsLink = createTag('a', { href: '#', target: '_blank' }, 'Terms of Use');
  term1.append(termsLink);
  term1.append('.');

  const term2 = createTag('li', {}, 'The ');
  const adobeLink = createTag('a', { href: '#', target: '_blank' }, 'Adobe family of companies');
  term2.append(adobeLink);
  term2.append(' may keep me informed with ');
  const personalizedLink = createTag('a', { href: '#', target: '_blank' }, 'personalized');
  term2.append(personalizedLink);
  term2.append(' calls about products and services.');

  terms.append(term1, term2);

  const privacyText = createTag('p', {}, 'See our ');
  const privacyLink = createTag('a', { href: '#', target: '_blank' }, 'Privacy Policy');
  privacyText.append(privacyLink);
  privacyText.append(' for more details or to opt-out at any time.');

  agreement.append(agreementText, terms, privacyText);

  // Contact permission checkbox
  const contactPermission = createTag('div', { class: 'form-field checkbox-field' });
  const contactCheckbox = createTag('input', {
    type: 'checkbox',
    id: 'contact-permission',
    name: 'optIn',
    value: 'true',
    checked: true,
  });
  const contactLabel = createTag('label', { for: 'contact-permission' }, 'Allow Adobe to contact me to provide more information');
  contactPermission.append(contactCheckbox, contactLabel);

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
    nameRow,
    companyField,
    roleField,
    githubField,
    templateField,
    agreement,
    contactPermission,
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
          fetch('https://3531103-xwalktrial.adobeioruntime.net/api/v1/web/web-api/registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
            .then(async (response) => {
              if (response.ok) {
                showSuccessMessage(form);
              } else {
                const err = await response.json();
                if (err.error === 'v2captcha_required') {
                  showV2Captcha();
                } else {
                  throw new Error(err.error ? `${err.error}\nThere was an error submitting your request. Please try again.` : 'There was an error submitting your request. Please try again.');
                }
              }
            }).catch((error) => {
              // eslint-disable-next-line no-alert
              alert(error.message);
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

  // Add GitHub field visibility based on role selection
  roleSelect.addEventListener('change', () => {
    const selectedRole = roleSelect.value;
    if (selectedRole === 'developer') {
      githubField.style.display = 'flex';
      githubInput.setAttribute('required', 'true');
    } else {
      githubField.style.display = 'none';
      githubInput.removeAttribute('required');
      githubInput.value = '';
    }
  });

  return form;
}

export default function decorate(block) {
  // Load reCAPTCHA script
  loadRecaptchaScript();

  // Get the original content from the block (excluding template-selection-data)
  const originalContent = block.querySelector(':scope > div:not(.template-selection-data)');

  // Create a new layout with two columns
  const formSection = createTag('div', { class: 'form-section' });
  formSection.append(buildForm(block));

  // Move the original content to the trial info section
  const trialInfo = createTag('div', { class: 'trial-info' });
  if (originalContent) {
    // Clone the original content and preserve its structure
    trialInfo.append(originalContent.cloneNode(true));
  }

  // Clear the block and add the new layout
  block.textContent = '';
  block.append(formSection, trialInfo);
}
