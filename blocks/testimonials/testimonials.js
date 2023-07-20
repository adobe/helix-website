import createTag from '../../utils/tag.js';
import { returnLinkTarget } from '../../utils/helpers.js';
import { initTabs } from '../tabs/tabs.js';

const separateStatInfo = (input) => {
  const regex = /^(\d+[\d+x]*\+?)\s*(.*)/;
  const match = input.match(regex);

  if (match) {
    const stats = match[1].trim();
    const remaining = match[2].trim();

    return [stats, remaining];
  }
  return [input.trim(), ''];
};

const decorateTestimonialContentSide = (contentDiv) => {
  const customerInfo = createTag('div', {
    class: 'customer-info',
  }, '');
  const customerIcon = contentDiv.querySelector('picture');
  if (customerIcon) {
    customerIcon.parentElement.remove();
    customerInfo.append(customerIcon);
  }

  const cta = contentDiv.querySelector('a');
  if (cta) {
    cta.classList.add('button', 'secondary');
    cta.setAttribute('target', returnLinkTarget(cta.href));
    cta.closest('p').remove();
  }

  const testimonialContentItems = contentDiv.querySelectorAll('p');
  const testimonialContentArray = Array.from(testimonialContentItems);
  const quoteItem = testimonialContentArray.find((contentItem) => contentItem.textContent.startsWith('"') || contentItem.textContent.startsWith('“'));
  if (quoteItem) quoteItem.classList.add('testimonial-quote');

  const customerTitles = contentDiv.querySelectorAll('p:not(.testimonial-quote');
  const titles = createTag('div', { class: 'titles' }, '');
  if (customerTitles && customerTitles.length > 0) {
    Array.from(customerTitles).forEach((title) => {
      titles.append(title);
    });
  }
  customerInfo.append(titles);
  if (cta) customerInfo.append(cta);

  // decorate statistics
  const statistics = contentDiv.querySelector('ul');
  if (statistics) {
    const statItems = statistics.querySelectorAll('li');
    statItems.forEach((item) => {
      const [stats, info] = separateStatInfo(item.textContent);
      if (info.length === 0) return;

      item.innerHTML = '';
      const statEl = createTag('span', { class: 'testimonial-stats' }, stats);
      const statInfoEl = createTag('span', { class: 'testimonial-stats-info' }, info);
      item.append(statEl, statInfoEl);
    });
  }

  // combining new structure together
  if (quoteItem) quoteItem.insertAdjacentElement('afterend', customerInfo);
};

let initCount = 0;
export default function decorate(block) {
  // tab logic
  const rows = block.querySelectorAll(':scope > div');
  if (!rows.length) return;

  // build tab list wrappers
  const tabList = createTag('div', {
    class: 'tab-list',
    role: 'tablist',
  });
  const tabListContainer = createTag('div', {
    class: 'tablist-container',
  });

  // build tab content
  const tabContent = createTag('div', {
    class: 'tabcontent',
  });
  const tabContentContainer = createTag('div', {
    class: 'tabcontent-container',
  });

  rows.forEach((row, index) => {
    const tabListContent = row.querySelector(':scope > div:first-child');
    const tabListTitle = Array.from(tabListContent.querySelectorAll('p:not(:empty)'))
      .filter((p) => p.querySelector('picture') === null)[0]; // workaround for missing :has() selector in Firefox
    const tabListImage = tabListContent.querySelector('picture');

    // init tablist
    const tabName = `tab-${index}`;
    const tabBtnAttributes = {
      role: 'tab',
      // class: btnClass,
      id: `tabs-${initCount}-${tabName}`,
      tabindex: (index > 0) ? '0' : '-1',
      'aria-selected': (index === 0) ? 'true' : 'false',
      'aria-controls': `tabs-panel-${initCount}-${tabName}`,
      'aria-label': tabListTitle.textContent ? tabListTitle.textContent.trim() : tabName,
      'data-tab-id': index,
    };
    const tabBtn = createTag('button', tabBtnAttributes);
    if (tabListImage) {
      tabBtn.append(tabListImage);
    } else {
      tabBtn.innerText = tabListTitle.textContent;
    }
    tabListContainer.append(tabBtn);

    // init tab content section
    const tabContentAttributes = {
      id: `tabs-panel-${initCount}-${tabName}`,
      role: 'tabpanel',
      class: 'tabpanel testimonial',
      tabindex: '0',
      'aria-labelledby': `tabs-${initCount}-${tabName}`,
    };
    const tabPanelContent = createTag('div', tabContentAttributes);
    if (index === 0) tabPanelContent.classList.add('active');

    const testimonialImageSide = row.querySelector(':scope > div:nth-child(2)');
    if (testimonialImageSide) testimonialImageSide.classList.add('image-side');

    const testimonialContentSide = row.querySelector(':scope > div:nth-child(3)');
    if (testimonialContentSide) {
      testimonialContentSide.classList.add('testimonial-info');
      decorateTestimonialContentSide(testimonialContentSide);
    }

    if (testimonialImageSide && testimonialContentSide) {
      tabPanelContent.append(testimonialImageSide, testimonialContentSide);
    }
    tabContentContainer.append(tabPanelContent);
  });

  tabList.append(tabListContainer);
  if (tabList.querySelector('img')) tabList.classList.add('image-based');

  tabContent.append(tabContentContainer);

  block.innerHTML = '';
  block.append(tabList, tabContent);

  initTabs(block);
  initCount += 1;
}
