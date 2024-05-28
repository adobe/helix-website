import { createTag } from '../../scripts/scripts.js';

/**
 * Generates a random number between 0 and max (exclusive) that is not equal to excluding
 * @param {number} max The upper bound (exclusive)
 * @param {number} excluding Number to avoid (to avoid repetition)
 * @returns {number} Randomly generated number
 */
function generateRandomNumber(max, excluding) {
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * Math.floor(max));
  } while (randomNum === excluding);
  return randomNum;
}

/**
 * Fetches data from a given URL.
 * @param {string} url URL to fetch data from
 * @returns {Promise<Object[]>} Fetched data, array of Objects
 */
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('data could not be fetched from', url);
    const { data } = await res.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error: ', error);
  }
  return [];
}

/**
 * Overrides the tooltip's CSS styles based on the provided axis and pixel values.
 * @param {HTMLElement} tooltip Tooltip element whose style will be overridden
 * @param {string} axis Axis on which to apply the override
 * @param {number} pixels Number of pixels to shift the tooltip
 */
function applyTooltipOverride(tooltip, axis, pixels) {
  const block = tooltip.closest('.block');
  // check for existing style element
  let style = block.querySelector('style');
  // if axis is 'reset,' reset previous tooltip override
  if (axis === 'reset') {
    // if unnecessary style element is found, remove the style element
    if (style) style.remove();
    return;
  }
  // if no style element for previous override exists, create a new one and append it to the block
  if (!style) {
    style = createTag('style');
    block.append(style);
  }
  // write tooltip override
  if (axis === 'left') {
    /* determine the operation sign for the css calculation based on the pixel value
        if pixels > 0, tooltip will shift to the left (-)
        else if pixels <= 0, tooltip will shift to the right (+) */
    const op = pixels > 0 ? '-' : '+';
    const TOOLTIP_POINTER_WIDTH = 6;
    const halfTip = Math.floor(tooltip.clientWidth / 2); // calculate half the width of the tooltip
    const tooltipShift = (op === '+' ? Math.floor(pixels - TOOLTIP_POINTER_WIDTH) : Math.ceil(pixels + TOOLTIP_POINTER_WIDTH)); // adjust the shift value based on the pixels value
    if (Math.abs(tooltipShift) >= halfTip) {
      // apply a max or min class to ensure tooltip fits in the bounding box of its parent
      style.textContent = `.availability .tooltip::after { ${axis}: calc(50% ${op} ${halfTip}px); }`;
      tooltip.classList.add(op === '+' ? 'max' : 'min');
    } else {
      // apply the calculated pixel shift
      style.textContent = `.availability .tooltip::after { ${axis}: calc(50% ${op} ${Math.abs(pixels)}px); }`;
    }
  }
}

/**
 * Moves the tooltip element based on the specified axis and direction.
 * @param {HTMLElement} tooltip Tooltip element to move
 * @param {string} axis Axis to move the tooltip ('x' for horizontal, 'y' for vertical)
 * @param {number} direction Pixels to move the tooltip (>0 for right/down, <=0 for left/up)
 */
function moveTooltip(tooltip, axis, direction) {
  // get the current computed style (positioning) of the tooltip
  const style = window.getComputedStyle(tooltip);
  if (axis === 'x') { // move horizontally
    // calculate and apply the new left position
    tooltip.style.left = `${(parseFloat(style.left, 10) + direction).toFixed(2)}px`;
    applyTooltipOverride(tooltip, 'left', direction);
  } else if (axis === 'y') { // flip vertically
    tooltip.classList.add('flip');
    // get current transformation matrix of the tooltip
    const matrix = new DOMMatrix(window.getComputedStyle(tooltip).transform);
    // apply new transformation to the tooltip to mirror it vertically
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

/**
 * Ensures the tooltip element stays within the given exterior bounding box.
 * @param {Object} exterior Bounding box of the exterior element
 * @param {Object} interior Bounding box of the interior element (tooltip)
 * @param {HTMLElement} tooltip Tooltip element to move (if outside the bounding box)
 */
function ensureTooltipInsideBoundingBox(exterior, interior, tooltip) {
  // check if tooltip fits within the left boundary of the exterior
  const fitsLeft = interior.left >= exterior.left;
  if (!fitsLeft) moveTooltip(tooltip, 'x', exterior.left - interior.left);
  // check if tooltip fits within the right boundary of the exterior
  const fitsRight = interior.right <= exterior.right;
  if (!fitsRight) moveTooltip(tooltip, 'x', exterior.right - interior.right);
  // check if tooltip fits within the top boundary of the exterior
  const fitsTop = interior.top >= exterior.top;
  if (!fitsTop) moveTooltip(tooltip, 'y');
}

/**
 * Positions the tooltip relative to the specified pin within the SVG element
 * @param {HTMLElement} tooltip Tooltip element to position
 * @param {HTMLElement} pin Pin element relative to which the tooltip will be positioned
 * @param {SVGElement} svg SVG element containing the pin
 */
function positionTooltip(tooltip, pin, svg) {
  // get the width and height of the SVG element
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  // get the 'cx' and 'cy' attributes of the pin and convert them to floats
  const cx = parseFloat(pin.getAttribute('cx'), 10);
  const cy = parseFloat(pin.getAttribute('cy'), 10);
  // set top and left position of the tooltip based on the pin's position within the SVG
  tooltip.style.top = `${100 * (cy / height)}%`;
  tooltip.style.left = `${100 * (cx / width)}%`;
  // get the bounding rectangles of the SVG and tooltip elements
  const svgRect = svg.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  // define a padding value to ensure the tooltip does not touch the edges of the SVG
  const SVG_PADDING = 6;
  // ensure the tooltip stays within the bounding box of the SVG, considering the padding
  ensureTooltipInsideBoundingBox({
    left: svgRect.left + SVG_PADDING,
    top: svgRect.top + SVG_PADDING,
    right: svgRect.right - SVG_PADDING,
  }, tipRect, tooltip);
}

/**
 * Focuses a pin, moving the pin to front of group and displaying the tooltip.
 * @param {HTMLElement} pin Pin element to focus.
 * @param {HTMLElement} tooltip Tooltip element to display label
 * @param {HTMLElement} svg SVG element containing the pins
 */
function focusPin(pin, tooltip, svg) {
  // move focused pin to front
  pin.parentElement.append(pin);
  pin.dataset.focus = true;
  // reset, rewrite, and reposition tooltip
  tooltip.classList = 'tooltip';
  tooltip.removeAttribute('style');
  applyTooltipOverride(svg.closest('.block'), 'reset');
  tooltip.textContent = pin.getAttribute('aria-label');
  positionTooltip(tooltip, pin, svg);
  tooltip.setAttribute('aria-hidden', false);
}

/**
 * Unfocuses the focused pin and hides the tooltip.
 * @param {HTMLElement} tooltip Tooltip element
 * @param {HTMLElement} svg SVG element containing the pins
 */
function unfocusPin(tooltip, svg) {
  const focused = svg.querySelector('[data-focus]');
  if (focused) focused.removeAttribute('data-focus');
  tooltip.removeAttribute('data-focus');
  tooltip.setAttribute('aria-hidden', true);
}

/**
 * Iterates through array of pins, focusing and unfocusing them in an infinite loop.
 * @param {HTMLElement[]} pins Array of pin elements
 * @param {HTMLElement} svg SVG element containing the pins
 * @param {HTMLElement} tooltip Tooltip element to display label
 * @param {number} [lastIndex = -1] The index of the last focused pin (to avoid repetition)
 */
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

/**
 * Enables hover interactions for a pin element.
 * @param {SVGCircleElement} pin Pin element to enable interaction
 * @param {HTMLElement} tooltip Tooltip element
 * @param {SVGElement} svg SVG map element containing the pins
 */
function enablePinInteractions(pin, tooltip, svg) {
  pin.addEventListener('mouseenter', () => focusPin(pin, tooltip, svg));
  pin.addEventListener('mouseleave', () => unfocusPin(tooltip, svg));
}

/**
 * Creates a pin element for a city based on its coordinates.
 * @param {Object} city City data
 * @param {number} width Width of the SVG
 * @param {number} height Height of the SVG
 * @param {number} longUnit Unit for longitude positioning
 * @param {number} latUnit Unit for latitude positioning
 * @returns {SVGCircleElement} Created pin element
 */
function createPin(city, width, height, longUnit, latUnit) {
  const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  pin.setAttribute('cx', ((width / 2) + (parseFloat(city.Longitude, 10) * longUnit)).toFixed(2));
  pin.setAttribute('cy', ((height / 2) - (parseFloat(city.Latitude, 10) * latUnit)).toFixed(2));
  const PIN_RADIUS = 33;
  pin.setAttribute('r', PIN_RADIUS);
  pin.setAttribute('aria-label', city.City);
  return pin;
}

/**
 * Fetches data from the given source and populates the SVG with pins representing cities.
 * @param {string} src URL to fetch the data from
 * @param {SVGElement} svg SVG element to populate with pins
 * @param {HTMLElement} tooltip Tooltip element to display pin label
 */
async function populateMap(src, svg, tooltip) {
  // create a group element to hold the pins separate from the map
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.id = 'availability-group';
  svg.append(group);
  // get the dimensions of the SVG
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  // calculate units for positioning pins based on latitude and longitude
  const longUnit = (width / 2) / 180; // where longitude range is -180° to 180°
  const latUnit = (height / 2) / 90; // where latitude range is -180° to 180°
  // fetch the cities data from the provided source
  const cities = await fetchData(src);
  // iterate over the cities data to create pins for each city
  cities.forEach((city) => {
    const pin = createPin(city, width, height, longUnit, latUnit);
    group.append(pin);
    enablePinInteractions(pin, tooltip, svg);
  });
  // auto-iterate through pins
  const pins = svg.querySelectorAll('circle');
  iterateThroughPins(pins, svg, tooltip);
  // disable auto-iteration when the user hovers over the SVG
  svg.addEventListener('mouseenter', () => {
    svg.dataset.auto = false;
  });
  // reenable auto-iteration when the user's hover leaves the SVG
  svg.addEventListener('mouseleave', () => {
    svg.dataset.auto = true;
    unfocusPin(tooltip, svg);
  });
}

export default function decorate(block) {
  // extract data source from the block
  const data = block.querySelector('a[href]');
  block.innerHTML = '';
  // create wrapper div element to position the tooltip
  const wrapper = createTag('div', { class: 'tooltip-wrapper' });
  // create an img element to load the SVG map
  const img = createTag('img', { src: '/blocks/availability/map.svg' });
  img.addEventListener('load', async () => {
    // after img load, fetch the SVG content from the img source
    const res = await fetch(img.src);
    const text = await res.text();
    // replace the img with the SVG element
    const temp = createTag('div');
    temp.innerHTML = text;
    const svg = temp.querySelector('svg');
    img.replaceWith(svg);
    // if data is available, initialize the tooltip and populate the SVG map with city data
    if (data) {
      const tooltip = createTag('div', {
        'aria-hidden': true,
        class: 'tooltip',
        id: 'availability-tooltip',
      });
      wrapper.prepend(tooltip);
      populateMap(data.href, svg, tooltip);
      svg.dataset.auto = true;
    }
  });
  wrapper.append(img);
  block.append(wrapper);
}
