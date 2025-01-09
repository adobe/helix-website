export default function decorate(block) {
  const h3 = block.querySelector('h3');
  let title = '';
  if (h3) {
    title = h3.textContent;
    h3.remove();
  } else {
    title = 'Deprecation notice';
  }
  const header = document.createElement('div');
  header.className = 'header';
  header.textContent = title;
  block.prepend(header);
}
