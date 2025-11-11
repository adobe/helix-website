import { createTag, loadBlogData } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

async function fetchBlogMetadata(url) {
  try {
    const response = await fetch(url);
    const responseText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, 'text/html');

    const getMetaContent = (selector) => {
      const el = doc.querySelector(selector);
      return el ? el.getAttribute('content') : '';
    };

    const author = getMetaContent('meta[name="author"]');

    // Extract excerpt - try to get 1-2 sentences from the body
    const bodyContent = doc.querySelector('body main');
    let excerpt = '';
    if (bodyContent) {
      const bodyText = bodyContent.textContent;
      const sentences = bodyText.match(/[^.!?]+[.!?]+/g) || [];
      excerpt = (sentences.slice(0, 2).join(' ').trim()).substring(0, 200);
    }

    return { author, excerpt };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blog metadata:', error);
    return { author: '', excerpt: '' };
  }
}

function groupPostsByYearMonth(posts) {
  const groups = {};

  posts.forEach((post) => {
    const date = new Date(post.publicationDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;

    if (!groups[key]) {
      groups[key] = {
        year,
        month,
        monthName: date.toLocaleString('default', { month: 'long' }),
        posts: [],
      };
    }
    groups[key].posts.push(post);
  });

  return Object.entries(groups)
    .sort((a, b) => {
      const [keyA] = a;
      const [keyB] = b;
      return keyB.localeCompare(keyA);
    })
    .map(([, value]) => value);
}

function createPostCard(post, metadata) {
  const postCard = createTag('article', { class: 'blog-post-card' });

  const cardContent = createTag('div', { class: 'card-content' });

  // Title
  const title = createTag('h3', { class: 'post-title' }, post.title);
  cardContent.appendChild(title);

  // Date
  const date = new Date(post.publicationDate);
  const dateStr = date.toLocaleDateString('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateEl = createTag('p', { class: 'post-date' }, dateStr);
  cardContent.appendChild(dateEl);

  // Author
  if (metadata.author) {
    const author = createTag('p', { class: 'post-author' }, `By ${metadata.author}`);
    cardContent.appendChild(author);
  }

  // Excerpt
  if (metadata.excerpt || post.description) {
    const excerpt = createTag('p', { class: 'post-excerpt' }, metadata.excerpt || post.description);
    cardContent.appendChild(excerpt);
  }

  postCard.appendChild(cardContent);

  // Hero Image
  if (post.image) {
    const imageDiv = createTag('div', { class: 'card-image' });
    const pic = createOptimizedPicture(post.image, post.title, false, [{ width: '400' }]);
    imageDiv.appendChild(pic);
    postCard.appendChild(imageDiv);
  }

  // Link wrapper
  const link = createTag('a', {
    href: post.path,
    class: 'card-link',
    title: `Read ${post.title}`,
  });
  link.appendChild(postCard);

  return link;
}

async function renderArchive(block, grouped) {
  block.innerHTML = '';

  const metadataPromises = [];

  grouped.forEach((group) => {
    group.posts.forEach((post) => {
      metadataPromises.push(
        fetchBlogMetadata(post.path).then((metadata) => {
          post.metadata = metadata;
        }),
      );
    });
  });

  // Wait for all metadata to be fetched
  await Promise.all(metadataPromises);

  // Now render all groups and posts
  grouped.forEach((group) => {
    const sectionDiv = createTag('div', { class: 'blog-archive-section' });

    const headerDiv = createTag('div', { class: 'blog-archive-header' });
    const headerTitle = createTag('h2', { class: 'archive-period' }, `${group.monthName} ${group.year}`);
    headerDiv.appendChild(headerTitle);
    sectionDiv.appendChild(headerDiv);

    const postsContainer = createTag('div', { class: 'blog-archive-posts' });

    group.posts.forEach((post) => {
      const cardLink = createPostCard(post, post.metadata || {});
      postsContainer.appendChild(cardLink);
    });

    sectionDiv.appendChild(postsContainer);
    block.appendChild(sectionDiv);
  });

  block.dataset.rendered = 'true';
}

export default async function decorate(block) {
  loadBlogData();

  const checkDataLoaded = () => window?.blogindex?.loaded;

  if (checkDataLoaded()) {
    const blogIndex = window.blogindex.data || [];
    const sortedBlogs = blogIndex.sort((a, b) => {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return dateB - dateA;
    });
    const grouped = groupPostsByYearMonth(sortedBlogs);
    await renderArchive(block, grouped);
  } else {
    document.addEventListener('dataset-ready', async () => {
      if (checkDataLoaded() && block.dataset.rendered !== 'true') {
        const blogIndex = window.blogindex.data || [];
        const sortedBlogs = blogIndex.sort((a, b) => {
          const dateA = new Date(a.publicationDate);
          const dateB = new Date(b.publicationDate);
          return dateB - dateA;
        });
        const grouped = groupPostsByYearMonth(sortedBlogs);
        await renderArchive(block, grouped);
      }
    });
  }
}
