export default function decorate(block) {
  const classes = ['one', 'two', 'three', 'four', 'five'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });
  const row = block.children[0];
  if (row) {
    block.classList.add(classes[row.children.length - 1]);
  }
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!cell.previousElementSibling) cell.classList.add('columns-left');
    if (!cell.nextElementSibling) cell.classList.add('columns-right');

    const img = cell.querySelector('img');
    if (img) {
      cell.classList.add('columns-image');
      observer.observe(img);
    } else {
      cell.classList.add('columns-content');
      const wrapper = document.createElement('div');
      wrapper.className = 'columns-content-wrapper';
      while (cell.firstChild) wrapper.append(cell.firstChild);
      cell.append(wrapper);
    }
  });
}
