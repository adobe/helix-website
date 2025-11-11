import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createTag, loadBlogData } from '../../scripts/scripts.js';

/**
 * Parses blog post HTML to extract hero image, author, and excerpt
 * @param {string} url - The URL of the blog post
 * @returns {Promise<{heroImage: string, author: string, excerpt: string}>}
 */
async function parseBlogPostDetails(url) {
  try {
    const response = await fetch(`${url}.plain.html`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract hero image (first image in the content)
    const heroImageElement = doc.querySelector('picture img, img');
    const heroImage = heroImageElement?.src || '';

    // Extract author from metadata or author-box block
    let author = '';
    const authorMeta = doc.querySelector('meta[name="author"]');
    if (authorMeta) {
      author = authorMeta.content;
    }

    // Extract excerpt (first 1-2 sentences from first paragraph after h1)
    let excerpt = '';
    const firstParagraph = doc.querySelector('h1 ~ p');
    if (firstParagraph) {
      const text = firstParagraph.textContent.trim();
      // Find first 2 sentence endings
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        excerpt = sentences.slice(0, 2).join(' ').trim();
      } else {
        // Fallback: use first 150 characters
        excerpt = text.substring(0, 150) + (text.length > 150 ? '...' : '');
      }
    }

    return { heroImage, author, excerpt };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error parsing blog post ${url}:`, error);
    return { heroImage: '', author: '', excerpt: '' };
  }
}

/**
 * Groups blog posts by year and month
 * @param {Array} posts - Array of blog post objects
 * @returns {Object} Grouped posts by year and month
 */
function groupByYearMonth(posts) {
  const grouped = {};

  posts.forEach((post) => {
    if (!post.publicationDate) return;

    const date = new Date(post.publicationDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    grouped[year][month].push(post);
  });

  return grouped;
}

/**
 * Creates a blog post card
 * @param {Object} post - Blog post data
 * @param {string} heroImage - Hero image URL
 * @param {string} author - Author name
 * @param {string} excerpt - Post excerpt
 * @returns {HTMLElement}
 */
function createBlogCard(post, heroImage, author, excerpt) {
  const card = createTag('a', {
    href: post.path,
    class: 'blog-archive-card',
  });

  // Hero image
  if (heroImage) {
    const imageContainer = createTag('div', { class: 'blog-archive-card-image' });
    const img = createTag('img', {
      src: heroImage,
      alt: post.title || '',
      loading: 'lazy',
    });
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);
  }

  // Content container
  const content = createTag('div', { class: 'blog-archive-card-content' });

  // Title
  const title = createTag('h3', { class: 'blog-archive-card-title' }, post.title || '');
  content.appendChild(title);

  // Date
  if (post.publicationDate) {
    const date = createTag('p', { class: 'blog-archive-card-date' }, post.publicationDate);
    content.appendChild(date);
  }

  // Author
  if (author) {
    const authorElement = createTag('p', { class: 'blog-archive-card-author' }, `By ${author}`);
    content.appendChild(authorElement);
  }

  // Excerpt
  if (excerpt) {
    const excerptElement = createTag('p', { class: 'blog-archive-card-excerpt' }, excerpt);
    content.appendChild(excerptElement);
  }

  card.appendChild(content);
  return card;
}

/**
 * Renders the blog archive
 * @param {HTMLElement} block - The block element
 */
async function renderBlogArchive(block) {
  const blogIndex = window.blogindex.data;

  // Filter posts with publication dates and sort newest first
  const publishedPosts = blogIndex
    .filter((post) => post.publicationDate)
    .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

  // Group by year and month
  const grouped = groupByYearMonth(publishedPosts);

  // Create container
  const container = createTag('div', { class: 'blog-archive-container' });

  // Sort years in descending order
  const years = Object.keys(grouped).sort((a, b) => b - a);

  for (const year of years) {
    // Year heading
    const yearSection = createTag('div', { class: 'blog-archive-year' });
    const yearHeading = createTag('h2', { class: 'blog-archive-year-title' }, year);
    yearSection.appendChild(yearHeading);

    // Month order (reverse chronological within year)
    const monthOrder = ['December', 'November', 'October', 'September', 'August', 'July',
      'June', 'May', 'April', 'March', 'February', 'January'];
    const months = Object.keys(grouped[year])
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

    for (const month of months) {
      const posts = grouped[year][month];

      // Month section
      const monthSection = createTag('div', { class: 'blog-archive-month' });
      const monthHeading = createTag('h3', { class: 'blog-archive-month-title' }, month);
      monthSection.appendChild(monthHeading);

      // Cards grid
      const cardsGrid = createTag('div', { class: 'blog-archive-cards' });

      // Fetch details for each post and create card
      for (const post of posts) {
        const { heroImage, author, excerpt } = await parseBlogPostDetails(post.path);
        const card = createBlogCard(post, heroImage, author, excerpt);
        cardsGrid.appendChild(card);
      }

      monthSection.appendChild(cardsGrid);
      yearSection.appendChild(monthSection);
    }

    container.appendChild(yearSection);
  }

  block.appendChild(container);
}

/**
 * Decorates the blog archive block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  // Load blog data
  loadBlogData();

  // Wait for blog data to load
  const checkDataLoaded = () => window?.blogindex?.loaded;

  if (!block.dataset.rendered) {
    if (checkDataLoaded()) {
      await renderBlogArchive(block);
      block.dataset.rendered = 'true';
    } else {
      document.addEventListener('dataset-ready', async () => {
        if (checkDataLoaded() && !block.dataset.rendered) {
          block.dataset.rendered = 'false';
          await renderBlogArchive(block);
          block.dataset.rendered = 'true';
        }
      });
    }
  }
}
