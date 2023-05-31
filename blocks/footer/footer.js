import { readBlockConfig } from '../../scripts/scripts.js';

// TODO: mock env handling, update this when it's on production/ launch
const getENVbyPath = () => {
  const currentURL = window.location.href;
  const redesignPath = 'drafts/redesign/';
  if (currentURL.includes(redesignPath)) {
    return 'redesign';
  }
  return 'original-design';
};

const decorateFooterTopSection = (footer) => {
  const footerTopSection = footer.querySelector(':scope > div:first-of-type');
  footerTopSection.classList.add('footer-top');
  // console.log(footerTopSection)
  return footerTopSection;
};

const decorateFooterBottomSection = (footer) => {
  const footerBottomSection = footer.querySelector(':scope > div:nth-child(2)');
  footerBottomSection.classList.add('footer-bottom');

  // open all footer links in new windows
  footerBottomSection.querySelectorAll('a').forEach((a) => {
    a.target = '_blank';
  });
  return footerBottomSection;
};

// -------------------- main function -------------------- //
/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const ENV = getENVbyPath();
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // TODO: need to update the logic when move over to production
  if (ENV === 'redesign') {
    document.body.classList.add('redesign');
    const footerPath = cfg.footer || '/drafts/redesign/new-footer';
    const resp = await fetch(`${footerPath}.plain.html`);
    const html = await resp.text();

    // create a wrapper & allow extract of fetched footer content
    const footer = document.createElement('div');
    footer.classList.add('footer-section-wrapper');
    footer.innerHTML = html;

    // re-organize the footer into 2 sections
    const footerTopSection = decorateFooterTopSection(footer);
    const footerBottomSection = decorateFooterBottomSection(footer);
    footer.innerHTML = '';
    footer.append(footerTopSection, footerBottomSection);

    block.append(footer);
    block.classList.add('new-footer'); // add class for the styles
    footer.closest('footer').classList.add('appear');
    return;
  }

  // original footer:
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  block.append(footer);
  footer.closest('footer').classList.add('appear');

  // open all footer links in new windows
  block.querySelectorAll('a').forEach((a) => {
    a.target = '_blank';
  });
}
