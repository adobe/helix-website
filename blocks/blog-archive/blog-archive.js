import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createTag,
  loadBlogData,
} from '../../scripts/scripts.js';

/**
 * Fetch and parse blog post content to extract additional metadata
 * @param {string} url - Blog post URL
 * @returns {Promise} Object with author, hero image, and excerpt
 */
async function fetchBlogPostDetails(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract author from author-box block
    const authorBox = doc.querySelector('.author-box');
    let author = '';
    if (authorBox) {
      const authorName = authorBox.querySelector('.author-name, h3, h4');
      author = authorName ? authorName.textContent.trim() : '';
    }

    // Extract hero image - look for the first image in the main content
    const mainContent = doc.querySelector('main') || doc.querySelector('body');
    const heroImage = mainContent.querySelector('img');
    const heroImageSrc = heroImage ? heroImage.src : '';

    // Extract excerpt - first paragraph or first 200 characters
    const firstParagraph = mainContent.querySelector('p');
    let excerpt = '';
    if (firstParagraph) {
      excerpt = firstParagraph.textContent.trim();
      if (excerpt.length > 200) {
        excerpt = `${excerpt.substring(0, 200).trim()}...`;
      }
    }

    return {
      author,
      heroImage: heroImageSrc,
      excerpt,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching blog post details for ${url}:`, error);
    return {
      author: '',
      heroImage: '',
      excerpt: '',
    };
  }
}

/**
 * Group blog posts by year and month
 * @param {Array} posts - Array of blog posts
 * @returns {Object} Posts grouped by year and month
 */
function groupPostsByYearAndMonth(posts) {
  const grouped = {};

  posts.forEach((post) => {
    const date = new Date(post.publicationDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

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
 * Create a blog post card element
 * @param {Object} post - Blog post data
 * @returns {HTMLElement} Card element
 */
async function createBlogPostCard(post) {
  const card = createTag('div', { class: 'blog-post-card' });

  // Fetch additional details from the blog post page
  const details = await fetchBlogPostDetails(post.path);

  // Hero image
  if (details.heroImage || post.image) {
    const imageWrapper = createTag('div', { class: 'card-image' });
    const img = createOptimizedPicture(details.heroImage || post.image, post.title, false, [{ width: '400' }]);
    imageWrapper.appendChild(img);
    card.appendChild(imageWrapper);
  }

  // Content wrapper
  const content = createTag('div', { class: 'card-content' });

  // Title
  const title = createTag('h3', { class: 'card-title' }, post.title);
  content.appendChild(title);

  // Metadata
  const metadata = createTag('div', { class: 'card-metadata' });

  // Date
  const date = new Date(post.publicationDate);
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const dateEl = createTag('span', { class: 'card-date' }, dateStr);
  metadata.appendChild(dateEl);

  // Author
  const author = details.author || post.author || 'Unknown Author';
  const authorEl = createTag('span', { class: 'card-author' }, `By ${author}`);
  metadata.appendChild(authorEl);

  content.appendChild(metadata);

  // Excerpt
  const excerpt = details.excerpt || post.description || '';
  if (excerpt) {
    const excerptEl = createTag('p', { class: 'card-excerpt' }, excerpt);
    content.appendChild(excerptEl);
  }

  // Read more link
  const readMore = createTag('a', {
    href: post.path,
    class: 'card-read-more',
    'aria-label': `Read more about ${post.title}`,
  }, 'Read More →');
  content.appendChild(readMore);

  card.appendChild(content);

  return card;
}

/**
 * Create year section with grouped posts
 * @param {string} year - Year string
 * @param {Object} yearData - Posts grouped by month
 * @returns {HTMLElement} Year section element
 */
async function createYearSection(year, yearData) {
  const yearSection = createTag('div', { class: 'archive-year' });

  // Year header
  const yearHeader = createTag('h2', { class: 'archive-year-header' }, year);
  yearSection.appendChild(yearHeader);

  // Sort months in chronological order (newest first)
  const months = Object.keys(yearData).sort((a, b) => {
    const monthA = new Date(Date.parse(`${a} 1, ${year}`));
    const monthB = new Date(Date.parse(`${b} 1, ${year}`));
    return monthB - monthA; // Newest first
  });

  // Create sections for each month
  await Promise.all(months.map(async (month) => {
    const monthSection = createTag('div', { class: 'archive-month' });

    // Month header
    const monthHeader = createTag('h3', { class: 'archive-month-header' }, month);
    monthSection.appendChild(monthHeader);

    // Posts grid for this month
    const postsGrid = createTag('div', { class: 'archive-posts-grid' });

    // Create cards for each post in this month
    const posts = yearData[month];
    const cardPromises = posts.map(async (post) => createBlogPostCard(post));
    const cards = await Promise.all(cardPromises);
    cards.forEach((card) => postsGrid.appendChild(card));

    monthSection.appendChild(postsGrid);
    yearSection.appendChild(monthSection);
  }));

  return yearSection;
}

/**
 * Render the blog archive
 * @param {HTMLElement} block - The block element
 */
async function renderBlogArchive(block) {
  if (!block) return;

  const blogIndex = window.blogindex?.data;
  if (!blogIndex || blogIndex.length === 0) {
    const noPosts = createTag('p', { class: 'no-posts' }, 'No blog posts found.');
    block.appendChild(noPosts);
    return;
  }

  // Sort posts by publication date (newest first)
  const sortedPosts = [...blogIndex].sort((a, b) => {
    const dateA = new Date(a.publicationDate);
    const dateB = new Date(b.publicationDate);
    return dateB - dateA; // Newest first
  });

  // Group posts by year and month
  const groupedPosts = groupPostsByYearAndMonth(sortedPosts);

  // Create archive header
  const archiveHeader = createTag('div', { class: 'archive-header' });
  const totalPosts = sortedPosts.length;
  const postCount = createTag(
    'p',
    { class: 'archive-post-count' },
    `${totalPosts} ${totalPosts === 1 ? 'post' : 'posts'} found`,
  );
  archiveHeader.appendChild(postCount);
  block.appendChild(archiveHeader);

  // Create year sections
  const years = Object.keys(groupedPosts).sort((a, b) => b - a); // Most recent year first

  await Promise.all(years.map(async (year) => {
    const yearSection = await createYearSection(year, groupedPosts[year]);
    block.appendChild(yearSection);
  }));
}

export default async function decorate(block) {
  // Load blog data
  loadBlogData();

  // Wait for data to be loaded
  const checkDataLoaded = () => window?.blogindex?.loaded;

  if (checkDataLoaded()) {
    await renderBlogArchive(block);
  } else {
    document.addEventListener('dataset-ready', async () => {
      if (checkDataLoaded() && !block.dataset.rendered) {
        block.dataset.rendered = 'true';
        await renderBlogArchive(block);
      }
    });
  }
}
