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

export default function decorate($block) {
  const $a = $block.querySelector('a');
  const videoURL = $a.href;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        decorateVideoBlock($block, videoURL);
      }
    });
  });
  observer.observe($block);
}
