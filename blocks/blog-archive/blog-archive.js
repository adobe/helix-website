import { createTag } from '../../scripts/scripts.js';
import { createOptimizedPicture as createOptimizedPic } from '../../scripts/lib-franklin.js';

/**
 * Fetches additional blog post data by parsing the HTML content
 * @param {string} url - The blog post URL
 * @returns {Promise<Object>} - Additional blog post data
 */
export async function fetchBlogPostData(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract author from meta tags or content
    const authorMeta = doc.querySelector('meta[name="author"]');
    let author = 'AEM Team';
    if (authorMeta) {
      author = authorMeta.getAttribute('content');
    } else {
      // Try to find author in the content
      const authorElement = doc.querySelector('.author-box [data-author], .publication-time [data-author]');
      if (authorElement) {
        author = authorElement.getAttribute('data-author');
      }
    }

    // Generate excerpt from content (first 2-3 sentences)
    const mainContent = doc.querySelector('main > div');
    let excerpt = '';
    if (mainContent) {
      const textContent = mainContent.textContent || mainContent.innerText || '';
      const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
      excerpt = sentences.slice(0, 2).join(' ').trim();
      if (excerpt.length > 200) {
        excerpt = `${excerpt.substring(0, 197)}...`;
      }
    }

    return {
      author,
      excerpt,
      fullUrl: url,
    };
  } catch (error) {
    console.error(`Error fetching blog post data for ${url}:`, error);
    return {
      author: 'AEM Team',
      excerpt: '',
      fullUrl: url,
    };
  }
}

/**
 * Groups blog posts by year and month
 * @param {Array} posts - Array of blog posts from query-index
 * @returns {Object} - Posts grouped by year and month
 */
function groupPostsByDate(posts) {
  const grouped = {};

  posts.forEach((post) => {
    if (!post.publicationDate) return;

    const date = new Date(post.publicationDate);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }

    grouped[year][month].push(post);
  });

  // Sort years in descending order
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  // Sort months within each year in chronological order (newest first)
  sortedYears.forEach((year) => {
    const sortedMonths = Object.keys(grouped[year]).sort((a, b) => b - a);
    const temp = {};
    sortedMonths.forEach((month) => {
      temp[month] = grouped[year][month];
    });
    grouped[year] = temp;
  });

  return grouped;
}

/**
 * Creates a blog post card element
 * @param {Object} postData - Blog post data
 * @param {Object} additionalData - Additional data from fetchBlogPostData
 * @returns {Element} - Card element
 */
function createBlogCard(postData, additionalData) {
  const card = createTag('article', { class: 'blog-archive-card' });

  // Hero Image
  if (postData.image && postData.image !== '/default-social.png') {
    const imageContainer = createTag('div', { class: 'blog-archive-card-image' });
    const img = createOptimizedPic(postData.image, postData.title, 'small');
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);
  }

  // Content
  const content = createTag('div', { class: 'blog-archive-card-content' });

  // Title
  const title = createTag('h3', { class: 'blog-archive-card-title' });
  const titleLink = createTag('a', { href: additionalData.fullUrl, class: 'blog-archive-card-link' }, postData.title);
  title.appendChild(titleLink);
  content.appendChild(title);

  // Meta information
  const meta = createTag('div', { class: 'blog-archive-card-meta' });

  // Date
  if (postData.publicationDate) {
    const date = createTag('time', { class: 'blog-archive-card-date', datetime: postData.publicationDate });
    const formattedDate = new Date(postData.publicationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    date.textContent = formattedDate;
    meta.appendChild(date);
  }

  // Author
  if (additionalData.author) {
    const author = createTag('span', { class: 'blog-archive-card-author' }, `By ${additionalData.author}`);
    meta.appendChild(author);
  }

  content.appendChild(meta);

  // Excerpt
  if (additionalData.excerpt) {
    const excerpt = createTag('p', { class: 'blog-archive-card-excerpt' }, additionalData.excerpt);
    content.appendChild(excerpt);
  }

  card.appendChild(content);
  return card;
}

/**
 * Creates month section header
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Element} - Month header element
 */
function createMonthHeader(year, month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const header = createTag('div', { class: 'blog-archive-month-header' });
  const h2 = createTag('h2', { class: 'blog-archive-month-title' });
  h2.textContent = `${monthNames[month]} ${year}`;
  header.appendChild(h2);

  return header;
}

/**
 * Main render function for blog archive
 * @param {Element} block - The block element
 */
export async function renderBlogArchive(block) {
  if (!block) {
    return;
  }

  // Check if blog data is loaded
  if (!window.blogindex?.loaded) {
    document.addEventListener('dataset-ready', async () => {
      await renderBlogArchive(block);
    });
    return;
  }

  const blogPosts = window.blogindex.data;

  // Sort posts by publication date (newest first)
  blogPosts.sort((a, b) => {
    const dateA = new Date(a.publicationDate);
    const dateB = new Date(b.publicationDate);
    return dateB - dateA;
  });

  // Filter out any non-blog entries
  const filteredPosts = blogPosts.filter((post) => post.path && post.path.startsWith('/blog/') && post.path !== '/blog' && post.path !== '/blog/archive');

  if (filteredPosts.length === 0) {
    const noPosts = createTag('div', { class: 'blog-archive-no-posts' });
    noPosts.textContent = 'No blog posts found.';
    block.appendChild(noPosts);
    return;
  }

  // Group posts by year and month
  const groupedPosts = groupPostsByDate(filteredPosts);

  // Create archive container
  const archiveContainer = createTag('div', { class: 'blog-archive-container' });

  // Render each year and month
  Object.keys(groupedPosts).forEach((year) => {
    const yearContainer = createTag('section', { class: 'blog-archive-year' });

    Object.keys(groupedPosts[year]).forEach((month) => {
      const posts = groupedPosts[year][month];

      // Add month header
      const monthHeader = createMonthHeader(parseInt(year, 10), parseInt(month, 10));
      yearContainer.appendChild(monthHeader);

      // Create posts grid for this month
      const postsGrid = createTag('div', { class: 'blog-archive-posts-grid' });

      // Fetch additional data for each post and create card
      Promise.all(posts.map(async (post) => {
        const additionalData = await fetchBlogPostData(`https://main--helix-website--adobe.aem.live${post.path}`);
        return createBlogCard(post, additionalData);
      })).then((cards) => {
        cards.forEach((card) => postsGrid.appendChild(card));
      });

      yearContainer.appendChild(postsGrid);
    });

    archiveContainer.appendChild(yearContainer);
  });

  // Clear existing content and append new archive
  block.innerHTML = '';
  block.appendChild(archiveContainer);
}

export default async function decorate(block) {
  block.classList.add('blog-archive');

  // Load blog data if not already loaded
  if (!window.blogindex?.loaded) {
    // Load blog data
    const offset = 0;
    fetch(`/query-index.json?offset=${offset}`)
      .then((response) => response.json())
      .then((data) => {
        window.blogindex = window.blogindex || { data: [], loaded: false };
        window.blogindex.data = data?.data
          ?.filter((entry) => entry.path.startsWith('/blog/'))
          ?.filter((entry) => entry.path !== '/blog/archive') || [];
        window.blogindex.loaded = true;
        const event = new Event('dataset-ready');
        document.dispatchEvent(event);

        // Render archive after data is loaded
        renderBlogArchive(block);
      })
      .catch((error) => {
        console.error('Error loading blog data:', error);
        const errorDiv = createTag('div', { class: 'blog-archive-error' });
        errorDiv.textContent = 'Error loading blog posts. Please try again later.';
        block.appendChild(errorDiv);
      });
  } else {
    // Data already loaded, render immediately
    renderBlogArchive(block);
  }
}
