import { addAnchorLink } from '../../scripts/scripts.js';

const styles = {};

function autoLink(string) {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi;
  return string.replace(pattern, '$1<a href="$2">$2</a>');
}

function getCategoryFiltersFromUrl() {
  return new URLSearchParams(window.location.search).getAll('filter');
}

function getSelectedFilterValues($block) {
  const selectedFilters = [...$block.querySelectorAll('input[name="filter"]:checked')]
    .map((cb) => cb.id.substring(7)) // remove 'filter-' prefix
    .filter((filter) => filter !== 'All'); // ignore 'all'
  if (selectedFilters.length === $block.querySelectorAll('input[name="filter"]:not(#filter-All)').length) {
    // all filters selected, simply use 'All'
    return ['All'];
  }
  return selectedFilters;
}

function updateSearchParams($block) {
  let filters = getSelectedFilterValues($block);
  const url = new URL(window.location.href);
  if (filters.includes('All')) {
    // omit search parms in case of 'all'
    filters = [];
  } else if (filters.length === 0) {
    // no filters selected, add 'None' filter
    filters.push('None');
  }
  const usp = new URLSearchParams(filters.map((v) => ['filter', v]));
  url.search = usp.toString();
  window.history.pushState(null, '', url);
}

function filterResults(filters, $block) {
  $block.querySelectorAll('dt').forEach((dt) => {
    const cats = [...dt.querySelectorAll('.category')].map((cat) => cat.textContent.trim());
    if (filters.includes('All')
      || filters.some((f) => cats.includes(f))) {
      dt.classList.remove('hidden-by-filter');
      dt.nextElementSibling.classList.remove('hidden-by-filter');
    } else {
      dt.classList.add('hidden-by-filter');
      dt.nextElementSibling.classList.add('hidden-by-filter');
    }
  });
}

function buildCategoryLabels(categories) {
  return categories
    .map((cat) => {
      if (!styles[cat]) {
        const style = (Object.keys(styles).length % 4) + 1;
        styles[cat] = style;
      }
      const span = document.createElement('span');
      span.className = `category style-${styles[cat] || 0}`;
      span.textContent = cat;
      return span;
    });
}

function buildFilterControl(cat, $block) {
  const urlFilters = getCategoryFiltersFromUrl();
  const control = document.createElement('div');
  control.classList.add('filter-control');

  const checkbox = document.createElement('input');
  checkbox.name = 'filter';
  checkbox.id = `filter-${cat}`;
  checkbox.value = cat;
  checkbox.type = 'checkbox';
  if (urlFilters.length === 0 || (!urlFilters.includes('None') && urlFilters.includes(cat))) {
    checkbox.checked = true;
  }
  control.append(checkbox);

  control.addEventListener('click', () => {
    // toggle checkbox
    checkbox.checked = !checkbox.checked;
    const { checked } = checkbox;
    if (cat === 'All') {
      // 'all' filter checked, check all other filters
      $block.querySelectorAll('input[name="filter"]').forEach((cb) => {
        cb.checked = checked;
      });
    } else if (!checked) {
      // if any filter is unchecked, also uncheck 'all' filter
      $block.querySelector('input[name="filter"]#filter-All').checked = false;
    } else if ($block.querySelectorAll('input[name="filter"]:checked').length === $block.querySelectorAll('input[name="filter"]').length - 1) {
      // if all filters are checked, also check 'all' filter
      $block.querySelector('input[name="filter"]#filter-All').checked = true;
    }
    filterResults(getSelectedFilterValues($block), $block);
    updateSearchParams($block);
  });

  const label = document.createElement('label');
  label.textContent = cat;
  label.htmlFor = cat;
  label.className = `category style-${styles[cat] || 0}`;
  control.append(label);

  return control;
}

function buildCategoryFilters(categories, $block) {
  const controls = document.createElement('div');
  controls.classList.add('filter-controls');
  controls.textContent = 'Categories:';

  // 'all' filter
  controls.append(buildFilterControl('All', $block));

  controls.append(...categories
    .map((category) => buildFilterControl(category, $block)));

  return controls;
}

export default async function decorateFaq($block) {
  const allCats = [];
  const source = new URL($block.querySelector('a').href).pathname;
  const resp = await fetch(source);
  const json = await resp.json();
  $block.innerText = '';
  const $dl = document.createElement('dl');
  json.data.forEach((row, i) => {
    const $dt = document.createElement('dt');
    $dt.classList.add('link-highlight-colorful-effect-hover-wrapper');
    $dt.id = row.Id || `q${(i + 1)}`;
    $dt.innerText = row.Question;
    addAnchorLink($dt);
    const $dd = document.createElement('dd');
    const answer = autoLink(row.Answer);
    const titleLink = $dt.querySelector('.anchor-link');
    if (titleLink) titleLink.classList.add('link-highlight-colorful-effect-2');
    $dd.innerHTML = answer;
    if (row.Category) {
      const categories = row.Category.split(',').map((cat) => cat.trim());
      // remember category and add labels
      allCats.push(...categories);
      $dt.append(...buildCategoryLabels(categories, $block));
    }
    $dl.append($dt, $dd);
  });
  if (allCats.length > 0) {
    const uniqueCats = [...new Set(allCats)]; // dedupe categories
    $block.append(buildCategoryFilters(uniqueCats, $block));
  }
  $block.append($dl);
  const prefilters = getCategoryFiltersFromUrl();
  if (prefilters.length > 0) {
    filterResults(prefilters, $block);
  }

  const selected = document.getElementById(window.location.hash.slice(1));
  if (selected) {
    selected.scrollIntoView();
  }
}
