import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createTag,
  loadFeedData,
  loadBlogData,
  decorateGuideTemplateCodeBlock,
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

const CATEGORY_ORDER = ['Thursday Frequency', 'Developers Live', 'AEM Releases', 'Web Currents'];

function inferCategory(item) {
  const title = (item.Title || '').toLowerCase();
  const description = (item.Description || '').toLowerCase();

  if (title.includes('release 202') || title.includes('cloud service release')) return 'AEM Releases';
  if (title.includes('web currents') || description.includes('web currents')) return 'Web Currents';
  if (title.includes('developers live') || title.includes('devlive')) return 'Developers Live';
  if (title.includes('frequency')) return 'Thursday Frequency';
  if (description.includes('adobe developers live') || description.includes('developers live 202')) {
    return 'Developers Live';
  }

  return 'Thursday Frequency';
}

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('v') || u.pathname.split('/').pop();
  } catch {
    return null;
  }
}

function formatFeedDate(serial) {
  const epoch = new Date(1899, 11, 30);
  const d = new Date(epoch.getTime() + parseFloat(serial) * 86400000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export async function renderFeedCompact(block) {
  if (!block) {
    return;
  }

  const data = [...(window.siteindex?.archive?.data || [])]
    .sort((a, b) => parseFloat(b.Date) - parseFloat(a.Date));

  block.textContent = '';

  if (!data.length) {
    block.textContent = 'Unable to load recordings.';
    return;
  }

  const categories = {};
  data.forEach((item) => {
    const cat = inferCategory(item);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  const activeCats = CATEGORY_ORDER.filter((c) => categories[c]?.length > 0);

  const filterBar = createTag('div', { class: 'feed-filter' });
  const allChip = createTag('button', { class: 'feed-filter-chip active', 'data-filter': 'all' }, 'All');
  filterBar.appendChild(allChip);

  activeCats.forEach((cat) => {
    const chip = createTag('button', { class: 'feed-filter-chip', 'data-filter': cat }, cat);
    filterBar.appendChild(chip);
  });
  block.appendChild(filterBar);

  const groupsContainer = createTag('div', { class: 'feed-groups' });

  activeCats.forEach((cat) => {
    const group = createTag('div', { class: 'feed-group', 'data-category': cat });
    group.appendChild(createTag('h3', { class: 'feed-group-heading' }, cat));

    const grid = createTag('div', { class: 'feed-grid' });

    categories[cat].forEach((item) => {
      const videoId = getYouTubeId(item.URL);
      const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';

      const card = createTag('a', {
        class: 'feed-card',
        href: item.URL,
        target: '_blank',
        rel: 'noopener noreferrer',
      });

      const thumb = createTag('div', { class: 'feed-card-thumb' });
      if (thumbUrl) {
        thumb.appendChild(createTag('img', { src: thumbUrl, alt: '', loading: 'lazy' }));
      }
      card.appendChild(thumb);

      const info = createTag('div', { class: 'feed-card-info' });
      info.appendChild(createTag('strong', {}, item.Title));
      info.appendChild(createTag('span', { class: 'feed-card-date' }, formatFeedDate(item.Date)));
      card.appendChild(info);

      grid.appendChild(card);
    });

    group.appendChild(grid);
    groupsContainer.appendChild(group);
  });

  block.appendChild(groupsContainer);

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.feed-filter-chip');
    if (!chip) return;

    filterBar.querySelectorAll('.feed-filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');

    const { filter } = chip.dataset;
    groupsContainer.querySelectorAll('.feed-group').forEach((g) => {
      g.style.display = (filter === 'all' || g.dataset.category === filter) ? '' : 'none';
    });
  });
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

  // Sort blogs by publication date in descending order
  blogIndex.sort((a, b) => {
    const dateA = new Date(a.publicationDate);
    const dateB = new Date(b.publicationDate);
    return dateA - dateB;
  });

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

  // Get the latest blog (newest by publication date)
  const latestBlog = blogIndex[blogIndex.length - 1];
  if (!leftContainer.querySelector('.blog-item.latest')) {
    const latestBlogItem = createTag('div', { class: 'blog-item latest' });
    const latestBlogContent = await fetchBlogContent(latestBlog.path);
    if (latestBlogContent) {
      const targetLength = Math.floor(latestBlogContent.length * 0.70);

      // Find last sentence ending (., !, ?) before 70% mark
      const lastPeriod = latestBlogContent.lastIndexOf('.', targetLength);
      const lastExclamation = latestBlogContent.lastIndexOf('!', targetLength);
      const lastQuestion = latestBlogContent.lastIndexOf('?', targetLength);
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

      const truncatedContent = lastSentenceEnd > targetLength * 0.5
        ? latestBlogContent.substring(0, lastSentenceEnd + 1)
        : latestBlogContent.substring(0, targetLength);

      latestBlogItem.innerHTML = truncatedContent;
    }

    const readMoreButton = createTag('a', { href: latestBlog.path, class: 'read-more button primary large' }, 'Read More');
    readMoreButton.addEventListener('click', () => {
      window.location.href = latestBlog.path;
    });
    latestBlogItem.appendChild(readMoreButton);

    leftContainer.appendChild(latestBlogItem);
  }

  // Get next 5 blogs in newest to oldest order by publication date
  const startIndex = Math.max(0, blogIndex.length - 6);
  // Exclude the latest blog which is shown in left container
  const endIndex = blogIndex.length - 1;
  // Reverse to get newest to oldest
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
  const isCompact = block.classList.contains('compact');

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

  let renderFunction = renderFeed;
  if (isBlog) {
    renderFunction = renderBlog;
  } else if (isCompact) {
    renderFunction = renderFeedCompact;
  }

  if (!block.dataset.rendered) {
    if (checkDataLoaded()) {
      await renderFunction(block);
      block.dataset.rendered = 'true';
    } else {
      document.addEventListener('dataset-ready', () => {
        if (checkDataLoaded() && !block.dataset.rendered) {
          block.dataset.rendered = false;
          renderFunction(block).then(() => {
            decorateGuideTemplateCodeBlock();
            block.dataset.rendered = 'true';
          });
        }
      });
    }
  }
}
