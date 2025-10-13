import { loadBlogData } from '../../scripts/scripts.js';

/**
 * Parses various date formats
 * @param {string} dateStr - Date string in various formats
 * @returns {Date} Parsed date object
 */
function parsePublicationDate(dateStr) {
  if (!dateStr) return new Date();

  // Remove "th", "st", "nd", "rd" from dates like "August 29th, 2024"
  const cleanedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');

  // Try parsing the cleaned date
  const parsed = new Date(cleanedDate);

  // If parsing failed, try to handle other formats
  if (Number.isNaN(parsed.getTime())) {
    // Handle special cases if needed
    return new Date();
  }

  return parsed;
}

/**
 * Groups blog posts by year and month
 * @param {Array} posts - Array of blog post objects
 * @returns {Object} Posts grouped by year and month
 */
function groupPostsByYearMonth(posts) {
  const grouped = {};

  posts.forEach((post) => {
    // Parse the publication date
    const date = parsePublicationDate(post.publicationDate);

    // Extract year and month
    const year = date.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];

    // Create nested structure
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
 * Renders the blog archive grouped by year and month
 * @param {Element} block - The block element
 */
async function renderBlogArchive(block) {
  if (!block) {
    return;
  }

  const blogIndex = window.blogindex.data;

  // Sort blogs by publication date in descending order (newest first)
  blogIndex.sort((a, b) => {
    const dateA = parsePublicationDate(a.publicationDate);
    const dateB = parsePublicationDate(b.publicationDate);
    return dateB - dateA;
  });

  // Group posts by year and month
  const groupedPosts = groupPostsByYearMonth(blogIndex);

  // Create the archive container
  const archiveContainer = document.createElement('div');
  archiveContainer.className = 'blog-archive-container';

  // Sort years in descending order
  const years = Object.keys(groupedPosts).sort((a, b) => b - a);

  years.forEach((year) => {
    // Create year section
    const yearSection = document.createElement('div');
    yearSection.className = 'blog-archive-year';

    const yearTitle = document.createElement('h2');
    yearTitle.className = 'blog-archive-year-title';
    yearTitle.textContent = year;
    yearSection.appendChild(yearTitle);

    // Sort months chronologically (newest first within each year)
    const monthOrder = ['December', 'November', 'October', 'September', 'August', 'July',
      'June', 'May', 'April', 'March', 'February', 'January'];
    const months = Object.keys(groupedPosts[year])
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

    months.forEach((month) => {
      // Create month section
      const monthSection = document.createElement('div');
      monthSection.className = 'blog-archive-month';

      const monthTitle = document.createElement('h3');
      monthTitle.className = 'blog-archive-month-title';
      monthTitle.textContent = month;
      monthSection.appendChild(monthTitle);

      // Create posts list for this month
      const postsList = document.createElement('ul');
      postsList.className = 'blog-archive-posts';

      // Sort posts within month by date (newest first)
      groupedPosts[year][month].sort((a, b) => {
        const dateA = parsePublicationDate(a.publicationDate);
        const dateB = parsePublicationDate(b.publicationDate);
        return dateB - dateA;
      });

      groupedPosts[year][month].forEach((post) => {
        const postItem = document.createElement('li');
        postItem.className = 'blog-archive-post';

        const postLink = document.createElement('a');
        postLink.href = post.path;
        postLink.className = 'blog-archive-post-link';

        const postDate = document.createElement('span');
        postDate.className = 'blog-archive-post-date';
        const date = parsePublicationDate(post.publicationDate);
        postDate.textContent = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const postTitle = document.createElement('span');
        postTitle.className = 'blog-archive-post-title';
        postTitle.textContent = post.title;

        const postAuthor = document.createElement('span');
        postAuthor.className = 'blog-archive-post-author';
        if (post.author) {
          postAuthor.textContent = `by ${post.author}`;
        }

        postLink.appendChild(postDate);
        postLink.appendChild(postTitle);
        if (post.author) {
          postLink.appendChild(postAuthor);
        }

        postItem.appendChild(postLink);
        postsList.appendChild(postItem);
      });

      monthSection.appendChild(postsList);
      yearSection.appendChild(monthSection);
    });

    archiveContainer.appendChild(yearSection);
  });

  // Add header
  const header = document.createElement('div');
  header.className = 'blog-archive-header';
  const headerTitle = document.createElement('h1');
  headerTitle.textContent = 'Blog Archive';
  header.appendChild(headerTitle);

  const headerDescription = document.createElement('p');
  headerDescription.className = 'blog-archive-description';
  headerDescription.textContent = `Browse through all ${blogIndex.length} blog posts organized by date`;
  header.appendChild(headerDescription);

  block.innerHTML = '';
  block.appendChild(header);
  block.appendChild(archiveContainer);
}

/**
 * Decorates the blog archive block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Load blog data
  loadBlogData();

  const checkDataLoaded = () => window?.blogindex?.loaded;

  if (!block.dataset.rendered) {
    if (checkDataLoaded()) {
      await renderBlogArchive(block);
      block.dataset.rendered = 'true';
    } else {
      document.addEventListener('dataset-ready', () => {
        if (checkDataLoaded() && !block.dataset.rendered) {
          block.dataset.rendered = false;
          renderBlogArchive(block).then(() => {
            block.dataset.rendered = 'true';
          });
        }
      });
    }
  }
}
