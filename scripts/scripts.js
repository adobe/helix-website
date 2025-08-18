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
  getAllMetadata,
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

const AUDIENCES = {
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,
  // define your custom audiences here as needed
};

window.hlx.plugins.add('performance', {
  condition: () => window.name.includes('performance'),
  load: 'eager',
  url: '/plugins/performance.js',
});

window.hlx.plugins.add('experimentation', {
  condition: () => getMetadata('experiment')
    || Object.keys(getAllMetadata('campaign')).length
    || Object.keys(getAllMetadata('audience')).length,
  options: { audiences: AUDIENCES },
  load: 'eager',
  url: '/plugins/experimentation/src/index.js',
});

window.hlx.plugins.add('time-decorator', {
  load: 'lazy',
  url: '/plugins/time-decorator.js',
});

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
  const contentSections = main.querySelectorAll(
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

export function decoratesSkillTemplate(main) {
  if (!document.body.classList.contains('skills-template') || !main) return;
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

function buildEmbeds(main) {
  const embeds = [
    ...main.querySelectorAll(
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

function decorateBreadcrumb(main) {
  if (!document.body.classList.contains('guides-template') && !document.body.classList.contains('blog-template')) {
    return;
  }

  const existingBC = document.querySelector('.breadcrumb-wrapper');
  if (existingBC) existingBC.remove();

  const wrapper = document.createElement('div');
  wrapper.classList.add('breadcrumb-wrapper');

  const breadcrumb = document.createElement('div');
  breadcrumb.classList.add('breadcrumb');

  const div1 = document.createElement('div');
  const div2 = document.createElement('div');

  div1.append(div2);
  breadcrumb.append(div1);

  wrapper.append(breadcrumb);
  main.prepend(wrapper);

  const isDocumentationLanding = window.location.pathname === '/docs/';
  const blogTemplate = document.body.classList.contains('blog-template');

  const list = createTag('ul');
  const home = createTag('li', {}, '<a href="/home" class="breadcrumb-link-underline-effect">Home</a>');
  list.append(home);

  const template = getMetadata('template');

  if (template === 'blog') {
    const blog = createTag('li', {}, '<a href="/blog" class="breadcrumb-link-underline-effect">Blog</a>');
    list.append(blog);
  } else {
    const docs = createTag('li', {}, '<a href="/docs/" class="breadcrumb-link-underline-effect">Documentation</a>');
    list.append(docs);
  }

  const category = getMetadata('category');
  const title = getMetadata('og:title');
  if (category) {
    const section = createTag(
      'li',
      {},
      `<a href="/docs/#${category.toLowerCase()}" class="breadcrumb-link-underline-effect category">${category}</a>`,
    );
    list.append(section);
  }

  if (template && template !== 'blog') {
    const section = createTag(
      'li',
      {},
      `<a href="/docs/#${template.toLowerCase()}" class="breadcrumb-link-underline-effect category">${template}</a>`,
    );
    list.append(section);
  }

  if (!isDocumentationLanding) {
    const article = createTag('li', {}, `<a href="${window.location.pathname}">${title}</a>`);
    list.append(article);

    if (!blogTemplate) {
      const backBtn = createTag('div', { class: 'guides-back-btn desktop' }, `
          <span class="icon icon-icon-arrow"></span>
          <a href="/docs/" class="link-underline-effect">
              Back
          </a>
      `);
      document.querySelector('.availability-wrapper, .default-content-wrapper').prepend(backBtn);
    }
  }

  // make the last item to be unclickable as already on the page
  const listLinks = list.querySelectorAll('a');
  const lastLinkItem = listLinks[listLinks.length - 1];
  lastLinkItem.classList.remove('breadcrumb-link-underline-effect');
  lastLinkItem.style.cursor = 'default';
  lastLinkItem.addEventListener('click', (e) => e.preventDefault());

  breadcrumb.classList.add('contained');
  if (isDocumentationLanding) {
    breadcrumb.parentElement.classList.add('no-shadow');
  }

  const innerDiv = breadcrumb.querySelector(':scope > div > div');
  innerDiv.append(list);
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

function decorateSVGs(main) {
  // get all links that end with .svg
  const svgLinks = main.querySelectorAll('div.default-content-wrapper a[href$=".svg"]');
  Array.from(svgLinks).forEach((svg) => {
    const svgHref = new URL(svg.href).pathname;

    const svgEl = createTag('img', {
      src: svgHref,
      // use the path name as the alt text
      alt: svgHref.split('/').pop().split('.')[0],
      width: '100%',
      // class: 'logo-wall-item-svg',
    });

    svg.replaceWith(svgEl);
  });
}

function buildAuthorBox(main) {
  const div = document.createElement('div');
  const authors = getMetadata('author').split(',').map((author) => author.trim());
  const publicationDate = getMetadata('publication-date');
  const authorImages = authors.map((_, i) => getMetadata(`author${i + 1}-image`));
  const authorBlurbs = authors.map((_, i) => getMetadata(`author${i + 1}-blurb`));

  const authorBoxBlockEl = buildBlock('author-box', authors.map((author, i) => [
    `<img src="${authorImages[i]}" alt="${author}" title="${author}">`,
    `<p>${author}</p>
    <p>${publicationDate}</p>
    <p>${authorBlurbs[i]}</p>`,
  ]));

  div.append(authorBoxBlockEl);
  main.append(div);
}

// --------------- Main functions here ---------------- //

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks(main) {
  try {
    if (getMetadata('author') && !main.querySelector('.author-box')) {
      buildAuthorBox(main);
    }
    buildEmbeds(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

export function loadFeedData() {
  window.siteindex = window.siteindex || { archive: { data: [] }, loaded: false };
  const offset = 0;

  fetch(`/community-feeds.json?offset=${offset}`)
    .then((response) => response.json())
    .then((responseJson) => {
      window.siteindex.archive.data = responseJson?.archive?.data;
      window.siteindex.loaded = true;
      const event = new Event('dataset-ready');
      document.dispatchEvent(event);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(`Error loading query index: ${error.message}`);
    });
}

export function loadBlogData() {
  window.blogindex = window.blogindex || { data: [], loaded: false };
  const offset = 0;

  fetch(`/query-index.json?offset=${offset}`)
    .then((response) => response.json())
    .then((responseJson) => {
      window.blogindex.data = responseJson?.data?.filter((entry) => entry.path.startsWith('/blog/')) || [];
      window.blogindex.loaded = true;
      const event = new Event('dataset-ready');
      document.dispatchEvent(event);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(`Error loading query index: ${error.message}`);
    });
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
  decoratesSkillTemplate(main);
  decorateBlocks(main);
  decorateTitleSection(main);
  decorateSVGs(main);
}

function prepareSideNav(main) {
  const aside = createTag('aside');
  main.insertBefore(aside, main.querySelector('.section.content'));
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  setLanguageForAccessibility('en');
  customDecorateTemplateAndTheme();

  await window.hlx.plugins.run('loadEager');

  // labs banner
  const labs = getMetadata('labs');
  if (labs) {
    const labsBanner = buildBlock('labs', labs);
    const h1 = document.querySelector('h1');
    if (h1) {
      // insert above title
      h1.parentElement.insertBefore(labsBanner, h1);
    } else {
      // insert at top of page
      document.querySelector('main > div').append(labsBanner);
    }
  }

  // deprecation banner
  const deprecation = getMetadata('deprecation');
  if (deprecation) {
    const deprecationBanner = buildBlock('deprecation', deprecation);
    const h1 = document.querySelector('h1');
    if (h1) {
      // insert above title
      h1.parentElement.insertBefore(deprecationBanner, h1);
    } else {
      // insert at top of page
      document.querySelector('main > div').append(deprecationBanner);
    }
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    decorateBreadcrumb(main);
    prepareSideNav(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');

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

  if (getMetadata('supressframe')) {
    doc.querySelector('header').remove();
    doc.querySelector('footer').remove();
  } else {
    // breadcrumb setup
    // loadBreadcrumb(main);
    // sidebar + related style setup
    const aside = main.querySelector('main > aside');
    if (aside) setUpSideNav(main, aside);
    decorateGuideTemplateCodeBlock();
  }

  window.hlx.plugins.run('loadLazy');

  sampleRUM('lazy');

  // check to see if this is reflected in google indexed page
  document.documentElement.classList.add('index-test-scripts-js-2024-08-23');
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => {
    window.hlx.plugins.load('delayed');
    window.hlx.plugins.run('loadDelayed');
    // eslint-disable-next-line import/no-cycle
    return import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Decorates the page.
 */
async function loadPage(doc) {
  await window.hlx.plugins.load('eager');
  await loadEager(doc);
  await window.hlx.plugins.load('lazy');
  await loadLazy(doc);
  loadDelayed(doc);
}

/* disable redirect for now
if (window.location.hostname === 'www.hlx.live') {
  const url = `https://www.aem.live${window.location.pathname}${window.location.search}${window.location.hash}`;
  // eslint-disable-next-line no-console
  console.log(`redirecting to ${url}`);
}
*/

loadPage(document);
