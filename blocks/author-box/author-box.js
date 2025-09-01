import {
  getMetadata,
} from '../../scripts/lib-franklin.js';

import {
  createTag,
} from '../../scripts/scripts.js';

function openPopup(e) {
  const target = e.target.closest('a');
  const href = target.getAttribute('data-href');
  const type = target.getAttribute('data-type');
  window.open(
    href,
    type,
  );
}

async function buildSharing(id, authorName, type = 'github') {
  const sharing = createTag('div', { class: 'sharing-details' });
  const scriptUrl = new URL(import.meta.url);
  let href;
  let iconsPath;
  if (type === 'github') {
    // support github id or url
    href = id.startsWith('https://github.com/') ? id : `https://github.com/${id}`;
    iconsPath = new URL('../../icons/icon-github.svg', scriptUrl).href;
  } else if (type === 'linkedin') {
    href = id;
    iconsPath = new URL('../../icons/icon-linkedin.svg', scriptUrl).href;
  }
  // Fetch SVG content
  const response = await fetch(iconsPath);
  const svgContent = await response.text();

  const profiles = {
    github: {
      dataType: 'GitHub',
      altText: 'share-github',
      ariaLabel: 'share-github',
      titleText: `${authorName}'s GitHub Profile`,
    },
    linkedin: {
      dataType: 'LinkedIn',
      altText: 'share-linkedin',
      ariaLabel: 'share-linkedin',
      titleText: `${authorName}'s LinkedIn Profile`,
    },
  };

  const {
    dataType, altText, ariaLabel, titleText,
  } = profiles[type] || profiles.github;

  const link = createTag('a', {
    'data-type': dataType,
    'data-href': href,
    alt: altText,
    'aria-label': ariaLabel,
    title: titleText,
  }, svgContent);

  sharing.append(link);
  return sharing;
}

async function addProfileLinkToImage(authorImage, profileId, type = 'github') {
  const authorLink = createTag('a', { class: 'blog-author-link' });
  if (type === 'github') {
    authorLink.setAttribute(
      'data-href',
      profileId.startsWith('https://github.com/') ? profileId : `https://github.com/${profileId}`,
    );
  } else if (type === 'linkedin') {
    authorLink.setAttribute('data-href', profileId);
  }
  authorLink.append(authorImage);
  authorLink.addEventListener('click', openPopup);
  return authorLink;
}

async function createAuthorBlurb(blurb) {
  const authorBlurb = createTag('div', { class: 'blog-author-blurb' }, blurb);
  return authorBlurb;
}

function validateDate(dateTag, dateString) {
  const regex = /^[A-Z][a-z]+\s\d{1,2}(st|nd|rd|th),?\s\d{4}$/;
  if (!regex.test(dateString)) {
    dateTag.classList.add('publication-date-invalid');
    dateTag.setAttribute('title', 'invalid-date');
    // eslint-disable-next-line no-console
    console.error('Invalid publication date format. Please use a format like Month DDth, YYYY (e.g., January 30th, 2024)');
  }
}

// eslint-disable-next-line max-len
async function createAuthorContainer(author, githubId, linkedinLink, publicationDate, i, isSingleAuthor) {
  const authorContainer = createTag('div', { class: 'author-container' });

  const authorDetails = createTag('div', { class: 'blog-author-info' });
  const authorImage = document.createElement('img');
  const imageKey = isSingleAuthor ? 'author-image' : `author${i + 1}-image`;
  authorImage.src = getMetadata(imageKey);
  authorImage.classList.add('blog-author-image');

  let addAuthorLink;
  if (githubId) {
    addAuthorLink = await addProfileLinkToImage(authorImage, githubId, 'github');
  } else if (linkedinLink) {
    addAuthorLink = await addProfileLinkToImage(authorImage, linkedinLink, 'linkedin');
  }
  if (addAuthorLink) {
    authorDetails.append(addAuthorLink);
  } else {
    authorDetails.append(authorImage);
  }

  // sharing
  let shareBlock;
  if (githubId) {
    shareBlock = await buildSharing(githubId, author, 'github');
  } else if (linkedinLink) {
    shareBlock = await buildSharing(linkedinLink, author, 'linkedin');
  }
  if (shareBlock) {
    shareBlock.addEventListener('click', openPopup);
    authorDetails.append(shareBlock);
  }

  authorContainer.append(authorDetails);
  return authorContainer;
}

// eslint-disable-next-line max-len
async function singleAuthorContainer(author, githubId, linkedinLink, publicationDate, i, isSingleAuthor) {
  // eslint-disable-next-line max-len
  const authorContainer = await createAuthorContainer(author, githubId, linkedinLink, publicationDate, i, isSingleAuthor);

  const authorInfo = createTag('div', { class: 'blog-author-details' });
  const authorName = createTag('div', { class: 'blog-author-name' }, author);
  const date = createTag('div', { class: 'blog-publication-date' }, publicationDate);
  validateDate(date, publicationDate);
  authorInfo.append(authorName);
  authorInfo.append(date);

  authorContainer.append(authorInfo);

  // author blurb
  const blurbKey = isSingleAuthor ? 'author-blurb' : `author${i + 1}-blurb`;
  const blurb = getMetadata(blurbKey);
  const authorBlurb = await createAuthorBlurb(blurb);
  authorContainer.append(authorBlurb);
  return authorContainer;
}

// eslint-disable-next-line max-len
async function multipleAuthorsContainer(author, githubId, linkedinLink, publicationDate, i, isSingleAuthor) {
  // eslint-disable-next-line max-len
  const authorContainer = await createAuthorContainer(author, githubId, linkedinLink, publicationDate, i, isSingleAuthor);

  const authorInfo = createTag('div', { class: 'blog-author-details' });
  const authorName = createTag('div', { class: 'blog-author-name' }, author);
  authorInfo.append(authorName);

  // author blurb
  const blurbKey = isSingleAuthor ? 'author-blurb' : `author${i + 1}-blurb`;
  const blurb = getMetadata(blurbKey);
  const authorBlurb = await createAuthorBlurb(blurb);
  authorInfo.append(authorBlurb);

  authorContainer.append(authorInfo);
  return authorContainer;
}

export default async function decorateAuthorBox(blockEl) {
  const authors = getMetadata('author').split(',').map((author) => author.trim());
  const githubIds = getMetadata('github').split(',').map((id) => id.trim());
  const linkedinLinks = getMetadata('linkedin').split(',').map((link) => link.trim());
  const publicationDate = getMetadata('publication-date');

  const bylineContainer = createTag('div', { class: 'author-box-info' });
  blockEl.innerHTML = '';
  blockEl.append(bylineContainer);

  const authorContainers = createTag('div', { class: 'author-containers' });

  if (authors.length === 1) {
    // Handle single author case
    const authorContainer = await singleAuthorContainer(
      authors[0],
      githubIds[0],
      linkedinLinks[0],
      publicationDate,
      0,
      true,
    );
    authorContainer.classList.add('single-author');
    authorContainers.append(authorContainer);
  } else {
    const date = createTag('div', { class: 'blog-publication-date' }, `Published on ${publicationDate}`);
    validateDate(date, publicationDate);
    bylineContainer.append(date);

    // Handle multiple authors case
    const authorPromises = authors.map(async (author, i) => {
      const authorContainer = await multipleAuthorsContainer(
        author,
        githubIds[i],
        linkedinLinks[i],
        publicationDate,
        i,
        false,
      );
      authorContainer.classList.add('multiple-authors');
      return authorContainer;
    });

    // Wait for all author containers to be created and add them in order
    const authorElements = await Promise.all(authorPromises);
    authorElements.forEach((container) => authorContainers.append(container));
  }
  bylineContainer.append(authorContainers);
}
