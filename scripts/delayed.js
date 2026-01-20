// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

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

// Reading Progress Bar
function initReadingProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-label', 'Reading progress');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');
  document.body.appendChild(progressBar);

  function updateProgressBar() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    progressBar.style.width = `${clampedProgress}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(clampedProgress).toString());
  }

  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar();
}

// Back to Top Button
function initBackToTopButton() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Back to top');
  button.setAttribute('title', 'Back to top');
  button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  document.body.appendChild(button);

  function toggleButtonVisibility() {
    const firstViewportHeight = window.innerHeight;
    if (window.scrollY > firstViewportHeight) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleButtonVisibility, { passive: true });
  toggleButtonVisibility();
}

// Initialize features
initReadingProgressBar();
initBackToTopButton();
