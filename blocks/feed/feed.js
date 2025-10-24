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

function isImgUrl(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

const ORDINAL_SUFFIX_REGEX = /\b(\d+)(st|nd|rd|th)\b/g;

function getEntryDate(entry) {
  if (entry.publicationDate) {
    const normalized = entry.publicationDate.replace(ORDINAL_SUFFIX_REGEX, '$1');
    const parsedDate = new Date(normalized);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  if (entry.lastModified) {
    const lastModifiedMs = Number(entry.lastModified) * 1000;
    if (!Number.isNaN(lastModifiedMs)) {
      return new Date(lastModifiedMs);
    }
  }

  return null;
}

function formatEntryDisplayDate(entryDate, entry) {
  if (entryDate) {
    return entryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return entry.publicationDate || '';
}

function sortYearsDescending(years) {
  return years.sort((a, b) => {
    if (a === 'undated') return 1;
    if (b === 'undated') return -1;
    return Number(b) - Number(a);
  });
}

function renderArchivePosts(container, posts) {
  container.innerHTML = '';

  if (!posts.length) {
    const emptyState = createTag('p', { class: 'archive-empty-message' }, 'No posts match your filters.');
    container.appendChild(emptyState);
    return;
  }

  const postsByYear = posts.reduce((acc, post) => {
    const yearKey = post.year || 'undated';
    acc[yearKey] = acc[yearKey] || [];
    acc[yearKey].push(post);
    return acc;
  }, {});

  const sortedYears = sortYearsDescending(Object.keys(postsByYear));

  sortedYears.forEach((year) => {
    const yearSection = createTag('section', { class: 'archive-group', 'data-year': year });
    const headingText = year === 'undated' ? 'Undated' : year;
    const yearHeading = createTag('h2', { class: 'archive-year-heading' }, headingText);
    yearSection.appendChild(yearHeading);

    const list = createTag('ul', { class: 'archive-list' });
    postsByYear[year]
      .sort((a, b) => {
        if (a.date && b.date) {
          return b.date.getTime() - a.date.getTime();
        }
        if (a.date) return -1;
        if (b.date) return 1;
        return a.title.localeCompare(b.title);
      })
      .forEach((post) => {
        const listItem = createTag('li', { class: 'archive-item' });
        const article = createTag('article', { class: 'archive-article' });

        if (post.displayDate) {
          const dateEl = createTag('p', { class: 'archive-item-date' }, post.displayDate);
          article.appendChild(dateEl);
        }

        const titleHeading = createTag('h3', { class: 'archive-item-title' });
        const titleLink = createTag('a', {
          href: post.path,
          class: 'archive-item-link',
          rel: 'bookmark',
        }, post.title);
        titleHeading.appendChild(titleLink);
        article.appendChild(titleHeading);

        if (post.description) {
          const descriptionEl = createTag('p', { class: 'archive-item-desc' });
          descriptionEl.textContent = post.description;
          article.appendChild(descriptionEl);
        }

        listItem.appendChild(article);
        list.appendChild(listItem);
      });

    yearSection.appendChild(list);
    container.appendChild(yearSection);
  });
}

export async function renderBlogArchive(block) {
  if (!block) {
    return;
  }

  const blogIndex = window.blogindex?.data || [];
  if (!blogIndex.length) {
    const emptyState = createTag('p', { class: 'archive-empty-message' }, 'No blog posts available yet.');
    block.appendChild(emptyState);
    return;
  }

  const enhancedPosts = blogIndex.map((entry) => {
    const date = getEntryDate(entry);
    return {
      ...entry,
      date,
      displayDate: formatEntryDisplayDate(date, entry),
      year: date ? String(date.getFullYear()) : 'undated',
      titleLower: entry.title ? entry.title.toLowerCase() : '',
      descriptionLower: entry.description ? entry.description.toLowerCase() : '',
    };
  });

  const posts = enhancedPosts.sort((a, b) => {
    if (a.date && b.date) {
      return b.date.getTime() - a.date.getTime();
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  const years = sortYearsDescending(Array.from(
    new Set(posts.map((post) => post.year || 'undated')),
  ));

  block.innerHTML = '';

  const archiveContainer = createTag('div', { class: 'archive-container' });
  const controlsWrapper = createTag('div', { class: 'archive-controls' });
  const countEl = createTag('p', { class: 'archive-count', 'aria-live': 'polite' });
  const groupsWrapper = createTag('div', { class: 'archive-groups' });

  const searchForm = createTag('form', { class: 'archive-search', role: 'search' });
  searchForm.addEventListener('submit', (event) => event.preventDefault());
  const searchLabel = createTag('label', {
    for: 'archive-search-input',
    class: 'sr-only',
  }, 'Search blog posts');
  const searchInput = createTag('input', {
    id: 'archive-search-input',
    type: 'search',
    placeholder: 'Search posts',
    'aria-label': 'Search blog posts',
  });
  searchForm.append(searchLabel, searchInput);
  controlsWrapper.appendChild(searchForm);

  let activeYear = 'all';
  let searchTerm = '';

  function applyFilters() {
    const filtered = posts.filter((post) => {
      const matchesYear = activeYear === 'all' || post.year === activeYear;
      const matchesTerm = !searchTerm
        || post.titleLower.includes(searchTerm)
        || post.descriptionLower.includes(searchTerm);
      return matchesYear && matchesTerm;
    });
    countEl.textContent = filtered.length === 1
      ? 'Showing 1 post'
      : `Showing ${filtered.length} posts`;
    renderArchivePosts(groupsWrapper, filtered);
  }

  if (years.length > 1 || years[0] !== 'undated') {
    const filtersWrapper = createTag('div', {
      class: 'archive-filters',
      role: 'toolbar',
      'aria-label': 'Filter posts by year',
    });

    const createFilterButton = (year, label) => {
      const isActive = year === activeYear;
      const button = createTag('button', {
        type: 'button',
        'data-year': year,
        class: `archive-filter${isActive ? ' archive-filter-active' : ''}`,
        'aria-pressed': isActive ? 'true' : 'false',
      }, label);
      button.addEventListener('click', () => {
        if (activeYear === year) {
          return;
        }
        activeYear = year;
        filtersWrapper.querySelectorAll('button').forEach((btn) => {
          const btnYear = btn.dataset.year;
          const isBtnActive = btnYear === activeYear;
          btn.classList.toggle('archive-filter-active', isBtnActive);
          btn.setAttribute('aria-pressed', isBtnActive ? 'true' : 'false');
        });
        applyFilters();
      });
      return button;
    };

    filtersWrapper.appendChild(createFilterButton('all', 'All years'));
    years.forEach((year) => {
      const label = year === 'undated' ? 'Undated' : year;
      filtersWrapper.appendChild(createFilterButton(year, label));
    });

    controlsWrapper.appendChild(filtersWrapper);
  }

  archiveContainer.appendChild(controlsWrapper);
  archiveContainer.appendChild(countEl);
  archiveContainer.appendChild(groupsWrapper);
  block.appendChild(archiveContainer);

  searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  applyFilters();
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
  const isBlogArchive = isBlog && block.classList.contains('archive');

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

  let renderFunction;
  if (isBlogArchive) {
    renderFunction = renderBlogArchive;
  } else if (isBlog) {
    renderFunction = renderBlog;
  } else {
    renderFunction = renderFeed;
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
