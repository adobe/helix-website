import createTag from '../../utils/tag.js';

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

  // TODO: update path during site migration
  // fetch content from path
  const sideNavPath = '/drafts/redesign/blocks/side-navigation';
  const resp = await fetch(`${sideNavPath}.plain.html`);
  const html = await resp.text();
  const sideNavbarContent = document.createElement('div');
  sideNavbarContent.innerHTML = html;
  const sideNavbar = sideNavbarContent.querySelector('.side-navigation div');
  block.append(sideNavbar);

  const docBtnInner = '<button class="documentation-btn"><span class="icon icon-icon-caret-down"></span>Menu</button>';
  const docButton = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, docBtnInner);
  const docToggleMenuButton = docButton.querySelector('.documentation-btn');

  const backBtnInner = '<button class="back-btn">Back</button>';
  const backBtn = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, backBtnInner);

  const searchInputInner = '<input type="text" name="search" placeholder="Search...">';
  const searchInput = createTag('div', { class: 'search-input-wrapper' }, searchInputInner);

  const searchInputOuter = searchInput.cloneNode(true);
  const resultsContainer = createTag('div', { class: 'results-wrapper' });

  aside.prepend(docButton);
  aside.prepend(searchInputOuter);

  block.prepend(backBtn);
  block.prepend(searchInput);

  aside.append(resultsContainer);

  loadSearch([searchInput, searchInputOuter], resultsContainer);

  [docToggleMenuButton, backBtn].forEach((btn) => {
    btn.addEventListener('click', () => {
      block.classList.toggle('overlay');
    });
  });

  [searchInput, searchInputOuter].forEach((el) => {
    el.querySelector('input').addEventListener('input', (event) => {
      if (event.target.value.length === 0) {
        resultsContainer.classList.remove('open');
        block.parentElement.classList.remove('expand');
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

        nestedList.classList.add('list-section-inner-nested');

        listTarget.classList.add('side-navigation-nested-target', 'collapse');
        listTarget.addEventListener('click', (e) => {
          e.target.classList.toggle('collapse');
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

  const resizeContent = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      block.classList.remove('overlay');
    }
  };

  window.addEventListener('resize', debounce(resizeContent, 200));
}
