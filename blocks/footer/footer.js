import { readBlockConfig } from '../../scripts/lib-franklin.js';
import createTag from '../../utils/tag.js';
import { returnLinkTarget } from '../../utils/helpers.js';

const extractCTAButton = (footer) => {
  const ctaButtonWrapper = footer.querySelector('div:first-of-type strong');
  const ctaButton = ctaButtonWrapper.querySelector('a');
  ctaButton.setAttribute('target', returnLinkTarget(ctaButton.href));
  ctaButton.classList.add('footer-cta-button', 'button', 'secondary');

  if (ctaButton) {
    return ctaButton;
  }
  return null;
};

const decorateDesktopFooterNav = (footerNavSection, ctaButton) => {
  const desktopFooterNavWrapper = createTag('div', {
    class: 'footer-nav-wrapper',
  });

  // create div to wrap around h3 + ul list
  const h3Elements = footerNavSection.querySelectorAll('h3');
  h3Elements.forEach((h3Element) => {
    const divElement = document.createElement('div');
    const mainLink = h3Element.querySelector('a');
    mainLink.setAttribute('target', returnLinkTarget(mainLink.href));
    mainLink.classList.add('link-highlight-colorful-effect');
    divElement.appendChild(h3Element.cloneNode(true));

    let nextSibling = h3Element.nextElementSibling;
    while (nextSibling.tagName === 'UL' && nextSibling.tagName !== 'H3') {
      // add animation effect class
      const navLinks = nextSibling.querySelectorAll('a');
      navLinks.forEach((navLink) => {
        navLink.setAttribute('target', returnLinkTarget(navLink.href));
        navLink.classList.add('link-underline-effect');
      });

      // clone the node
      divElement.appendChild(nextSibling.cloneNode(true));
      nextSibling = nextSibling.nextElementSibling;
    }
    desktopFooterNavWrapper.append(divElement);
  });

  // append div with cta-button if there's one
  if (ctaButton) {
    const ctaButtonDivElement = document.createElement('div');
    ctaButtonDivElement.appendChild(ctaButton.cloneNode(true));
    desktopFooterNavWrapper.append(ctaButtonDivElement);
  }

  return desktopFooterNavWrapper;
};

const decorateMobileFooterNav = (desktopFooterNav) => {
  const mobileFooterNavWrapper = createTag('div', {
    class: 'footer-nav-wrapper',
  });
  const footerNavColumns = [...desktopFooterNav.children];
  footerNavColumns.forEach((navColumn) => {
    const titleSection = createTag('div', {
      class: 'footer-nav-title-section',
    });
    const title = navColumn.querySelector('h3');
    if (title) {
      titleSection.append(title);
      mobileFooterNavWrapper.append(titleSection);
    }

    const titleSectionContent = navColumn.querySelector('ul');
    if (titleSectionContent) {
      const contentPanel = navColumn;
      navColumn.classList.add('panel');
      mobileFooterNavWrapper.append(contentPanel);
      titleSection.classList.add('with-panel');
    }
  });

  return mobileFooterNavWrapper;
};

const decorateFooterNavSection = (footer, ctaButton) => {
  const footerNavSection = footer.querySelector(':scope > div:first-of-type');
  footerNavSection.classList.add('footer-nav-section');
  const desktopFooterNav = decorateDesktopFooterNav(footerNavSection, ctaButton);
  const footerNavWithDivs = desktopFooterNav.cloneNode(true);
  const mobileFooterNav = decorateMobileFooterNav(footerNavWithDivs);
  desktopFooterNav.classList.add('desktop');
  mobileFooterNav.classList.add('mobile');

  footerNavSection.innerHTML = '';
  footerNavSection.append(desktopFooterNav, mobileFooterNav);
  // decorateMobileFooterNavAccordion(footerNavSection);
  return footerNavSection;
};

const decoratefooterCopyrightSection = (footer) => {
  const footerCopyrightSection = footer.querySelector(':scope > div:nth-child(2)');
  footerCopyrightSection.classList.add('footer-bottom');

  // open all footer links in new windows
  footerCopyrightSection.querySelectorAll('a').forEach((a) => {
    a.target = '_blank';
    // add hover effect class
    a.classList.add('link-underline-effect');
  });
  return footerCopyrightSection;
};

// -------------------- main function -------------------- //
/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('contained');

  const footerPath = cfg.footer || '/new-footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();

  // create a wrapper & allow extract of fetched footer content
  const footer = document.createElement('div');
  footer.classList.add('footer-section-wrapper');
  footer.innerHTML = html;

  // re-organize the footer into 2 sections
  const footerCTAButton = extractCTAButton(footer);
  const footerNavSection = decorateFooterNavSection(footer, footerCTAButton);
  const footerCopyrightSection = decoratefooterCopyrightSection(footer);
  footer.innerHTML = '';
  footer.append(footerNavSection, footerCopyrightSection);

  block.append(footer);
  block.classList.add('new-footer'); // add class for the styles
  footer.closest('footer').classList.add('appear');
}
