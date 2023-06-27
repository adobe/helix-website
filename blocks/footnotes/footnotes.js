export default async function decorate($block) {
  // enumerate all footnote references
  [...document.querySelectorAll('main sup')]
    .forEach((sup, i) => {
      if (sup.textContent === '#') {
        sup.textContent = i + 1;
      }
    });

  // enumerate footnotes
  document.querySelector('.section.content').append($block);
  [...$block.children].forEach(($footnote, i) => {
    $footnote.firstElementChild.classList.add('footnote-text');
    const $num = document.createElement('div');
    $num.classList.add('footnote-num');
    $num.innerHTML = `<sup>${i + 1}</sup>`;
    $footnote.prepend($num);
  });
}
