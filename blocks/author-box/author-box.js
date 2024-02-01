import {
  getMetadata,
} from '../../scripts/lib-franklin.js';

function openPopup(e) {
  const target = e.target.closest('a');
  const href = target.getAttribute('data-href');
  const type = target.getAttribute('data-type');
  window.open(
    href,
    type,
    'popup,top=233,left=233,width=700,height=467',
  );
}

async function buildSharing(githubId) {
  const sharing = document.createElement('div');
  sharing.classList.add('sharing-details');
  const scriptUrl = new URL(import.meta.url);
  const iconsPath = new URL('../../icons/icon-github.svg', scriptUrl).href;
  // Fetch SVG content
  const response = await fetch(iconsPath);
  const svgContent = await response.text();
  sharing.innerHTML = `<span>
      <a data-type="GitHub" data-href="${githubId}" alt="share-github" aria-label="share-github" title="Github Profile">
        ${svgContent}
      </a>
    </span>`;
  sharing.querySelectorAll('[data-href]').forEach((link) => {
    link.addEventListener('click', openPopup);
  });
  return sharing;
}

async function createAuthorBlurb(blurb) {
  const authorBlurb = document.createElement('div');
  authorBlurb.classList.add('blog-author-blurb');
  authorBlurb.append(blurb);
  return authorBlurb;
}

function validateDate(dateTag, dateString) {
  const regex = /^[A-Z][a-z]+\s\d{1,2}(st|nd|rd|th),?\s\d{4}$/;

  if (!regex.test(dateString)) {
    dateTag.classList.add('publication-date-invalid');
    dateTag.setAttribute('title', 'invalid-date');
    console.error('Invalid publication date format. Please use a format like Month DDth, YYYY (e.g., January 30th, 2024)');
  }
}

export default async function decorateAuthorBox(blockEl) {
  const childrenEls = Array.from(blockEl.children);
  const bylineContainer = childrenEls[0];
  bylineContainer.classList.add('author-box-info');
  bylineContainer.firstElementChild.classList.add('blog-author-image');
  // author name
  bylineContainer.lastElementChild.classList.add('blog-author-details');
  const authorDetails = bylineContainer.lastElementChild;
  authorDetails.firstElementChild.classList.add('blog-author-name');
  // publication date
  const date = authorDetails.lastElementChild;
  date.classList.add('blog-publication-date');
  validateDate(date, date.textContent.trim());
  // author blurb
  const blurb = getMetadata('author-blurb');
  const authorBlurb = await createAuthorBlurb(blurb);
  bylineContainer.append(authorBlurb);
  // sharing
  const githubId = getMetadata('github');
  const shareBlock = await buildSharing(githubId);
  bylineContainer.append(shareBlock);
}
