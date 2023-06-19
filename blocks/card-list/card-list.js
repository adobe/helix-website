import { createOptimizedPicture, createTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    const link = li.querySelector('a');
    if (link) {
      const tag = createTag('a', { href: link.getAttribute('href'), class: 'card-wrapper' });
      link.parentElement.innerHTML = link.innerHTML;
      [...li.childNodes].forEach((child) => {
        tag.append(child);
      });

      // for highlight effect
      const cardTitle = tag.querySelector('h3');
      const span = createTag('span', { class: 'link-highlight-colorful-effect-2' }, cardTitle.textContent);
      cardTitle.replaceChildren(span);
      tag.classList.add('link-highlight-colorful-effect-hover-wrapper');

      li.append(tag);
    }
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
