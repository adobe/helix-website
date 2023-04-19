import '../../tools/sidekick/library/index.js';

export default function decorate(block) {
  const library = document.createElement('sidekick-library');
  block.replaceChildren(library);
}
