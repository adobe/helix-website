import '../../web-components/lazy-loader.js';

// Replace the block's content with model-viewer custom element
// inside a lazy-loader so that it's loaded delayed
export default function decorate($block) {
  const assetPrefix = '/blocks/model-viewer/assets';

  // First row of the block defines the model, second one the alt text
  const model = $block.querySelector(':scope > div > div ')?.textContent?.trim();
  const alt = $block.querySelector(':scope > div:nth-child(2) > div')?.textContent?.trim();

  // Need a template element for lazy-loader to work
  const loader = document.createElement('lazy-loader');
  loader.innerHTML = `
    <p class="remove">
      <em>If all goes well, this should be replaced by an interactive 3D model of Neil Armstrong's Spacesuit...</em>
    </p>
    <template>
      <script
        src='/web-components/google-model-viewer.min.js'
        type='module'
      ></script>
      <model-viewer
        alt="${alt}"
        ar='true'
        src='${assetPrefix}/${model}/3d-model.glb'
        environment-image='${assetPrefix}/${model}/environment-image.hdr'
        poster='${assetPrefix}/${model}/poster.webp'
        shadow-intensity=1
        camera-controls='true'
        touch-action='pan-y'
      ></model-viewer>
    </template>
  `;
  $block.replaceChildren(loader);
}
