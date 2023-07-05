import createTag from '../../utils/tag.js';
import { returnLinkTarget } from '../../utils/helpers.js';

let searchFunc;
let searchTerm;

const searchParams = new URLSearchParams(window.location.search);

const MOBILE_BREAKPOINT = 900;

const debounce = (func, time = 100) => {
  let timer;
  return (event) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, time, event);
  };
};

const loadSearch = async (inputsArray, resultsContainer) => {
  const gnavSearch = await import('./side-navigation-search.js');
  searchFunc = gnavSearch.default;

  if (/[?&]q=/.test(window.location.search)) {
    searchTerm = searchParams.get('q');
  }

  if (searchTerm) {
    inputsArray.forEach((el) => {
      el.querySelector('input').value = searchTerm;
      searchFunc(searchTerm, resultsContainer);
    });
  }
};

const handleSearchString = (clearQuery) => {
  const { protocol, host, pathname } = window.location;

  const query = clearQuery ? '' : `?${searchParams.toString()}`;
  const url = `${protocol}//${host}${pathname}${query}`;

  if (window.history.replaceState) {
    window.history.replaceState({
      path: url,
    }, '', url);
  }
};

export default async function decorate(block) {
  block.textContent = '';
  const aside = document.querySelector('aside');

  // side navbar only exist on guide/documentation pages
  if (!document.body.classList.contains('guides-template')) {
    aside.classList.remove('side-navigation-wrapper');
    aside.innerHTML = '';
    return;
  }

  const sideNavPath = '/side-navigation';
  const resp = await fetch(`${sideNavPath}.plain.html`);
  const html = await resp.text();
  const sideNavbarContent = document.createElement('div');
  sideNavbarContent.innerHTML = html;
  const sideNavbar = sideNavbarContent.querySelector('.side-navigation div');
  block.append(sideNavbar);

  const docBtnInner = '<button class="documentation-btn"><span class="icon icon-icon-caret-down"></span>Menu</button>';
  const docButton = createTag('div', { class: 'side-navigation-overlay-btn-wrapper in-doc-page' }, docBtnInner);
  const isDocumentationLanding = window.location.pathname === '/docs/';
  if (!isDocumentationLanding) {
    const backDocPageBtn = createTag('div', { class: 'guides-back-btn' }, `
      <span class="icon icon-icon-arrow"></span>
      <a href="/docs/" class="link-underline-effect">
          Back
      </a>
    `);
    docButton.prepend(backDocPageBtn);
  }
  const docToggleMenuButton = docButton.querySelector('.documentation-btn');

  const backBtnInner = '<button class="back-btn">Back</button>';
  const backBtn = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, backBtnInner);

  const searchInputInner = '<input type="text" name="search" placeholder="Search...">';
  const searchInput = createTag('div', { class: 'search-input-wrapper' }, searchInputInner);

  const searchInputOuter = searchInput.cloneNode(true);
  const resultsContainer = createTag('div', { class: 'results-wrapper', id: 'search-results' });

  const skipLink = createTag('a', { class: 'skip-link', href: '#search-results' }, 'Skip to results');

  aside.prepend(docButton);
  aside.prepend(searchInputOuter);
  block.prepend(skipLink);

  block.prepend(backBtn);
  block.prepend(searchInput);

  aside.append(resultsContainer);

  loadSearch([searchInput, searchInputOuter], resultsContainer);

  // add backdrop overlay
  const backdropCurtain = createTag('div', { class: 'side-navigation-curtain' }, '');
  aside.append(backdropCurtain);

  [docToggleMenuButton, backBtn].forEach((btn) => {
    btn.addEventListener('click', () => {
      block.classList.toggle('overlay');
      backdropCurtain.classList.toggle('is-open');
    });
  });

  backdropCurtain.addEventListener('click', () => {
    backBtn.click();
  });

  [searchInput, searchInputOuter].forEach((el) => {
    el.querySelector('input').addEventListener('input', (event) => {
      if (event.target.value.length === 0) {
        resultsContainer.classList.remove('open');
        block.parentElement.classList.remove('expand');
        skipLink.classList.remove('show');

        handleSearchString(true);
      } else {
        searchParams.set('q', event.target.value);
        handleSearchString();
      }
      searchFunc(event.target.value, resultsContainer);
    });
  });

  block.querySelectorAll(':scope > div > div > ul > li').forEach((list) => {
    list.classList.add('list-section');

    list.addEventListener('click', (e) => {
      e.target.classList.toggle('closed');
    });

    list.querySelector(':scope > a').classList.add('heading');
    list.querySelectorAll(':scope > ul').forEach((listInner) => {
      listInner.classList.add('list-section-inner');

      listInner.querySelectorAll(':scope > li > ul').forEach((nestedList) => {
        const listTarget = nestedList.parentElement;

        const text = [...listTarget.childNodes]
          .find((child) => child.nodeType === Node.TEXT_NODE);

        nestedList.classList.add('list-section-inner-nested');

        const inner = `
          <span>${text.data}</span>
          ${listTarget.childNodes[1].outerHTML}
        `;
        const textEl = createTag('button', { class: '' }, inner);

        [...listTarget.childNodes].slice(0, 3).forEach((el) => {
          listTarget.removeChild(el);
        });

        listTarget.prepend(textEl);

        listTarget.classList.add('side-navigation-nested-target', 'collapse');
        listTarget.addEventListener('click', (e) => {
          e.target.closest('.side-navigation-nested-target').classList.toggle('collapse');
        });
      });

      listInner.querySelectorAll(':scope li a').forEach((link) => {
        if (window.location.pathname === link.getAttribute('href')) {
          link.classList.add('active');

          if (link.closest('ul').classList.contains('list-section-inner-nested')) {
            const parentListWrapper = link.closest('.side-navigation-nested-target');
            parentListWrapper.classList.add('active');
            parentListWrapper.classList.remove('collapse');
          }
        }
      });
    });
  });

  // close overlay when clicked on link, ensure close overlay if link is on same page
  const allSideNavLinks = block.querySelectorAll('a');
  allSideNavLinks.forEach((link) => {
    // open external link in new tab
    link.setAttribute('target', returnLinkTarget(link.href));
    link.addEventListener('click', () => {
      backdropCurtain.classList.remove('is-open');
      block.classList.remove('overlay');
    });
  });

  block.parentElement.classList.add('ready');

  const resizeContent = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      block.classList.remove('overlay');
    }
  };

  window.addEventListener('resize', debounce(resizeContent, 200));
}
