// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

/**
 * Adds a reading progress bar for long-form pages
 */
function addReadingProgressBar() {
  // Only add to long-form content pages
  const isLongForm = document.body.classList.contains('guides-template')
    || document.body.classList.contains('docs-template')
    || document.body.classList.contains('blog-template')
    || document.body.classList.contains('skills-template');

  if (!isLongForm) return;

  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-label', 'Reading progress');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');
  document.body.appendChild(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    const progress = Math.min(100, Math.max(0, scrollPercent));

    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(progress).toString());
  }

  // Throttle scroll updates for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial update
  updateProgress();
}

/**
 * Adds a back to top button for long-form pages
 */
function addBackToTopButton() {
  // Only add to long-form content pages
  const isLongForm = document.body.classList.contains('guides-template')
    || document.body.classList.contains('docs-template')
    || document.body.classList.contains('blog-template')
    || document.body.classList.contains('skills-template');

  if (!isLongForm) return;

  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Back to top');
  button.setAttribute('title', 'Back to top');
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  document.body.appendChild(button);

  // Show/hide button based on scroll position
  function toggleButtonVisibility() {
    const scrollTop = window.scrollY;
    const showThreshold = window.innerHeight; // Show after first screen

    if (scrollTop > showThreshold) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }

  // Scroll to top smoothly
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  // Keyboard accessibility
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });

  // Listen for scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        toggleButtonVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial check
  toggleButtonVisibility();
}

// Initialize reading enhancements
addReadingProgressBar();
addBackToTopButton();

const preloaded = new Set();

async function preloadPage(href) {
  const hrefURL = new URL(href);
  if (hrefURL.origin === window.location.origin) {
    // use speculation rules to preload the page
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({
      prerender: [
        {
          urls: [`${hrefURL.pathname}${hrefURL.search}`],
        },
      ],
    });
    document.head.appendChild(script);
  }
}

const HPADDING = 50; // extend horizontal trigger area by 50px around the link
const VPADDING = 2; // extend vertical trigger area by 10px around the link

function getIsMouseOverForElement(el) {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

  const rect = el.getBoundingClientRect();

  const top = rect.top + scrollTop - VPADDING;
  const left = rect.left + scrollLeft - HPADDING;
  const bottom = rect.bottom + scrollTop + VPADDING;
  const right = rect.right + HPADDING;

  return (x, y) => {
    const st = document.documentElement.scrollTop || document.body.scrollTop;
    const sl = document.documentElement.scrollLeft || document.body.scrollLeft;

    const xs = x + sl;
    const ys = y + st;

    if (xs >= left
      && xs <= right
      && ys >= top
      && ys <= bottom) {
      return el.href;
    }
    return null;
  };
}

const linksIsMouseOver = [];

document.querySelectorAll('.side-navigation a[href]').forEach((a) => {
  const isMouseOver = getIsMouseOverForElement(a);
  linksIsMouseOver.push(isMouseOver);
});

document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  linksIsMouseOver.forEach((isMouseOver) => {
    const href = isMouseOver(x, y);
    if (href && !preloaded.has(href)) {
      preloadPage(href);
      preloaded.add(href);
    }
  });
});
