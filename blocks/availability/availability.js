import { createTag } from '../../scripts/scripts.js';

function generateRandomNumber(max, excluding) {
  //  minimum is inclusive, maximum is exclusive
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * Math.floor(max));
  } while (randomIndex === excluding);
  return randomIndex;
}

function buildTooltip() {
  const tooltip = createTag('div', {
    'aria-hidden': true,
    class: 'tooltip',
    id: 'availability-tooltip',
  });
  return tooltip;
}

function focusPin(pin, tooltip, svg) {
  // move focused pin to front
  pin.parentElement.append(pin);
  pin.dataset.focus = true;
  // rewrite and reposition tooltip
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const cx = parseFloat(pin.getAttribute('cx'), 10);
  const cy = parseFloat(pin.getAttribute('cy'), 10);
  tooltip.textContent = pin.getAttribute('aria-label');
  tooltip.style.top = `${100 * (cy / height)}%`;
  tooltip.style.left = `${100 * (cx / width)}%`;
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
  }, 6000);
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
    pin.setAttribute('aria-describedby', 'availability-tooltip');
    // position pin on map according to latitude and longitude
    const cx = (width / 2) + (parseFloat(city.Longitude, 10) * longUnit);
    const cy = (height / 2) - (parseFloat(city.Latitude, 10) * latUnit);
    pin.setAttribute('cy', cy);
    pin.setAttribute('cx', cx);
    pin.setAttribute('r', 33);
    pin.setAttribute('aria-label', city.City);
    group.append(pin);
    // enable pin hover
    pin.addEventListener('mouseenter', () => {
      focusPin(pin, tooltip, svg);
    });
    pin.addEventListener('mouseleave', () => {
      unfocusPin(tooltip, svg);
    });
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
  if (data) {
    const img = createTag('img', { src: '/blocks/availability/map.svg' });
    img.addEventListener('load', async () => {
      const req = await fetch(img.src);
      const res = await req.text();
      const temp = createTag('div');
      temp.innerHTML = res;
      const svg = temp.querySelector('svg');
      svg.dataset.auto = true;
      img.replaceWith(svg);
      const tooltip = buildTooltip();
      block.prepend(tooltip);
      populateData(data.href, svg, tooltip);
    });
    block.append(img);
  }
}
