import { buildBlock, decorateBlock, loadBlock } from '../../scripts/scripts.js';

function toggleVisibility(dialog) {
  const expanded = dialog.getAttribute('aria-expanded') === 'true';
  dialog.setAttribute('aria-expanded', expanded ? 'false' : 'true');
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
      let cardDetails = `<p><a href="${stripTags(row.githubUrl, 'a')}" target="_blank">${stripTags(row.title, 'a', 'b', 'i', 'u', 'p', 'br')}</a></p>`;
      if (row.showcaseUrl) {
        cardDetails += `<p><a href="${stripTags(row.showcaseUrl, 'a')}" target="_blank">Preview</a></p>`;
      }
      cardDetails += `<p><em>${stripTags(row.category, 'a', 'b', 'i', 'u', 'p', 'br')}</em></p>
      <p><em>${stripTags(row.firstName, 'a', 'b', 'i', 'u', 'p', 'br')} ${stripTags(row.lastName, 'a', 'b', 'i', 'u', 'p', 'br')}, ${stripTags(row.company, 'a', 'b', 'i', 'u', 'p', 'br')}</em></p>
      <p class="description">${urlify(stripTags(row.description), 'a', 'b', 'i', 'u', 'p', 'br')}</p>`;
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
    const dialogs = blockWrapper.querySelectorAll('.cards-card dialog');
    dialogs.forEach((dialog) => {
      const description = dialog.parentElement.querySelector('p.description');
      description.addEventListener('click', (event) => {
        toggleVisibility(dialog);
        event.stopPropagation();
      });
    });
  }
}
