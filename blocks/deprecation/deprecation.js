export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = 'Deprecation notice';
  block.prepend(header);
}
