import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createTag,
  loadFeedData,
  loadBlogData,
} from '../../scripts/scripts.js';

// logic for rendering the community feed
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

function isImgUrl(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

// logic to render blog list home page
export async function fetchBlogContent(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    doc.querySelectorAll('h1, h2, h3, h4, h5').forEach((heading) => {
      const nextLevel = `h${parseInt(heading.tagName[1], 10) + 1}`;
      const newHeading = document.createElement(nextLevel);
      newHeading.innerHTML = heading.innerHTML;
      heading.replaceWith(newHeading);
    });
    // render images as img tags rather than linka
    doc.querySelectorAll('a').forEach((link) => {
      const linkSrc = new URL(link.href);
      const { pathname } = linkSrc;
      if (isImgUrl(pathname)) {
        const imgName = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.lastIndexOf('.'));
        const img = createOptimizedPicture(pathname, imgName);
        link.parentElement.classList.add('image-wrapper');
        link.replaceWith(img);
      }
    });
    const content = doc.querySelector('body > main > div');
    return content ? content.innerHTML : '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blog content:', error);
    return '';
  }
}

export async function renderBlog(block) {
  if (!block) {
    return;
  }
  const blogIndex = window.blogindex.data;
  blogIndex.reverse();
  // Skip if block has favorite class
  if (block.classList.contains('favorite')) {
    return;
  }

  let parentDiv = block.querySelector('.blog-container');
  if (!parentDiv) {
    parentDiv = createTag('div', { class: 'blog-container' });
    block.appendChild(parentDiv);
  }

  let leftContainer = parentDiv.querySelector('.left-container');
  let rightContainer = parentDiv.querySelector('.right-container');

  if (!leftContainer) {
    leftContainer = createTag('div', { class: 'left-container' });
    parentDiv.appendChild(leftContainer);
  }
  if (!rightContainer) {
    rightContainer = createTag('div', { class: 'right-container' });
    parentDiv.appendChild(rightContainer);
  }
  rightContainer.innerHTML = '';

  // setting up the favorite blogs
  const favoriteFeedWrapper = document.querySelector('.feed-wrapper:has(.favorite)');
  if (favoriteFeedWrapper) {
    const favoriteDiv = favoriteFeedWrapper.querySelector('.favorite > div');
    favoriteDiv.classList.add('favorite-blogs');
    if (favoriteDiv) {
      favoriteDiv.querySelectorAll('a').forEach((link) => {
        link.classList.remove('button', 'primary');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
      rightContainer.appendChild(favoriteDiv);
      favoriteFeedWrapper.remove();
    }
  }

  // Get the latest blog
  const latestBlog = blogIndex[0];
  if (!leftContainer.querySelector('.blog-item.latest')) {
    const latestBlogItem = createTag('div', { class: 'blog-item latest' });
    const latestBlogContent = await fetchBlogContent(latestBlog.path);
    if (latestBlogContent) {
      // eslint-disable-next-line max-len
      const truncatedContent = latestBlogContent.substring(0, Math.floor(latestBlogContent.length * 0.80));
      latestBlogItem.innerHTML = truncatedContent;
    }

    const readMoreButton = createTag('a', { href: latestBlog.path, class: 'read-more button primary large' }, 'Read More');
    readMoreButton.addEventListener('click', () => {
      window.location.href = latestBlog.path;
    });
    latestBlogItem.appendChild(readMoreButton);

    leftContainer.appendChild(latestBlogItem);
  }

  // Get next 5 blogs in newest to oldest order
  const startIndex = 0;
  const endIndex = Math.min(startIndex + 5, blogIndex.length);
  const recentBlogs = blogIndex.slice(startIndex, endIndex).reverse();
  recentBlogs.forEach((page) => {
    const blogItem = createTag('div', { class: 'blog-item' });

    const h3 = createTag('h3', { class: 'title' }, page.title);
    blogItem.appendChild(h3);

    const desc = createTag('p', { class: 'desc' }, page.description);
    blogItem.appendChild(desc);

    const date = createTag('p', { class: 'date' }, page.publicationDate);
    blogItem.appendChild(date);

    const image = createTag('p', { class: 'image-wrapper' });
    const img = createTag('img', { src: page.image });
    image.appendChild(img);
    blogItem.appendChild(image);

    const blogLink = createTag('a', {
      href: page.path, target: '_blank', rel: 'noopener noreferrer', class: 'blog-link',
    });
    blogLink.appendChild(blogItem);

    rightContainer.appendChild(blogLink);
  });
}

export default async function decorate(block) {
  const isBlog = block.classList.contains('blog');

  if (isBlog) {
    loadBlogData();
  } else {
    loadFeedData();
  }

  const checkDataLoaded = () => {
    if (isBlog) {
      return window?.blogindex?.loaded;
    }
    return window?.siteindex?.loaded;
  };

  const renderFunction = isBlog ? renderBlog : renderFeed;

  if (!block.dataset.rendered) {
    if (checkDataLoaded()) {
      await renderFunction(block);
      block.dataset.rendered = 'true';
    } else {
      const div = createTag('div', { class: 'feed-hidden' }, '');
      block.append(div);
      document.addEventListener('dataset-ready', () => {
        if (checkDataLoaded() && !block.dataset.rendered) {
          renderFunction(block);
          block.dataset.rendered = 'true';
        }
      });
    }
  }
}
