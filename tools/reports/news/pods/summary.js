/**
 * Increments displayed value of an element until it reaches target value.
 * @param {HTMLElement} element - DOM element to update.
 * @param {number} current - Current value of increment.
 * @param {number} i - Value to increment by each step.
 * @param {number} timeout - Delay between increments (in ms).
 * @param {number} target - Target value to reach.
 * @param {Array|null} nonNumeric - Any non-numeric characters to add to displayed value.
 */
function increment(element, current, i, timeout, target, nonNumeric) {
  // prevent overshooting target
  const nextValue = Math.min(current + i, target);
  const formattedValue = nextValue.toFixed(i > 0 && i < 1 ? 1 : 0);

  // update content with numeric value and non-numeric characters (if any)
  if (nonNumeric && nonNumeric.includes(',')) {
    element.textContent = parseInt(formattedValue, 10).toLocaleString();
  } else if (nonNumeric) {
    element.textContent = `${formattedValue}${nonNumeric.join('')}`;
  } else {
    element.textContent = formattedValue;
  }

  // continue incrementing until reaching the target
  if (nextValue < target) {
    // eslint-disable-next-line function-paren-newline
    setTimeout(
      () => increment(element, nextValue, i, timeout, target, nonNumeric), timeout);
  }
}

/**
 * Initializes and starts increment animation.
 * @param {HTMLElement} element - DOM element displaying count.
 * @param {number} duration - Total duration of the animation (in ms).
 * @param {number} target - Target numeric value.
 */
function startIncrement(element, duration, target) {
  const current = element.textContent; // initial content of the element
  const nonNumeric = target.match(/[^0-9.-]+/g); // extract non-numeric characters

  // parse numeric target
  const numerize = (val) => val.replace(/[^0-9.-]/g, '');
  const numericTarget = parseFloat(numerize(target));
  const initial = parseFloat(numerize(current));

  // calculate increment step based on target's length
  const digits = Math.floor(Math.log10(Math.abs(numericTarget))) + 1;
  const incrementBy = 10 ** (digits - 2);

  // calculate total number of increments and timeout per step
  const steps = Math.ceil(numericTarget / incrementBy);
  const timeout = duration / steps;

  if (Number.isNaN(numericTarget)) {
    element.textContent = '--';
  } else {
    increment(element, initial, incrementBy, timeout, numericTarget, nonNumeric);
  }
}

export default function buildSummary(name, label, value) {
  if (document.querySelector(`.summary.${name}`)) {
    document.querySelector(`.summary.${name}`).remove();
  }
  const section = document.createElement('div');
  section.className = `summary ${name}`;
  section.innerHTML = `<p class="summary-value">0</p>
    <p class="summary-label">${label}</p>`;

  const parens = label.includes('(') && label.includes(')');
  if (parens) {
    const primary = label.split('(')[0].trim();
    const secondary = label.split('(')[1].split(')')[0].trim();
    section.innerHTML = `<p class="summary-value">0</p>
      <p class="summary-label">${primary} <span>(${secondary})</span></p>`;
  } else {
    section.innerHTML = `<p class="summary-value">0</p>
      <p class="summary-label">${label}</p>`;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startIncrement(section.querySelector('.summary-value'), 1300, value);
        observer.disconnect();
      }
    });
  }, { threshold: 0 });
  observer.observe(section);

  return section;
}
