export default function decorate(block) {
  block.querySelectorAll(':scope > div > div').forEach((column, i) => {
    column.classList.add('column');
    column.classList.add(i % 2 ? 'right' : 'left');
    const linkElement = column.querySelector('a');

    if (linkElement) {
      column.classList.add('link-highlight-colorful-effect-hover-wrapper');
      linkElement.classList.add('link-highlight-colorful-effect');

      column.addEventListener('click', () => {
        linkElement.click();
      });
    }
  });
}
