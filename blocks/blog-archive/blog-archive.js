import { createTag, getBlogArchiveData, loadBlogData } from '../../scripts/scripts.js';

// Function to render the blog archive
export function renderBlogArchive(block) {
  if (!block) {
    return;
  }

  // Check if blog index is loaded
  if (!window.blogindex?.loaded) {
    // Wait for blog index to load
    document.addEventListener('dataset-ready', () => {
      renderBlogArchive(block);
    });
    return;
  }

  // Get the grouped blog archive data
  const archiveData = getBlogArchiveData();

  if (!archiveData || Object.keys(archiveData).length === 0) {
    block.innerHTML = '<p>No blog posts found.</p>';
    return;
  }

  // Sort years in descending order (newest first)
  const years = Object.keys(archiveData).sort((a, b) => b - a);

  // Create container for the archive
  const archiveContainer = createTag('div', { class: 'blog-archive-container' });

  years.forEach((year) => {
    // Create year heading
    const yearHeading = createTag('h2', { class: 'blog-archive-year' }, year);
    archiveContainer.appendChild(yearHeading);

    // Get months for this year and sort in descending order (newest first)
    const months = Object.keys(archiveData[year]).sort((a, b) => b - a);

    months.forEach((month) => {
      // Create month heading
      const monthDate = new Date(year, month - 1); // month is 0-indexed
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
      const monthHeading = createTag('h3', { class: 'blog-archive-month' }, monthName);
      archiveContainer.appendChild(monthHeading);

      // Create list for blog posts in this month
      const monthList = createTag('ul', { class: 'blog-archive-list' });

      archiveData[year][month].forEach((post) => {
        const listItem = createTag('li', { class: 'blog-archive-item' });

        // Create link with date and title
        const postLink = createTag(
          'a',
          {
            href: post.path,
            class: 'blog-archive-link',
          },
        );

        // Format: "Month Day, Year - Post Title"
        postLink.textContent = `${post.publicationDate} - ${post.title}`;

        listItem.appendChild(postLink);
        monthList.appendChild(listItem);
      });

      archiveContainer.appendChild(monthList);
    });
  });

  block.appendChild(archiveContainer);
}

// Main decorate function for the blog archive block
export default async function decorate(block) {
  // Load blog data if it hasn't been loaded yet
  if (!window.blogindex) {
    loadBlogData();
  }

  // Wait a bit for potential data loading, then render
  setTimeout(() => {
    renderBlogArchive(block);
  }, 100);

  // Also listen for the dataset-ready event to render when data is loaded
  document.addEventListener('dataset-ready', () => {
    renderBlogArchive(block);
  });
}
