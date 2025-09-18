import { createTag, loadBlogData } from '../../scripts/scripts.js';

// Helper function to parse publication dates
function parsePublicationDate(dateString) {
  // Handle different date formats like "August 29th, 2024" or "Feb 18, 2025"
  // Remove ordinal suffixes (st, nd, rd, th)
  const cleanDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
  return new Date(cleanDate);
}

// Group blog posts by year and month
function groupPostsByYearMonth(posts) {
  const grouped = {};
  
  // Sort posts by publication date (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = parsePublicationDate(a.publicationDate);
    const dateB = parsePublicationDate(b.publicationDate);
    return dateB - dateA; // Descending order
  });
  
  sortedPosts.forEach(post => {
    const date = parsePublicationDate(post.publicationDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const yearMonthKey = `${year}-${month}`;
    
    if (!grouped[yearMonthKey]) {
      grouped[yearMonthKey] = {
        year,
        month,
        posts: []
      };
    }
    
    grouped[yearMonthKey].posts.push(post);
  });
  
  return grouped;
}

// Render the blog archive
export async function renderBlogArchive(block) {
  if (!block) {
    return;
  }
  
  const blogIndex = window.blogindex?.data || [];
  
  if (blogIndex.length === 0) {
    block.innerHTML = '<p>No blog posts found.</p>';
    return;
  }
  
  // Group posts by year and month
  const groupedPosts = groupPostsByYearMonth(blogIndex);
  
  // Create container for the archive
  const container = createTag('div', { class: 'blog-archive-container' });
  
  // Create sections for each year/month group
  Object.keys(groupedPosts).forEach(key => {
    const group = groupedPosts[key];
    
    // Create year header
    const yearHeader = createTag('h2', { class: 'blog-archive-year' }, group.year.toString());
    container.appendChild(yearHeader);
    
    // Create month header
    const monthHeader = createTag('h3', { class: 'blog-archive-month' }, group.month);
    container.appendChild(monthHeader);
    
    // Create list of posts
    const postList = createTag('ul', { class: 'blog-archive-list' });
    
    group.posts.forEach(post => {
      const listItem = createTag('li', { class: 'blog-archive-item' });
      
      // Create post link with title
      const postLink = createTag('a', { 
        href: post.path, 
        class: 'blog-archive-link' 
      }, post.title);
      
      // Create post date
      const postDate = createTag('span', { 
        class: 'blog-archive-date' 
      }, post.publicationDate);
      
      // Create post author if available
      let authorInfo = '';
      if (post.author) {
        authorInfo = ` by ${post.author}`;
      }
      
      const postAuthor = createTag('span', { 
        class: 'blog-archive-author' 
      }, authorInfo);
      
      // Add elements to list item
      listItem.appendChild(postLink);
      listItem.appendChild(postDate);
      if (authorInfo) {
        listItem.appendChild(postAuthor);
      }
      
      postList.appendChild(listItem);
    });
    
    container.appendChild(postList);
  });
  
  block.appendChild(container);
}

export default async function decorate(block) {
  // Load blog data if not already loaded
  if (!window.blogindex || !window.blogindex.loaded) {
    loadBlogData();
  }
  
  const checkDataLoaded = () => {
    return window?.blogindex?.loaded;
  };
  
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