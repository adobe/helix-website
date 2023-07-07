// NOTE: combined same name `card-list` blocks in redesign & main branch here,
//  note can be removed after approval
import {
  createOptimizedPicture, loadBlock, buildBlock, decorateBlock,
} from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';
import { returnLinkTarget } from '../../utils/helpers.js';

// Redesign's version: render image card list
const decorateCardListByListElement = (block) => {
  /* change to ul, li */
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });

    const link = li.querySelector('a');
    if (link) {
      const tag = createTag('a', {
        href: link.getAttribute('href'),
        class: 'card-wrapper',
      });
      tag.setAttribute('target', returnLinkTarget(tag.href));
      link.parentElement.innerHTML = link.innerHTML;
      [...li.childNodes].forEach((child) => {
        tag.append(child);
      });

      // for highlight effect
      const cardTitle = tag.querySelector('h3');
      const span = createTag('span', { class: 'link-highlight-colorful-effect-2' }, cardTitle.textContent);
      cardTitle.replaceChildren(span);
      tag.classList.add('link-highlight-colorful-effect-hover-wrapper');

      li.append(tag);
    }
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
};

// Adobe's version: render cards block by url
function toggleVisibility(el) {
  const expanded = el.getAttribute('aria-expanded') === 'true';
  el.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function urlify(str) {
  return str.replace(/(https:\/\/[^ "]+)/g, (url) => `<a href="${url}" target="_blank">Link</a>`);
}

function stripTags(html, ...args) {
  return html.replace(/<(\/?)(\w+)[^>]*\/?>/g, (_, endMark, tag) => {
    if (args.includes(tag)) return `<${endMark}${tag}>`;
    return '';
  }).replace(/<!--.*?-->/g, '');
}

function truncate(str, limit) {
  const words = str.trim().split(' ');
  const initial = words.slice(0, limit);
  const extra = words.slice(limit);
  if (extra.length < 1) return `<p class="description noextra">${initial.join(' ')}</p>`;
  return `<p class="description">${initial.join(' ')} <span class='extra'>${extra.join(' ')}</span></p>`;
}

async function decorateCardListByUrl(block) {
  if (block.classList.contains('image-card-listing')) return;
  const endpoint = block.querySelector('a').href;
  block.textContent = '';
  const blockParty = await fetch(endpoint);
  const blockPartyJson = await blockParty.json();
  if (blockPartyJson.data && (blockPartyJson.data.length > 0)) {
    // create a 2D array to pass to the cards block
    const cardsArr = [];
    let cardsRow = [];
    const blockPartyList = blockPartyJson.data.filter((row) => row.approved === 'true');
    await blockPartyList.forEach(async (row, i) => {
      // limit each row to only 2 columns, otherwise create a new row
      if ((i !== 0) && (i % 2) === 0) {
        cardsArr.push(cardsRow);
        cardsRow = [];
      }
      let githubName = '';
      if (row.githubProfile && (row.permission === 'on')) {
        const ghProfile = stripTags(row.githubProfile).split('/');
        const ghUsername = ghProfile[ghProfile.length - 1];
        if (ghUsername) {
          githubName = `<code>${ghUsername}</code>`;
        } else {
          githubName = `<code>${stripTags(row.githubProfile)}</code>`;
        }
      }
      let cardDetails = `<p class="block-party-card-title"><em>${stripTags(row.category)}</em>${githubName}</p>`;
      cardDetails += `<p><a href="${stripTags(row.githubUrl)}" target="_blank">${stripTags(row.title)}</a></p>`;
      if (row.showcaseUrl) {
        cardDetails += `<p><a href="${stripTags(row.showcaseUrl)}" target="_blank">Preview</a></p>`;
      }
      cardDetails += `${truncate(urlify(stripTags(row.description), 'b', 'i', 'u', 'p', 'br'), 25)}`;
      cardsRow.push(cardDetails);
    });
    cardsArr.push(cardsRow);

    // build out cards using the existing cards block
    const cardsBlock = buildBlock('cards', cardsArr);
    // replace existing block with the new cards block
    const blockWrapper = block.parentElement;
    block.remove();
    blockWrapper.append(cardsBlock);
    // decorate and load the cards block
    decorateBlock(cardsBlock);
    await loadBlock(cardsBlock);

    // add listener to hide/show the description overflow dialog
    const extras = blockWrapper.querySelectorAll('.cards-card span.extra');
    extras.forEach((el) => {
      const description = el.parentElement;
      description.addEventListener('click', (event) => {
        toggleVisibility(el);
        toggleVisibility(description);
        event.stopPropagation();
      });
    });
  }
}

// `.image-card-listing` is added to `card list` block on documentation
// category page in Guide template by default: See updateGuideTemplateStyleBasedOnHero
export default async function decorate(block) {
  if (block.classList.contains('image-card-listing')) {
    decorateCardListByListElement(block);
  } else {
    decorateCardListByUrl(block);
  }
}
