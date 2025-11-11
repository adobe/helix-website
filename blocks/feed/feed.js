import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createTag,
  loadFeedData,
  loadBlogData,
  decorateGuideTemplateCodeBlock,
} from '../../scripts/scripts.js';

// logic for rendering the community feed
export async function renderFeed(block) {
  if (!block) {
    return;
  }
  const archivePageIndex = window.siteindex.archive.data;
  archivePageIndex.reverse();
  const parentDiv = createTag('div');
  let gridDiv;

  archivePageIndex.forEach((page, index) => {
    if (index % 3 === 0) {
      gridDiv = createTag('div');
    }

    const div = createTag('div', { class: 'feed-item' });

    const h3 = createTag('h3', { class: 'title' }, page.Title);
    div.appendChild(h3);

    const desc = createTag('p', { class: 'desc' }, page.Description);
    div.appendChild(desc);

    const title = createTag('p', { class: 'link' });
    const a = createTag('a', {
      href: page.URL, target: '_blank',
    }, page.Title);
    title.appendChild(a);
    div.appendChild(title);

    const image = createTag('p', { class: 'image-wrapper-el' });

    // Extract image id from page.URL
    const id = page.URL.split('=')[1];
    const img = createTag('img', { src: `https://img.youtube.com/vi/${id}/0.jpg` });
    image.appendChild(img);
    div.appendChild(image);

    gridDiv.appendChild(div);
    if (index % 3 === 2 || index === archivePageIndex.length - 1) {
      parentDiv.appendChild(gridDiv);
    }
  });
  block.appendChild(parentDiv);
}

function isImgUrl(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

// logic to render blog list home page
export async function fetchBlogContent(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    doc.querySelectorAll('h1, h2, h3, h4, h5').forEach((heading) => {
      const nextLevel = `h${parseInt(heading.tagName[1], 10) + 1}`;
      const newHeading = document.createElement(nextLevel);
      newHeading.innerHTML = heading.innerHTML;
      heading.replaceWith(newHeading);
    });
    // render images as img tags rather than linka
    doc.querySelectorAll('a').forEach((link) => {
      const linkSrc = new URL(link.href);
      const { pathname } = linkSrc;
      if (isImgUrl(pathname)) {
        const imgName = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.lastIndexOf('.'));
        const img = createOptimizedPicture(pathname, imgName);
        link.parentElement.classList.add('image-wrapper');
        link.replaceWith(img);
      }
    });
    const content = doc.querySelector('body > main > div');
    return content ? content.innerHTML : '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blog content:', error);
    return '';
  }
}

/**
 * Fetches blog post HTML and extracts metadata (author, excerpt)
 * @param {string} url - Blog post URL
 * @returns {Promise<Object>} Object with author and excerpt
 */
export async function fetchBlogMetadata(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract author from meta tag
    const authorMeta = doc.querySelector('meta[name="author"]');
    const author = authorMeta ? authorMeta.getAttribute('content') : '';

    // Extract hero image from og:image meta tag
    let heroImage = '';
    const ogImageMeta = doc.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      heroImage = ogImageMeta.getAttribute('content');
      // Keep absolute URLs as-is, convert to relative if it's from the same origin
      if (heroImage && heroImage.startsWith('https://')) {
        try {
          const imageUrl = new URL(heroImage);
          // If same origin, use relative path; otherwise keep absolute URL
          if (imageUrl.origin === window.location.origin) {
            heroImage = imageUrl.pathname + imageUrl.search;
          }
          // Otherwise keep the full URL for cross-origin images
        } catch (e) {
          // Keep original if URL parsing fails
        }
      }
    }

    // Extract excerpt from first paragraph(s) in main content
    const mainContent = doc.querySelector('main .default-content-wrapper');
    let excerpt = '';
    if (mainContent) {
      const paragraphs = mainContent.querySelectorAll('p');
      const paragraphText = Array.from(paragraphs)
        .map((p) => p.textContent.trim())
        .filter((item) => item.length > 0)
        .join(' ');

      // Get first 1-2 sentences (up to ~200 characters or 2 sentences)
      const sentences = paragraphText.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length > 0) {
        excerpt = sentences.slice(0, 2).join(' ').trim();
        // Limit to ~200 characters if still too long
        if (excerpt.length > 200) {
          const lastSpace = excerpt.lastIndexOf(' ', 200);
          excerpt = excerpt.substring(0, lastSpace > 150 ? lastSpace : 200).trim();
          if (!excerpt.endsWith('.') && !excerpt.endsWith('!') && !excerpt.endsWith('?')) {
            excerpt += '...';
          }
        }
      } else {
        // Fallback: first 200 characters
        excerpt = paragraphText.substring(0, 200).trim();
        if (excerpt.length === 200 && !excerpt.endsWith('.')) {
          excerpt += '...';
        }
      }
    }

    return {
      author: author || '',
      heroImage: heroImage || '',
      excerpt: excerpt || '',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching blog metadata:', error);
    return {
      author: '',
      heroImage: '',
      excerpt: '',
    };
  }
}

export async function renderBlog(block) {
  if (!block) {
    return;
  }
  const blogIndex = window.blogindex.data;

  // Sort blogs by publication date in descending order (newest first)
  blogIndex.sort((a, b) => {
    const dateA = new Date(a.publicationDate);
    const dateB = new Date(b.publicationDate);
    return dateB - dateA;
  });

  // Skip if block has favorite class
  if (block.classList.contains('favorite')) {
    return;
  }

  // Clear existing content and create archive container
  block.innerHTML = '';
  const archiveContainer = createTag('div', { class: 'blog-archive-container' });
  block.appendChild(archiveContainer);

  // Create cards grid
  const cardsGrid = createTag('div', { class: 'blog-cards-grid' });
  archiveContainer.appendChild(cardsGrid);

  // Fetch metadata for all blog posts and create cards
  const cardPromises = blogIndex.map(async (page) => {
    // Fetch additional metadata (author, better excerpt, hero image)
    const metadata = await fetchBlogMetadata(page.path);

    // Use fetched hero image if available, otherwise fall back to index image
    const heroImage = metadata.heroImage || page.image || '';
    // Use fetched excerpt if available, otherwise use description
    const excerpt = metadata.excerpt || page.description || '';
    // Use fetched author if available
    const author = metadata.author || '';

    // Create card
    const card = createTag('article', { class: 'blog-card' });

    // Hero image
    if (heroImage) {
      const imageWrapper = createTag('div', { class: 'blog-card-image-wrapper' });
      const img = createTag('img', {
        src: heroImage,
        alt: page.title || '',
        loading: 'lazy',
      });
      imageWrapper.appendChild(img);
      card.appendChild(imageWrapper);
    }

    // Card content
    const cardContent = createTag('div', { class: 'blog-card-content' });

    // Title
    const title = createTag('h3', { class: 'blog-card-title' });
    const titleLink = createTag('a', {
      href: page.path,
      class: 'blog-card-title-link',
    }, page.title || '');
    title.appendChild(titleLink);
    cardContent.appendChild(title);

    // Date
    if (page.publicationDate) {
      let dateTimeAttr = '';
      try {
        const dateObj = new Date(page.publicationDate);
        if (!Number.isNaN(dateObj.getTime())) {
          dateTimeAttr = dateObj.toISOString();
        }
      } catch (e) {
        // If date parsing fails, just use the string as-is
      }
      const date = createTag('time', {
        class: 'blog-card-date',
        ...(dateTimeAttr && { datetime: dateTimeAttr }),
      }, page.publicationDate);
      cardContent.appendChild(date);
    }

    // Author
    if (author) {
      const authorEl = createTag('p', { class: 'blog-card-author' }, author);
      cardContent.appendChild(authorEl);
    }

    // Excerpt
    if (excerpt) {
      const excerptEl = createTag('p', { class: 'blog-card-excerpt' }, excerpt);
      cardContent.appendChild(excerptEl);
    }

    card.appendChild(cardContent);

    // Wrap card in link
    const cardLink = createTag('a', {
      href: page.path,
      class: 'blog-card-link',
      'aria-label': `Read more: ${page.title || ''}`,
    });
    cardLink.appendChild(card);
    return cardLink;
  });

  // Wait for all cards to be created and append them
  const cards = await Promise.all(cardPromises);
  cards.forEach((card) => cardsGrid.appendChild(card));
}

export default async function decorate(block) {
  const isBlog = block.classList.contains('blog');

  if (isBlog) {
    loadBlogData();
  } else {
    loadFeedData();
  }

  const checkDataLoaded = () => {
    if (isBlog) {
      return window?.blogindex?.loaded;
    }
    return window?.siteindex?.loaded;
  };

  const renderFunction = isBlog ? renderBlog : renderFeed;

  if (!block.dataset.rendered) {
    if (checkDataLoaded()) {
      await renderFunction(block);
      block.dataset.rendered = 'true';
    } else {
      document.addEventListener('dataset-ready', () => {
        if (checkDataLoaded() && !block.dataset.rendered) {
          block.dataset.rendered = false;
          renderFunction(block).then(() => {
            decorateGuideTemplateCodeBlock();
            block.dataset.rendered = 'true';
          });
        }
      });
    }
  }
}
