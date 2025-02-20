export default function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });

  const classes = ['one', 'two', 'three', 'four', 'five'];
  const row = block.children[0];
  if (row) {
    if (classes[row.children.length - 1]) block.classList.add(classes[row.children.length - 1]);
  }
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (cell.firstChild) {
      const details = document.createElement('div');
      details.classList.add('cards-card-details');
      cell.classList.add('cards-card');
      while (cell.firstChild) details.append(cell.firstChild);
      const picture = details.querySelector('picture');
      if (picture) {
        cell.prepend(picture);
      } else if (details.querySelector('h3')) {
        cell.classList.add('cards-card-highlight');
      }
      // highlight styling
      const links = details.querySelectorAll('a');
      links.forEach((link) => {
        link.className = 'link-highlight-colorful-effect-hover-wrapper';
        link.innerHTML = `<span class="link-highlight-colorful-effect-2">${link.textContent}</span>`;
      });
      cell.append(details);
      observer.observe(cell);
    }
  });
}
