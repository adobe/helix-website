import { buildBlock, decorateBlock, loadBlock } from '../../scripts/scripts.js';

function toggleVisibility(dialog) {
  const expanded = dialog.getAttribute('aria-expanded') === 'true';
  dialog.setAttribute('aria-expanded', expanded ? 'false' : 'true');
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
    const blockPartyList = blockPartyJson.data.filter((row) => {
      return row.approved === 'true';
    });
    await blockPartyList.forEach(async (row, i) => {
      // limit each row to only 4 columns, otherwise create a new row
      if ((i !== 0) && (i % 4) === 0) {
        cardsArr.push(cardsRow);
        cardsRow = [];
      }
      let cardDetails = `<p><a href="${row.githubUrl}">${row.title}</a></p>`;
      if (row.showcaseUrl) {
        cardDetails += `<p><a href="${row.showcaseUrl}">Preview</a></p>`;
      }
      cardDetails += `<p><em>${row.category}</em></p>
      <p><em>${row.firstName} ${row.lastName}, ${row.company}</em></p>
      <p class="description">${row.description}</p>`;
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

    // add listener to show the description overflow dialog
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
