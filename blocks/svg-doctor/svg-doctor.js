import { createTag } from '../../scripts/scripts.js';
import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';
import { createForm } from '../form/form.js';

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
  if (svgWidth) {
    svgWidth = cleanDimensionValue(svgWidth);
  }
  let svgHeight = svg.getAttribute('height');
  if (svgHeight) {
    svgHeight = cleanDimensionValue(svgHeight);
  }
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

function setupSVGDownload(form, block) {
  const downloadButton = form.querySelector('button');
  downloadButton.addEventListener('click', () => {
    const svg = block.querySelector('.preview > svg');
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
  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (specs.effect !== 'reset') {
      viewBox.dataset[specs.effect] = toClassName(specs.icon);
    } else resetForm(viewBox);
  });
  return button;
}

function buildPreviewControls(form, viewBox) {
  if (!form.querySelector('.controls')) {
    const controls = createTag('div', { class: 'controls', role: 'toolbar' });
    const darkBtn = buildControlButton({ label: 'Dark Mode', icon: 'dark', effect: 'mode' }, viewBox);
    const lightBtn = buildControlButton({ label: 'Light Mode', icon: 'light', effect: 'mode' }, viewBox);
    const buttonBtn = buildControlButton({ label: 'Button Display', icon: 'button', effect: 'display' }, viewBox);
    const imageBtn = buildControlButton({ label: 'Image Display', icon: 'image', effect: 'display' }, viewBox);
    const resetBtn = buildControlButton({ label: 'Reset Form', icon: 'reset', effect: 'reset' }, viewBox);
    controls.append(darkBtn, lightBtn, buttonBtn, imageBtn, resetBtn);
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
    viewBox.addEventListener('dragover', () => viewBox.classList.add('hover'));
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
          // disable form
          disableForm(block);
          // build preview controls
          buildPreviewControls(form, viewBox);
          // build doctor
          if (!block.querySelector('.form.specs')) {
            buildForm(template.href).then((doctor) => {
              block.append(doctor);
              populateForm(doctor, wrapper);
              setupSVGDownload(doctor, block);
            });
          } else {
            populateForm(block.querySelector('.form.specs'), wrapper);
          }
        });
        reader.readAsText(file);
      }
    });
    viewBox.append(upload);

    block.prepend(form);
  }
}
