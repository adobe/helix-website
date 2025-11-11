import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

/**
 * Cache for fetched blog content to avoid redundant requests
 */
const contentCache = new Map();

/**
 * Fetches blog content and extracts metadata
 * @param {string} path - Blog post path
 * @returns {Promise<Object>} Extracted blog metadata including author and excerpt
 */
async function fetchBlogMetadata(path) {
  // Check cache first
  if (contentCache.has(path)) {
    return contentCache.get(path);
  }

  try {
    const response = await fetch(path);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract author from author-box or meta data
    let author = 'Adobe Team'; // Default author
    const authorBox = doc.querySelector('.author-box');
    if (authorBox) {
      const authorName = authorBox.querySelector('h3, .author-name');
      if (authorName) {
        author = authorName.textContent.trim();
      }
    } else {
      // Try to find author in meta tags
      const authorMeta = doc.querySelector('meta[name="author"], meta[property="article:author"]');
      if (authorMeta) {
        author = authorMeta.content;
      }
    }

    // Extract hero image
    let heroImage = null;
    const heroBlock = doc.querySelector('.hero picture img');
    if (heroBlock && heroBlock.src) {
      heroImage = heroBlock.src;
    }

    // Extract first paragraph or two for excerpt
    const mainContent = doc.querySelector('main .section');
    let excerpt = '';
    if (mainContent) {
      const paragraphs = mainContent.querySelectorAll('p');
      const excerptParagraphs = [];
      let charCount = 0;

      Array.from(paragraphs).some((p) => {
        const paragraphText = p.textContent.trim();
        if (paragraphText && !paragraphText.startsWith('By ')) { // Skip author bylines
          excerptParagraphs.push(paragraphText);
          charCount += paragraphText.length;
          if (charCount > 150 || excerptParagraphs.length >= 2) {
            return true; // break the loop
          }
        }
        return false;
      });

      excerpt = excerptParagraphs.join(' ');
      if (excerpt.length > 200) {
        // Truncate at last complete sentence before 200 chars
        const sentenceEnd = excerpt.lastIndexOf('.', 200);
        if (sentenceEnd > 100) {
          excerpt = excerpt.substring(0, sentenceEnd + 1);
        } else {
          excerpt = `${excerpt.substring(0, 197)}...`;
        }
      }
    }

    const metadata = { author, heroImage, excerpt };
    contentCache.set(path, metadata);
    return metadata;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching blog metadata for ${path}:`, error);
    return {
      author: 'Adobe Team',
      heroImage: null,
      excerpt: '',
    };
  }
}

/**
 * Groups blog posts by year and month
 * @param {Array} posts - Array of blog posts
 * @returns {Object} Posts grouped by year and month
 */
function groupPostsByDate(posts) {
  const grouped = {};

  posts.forEach((post) => {
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
 * Creates a blog post card element
 * @param {Object} post - Blog post data
 * @param {Object} metadata - Additional metadata (author, excerpt, hero image)
 * @returns {HTMLElement} Card element
 */
function createPostCard(post, metadata) {
  const card = createTag('article', { class: 'blog-archive-card' });

  // Create card link wrapper
  const cardLink = createTag('a', {
    href: post.path,
    class: 'blog-archive-card-link',
  });

  // Add image if available
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

  // Add content container
  const content = createTag('div', { class: 'blog-archive-card-content' });

  // Title
  const title = createTag('h3', { class: 'blog-archive-card-title' }, post.title);
  content.appendChild(title);

  // Metadata row (date and author)
  const metaRow = createTag('div', { class: 'blog-archive-card-meta' });

  const date = new Date(post.publicationDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateSpan = createTag('span', { class: 'blog-archive-card-date' }, formattedDate);
  metaRow.appendChild(dateSpan);

  if (metadata.author) {
    const authorSpan = createTag('span', { class: 'blog-archive-card-author' }, `By ${metadata.author}`);
    metaRow.appendChild(authorSpan);
  }

  content.appendChild(metaRow);

  // Excerpt
  const excerpt = metadata.excerpt || post.description || '';
  if (excerpt) {
    const excerptP = createTag('p', { class: 'blog-archive-card-excerpt' }, excerpt);
    content.appendChild(excerptP);
  }

  cardLink.appendChild(content);
  card.appendChild(cardLink);

  return card;
}

/**
 * Main decoration function for blog archive block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  // Clear the block content
  block.innerHTML = '';

  // Add loading state
  block.classList.add('blog-archive-loading');
  const loadingMessage = createTag('p', { class: 'blog-archive-loading-message' }, 'Loading blog archive...');
  block.appendChild(loadingMessage);

  try {
    // Fetch blog index
    const response = await fetch('/query-index.json');
    const data = await response.json();

    // Filter for blog posts, excluding the archive page itself
    const blogPosts = data.data
      .filter((entry) => entry.path.startsWith('/blog/'))
      .filter((entry) => entry.path !== '/blog/archive')
      .filter((entry) => entry.publicationDate); // Ensure has publication date

    // Sort by publication date (newest first)
    blogPosts.sort((a, b) => {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return dateB - dateA;
    });

    // Group posts by year and month
    const groupedPosts = groupPostsByDate(blogPosts);

    // Clear loading state
    block.innerHTML = '';
    block.classList.remove('blog-archive-loading');

    // Create archive container
    const archiveContainer = createTag('div', { class: 'blog-archive-container' });

    // Process years in reverse chronological order
    const years = Object.keys(groupedPosts).sort((a, b) => b - a);

    years.forEach((year) => {
      const yearSection = createTag('section', { class: 'blog-archive-year' });
      const yearHeading = createTag('h2', { class: 'blog-archive-year-heading' }, year);
      yearSection.appendChild(yearHeading);

      // Process months in reverse chronological order
      const months = Object.keys(groupedPosts[year]);
      const monthOrder = ['December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'];
      months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

      months.forEach((month) => {
        const monthSection = createTag('div', { class: 'blog-archive-month' });
        const monthHeading = createTag('h3', { class: 'blog-archive-month-heading' }, month);
        monthSection.appendChild(monthHeading);

        const cardsGrid = createTag('div', { class: 'blog-archive-cards-grid' });

        // Fetch metadata for each post and create cards
        const postsInMonth = groupedPosts[year][month];

        // Create cards immediately with basic data, then enhance with fetched metadata
        postsInMonth.forEach(async (post) => {
          // Create basic card first
          const basicMetadata = {
            author: 'Adobe Team',
            heroImage: null,
            excerpt: post.description,
          };
          const card = createPostCard(post, basicMetadata);
          cardsGrid.appendChild(card);

          // Fetch and update with full metadata
          const metadata = await fetchBlogMetadata(post.path);
          if (metadata.author !== 'Adobe Team' || metadata.heroImage || metadata.excerpt !== post.description) {
            // Replace the card with enhanced version
            const enhancedCard = createPostCard(post, metadata);
            card.replaceWith(enhancedCard);
          }
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
