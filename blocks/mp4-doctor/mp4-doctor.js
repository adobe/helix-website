import { createTag } from '../../scripts/scripts.js';
import { loadScript, toClassName } from '../../scripts/lib-franklin.js';

function updatePreviewWrapper(wrapper, buffer, name) {
  const params = {};
  const { type } = wrapper.dataset;
  if (type === 'image/gif') {
    // mimic gif behavior
    params.autoplay = true;
    params.loop = true;
  } else {
    params.controls = true;
  }
  const video = createTag('video', params, createTag('source', {
    src: URL.createObjectURL(new Blob([buffer], { type: 'video/mp4' })),
    type: 'video/mp4',
    'data-name': name,
  }));
  wrapper.append(video);
}

function generatePreviewWrapper(file) {
  const { type } = file;
  const wrapper = createTag('div', { class: 'preview', 'data-type': type });
  const reader = new FileReader();
  reader.addEventListener('load', (e) => {
    const src = e.target.result;
    let placeholder = '';
    if (type === 'image/gif') {
      placeholder = createTag('img', { src, 'aria-hidden': true, 'data-type': type });
    } else if (type.startsWith('video')) {
      placeholder = createTag('video', { src, 'aria-hidden': true, 'data-type': type });
    }
    wrapper.append(placeholder);
    placeholder.addEventListener('load', () => {
      wrapper.style.minHeight = `${wrapper.offsetHeight}px`;
      placeholder.remove();
    });
    reader.readAsDataURL(file);
  });
  return wrapper;
}

// eslint-disable-next-line no-unused-vars
function setupSVGDownload(form, block) {
  const downloadButton = form.querySelector('button');
  downloadButton.addEventListener('click', async () => {
    const video = block.querySelector('.preview > video');
    const source = video.querySelector('source').src;
    const response = await fetch(source);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    // build temporary download link
    const a = createTag('a', {
      href: url,
      download: toClassName(video.dataset.title),
    });
    a.style.display = 'none';
    form.appendChild(a);
    a.click();
    // remove the temporary download link
    form.removeChild(a);
    URL.revokeObjectURL(url);
  });
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

function buildControlButton(specs, viewBox) {
  const button = createTag(
    'button',
    {
      class: 'button',
      role: 'button',
      'aria-label': specs.label,
      id: `mp4-doctor-${toClassName(specs.label)}`,
    },
    `<span class="glyph glyph-${specs.icon}">`,
  );
  button.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm(viewBox);
  });
  return button;
}

function populatePreviewControls(form, viewBox) {
  if (!form.querySelector('.controls .controls-buttons')) {
    // remove bar
    form.querySelector('.controls .progress').remove();
    // // build buttons
    const buttons = createTag('div', { class: 'controls-buttons' });
    const download = createTag('div', { class: 'controls-download form' });
    const downloadBtn = createTag('button', { type: 'button', class: 'button' }, 'Download');
    const resetBtn = buildControlButton({ label: 'Reset Form', icon: 'reset', effect: 'reset' }, viewBox);
    download.append(downloadBtn);
    buttons.append(download, resetBtn);
    setupSVGDownload(buttons, form.closest('.block'));
    form.querySelector('.controls').append(buttons);
  }
}

function buildPreviewControls(form) {
  if (!form.querySelector('.controls')) {
    const controls = createTag('div', { class: 'controls', role: 'toolbar' });
    const progress = createTag('div', { class: 'progress' });
    controls.prepend(progress);
    form.append(controls);
  }
}

export default function decorate(block) {
  // build form
  const form = createTag('form');

  // build preview
  const viewBox = createTag('div', { class: 'viewbox' });
  viewBox.dataset.status = 'upload';
  viewBox.addEventListener('dragleave', () => viewBox.classList.remove('hover'));
  const label = createTag('label', { for: 'upload' });
  label.innerHTML = `<span class='glyph glyph-upload'></span>
    <p>Click to upload a video or drag-and-drop one here</p>`;
  viewBox.append(label);
  form.append(viewBox);

  // build upload
  const upload = createTag('input', { type: 'file', name: 'upload' });
  upload.addEventListener('change', async () => {
    if (upload.files && upload.files[0]) {
      // read uploaded video file
      const file = upload.files[0];
      const { name, size } = file;
      const wrapper = generatePreviewWrapper(file);
      viewBox.append(wrapper);
      disableForm(block);
      buildPreviewControls(form, viewBox);
      const progressBar = form.querySelector('.controls .progress');

      // load ffmpeg
      loadScript('/blocks/mp4-doctor/assets/ffmpeg/package/dist/umd/ffmpeg.js').then(() => {
        loadScript('/blocks/mp4-doctor/assets/util/package/dist/umd/index.js').then(async () => {
          // eslint-disable-next-line no-undef
          const { fetchFile } = FFmpegUtil;
          // eslint-disable-next-line no-undef
          const { FFmpeg } = FFmpegWASM;
          let ffmpeg = null;
          // eslint-disable-next-line no-unused-vars
          let kB = Math.floor(size / 1024);

          if (ffmpeg === null) {
            ffmpeg = new FFmpeg();
            ffmpeg.on('log', ({ message }) => {
              const clean = message.trim();
              if (clean.startsWith('frame=')) {
                const stats = {};
                const split = clean.split(' ').filter((s) => s.trim()).map((s) => s.trim());
                split.forEach((s, i) => {
                  if (s.endsWith('=')) {
                    stats[s.slice(0, -1)] = split[i + 1];
                  } else if (s.includes('=')) {
                    const [key, value] = s.split('=');
                    if (value) stats[key.trim()] = value.trim();
                  }
                });
                const fileSize = stats.size || stats.Lsize;
                if (fileSize) kB = fileSize.replace('kB', '');
              }
            });
            ffmpeg.on('progress', ({ progress }) => {
              if (progressBar) progressBar.style.width = `${Math.floor(progress * 100)}%`;
            });
            await ffmpeg.load({
              coreURL: '/blocks/mp4-doctor/assets/core/package/dist/umd/ffmpeg-core.js',
            });
          }
          await ffmpeg.writeFile(name, await fetchFile(file));
          // console.log('Start transcoding');
          // console.time('exec');
          await ffmpeg.exec(['-i', name, 'output.mp4']);
          // console.timeEnd('exec');
          // console.log('Complete transcoding');
          const data = await ffmpeg.readFile('output.mp4');

          updatePreviewWrapper(wrapper, data.buffer, name);
          populatePreviewControls(form, viewBox);
          wrapper.dataset.name = file.name.slice(0, file.name.length - 4);
        });
      });
    }
  });
  viewBox.append(upload);

  block.prepend(form);
}
