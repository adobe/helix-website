import { createTag } from '../../scripts/scripts.js';
import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';
import { createForm } from '../form/form.js';
import W3color from './w3color.js';

const COLOR_PROPERTIES = ['fill', 'stroke'];

function validateColor(value) {
  const color = W3color(value);
  return color.valid ? color : null;
}

function removeHash(hex) {
  return hex.replace('#', '');
}

function styleToObject(rules, mergeWith = {}) {
  // eslint-disable-next-line no-return-assign, no-sequences
  return [...rules].reduce((obj, rule) => (obj[rule] = rules[rule], obj), mergeWith);
}

function extractStyle(svg) {
  const style = svg.querySelector('style');
  if (style) {
    const clone = style.cloneNode(true);
    clone.title = 'SVG Stylesheet';
    document.head.append(clone);
    const sheet = [...document.styleSheets].find((ss) => ss.title === clone.title);
    if (sheet) {
      clone.remove();
      const cssObj = [...sheet.cssRules].reduce(
        // eslint-disable-next-line no-return-assign, max-len, no-sequences
        (obj, rule) => (obj[rule.selectorText] = styleToObject(rule.style, obj[rule.selectorText]), obj),
        {},
      );
      return cssObj;
    }
  }
  return {};
}

function parseInlineStyles(el, prop) {
  const style = el.getAttribute('style');
  if (style) {
    const styleObj = {};
    const styles = style.split(';');
    // eslint-disable-next-line consistent-return
    styles.forEach((s) => {
      const [property, value] = s.split(':');
      if (prop && prop === property.trim()) {
        return { prop: value.trim() };
      }
      if (COLOR_PROPERTIES.some((colorProp) => property.trim() === colorProp)) {
        styleObj[property.trim()] = value.trim();
      }
    });
    if (!prop && Object.keys(styleObj).length) return styleObj;
  }
  return {};
}

function findColorsInStylesheet(style) {
  const colors = {};
  Object.keys(style).forEach((selector) => {
    const properties = style[selector];
    Object.keys(properties).forEach((prop) => {
      if (COLOR_PROPERTIES.some((cp) => prop === cp)) {
        const value = properties[prop];
        const color = validateColor(value);
        if (color && !colors[removeHash(color.hex)]) {
          colors[removeHash(color.hex)] = {
            value,
            location: 'stylesheet',
            colors: color,
          };
        }
      }
    });
  });
  return colors;
}

function findColorsInInlineStyles(el, styles, colors) {
  Object.keys(styles).forEach((prop) => {
    if (COLOR_PROPERTIES.some((cp) => prop === cp)) {
      const value = styles[prop];
      const color = validateColor(value);
      if (color && !colors[removeHash(color.hex)]) {
        colors[removeHash(color.hex)] = {
          value,
          location: 'inline',
          el,
        };
      }
    }
  });
  return colors;
}

function findColorsInAttributes(el, colors = {}) {
  COLOR_PROPERTIES.forEach((prop) => {
    if (el.getAttribute(prop)) {
      const value = el.getAttribute(prop);
      const color = validateColor(value);
      if (color && !colors[removeHash(color.hex)]) {
        colors[removeHash(color.hex)] = {
          value,
          location: 'attribute',
          el,
          attr: prop,
        };
      }
    }
  });
  return colors;
}

function extractColors(svg) {
  let colors = {};

  // read stylesheet
  const stylesheet = extractStyle(svg);
  const styleColors = findColorsInStylesheet(stylesheet);
  if (Object.keys(styleColors).length) colors = { ...styleColors };

  // read inline styles
  const styledEls = svg.querySelectorAll('[style]');
  styledEls.forEach((el) => {
    const inlineStyles = parseInlineStyles(el);
    const inlineColors = findColorsInInlineStyles(el, inlineStyles, colors);
    if (Object.keys(inlineColors).length) colors = { ...colors, ...inlineColors };
  });

  // read attributes
  const elsWithAttrs = svg.querySelectorAll(COLOR_PROPERTIES.map((p) => `[${p}]`).join(', '));
  elsWithAttrs.forEach((el) => {
    const attrColors = findColorsInAttributes(el, colors);
    if (Object.keys(attrColors).length) colors = { ...colors, ...attrColors };
  });

  return colors;
}

function generateSVGWrapper(res) {
  const svgString = res.replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const dom = new DOMParser().parseFromString(svgString, 'text/xml');
  const svg = dom.querySelector('svg');
  const wrapper = createTag('div', { class: 'preview' }, svg);
  return wrapper;
}

function writeTitleFromFileName(name) {
  let title = '';
  toClassName(name).split('-').forEach((word) => {
    title += `${word[0].toUpperCase()}${word.slice(1)} `;
  });
  return title.trim();
}

function updateFormTitle(form, svg, wrapper) {
  const titleField = form.querySelector('#title');
  let svgTitle = svg.querySelector('title');
  titleField.value = svgTitle ? svgTitle.textContent : writeTitleFromFileName(wrapper.dataset.name);
  if (!svgTitle) {
    svgTitle = createTag('title', {}, titleField.value);
    svg.prepend(svgTitle);
  }
  titleField.addEventListener('keyup', (e) => {
    svgTitle.textContent = e.target.value;
  });
}

function cleanDimensionValue(dimension) {
  const numRegex = /[^0-9.]/g;
  let num = dimension.replace(numRegex, '');
  if (num.includes('.')) {
    const decimal = num.split('.')[1];
    if (decimal <= 0) num = parseInt(num, 10);
  }
  return num;
}

function updateFormDimensions(form, svg) {
  let viewBox = svg.getAttribute('viewBox');
  let svgWidth = svg.getAttribute('width');
  if (svgWidth) svgWidth = cleanDimensionValue(svgWidth);
  let svgHeight = svg.getAttribute('height');
  if (svgHeight) svgHeight = cleanDimensionValue(svgHeight);
  // if no viewbox, add viewbox
  if (!viewBox && svgWidth && svgHeight) {
    viewBox = `0 0 ${svgWidth} ${svgHeight}`;
    svg.setAttribute('viewBox', viewBox);
  } else if (!viewBox) viewBox = `0 0 ${svgWidth || 0} ${svgHeight || 0}`;
  const [,, width, height] = viewBox.split(' ');
  // set width
  const widthField = form.querySelector('#width');
  widthField.disabled = true;
  widthField.value = svgWidth === width ? svgWidth : width;
  if (width > 0) svg.setAttribute('width', widthField.value);
  // set height
  const heightField = form.querySelector('#height');
  heightField.value = svgHeight === height ? svgHeight : height;
  heightField.disabled = true;
  if (height > 0) svg.setAttribute('height', heightField.value);
}

function removeColorFallbacks(svg) {
  const fallbackPattern = /currentColor\/\*(.*?)\*\//;

  // remove stylesheet fallbacks
  const stylesheet = svg.querySelector('style');
  if (stylesheet) {
    const hasFallback = stylesheet.innerHTML.match(fallbackPattern);
    if (hasFallback) {
      const fallback = hasFallback[1];
      stylesheet.innerHTML = stylesheet.innerHTML.replaceAll(`/*${fallback}*/`, '');
    }
  }

  // remove inline style fallbacks
  svg.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style');
    const hasFallback = style.match(fallbackPattern);
    if (hasFallback) {
      const fallback = hasFallback[1];
      el.setAttribute('style', style.replaceAll(`/*${fallback}*/`, ''));
    }
  });

  // remove attribute fallbacks
  svg.querySelectorAll(COLOR_PROPERTIES.map((p) => `[${p}]`).join(', ')).forEach((el) => {
    const fill = el.getAttribute('fill');
    if (fill) {
      const hasFallback = fill.match(fallbackPattern);
      if (hasFallback) {
        const fallback = hasFallback[1];
        el.setAttribute('fill', fill.replaceAll(`/*${fallback}*/`, ''));
      }
    }
    const stroke = el.getAttribute('stroke');
    if (stroke) {
      const hasFallback = stroke.match(fallbackPattern);
      if (hasFallback) {
        const fallback = hasFallback[1];
        el.setAttribute('stroke', stroke.replaceAll(`/*${fallback}*/`, ''));
      }
    }
  });
}

function setupSVGDownload(form, block) {
  const downloadButton = form.querySelector('button');
  downloadButton.addEventListener('click', () => {
    const svg = block.querySelector('.preview > svg');
    removeColorFallbacks(svg);
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    // build temporary download link
    const a = createTag('a', {
      href: url,
      download: `${toClassName(svg.querySelector('title').textContent) || svg.parentElement.dataset.name}.svg`,
    });
    a.style.display = 'none';
    form.appendChild(a);
    a.click();
    // remove the temporary download link
    form.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function populateForm(form, wrapper) {
  const svg = wrapper.querySelector('svg');
  updateFormTitle(form, svg, wrapper);
  updateFormDimensions(form, svg);
}

function rewriteColor(svg, color, switchTo) {
  const { value, location } = color;

  if (location === 'stylesheet') {
    const stylesheet = svg.querySelector('style');
    const html = stylesheet.innerHTML;
    if (switchTo === 'current') {
      const replacements = [value, color.colors.hex];
      replacements.forEach((replacement) => {
        const regex = new RegExp(replacement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (regex.test(html)) {
          stylesheet.innerHTML = html.replaceAll(regex, `currentColor/*${value}*/`);
        }
      });
    } else if (switchTo === 'value') {
      stylesheet.innerHTML = html.replaceAll(`currentColor/*${value}*/`, value);
    }
  } else if (location === 'inline') {
    svg.querySelectorAll('[style]').forEach((el) => {
      const style = el.getAttribute('style');
      if (switchTo === 'current') {
        el.setAttribute('style', style.replaceAll(value, `currentColor/*${value}*/`));
      } else if (switchTo === 'value') {
        el.setAttribute('style', style.replaceAll(`currentColor/*${value}*/`, value));
      }
    });
  } else if (location === 'attribute') {
    svg.querySelectorAll(COLOR_PROPERTIES.map((p) => `[${p}]`).join(', ')).forEach((el) => {
      const match = [...el.attributes].some((attr) => attr.value.includes(color.value));
      if (match) {
        if (switchTo === 'current') {
          const attrColors = findColorsInAttributes(el);
          Object.keys(attrColors).forEach((hex) => {
            const { value: attrValue, attr } = attrColors[hex];
            el.setAttribute(attr, `currentColor/*${attrValue}*/`);
          });
        } else if (switchTo === 'value') {
          const fill = el.getAttribute('fill');
          if (fill) el.setAttribute('fill', value);
          const stroke = el.getAttribute('stroke');
          if (stroke) el.setAttribute('stroke', value);
        }
      }
    });
  }
}

function populatePalette(block, wrapper) {
  const palette = block.querySelector('.controls-palette');
  const svg = wrapper.querySelector('svg');

  const colors = extractColors(svg);
  Object.keys(colors).forEach((color) => {
    const swatch = createTag('div', {
      class: 'swatch',
      'data-state': 'graphic',
      'data-value': colors[color].value,
      style: `background-color: ${colors[color].value}`,
    });

    swatch.addEventListener('click', () => {
      // toggle state
      const isIcon = swatch.dataset.state === 'icon';
      if (isIcon) {
        // convert to graphic
        swatch.dataset.state = 'graphic';
        // update value and swatch
        rewriteColor(svg, colors[color], 'value');
        swatch.setAttribute('style', `background-color: ${swatch.dataset.value}`);
        swatch.classList.remove('icon');
      } else {
        // convert to icon
        swatch.dataset.state = 'icon';
        // update value and swatch
        rewriteColor(svg, colors[color], 'current');
        swatch.removeAttribute('style');
        swatch.classList.add('icon');
      }
    });

    palette.append(swatch);
  });

  const applyCurrentColorToChildren = (el) => {
    [...el.children].forEach((child) => {
      const computedStyles = window.getComputedStyle(child);
      const fill = computedStyles.getPropertyValue('fill');
      if (!validateColor(fill)) el.setAttribute('stroke', 'currentColor');
      else el.setAttribute('fill', 'currentColor');
      applyCurrentColorToChildren(child);
    });
  };

  if (!Object.keys(colors).length) {
    applyCurrentColorToChildren(svg);
  }
}

function resetForm(viewBox) {
  viewBox.dataset.status = 'upload';
  const block = viewBox.closest('.block');
  const label = block.querySelector('label[for="upload"]');
  if (label) {
    label.setAttribute('aria-hidden', false);
  }
  const upload = block.querySelector('input[name="upload"]');
  if (upload) {
    upload.disabled = false;
    upload.value = null;
  }
  const preview = block.querySelector('div.preview');
  if (preview) {
    preview.remove();
  }
  const controls = block.querySelector('div.controls');
  if (controls) {
    controls.setAttribute('aria-hidden', true);

    const palette = controls.querySelector('.controls-palette');
    if (palette) {
      [...palette.children].forEach((swatch) => swatch.remove());
    }
  }
  const specs = block.querySelector('div.form.specs');
  if (specs) {
    specs.setAttribute('aria-hidden', true);
  }
}

function disableForm(block) {
  const viewbox = block.querySelector('.viewbox');
  if (viewbox) {
    viewbox.classList.remove('hover');
    viewbox.dataset.status = 'preview';
  }
  const label = block.querySelector('label[for="upload"]');
  if (label) {
    label.setAttribute('aria-hidden', true);
  }
  const upload = block.querySelector('input[name="upload"]');
  if (upload) {
    upload.disabled = true;
  }
  const controls = block.querySelector('div.controls');
  if (controls) {
    controls.removeAttribute('aria-hidden');
  }
  const specs = block.querySelector('div.form.specs');
  if (specs) {
    specs.removeAttribute('aria-hidden');
  }
}

async function buildForm(url) {
  const doctor = createTag('div', { class: 'form specs' });
  const form = await createForm(url);
  loadCSS(`${window.hlx.codeBasePath}/blocks/form/form.css`);
  doctor.append(...form.children);
  return doctor;
}

function buildControlButton(specs, viewBox) {
  const button = createTag(
    'button',
    {
      class: 'button',
      role: 'button',
      'aria-label': specs.label,
      id: `svg-doctor-${toClassName(specs.label)}`,
    },
    `<span class="glyph glyph-${specs.icon}">`,
  );
  if (specs.checked !== null) button.setAttribute('aria-checked', specs.checked);
  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (specs.effect !== 'reset') {
      viewBox.dataset[specs.effect] = toClassName(specs.icon);
      const unchecked = button.getAttribute('aria-checked') === 'false';
      if (unchecked) {
        button.parentElement.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('aria-checked', false);
        });
        button.setAttribute('aria-checked', true);
      }
    } else resetForm(viewBox);
  });
  return button;
}

function buildPreviewControls(form, viewBox) {
  if (!form.querySelector('.controls')) {
    // build buttons
    const buttons = createTag('div', { class: 'controls-buttons' });
    const controls = createTag('div', { class: 'controls', role: 'toolbar' });
    const modes = createTag('div', { class: 'controls-mode' });
    const lightBtn = buildControlButton({
      label: 'Light Mode', icon: 'light', effect: 'mode', checked: true,
    }, viewBox);
    const darkBtn = buildControlButton({
      label: 'Dark Mode', icon: 'dark', effect: 'mode', checked: false,
    }, viewBox);
    const displays = createTag('div', { class: 'controls-display' });
    const imageBtn = buildControlButton({
      label: 'Image Display', icon: 'image', effect: 'display', checked: true,
    }, viewBox);
    const buttonBtn = buildControlButton({
      label: 'Button Display', icon: 'button', effect: 'display', checked: false,
    }, viewBox);
    const resetBtn = buildControlButton({ label: 'Reset Form', icon: 'reset', effect: 'reset' }, viewBox);
    modes.append(lightBtn, darkBtn);
    displays.append(imageBtn, buttonBtn);
    buttons.append(modes, displays, resetBtn);
    // build palette
    const palette = createTag('div', { class: 'controls-palette' });
    controls.append(buttons, palette);
    form.append(controls);
  }
}

export default function decorate(block) {
  const template = block.querySelector('a[href$=".json"]');
  if (template) {
    block.innerHTML = '';

    // build form
    const form = createTag('form');

    // build preview
    const viewBox = createTag('div', { class: 'viewbox' });
    viewBox.dataset.status = 'upload';
    viewBox.addEventListener('dragover', () => {
      viewBox.classList.add('hover');
      const preview = block.querySelector('.preview');
      if (preview) resetForm(viewBox);
    });
    viewBox.addEventListener('dragleave', () => viewBox.classList.remove('hover'));
    const label = createTag('label', { for: 'upload' });
    label.innerHTML = `<span class="glyph glyph-upload"></span>
      <p>Click to upload an SVG or drag-and-drop one here</p>`;
    viewBox.append(label);
    form.append(viewBox);

    // build upload
    const upload = createTag('input', { type: 'file', accept: '.svg', name: 'upload' });
    upload.addEventListener('change', () => {
      if (upload.files && upload.files[0]) {
        const file = upload.files[0];
        // read uploaded SVG file
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
          const wrapper = generateSVGWrapper(e.target.result);
          wrapper.dataset.name = file.name.slice(0, file.name.length - 4);
          viewBox.append(wrapper);
          disableForm(block);
          buildPreviewControls(form, viewBox);
          // build doctor
          if (!block.querySelector('.form.specs')) {
            buildForm(template.href).then((doctor) => {
              block.append(doctor);
              populateForm(doctor, wrapper);
              populatePalette(block, wrapper);
              setupSVGDownload(doctor, block);
            });
          } else {
            populateForm(block.querySelector('.form.specs'), wrapper);
            populatePalette(block, wrapper);
          }
        });
        reader.readAsText(file);
      }
    });
    viewBox.append(upload);

    block.prepend(form);
  }
}
