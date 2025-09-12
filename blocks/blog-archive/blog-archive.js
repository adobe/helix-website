import { createTag, loadBlogData } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

function groupPostsByYearAndMonth(posts) {
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

  // Sort years in descending order
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  const result = {};
  sortedYears.forEach((year) => {
    // Sort months chronologically
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const sortedMonths = Object.keys(grouped[year]).sort(
      (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b),
    );

    result[year] = {};
    sortedMonths.forEach((month) => {
      // Sort posts within each month by date (newest first)
      result[year][month] = grouped[year][month].sort((a, b) => {
        const dateA = new Date(a.publicationDate);
        const dateB = new Date(b.publicationDate);
        return dateB - dateA;
      });
    });
  });

  return result;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${day}`;
}

function extractAuthorFromPost(post) {
  // Try to extract author from metadata if available
  // Since posts don't directly include author, we'll need to fetch if needed
  // For now, return empty string or implement fetching logic later
  return post.author || '';
}

async function renderBlogArchive(block) {
  if (!block) {
    return;
  }

  const blogIndex = window.blogindex.data;

  // Filter for blog posts and sort by publication date
  const blogPosts = blogIndex.filter((post) => post.path.startsWith('/blog/'));

  if (blogPosts.length === 0) {
    const noPostsMessage = createTag('p', { class: 'no-posts' }, 'No blog posts found.');
    block.appendChild(noPostsMessage);
    return;
  }

  // Group posts by year and month
  const groupedPosts = groupPostsByYearAndMonth(blogPosts);

  // Create archive container
  const archiveContainer = createTag('div', { class: 'blog-archive-container' });

  // Render grouped posts
  Object.entries(groupedPosts).forEach(([year, months]) => {
    const yearSection = createTag('div', { class: 'year-section' });
    const yearHeading = createTag('h2', { class: 'year-heading' }, year);
    yearSection.appendChild(yearHeading);

    Object.entries(months).forEach(([month, posts]) => {
      const monthSection = createTag('div', { class: 'month-section' });
      const monthHeading = createTag('h3', { class: 'month-heading' }, month);
      monthSection.appendChild(monthHeading);

      const postsList = createTag('ul', { class: 'posts-list' });

      posts.forEach((post) => {
        const postItem = createTag('li', { class: 'post-item' });

        const postLink = createTag('a', {
          href: post.path,
          class: 'post-link',
        });

        const postDate = createTag('span', { class: 'post-date' }, formatDate(post.publicationDate));
        const postTitle = createTag('span', { class: 'post-title' }, post.title);

        postLink.appendChild(postDate);
        postLink.appendChild(createTag('span', { class: 'separator' }, ' - '));
        postLink.appendChild(postTitle);

        // Add author if available
        const author = extractAuthorFromPost(post);
        if (author) {
          const authorSpan = createTag('span', { class: 'post-author' }, ` by ${author}`);
          postLink.appendChild(authorSpan);
        }

        postItem.appendChild(postLink);
        postsList.appendChild(postItem);
      });

      monthSection.appendChild(postsList);
      yearSection.appendChild(monthSection);
    });

    archiveContainer.appendChild(yearSection);
  });

  block.appendChild(archiveContainer);
}

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