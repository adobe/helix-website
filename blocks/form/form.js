import { addInViewAnimationToSingleElement } from '../../utils/helpers.js';

const GENERIC_ERROR = 'Sorry, we couldn’t submit the form. Please try again later.';
const INVALID_ERROR = 'Please check the highlighted fields and try again.';

/**
 * Returns the endpoint to POST to directly, if the submit action is an https URL
 * (or http on localhost, for a local worker). Other actions use the legacy forms service.
 * @param {string} action the submit row's Placeholder value
 * @returns {string|null} the endpoint URL, or null for the legacy service
 */
export function getEndpoint(action) {
  try {
    const url = new URL(action);
    if (url.protocol === 'https:') return url.href;
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return url.href;
  } catch (e) {
    // relative actions use the legacy forms service
  }
  return null;
}

function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  const resp = await fetch(`https://form.aem.page/main--helix-website--adobe${form.dataset.action}`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

/**
 * Removes error messages and invalid states from a previous submission.
 * @param {HTMLFormElement} form the form
 */
function clearErrors(form) {
  form.querySelectorAll('.form-message, .form-field-error').forEach((el) => el.remove());
  form.querySelectorAll('[aria-invalid]').forEach((el) => {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  });
}

/**
 * Shows an alert above the submit button, and marks the given fields invalid.
 * @param {HTMLFormElement} form the form
 * @param {string} message the alert text when no fields are marked invalid
 * @param {string[]} fields ids of the fields to mark invalid
 */
function showErrors(form, message, fields = []) {
  const invalid = fields
    .map((name) => [...form.elements].find((el) => el.id && el.id === name))
    .filter(Boolean);
  invalid.forEach((el) => {
    const error = document.createElement('p');
    error.className = 'form-field-error';
    error.id = `${el.id}-error`;
    error.textContent = 'Please check this field.';
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', error.id);
    el.closest('.field-wrapper').after(error);
  });
  const alert = document.createElement('div');
  alert.className = 'form-message';
  alert.setAttribute('role', 'alert');
  alert.textContent = invalid.length ? INVALID_ERROR : message;
  form.querySelector('.form-submit-wrapper')?.before(alert);
  if (invalid.length) invalid[0].focus();
}

/**
 * POSTs the form data as JSON to the endpoint, showing errors if it fails.
 * @param {HTMLFormElement} form the form
 * @param {string} endpoint the URL to POST to
 * @returns {Promise<boolean>} true if the submission was accepted
 */
async function submitToEndpoint(form, endpoint) {
  clearErrors(form);
  const data = {};
  [...form.elements].forEach((fe) => {
    if (!fe.id) return;
    if (fe.type === 'checkbox') data[fe.id] = fe.checked ? 'Yes' : '';
    else data[fe.id] = fe.value;
  });
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (resp.ok) return true;
    const body = resp.status === 400 ? await resp.json().catch(() => ({})) : {};
    const fields = body.error === 'invalid' && Array.isArray(body.fields) ? body.fields : [];
    showErrors(form, GENERIC_ERROR, fields);
  } catch (e) {
    showErrors(form, GENERIC_ERROR);
  }
  return false;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        const endpoint = getEndpoint(fd.Placeholder);
        if (endpoint) {
          if (!await submitToEndpoint(form, endpoint)) {
            button.removeAttribute('disabled');
            return;
          }
        } else {
          await submitForm(form);
        }
        const redirectTo = fd.Extra;
        window.location.href = redirectTo;
      }
    });
  }
  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Field;
  input.setAttribute('placeholder', fd.Placeholder);
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

function fill(form) {
  const { action } = form.dataset;
  if (action === '/tools/bot/register-form') {
    const loc = new URL(window.location.href);
    form.querySelector('#owner').value = loc.searchParams.get('owner') || '';
    form.querySelector('#installationId').value = loc.searchParams.get('id') || '';
  }
}

export async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd, 'h3'));
        break;
      case 'legal':
        fieldWrapper.append(createHeading(fd, 'p'));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);
  fill(form);
  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  addInViewAnimationToSingleElement(block, 'fade-up');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
