export default function decorate(block) {
  block.querySelectorAll(':scope > div > div').forEach((column, i) => {
    column.classList.add('column');
    column.classList.add(i % 2 ? 'right' : 'left');
  });
}
