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
    const $a = document.createElement('a');
    $a.id = row.Id || `q${(i + 1)}`;
    $dt.innerText = row.Question;
    const $dd = document.createElement('dd');
    const answer = autoLink(row.Answer);

    $dd.innerHTML = answer;
    $a.append($dt, $dd);
    $dl.append($a);
  });
  $block.append($dl);

  const selected = document.getElementById(window.location.hash.slice(1));
  if (selected) {
    selected.scrollIntoView();
  }
}
