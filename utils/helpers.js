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
  const urlHost = urlObject.host;
  return urlHost === currentHost ? '_self' : '_blank';
}

/**
 * * @param {string} className the target animation class
 * * @param {string} targetElement
 * result: when the elements are inview observed by the intersection
 * observer, it adds `in-view` class which should restore its
 * original state and add in animation
 */
// TODO: review if that's the best way for adding in-view animations
export function addInViewAnimationToElement(className, targetElement) {
  targetElement.classList.add(className);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  });

  observer.observe(targetElement);
}

export default {
  removeOuterElementLayer, changeTag, returnLinkTarget, addInViewAnimationToElement,
};
