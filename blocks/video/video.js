import { sampleRUM } from '../../scripts/lib-franklin.js';

function decorateVideoBlock($block, videoURL) {
  if (videoURL.endsWith('.mp4')) {
    let attrs = '';
    attrs = 'playsinline controls';
    if ($block.classList.contains('autoplay')) attrs = 'playsinline controls muted autoplay loop';
    $block.innerHTML = /* html */`
      <div class="vid-wrapper">
        <video ${attrs} name="media"><source src="${videoURL}" type="video/mp4"></video>
      </div>
      `;
    $block.querySelector('video').addEventListener('play', (e) => {
      sampleRUM('play', {
        source: e.target.currentSrc,
      });
    });
  }
}

function decorateVideoWithPoster($block, videoURL, $picture) {
  $block.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'vid-wrapper vid-placeholder';
  wrapper.append($picture);

  const playBtn = document.createElement('button');
  playBtn.className = 'vid-play-btn';
  playBtn.setAttribute('aria-label', 'Play video');
  wrapper.append(playBtn);

  const img = $picture.querySelector('img');
  const posterSrc = img.src;
  const handleClick = () => {
    wrapper.removeEventListener('click', handleClick);
    wrapper.classList.remove('vid-placeholder');
    wrapper.style.aspectRatio = `${img.clientWidth} / ${img.clientHeight}`;
    let attrs = 'playsinline controls autoplay';
    if ($block.classList.contains('autoplay')) attrs = 'playsinline controls muted autoplay loop';
    wrapper.innerHTML = `<video ${attrs} name="media" poster="${posterSrc}" style="width:100%;height:100%"><source src="${videoURL}" type="video/mp4"></video>`;
    const video = wrapper.querySelector('video');
    video.addEventListener('loadedmetadata', () => {
      wrapper.style.aspectRatio = '';
      video.style.height = '';
    }, { once: true });
    video.addEventListener('play', (e) => {
      sampleRUM('play', { source: e.target.currentSrc });
    });
  };
  wrapper.addEventListener('click', handleClick);

  $block.append(wrapper);
}

export default function decorate($block) {
  const $a = $block.querySelector('a');
  const videoURL = $a.href;
  const $picture = $block.querySelector('picture');

  if ($picture && videoURL.endsWith('.mp4')) {
    decorateVideoWithPoster($block, videoURL, $picture);
  } else {
    decorateVideoBlock($block, videoURL);
  }
}
