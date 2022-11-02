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
  $dl.className = 'faq-accordion';
  json.data.forEach((row, i) => {
    const $dt = document.createElement('dt');
    $dt.className = 'faq-question';
    const $wrapDiv = document.createElement('div');
    const $a = document.createElement('a');
    $a.id = `q${(i + 1)}`;
    $dt.innerText = row.Question;
    const $dd = document.createElement('dd');
    $dd.className = 'faq-answer';
    const answer = autoLink(row.Answer);
    $dd.innerHTML = answer;
    $wrapDiv.append($a);
    $a.append($dt, $dd);
    $dl.append($wrapDiv);
  });
  $block.append($dl);

  let acc = document.getElementsByClassName('faq-question');
  const selected = document.getElementById(window.location.hash.slice(1));
  if (selected) {
    selected.scrollIntoView();
  }

  for (let i = 0; i < acc.length; i += 1) {
    acc[i].addEventListener('click', function a() {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}
