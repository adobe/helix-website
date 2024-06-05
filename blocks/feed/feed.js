import {
  createTag,
  loadFeedData,
} from '../../scripts/scripts.js';

export async function renderFeed(block) {
  if (!block) {
    return;
  }
  const archivePageIndex = window.siteindex.archive.data;
  archivePageIndex.reverse();
  const parentDiv = createTag('div');
  let gridDiv;

  archivePageIndex.forEach((page, index) => {
    if (index % 3 === 0) {
      gridDiv = createTag('div');
    }

    const div = createTag('div', { class: 'feed-item' });

    const h3 = createTag('h3', { class: 'title' }, page.Title);
    div.appendChild(h3);

    const desc = createTag('p', { class: 'desc' }, page.Description);
    div.appendChild(desc);

    const title = createTag('p', { class: 'link' });
    const a = createTag('a', {
      href: page.URL, target: '_blank',
    }, page.Title);
    title.appendChild(a);
    div.appendChild(title);

    const image = createTag('p', { class: 'image-wrapper-el' });

    // Extract image id from page.URL
    const id = page.URL.split('=')[1];
    const img = createTag('img', { src: `https://img.youtube.com/vi/${id}/0.jpg` });
    image.appendChild(img);
    div.appendChild(image);

    gridDiv.appendChild(div);
    if (index % 3 === 2 || index === archivePageIndex.length - 1) {
      parentDiv.appendChild(gridDiv);
    }
  });
  block.appendChild(parentDiv);
}

export default async function decorate(block) {
  loadFeedData();
  if (window?.siteindex?.loaded) {
    await renderFeed(block);
  } else {
    const div = createTag('div', { class: 'feed-hidden' }, '');
    block.append(div);
    document.addEventListener('dataset-ready', () => renderFeed(block));
  }
}
