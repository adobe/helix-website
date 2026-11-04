import createTag from './tag.js';

/**
 * * @param {HTMLElement} element the element with the parent undesired wrapper, like <p></p>
 * * @param {targetSelector} string selector of the target element
 * result: removed the undesired wrapper
 */
export function removeOuterElementLayer(element, targetSelector) {
  const targetElement = element.querySelector(targetSelector);
  if (targetElement) {
    const parent = targetElement.parentNode;
    if (parent) (parent).replaceWith(targetElement);
  }
}

/**
 * * @param {HTMLElement} element the elemen/block with mutilple child
 * * that you want to combine that into single div only
 * result: single div with all children elements
 * e.g. input: <div class="wrapper">
 * *            <div class="unwanted-wrapper-one"> <p/> </div>
 * *            <div class="unwanted-wrapper-two"> <br/> </div>
 * *           </div>
 * * output: <div class="wrapper">
 * *            <div>
 * *                <p/> <br/>
 * *            </div>
 * *         </div>
 */
export function combineChildrenToSingleDiv(element) {
  const targetChildren = element.querySelectorAll(':scope > div');
  if (targetChildren.length === 0) { return; }

  const singleDiv = document.createElement('div');
  targetChildren.forEach((targetChild) => {
    const children = Array.from(targetChild.childNodes);
    children.forEach((childElement) => {
      singleDiv.appendChild(childElement);
    });
    targetChild.remove();
  });

  element.append(singleDiv);
}

/**
 * * @param {HTMLElement} element
 * * @param {string} targetTag, like 'ul' or 'div'
 * * @param {string} className
 * result: return the new element with inner content of the element, desired tag and css class
 */
export function changeTag(element, targetTag, className) {
  const newElClass = className || '';
  const innerContent = element.innerHTML;
  const newTagElement = createTag(targetTag, { class: newElClass }, innerContent);

  return newTagElement;
}

/**
 * * @param {string} url the href of a link element
 * result: return `_self` or `_blank` if the link has the same host
 */
export function returnLinkTarget(url) {
  const currentHost = window.location.host;
  const urlObject = new URL(url);
  const isSameHost = urlObject.host === currentHost;

  // take in pathname that should be opened in new tab, in redirects excel
  const redirectExternalPaths = ['/history', '/chat'];
  const redirectToExternalPath = redirectExternalPaths.includes(urlObject.pathname);

  if (!isSameHost || redirectToExternalPath) {
    return '_blank';
  }
  return '_self';
}

const BLOCK_COLLECTION_ORIGIN = 'https://main--aem-block-collection--adobe.aem.live';
// The Sidekick Library only exists on the `sidekick-library` branch of the block collection.
const SIDEKICK_LIBRARY_ORIGIN = 'https://sidekick-library--aem-block-collection--adobe.aem.page';
const SIDEKICK_LIBRARY_PATH = '/tools/sidekick/library.html';

/**
 * The pipeline rewrites absolute links to any `*.aem.page` / `*.aem.live` site into relative
 * links, which breaks links to resources that only exist on another site (the block collection).
 * Returns the absolute URL the given (already relativized) link should point to, or `null` if
 * the link does not need to be restored.
 * @param {URL} url the resolved url of a link element
 * @param {string} [origin] the origin of the current page
 * @returns {string|null} the absolute url to restore, or `null`
 */
export function restoreCrossSiteUrl(url, origin = window.location.origin) {
  // only links that resolved against the current site were relativized by the pipeline
  if (url.origin !== origin) {
    return null;
  }
  if (url.pathname.startsWith('/block-collection/')) {
    return `${BLOCK_COLLECTION_ORIGIN}${url.pathname}`;
  }
  if (url.pathname === SIDEKICK_LIBRARY_PATH) {
    // the library is configured through the query string (plugin, path, index)
    return `${SIDEKICK_LIBRARY_ORIGIN}${url.pathname}${url.search}${url.hash}`;
  }
  return null;
}

/**
 * Restores cross-site links (see `restoreCrossSiteUrl`) for every link in the given element,
 * not only the ones inside a `.content` section: `.content` is authored through section
 * metadata, so most sections of a page do not have it. Restored links, and all links inside
 * a `.content` section, also get a `target` that matches their host.
 * @param {HTMLElement} main the element containing the links, usually `main`
 * @param {string} [origin] the origin of the current page
 */
export function restoreCrossSiteLinks(main, origin = window.location.origin) {
  const contentLinks = new Set(main.querySelectorAll('.content a[href]'));
  main.querySelectorAll('a[href]').forEach((link) => {
    let url;
    try {
      url = new URL(link.href);
    } catch {
      return; // not a valid url, leave the link alone
    }
    const restored = restoreCrossSiteUrl(url, origin);
    if (restored) {
      link.href = restored;
    }
    if (restored || contentLinks.has(link)) {
      link.setAttribute('target', returnLinkTarget(link.href));
    }
  });
}

// as the blocks are loaded in aysnchronously, we don't have a specific timing
// that the all blocks are loaded -> cannot use a single observer to
// observe all blocks, so use functions here in blocks instead
// eslint-disable-next-line max-len
const requireRevealWrapper = ['slide-reveal-up', 'slide-reveal-up-slow'];

export function addRevealWrapperToAnimationTarget(element) {
  const revealWrapper = createTag('div', { class: 'slide-reveal-wrapper' });
  const parent = element.parentNode;
  // Insert the wrapper before the element
  parent.insertBefore(revealWrapper, element);
  revealWrapper.appendChild(element);
}

// eslint-disable-next-line max-len
export function addAnimatedClassToElement(targetSelector, animatedClass, delayTime, targetSelectorWrapper) {
  const target = targetSelectorWrapper.querySelector(targetSelector);
  if (target) {
    target.classList.add(animatedClass);
    if (delayTime) target.style.transitionDelay = `${delayTime}s`;
    if (requireRevealWrapper.indexOf(animatedClass) !== -1) {
      addRevealWrapperToAnimationTarget(target);
    }
  }
}

// eslint-disable-next-line max-len
export function addAnimatedClassToMultipleElements(targetSelector, animatedClass, delayTime, targetSelectorWrapper, staggerTime) {
  const targets = targetSelectorWrapper.querySelectorAll(targetSelector);
  if (targets) {
    targets.forEach((target, i) => {
      target.classList.add(animatedClass);
      if (delayTime) target.style.transitionDelay = `${delayTime * (i + 1)}s`;
      if (staggerTime) target.style.transitionDelay = `${delayTime + staggerTime * (i + 1)}s`;
      if (requireRevealWrapper.indexOf(animatedClass) !== -1) {
        addRevealWrapperToAnimationTarget(target);
      }
    });
  }
}

export function addInviewObserverToTriggerElement(triggerElement) {
  const observerOptions = {
    threshold: 0.25, // show when is 25% in view
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  observer.observe(triggerElement);
}

// eslint-disable-next-line max-len
export function addInViewAnimationToSingleElement(targetElement, animatedClass, triggerElement, delayTime) {
  // if it's HTML element
  if (targetElement.nodeType === 1) {
    targetElement.classList.add(animatedClass);
    if (requireRevealWrapper.indexOf(animatedClass) !== -1) {
      addRevealWrapperToAnimationTarget(targetElement);
    }
  }
  // if it's string only, which should be a selector
  if (targetElement.nodeType === 3) {
    addAnimatedClassToElement(targetElement, animatedClass, triggerElement, delayTime);
  }
  const trigger = triggerElement || targetElement;
  addInviewObserverToTriggerElement(trigger);
}

export function addInViewAnimationToMultipleElements(animatedItems, triggerElement, staggerTime) {
  // set up animation class
  animatedItems.forEach((el, i) => {
    const delayTime = staggerTime ? i * staggerTime : null;
    if (Object.prototype.hasOwnProperty.call(el, 'selector')) {
      addAnimatedClassToElement(el.selector, el.animatedClass, delayTime, triggerElement);
    }
    if (Object.prototype.hasOwnProperty.call(el, 'selectors')) {
      // eslint-disable-next-line max-len
      addAnimatedClassToMultipleElements(el.selectors, el.animatedClass, el.staggerTime, triggerElement);
    }
  });

  // add `.in-view` to triggerElement, so the elements inside will start animating
  addInviewObserverToTriggerElement(triggerElement);
}

export default {
  removeOuterElementLayer,
  changeTag,
  returnLinkTarget,
  restoreCrossSiteUrl,
  restoreCrossSiteLinks,
  addInViewAnimationToSingleElement,
  addInViewAnimationToMultipleElements,
  addInviewObserverToTriggerElement,
};
