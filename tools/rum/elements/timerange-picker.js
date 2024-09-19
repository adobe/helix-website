// date management
function pad(number) {
  return number.toString().padStart(2, '0');
}

function toDateString(date) {
  // convert date
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  // convert time
  // const hours = pad(date.getHours());
  // const minutes = pad(date.getMinutes());

  // return `${year}-${month}-${day}T${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
}

const TEMPLATE = `
  <div class="form-field picker-field">
    <input
      type="text"
      aria-haspopup="listbox"
      readonly />
    <ul class="menu" id="timeframe-menu" aria-labelledby="timeframe" role="listbox" hidden></ul>
    <div class="form-field datetime-wrapper" hidden>
      <div class="form-field datetime-field" aria-hidden="true">
        <label for="date-from">From</label>
        <input name="date-from" type="date" readonly />
      </div>
      <div class="form-field datetime-field" aria-hidden="true">
        <label for="date-to">To</label>
        <input name="date-to" type="date" readonly />
      </div>
    </div>
  </div>
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
    console.log('initDOM');

    const section = document.createElement('section');
    section.className = 'form-field timeframe-wrapper';
    section.innerHTML = TEMPLATE;

    const sul = section.querySelector('ul');
    const options = this.querySelectorAll('ul li');

    let defaultValue = null;
    options.forEach((option) => {
      if (option.getAttribute('aria-selected') === 'true') {
        defaultValue = option.dataset.value;
      } else {
        option.setAttribute('aria-selected', false);
      }
      option.dataset.role = 'option';
      sul.appendChild(option);
    });

    console.log('defaultValue', defaultValue);

    this.innerHTML = '';
    this.appendChild(section);

    this.inputElement = this.querySelector('input');
    this.dropdownElement = this.querySelector('ul');
    this.fromElement = this.querySelector('[name="date-from"]');
    this.toElement = this.querySelector('[name="date-to"]');
    this.datetimeWrapperElement = this.querySelector('.datetime-wrapper');

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
  }

  get value() {
    return {
      value: this.inputElement.dataset.value,
      from: this.fromElement.value,
      to: this.toElement.value,
    };
  }

  set value(config) {
    console.log('set value', config);
    const { value, from, to } = config;
    const {
      inputElement, dropdownElement, fromElement, toElement,
    } = this;

    const option = dropdownElement.querySelector(`li[data-value="${value}"]`);
    if (!option) {
      console.error('Invalid value', value);
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
