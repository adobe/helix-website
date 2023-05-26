import createTag from '../../utils/tag.js';

let searchFunc;

const loadSearch = async () => {
  const gnavSearch = await import('./side-navigation-search.js');
  searchFunc = gnavSearch.default;
};

export default function decorate(block) {
  const docBtnInner = '<button>📖 Docs</button>';
  const docButton = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, docBtnInner);

  const backBtnInner = '<button>← Back</button>';
  const backBtn = createTag('div', { class: 'side-navigation-overlay-btn-wrapper' }, backBtnInner);

  const searchInputInner = '<input type="text" name="search" placeholder="Search...">';
  const searchInput = createTag('div', { class: 'search-input-wrapper' }, searchInputInner);

  const searchInputOuter = searchInput.cloneNode(true);
  block.parentElement.prepend(docButton);
  block.parentElement.prepend(searchInputOuter);

  block.prepend(backBtn);
  block.prepend(searchInput);

  const resultsContainer = createTag('div', { class: 'results-wrapper' });

  block.parentElement.append(resultsContainer);

  loadSearch();

  [docButton, backBtn].forEach((btn) => {
    btn.addEventListener('click', () => {
      block.classList.toggle('overlay');
    });
  });

  [searchInput, searchInputOuter].forEach((el) => {
    el.querySelector('input').addEventListener('input', (event) => {
      if (event.target.value.length === 0) {
        resultsContainer.classList.remove('open');
        block.parentElement.classList.remove('expand');
      }
      searchFunc(event.target.value, resultsContainer);
    });
  });

  block.querySelectorAll(':scope > div > div > ul > li').forEach((list) => {
    list.classList.add('list-section');
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
        }
      });
    });
  });
}
