function debounce(func, wait) {
  let timeout;
  // eslint-disable-next-line func-names
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// date management
function pad(number) {
  return number.toString().padStart(2, '0');
}

function toDateString(date) {
  // convert date
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}

const STYLES = `
  .daterange-wrapper {
    display: grid;
    align-items: end;
    gap: var(--spacing-l);
  }

  .input-wrapper, .daterange-wrapper {
    position: relative;
    display: block;
  }

  input {
    width: 100%;
    font: inherit;
    border-color: var(--gray-100);
    border: 2px solid var(--gray-300);
    padding: 0.4em 0.85em;
    background-color: var(--gray-100);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
    border-radius: 4px;
    min-width: 200px;
  }

  @media (width >= 900px) {
    .daterange-wrapper {
      grid-area: daterange;
    }
    
    @media (width >= 900px) {
        .log-viewer form#daterange-form > .daterange-wrapper {
            grid-area: daterange;
        }
    }
  }

  input ~ ul li {
    padding: 0.4em 0;
    padding-left: 2rem;
    cursor: pointer;
  }

  ul.menu li:last-child {
    position: relative;
    margin-top: 16px;
  }

  ul.menu li:last-child::before {
    content: '';
    position: absolute;
    top: calc((-0.5 * 16px) - (2px / 2));
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--gray-200);
  }

  .input-wrapper {
    display: none;
    min-width: 500px;
    background-color: white;
  }

  input[data-custom='true'] ~ .input-wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px 12px;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    margin-top: 4px;
    border-radius: 4px;
    padding: calc(0.4em + 2px);
    background-color: white;
    box-shadow: var(--grey-700);
    z-index: 10;
  }

  ul {
    list-style: none;
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    margin: 0;
    border-radius: 8px;
    padding: calc(0.4em + 2px);
    background-color: white;
    box-shadow: var(--grey-700);
    z-index: 20;
  }

  ul.menu:not([hidden]) + .input-wrapper {
    display: none;
  }

  @media (width >= 740px) {
    .input-wrapper {
      grid-template-columns: repeat(2, 1fr);
    }

   input[data-custom='true'] ~ .input-wrapper {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width >= 900px) {
    input[data-custom='true'] ~ .input-wrapper {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (width >= 1200px) {
    input[data-custom='true'] ~ .input-wrapper {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      position: absolute;
    }
  }

 .date-field {
    display: block;
    margin-top: 0;
  }

  .date-field label {
    display: block;
    margin-bottom: 0.5em;
  }
`;

const TEMPLATE = `
<section class="daterange-wrapper">
  <input
    type="text"
    aria-haspopup="listbox"
    readonly />
  <ul class="menu" aria-labelledby="daterange" role="listbox" hidden></ul>
  <div class="input-wrapper" hidden>
    <div class="date-field" aria-hidden="true">
      <label for="date-from">From</label>
      <input name="date-from" type="date" readonly />
    </div>
    <div class="date-field" aria-hidden="true">
      <label for="date-to">To</label>
      <input name="date-to" type="date" readonly />
    </div>
  </div>
</section>
`;

export default class TimeRangePicker extends HTMLElement {
  constructor() {
    super();

    this.inputElement = null;
    this.dropdownElement = null;
    this.fromElement = null;
    this.toElement = null;
    this.datetimeWrapperElement = null;

    this.id = this.getAttribute('id');
  }

  connectedCallback() {
    this.initDOM();
    this.initValue();
  }

  initDOM() {
    this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = STYLES;

    const section = document.createRange().createContextualFragment(TEMPLATE);

    const sul = section.querySelector('ul');
    const options = this.querySelectorAll('ul li');

    options.forEach((option) => {
      if (option.getAttribute('aria-selected') !== 'true') {
        option.setAttribute('aria-selected', false);
      }
      option.dataset.role = 'option';
      sul.appendChild(option);
    });

    this.shadowRoot.innerHTML = '';

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(section);

    this.inputElement = this.shadowRoot.querySelector('input');
    this.dropdownElement = this.shadowRoot.querySelector('ul');
    this.fromElement = this.shadowRoot.querySelector('[name="date-from"]');
    this.toElement = this.shadowRoot.querySelector('[name="date-to"]');
    this.datetimeWrapperElement = this.shadowRoot.querySelector('.input-wrapper');

    this.registerListeners();
  }

  initValue() {
    const { toElement } = this;
    toElement.value = toDateString(new Date());
  }

  registerListeners() {
    const { inputElement, dropdownElement } = this;
    const options = dropdownElement.querySelectorAll('li');

    inputElement.addEventListener('click', () => {
      const expanded = inputElement.getAttribute('aria-expanded') === 'true';
      inputElement.setAttribute('aria-expanded', !expanded);
      dropdownElement.hidden = expanded;
    });

    const $this = this;
    options.forEach((option) => {
      option.addEventListener('click', () => {
        $this.value = {
          value: option.dataset.value,
          from: $this.fromElement.value || null,
          to: $this.toElement.value || null,
        };
      });
    });

    const setValue = () => {
      $this.value = {
        value: 'custom',
        from: this.fromElement.value,
        to: this.toElement.value,
      };
    };

    this.fromElement.addEventListener('change', debounce(setValue, 500));
    this.toElement.addEventListener('change', debounce(setValue, 500));
  }

  get value() {
    return {
      value: this.inputElement.dataset.value,
      from: this.fromElement.value,
      to: this.toElement.value,
    };
  }

  set value(config) {
    const { value, from, to } = config;
    const {
      inputElement, dropdownElement, fromElement, toElement,
    } = this;

    const option = dropdownElement.querySelector(`li[data-value="${value}"]`);
    if (!option) {
      return;
    }

    inputElement.value = option.textContent;
    inputElement.dataset.value = option.dataset.value;
    inputElement.setAttribute('aria-expanded', false);

    const options = dropdownElement.querySelectorAll('li');
    options.forEach((o) => o.setAttribute('aria-selected', o === option));

    dropdownElement.hidden = true;

    if (from) {
      fromElement.value = toDateString(new Date(from));
    }

    if (to) {
      toElement.value = toDateString(new Date(to));
    }

    this.updateTimeframe({
      value,
      from,
      to,
    });

    this.dispatchEvent(new Event('change', {
      detail: {
        value,
        from: this.fromElement.value,
        to: this.toElement.value,
      },
    }));
  }

  updateTimeframe({ value, to = null }) {
    const { fromElement, toElement } = this;

    const now = new Date();

    [fromElement, toElement].forEach((field) => {
      field.readOnly = true;
    });
    if (!to) {
      toElement.value = toDateString(now);
    }
    this.toggleCustomTimeframe(value === 'custom');
    if (value === 'week') {
      const lastWeek = now;
      lastWeek.setHours(7 * 24, 0, 0, 0);
      fromElement.value = toDateString(lastWeek);
    } else if (value === 'month') {
      const lastMonth = now;
      lastMonth.setMonth(now.getMonth() - 1);
      fromElement.value = toDateString(lastMonth);
    } else if (value === 'year') {
      const lastYear = now;
      lastYear.setFullYear(now.getFullYear() - 1);
      fromElement.value = toDateString(lastYear);
    } else if (value === 'custom') {
      [fromElement, toElement].forEach((field) => {
        field.removeAttribute('readonly');
      });
    }
  }

  toggleCustomTimeframe(enabled) {
    const { inputElement, datetimeWrapperElement } = this;

    inputElement.dataset.custom = enabled;
    datetimeWrapperElement.hidden = !enabled;
    [...datetimeWrapperElement.children].forEach((child) => {
      child.setAttribute('aria-hidden', !enabled);
    });
  }
}
