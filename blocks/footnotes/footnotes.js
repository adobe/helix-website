export default async function decorate($block) {
  document.querySelector('footer').append($block);
  [...$block.children].forEach((footnote) => {
    if (footnote.children.length === 2) {
      const $num = footnote.children[0];
      $num.classList.add('footnote-num');
      $num.innerHTML = `<sup>${$num.textContent}</sup>`;
      $num.nextElementSibling.classList.add('footnote-text');
    }
  });
}
