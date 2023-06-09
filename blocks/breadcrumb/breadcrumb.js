import createTag from '../../utils/tag.js';
import { getMetadata } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // breadcrumb only exist on guides templates
  if (!document.body.classList.contains('guides-template')) {
    const breadcrumb = document.querySelector('.breadcrumb-wrapper');
    breadcrumb.remove();
    return;
  }

  // TODO: update for launch
  const root = '/drafts/redesign/';
  const isDocumentationLanding = window.location.pathname.includes(`${root}documentation`);

  const list = createTag('ul');
  const home = createTag('li', {}, `<a href="${root}new-home" class="breadcrumb-link-underline-effect">Home</a>`);
  const docs = createTag('li', {}, `<a href="${root}documentation" class="breadcrumb-link-underline-effect">Documentation</a>`);

  list.append(home);
  list.append(docs);

  const category = getMetadata('category');
  const title = getMetadata('og:title');

  if (category) {
    const section = createTag(
      'li',
      {},
      `<a href="${root}documentation#${category.toLowerCase()}" class="breadcrumb-link-underline-effect">${category}</a>`,
    );
    list.append(section);
  }

  if (!isDocumentationLanding) {
    const article = createTag('li', {}, `<a href="${window.location.pathname}">${title}</a>`);
    list.append(article);

    const backBtn = createTag('div', { class: 'guides-back-btn' }, `
        <span class="icon icon-icon-arrow"></span>
        <a href="${root}documentation" class="breadcrumb-link-underline-effect">
            Back
        </a>
    `);
    document.querySelector('.default-content-wrapper').prepend(backBtn);
  }

  // make the last item to be unclickable as already on the page
  const listLinks = list.querySelectorAll('a');
  const lastLinkItem = listLinks[listLinks.length - 1];
  lastLinkItem.classList.remove('breadcrumb-link-underline-effect');
  lastLinkItem.style.cursor = 'default';
  lastLinkItem.addEventListener('click', (e) => e.preventDefault());

  block.classList.add('contained');
  if (isDocumentationLanding) {
    block.parentElement.classList.add('no-shadow');
  }

  const innerDiv = block.querySelector(':scope > div > div');
  innerDiv.append(list);
}
