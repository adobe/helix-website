export default async function decorateFaq($block) {
  const source = new URL($block.querySelector('a').href).pathname;
  const resp = await fetch(source);
  const json = await resp.json();
  $block.innerText = '';
  const $dl = document.createElement('dl');
  json.data.forEach((row, i) => {
    const $dt = document.createElement('dt');
    const $a = document.createElement('a');
    $a.id = i + 1;
    $dt.innerText = row['Question'];
    const $dd = document.createElement('dd');
    $dd.innerText = row['Answer'];
    
    $a.append($dt, $dd);
    $dl.append($a);
  })
  $block.append($dl);

  const selected = document.getElementById(window.location.hash.slice(1));
  if (selected) {
    selected.scrollIntoView();
  }
}