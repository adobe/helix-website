import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import createTag from '../../utils/tag.js';

async function fetchBlogArticleIndex() {
  const index = '/docpages-index.json';
  const resp = await fetch(index);
  const json = await resp.json();
  const lookup = {};
  json.data.forEach((row) => {
    lookup[row.path] = row;
  });
  return { data: json.data, lookup };
}

function decorateCard(hit) {
  const {
    title, description, image,
  } = hit;
  const path = hit.path.split('.')[0];
  const picture = createOptimizedPicture(image, title, false, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const html = `<div class="article-card-image">${pictureTag}</div>
      <div class="article-card-body">
        <h3><span class="link-highlight-colorful-effect-2">${title}</span></h3>
        <p>${description}</p>
      </div>`;
  return createTag('a', { href: path, class: 'article-card link-highlight-colorful-effect-hover-wrapper' }, html);
}

function highlightTextElements(terms, elements) {
  elements.forEach((e) => {
    const matches = [];
    const txt = e.textContent;
    terms.forEach((term) => {
      const offset = txt.toLowerCase().indexOf(term);
      if (offset >= 0) {
        matches.push({ offset, term });
      }
    });
    matches.sort((a, b) => a.offset - b.offset);
    let markedUp = '';
    if (!matches.length) markedUp = txt;
    else {
      markedUp = txt.substr(0, matches[0].offset);
      matches.forEach((hit, i) => {
        markedUp += `<mark class="side-nav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</mark>`;
        if (matches.length - 1 === i) {
          markedUp += txt.substr(hit.offset + hit.term.length);
        } else {
          markedUp += txt.substring(hit.offset + hit.term.length, matches[i + 1].offset);
        }
      });
      if (e.tagName === 'H3') {
        e.innerHTML = `<span class="link-highlight-colorful-effect-2">
                        ${markedUp}
                      </span>`;
        return;
      }
      e.innerHTML = markedUp;
    }
  });
}

async function populateSearchResults(searchTerms, resultsContainer) {
  const limit = 12;
  const terms = searchTerms.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => !!e);
  resultsContainer.innerHTML = '';

  if (terms.length) {
    if (!window.blogIndex) {
      window.blogIndex = await fetchBlogArticleIndex();
    }

    const articles = window.blogIndex.data;
    const skipLink = document.querySelector('.skip-link');

    const hits = [];
    let i = 0;
    for (; i < articles.length; i += 1) {
      const e = articles[i];
      const text = [e.title, e.content].join(' ').toLowerCase();

      if (terms.every((term) => text.includes(term))) {
        if (hits.length === limit) {
          break;
        }
        hits.push(e);
      }
    }

    hits.forEach((hit) => {
      const card = decorateCard(hit);
      resultsContainer.appendChild(card);
    });

    if (!hits.length) {
      resultsContainer.classList.add('no-Results');
      resultsContainer.parentElement.classList.remove('expand');
      skipLink.classList.remove('show');
    } else {
      resultsContainer.classList.remove('no-Results');
      resultsContainer.classList.add('open');
      resultsContainer.parentElement.classList.add('expand');
      skipLink.classList.add('show');
    }

    highlightTextElements(terms, resultsContainer.querySelectorAll('h3, .article-card-category, .article-card-body > p'));
  }
}

export default function onSearchInput(value, resultsContainer, advancedLink) {
  populateSearchResults(value, resultsContainer);
  if (advancedLink) {
    const href = new URL(advancedLink.href);
    href.searchParams.set('q', value);
    advancedLink.href = href.toString();
  }
}
