import { buildBlock, decorateBlock, loadBlock } from '../../scripts/scripts.js';

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

export default async function decorate(block) {
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
      // limit each row to only 4 columns, otherwise create a new row
      if ((i !== 0) && (i % 4) === 0) {
        cardsArr.push(cardsRow);
        cardsRow = [];
      }
      let cardDetails = `<p><strong><em>${stripTags(row.category)}</em></strong></p>`;
      if (row.githubProfile) {
        const ghProfile = stripTags(row.githubProfile).split('/');
        const ghUsername = ghProfile[ghProfile.length - 1];
        if (ghUsername) {
          cardDetails += `<p><em>${ghUsername}</em></p>`;
        } else {
          cardDetails += `<p><em>${stripTags(row.githubProfile)}</em></p>`;
        }
      }
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
