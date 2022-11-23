/*
 * tabs - consonant v5.1
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
 */
import { createTag } from '../../scripts/scripts.js';

const isElementInContainerView = (targetEl) => {
  const rect = targetEl.getBoundingClientRect();
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const scrollTabIntoView = (e) => {
  const isElInView = isElementInContainerView(e);
  /* c8 ignore next */
  if (!isElInView) e.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
};

function changeTabs(e) {
  const { target } = e;
  const parent = target.parentNode;
  const grandparent = parent.parentNode.nextElementSibling;
  parent
    .querySelectorAll('[aria-selected="true"]')
    .forEach((t) => t.setAttribute('aria-selected', false));
  target.setAttribute('aria-selected', true);
  scrollTabIntoView(target);
  grandparent
    .querySelectorAll('[role="tabpanel"]')
    .forEach((p) => p.setAttribute('hidden', true));
  grandparent.parentNode
    .querySelector(`#${target.getAttribute('aria-controls')}`)
    .removeAttribute('hidden');
}

function initTabs(e) {
  const tabs = e.querySelectorAll('[role="tab"]');
  const tabLists = e.querySelectorAll('[role="tablist"]');
  tabLists.forEach((tabList) => {
    let tabFocus = 0;
    tabList.addEventListener('keydown', (p) => {
      if (p.key === 'ArrowRight' || p.key === 'ArrowLeft') {
        tabs[tabFocus].setAttribute('tabindex', -1);
        if (p.key === 'ArrowRight') {
          tabFocus += 1;
          /* c8 ignore next */
          if (tabFocus >= tabs.length) tabFocus = 0;
        } else if (e.key === 'ArrowLeft') {
          tabFocus -= 1;
          /* c8 ignore next */
          if (tabFocus < 0) tabFocus = tabs.length - 1;
        }
        tabs[tabFocus].setAttribute('tabindex', 0);
        tabs[tabFocus].focus();
      }
    });
  });
  tabs.forEach((tab) => {
    tab.addEventListener('click', changeTabs);
  });
}

let initCount = 0;
const init = (e) => {
  const rows = e.querySelectorAll(':scope > div');
  let tabPos = '';
  /* c8 ignore next */
  if (!rows.length) return;

  // Tab Content
  const tabContentContainer = createTag('div', { class: 'tabcontent-container' });
  const tabContent = createTag('div', { class: 'tabcontent' }, tabContentContainer);
  e.append(tabContent);

  // Tab List
  const tabList = rows[0];
  const tabId = `tabs-${initCount}`;
  e.id = tabId;
  tabList.classList.add('tabList');
  tabList.setAttribute('role', 'tablist');
  const tabListContainer = tabList.querySelector(':scope > div');
  tabListContainer.classList.add('tablist-container');
  const tabListItems = rows[0].querySelectorAll(':scope li');
  if (tabListItems) {
    const btnClass = [...e.classList].includes('quiet') ? 'heading-XS' : 'heading-XS';
    tabListItems.forEach((item, i) => {
      item[i] = `tab${i}`;
      const tabName = item[i];
      const tabBtnAttributes = {
        role: 'tab',
        class: btnClass,
        id: `tab-${initCount}-${tabName}`,
        tabindex: (i > 0) ? '0' : '-1',
        'aria-selected': (i === 0) ? 'true' : 'false',
        'aria-controls': `tab-panel-${initCount}-${tabName}`,
      };
      const tabBtn = createTag('button', tabBtnAttributes);
      tabBtn.innerText = item.textContent;
      tabListContainer.append(tabBtn);

      const tabContentAttributes = {
        id: `tab-panel-${initCount}-${tabName}`,
        role: 'tabpanel',
        class: 'tabpanel',
        tabindex: '0',
        'aria-labelledby': `tab-${initCount}-${tabName}`,
      };
      const tabListContent = createTag('div', tabContentAttributes);
      tabListContent.setAttribute('aria-labelledby', `tab-${initCount}-${tabName}`);
      if (i > 0) tabListContent.setAttribute('hidden', '');
      tabContentContainer.append(tabListContent);
    });
    tabListItems[0].parentElement.remove();
  }

  const tabContents = [];

  // Tab Sections
  const allSections = Array.from(document.querySelectorAll('div.section'));
  allSections.forEach((x) => {
    if (x.className.includes('tab-')) {
      tabContents.push(x);
    }
  });

  tabContents.forEach((y, i) => {
    tabPos = `tab${i}`;
    y.removeAttribute('data-section-status');
    y.remove();
    const assocTabItem = document.getElementById(`tab-panel-${initCount}-${tabPos}`);
    if (assocTabItem) assocTabItem.append(y);
  });
  initTabs(e);
  initCount += 1;
};
export default init;
