import { createTag } from '../../scripts/scripts.js';

function generateRandomNumber(max, excluding) {
  //  minimum is inclusive, maximum is exclusive
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * Math.floor(max));
  } while (randomIndex === excluding);
  return randomIndex;
}

function tooltipAfterOverride(tooltip, axis, pixels) {
  const block = tooltip.closest('.block');
  let style = tooltip.closest('.block').querySelector('style');
  if (axis === 'reset' && !style) return;
  if (!style) {
    style = createTag('style');
    block.append(style);
  }
  if (axis === 'reset') style.remove();
  else if (axis === 'left') {
    // write tooltip override
    const op = pixels > 0 ? '-' : '+';
    // NOTE: 6 is the width of tooltip::after
    const halfTip = Math.floor(tooltip.clientWidth / 2);
    const tooltipShift = (op === '+' ? Math.floor(pixels - 6) : Math.ceil(pixels + 6));
    if (Math.abs(tooltipShift) >= halfTip) {
      style.textContent = `.availability .tooltip::after { ${axis}: calc(50% ${op} ${halfTip}px); }`;
      tooltip.classList.add(op === '+' ? 'max' : 'min');
    } else {
      style.textContent = `.availability .tooltip::after { ${axis}: calc(50% ${op} ${Math.abs(pixels)}px); }`;
    }
  }
}

function moveTooltip(tooltip, axis, direction) {
  const style = window.getComputedStyle(tooltip);
  if (axis === 'x') { // move horizontally
    tooltip.style.left = `${(parseFloat(style.left, 10) + direction).toFixed(2)}px`;
    tooltipAfterOverride(tooltip, 'left', direction);
  } else if (axis === 'y') { // flip vertically
    tooltip.classList.add('flip');
    const matrix = new DOMMatrix(window.getComputedStyle(tooltip).transform);
    tooltip.style.transform = new DOMMatrix([
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e,
      Math.abs(matrix.f / 2.5),
    ]);
  }
}

function ensureTooltipInsideBoundingBox(exterior, interior, tooltip) {
  // check horizontal bounds
  const fitsLeft = interior.left >= exterior.left;
  if (!fitsLeft) moveTooltip(tooltip, 'x', exterior.left - interior.left);
  const fitsRight = interior.right <= exterior.right;
  if (!fitsRight) moveTooltip(tooltip, 'x', exterior.right - interior.right);
  // check vertical bounds
  const fitsTop = interior.top >= exterior.top;
  if (!fitsTop) moveTooltip(tooltip, 'y');
}

function positionTooltip(tooltip, pin, svg) {
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const cx = parseFloat(pin.getAttribute('cx'), 10);
  const cy = parseFloat(pin.getAttribute('cy'), 10);
  tooltip.style.top = `${100 * (cy / height)}%`;
  tooltip.style.left = `${100 * (cx / width)}%`;
  const svgRect = svg.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const svgPadding = 6;
  ensureTooltipInsideBoundingBox({
    left: svgRect.left + svgPadding,
    top: svgRect.top + svgPadding,
    right: svgRect.right - svgPadding,
  }, tipRect, tooltip);
}

function focusPin(pin, tooltip, svg) {
  // move focused pin to front
  pin.parentElement.append(pin);
  pin.dataset.focus = true;
  // reset, rewrite, and reposition tooltip
  tooltip.classList = 'tooltip';
  tooltip.removeAttribute('style');
  tooltipAfterOverride(svg.closest('.block'), 'reset');
  tooltip.textContent = pin.getAttribute('aria-label');
  positionTooltip(tooltip, pin, svg);
  tooltip.setAttribute('aria-hidden', false);
}

function unfocusPin(tooltip, svg) {
  const focused = svg.querySelector('[data-focus]');
  if (focused) focused.removeAttribute('data-focus');
  tooltip.removeAttribute('data-focus');
  tooltip.setAttribute('aria-hidden', true);
}

function iterateThroughPins(pins, svg, tooltip, lastIndex = -1) {
  const randomIndex = generateRandomNumber(pins.length, lastIndex);
  const randomPin = pins[randomIndex];
  if (svg.dataset.auto === 'true') focusPin(randomPin, tooltip, svg);
  setTimeout(() => {
    if (svg.dataset.auto === 'true') unfocusPin(tooltip, svg);
    setTimeout(() => {
      iterateThroughPins(pins, svg, tooltip, randomIndex); // recursive call to focus another pin
    }, 200);
  }, 3000);
}

function buildTooltip() {
  const tooltip = createTag('div', {
    'aria-hidden': true,
    class: 'tooltip',
    id: 'availability-tooltip',
  });
  return tooltip;
}

async function populateData(src, svg, tooltip) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.id = 'availability-group';
  svg.append(group);
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const longUnit = (width / 2) / 180;
  const latUnit = (height / 2) / 90;
  const req = await fetch(src);
  const { data } = await req.json();
  data.forEach((city) => {
    const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    // position pin on map according to latitude and longitude
    const cx = ((width / 2) + (parseFloat(city.Longitude, 10) * longUnit)).toFixed(2);
    const cy = ((height / 2) - (parseFloat(city.Latitude, 10) * latUnit)).toFixed(2);
    pin.setAttribute('cy', cy);
    pin.setAttribute('cx', cx);
    pin.setAttribute('r', 33);
    pin.setAttribute('aria-label', city.City);
    group.append(pin);
    // enable pin hover
    pin.addEventListener('mouseenter', () => focusPin(pin, tooltip, svg));
    pin.addEventListener('mouseleave', () => unfocusPin(tooltip, svg));
    svg.addEventListener('mouseenter', () => {
      svg.dataset.auto = false;
    });
    svg.addEventListener('mouseleave', () => {
      svg.dataset.auto = true;
      unfocusPin(tooltip, svg);
    });
  });
  // auto-iterate through pins
  const pins = svg.querySelectorAll('circle');
  iterateThroughPins(pins, svg, tooltip);
}

export default function decorate(block) {
  const data = block.querySelector('a[href]');
  block.innerHTML = '';
  const wrapper = createTag('div', { class: 'tooltip-wrapper' });
  const img = createTag('img', { src: '/blocks/availability/map.svg' });
  img.addEventListener('load', async () => {
    const req = await fetch(img.src);
    const res = await req.text();
    const temp = createTag('div');
    temp.innerHTML = res;
    const svg = temp.querySelector('svg');
    img.replaceWith(svg);
    if (data) {
      svg.dataset.auto = true;
      const tooltip = buildTooltip();
      wrapper.prepend(tooltip);
      populateData(data.href, svg, tooltip);
    }
  });
  wrapper.append(img);
  block.append(wrapper);
}
