import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  toClassName,
  decorateSections,
  decorateBlocks,
  waitForLCP,
  loadBlocks,
  loadBlock,
  loadCSS,
  loadScript,
  getMetadata,
  decorateBlock,
} from './lib-franklin.js';
import {
  addInViewAnimationToSingleElement,
  addInViewAnimationToMultipleElements,
  returnLinkTarget,
} from '../utils/helpers.js';

// Constants here
const LCP_BLOCKS = ['hero', 'logo-wall']; // add your LCP blocks to the list

// -------------  Custom functions ------------- //

/* set language in html tag for improving SEO accessibility */
export function setLanguageForAccessibility(lang = 'en') {
  document.documentElement.lang = lang;
}

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {array} attributes attributes to be added
 */
export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|[string]} url The URL(s) to add as dependencies
 */
export function addPublishDependencies(url) {
  const urls = Array.isArray(url) ? url : [url];
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies = window.hlx.dependencies.concat(urls);
  } else {
    window.hlx.dependencies = urls;
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

export function customDecorateButtons(block = document) {
  const noButtonBlocks = ['cards', 'pagination', 'card-list'];
  block.querySelectorAll(':scope a').forEach((a) => {
    a.title = a.title || a.textContent;
    const $block = a.closest('div.section > div > div');
    let blockName;
    if ($block) {
      blockName = $block.className;
    }
    if (!noButtonBlocks.includes(blockName) && a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (
          up.childNodes.length === 1
          && (up.tagName === 'P' || up.tagName === 'DIV')
        ) {
          a.className = 'button primary';
          up.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

export function addAnchorLink(elem) {
  const link = document.createElement('a');
  link.setAttribute('href', `#${elem.id || ''}`);
  link.setAttribute('title', `Copy link to "${elem.textContent}" to clipboard`);
  link.classList.add('anchor-link');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.href);
    window.location.href = link.href;
    e.target.classList.add('anchor-link-copied');
    setTimeout(() => e.target.classList.remove('anchor-link-copied'), 1000);
  });
  link.innerHTML = elem.innerHTML;
  elem.innerHTML = '';
  elem.append(link);
}

export function decorateHeadings(main) {
  if (!document.body.classList.contains('docs-template')) return;
  main.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
    addAnchorLink(h);
  });
}

export function addMessageBoxOnGuideTemplate(main) {
  const messageBox = createTag('div', { class: 'message-box' }, 'Link copied!');
  main.append(messageBox);
}

export function addHeadingAnchorLink(elem) {
  const link = document.createElement('a');
  link.setAttribute('href', `#${elem.id || ''}`);
  link.setAttribute('title', `Copy link to "${elem.textContent}" to clipboard`);
  // hover highlight on title
  if (elem.tagName === 'H2') {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect');
  } else {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect-2');
  }
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.href);
    window.location.href = link.href;
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
      messageBox.classList.add('active', 'fill');
      setTimeout(() => {
        messageBox.classList.remove('active');
        setTimeout(() => {
          messageBox.classList.remove('fill');
        }, 300);
      }, 1000);
    }

    e.target.classList.add('anchor-link-copied');
    setTimeout(() => {
      e.target.classList.remove('anchor-link-copied');
    }, 1000);
  });
  link.innerHTML = elem.innerHTML;
  elem.innerHTML = '';
  elem.append(link);
}

export function decorateGuideTemplateHeadings(main) {
  const contentArea = main.querySelector('.section.content');
  if (!contentArea) return;
  const contentSections = contentArea.querySelectorAll(
    '.default-content-wrapper',
  );
  if (!contentSections) return;
  contentSections.forEach((section) => {
    section.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
      addHeadingAnchorLink(h);
    });
  });
}

export function decorateGuideTemplateHero(main) {
  if (main.classList.contains('without-full-width-hero'));
  const firstImageInContentArea = main.querySelector(
    '.section.content .default-content-wrapper img',
  );
  if (firstImageInContentArea) firstImageInContentArea.classList.add('doc-detail-hero-image');
}

export function decorateGuideTemplateLinks(main) {
  const links = main.querySelectorAll('.content a');
  links.forEach((link) => {
    link.setAttribute('target', returnLinkTarget(link.href));
  });
}

function animateTitleSection(section) {
  const animationConfig = {
    staggerTime: 0.3,
    items: [
      {
        selector: '.icon-eyebrow',
        animatedClass: 'slide-reveal-up',
      },
      {
        selector: '.main-headline',
        animatedClass: 'slide-reveal-up',
      },
    ],
  };
  const trigger = section.querySelector('.default-content-wrapper');

  const image = trigger.querySelector('picture');
  if (image) {
    // addInViewAnimationToSingleElement(image, 'item-fade-in');

    // udpated logic
    const imageParent = image.parentElement;
    imageParent.classList.add('default-content-image-wrapper');
    addInViewAnimationToSingleElement(imageParent, 'fade-in');
    animationConfig.items.unshift({
      selector: '.default-content-image-wrapper',
      animatedClass: 'fade-in',
    });
  }
  addInViewAnimationToMultipleElements(
    animationConfig.items,
    trigger,
    animationConfig.staggerTime,
  );
}

export function decorateTitleSection(main) {
  const titleSections = main.querySelectorAll('.title-section');
  if (!titleSections) return;
  titleSections.forEach((section) => {
    const elements = section.querySelectorAll('h1,h2,h3,h4,h5,h6');
    if (!elements || elements.length < 2) return;
    const eyebrow = elements[0];
    const headline = elements[1];
    if (eyebrow) {
      eyebrow.classList.add('icon-eyebrow');
    }
    if (headline) {
      headline.classList.add('main-headline');
    }
    animateTitleSection(section);
  });
}

// based on decorateTemplateAndTheme in lib-franklin.js
export function customDecorateTemplateAndTheme() {
  const addClasses = (element, classes) => {
    classes.split(',').forEach((c) => {
      element.classList.add(toClassName(c.trim()));
    });
  };
  const template = getMetadata('template');
  if (template) addClasses(document.body, `${template.toLowerCase()}-template`);
  const theme = getMetadata('theme');
  if (theme) addClasses(document.body, `${theme.toLowerCase()}-theme`);
}

async function loadHighlightLibrary() {
  const highlightCSS = createTag('link', {
    rel: 'stylesheet',
    href: '/libs/highlight/atom-one-dark.min.css',
  });
  document.head.append(highlightCSS);

  await loadScript('/libs/highlight/highlight.min.js');
  const initScript = createTag('script', {}, 'hljs.highlightAll();');
  document.body.append(initScript);
}

export async function decorateGuideTemplateCodeBlock() {
  const firstCodeBlock = document.querySelector('pre code');
  if (!firstCodeBlock) return;

  const intersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadHighlightLibrary();
        }
      });
    },
    {
      root: null,
      rootMargin: '200px', // Adjust rootMargin as needed to trigger intersection at the desired position before the codeblock becomes visible
      threshold: 0,
    },
  );

  // when first codeblock is coming into view, load highlight.js for page
  intersectionObserver.observe(firstCodeBlock);
}

export function decorateGuideTemplate(main) {
  if (!document.body.classList.contains('guides-template') || !main) return;
  addMessageBoxOnGuideTemplate(main);
  decorateGuideTemplateHeadings(main);
  decorateGuideTemplateHero(main);
  decorateGuideTemplateLinks(main);
}

/**
 * Clean up variant classes
 * Ex: marquee--small--contained- -> marquee small contained
 * @param {HTMLElement} parent
 */
export function cleanVariations(parent) {
  const variantBlocks = parent.querySelectorAll('[class$="-"]');
  return Array.from(variantBlocks).map((variant) => {
    const { className } = variant;
    const classNameClipped = className.slice(0, -1);
    variant.classList.remove(className);
    const classNames = classNameClipped.split('--');
    variant.classList.add(...classNames);
    return variant;
  });
}

function buildEmbeds() {
  const embeds = [
    ...document.querySelectorAll(
      'a[href^="https://www.youtube.com"], a[href^="https://gist.github.com"]',
    ),
  ];
  embeds.forEach((embed) => {
    embed.replaceWith(buildBlock('embed', embed.outerHTML));
  });
}

function updateGuideTemplateStyleBasedOnHero() {
  const isHeroContentExist = document.querySelector(
    '.guides-template .section.heading',
  );

  if (isHeroContentExist) {
    document.querySelector('main').classList.add('has-full-width-hero');
    const cardListBlocks = document.querySelectorAll('.block.card-list');
    // make card list in main category page has '.image-card-listing' class
    cardListBlocks.forEach((block) => block.classList.add('image-card-listing'));
  } else {
    document.querySelector('main').classList.add('without-full-width-hero');
  }
}

function addBlockLevelInViewAnimation(main) {
  const observerOptions = {
    threshold: 0.2, // add `.in-view` class when is 20% in view
    // rootMargin: '-10px 0px -10px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // support block level animation as well
  const inviewTriggerClassList = '.fade-up, .fade-in, .fade-left, .fade-right';
  const sections = Array.from(main.querySelectorAll(inviewTriggerClassList));
  sections.forEach((section) => {
    observer.observe(section);
  });
}

export function loadBreadcrumb(main) {
  const breadcrumbBlock = buildBlock('breadcrumb', '');
  const breadcrumbWrapper = createTag('div');
  breadcrumbWrapper.append(breadcrumbBlock);
  main.insertBefore(breadcrumbWrapper, main.querySelectorAll('.section')[0]);
  decorateBlock(breadcrumbBlock);
  return loadBlock(breadcrumbBlock);
}

export function setUpSideNav(main, aside) {
  const sideNav = buildBlock('side-navigation', '');
  aside.append(sideNav);
  main.insertBefore(aside, main.querySelector('.section.content'));
  updateGuideTemplateStyleBasedOnHero();
  decorateBlock(sideNav);
  return loadBlock(sideNav);
}

// --------------- Main functions here ---------------- //

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks(main) {
  try {
    buildEmbeds(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  buildAutoBlocks(main);
  decorateIcons(main);
  decorateSections(main);
  customDecorateButtons(main);
  decorateHeadings(main);
  decorateGuideTemplate(main);
  decorateBlocks(main);
  decorateTitleSection(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  setLanguageForAccessibility('en');
  customDecorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  const aside = createTag('aside');
  main.insertBefore(aside, main.querySelector('.section.content'));

  // NOTE:'.redesign' class is needed for the redesign styles, keep this
  document.body.classList.add('redesign');

  await loadBlocks(main);
  addBlockLevelInViewAnimation(main);

  const { hash } = window.location;
  if (hash) {
    setTimeout(() => {
      const element = hash ? main.querySelector(hash) : false;
      if (element) {
        element.scrollIntoView();
      }
    }, 500);
  }

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/img/franklin-favicon.png`);

  if (getMetadata('supressframe')) {
    doc.querySelector('header').remove();
    doc.querySelector('footer').remove();
    return;
  }

  // breadcrumb setup
  // loadBreadcrumb(main);
  // sidebar + related style setup
  setUpSideNav(main, aside);

  decorateGuideTemplateCodeBlock();

  sampleRUM('lazy');
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Decorates the page.
 */
async function loadPage(doc) {
  // eslint-disable-next-line no-use-before-define
  await loadEager(doc);
  // eslint-disable-next-line no-use-before-define
  await loadLazy(doc);
  // eslint-disable-next-line no-use-before-define
  loadDelayed(doc);
}

loadPage(document);

if (window.name.includes('performance')) {
  import('./performance.js').then((mod) => {
    if (mod.default) mod.default();
  });
}
