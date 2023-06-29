import createTag from '../../utils/tag.js';
import { returnLinkTarget } from '../../utils/helpers.js';

const extractCustomerInfo = (detailContainer) => {
  const customerInfo = createTag('div', {
    class: 'customer-info',
  }, '');

  const icon = detailContainer.querySelector('img');
  if (icon) {
    customerInfo.append(icon);
  }

  const titles = detailContainer.querySelectorAll('h5');
  if (titles) {
    let titlesHTML = '';
    titles.forEach((title) => {
      titlesHTML += `<h5> ${title.innerHTML} </h5>`;
    });
    const titlesDiv = createTag('div', {
      class: 'titles',
    }, titlesHTML);
    customerInfo.append(titlesDiv);
  }

  const cta = detailContainer.querySelector('a');
  if (cta) {
    cta.classList.add('button', 'secondary');
    cta.setAttribute('target', returnLinkTarget(cta.href));
    customerInfo.append(cta);

    const titleContainer = customerInfo.querySelector('.titles');
    if (!titleContainer || titleContainer.innerHTML.trim() === '') {
      cta.classList.add('align-desktop-right');
    }
  }

  return customerInfo;
};

export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((div) => {
      const picture = div.querySelector('picture');
      const hasTitle = div.querySelector('h1,h2,h3,h4,h5,h6');

      if (hasTitle) {
        div.classList.add('info-side');
        // restyle for marquee.testimonial
        if (block.classList.contains('testimonial')) {
          const description = div.querySelectorAll('h4');
          const intro = description[0];
          const quote = description[1];

          const customerInfo = extractCustomerInfo(div);
          const statistics = div.querySelector('ul');

          const testimonial = createTag('div', {
            class: 'testimonial-info',
          }, '');
          if (intro) { testimonial.append(intro); }
          if (quote) { testimonial.append(quote); }
          if (customerInfo) { testimonial.append(customerInfo); }
          if (statistics) { testimonial.append(statistics); }
          div.replaceWith(testimonial);
        }
      } else if (picture) {
        div.classList.add('image-side');
      }
    });
  });
}
