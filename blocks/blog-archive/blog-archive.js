import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

const metadataCache = new Map();
const postDateCache = new Map();
const ORDINAL_SUFFIX_REGEX = /(\d+)(st|nd|rd|th)/gi;

function parseBlogDate(value) {
  if (!value) {
    return null;
  }
  const normalized = value
    .replace(ORDINAL_SUFFIX_REGEX, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  const withComma = normalized.replace(
    /([A-Za-z]+ \d{1,2})(\s)(\d{4})/,
    '$1, $3',
  );
  const parsedWithComma = Date.parse(withComma);
  if (!Number.isNaN(parsedWithComma)) {
    return new Date(parsedWithComma);
  }
  return null;
}

function getPostDate(post) {
  if (postDateCache.has(post.path)) {
    return postDateCache.get(post.path);
  }

  const parsed = parseBlogDate(post.publicationDate);
  let resolvedDate = parsed;

  if ((!resolvedDate || Number.isNaN(resolvedDate.getTime())) && post.lastModified) {
    const timestamp = Number(post.lastModified) * 1000;
    if (!Number.isNaN(timestamp)) {
      resolvedDate = new Date(timestamp);
    }
  }

  if (!resolvedDate || Number.isNaN(resolvedDate.getTime())) {
    resolvedDate = new Date();
  }

  postDateCache.set(post.path, resolvedDate);
  return resolvedDate;
}

function formatPostDate(post) {
  const date = getPostDate(post);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildExcerpt(doc) {
  const paragraphs = [...doc.querySelectorAll('main p')];
  const collected = [];

  for (let i = 0; i < paragraphs.length; i += 1) {
    const text = paragraphs[i].textContent.replace(/\s+/g, ' ').trim();
    if (text && !/^by\s/i.test(text)) {
      collected.push(text);
      const combined = collected.join(' ');
      const sentenceCount = combined.match(/[^.!?]+[.!?]?/g)?.length || 0;
      if (sentenceCount >= 2 || combined.length >= 280) {
        break;
      }
    }
  }

  if (!collected.length) {
    return '';
  }

  const combined = collected.join(' ');
  const sentences = combined.match(/[^.!?]+[.!?]?/g) || [combined];
  const trimmed = sentences.slice(0, 2).join(' ').trim();
  return trimmed.length > 320 ? `${trimmed.slice(0, 317)}…` : trimmed;
}

async function fetchBlogMetadata(post) {
  if (metadataCache.has(post.path)) {
    return metadataCache.get(post.path);
  }

  try {
    const response = await fetch(post.path);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const author = doc
      .querySelector('meta[name="author"], meta[property="article:author"]')
      ?.getAttribute('content')?.trim()
      || 'Adobe Team';

    const heroImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
      || doc.querySelector('.hero picture img')?.src
      || doc.querySelector('main picture img')?.src
      || null;

    const excerpt = buildExcerpt(doc);

    const metadata = {
      author,
      heroImage,
      excerpt,
    };
    metadataCache.set(post.path, metadata);
    return metadata;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching blog metadata for ${post.path}:`, error);
    const fallback = {
      author: 'Adobe Team',
      heroImage: null,
      excerpt: '',
    };
    metadataCache.set(post.path, fallback);
    return fallback;
  }
}

function groupPostsByDate(posts) {
  const grouped = new Map();

  posts.forEach((post) => {
    const date = getPostDate(post);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }
    const months = grouped.get(year);
    if (!months.has(monthIndex)) {
      months.set(monthIndex, {
        label: date.toLocaleString('en-US', { month: 'long' }),
        posts: [],
      });
    }
    months.get(monthIndex).posts.push(post);
  });

  return grouped;
}

function createPostCard(post, metadata) {
  const card = createTag('article', { class: 'blog-archive-card', role: 'listitem' });
  const cardLink = createTag('a', {
    href: post.path,
    class: 'blog-archive-card-link',
  });

  if (metadata.heroImage || post.image) {
    const imageContainer = createTag('div', { class: 'blog-archive-card-image' });
    const img = createOptimizedPicture(
      metadata.heroImage || post.image,
      post.title,
      false,
      [{ width: '400' }],
    );
    imageContainer.appendChild(img);
    cardLink.appendChild(imageContainer);
  }

  const content = createTag('div', { class: 'blog-archive-card-content' });
  const title = createTag('h4', { class: 'blog-archive-card-title' }, post.title);
  content.appendChild(title);

  const metaRow = createTag('div', { class: 'blog-archive-card-meta' });
  metaRow.appendChild(createTag('span', { class: 'blog-archive-card-date' }, formatPostDate(post)));

  if (metadata.author) {
    metaRow.appendChild(
      createTag('span', { class: 'blog-archive-card-author' }, `By ${metadata.author}`),
    );
  }
  content.appendChild(metaRow);

  const excerpt = metadata.excerpt || post.description || '';
  if (excerpt) {
    content.appendChild(createTag('p', { class: 'blog-archive-card-excerpt' }, excerpt));
  }

  cardLink.appendChild(content);
  card.appendChild(cardLink);
  return card;
}

export default async function decorate(block) {
  block.innerHTML = '';
  block.classList.add('blog-archive-loading');
  const loadingMessage = createTag('p', { class: 'blog-archive-loading-message' }, 'Loading blog archive...');
  block.appendChild(loadingMessage);

  try {
    const response = await fetch('/query-index.json');
    const data = await response.json();

    const blogPosts = (data?.data || [])
      .filter((entry) => entry.path?.startsWith('/blog/'))
      .filter((entry) => entry.path !== '/blog/archive');

    if (!blogPosts.length) {
      block.classList.remove('blog-archive-loading');
      block.innerHTML = '';
      block.appendChild(createTag('p', { class: 'blog-archive-error' }, 'No blog posts available yet.'));
      return;
    }

    blogPosts.sort((a, b) => getPostDate(b) - getPostDate(a));
    const groupedPosts = groupPostsByDate(blogPosts);

    block.innerHTML = '';
    block.classList.remove('blog-archive-loading');

    const archiveContainer = createTag('div', { class: 'blog-archive-container' });
    const years = Array.from(groupedPosts.keys()).sort((a, b) => b - a);

    years.forEach((year) => {
      const yearSection = createTag('section', { class: 'blog-archive-year' });
      const yearHeading = createTag('h2', { class: 'blog-archive-year-heading' }, year);
      yearSection.appendChild(yearHeading);

      const months = Array.from(groupedPosts.get(year).entries())
        .sort((a, b) => b[0] - a[0]);

      months.forEach(([, monthData]) => {
        const monthSection = createTag('div', { class: 'blog-archive-month' });
        const monthHeading = createTag('h3', { class: 'blog-archive-month-heading' }, monthData.label);
        monthSection.appendChild(monthHeading);

        const cardsGrid = createTag('div', {
          class: 'blog-archive-cards-grid',
          role: 'list',
        });

        monthData.posts
          .sort((a, b) => getPostDate(b) - getPostDate(a))
          .forEach((post) => {
            const fallbackMetadata = {
              author: '',
              heroImage: post.image,
              excerpt: post.description,
            };
            const placeholderCard = createPostCard(post, fallbackMetadata);
            cardsGrid.appendChild(placeholderCard);

            fetchBlogMetadata(post).then((metadata) => {
              const mergedMetadata = {
                ...fallbackMetadata,
                ...metadata,
                heroImage: metadata.heroImage || fallbackMetadata.heroImage,
                excerpt: metadata.excerpt || fallbackMetadata.excerpt,
                author: metadata.author || fallbackMetadata.author || 'Adobe Team',
              };
              const enhancedCard = createPostCard(post, mergedMetadata);
              placeholderCard.replaceWith(enhancedCard);
            });
          });

        monthSection.appendChild(cardsGrid);
        yearSection.appendChild(monthSection);
      });

      archiveContainer.appendChild(yearSection);
    });

    block.appendChild(archiveContainer);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading blog archive:', error);
    block.innerHTML = '';
    block.classList.remove('blog-archive-loading');
    const errorMessage = createTag('p', { class: 'blog-archive-error' }, 'Error loading blog archive. Please try again later.');
    block.appendChild(errorMessage);
  }
}
