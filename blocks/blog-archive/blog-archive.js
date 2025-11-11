import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createTag, loadBlogData } from '../../scripts/scripts.js';

/**
 * Parse publication date like "December 16th, 2024" to a Date object
 */
function parsePublicationDate(dateStr) {
  if (!dateStr) return new Date();
  // Normalize date string by removing ordinal suffixes
  const normalizedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
  return new Date(normalizedDate);
}

/**
 * Extract year and month from a date
 */
function getYearAndMonth(date) {
  return {
    year: date.getFullYear(),
    month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

/**
 * Group blog posts by year and month
 */
function groupPostsByMonth(posts) {
  const grouped = {};

  posts.forEach((post) => {
    const postDate = parsePublicationDate(post.publicationDate);
    const { year, month } = getYearAndMonth(postDate);

    if (!grouped[year]) {
      grouped[year] = {};
    }

    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }

    grouped[year][month].push(post);
  });

  // Sort posts within each month by publication date (newest first)
  Object.keys(grouped).forEach((year) => {
    Object.keys(grouped[year]).forEach((month) => {
      grouped[year][month].sort((a, b) => {
        const dateA = parsePublicationDate(a.publicationDate);
        const dateB = parsePublicationDate(b.publicationDate);
        return dateB - dateA;
      });
    });
  });

  return grouped;
}

/**
 * Create a blog post card
 */
function createBlogPostCard(post) {
  const card = createTag('article', { class: 'blog-archive-post-card' });

  // Hero image
  if (post.image) {
    const imageContainer = createTag('div', { class: 'blog-archive-post-image' });
    const picture = createOptimizedPicture(post.image, post.title, false, [{ width: '400' }]);
    imageContainer.appendChild(picture);
    card.appendChild(imageContainer);
  }

  // Content
  const content = createTag('div', { class: 'blog-archive-post-content' });

  // Title
  const title = createTag('h3', { class: 'blog-archive-post-title' });
  const titleLink = createTag('a', { href: post.path }, post.title);
  title.appendChild(titleLink);
  content.appendChild(title);

  // Date
  if (post.publicationDate) {
    const date = createTag('div', { class: 'blog-archive-post-date' }, post.publicationDate);
    content.appendChild(date);
  }

  // Author (if available)
  // eslint-disable-next-line no-console
  console.log('Checking for author data:', post);
  if (post.author || post.author1 || post.authorImage) {
    const authorContainer = createTag('div', { class: 'blog-archive-post-author' });

    // Author image (if available)
    if (post.authorImage) {
      const authorImg = createTag('img', {
        src: post.authorImage,
        alt: post.author || 'Author',
        class: 'blog-archive-post-author-image',
      });
      authorContainer.appendChild(authorImg);
    }

    // Author name
    if (post.author) {
      const authorName = createTag('span', { class: 'blog-archive-post-author-name' }, post.author);
      authorContainer.appendChild(authorName);
    }

    content.appendChild(authorContainer);
  }

  // Description
  if (post.description) {
    const description = createTag('p', { class: 'blog-archive-post-description' }, post.description);
    content.appendChild(description);
  }

  card.appendChild(content);
  return card;
}

/**
 * Render the blog archive
 */
export async function renderBlogArchive(block) {
  if (!block) return;

  const blogIndex = window.blogindex.data;
  if (!blogIndex || blogIndex.length === 0) {
    const message = createTag('p', { class: 'blog-archive-no-posts' }, 'No blog posts found.');
    block.appendChild(message);
    return;
  }

  // Filter only blog posts and exclude the archive page itself
  const blogPosts = blogIndex
    .filter((entry) => entry.path.startsWith('/blog/') && entry.path !== '/blog/archive')
    .sort((a, b) => parsePublicationDate(b.publicationDate)
               - parsePublicationDate(a.publicationDate));

  // eslint-disable-next-line no-console
  console.log('Blog posts found:', blogPosts.length);
  // eslint-disable-next-line no-console
  console.log('Sample blog post:', blogPosts[0]);

  if (blogPosts.length === 0) {
    const message = createTag('p', { class: 'blog-archive-no-posts' }, 'No blog posts found.');
    block.appendChild(message);
    return;
  }

  const groupedPosts = groupPostsByMonth(blogPosts);

  // Create archive container
  const archiveContainer = createTag('div', { class: 'blog-archive-container' });

  // Sort years in descending order (newest first)
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => b - a);

  sortedYears.forEach((year) => {
    // Create year section
    const yearSection = createTag('section', { class: 'blog-archive-year-section' });
    const yearHeading = createTag('h2', { class: 'blog-archive-year-heading' }, year);
    yearSection.appendChild(yearHeading);

    // Sort months in descending order (newest first)
    const sortedMonths = Object.keys(groupedPosts[year])
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
      });

    sortedMonths.forEach((month) => {
      // Create month section
      const monthSection = createTag('div', { class: 'blog-archive-month-section' });
      const monthHeading = createTag('h3', { class: 'blog-archive-month-heading' }, month);
      monthSection.appendChild(monthHeading);

      // Add posts for this month
      const postsGrid = createTag('div', { class: 'blog-archive-posts-grid' });
      groupedPosts[year][month].forEach((post) => {
        const postCard = createBlogPostCard(post);
        postsGrid.appendChild(postCard);
      });

      monthSection.appendChild(postsGrid);
      yearSection.appendChild(monthSection);
    });

    archiveContainer.appendChild(yearSection);
  });

  block.appendChild(archiveContainer);
}

export default async function decorate(block) {
  // Load blog data
  loadBlogData();

  // Wait for data to be loaded
  const checkDataLoaded = () => window?.blogindex?.loaded;

  if (checkDataLoaded()) {
    await renderBlogArchive(block);
    block.dataset.rendered = 'true';
  } else {
    document.addEventListener('dataset-ready', () => {
      if (checkDataLoaded() && !block.dataset.rendered) {
        renderBlogArchive(block).then(() => {
          block.dataset.rendered = 'true';
        });
      }
    });
  }
}
