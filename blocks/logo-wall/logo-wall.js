import createTag from '../../utils/tag.js';
import { addInViewAnimationToMultipleElements } from '../../utils/helpers.js';

const animationConfig = {
  staggerTime: 0.4,
  items: [
    {
      selector: '.logo-wall-title',
      animatedClass: 'slide-reveal-up',
    },
    {
      selector: '.logo-wall-list',
      animatedClass: 'fade-up',
    },
  ],
};

export default function decorate(block) {
  block.classList.add('contained');

  const logoWallList = document.createElement('ul');
  logoWallList.setAttribute('class', 'logo-wall-list');

  [...block.children].forEach((row) => {
    [...row.children].forEach((div) => {
      const title = div.querySelector('h1,h2,h3,h4,h5,h6');
      const picture = div.querySelector('picture');
      const svg = div.querySelector('a[href$=".svg"]');
      const listItem = document.createElement('li');

      if (title) {
        title.setAttribute('class', 'logo-wall-title');
        row.replaceWith(title);
      } else if (svg) {
        const svgHref = new URL(svg.href).pathname;
        const linkEl = div.querySelectorAll('a')[1];
        listItem.setAttribute('class', 'logo-wall-list-item');

        const svgEl = createTag('img', {
          src: svgHref,
          alt: linkEl.textContent,
          class: 'logo-wall-item-svg',
        });

        if (linkEl) {
          const svgLink = createTag('a', {
            href: linkEl.href,
            title: linkEl.title,
            target: '_blank',
            class: 'logo-wall-item-link',
            'aria-label': linkEl.textContent,
          }, svgEl);

          listItem.append(svgLink);
          logoWallList.append(listItem);
          row.remove();
        }
      } else if (picture) {
        listItem.setAttribute('class', 'logo-wall-list-item');

        const linkEl = div.querySelector('a');
        if (linkEl) {
          const pictureLink = createTag('a', {
            href: linkEl.href,
            title: linkEl.title,
            target: '_blank',
            class: 'logo-wall-item-link',
            'aria-label': linkEl.textContent,
          }, picture);

          listItem.append(pictureLink);
        }

        logoWallList.append(listItem);
        row.remove();
      }
    });
  });
  block.append(logoWallList);

  if (block.classList.contains('inview-animation')) {
    addInViewAnimationToMultipleElements(animationConfig.items, block, animationConfig.staggerTime);
  }
}
