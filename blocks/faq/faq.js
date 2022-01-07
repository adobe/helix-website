export default async function decorateFaq($block) {
  const source = new URL($block.querySelector('a').href).pathname;
  const resp = await fetch(source);
  const json = await resp.json();
  $block.innerText = '';
  const $dl = document.createElement('dl');
  json.data.forEach((row, i) => {
    const $dt = document.createElement('dt');
    $dt.id = i + 1;
    $dt.innerText = row['Question'];
    const $dd = document.createElement('dd');
    $dd.innerText = row['Answer'];
    $dl.append($dt, $dd);
  })
  $block.append($dl);
}