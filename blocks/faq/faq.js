import { addAnchorLink } from '../../scripts/scripts.js';

function autoLink(string) {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi;
  return string.replace(pattern, '$1<a href="$2">$2</a>');
}

export default async function decorateFaq($block) {
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
    $dl.append($dt, $dd);
  });
  $block.append($dl);

  const selected = document.getElementById(window.location.hash.slice(1));
  if (selected) {
    selected.scrollIntoView();
  }
}
