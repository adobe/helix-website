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

export default { removeOuterElementLayer };
